import { Metadata } from "next";
import prisma from "@/lib/prisma";
import QuestionList from "@/components/interview/question-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { DatabaseUnavailableBanner } from "@/components/layout/database-unavailable-banner";
import { isDatabaseConnectionError } from "@/lib/db-error";
import { getServerTranslation } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "Question Bank | MensetsuPro",
  description: "Browse frequently asked Japanese interview questions with tips and sample answers.",
};

export default async function QuestionsPage() {
  const { t } = await getServerTranslation();
  const session = await getServerSession(authOptions);
  let questions: any[] = [];
  let categories: Awaited<ReturnType<typeof prisma.category.findMany>> = [];
  let savedQuestionIds: string[] = [];
  let dbUnavailable = false;

  try {
    [questions, categories] = await Promise.all([
      (await prisma.question.findMany({
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      })) as any,
      prisma.category.findMany({
        where: {
          questions: {
            some: {}
          }
        }
      }),
    ]);

    if (session?.user?.id) {
      const saves = await prisma.savedQuestion.findMany({
        where: { userId: session.user.id },
        select: { questionId: true }
      });
      savedQuestionIds = saves.map(s => s.questionId);
    }
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    dbUnavailable = true;
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-7xl">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">{t("questions.title")}</h1>
          <p className="text-muted-foreground mt-2">{t("questions.subtitle")}</p>
        </div>
      </div>

      {dbUnavailable ? <DatabaseUnavailableBanner resourceName="Interview questions" /> : null}

      <QuestionList 
        questions={questions} 
        categories={categories} 
        initialSavedQuestionIds={savedQuestionIds}
        userId={session?.user?.id}
      />
    </div>
  );
}
