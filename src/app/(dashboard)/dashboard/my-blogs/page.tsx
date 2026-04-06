import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenTool, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";

export default async function MyBlogsPage() {
  const { locale } = await getServerTranslation();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const myBlogsCopy: Record<Locale, Record<string, string>> = {
    en: {
      title: "My Articles",
      subtitle: "Manage your published blog posts and drafts.",
      writeNew: "Write New Article",
      empty: "You haven't written any articles yet.",
      firstStory: "Share your first story",
      published: "Published",
      draft: "Draft",
      viewLive: "View Live",
    },
    ru: {
      title: "Мои статьи",
      subtitle: "Управляйте опубликованными статьями и черновиками.",
      writeNew: "Написать новую статью",
      empty: "Вы еще не написали ни одной статьи.",
      firstStory: "Поделиться первой историей",
      published: "Опубликовано",
      draft: "Черновик",
      viewLive: "Открыть",
    },
    ja: {
      title: "自分の記事",
      subtitle: "公開済みの記事と下書きを管理できます。",
      writeNew: "新しい記事を書く",
      empty: "まだ記事を書いていません。",
      firstStory: "最初の体験を書く",
      published: "公開済み",
      draft: "下書き",
      viewLive: "公開ページを見る",
    },
    uz: {
      title: "Maqolalarim",
      subtitle: "Nashr qilingan bloglar va qoralamalarni boshqaring.",
      writeNew: "Yangi maqola yozish",
      empty: "Hali hech qanday maqola yozmagansiz.",
      firstStory: "Birinchi hikoyangizni ulashing",
      published: "Nashr qilingan",
      draft: "Qoralama",
      viewLive: "Jonli ko'rish",
    },
  };
  const copy = myBlogsCopy[locale];

  const posts = await prisma.blogPost.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="text-muted-foreground mt-1">
            {copy.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/blog/new">{copy.writeNew}</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <Card className="bg-background border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <PenTool className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg text-muted-foreground font-medium">{copy.empty}</p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/blog/new">{copy.firstStory}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-2 flex-1 pr-4">
                  <div className="flex items-center space-x-2">
                    <Badge variant={post.published ? "default" : "secondary"}>
                      {post.published ? copy.published : copy.draft}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString(locale)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold leading-snug">{post.title}</h3>
                </div>
                <div className="flex shrink-0 w-full sm:w-auto gap-2">
                  {post.published && (
                    <Button asChild variant="outline">
                      <Link href={`/blog/${post.slug}`}>
                        {copy.viewLive} <ExternalLink className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
