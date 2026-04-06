"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  Brain,
  Code2,
  CheckCircle2,
  CircleAlert,
  Play,
  RotateCcw,
  Sparkles,
  Terminal,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getCodingQuestions, submitCodingAttempt } from "@/actions/coding";

// Since types might not be generated yet, define local interfaces
interface TestCase {
  input: any[];
  expectedOutput: any;
}

interface CodingQuestion {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  testCases: TestCase[] | any;
  initialCode?: string;
  totalAttempts?: number;
  acceptanceRate?: number;
  userStatus?: "SOLVED" | "ATTEMPTED" | "TODO";
}

interface TestResult {
  input: any[];
  expected: any;
  actual: any;
  pass: boolean;
}

interface EvalOutcome {
  error: string | null;
  passed: number;
  total: number;
  results: TestResult[];
}

// Fallback hardcoded questions in case DB fetch fails (e.g. before schema push)
const fallbackQuestions: CodingQuestion[] = [
  {
    id: "fq-1",
    title: "Get Prime Numbers",
    description: "Write a function `getPrimes(n)` that returns an array of all prime numbers less than or equal to `n`.",
    difficulty: "Beginner",
    initialCode: "function getPrimes(n) {\n  // your code here\n  return [];\n}",
    testCases: [
      { input: [10], expectedOutput: [2, 3, 5, 7] },
      { input: [20], expectedOutput: [2, 3, 5, 7, 11, 13, 17, 19] },
      { input: [2], expectedOutput: [2] },
      { input: [1], expectedOutput: [] }
    ]
  },
  {
    id: "fq-2",
    title: "Two Sum",
    description: "Write a function `twoSum(nums, target)` that returns the indices of the two numbers such that they add up to `target`. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
    difficulty: "Intermediate",
    initialCode: "function twoSum(nums, target) {\n  // your code here\n  return [];\n}",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
      { input: [[3, 3], 6], expectedOutput: [0, 1] }
    ]
  },
  {
    id: "fq-3",
    title: "Reverse String",
    description: "Write a function `reverseString(str)` that reverses a string.",
    difficulty: "Beginner",
    initialCode: "function reverseString(str) {\n  // your code here\n  return str;\n}",
    testCases: [
      { input: ["hello"], expectedOutput: "olleh" },
      { input: ["MensetsuPro"], expectedOutput: "orPustesneM" },
      { input: [""], expectedOutput: "" }
    ]
  }
];

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

