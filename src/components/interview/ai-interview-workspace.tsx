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
    <div className="container mx-auto max-w-[1400px] space-y-6 px-4 py-8 md:py-12">
      {/* ── PAGE HEADER ── */}
      <div className="space-y-2">
        <Badge className="bg-teal-700 text-white hover:bg-teal-700">{copy.title}</Badge>
        <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
      </div>

      {sessionError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{sessionError}</div>
      ) : null}

      {/* ══════════════════════════════════════════
          SETUP SCREEN
      ══════════════════════════════════════════ */}
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

      {/* ══════════════════════════════════════════
          SESSION SCREEN — redesigned 3-panel layout
      ══════════════════════════════════════════ */}
      {screen === "session" && activeQuestion ? (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-xl shadow-slate-200/60">

          {/* ── TOP SESSION BAR ── */}
          <div className="flex items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-teal-950 to-slate-950 px-5 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Badge className="shrink-0 bg-teal-500 text-white hover:bg-teal-500">Live interview</Badge>
              <MessageSquareText className="size-4 shrink-0 text-teal-400" />
              <span className="truncate text-sm font-semibold text-white">{config.jobRole}</span>
              <span className="hidden text-slate-600 sm:block">·</span>
              <span className="hidden text-xs text-slate-400 sm:block">
                {interviewCategories.find((i) => i.value === config.category)?.label ?? "—"}
              </span>
              <span className="hidden text-slate-600 lg:block">·</span>
              <span className="hidden text-xs text-slate-500 lg:block">
                {interviewDifficulties.find((i) => i.value === config.difficulty)?.label ?? "—"}
              </span>
            </div>
            <div className="flex shrink-0 items-center gap-5">
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Elapsed</div>
                <div className="font-mono text-sm font-semibold text-white">{formatDuration(elapsedSeconds)}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase tracking-widest text-slate-500">Question</div>
                <div className="text-sm font-bold text-white">
                  {currentIndex + 1}<span className="font-normal text-slate-500"> / {plannedQuestionCount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── PROGRESS BAR ── */}
          <div className="h-[3px] bg-slate-800">
            <div
              className="h-full bg-teal-500 transition-all duration-700 ease-out"
              style={{ width: `${progressValue}%` }}
            />
          </div>

          {/* ── THREE-PANEL BODY ── */}
          <div className="grid xl:grid-cols-[260px_1fr_360px] xl:divide-x xl:divide-border/60" style={{ minHeight: "700px" }}>

            {/* ── LEFT PANEL: Current question + session info ── */}
            <div className="flex flex-col gap-5 border-b border-border/60 bg-slate-50/70 p-5 xl:border-b-0">

              {/* Current question */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="size-3.5 text-teal-700" />
                  <span className="text-[11px] font-bold uppercase tracking-widest text-teal-700">Current question</span>
                </div>
                <p className="text-sm font-semibold leading-6 text-foreground">
                  {getPromptView(activeQuestion, config.language).primary}
                </p>
                {getPromptView(activeQuestion, config.language).secondary ? (
                  <p className="text-xs leading-5 text-muted-foreground">
                    {getPromptView(activeQuestion, config.language).secondary}
                  </p>
                ) : null}
              </div>

              {/* Answer guide */}
              <div className="rounded-xl border border-teal-100 bg-teal-50 p-3">
                <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-teal-700">Answer guide</div>
                <p className="text-xs leading-5 text-slate-700">
                  Conclusion first, one concrete example, then the result.
                </p>
              </div>

              {/* Hint */}
              {config.showLiveHints ? (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-3 text-xs text-muted-foreground">
                  <span className="font-semibold text-amber-700">Hint: </span>
                  {activeQuestion.hint}
                </div>
              ) : null}

              {/* Divider + session metadata */}
              <div className="mt-auto space-y-2.5 border-t border-border/60 pt-4">
                <div className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Session info</div>
                <PreviewRow label="Role" value={config.jobRole} />
                <PreviewRow label="Category" value={interviewCategories.find((i) => i.value === config.category)?.label ?? "—"} />
                <PreviewRow label="Difficulty" value={interviewDifficulties.find((i) => i.value === config.difficulty)?.label ?? "—"} />
                <PreviewRow label="Language" value={interviewLanguages.find((i) => i.value === config.language)?.label ?? "—"} />
                <PreviewRow label="Questions" value={`${plannedQuestionCount} total`} />
              </div>
            </div>

            {/* ── CENTER PANEL: Chat (primary) + Answer input ── */}
            <div className="flex flex-col">

              {/* Chat messages — the main content */}
              <div
                ref={conversationViewportRef}
                className="flex-1 overflow-x-hidden overflow-y-auto bg-[linear-gradient(180deg,rgba(248,250,252,0.9),rgba(255,255,255,1))] px-6 py-6"
                style={{ minHeight: "380px", maxHeight: "520px" }}
              >
                {conversation.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/20 p-10 text-center">
                    <MessageSquareText className="size-10 text-muted-foreground/30" />
                    <p className="text-sm font-medium text-muted-foreground">
                      The conversation starts here
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Type your answer on the left and submit to begin the interview.
                    </p>
                  </div>
                ) : (
                  <div className="min-w-0 space-y-4">
                    {conversation.map((message, index) => (
                      <ChatBubble key={`${message.role}-${message.createdAt}-${index}`} message={message} />
                    ))}
                  </div>
                )}
              </div>

              {/* ── ANSWER INPUT ── */}
              <div className="border-t border-border/60 bg-card/80 p-5 space-y-3">
                {/* Role context chip */}
                <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">Role framing:</span>{" "}
                  {config.jobRole}.{" "}
                  {config.strictMode
                    ? "Formal tone is judged more strictly."
                    : "Professional but natural delivery is acceptable."}
                </div>

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
                  className="min-h-[130px] rounded-2xl border-border bg-background"
                  style={{ wordBreak: "break-word", overflowWrap: "anywhere", whiteSpace: "pre-wrap" }}
                  disabled={isBusy}
                />

                {/* Action row */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Left: secondary actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" onClick={() => setDraftAnswer("")} disabled={isBusy || !draftAnswer}>
                      Clear
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void evaluateAnswer("")} disabled={isBusy}>
                      Skip
                    </Button>
                    {draftReview ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDraftReview(null);
                          setPendingNextQuestion(null);
                          setPendingAssistantMessage("");
                          setConversation((current) => current.slice(0, Math.max(0, current.length - 2)));
                          setFeedbackState("idle");
                        }}
                        disabled={isBusy}
                      >
                        Retry
                      </Button>
                    ) : null}
                  </div>

                  {/* Right: primary actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                      onClick={() => void persistReview(true)}
                      disabled={isBusy}
                    >
                      End session
                    </Button>
                    {draftReview ? (
                      <Button
                        className="bg-teal-700 text-white hover:bg-teal-800"
                        onClick={() => void persistReview(shouldFinishAfterCurrent)}
                        disabled={isBusy}
                      >
                        {shouldFinishAfterCurrent ? "Finish session" : "Next question"}
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    ) : (
                      <Button
                        className="bg-teal-700 text-white hover:bg-teal-800"
                        onClick={() => void evaluateAnswer(draftAnswer)}
                        disabled={isBusy}
                      >
                        Submit answer
                        <ArrowRight className="ml-2 size-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT PANEL: Feedback & Scores (always docked) ── */}
            <div
              className="overflow-y-auto border-t border-border/60 bg-slate-50/50 xl:border-t-0"
              style={{ maxHeight: "700px" }}
            >
              {/* Thinking state */}
              {feedbackState === "thinking" ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="rounded-full border border-teal-100 bg-teal-50 p-4">
                    <Brain className="size-7 animate-pulse text-teal-600" />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-slate-700">Evaluating your answer...</p>
                    <p className="text-xs text-muted-foreground">Preparing scores and coaching notes.</p>
                  </div>
                  <div className="mt-2 flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="size-1.5 rounded-full bg-teal-400"
                        style={{ animation: `pulse 1s ease-in-out ${i * 0.2}s infinite` }}
                      />
                    ))}
                  </div>
                </div>
              ) : feedbackState === "shown" && draftReview ? (
                /* ── Feedback shown ── */
                <div className="space-y-4 p-5">

                  {/* Overall score */}
                  <div className="rounded-2xl border border-teal-100 bg-gradient-to-br from-teal-50 to-white p-5">
                    <Badge className="bg-teal-700 text-white hover:bg-teal-700">Latest review</Badge>
                    <div className="mt-3 flex items-end gap-1.5">
                      <span className="text-5xl font-bold tabular-nums text-foreground">{draftReview.feedback.overall}</span>
                      <span className="mb-1.5 text-xl text-muted-foreground">/100</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">{draftReview.feedback.summary}</p>
                  </div>

                  {/* Interviewer line */}
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs italic leading-5 text-slate-600">
                    "{draftReview.feedback.interviewerLine}"
                  </div>

                  {/* Metric bars */}
                  <div className="space-y-3">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Skill breakdown</div>
                    {draftReview.feedback.metrics.map((metric) => (
                      <div key={metric.label} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-foreground">{metric.label}</span>
                          <span className="text-xs tabular-nums text-muted-foreground">{metric.value}/100</span>
                        </div>
                        <Progress value={metric.value}>
                          <ProgressTrack className="h-1.5 rounded-full bg-slate-200">
                            <ProgressIndicator className={metricColors[metric.label]} />
                          </ProgressTrack>
                        </Progress>
                      </div>
                    ))}
                  </div>

                  {/* Feedback lists */}
                  <FeedbackList title="Strengths" items={draftReview.feedback.strengths} positive />
                  <FeedbackList title="What to improve" items={draftReview.feedback.weakPoints} />
                  <FeedbackList title="Next answer tips" items={draftReview.feedback.suggestions} />
                  <ResponseCard title="Stronger sample answer" content={draftReview.feedback.betterSampleAnswer} />
                  {draftReview.feedback.naturalJapaneseVersion ? (
                    <ResponseCard title="Natural Japanese" content={draftReview.feedback.naturalJapaneseVersion} />
                  ) : null}
                  {draftReview.feedback.businessPoliteVersion ? (
                    <ResponseCard title="Business polite version" content={draftReview.feedback.businessPoliteVersion} />
                  ) : null}
                </div>
              ) : (
                /* ── Idle placeholder ── */
                <div className="flex h-full flex-col items-center justify-center gap-5 p-8 text-center">
                  <div className="w-full rounded-2xl border border-dashed border-border bg-white/60 p-6">
                    <Sparkles className="mx-auto mb-3 size-7 text-muted-foreground/30" />
                    <p className="text-sm font-semibold text-muted-foreground">Scores appear here</p>
                    <p className="mt-1.5 text-xs leading-5 text-muted-foreground/70">
                      Submit an answer to see your overall score, skill breakdown, and coaching feedback.
                    </p>
                  </div>
                  <div className="w-full space-y-2.5 text-left">
                    <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">What you'll see</div>
                    {["Overall score out of 100", "Clarity, Confidence, Relevance bars", "Strengths & improvement tips", "Sample stronger answer"].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-muted-foreground/70">
                        <div className="size-1.5 rounded-full bg-teal-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ══════════════════════════════════════════
          SUMMARY SCREEN
      ══════════════════════════════════════════ */}
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

function ChatBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={cn("flex min-w-0 overflow-hidden", isAssistant ? "justify-start" : "justify-end")}>
      <div
        className={cn(
          "min-w-0 max-w-[80%] break-words rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm",
          isAssistant ? "border border-teal-100 bg-teal-50 text-slate-900" : "bg-slate-950 text-white"
        )}
      >
        <div className={cn("mb-1 text-[11px] font-semibold uppercase tracking-[0.18em]", isAssistant ? "text-teal-700" : "text-slate-300")}>
          {isAssistant ? "Interviewer" : "You"}
        </div>
        <p className="whitespace-pre-line break-words">{message.content}</p>
      </div>
    </div>
  );
}