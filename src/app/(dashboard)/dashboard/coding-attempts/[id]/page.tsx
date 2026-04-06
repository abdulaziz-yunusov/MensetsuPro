import { Suspense } from "react";
import { getQuestionHistory } from "@/actions/coding";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Code2, AlertTriangle, Play } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Submission History | MensetsuPro",
  description: "Detailed submission history for this coding challenge.",
};

async function HistoryTable({ questionId }: { questionId: string }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  const { success, question, submissions, error } = await getQuestionHistory(questionId);

  if (!success || !question) {
    return (
      <div className="p-12 text-center text-muted-foreground bg-card rounded-xl border border-border border-dashed">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-slate-300" />
        <p>{error || "Failed to load submission history."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{question.title}</h2>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <Badge variant="outline">{question.difficulty}</Badge>
            <span>{submissions?.length || 0} Total Submissions</span>
          </p>
        </div>
        <Link 
          href={`/ai-interview?challengeId=${questionId}`}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Play className="mr-2 size-4" /> Try Again
        </Link>
      </div>

      {submissions && submissions.length > 0 ? (
        <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-background/80 sticky top-0">
                <TableRow>
                  <TableHead className="w-[200px] font-semibold text-foreground">User</TableHead>
                  <TableHead className="font-semibold text-foreground">Problem</TableHead>
                  <TableHead className="font-semibold text-foreground">Language</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground text-right">Submitted Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub: any) => (
                  <TableRow key={sub.id} className="hover:bg-background/50">
                    <TableCell className="font-medium text-card-foreground">
                      {session.user?.name || "Anonymous User"}
                    </TableCell>
                    <TableCell className="text-sky-600 font-medium cursor-pointer hover:underline">
                      <Link href={`/ai-interview?challengeId=${questionId}`}>{question.title}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">
                      JavaScript
                    </TableCell>
                    <TableCell>
                      {sub.status === "PASS" ? (
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Accepted
                        </span>
                      ) : (
                        <span className="font-bold text-rose-600 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span> Wrong Answer
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {new Date(sub.createdAt).toLocaleString(undefined, {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center text-muted-foreground bg-background rounded-xl border border-border border-dashed">
          <Code2 className="mx-auto mb-4 h-12 w-12 text-slate-300" />
          <p>You haven't attempted this challenge yet.</p>
        </div>
      )}
    </div>
  );
}

export default async function ProblemHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return notFound();

  return (
    <div className="space-y-6">
      <Link 
        href="/dashboard/coding-attempts" 
        className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Directory
      </Link>

      <Suspense fallback={<div className="animate-pulse space-y-6"><div className="h-20 bg-muted rounded-xl" /><div className="h-64 bg-muted rounded-xl" /></div>}>
        <HistoryTable questionId={id} />
      </Suspense>
    </div>
  );
}
