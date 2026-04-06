import { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, ArrowLeft, CheckCircle2, ChevronRight, MessageSquare, Star, Target } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interview Results | MensetsuPro",
  description: "Detailed AI feedback for your mock interview session.",
};

export default function AIInterviewResultsPage() {
  const score = 78;
  const metrics = [
    { label: "Clarity", value: 85, color: "bg-emerald-500" },
    { label: "Grammar & Vocab", value: 70, color: "bg-amber-500" },
    { label: "Relevance", value: 90, color: "bg-emerald-500" },
    { label: "Politeness (Keigo)", value: 65, color: "bg-rose-500" },
    { label: "Confidence", value: 80, color: "bg-emerald-500" }
  ];

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
      
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Mock Interviews</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">Session Results</span>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight flex items-center gap-3">
            Interview Feedback
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 text-sm px-2.5 py-0.5 mt-1">Completed</Badge>
          </h1>
          <p className="text-muted-foreground mt-2">Target Role: Frontend Engineer • Difficulty: Intermediate</p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Link href="/dashboard" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
          </Link>
          <Link href="/ai-interview" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] bg-[#1e3a8a] text-white hover:bg-[#1e40af] h-9 px-4 text-sm font-medium">
            Practice Again
          </Link>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column - Score Overview */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="border-border shadow-sm overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 to-[#1e3a8a]"></div>
            <CardHeader className="text-center pt-8 pb-2">
              <CardTitle className="text-lg text-muted-foreground font-medium">Overall Score</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center pb-8">
              <div className="relative flex items-center justify-center w-32 h-32 my-4">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="#1e3a8a" 
                    strokeWidth="8" 
                    strokeDasharray={`${(score / 100) * 283} 283`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-foreground">{score}</span>
                  <span className="text-sm text-muted-foreground font-medium">/ 100</span>
                </div>
              </div>
              <p className="text-base font-semibold text-card-foreground mt-2">Good, but has room to grow.</p>
              <p className="text-sm text-muted-foreground text-center mt-2 px-4">Your technical answers are solid, but you need to improve your formal Keigo usage.</p>
            </CardContent>
          </Card>

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4 text-[#ea580c]" />
                Detailed Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              {metrics.map((metric, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-card-foreground">{metric.label}</span>
                    <span className="text-muted-foreground">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2">
                    <ProgressTrack>
                      <ProgressIndicator className={metric.color} />
                    </ProgressTrack>
                  </Progress>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Question Breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <Card className="border-border">
            <CardHeader className="bg-background border-b border-border/50">
              <CardTitle className="text-lg">Question by Question Breakdown</CardTitle>
              <CardDescription>Review exactly what you said and how to improve.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              
              {/* Question Item */}
              <div className="p-6 border-b border-border/50 last:border-0">
                <div className="flex justify-between mb-4">
                  <h3 className="font-bold text-foreground text-lg">Q1: 自己紹介をお願いします。</h3>
                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">85/100</Badge>
                </div>
                
                <div className="bg-background p-4 rounded-lg border border-border relative mb-6">
                  <span className="absolute -top-3 left-4 bg-card px-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Your Answer</span>
                  <p className="text-sm leading-relaxed text-card-foreground">初めまして、〇〇です。現在〇〇大学で情報工学を専攻しています。Reactを用いたチーム開発の経験があり、UI/UXの改善に貢献しました。本日はよろしくお願いします。</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-emerald-50/50 p-4 rounded-lg border border-emerald-100">
                    <h4 className="flex items-center gap-2 font-semibold text-emerald-800 text-sm mb-2">
                      <CheckCircle2 className="w-4 h-4" /> What you did well
                    </h4>
                    <p className="text-sm text-emerald-700">
                      Clear and concise structure. You effectively highlighted your technical stack (React) and the impact of your work (UI/UX improvement).
                    </p>
                  </div>
                  
                  <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-100">
                    <h4 className="flex items-center gap-2 font-semibold text-amber-800 text-sm mb-2">
                      <AlertCircle className="w-4 h-4" /> Area for improvement
                    </h4>
                    <p className="text-sm text-amber-700">
                      "〇〇です" should be "〇〇と申します" in a formal interview setting. Politeness level (Keigo) needs to be upgraded.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border/50">
                  <h4 className="flex items-center gap-2 font-semibold text-foreground text-sm mb-3">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    AI Suggested Alternative
                  </h4>
                  <p className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 text-sm text-blue-900 leading-relaxed italic">「初めまして、〇〇と申します。現在〇〇大学で情報工学を専攻しており、主にフロントエンド開発について学んでいます。これまでにReactを用いたチーム開発の経験があり、UI/UXの改善に貢献しました。本日はよろしくお願いいたします。」</p>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
