import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, BookOpen, FileText, MessageSquare, ShieldAlert, Users, Code2 } from "lucide-react";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminDashboardPage() {
  const { t, locale } = await getServerTranslation();

  const totalUsers = await prisma.user.count();
  const totalAdmins = await prisma.user.count({ where: { role: "ADMIN" } });
  const totalQuestions = await prisma.question.count();
  const totalMaterials = await prisma.material.count();
  const totalBlogPosts = await prisma.blogPost.count();
  const totalPublishedBlogs = await prisma.blogPost.count({ where: { published: true } });
  const totalInterviews = await prisma.mockInterview.count();
  const totalDiscussions = await prisma.discussion.count();
  const totalComments = await prisma.comment.count();
  const totalReactions = await prisma.reaction.count();
  const totalCodingQuestions = await (prisma as any).codingQuestion.count();

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const recentDiscussions = await prisma.discussion.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      author: true,
      category: true,
      _count: {
        select: { comments: true },
      },
    },
  });

  const recentBlogs = await prisma.blogPost.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { author: true },
  });

  const categoryStats = await prisma.category.findMany({
    include: {
      _count: {
        select: {
          questions: true,
          materials: true,
          threads: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const topCategories = [...categoryStats]
    .sort((a, b) => {
      const aTotal = a._count.questions + a._count.materials + a._count.threads;
      const bTotal = b._count.questions + b._count.materials + b._count.threads;
      return bTotal - aTotal;
    })
    .slice(0, 5);

  const statCards = [
    { 
      label: t('admin.dashboard.stats.users'), 
      value: totalUsers, 
      helper: `${totalAdmins} ${t('admin.dashboard.stats.admins')}`, 
      icon: Users 
    },
    { 
      label: t('admin.dashboard.stats.questionBank'), 
      value: totalQuestions, 
      helper: `${totalMaterials} ${t('admin.dashboard.stats.materials')}`, 
      icon: FileText 
    },
    { 
      label: t('admin.dashboard.stats.community'), 
      value: totalDiscussions, 
      helper: `${totalComments} ${t('admin.dashboard.stats.comments')}`, 
      icon: MessageSquare 
    },
    { 
      label: t('admin.dashboard.stats.platformActivity'), 
      value: totalInterviews, 
      helper: `${totalReactions} ${t('admin.dashboard.stats.reactions')}`, 
      icon: Activity 
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.dashboard.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.dashboard.subtitle')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.label} className="border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">{card.helper}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.contentHealth')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span>{t('admin.dashboard.contentTypes.publishedBlogs')}</span>
              <Badge>{totalPublishedBlogs}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('admin.dashboard.contentTypes.totalBlogs')}</span>
              <Badge variant="secondary">{totalBlogPosts}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('admin.dashboard.contentTypes.questions')}</span>
              <Badge variant="secondary">{totalQuestions}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('admin.dashboard.contentTypes.materials')}</span>
              <Badge variant="secondary">{totalMaterials}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>{t('admin.dashboard.contentTypes.codingTasks')}</span>
              <Badge variant="secondary">{totalCodingQuestions}</Badge>
            </div>
            <div className="pt-3">
              <Link href="/admin/moderation" className="text-sm font-medium text-primary hover:underline">
                {t('admin.dashboard.actions.goToModeration')}
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.topCategories')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between text-sm">
                <span className="font-medium">{category.name}</span>
                <span className="text-muted-foreground">
                  {category._count.questions + category._count.materials + category._count.threads} {t('admin.dashboard.items')}
                </span>
              </div>
            ))}
            {topCategories.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.dashboard.noCategoryActivity')}</p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.adminActions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <Link href="/admin/users" className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
              <span>{t('admin.dashboard.actions.manageUsers')}</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/questions" className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
              <span>{t('admin.dashboard.actions.manageQuestions')}</span>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/coding-questions" className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
              <span>{t('admin.dashboard.actions.manageCoding')}</span>
              <Code2 className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/materials" className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
              <span>{t('admin.dashboard.actions.manageMaterials')}</span>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/admin/moderation" className="flex items-center justify-between rounded-lg border border-border/50 p-3 hover:bg-muted/50 transition-colors">
              <span>{t('admin.dashboard.actions.moderate')}</span>
              <ShieldAlert className="h-4 w-4 text-muted-foreground" />
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.recentUsers')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentUsers.map((user) => (
              <div key={user.id} className="rounded-xl border border-border/50 p-4 bg-muted/20">
                <div className="flex items-center justify-between gap-2">
                  <div className="font-bold">{user.name}</div>
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>{user.role}</Badge>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{user.email}</div>
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">{new Date(user.createdAt).toLocaleString(locale)}</div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.recentDiscussions')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDiscussions.map((discussion) => (
              <div key={discussion.id} className="rounded-xl border border-border/50 p-4 bg-muted/20">
                <Link href={`/community/thread/${discussion.id}`} className="font-bold hover:text-primary transition-colors line-clamp-1">
                  {discussion.title}
                </Link>
                <div className="mt-1 text-sm text-muted-foreground">
                  {discussion.author.name} · {discussion.category.name}
                </div>
                <div className="mt-2 text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">
                  {discussion._count.comments} {t('admin.dashboard.comments')} · {new Date(discussion.createdAt).toLocaleString(locale)}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>{t('admin.dashboard.recentBlogs')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBlogs.map((post) => (
              <div key={post.id} className="rounded-xl border border-border/50 p-4 bg-muted/20">
                <Link href={`/blog/${post.slug}`} className="font-bold hover:text-primary transition-colors line-clamp-1">
                  {post.title}
                </Link>
                <div className="mt-1 text-sm text-muted-foreground">{post.author.name}</div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant={post.published ? "default" : "secondary"} className="text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">
                    {post.published ? t('admin.dashboard.published') : t('admin.dashboard.draft')}
                  </Badge>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">{new Date(post.createdAt).toLocaleString(locale)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
