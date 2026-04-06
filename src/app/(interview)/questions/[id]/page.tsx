import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Bookmark, BookmarkCheck, ArrowLeft, ArrowRight, Lightbulb, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toggleSaveQuestion } from "@/lib/actions/questions";

export default async function QuestionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      category: true,
      savedBy: session?.user ? { where: { userId: session.user.id } } : false
    }
  });

  if (!question) {
    notFound();
  }

  const isSaved = session?.user && question.savedBy && question.savedBy.length > 0;

  async function handleToggle() {
    "use server";
    await toggleSaveQuestion(id);
    revalidatePath(`/questions/${id}`);
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl space-y-8">
      <Link href="/questions" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Question Bank
      </Link>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <Badge variant="secondary" className="mb-2">{question.category.name}</Badge>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground leading-tight">
            {question.title}
          </h1>
          {question.titleEn && (
            <p className="text-lg text-muted-foreground italic">
              {question.titleEn}
            </p>
          )}
        </div>
        
        {session?.user ? (
          <form action={handleToggle}>
            <Button type="submit" variant={isSaved ? "secondary" : "outline"} size="lg" className="shrink-0 w-full md:w-auto">
              {isSaved ? <><BookmarkCheck className="mr-2 h-5 w-5 text-primary" /> Saved</> : <><Bookmark className="mr-2 h-5 w-5" /> Save Question</>}
            </Button>
          </form>
        ) : (
          <Button variant="outline" size="lg" asChild className="shrink-0 w-full md:w-auto">
             <Link href={`/login?callbackUrl=/questions/${id}`}>Sign in to Save</Link>
          </Button>
        )}
      </div>

      <div className="space-y-6 pt-4">
        {session?.user ? (
          <>
            {question.recommendedAnswer && (
              <Card className="border-l-4 border-l-primary shadow-sm bg-primary/5">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center text-primary-700">
                    <Lightbulb className="w-5 h-5 mr-2" /> Recommended Structure
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-card-foreground whitespace-pre-wrap leading-relaxed">
                  {question.recommendedAnswer}
                </CardContent>
              </Card>
            )}

            {question.sampleAnswer && (
              <Card className="shadow-sm border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2 bg-emerald-50/20 border-b border-emerald-100">
                  <CardTitle className="text-lg flex items-center text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 mr-2" /> Good Sample Answer
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 text-foreground whitespace-pre-wrap leading-relaxed italic">
                  &quot;{question.sampleAnswer}&quot;
                </CardContent>
              </Card>
            )}

            <Card className="shadow-sm border-l-4 border-l-slate-400">
              <CardHeader className="pb-2 bg-background border-b">
                <CardTitle className="text-lg flex items-center text-muted-foreground">
                  <AlertTriangle className="w-5 h-5 mr-2" /> Bad Sample Answer (Mistake Example)
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 text-muted-foreground whitespace-pre-wrap leading-relaxed italic opacity-80">
                {question.badSampleAnswer ? `"${question.badSampleAnswer}"` : "Not available for this question."}
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {question.tips && (
                <Card className="shadow-sm border-t-4 border-t-emerald-500">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md text-emerald-700">Good Practices & Tips</CardTitle>
                  </CardHeader>
                  <CardContent className="text-card-foreground text-sm whitespace-pre-wrap">
                    {question.tips}
                  </CardContent>
                </Card>
              )}

              {question.commonMistakes && (
                <Card className="shadow-sm border-t-4 border-t-rose-500 bg-rose-50/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-md flex items-center text-rose-700">
                      <AlertTriangle className="w-4 h-4 mr-2" /> Common Mistakes
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-card-foreground text-sm whitespace-pre-wrap">
                    {question.commonMistakes}
                  </CardContent>
                </Card>
              )}
            </div>

            {question.evaluationCriteria && (
              <Card className="shadow-sm border-t-4 border-t-indigo-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-md text-indigo-700">Evaluation Criteria</CardTitle>
                </CardHeader>
                <CardContent className="text-card-foreground text-sm whitespace-pre-wrap">
                  {question.evaluationCriteria}
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="shadow-sm border border-primary/20 bg-primary/5 text-center mt-8 py-10">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-primary-700">Unlock Full Interview Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Create a free account to view the recommended structure, sample answers, expert tips, and common mistakes for this question.
              </p>
              <Button size="lg" asChild className="rounded-full shadow bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                <Link href={`/login?callbackUrl=/questions/${id}`}>Sign Up / Log In to View</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="pt-10 flex justify-center">
        <Button asChild size="lg" className="rounded-full shadow-md bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
          <Link href="/ai-interview">
            Practice this with AI Interviewer <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