const evaluateUserCode = (userCode: string, testCases: TestCase[]): EvalOutcome => {
  let passed = 0;
  const results: TestResult[] = [];
  try {
    const fnMatch = userCode.match(/function\s+([a-zA-Z0-9_]+)\s*\(/);
    const varFnMatch = userCode.match(/(?:const|let|var)\s+([a-zA-Z0-9_]+)\s*=\s*(?:function|\()/);
    
    let fnName = "";
    if (fnMatch) fnName = fnMatch[1];
    else if (varFnMatch) fnName = varFnMatch[1];
    else throw new Error("Could not find a valid function definition. Please ensure you declare a function.");

    // Sandbox evaluator
    const evaluator = new Function(`
      ${userCode};
      if (typeof ${fnName} !== 'function') throw new Error('${fnName} is not a function');
      return ${fnName}.apply(null, arguments);
    `);

    for (const tc of testCases) {
      const actual = evaluator.apply(null, tc.input);
      const isPass = JSON.stringify(actual) === JSON.stringify(tc.expectedOutput);
      if (isPass) passed++;
      results.push({ input: tc.input, expected: tc.expectedOutput, actual, pass: isPass });
    }
  } catch (e: any) {
    return { error: e.message || String(e), passed: 0, total: testCases.length, results: [] };
  }

  return { error: null, passed, total: testCases.length, results };
};

export default function AICodingWorkspace() {
  const [screen, setScreen] = useState<"setup" | "session" | "summary">("setup");
  const [questions, setQuestions] = useState<CodingQuestion[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [userCode, setUserCode] = useState("");
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  // Track if we have already auto-selected a question via URL params
  const [hasAutoSelected, setHasAutoSelected] = useState<boolean>(false);
  
  const [evalOutcome, setEvalOutcome] = useState<EvalOutcome | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<string>("");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await getCodingQuestions();
        if (res.success && res.questions && res.questions.length > 0) {
          setQuestions(res.questions);
        } else {
          setQuestions(fallbackQuestions);
        }
      } catch (err) {
        setQuestions(fallbackQuestions);
      } finally {
        setIsLoading(false);
      }
    }
    fetchQuestions();
  }, []);

  // Handle deep-linking from dashboard (e.g. ?challengeId=xyz)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasAutoSelected && questions.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const challengeId = params.get("challengeId");
      
      if (challengeId) {
        const q = questions.find((c) => c.id === challengeId);
        if (q) {
          setSelectedQuestionId(q.id);
          setUserCode(q.initialCode || "");
          setEvalOutcome(null);
          setSubmissionResult("");
          setStartedAt(Date.now());
          setElapsedSeconds(0);
          setScreen("session");
        }
      }
      setHasAutoSelected(true);
    }
  }, [questions, hasAutoSelected]);

  useEffect(() => {
    if (screen !== "session" || !startedAt) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [screen, startedAt]);

  const activeQuestion = questions.find(q => q.id === selectedQuestionId);

  const handleRunCode = () => {
    if (!activeQuestion) return;
    const testCases = typeof activeQuestion.testCases === "string" 
      ? JSON.parse(activeQuestion.testCases) 
      : activeQuestion.testCases;
      
    const outcome = evaluateUserCode(userCode, testCases || []);
    setEvalOutcome(outcome);
  };

  const handleSubmit = async () => {
    if (!activeQuestion || !evalOutcome) return;
    setIsSubmitting(true);
    const status = evalOutcome.passed === evalOutcome.total ? "PASS" : "FAIL";

    try {
      const res = await submitCodingAttempt(activeQuestion.id, userCode, status);
      if (res.success) {
        setSubmissionResult("Attempt saved successfully!");
      } else {
        setSubmissionResult(res.error || "Failed to save attempt");
      }
    } catch (e) {
      setSubmissionResult("Failed to save attempt");
    } finally {
      setIsSubmitting(false);
      setScreen("summary");
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">Loading technical questions...</div>;
  }

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,#f8fafc_0%,#f0f9ff_48%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(14,165,233,0.12),_transparent_30%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge className="bg-sky-700 text-white hover:bg-sky-700">Coding Test Mode</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Practice algorithm and logic questions.
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              Write JavaScript code to solve the challenge. Your code will be automatically checked against our test cases.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 md:min-w-[16rem]">
            <StatPill icon={Code2} label="Evaluator" value="JS Engine" />
            <StatPill icon={AlarmClock} label="Timer" value={screen === "summary" ? formatDuration(elapsedSeconds) : "Live session"} />
          </div>
        </div>

        {screen === "setup" ? (
          <Card className="border-border bg-card shadow-xl shadow-slate-200/70 w-full overflow-hidden">
            <CardHeader className="border-b border-border/50 bg-background/80 flex flex-col md:flex-row items-start md:items-center justify-between py-6">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Terminal className="size-5 text-sky-700" />
                  Coding Challenges
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-1">Select a challenge below to open the IDE and begin.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs uppercase bg-card text-muted-foreground border-b border-border/50">
                    <tr>
                      <th className="px-6 py-4 font-medium">Status</th>
                      <th className="px-6 py-4 font-medium">Title</th>
                      <th className="px-6 py-4 font-medium">Acceptance</th>
                      <th className="px-6 py-4 font-medium">Difficulty</th>
                      <th className="px-6 py-4 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {questions.map((q, idx) => {
                      const difficultyColor = 
                        q.difficulty.toLowerCase() === "beginner" || q.difficulty.toLowerCase() === "easy" ? "text-emerald-600" :
                        q.difficulty.toLowerCase() === "intermediate" || q.difficulty.toLowerCase() === "medium" ? "text-amber-600" :
                        "text-rose-600";
                        
                      const acceptance = (q.totalAttempts || 0) > 0 
                        ? `${(q.acceptanceRate || 0).toFixed(1)}%` 
                        : "0%";

                      return (
                        <tr 
                          key={q.id} 
                          className="hover:bg-background transition-colors group cursor-pointer"
                          onClick={() => {
                            setSelectedQuestionId(q.id);
                            // Set a small timeout so state updates first, then starts
                            setTimeout(() => {
                              setUserCode(q.initialCode || "");
                              setEvalOutcome(null);
                              setSubmissionResult("");
                              setStartedAt(Date.now());
                              setElapsedSeconds(0);
                              setScreen("session");
                            }, 50);
                          }}
                        >
                          <td className="px-6 py-4 text-muted-foreground">
                            <div className="flex items-center justify-center w-6">
                              {q.userStatus === "SOLVED" ? (
                                <CheckCircle2 className="size-5 text-emerald-500" />
                              ) : q.userStatus === "ATTEMPTED" ? (
                                <CircleAlert className="size-5 text-amber-500" />
                              ) : (
                                <span className="text-slate-300 font-medium">-</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-medium text-foreground group-hover:text-sky-700 transition">
                            {q.title}
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-card-foreground font-medium">{acceptance}</span>
                          </td>
                          <td className={`px-6 py-4 font-medium ${difficultyColor}`}>
                            {q.difficulty}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="opacity-0 group-hover:opacity-100 text-sky-700 flex items-center justify-end font-semibold transition">
                              Solve <Play className="ml-1.5 size-3.5 fill-sky-700" />
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {questions.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                          No coding challenges available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {screen === "session" && activeQuestion ? (
          <div className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
            <Card className="flex flex-col overflow-hidden border-transparent bg-slate-950 text-white shadow-2xl shadow-slate-300/60 max-h-[800px]">
              <CardContent className="flex-1 overflow-y-auto px-6 py-8">
                <div className="mb-4">
                  <Badge className="bg-card/10 text-sky-200 hover:bg-card/10 mb-2">{activeQuestion.difficulty}</Badge>
                  <h2 className="text-2xl font-bold">{activeQuestion.title}</h2>
                </div>
                <div className="mt-4 text-sm leading-relaxed text-slate-300 whitespace-pre-wrap">
                  {activeQuestion.description}
                </div>
                
                {evalOutcome && (
                  <div className="mt-8 rounded-2xl bg-card/10 p-5">
                    <h3 className="text-lg font-semibold mb-3">Test Results</h3>
                    {evalOutcome.error ? (
                      <div className="rounded-xl bg-rose-500/20 text-rose-200 p-4 border border-rose-500/30 text-sm font-mono whitespace-pre-wrap">
                        {evalOutcome.error}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Progress value={(evalOutcome.passed / evalOutcome.total) * 100} className="flex-1 h-3 gap-0">
                            <ProgressTrack className="h-full rounded-full bg-card/10">
                              <ProgressIndicator className={evalOutcome.passed === evalOutcome.total ? "bg-emerald-500" : "bg-amber-500"} />
                            </ProgressTrack>
                          </Progress>
                          <span className="text-xs font-bold w-12 text-right">{evalOutcome.passed} / {evalOutcome.total}</span>
                        </div>
                        
                        <div className="space-y-2">
                          {evalOutcome.results.map((r, idx) => (
                            <div key={idx} className={cn("rounded-lg border p-3 border-white/10", r.pass ? "bg-emerald-500/10" : "bg-rose-500/10")}>
                               <div className="flex items-center gap-2 mb-2 font-medium text-xs uppercase tracking-wider text-muted-foreground">
                                 {r.pass ? <CheckCircle2 className="size-4 text-emerald-400" /> : <CircleAlert className="size-4 text-rose-400" />}
                                 Test Case {idx + 1}
                               </div>
                               <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm font-mono">
                                 <span className="text-muted-foreground">Input:</span><span className="text-slate-300">{JSON.stringify(r.input)}</span>
                                 <span className="text-muted-foreground">Expected:</span><span className="text-slate-300">{JSON.stringify(r.expected)}</span>
                                 <span className="text-muted-foreground">Output:</span><span className={r.pass ? "text-emerald-300" : "text-rose-300"}>{JSON.stringify(r.actual)}</span>
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex flex-col border-white/70 bg-card text-foreground shadow-xl shadow-slate-200/70">
               <CardHeader className="border-b border-border/50 py-3">
                 <CardTitle className="flex items-center gap-2 text-sm font-medium"><Code2 className="size-4 text-sky-700" /> Code Editor (Javascript)</CardTitle>
               </CardHeader>
               <CardContent className="flex-1 p-0 relative">
                 <Textarea 
                   value={userCode}
                   onChange={e => setUserCode(e.target.value)}
                   className="h-full min-h-[500px] w-full resize-none rounded-none border-0 font-mono text-[14px] leading-relaxed p-4 focus-visible:ring-0 focus-visible:ring-offset-0 bg-[#1e1e1e] text-[#d4d4d4]"
                   placeholder="// Write your Javascript code here..."
                   spellCheck={false}
                 />
               </CardContent>
               <CardFooter className="flex items-center justify-between border-t border-border/50 bg-background py-3 px-4">
                  <div className="text-xs text-muted-foreground font-medium">Auto-save off | Local Sandbox</div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="h-9 px-4 gap-2 border-sky-200 text-sky-700 hover:bg-sky-50" onClick={handleRunCode}>
                      <Play className="size-3.5" fill="currentColor" /> Run Code
                    </Button>
                    <Button className="h-9 px-4 bg-sky-700 text-white hover:bg-sky-800" disabled={!evalOutcome || isSubmitting} onClick={handleSubmit}>
                      {isSubmitting ? "Saving..." : "Submit Answer"}
                    </Button>
                  </div>
               </CardFooter>
            </Card>
          </div>
        ) : null}

        {screen === "summary" && activeQuestion && evalOutcome ? (
          <div className="max-w-3xl mx-auto">
            <Card className="overflow-hidden border-transparent bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
              <CardContent className="grid gap-6 px-6 py-8 md:px-8">
                <div className="text-center">
                  <Badge className={evalOutcome.passed === evalOutcome.total ? "bg-emerald-500 text-emerald-950 hover:bg-emerald-400" : "bg-amber-500 text-amber-950 hover:bg-amber-400"}>
                    {evalOutcome.passed === evalOutcome.total ? "Passed!" : "Attempt Failed"}
                  </Badge>
                  <h2 className="mt-6 text-3xl font-bold tracking-tight">Coding Practice Summary</h2>
                  <p className="mt-3 text-sm leading-6 text-slate-300">{submissionResult}</p>
                </div>

                <div className="grid gap-4 mt-4 sm:grid-cols-3">
                   <div className="rounded-3xl border border-white/10 bg-card/6 p-4 text-center">
                     <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Total Run Time</div>
                     <div className="mt-2 text-xl font-semibold text-white">{formatDuration(elapsedSeconds)}</div>
                   </div>
                   <div className="rounded-3xl border border-white/10 bg-card/6 p-4 text-center">
                     <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Difficulty</div>
                     <div className="mt-2 text-xl font-semibold text-white">{activeQuestion.difficulty}</div>
                   </div>
                   <div className="rounded-3xl border border-white/10 bg-card/6 p-4 text-center">
                     <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Test Cases</div>
                     <div className="mt-2 text-xl font-semibold text-white">{evalOutcome.passed} / {evalOutcome.total}</div>
                   </div>
                </div>

                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Button 
                    variant="outline" 
                    className="border-white/20 text-black hover:bg-card/90" 
                    onClick={() => {
                      setEvalOutcome(null);
                      setSubmissionResult("");
                      setStartedAt(Date.now());
                      setElapsedSeconds(0);
                      setScreen("session");
                    }}
                  >
                    <RotateCcw className="mr-2 size-4" /> Try Again
                  </Button>
                  <Button variant="outline" className="border-white/20 text-black hover:bg-card/90" onClick={() => setScreen("setup")}>Try Another Question</Button>
                  <Button asChild className="bg-sky-600 text-white hover:bg-sky-500"><Link href="/dashboard">Back to Dashboard</Link></Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

      </div>
    </div>
  );
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-card/75 px-4 py-3 shadow-sm shadow-slate-200/70">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        <Icon className="size-3.5 text-sky-700" />{label}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}
