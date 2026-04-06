import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, ExternalLink, Trash2 } from "lucide-react";
import { toggleSaveQuestion } from "@/lib/actions/questions";
import { revalidatePath } from "next/cache";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";
import { localizeCategory } from "@/lib/i18n-ui";

const savedQuestionsCopy: Record<
  Locale,
  {
    title: string;
    subtitle: string;
    empty: string;
    browseBank: string;
    savedOn: string;
    reviewAnswer: string;
  }
> = {
  en: {
    title: "Saved Questions",
    subtitle: "Questions you've bookmarked to review or practice later.",
    empty: "You haven't saved any questions yet.",
    browseBank: "Browse Question Bank",
    savedOn: "Saved on",
    reviewAnswer: "Review Answer",
  },
  ru: {
    title: "Сохраненные вопросы",
    subtitle: "Вопросы, которые вы сохранили для повторения или практики позже.",
    empty: "Вы пока не сохранили ни одного вопроса.",
    browseBank: "Открыть банк вопросов",
    savedOn: "Сохранено",
    reviewAnswer: "Посмотреть ответ",
  },
  ja: {
    title: "保存した質問",
    subtitle: "後で見直したり練習したりするために保存した質問です。",
    empty: "保存した質問はまだありません。",
    browseBank: "質問バンクを見る",
    savedOn: "保存日",
    reviewAnswer: "回答を見る",
  },
  uz: {
    title: "Saqlangan savollar",
    subtitle: "Keyinroq ko'rib chiqish yoki mashq qilish uchun saqlangan savollar.",
    empty: "Hali hech qanday savol saqlanmagan.",
    browseBank: "Savollar bankini ko'rish",
    savedOn: "Saqlangan sana",
    reviewAnswer: "Javobni ko'rish",
  },
};

async function handleUnsave(formData: FormData) {
  "use server";
  const questionId = formData.get("questionId") as string;
  if (questionId) {
    await toggleSaveQuestion(questionId);
    revalidatePath("/dashboard/saved-questions");
  }
}

export default async function SavedQuestionsPage() {
  const { locale } = await getServerTranslation();
  const copy = savedQuestionsCopy[locale];
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const saves = await prisma.savedQuestion.findMany({
    where: { userId: session.user.id },
    include: {
      question: {
        include: { category: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });


  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{copy.title}</h2>
        <p className="text-muted-foreground mt-1">
          {copy.subtitle}
        </p>
      </div>

      <div className="grid gap-4">
        {saves.length === 0 ? (
          <Card className="bg-background border-dashed">
            <CardContent className="flex flex-col items-center justify-center p-12 text-center">
              <Bookmark className="w-12 h-12 text-slate-300 mb-4" />
              <p className="text-lg text-muted-foreground font-medium">{copy.empty}</p>
              <Button asChild className="mt-6" variant="outline">
                <Link href="/questions">{copy.browseBank}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          saves.map((save) => (
            <Card key={save.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1 flex-1">
                  <div className="text-sm font-medium text-emerald-600 mb-1">{localizeCategory(locale, save.question.category.name)}</div>
                  <h3 className="text-lg font-bold leading-snug">{save.question.title}</h3>
                  <div className="text-sm text-muted-foreground mt-2">{copy.savedOn} {new Date(save.createdAt).toLocaleDateString(locale)}</div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                  <Button asChild variant="secondary" className="flex-1">
                    <Link href={`/questions/${save.questionId}`}>
                      {copy.reviewAnswer} <ExternalLink className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                  
                   <form action={handleUnsave}>
                    <input type="hidden" name="questionId" value={save.questionId} />
                    <Button type="submit" variant="outline" size="icon" className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-100 h-10 w-10">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
