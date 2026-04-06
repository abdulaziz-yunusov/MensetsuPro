import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { UserCircle, Calendar, ArrowLeft } from "lucide-react";

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: { author: true }
  });

  if (!post) {
    notFound();
  }

  return (
    <article className="container mx-auto py-12 max-w-3xl">
      <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all articles
      </Link>

      <header className="mb-10 text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
          <div className="flex items-center">
            <UserCircle className="mr-2 h-5 w-5" />
            <span className="font-semibold">{post.author.name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            <time dateTime={post.createdAt.toISOString()}>
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </div>
      </header>
      
      <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-a:text-primary">
        <div className="whitespace-pre-wrap leading-relaxed text-foreground">
          {post.content}
        </div>
      </div>
    </article>
  );
}
