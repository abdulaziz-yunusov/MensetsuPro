"use client"
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mic, Send, StopCircle, RefreshCcw } from "lucide-react";
import Link from "next/link";


export default function AIInterviewSessionPage() {
  const [isAnswering, setIsAnswering] = useState(false);
  const [answer, setAnswer] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const totalQuestions = 3;

  const mockQuestion = "こんにちは。本日はよろしくお願いします。まずは簡単に、自己紹介をお願いします。";

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl flex flex-col min-h-[calc(100vh-8rem)]">
      
      {/* Top Bar Status */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[#1e3a8a] text-[#1e3a8a] bg-blue-50">Session Active</Badge>
          <span className="text-sm font-semibold text-muted-foreground">Frontend Engineer Demo</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-semibold text-card-foreground">Question {currentQuestion} of {totalQuestions}</span>
          <Button variant="ghost" size="sm" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50" asChild>
            <Link href="/dashboard">End Early</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        
        {/* Left Video / AI Avatar Column */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
          <Card className="bg-foreground overflow-hidden border-0 relative shadow-lg min-h-[300px] lg:min-h-0 lg:h-full flex flex-col">
            <CardContent className="p-0 flex flex-col items-center justify-center flex-1 relative z-10">
              
              {/* Fake video background grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
              
              <Avatar className="w-32 h-32 md:w-48 md:h-48 border-4 border-slate-700 mb-6 shadow-2xl relative z-10">
                <AvatarImage src="/images/ai-interviewer.png" alt="AI Interviewer" />
                <AvatarFallback className="bg-slate-800 text-slate-300 text-3xl">AI</AvatarFallback>
                
                {/* Speaking indicator generic ripple */}
                <div className="absolute inset-0 border-[3px] border-emerald-500 rounded-full animate-ping opacity-20"></div>
                <div className="absolute inset-0 border-[2px] border-emerald-400 rounded-full animate-pulse opacity-40"></div>
              </Avatar>
              
              <div className="bg-slate-800/80 backdrop-blur-sm px-4 py-1.5 rounded-full z-10">
                <span className="text-slate-200 text-sm font-medium flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  Tanaka (AI Interviewer)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Interaction Column */}
        <div className="w-full lg:w-1/2 flex flex-col bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          
          {/* Question Box */}
          <div className="p-6 bg-background border-b border-border/50">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Current Question</span>
            <p className="text-xl md:text-2xl font-bold text-foreground leading-snug">
              {mockQuestion}
            </p>
            <p className="text-sm text-muted-foreground mt-3 pt-3 border-t border-border/60">
              Translate (EN): Hello. Nice to meet you today. First, please briefly introduce yourself.
            </p>
          </div>

          {/* Answer Input Area */}
          <div className="flex-1 p-6 flex flex-col relative bg-card">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-semibold text-card-foreground">Your Answer</span>
              {isAnswering && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></div>
                  Typing
                </span>
              )}
            </div>

            <Textarea 
              placeholder="Type your response here in Japanese..."
              className="flex-1 min-h-[160px] resize-none text-base p-4 bg-background border-border focus-visible:ring-[#1e3a8a] focus-visible:border-[#1e3a8a]"
              value={answer}
              onChange={(e) => {
                setAnswer(e.target.value);
                if (e.target.value.length > 0 && !isAnswering) setIsAnswering(true);
                else if (e.target.value.length === 0 && isAnswering) setIsAnswering(false);
              }}
            />

            <div className="flex items-center justify-between mt-6">
              <Button type="button" variant="outline" className="text-muted-foreground border-border gap-2 shrink-0">
                <RefreshCcw className="w-4 h-4" />
                Skip Question
              </Button>

              <div className="flex items-center gap-3">
                <Button 
                  type="button" 
                  className={`${answer.length > 10 ? 'bg-[#1e3a8a] hover:bg-[#1e40af]' : 'bg-slate-300 text-muted-foreground cursor-not-allowed hover:bg-slate-300'} text-white gap-2 pl-6 pr-5 shrink-0 transition-colors`}
                  disabled={answer.length <= 10}
                  asChild={answer.length > 10}
                >
                  {answer.length > 10 ? (
                    <Link href="/ai-interview/results/demo">
                      Submit <Send className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>Submit <Send className="w-4 h-4" /></>
                  )}
                </Button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
