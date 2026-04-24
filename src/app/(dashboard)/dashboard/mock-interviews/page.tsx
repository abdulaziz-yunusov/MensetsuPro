import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { History, Target, Calendar, ArrowRight } from "lucide-react";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";
import { localizeDifficulty } from "@/lib/i18n-ui";

export default async function MockInterviewsPage() {
  const { locale } = await getServerTranslation();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const mockInterviewCopy: Record<Locale, Record<string, string>> = {
    en: {
      title: "Interview History",
      subtitle: "Review your past mock interviews and track your AI feedback.",
      newInterview: "New Mock Interview",
      empty: "No interviews recorded yet.",
      startFirst: "Start your first Mock Interview",
      analyzed: "You analyzed",
      questions: "questions during this session.",
      viewFeedback: "View Feedback",
    },
    ru: {
      title: "История интервью",
      subtitle: "Просматривайте прошлые мок-интервью и отслеживайте AI-обратную связь.",
      newInterview: "Новое мок-интервью",
      empty: "Пока нет записанных интервью.",
      startFirst: "Начать первое мок-интервью",
      analyzed: "Во время этой сессии вы разобрали",
      questions: "вопросов.",
      viewFeedback: "Посмотреть отзыв",
    },
    ja: {
      title: "面接履歴",
      subtitle: "過去の模擬面接を見直し、AIフィードバックを追跡できます。",
      newInterview: "新しい模擬面接",
      empty: "まだ面接履歴はありません。",
      startFirst: "最初の模擬面接を始める",
      analyzed: "このセッションでは",
      questions: "問を分析しました。",
      viewFeedback: "フィードバックを見る",
    },
    uz: {
      title: "Intervyu tarixi",
      subtitle: "Avvalgi mock intervyularni ko'rib chiqing va AI fikrlarini kuzating.",
      newInterview: "Yangi mock intervyu",
      empty: "Hali intervyular yozib olinmagan.",
      startFirst: "Birinchi mock intervyuni boshlash",
      analyzed: "Bu sessiyada siz",
      questions: "ta savolni tahlil qildingiz.",
      viewFeedback: "Fikrlarni ko'rish",
    },
  };
  const copy = mockInterviewCopy[locale];

  const interviews = await prisma.mockInterview.findMany({
    where: {
      userId: session.user.id,
      score: {
        not: null,
      },
    },
    orderBy: { completedAt: "desc" },
    include: { logs: true }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="text-muted-foreground mt-1">
            {copy.subtitle}
          </p>
        </div>
        <Button asChild>
          <Link href="/ai-interview">{copy.newInterview}</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {interviews.length === 0 && (
          <Card className="bg-background border-dashed col-span-full">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <History className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg text-muted-foreground font-medium">{copy.empty}</p>
              <Button asChild className="mt-6" variant="default">
                <Link href="/ai-interview">{copy.startFirst}</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {interviews.map((interview) => (
          <Card key={interview.id} className="flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 hover:bg-blue-100">
                  {localizeDifficulty(locale, interview.difficulty)}
                </Badge>
                {interview.score !== null && (
                  <Badge variant={interview.score >= 80 ? "default" : interview.score >= 60 ? "secondary" : "destructive"}>
                    {interview.score}/100
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl flex items-center">
                <Target className="w-5 h-5 mr-2 text-muted-foreground" /> {interview.jobRole}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Calendar className="w-4 h-4 mr-2" />
                {new Date(interview.completedAt).toLocaleDateString(locale)}
              </div>
              <p className="text-sm text-muted-foreground">
                {copy.analyzed} {interview.logs.length} {copy.questions}
              </p>
            </CardContent>
            <div className="p-4 bg-background mt-auto border-t">
              <Button asChild variant="outline" className="w-full">
                 <Link href={`/ai-interview/results/${interview.id}`}>
                   {copy.viewFeedback} <ArrowRight className="ml-2 w-4 h-4" />
                 </Link>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
