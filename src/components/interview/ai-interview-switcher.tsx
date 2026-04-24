"use client";

import { useState } from "react";
import AIInterviewWorkspace from "./ai-interview-workspace";
import AICodingWorkspace from "./ai-coding-workspace";
import { Bot, Code2 } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/i18n";

const switcherCopy: Record<Locale, { mock: string; coding: string }> = {
  en: {
    mock: "Behavioral Mock Interview",
    coding: "Logical Coding Test",
  },
  ru: {
    mock: "Поведенческое мок-интервью",
    coding: "Логический тест по коду",
  },
  ja: {
    mock: "行動面接の模擬練習",
    coding: "ロジカルコーディングテスト",
  },
  uz: {
    mock: "Xulq-atvor mock intervyusi",
    coding: "Mantiqiy kodlash testi",
  },
};

export default function AIInterviewSwitcher({ resumeSessionId = null }: { resumeSessionId?: string | null }) {
  const [mode, setMode] = useState<"mock" | "coding">("mock");
  const { locale } = useTranslation();
  const copy = switcherCopy[locale];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Tab bar */}
      <div className="sticky top-16 z-40 flex justify-center border-b border-border bg-card/80 backdrop-blur-md px-4 py-3 shadow-sm">
        <div className="flex gap-2 rounded-xl bg-muted p-1">
          <button
            onClick={() => setMode("mock")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === "mock"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bot className="size-4" />
            {copy.mock}
          </button>
          <button
            onClick={() => setMode("coding")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              mode === "coding"
                ? "bg-card text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-4" />
            {copy.coding}
          </button>
        </div>
      </div>

      {mode === "mock" ? <AIInterviewWorkspace resumeSessionId={resumeSessionId} /> : <AICodingWorkspace />}
    </div>
  );
}
