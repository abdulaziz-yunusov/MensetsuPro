import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PenTool } from "lucide-react";
import { DatabaseUnavailableBanner } from "@/components/layout/database-unavailable-banner";
import { isDatabaseConnectionError } from "@/lib/db-error";

export default async function BlogPage() {
  const session = await getServerSession(authOptions);
  let posts: any[] = [];
  let dbUnavailable = false;

  try {
    posts = await prisma.blogPost.findMany({
      where: { published: true }, 
      orderBy: { createdAt: "desc" },
      include: { author: true }
    });
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    dbUnavailable = true;
  }

  return (
    <div className="container mx-auto py-12 max-w-5xl">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight">The MensetsuPro Blog</h1>
          <p className="text-muted-foreground mt-4 text-xl">
            Success stories, interview preparation advice, and IT market insights.
          </p>
        </div>
        {session?.user && (
          <Button asChild size="lg">
            <Link href="/blog/new">
              <PenTool className="mr-2 h-5 w-5" /> Write Article
            </Link>
          </Button>
        )}
      </div>

      {dbUnavailable ? <DatabaseUnavailableBanner resourceName="Blog posts" /> : null}

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link href={`/blog/${post.slug}`} key={post.id} className="group">
            <Card className="h-full hover:shadow-lg transition-all border-border">
              <CardHeader>
                <CardTitle className="text-2xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground line-clamp-3 leading-relaxed">
                  {post.content.replace(/[#_*\[\]]/g, '')} 
                </p>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground flex justify-between items-center mt-auto border-t pt-4">
                <span className="font-medium text-card-foreground">{post.author.name}</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
      {posts.length === 0 && (
        <div className="text-center py-20 text-muted-foreground bg-background rounded-xl border border-dashed border-border">
          No articles published yet. Be the first to write one!
        </div>
      )}
    </div>
  );
}
