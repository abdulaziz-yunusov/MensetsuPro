"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Brain, CheckCircle2, CircleAlert, MessageSquareText, RotateCcw, Sparkles, Target } from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildSummary,
  buildConversationTranscript,
  formatDuration,
  getPromptView,
  initialInterviewConfig,
  interviewCategories,
  interviewDifficulties,
  interviewLanguages,
  interviewQuestionCounts,
  parseStoredInterviewConfig,
  type ChatMessage,
  type FeedbackData,
  type FeedbackMetric,
  type InterviewConfig,
  type InterviewSessionState,
  type ReviewEntry,
  type SessionQuestion,
  type StoredInterviewConfig,
} from "@/lib/interview";
import { cn } from "@/lib/utils";

const copy = {
  title: "AI Interview Training",
  subtitle: "Start a real session, evaluate answers through API routes, and keep your results in history.",
  coachName: "AI Interview Coach",
  coachRole: "Japanese interview simulation",
};

const metricColors: Record<FeedbackMetric["label"], string> = {
  Clarity: "bg-emerald-500",
  Confidence: "bg-sky-500",
  Relevance: "bg-teal-500",
  Grammar: "bg-amber-500",
  Politeness: "bg-rose-500",
};

async function readJson<T>(response: Response) {
  return (await response.json()) as T;
}

