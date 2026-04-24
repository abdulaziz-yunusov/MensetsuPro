import { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronRight, CircleAlert, Star, Target } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { authOptions } from "@/lib/auth";
import { buildConversationTranscript, buildSummary, getPromptView, parseInterviewSessionState } from "@/lib/interview";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Interview Results | MensetsuPro",
  description: "Detailed AI feedback for your saved mock interview session.",
};

const metricColors = {
  Clarity: "bg-emerald-500",
  Confidence: "bg-sky-500",
  Relevance: "bg-teal-500",
  Grammar: "bg-amber-500",
  Politeness: "bg-rose-500",
} as const;

export default async function AIInterviewResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  const interview = await prisma.mockInterview.findUnique({
    where: { id },
    include: { logs: true },
  });

  if (!interview || interview.userId !== session.user.id) {
    notFound();
  }

  const state = parseInterviewSessionState(interview.feedbackJson);
  if (!state) {
    notFound();
  }

  const summary = state.summary ?? buildSummary(state.history, 0);
  const conversation = buildConversationTranscript(state);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground">Dashboard</Link>
        <ChevronRight className="size-4" />
        <Link href="/dashboard/mock-interviews" className="hover:text-foreground">Mock Interviews</Link>
        <ChevronRight className="size-4" />
        <span className="font-medium text-foreground">Session Results</span>
      </div>

      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground">
            Interview Feedback
            <Badge variant="secondary">Completed</Badge>
          </h1>
          <p className="mt-2 text-muted-foreground">Target Role: {interview.jobRole} • Difficulty: {interview.difficulty}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/dashboard/mock-interviews" className="inline-flex h-9 items-center justify-center rounded-lg border border-border bg-card px-4 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="mr-2 size-4" /> Back to History
          </Link>
          <Link href="/ai-interview" className="inline-flex h-9 items-center justify-center rounded-lg bg-teal-700 px-4 text-sm font-medium text-white hover:bg-teal-800">
            Practice Again
          </Link>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg text-muted-foreground">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="relative my-4 flex size-32 items-center justify-center">
                <svg className="size-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#0f766e" strokeWidth="8" strokeDasharray={`${(summary.overall / 100) * 283} 283`} strokeLinecap="round" />
                </svg>
                <div className="absolute text-center">
                  <div className="text-4xl font-bold text-foreground">{summary.overall}</div>
                  <div className="text-sm text-muted-foreground">/ 100</div>
                </div>
              </div>
              <p className="text-center text-sm text-muted-foreground">{summary.summaryText}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><Target className="size-4 text-orange-600" />Average Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(summary.averages).map(([label, value]) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{label}</span>
                    <span>{value}</span>
                  </div>
                  <Progress value={value}>
                    <ProgressTrack className="h-2 rounded-full bg-slate-200">
                      <ProgressIndicator className={metricColors[label as keyof typeof metricColors]} />
                    </ProgressTrack>
                  </Progress>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Interview Chat</CardTitle>
              <CardDescription>Saved Gemini conversation for this session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {conversation.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">
                  No chat transcript is available for this session.
                </div>
              ) : (
                conversation.map((message, index) => (
                  <div key={`${message.role}-${message.createdAt}-${index}`} className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${message.role === "assistant" ? "border border-teal-100 bg-teal-50 text-slate-900" : "bg-slate-950 text-white"}`}>
                      <div className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${message.role === "assistant" ? "text-teal-700" : "text-slate-300"}`}>
                        {message.role === "assistant" ? "Interviewer" : "You"}
                      </div>
                      <p className="whitespace-pre-line">{message.content}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Question by Question Breakdown</CardTitle>
              <CardDescription>Saved answers and feedback from this interview session.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {state.history.map((entry, index) => (
                <div key={`${entry.question.id}-${entry.questionIndex}`} className="space-y-4 rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-lg font-semibold text-foreground">Q{index + 1}: {getPromptView(entry.question, state.config.language).primary}</h3>
                    <Badge variant="outline">{entry.feedback.overall}/100</Badge>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Answer</div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-card-foreground">{entry.answer || "Question skipped."}</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-emerald-800"><CheckCircle2 className="size-4" />Strengths</div>
                      <div className="space-y-2 text-sm text-emerald-700">{entry.feedback.strengths.map((item) => <p key={item}>{item}</p>)}</div>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                      <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-800"><CircleAlert className="size-4" />Areas to Improve</div>
                      <div className="space-y-2 text-sm text-amber-700">{entry.feedback.weakPoints.map((item) => <p key={item}>{item}</p>)}</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background p-4">
                    <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-foreground"><Star className="size-4 text-amber-500" />AI Suggested Alternative</div>
                    <p className="whitespace-pre-line text-sm leading-6 text-card-foreground">{entry.feedback.betterSampleAnswer}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
