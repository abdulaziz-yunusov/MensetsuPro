import { Suspense } from "react";
import type { Metadata } from "next";
import { getCodingQuestions } from "@/actions/coding";
import Link from "next/link";
import { Code2, Target, CheckCircle2 } from "lucide-react";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";
import { localizeDifficulty } from "@/lib/i18n-ui";

const codingAttemptsCopy: Record<Locale, Record<string, string>> = {
  en: {
    loadFailed: "Failed to load questions.",
    noQuestions: "No coding questions are currently available on the platform.",
    totalChallenges: "Total Challenges",
    solved: "Successfully Solved",
    attemptedFailed: "Attempted (Failed)",
    challengeDirectory: "Challenge Directory",
    solvedLegend: "Solved",
    attemptedLegend: "Attempted",
    unsolvedLegend: "Unsolved",
    title: "Solved Code Questions",
    subtitle: "Track your algorithmic progress and review past code submissions.",
  },
  ru: {
    loadFailed: "Не удалось загрузить вопросы.",
    noQuestions: "На платформе пока нет доступных задач по коду.",
    totalChallenges: "Всего задач",
    solved: "Успешно решено",
    attemptedFailed: "Попытки без решения",
    challengeDirectory: "Каталог задач",
    solvedLegend: "Решено",
    attemptedLegend: "Попытка",
    unsolvedLegend: "Не решено",
    title: "Решенные задачи по коду",
    subtitle: "Отслеживайте прогресс по алгоритмам и просматривайте прошлые отправки.",
  },
  ja: {
    loadFailed: "質問の読み込みに失敗しました。",
    noQuestions: "現在このプラットフォームで利用できるコーディング問題はありません。",
    totalChallenges: "総問題数",
    solved: "解決済み",
    attemptedFailed: "挑戦済み（未達成）",
    challengeDirectory: "問題一覧",
    solvedLegend: "解決済み",
    attemptedLegend: "挑戦済み",
    unsolvedLegend: "未着手",
    title: "解いたコード問題",
    subtitle: "アルゴリズムの進捗を追跡し、過去の提出を見直せます。",
  },
  uz: {
    loadFailed: "Savollarni yuklab bo'lmadi.",
    noQuestions: "Platformada hozircha kodlash savollari mavjud emas.",
    totalChallenges: "Jami topshiriqlar",
    solved: "Muvaffaqiyatli yechilgan",
    attemptedFailed: "Urinilgan (yechilmagan)",
    challengeDirectory: "Topshiriqlar katalogi",
    solvedLegend: "Yechilgan",
    attemptedLegend: "Urinilgan",
    unsolvedLegend: "Yechilmagan",
    title: "Yechilgan kod savollari",
    subtitle: "Algoritmik jarayoningizni kuzating va avvalgi topshiriqlarni ko'rib chiqing.",
  },
};

const codingAttemptsMetadata: Record<Locale, Metadata> = {
  en: {
    title: "Solved Code Questions | MensetsuPro",
    description: "Track your progress across algorithmic challenges.",
  },
  ru: {
    title: "Решенные задачи по коду | MensetsuPro",
    description: "Отслеживайте прогресс по алгоритмическим задачам.",
  },
  ja: {
    title: "解いたコード問題 | MensetsuPro",
    description: "アルゴリズム課題の進捗を追跡できます。",
  },
  uz: {
    title: "Yechilgan kod savollari | MensetsuPro",
    description: "Algoritmik topshiriqlar bo'yicha jarayoningizni kuzating.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerTranslation();
  return codingAttemptsMetadata[locale];
}

async function CodingGrid({ locale, copy }: { locale: Locale; copy: Record<string, string> }) {
  const { success, questions, error } = await getCodingQuestions();

  if (!success) {
    return <div className="text-rose-500 rounded-md bg-rose-50 p-4 border border-rose-200">{error || copy.loadFailed}</div>;
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-card rounded-xl border border-border border-dashed">
        <Code2 className="mb-4 h-12 w-12 text-slate-300" />
        <p>{copy.noQuestions}</p>
      </div>
    );
  }

  const solvedCount = questions.filter((q: any) => q.userStatus === "SOLVED").length;
  const attemptedCount = questions.filter((q: any) => q.userStatus === "ATTEMPTED").length;

  return (
    <div className="space-y-8">
      {/* Progress Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{copy.totalChallenges}</p>
            <p className="text-3xl font-bold text-foreground mt-1">{questions.length}</p>
          </div>
          <div className="bg-background p-3 rounded-lg"><Code2 className="w-6 h-6 text-muted-foreground" /></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{copy.solved}</p>
            <p className="text-3xl font-bold text-emerald-600 mt-1">{solvedCount}</p>
          </div>
          <div className="bg-emerald-50 p-3 rounded-lg"><CheckCircle2 className="w-6 h-6 text-emerald-500" /></div>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{copy.attemptedFailed}</p>
            <p className="text-3xl font-bold text-rose-600 mt-1">{attemptedCount}</p>
          </div>
          <div className="bg-rose-50 p-3 rounded-lg"><Target className="w-6 h-6 text-rose-500" /></div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-foreground mb-6">{copy.challengeDirectory}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
          {questions.map((q: any, idx: number) => {
            const shortCode = `Q${String(idx + 1).padStart(3, '0')}`;
            
            let colorClasses = "bg-card border border-border text-muted-foreground hover:border-border hover:bg-background hover:text-card-foreground shadow-sm";
            let targetHref = `/ai-interview?challengeId=${q.id}`;
            
            if (q.userStatus === "SOLVED") {
              colorClasses = "bg-emerald-500 border border-emerald-600 text-white shadow hover:bg-emerald-600";
              targetHref = `/dashboard/coding-attempts/${q.id}`;
            } else if (q.userStatus === "ATTEMPTED") {
              colorClasses = "bg-rose-500 border border-rose-600 text-white shadow hover:bg-rose-600";
              targetHref = `/dashboard/coding-attempts/${q.id}`;
            }

            return (
              <Link 
                key={q.id} 
                href={targetHref}
                title={`${q.title} (${localizeDifficulty(locale, q.difficulty)})`}
                className={`flex items-center justify-center p-3 rounded-md text-xs font-mono font-bold transition-all ${colorClasses}`}
              >
                {shortCode}
              </Link>
            )
          })}
        </div>
        <div className="mt-8 pt-6 border-t border-border/50 flex flex-wrap gap-5 text-sm font-medium text-muted-foreground justify-center sm:justify-start">
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-emerald-500 border border-emerald-600 shadow-sm"></div> {copy.solvedLegend}</div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-rose-500 border border-rose-600 shadow-sm"></div> {copy.attemptedLegend}</div>
          <div className="flex items-center gap-2"><div className="w-3.5 h-3.5 rounded-sm bg-card border border-border shadow-sm"></div> {copy.unsolvedLegend}</div>
        </div>
      </div>
    </div>
  );
}

export default async function CodingAttemptsPage() {
  const { locale } = await getServerTranslation();
  const copy = codingAttemptsCopy[locale];
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">{copy.title}</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          {copy.subtitle}
        </p>
      </div>

      <Suspense fallback={<div className="animate-pulse flex gap-4 flex-wrap"><div className="h-28 w-full bg-muted rounded-xl" /><div className="h-64 w-full bg-muted rounded-xl" /></div>}>
        <CodingGrid locale={locale} copy={copy} />
      </Suspense>
    </div>
  );
}