export default function AIInterviewWorkspace({ resumeSessionId = null }: { resumeSessionId?: string | null }) {
  const router = useRouter();
  useTranslation();
  const [screen, setScreen] = useState<"setup" | "session" | "summary">(resumeSessionId ? "session" : "setup");
  const [config, setConfig] = useState<InterviewConfig>(initialInterviewConfig);
  const [errors, setErrors] = useState<Partial<Record<"category" | "difficulty" | "jobRole", string>>>({});
  const [interviewId, setInterviewId] = useState(resumeSessionId ?? "");
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<ReviewEntry[]>([]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [draftReview, setDraftReview] = useState<ReviewEntry | null>(null);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<SessionQuestion | null>(null);
  const [pendingAssistantMessage, setPendingAssistantMessage] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "thinking" | "shown">("idle");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [sessionError, setSessionError] = useState("");
  const [isLoadingSession, setIsLoadingSession] = useState(Boolean(resumeSessionId));
  const [isSaving, setIsSaving] = useState(false);
  const conversationViewportRef = useRef<HTMLDivElement | null>(null);

  const activeQuestion = questions[currentIndex];
  const plannedQuestionCount = Number(config.questionCount || 0);
  const shouldFinishAfterCurrent = currentIndex >= Math.max(plannedQuestionCount - 1, 0) || pendingNextQuestion === null;
  const summary = useMemo(() => buildSummary(history, elapsedSeconds), [history, elapsedSeconds]);
  const isBusy = isLoadingSession || isSaving || feedbackState === "thinking";
  const progressValue = plannedQuestionCount > 0 ? Math.min(100, Math.round(((currentIndex + 1) / plannedQuestionCount) * 100)) : 0;

  const applyState = (state: InterviewSessionState) => {
    setConfig(state.config);
    setQuestions(state.questions);
    setCurrentIndex(state.currentIndex);
    setHistory(state.history);
    setConversation(buildConversationTranscript(state));
    const startedMs = new Date(state.startedAt).getTime();
    setStartedAt(startedMs);
    setElapsedSeconds(state.summary?.duration ?? Math.max(0, Math.floor((Date.now() - startedMs) / 1000)));
    setDraftAnswer("");
    setDraftReview(null);
    setPendingNextQuestion(null);
    setPendingAssistantMessage("");
    setFeedbackState("idle");
    setScreen(state.status === "completed" ? "summary" : "session");
    setSessionError("");
  };

  useEffect(() => {
    if (!startedAt || screen !== "session") return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [startedAt, screen]);

  useEffect(() => {
    if (!conversationViewportRef.current) return;
    conversationViewportRef.current.scrollTo({
      top: conversationViewportRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation.length]);

  useEffect(() => {
    if (!resumeSessionId) return;
    let cancelled = false;
    const load = async () => {
      setIsLoadingSession(true);
      try {
        const response = await fetch(`/api/interview/session/${resumeSessionId}`, { credentials: "same-origin" });
        const payload = await readJson<{ state?: InterviewSessionState; message?: string }>(response);
        if (!response.ok || !payload.state) throw new Error(payload.message || "Failed to load interview session.");
        if (!cancelled) {
          setInterviewId(resumeSessionId);
          applyState(payload.state);
        }
      } catch (error) {
        if (!cancelled) {
          setSessionError(error instanceof Error ? error.message : "Failed to load interview session.");
          setScreen("setup");
        }
      } finally {
        if (!cancelled) setIsLoadingSession(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [resumeSessionId]);

  const updateConfig = <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
    if (key === "category" || key === "difficulty" || key === "jobRole") setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validateConfig = () => {
    const nextErrors: Partial<Record<"category" | "difficulty" | "jobRole", string>> = {};
    if (!config.category) nextErrors.category = "Choose an interview category.";
    if (!config.difficulty) nextErrors.difficulty = "Choose a difficulty level.";
    if (!config.jobRole.trim()) nextErrors.jobRole = "Enter the target role you want to practice for.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const startSession = async () => {
    if (!validateConfig()) return;
    const normalized = parseStoredInterviewConfig(config as StoredInterviewConfig);
    if (!normalized) {
      setSessionError("The interview setup is invalid.");
      return;
    }
    setSessionError("");
    setIsSaving(true);
    try {
      const response = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(normalized),
      });
      const payload = await readJson<{ interviewId?: string; state?: InterviewSessionState; message?: string }>(response);
      if (!response.ok || !payload.interviewId || !payload.state) throw new Error(payload.message || "Failed to start interview.");
      setInterviewId(payload.interviewId);
      applyState(payload.state);
      router.replace(`/ai-interview/session/${payload.interviewId}`);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Failed to start interview.");
    } finally {
      setIsSaving(false);
    }
  };

  const evaluateAnswer = async (answer: string) => {
    if (!interviewId || !activeQuestion) return;
    setSessionError("");
    setFeedbackState("thinking");
    try {
      const response = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ interviewId, answer }),
      });
      const payload = await readJson<{ feedback?: FeedbackData; assistantMessage?: string; nextQuestion?: SessionQuestion | null; message?: string }>(response);
      if (!response.ok || !payload.feedback) throw new Error(payload.message || "Failed to evaluate answer.");
      setDraftReview({ questionIndex: currentIndex, question: activeQuestion, answer, feedback: payload.feedback });
      setPendingNextQuestion(payload.nextQuestion ?? null);
      setPendingAssistantMessage(payload.assistantMessage ?? payload.feedback.interviewerLine);
      const timestamp = new Date().toISOString();
      setConversation((current) => [
        ...current,
        { role: "user", content: answer || "Question skipped.", createdAt: timestamp, questionIndex: currentIndex },
        {
          role: "assistant",
          content: payload.assistantMessage ?? payload.feedback.interviewerLine,
          createdAt: timestamp,
          questionIndex: currentIndex,
        },
      ]);
      setFeedbackState("shown");
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Failed to evaluate answer.");
      setFeedbackState("idle");
    }
  };

  const persistReview = async (finish: boolean) => {
    if (!interviewId) return;
    setSessionError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/interview/session/${interviewId}/commit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(
          draftReview
            ? {
                answer: draftReview.answer,
                feedback: draftReview.feedback,
                finish,
                nextQuestion: pendingNextQuestion,
                assistantMessage: pendingAssistantMessage,
              }
            : { finish: true, finalizeOnly: true }
        ),
      });
      const payload = await readJson<{ state?: InterviewSessionState; message?: string }>(response);
      if (!response.ok || !payload.state) throw new Error(payload.message || "Failed to save interview progress.");
      applyState(payload.state);
    } catch (error) {
      setSessionError(error instanceof Error ? error.message : "Failed to save interview progress.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingSession) {
    return <div className="container mx-auto max-w-4xl px-4 py-12 text-center text-muted-foreground">Loading saved interview session...</div>;
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8 md:py-12">
      <div className="space-y-2">
        <Badge className="bg-teal-700 text-white hover:bg-teal-700">{copy.title}</Badge>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {sessionError ? <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{sessionError}</div> : null}

      {screen === "setup" ? (
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card>
            <CardHeader>
              <CardTitle>Interview setup</CardTitle>
              <CardDescription>Choose the interview context, then start a persisted session.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5">
              <Field label="Category" hint={errors.category ?? "Choose the interview area you want to practice."} error={Boolean(errors.category)}>
                <select className={fieldClass(Boolean(errors.category))} value={config.category} onChange={(event) => updateConfig("category", event.target.value as InterviewConfig["category"])}>
                  <option value="">Select a category</option>
                  {interviewCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
              <Field label="Difficulty" hint={errors.difficulty ?? "Difficulty and strict mode both affect the scoring bar."} error={Boolean(errors.difficulty)}>
                <select className={fieldClass(Boolean(errors.difficulty))} value={config.difficulty} onChange={(event) => updateConfig("difficulty", event.target.value as InterviewConfig["difficulty"])}>
                  <option value="">Select difficulty</option>
                  {interviewDifficulties.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
              </Field>
              <Field label="Job role" hint={errors.jobRole ?? "Required. Questions are framed around this target role."} error={Boolean(errors.jobRole)}>
                <Input value={config.jobRole} onChange={(event) => updateConfig("jobRole", event.target.value)} placeholder="Frontend Developer, Backend Developer, QA Engineer..." className={cn("h-11 rounded-xl", errors.jobRole && "border-rose-300")} />
              </Field>
              <Field label="Language" hint="Controls prompt display and rewrite suggestions.">
                <div className="flex flex-wrap gap-2">
                  {interviewLanguages.map((item) => <ToggleButton key={item.value} active={config.language === item.value} onClick={() => updateConfig("language", item.value)}>{item.label}</ToggleButton>)}
                </div>
              </Field>
              <Field label="Number of questions" hint="Choose 3, 5, or 10 questions.">
                <div className="flex flex-wrap gap-2">
                  {interviewQuestionCounts.map((count) => <ToggleButton key={count} active={config.questionCount === count} onClick={() => updateConfig("questionCount", count)}>{count}</ToggleButton>)}
                </div>
              </Field>
              <div className="grid gap-3 md:grid-cols-3">
                <OptionToggle checked={config.includeFollowUps} title="Include follow-ups" description="Add deeper probing questions." onClick={() => updateConfig("includeFollowUps", !config.includeFollowUps)} />
                <OptionToggle checked={config.showLiveHints} title="Show live hints" description="Keep a hint visible during the session." onClick={() => updateConfig("showLiveHints", !config.showLiveHints)} />
                <OptionToggle checked={config.strictMode} title="Strict mode" description="Harsher scoring and more formal expectations." onClick={() => updateConfig("strictMode", !config.strictMode)} />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setConfig(initialInterviewConfig); setErrors({}); setSessionError(""); }} disabled={isBusy}>Reset</Button>
              <Button className="bg-teal-700 text-white hover:bg-teal-800" onClick={() => void startSession()} disabled={isBusy}>Start interview<ArrowRight className="ml-2 size-4" /></Button>
            </CardFooter>
          </Card>
          <Card className="bg-slate-950 text-white">
            <CardContent className="space-y-5 p-6">
              <div className="flex items-center gap-4">
                <Avatar className="size-16 border border-white/10">
                  <AvatarImage src="/images/ai-interviewer.png" alt={copy.coachName} />
                  <AvatarFallback className="bg-white/10 text-white">AI</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{copy.coachName}</div>
                  <div className="text-sm text-slate-300">{copy.coachRole}</div>
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-slate-100">{config.strictMode ? "Please answer in a more formal interview style." : "Answer naturally, but keep your language professional."}</div>
              <PreviewRow label="Category" value={interviewCategories.find((item) => item.value === config.category)?.label ?? "-"} dark />
              <PreviewRow label="Difficulty" value={interviewDifficulties.find((item) => item.value === config.difficulty)?.label ?? "-"} dark />
              <PreviewRow label="Language" value={interviewLanguages.find((item) => item.value === config.language)?.label ?? "-"} dark />
              <PreviewRow label="Role" value={config.jobRole || "-"} dark />
            </CardContent>
          </Card>
        </div>
      ) : null}

      {screen === "session" && activeQuestion ? (
        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.8fr]">
          <Card className="overflow-hidden border-border/70 bg-background shadow-xl shadow-slate-200/50">
            <CardHeader className="border-b border-border/60 bg-[linear-gradient(135deg,rgba(15,118,110,0.08),rgba(15,23,42,0.02))]">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <Badge className="bg-teal-700 text-white hover:bg-teal-700">Live interview</Badge>
                  <CardTitle className="mt-3 flex items-center gap-2 text-2xl">
                    <MessageSquareText className="size-5 text-teal-700" />
                    Conversation-first interview workspace
                  </CardTitle>
                  <CardDescription className="mt-2 text-sm leading-6">
                    Stay focused on the chat. The interviewer response, current judgment, and next question all come from the live AI turn.
                  </CardDescription>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <SessionMiniStat label="Question" value={`${currentIndex + 1} / ${plannedQuestionCount}`} />
                  <SessionMiniStat label="Elapsed" value={formatDuration(elapsedSeconds)} />
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-0 p-0">
              <div className="border-b border-border/60 bg-muted/20 px-6 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      <Target className="size-4 text-teal-700" />
                      Current question
                    </div>
                    <p className="text-base font-semibold leading-7 text-foreground">{getPromptView(activeQuestion, config.language).primary}</p>
                    <p className="text-sm text-muted-foreground">{getPromptView(activeQuestion, config.language).secondary}</p>
                  </div>
                  <div className="min-w-[220px] rounded-2xl border border-teal-100 bg-teal-50/80 p-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-700">Answer guide</div>
                    <div className="mt-2 text-sm leading-6 text-slate-700">
                      Conclusion first, one concrete example, then the result.
                    </div>
                  </div>
                </div>
                {config.showLiveHints ? (
                  <div className="mt-4 rounded-2xl border border-dashed border-teal-200 bg-background/80 px-4 py-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Hint:</span> {activeQuestion.hint}
                  </div>
                ) : null}
              </div>

              <div ref={conversationViewportRef} className="min-h-[440px] max-h-[620px] space-y-4 overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.85),rgba(255,255,255,1))] px-6 py-6">
                {conversation.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background/80 p-5 text-sm text-muted-foreground">
                    The interview chat will appear here once the session starts.
                  </div>
                ) : (
                  conversation.map((message, index) => (
                    <ChatBubble key={`${message.role}-${message.createdAt}-${index}`} message={message} />
                  ))
                )}
              </div>
            </CardContent>

            <CardFooter className="border-t border-border/60 bg-card/70 px-6 py-5">
              <div className="w-full space-y-4">
                <Textarea
                  value={draftAnswer}
                  onChange={(event) => setDraftAnswer(event.target.value)}
                  placeholder={
                    config.language === "english"
                      ? "Type your answer here in English..."
                      : config.language === "mixed"
                        ? "Type your answer in Japanese or English..."
                        : "Type your answer here in Japanese..."
                  }
                  className="min-h-[180px] rounded-2xl border-border bg-background"
                  disabled={isBusy}
                />

                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div className="rounded-2xl border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Role framing: <span className="font-medium text-foreground">{config.jobRole}</span>.{" "}
                    {config.strictMode ? "Formal tone is judged more strictly." : "Professional but natural delivery is acceptable."}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="outline" onClick={() => setDraftAnswer("")} disabled={isBusy || !draftAnswer}>Clear</Button>
                    <Button variant="outline" onClick={() => void evaluateAnswer("")} disabled={isBusy}>Skip</Button>
                    {draftReview ? <Button variant="outline" onClick={() => {
                      setDraftReview(null);
                      setPendingNextQuestion(null);
                      setPendingAssistantMessage("");
                      setConversation((current) => current.slice(0, Math.max(0, current.length - 2)));
                      setFeedbackState("idle");
                    }} disabled={isBusy}>Retry</Button> : null}
                    <Button variant="outline" className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800" onClick={() => void persistReview(true)} disabled={isBusy}>End session</Button>
                    {draftReview ? (
                      <Button className="bg-teal-700 text-white hover:bg-teal-800" onClick={() => void persistReview(shouldFinishAfterCurrent)} disabled={isBusy}>
                        {shouldFinishAfterCurrent ? "Finish session" : "Next question"}
                      </Button>
                    ) : (
                      <Button className="bg-teal-700 text-white hover:bg-teal-800" onClick={() => void evaluateAnswer(draftAnswer)} disabled={isBusy}>
                        Submit answer<ArrowRight className="ml-2 size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardFooter>
          </Card>

          <div className="space-y-6">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Sparkles className="size-4 text-teal-700" />
                  Session overview
                </CardTitle>
                <CardDescription>Keep the interview context visible without taking focus away from the chat.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">{progressValue}%</span>
                  </div>
                  <Progress value={progressValue}>
                    <ProgressTrack className="h-2 rounded-full bg-slate-200">
                      <ProgressIndicator className="bg-teal-700" />
                    </ProgressTrack>
                  </Progress>
                </div>
                <PreviewRow label="Role" value={config.jobRole} />
                <PreviewRow label="Category" value={interviewCategories.find((item) => item.value === config.category)?.label ?? "-"} />
                <PreviewRow label="Difficulty" value={interviewDifficulties.find((item) => item.value === config.difficulty)?.label ?? "-"} />
                <PreviewRow label="Language" value={interviewLanguages.find((item) => item.value === config.language)?.label ?? "-"} />
                <PreviewRow label="Question plan" value={`${plannedQuestionCount} total`} />
              </CardContent>
            </Card>

            {feedbackState === "thinking" ? (
              <Card className="border-teal-100 bg-teal-50/70">
                <CardContent className="flex items-center gap-3 p-5 text-sm text-slate-700">
                  <Brain className="size-4 animate-pulse text-teal-700" />
                  AI is judging the answer and preparing the next interviewer response...
                </CardContent>
              </Card>
            ) : null}

            {feedbackState === "shown" && draftReview ? (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge className="bg-teal-700 text-white hover:bg-teal-700">Latest review</Badge>
                      <CardTitle className="mt-3 text-3xl">{draftReview.feedback.overall}/100</CardTitle>
                      <CardDescription className="mt-2 text-sm leading-6">{draftReview.feedback.summary}</CardDescription>
                    </div>
                    <div className="rounded-2xl border border-teal-100 bg-teal-50 px-3 py-2 text-xs font-medium text-teal-800">
                      {draftReview.feedback.interviewerLine}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {draftReview.feedback.metrics.map((metric) => (
                      <div key={metric.label} className="rounded-2xl border border-border p-3">
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">{metric.label}</span>
                          <span className="text-muted-foreground">{metric.value}</span>
                        </div>
                        <Progress value={metric.value}>
                          <ProgressTrack className="h-2 rounded-full bg-slate-200">
                            <ProgressIndicator className={metricColors[metric.label]} />
                          </ProgressTrack>
                        </Progress>
                      </div>
                    ))}
                  </div>
                  <FeedbackList title="Strengths" items={draftReview.feedback.strengths} positive />
                  <FeedbackList title="What to improve" items={draftReview.feedback.weakPoints} />
                  <FeedbackList title="Next answer tips" items={draftReview.feedback.suggestions} />
                  <ResponseCard title="Stronger sample answer" content={draftReview.feedback.betterSampleAnswer} />
                  {draftReview.feedback.naturalJapaneseVersion ? <ResponseCard title="Natural Japanese" content={draftReview.feedback.naturalJapaneseVersion} /> : null}
                  {draftReview.feedback.businessPoliteVersion ? <ResponseCard title="Business polite version" content={draftReview.feedback.businessPoliteVersion} /> : null}
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border/70 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">How feedback appears</CardTitle>
                  <CardDescription>Scores and coaching show up here after each submitted answer so the chat stays primary.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Overall score gives a quick read on answer quality.</p>
                  <p>Metric bars break down clarity, confidence, relevance, grammar, and politeness.</p>
                  <p>Actionable suggestions stay grouped in one place before you move to the next question.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : null}

      {screen === "summary" ? (
        <div className="space-y-6">
          <Card className="bg-slate-950 text-white">
            <CardContent className="grid gap-5 p-6 md:grid-cols-4">
              <SummaryPill label="Overall performance" value={`${summary.overall}/100`} />
              <SummaryPill label="Best skill area" value={summary.bestMetric} />
              <SummaryPill label="Weakest skill area" value={summary.weakestMetric} />
              <SummaryPill label="Session duration" value={formatDuration(elapsedSeconds)} />
            </CardContent>
          </Card>
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <Card>
              <CardHeader><CardTitle>Session breakdown</CardTitle><CardDescription>{summary.summaryText}</CardDescription></CardHeader>
              <CardContent className="space-y-3">
                <PreviewRow label="Questions completed" value={`${summary.completedQuestions} / ${plannedQuestionCount || history.length || 0}`} />
                <PreviewRow label="Skipped questions" value={String(summary.skippedQuestions)} />
                <PreviewRow label="Average clarity" value={`${summary.averages.Clarity}/100`} />
                <PreviewRow label="Average confidence" value={`${summary.averages.Confidence}/100`} />
                <PreviewRow label="Average relevance" value={`${summary.averages.Relevance}/100`} />
                <PreviewRow label="Average grammar" value={`${summary.averages.Grammar}/100`} />
                <PreviewRow label="Average politeness" value={`${summary.averages.Politeness}/100`} />
              </CardContent>
              <CardFooter className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={() => { setConfig(initialInterviewConfig); setErrors({}); setHistory([]); setQuestions([]); setConversation([]); setDraftAnswer(""); setDraftReview(null); setPendingNextQuestion(null); setPendingAssistantMessage(""); setElapsedSeconds(0); setStartedAt(null); setScreen("setup"); router.push("/ai-interview"); }}><RotateCcw className="mr-2 size-4" />Start new session</Button>
                {interviewId ? <Button asChild className="bg-teal-700 text-white hover:bg-teal-800"><Link href={`/ai-interview/results/${interviewId}`}>View saved results</Link></Button> : null}
              </CardFooter>
            </Card>
            <Card>
              <CardHeader><CardTitle>Reviewed answers</CardTitle><CardDescription>Committed answers are shown below.</CardDescription></CardHeader>
              <CardContent>
                {history.length === 0 ? <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground">No reviewed answers were recorded in this session.</div> : (
                  <Accordion type="single" collapsible>
                    {history.map((entry) => (
                      <AccordionItem key={`${entry.question.id}-${entry.questionIndex}`} value={`${entry.question.id}-${entry.questionIndex}`}>
                        <AccordionTrigger>Question {entry.questionIndex + 1}: {entry.question.label}</AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <ResponseCard title="Question" content={getPromptView(entry.question, config.language).primary} />
                          <ResponseCard title="Your answer" content={entry.answer || "Question skipped."} />
                          <ResponseCard title="AI summary" content={entry.feedback.summary} />
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function fieldClass(hasError: boolean) {
  return cn("h-11 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none", hasError ? "border-rose-300" : "border-border");
}

function Field({ label, hint, error, children }: { label: string; hint: string; error?: boolean; children: ReactNode }) {
  return <div className="grid gap-2"><Label>{label}</Label>{children}<p className={cn("text-xs", error ? "text-rose-600" : "text-muted-foreground")}>{hint}</p></div>;
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-xl border px-3 py-2 text-sm", active ? "border-teal-700 bg-teal-700 text-white" : "border-border bg-card")}>{children}</button>;
}

function OptionToggle({ checked, title, description, onClick }: { checked: boolean; title: string; description: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={cn("rounded-xl border px-4 py-3 text-left", checked ? "border-teal-700 bg-teal-700 text-white" : "border-border bg-card")}><div className="font-medium">{title}</div><div className={cn("mt-2 text-xs", checked ? "text-teal-50" : "text-muted-foreground")}>{description}</div></button>;
}

function PreviewRow({ label, value, dark = false }: { label: string; value: string; dark?: boolean }) {
  return <div className={cn("flex items-center justify-between gap-3 border-b border-dashed pb-3 text-sm last:border-b-0 last:pb-0", dark ? "border-white/10" : "border-border")}><span className={dark ? "text-slate-400" : "text-muted-foreground"}>{label}</span><span className={dark ? "text-white" : "text-foreground"}>{value}</span></div>;
}

function FeedbackList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  return <div className={cn("rounded-xl border p-4", positive ? "border-emerald-100 bg-emerald-50/80" : "border-border bg-muted/20")}><div className="mb-2 flex items-center gap-2 text-sm font-medium">{positive ? <CheckCircle2 className="size-4 text-emerald-600" /> : <CircleAlert className="size-4 text-amber-600" />}{title}</div><div className="space-y-2 text-sm">{items.map((item) => <p key={item}>{item}</p>)}</div></div>;
}

function ResponseCard({ title, content }: { title: string; content: string }) {
  return <div className="rounded-xl border border-border bg-muted/20 p-4"><div className="text-sm font-medium text-foreground">{title}</div><p className="mt-2 whitespace-pre-line text-sm leading-6 text-card-foreground">{content}</p></div>;
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border border-white/10 bg-white/5 p-4"><div className="text-xs uppercase tracking-wide text-slate-400">{label}</div><div className="mt-2 text-lg font-semibold">{value}</div></div>;
}

function SessionMiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/85 px-4 py-3 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
          isAssistant ? "border border-teal-100 bg-teal-50 text-slate-900" : "bg-slate-950 text-white"
        )}
      >
        <div className={cn("mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]", isAssistant ? "text-teal-700" : "text-slate-300")}>
          {isAssistant ? "Interviewer" : "You"}
        </div>
        <p className="whitespace-pre-line">{message.content}</p>
      </div>
    </div>
  );
}
