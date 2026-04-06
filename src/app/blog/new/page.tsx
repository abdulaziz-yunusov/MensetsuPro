import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export default async function NewBlogPostPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/login?callbackUrl=/blog/new");
  }

  async function createPost(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user) return;

    const title = formData.get("title") as string;
    const content = formData.get("content") as string;
    
    if (!title || !content) return;

    // Generate simple slug (ideally handled via collision checks in production)
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now().toString().slice(-4);

    const post = await prisma.blogPost.create({
      data: {
        title,
        slug,
        content,
        published: true, // Auto-publish for the scope of this project
        authorId: session.user.id,
      },
    });

    revalidatePath("/blog");
    redirect(`/blog/${post.slug}`);
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Write a New Article</CardTitle>
        </CardHeader>
        <form action={createPost}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-lg">Title</Label>
              <Input 
                id="title" 
                name="title" 
                required 
                placeholder="How I cleared my technical interview in Tokyo..." 
                className="text-lg py-6"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-lg">Content (Markdown supported)</Label>
              <div className="p-4 bg-background border rounded-md text-sm text-muted-foreground mb-2">
                You can write your post content here. Formatting works universally. Keep it professional and helpful for other job seekers!
              </div>
              <Textarea 
                id="content" 
                name="content" 
                required 
                className="min-h-[400px] text-lg leading-relaxed font-mono" 
                placeholder="## Introduction&#10;Start your article here..." 
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between items-center bg-background border-t p-6">
            <Button variant="ghost" asChild>
              <Link href="/blog">Cancel</Link>
            </Button>
            <Button type="submit" size="lg">Publish Article</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
