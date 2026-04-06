import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  deleteBlogPostByAdmin,
  deleteCommentByAdmin,
  deleteDiscussionByAdmin,
  toggleBlogPublishedByAdmin,
} from "@/lib/actions/admin";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminModerationPage() {
  const { t, locale } = await getServerTranslation();

  const [discussions, comments, blogPosts] = await Promise.all([
    prisma.discussion.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: true,
        category: true,
        _count: {
          select: { comments: true, reactions: true },
        },
      },
    }),
    prisma.comment.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: true,
        discussion: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    }),
    prisma.blogPost.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.moderation.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.moderation.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('admin.moderation.discussions.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">{t('admin.moderation.discussions.table.thread')}</TableHead>
                <TableHead className="font-bold">{t('admin.moderation.discussions.table.author')}</TableHead>
                <TableHead className="font-bold">{t('admin.moderation.discussions.table.category')}</TableHead>
                <TableHead className="font-bold">{t('admin.moderation.discussions.table.engagement')}</TableHead>
                <TableHead className="font-bold">{t('admin.moderation.discussions.table.status')}</TableHead>
                <TableHead className="font-bold text-right px-6">{t('admin.moderation.discussions.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {discussions.map((discussion) => (
                <TableRow key={discussion.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="max-w-[360px]">
                    <Link href={`/community/thread/${discussion.id}`} className="font-bold hover:text-primary transition-colors block mb-1">
                      {discussion.title}
                    </Link>
                    <div className="text-xs text-muted-foreground line-clamp-1 italic">{discussion.content}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-xs bg-muted/50 px-2 py-0.5 rounded inline-block">
                      {discussion.author.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-wider">
                      {discussion.category.name}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-bold text-foreground">{discussion._count.comments}</span> {t('admin.moderation.discussions.table.comments')}
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="w-1 h-1 rounded-full bg-border" />
                      <span className="font-bold text-foreground">{discussion._count.reactions}</span> {t('admin.moderation.discussions.table.reactions')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={discussion.status === "SOLVED" ? "default" : "outline"} className="text-[10px] font-bold tracking-widest uppercase">
                      {discussion.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 text-right">
                    <form action={deleteDiscussionByAdmin.bind(null, discussion.id)}>
                      <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors">
                        {t('common.delete')}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {discussions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground italic">
                    {t('admin.moderation.discussions.table.noDiscussions')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg font-bold">{t('admin.moderation.comments.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">{t('admin.moderation.comments.table.comment')}</TableHead>
                  <TableHead className="font-bold">{t('admin.moderation.comments.table.author')}</TableHead>
                  <TableHead className="font-bold text-right px-6">{t('admin.moderation.comments.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="max-w-[280px]">
                      <div className="text-[13px] font-medium leading-relaxed line-clamp-2">{comment.content}</div>
                      <div className="mt-1 text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="font-bold uppercase tracking-tighter opacity-50">{t('admin.moderation.comments.table.thread')}:</span>
                        <Link href={`/community/thread/${comment.discussion.id}`} className="hover:underline hover:text-primary truncate max-w-[150px]">
                          {comment.discussion.title}
                        </Link>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[11px] font-bold">{comment.author.name}</div>
                      {comment.isBestAnswer && (
                        <Badge variant="default" className="mt-1 h-4 text-[9px] font-bold bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20">
                          {t('admin.moderation.comments.table.bestAnswer')}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <form action={deleteCommentByAdmin.bind(null, comment.id)}>
                        <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors">
                          {t('common.delete')}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                ))}
                {comments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-muted-foreground italic">
                      {t('admin.moderation.comments.table.noComments')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle className="text-lg font-bold">{t('admin.moderation.blog.title')}</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-bold">{t('admin.moderation.blog.table.title')}</TableHead>
                  <TableHead className="font-bold">{t('admin.moderation.blog.table.status')}</TableHead>
                  <TableHead className="font-bold text-right px-6">{t('admin.moderation.blog.table.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogPosts.map((post) => (
                  <TableRow key={post.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="max-w-[280px]">
                      <Link href={`/blog/${post.slug}`} className="font-bold hover:text-primary transition-colors line-clamp-1">
                        {post.title}
                      </Link>
                      <div className="text-[10px] text-muted-foreground mt-1">
                        {post.author.name} • {new Date(post.createdAt).toLocaleDateString(locale)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.published ? "default" : "secondary"} className="text-[10px] font-bold uppercase tracking-wider">
                        {post.published ? t('admin.moderation.blog.table.published') : t('admin.moderation.blog.table.draft')}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 text-right">
                      <div className="flex justify-end gap-2">
                        <form action={toggleBlogPublishedByAdmin.bind(null, post.id)}>
                          <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5 transition-colors">
                            {post.published ? t('admin.moderation.blog.table.unpublish') : t('admin.moderation.blog.table.publish')}
                          </Button>
                        </form>
                        <form action={deleteBlogPostByAdmin.bind(null, post.id)}>
                          <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors">
                            {t('common.delete')}
                          </Button>
                        </form>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {blogPosts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="py-12 text-center text-muted-foreground italic">
                      {t('admin.moderation.blog.table.noPosts')}
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
