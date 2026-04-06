import { Metadata } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Bookmark, Clock, ExternalLink, Library, PencilLine } from "lucide-react";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";
import { localizeCategory, localizeDifficulty, localizeMaterialType } from "@/lib/i18n-ui";

export const metadata: Metadata = {
  title: "Dashboard | MensetsuPro",
  description: "Manage your interactive interview preparation and track your progress.",
};

const dashboardPageCopy: Record<
  Locale,
  {
    target: string;
    levelNotSet: string;
    student: string;
    platformStats: string;
    readinessScore: string;
    threadsStarted: string;
    repliesGiven: string;
    savedMaterials: string;
    articlesWritten: string;
    editProfile: string;
    welcomeBack: (name: string) => string;
    overviewSubtitle: string;
    noSavedQuestions: string;
    savedOn: string;
    browseMoreQuestions: string;
    browseQuestionBank: string;
    aiCompleted: string;
    viewDetailedFeedback: string;
    startNewInterview: string;
    materialsEmptyTitle: string;
    materialsEmptyBody: string;
    exploreMaterials: string;
    openMaterial: string;
    viewAllSavedMaterials: string;
    shareExperience: string;
    shareExperienceBody: string;
    writeBlogPost: string;
    published: string;
    draft: string;
    updated: string;
    viewArticle: string;
    manageMyArticles: string;
    writeNewArticle: string;
    defaultMaterialDescription: string;
    defaultBlogDescription: string;
  }
> = {
  en: {
    target: "Target",
    levelNotSet: "Level not set",
    student: "Student",
    platformStats: "Platform Stats",
    readinessScore: "Readiness Score",
    threadsStarted: "Threads Started",
    repliesGiven: "Replies Given",
    savedMaterials: "Saved Materials",
    articlesWritten: "Articles Written",
    editProfile: "Edit Profile",
    welcomeBack: (name) => `Welcome back, ${name}`,
    overviewSubtitle: "Here is the detailed overview of your preparation progress.",
    savedOn: "Saved on",
    browseMoreQuestions: "Browse more questions",
    browseQuestionBank: "Browse Question Bank",
    aiCompleted: "AI Completed",
    viewDetailedFeedback: "View Detailed Feedback",
    startNewInterview: "Start New Interview",
    noSavedQuestions: "You haven't saved any questions yet.",
    materialsEmptyTitle: "No materials bookmarked yet",
    materialsEmptyBody: "Save helpful videos, books, and articles to your bookmarks to access them easily during your study sessions.",
    exploreMaterials: "Explore Materials",
    openMaterial: "Open Material",
    viewAllSavedMaterials: "View All Saved Materials",
    shareExperience: "Share your experience",
    shareExperienceBody: "Got an interview experience to share? Help the community by writing a blog post about what you learned.",
    writeBlogPost: "Write a Blog Post",
    published: "Published",
    draft: "Draft",
    updated: "Updated",
    viewArticle: "View Article",
    manageMyArticles: "Manage My Articles",
    writeNewArticle: "Write New Article",
    defaultMaterialDescription: "A saved learning resource ready for your next study session.",
    defaultBlogDescription: "Your article draft is ready for the next revision.",
  },
  ru: {
    target: "Цель",
    levelNotSet: "Уровень не указан",
    student: "Студент",
    platformStats: "Статистика платформы",
    readinessScore: "Индекс готовности",
    threadsStarted: "Создано тем",
    repliesGiven: "Ответов дано",
    savedMaterials: "Сохраненные материалы",
    articlesWritten: "Написано статей",
    editProfile: "Редактировать профиль",
    welcomeBack: (name) => `С возвращением, ${name}`,
    overviewSubtitle: "Здесь показан подробный обзор вашего прогресса подготовки.",
    savedOn: "Сохранено",
    browseMoreQuestions: "Открыть еще вопросы",
    browseQuestionBank: "Открыть банк вопросов",
    aiCompleted: "AI завершено",
    viewDetailedFeedback: "Посмотреть подробный отзыв",
    startNewInterview: "Начать новое интервью",
    noSavedQuestions: "Вы пока не сохранили ни одного вопроса.",
    materialsEmptyTitle: "Материалы пока не сохранены",
    materialsEmptyBody: "Сохраняйте полезные видео, книги и статьи, чтобы быстро возвращаться к ним во время подготовки.",
    exploreMaterials: "Открыть материалы",
    openMaterial: "Открыть материал",
    viewAllSavedMaterials: "Все сохраненные материалы",
    shareExperience: "Поделитесь опытом",
    shareExperienceBody: "Если у вас был интересный опыт интервью, оформите его в виде статьи для сообщества.",
    writeBlogPost: "Написать статью",
    published: "Опубликовано",
    draft: "Черновик",
    updated: "Обновлено",
    viewArticle: "Открыть статью",
    manageMyArticles: "Управлять статьями",
    writeNewArticle: "Новая статья",
    defaultMaterialDescription: "Сохраненный учебный материал готов к следующей сессии подготовки.",
    defaultBlogDescription: "Черновик статьи готов к следующей доработке.",
  },
  ja: {
    target: "目標",
    levelNotSet: "レベル未設定",
    student: "学生",
    platformStats: "プラットフォーム統計",
    readinessScore: "準備スコア",
    threadsStarted: "開始したスレッド",
    repliesGiven: "投稿した返信",
    savedMaterials: "保存した教材",
    articlesWritten: "書いた記事",
    editProfile: "プロフィールを編集",
    welcomeBack: (name) => `おかえりなさい、${name}`,
    overviewSubtitle: "現在の準備状況を詳しく確認できます。",
    savedOn: "保存日",
    browseMoreQuestions: "さらに質問を見る",
    browseQuestionBank: "質問バンクを見る",
    aiCompleted: "AI完了",
    viewDetailedFeedback: "詳細フィードバックを見る",
    startNewInterview: "新しい面接を始める",
    noSavedQuestions: "保存した質問はまだありません。",
    materialsEmptyTitle: "保存した教材はまだありません",
    materialsEmptyBody: "役立つ動画や本、記事を保存しておくと学習中にすぐ見返せます。",
    exploreMaterials: "教材を見る",
    openMaterial: "教材を開く",
    viewAllSavedMaterials: "保存した教材をすべて見る",
    shareExperience: "経験を共有しましょう",
    shareExperienceBody: "面接の経験があれば、学んだことをブログ記事として共有してください。",
    writeBlogPost: "記事を書く",
    published: "公開済み",
    draft: "下書き",
    updated: "更新日",
    viewArticle: "記事を見る",
    manageMyArticles: "自分の記事を管理",
    writeNewArticle: "新しい記事を書く",
    defaultMaterialDescription: "次の学習セッションに使える保存済み教材です。",
    defaultBlogDescription: "次の見直しに向けて記事の下書きが用意されています。",
  },
  uz: {
    target: "Maqsad",
    levelNotSet: "Daraja belgilanmagan",
    student: "Talaba",
    platformStats: "Platforma statistikasi",
    readinessScore: "Tayyorgarlik ko'rsatkichi",
    threadsStarted: "Boshlangan mavzular",
    repliesGiven: "Berilgan javoblar",
    savedMaterials: "Saqlangan materiallar",
    articlesWritten: "Yozilgan maqolalar",
    editProfile: "Profilni tahrirlash",
    welcomeBack: (name) => `Qaytganingiz bilan, ${name}`,
    overviewSubtitle: "Bu yerda tayyorgarlik jarayoningizning batafsil ko'rinishi berilgan.",
    savedOn: "Saqlangan sana",
    browseMoreQuestions: "Yana savollarni ko'rish",
    browseQuestionBank: "Savollar bankini ko'rish",
    aiCompleted: "AI yakunlandi",
    viewDetailedFeedback: "Batafsil fikrlarni ko'rish",
    startNewInterview: "Yangi intervyuni boshlash",
    noSavedQuestions: "Hali hech qanday savol saqlanmagan.",
    materialsEmptyTitle: "Hali material saqlanmagan",
    materialsEmptyBody: "Foydali video, kitob va maqolalarni saqlab qo'ysangiz, keyinroq tez ochasiz.",
    exploreMaterials: "Materiallarni ko'rish",
    openMaterial: "Materialni ochish",
    viewAllSavedMaterials: "Barcha saqlangan materiallar",
    shareExperience: "Tajribangizni ulashing",
    shareExperienceBody: "Agar intervyu tajribangiz bo'lsa, undan nimalarni o'rganganingiz haqida blog yozing.",
    writeBlogPost: "Blog yozish",
    published: "Nashr qilingan",
    draft: "Qoralama",
    updated: "Yangilangan",
    viewArticle: "Maqolani ochish",
    manageMyArticles: "Maqolalarimni boshqarish",
    writeNewArticle: "Yangi maqola yozish",
    defaultMaterialDescription: "Keyingi o'qish sessiyasi uchun tayyor saqlangan manba.",
    defaultBlogDescription: "Maqola qoralamasi keyingi tahrir uchun tayyor.",
  },
};
function formatPreviewText(text: string | null | undefined, fallback: string) {
  if (!text?.trim()) {
    return fallback;
  }

  return text.length > 140 ? `${text.slice(0, 137)}...` : text;
}

export default async function DashboardPage() {
  const { t, locale } = await getServerTranslation();
  const copy = dashboardPageCopy[locale];
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: {
        select: {
          savedQuestions: true,
          savedMaterials: true,
          mockInterviews: true,
          blogPosts: true,
          discussions: true,
          comments: true,
        }
      },
      savedQuestions: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          question: {
            include: { category: true }
          }
        }
      },
      savedMaterials: {
        take: 3,
        orderBy: { createdAt: "desc" },
        include: {
          material: {
            include: { category: true }
          }
        }
      },
      blogPosts: {
        take: 3,
        orderBy: { updatedAt: "desc" },
      }
    }
  });

  if (!user) {
    redirect("/login");
  }

  // Calculate readiness score (mocked logic or based on stats)
  const readinessScore = Math.min(
    100,
    (user._count.mockInterviews * 20) +
      (user._count.savedQuestions * 5) +
      (user._count.savedMaterials * 4) +
      (user._count.blogPosts * 6) +
      (user._count.discussions * 4) +
      (user._count.comments * 2)
  ) || 0;

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-6xl">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar: Profile Card */}
        <div className="w-full md:w-1/3 lg:w-1/4">
            <Card className="sticky top-24 border-border">
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4 border-2 border-border/50">
                <AvatarImage src={user.image ?? undefined} alt={user.name} />
                <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              
              <h1 className="text-xl font-bold text-foreground">{user.name}</h1>
              <p className="text-sm text-muted-foreground mb-4 flex items-center gap-1">
                {copy.target}: <span className="font-medium text-foreground">{user.targetRole}</span>
              </p>
              
              <div className="flex gap-2 mb-6">
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 hover:bg-indigo-100 font-semibold px-3 py-1">
                  {user.japaneseLevel ? `JLPT ${user.japaneseLevel}` : copy.levelNotSet}
                </Badge>
                <Badge variant="outline" className="border-border text-muted-foreground">
                  {copy.student}
                </Badge>
              </div>

              <div className="w-full h-px bg-muted mb-6"></div>

              <div className="w-full text-left space-y-4">
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{copy.platformStats}</h3>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">{copy.readinessScore}</span>
                    <span className="font-bold text-emerald-600">{readinessScore}%</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={readinessScore}
                    aria-valuetext={`${readinessScore}%`}
                    className="h-2 w-full overflow-hidden rounded-full bg-slate-200"
                  >
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{ width: `${readinessScore}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.mockInterviews}</span>
                    <span className="text-xs text-muted-foreground">{t("dashboard.sidebar.interviews")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.savedQuestions}</span>
                    <span className="text-xs text-muted-foreground">{t("dashboard.sidebar.questions")}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.discussions}</span>
                    <span className="text-xs text-muted-foreground">{copy.threadsStarted}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.comments}</span>
                    <span className="text-xs text-muted-foreground">{copy.repliesGiven}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.savedMaterials}</span>
                    <span className="text-xs text-muted-foreground">{copy.savedMaterials}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-bold text-foreground">{user._count.blogPosts}</span>
                    <span className="text-xs text-muted-foreground">{copy.articlesWritten}</span>
                  </div>
                </div>
              </div>
              
              <div className="w-full mt-8">
                <Link href="/dashboard/settings" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium w-full">
                  {copy.editProfile}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Main Content */}
        <div className="w-full md:w-2/3 lg:w-3/4 flex flex-col gap-6">
          <div className="flex flex-col mb-2">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">{copy.welcomeBack(user.name.split(" ")[0])}</h2>
            <p className="text-muted-foreground mt-1">{copy.overviewSubtitle}</p>
          </div>

          <Tabs defaultValue="saved-questions" className="w-full">
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent border-b border-border rounded-none h-auto p-0 mb-6">
              <TabsTrigger 
                value="saved-questions" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:text-[#1e3a8a] data-[state=active]:bg-transparent px-4 py-3 data-[state=active]:shadow-none font-medium transition-none"
              >
                {t("dashboard.sidebar.questions")}
              </TabsTrigger>
              <TabsTrigger 
                value="mock-interviews" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:text-[#1e3a8a] data-[state=active]:bg-transparent px-4 py-3 data-[state=active]:shadow-none font-medium transition-none"
              >
                {t("dashboard.sidebar.interviews")}
              </TabsTrigger>
              <TabsTrigger 
                value="bookmarks" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:text-[#1e3a8a] data-[state=active]:bg-transparent px-4 py-3 data-[state=active]:shadow-none font-medium transition-none"
              >
                {t("dashboard.sidebar.materials")}
              </TabsTrigger>
              <TabsTrigger 
                value="my-blogs" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#1e3a8a] data-[state=active]:text-[#1e3a8a] data-[state=active]:bg-transparent px-4 py-3 data-[state=active]:shadow-none font-medium transition-none"
              >
                {t("dashboard.sidebar.articles")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved-questions" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                {user.savedQuestions.length === 0 ? (
                  <div className="text-center py-10 bg-background rounded-lg border-2 border-dashed border-border">
                    <p className="text-muted-foreground">{copy.noSavedQuestions}</p>
                  </div>
                ) : (
                  user.savedQuestions.map((save) => (
                    <Card key={save.id} className="group border-border hover:border-[#1e3a8a] transition-colors shadow-sm">
                      <Link href={`/questions/${save.questionId}`}>
                        <CardHeader className="p-5 flex flex-row items-start justify-between space-y-0">
                          <div className="flex flex-col gap-2 text-left">
                            <Badge variant="secondary" className="w-fit">{localizeCategory(locale, save.question.category.name)}</Badge>
                            <CardTitle className="text-lg leading-snug group-hover:text-[#1e3a8a] transition-colors">{save.question.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 text-xs mt-1">
                              <Clock className="w-3 h-3" /> {copy.savedOn} {new Date(save.createdAt).toLocaleDateString(locale)}
                            </CardDescription>
                          </div>
                          <Bookmark className="w-5 h-5 text-[#1e3a8a] transition-colors shrink-0 ml-4 fill-[#1e3a8a]" />
                        </CardHeader>
                      </Link>
                    </Card>
                  ))
                )}
                <div className="mt-4">
                  <Link href="/questions" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium">
                    {user.savedQuestions.length > 0 ? copy.browseMoreQuestions : copy.browseQuestionBank}
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="mock-interviews" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                <Card className="border-emerald-200 bg-emerald-50/30">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">{copy.aiCompleted}</Badge>
                      <span className="text-sm font-semibold text-emerald-700">Score: 85/100</span>
                    </div>
                    <CardTitle className="text-lg">Frontend Engineering Interview</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">Mid-level difficulty â€¢ 5 questions â€¢ 12 mins</CardDescription>
                    <div className="mt-4">
                      <Link href="/ai-interview/results/1" className="inline-flex items-center justify-center rounded-lg bg-muted text-foreground hover:bg-slate-200/80 h-8 px-3 text-xs font-medium">
                        {copy.viewDetailedFeedback}
                      </Link>
                    </div>
                  </CardHeader>
                </Card>

                <Card className="border-border shadow-sm">
                  <CardHeader className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-muted-foreground border-border">{copy.aiCompleted}</Badge>
                      <span className="text-sm font-semibold text-card-foreground">Score: 72/100</span>
                    </div>
                    <CardTitle className="text-lg">General Behavioral Interview</CardTitle>
                    <CardDescription className="text-muted-foreground mt-1">Entry-level difficulty â€¢ 3 questions â€¢ 8 mins</CardDescription>
                    <div className="mt-4">
                      <Link href="/ai-interview/results/2" className="inline-flex items-center justify-center rounded-lg border border-border bg-card hover:bg-muted hover:text-foreground h-8 px-3 text-xs font-medium">
                        {copy.viewDetailedFeedback}
                      </Link>
                    </div>
                  </CardHeader>
                </Card>
                
                <div className="mt-4">
                  <Link href="/ai-interview" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] bg-[#1e3a8a] text-white hover:bg-[#1e40af] h-9 px-4 text-sm font-medium">
                    {copy.startNewInterview}
                  </Link>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                {user.savedMaterials.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-border bg-background">
                    <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                      <Bookmark size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{copy.materialsEmptyTitle}</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      {copy.materialsEmptyBody}
                    </p>
                    <Link href="/materials" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium">
                      {copy.exploreMaterials}
                    </Link>
                  </div>
                ) : (
                  <>
                    {user.savedMaterials.map((savedMaterial) => (
                      <Card key={savedMaterial.id} className="border-border shadow-sm">
                        <CardHeader className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary">{localizeCategory(locale, savedMaterial.material.category.name)}</Badge>
                                <Badge variant="outline">{localizeMaterialType(locale, savedMaterial.material.type)}</Badge>
                                {savedMaterial.material.difficulty ? (
                                  <Badge variant="outline">{localizeDifficulty(locale, savedMaterial.material.difficulty)}</Badge>
                                ) : null}
                              </div>
                              <div className="space-y-2">
                                <CardTitle className="text-lg leading-snug text-foreground">
                                  {savedMaterial.material.title}
                                </CardTitle>
                                <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                  {formatPreviewText(
                                    savedMaterial.material.description,
                                    copy.defaultMaterialDescription
                                  )}
                                </CardDescription>
                              </div>
                            </div>
                            <Link
                              href={`/materials/${savedMaterial.materialId}`}
                              className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium shrink-0"
                            >
                              {copy.openMaterial}
                              <ExternalLink className="ml-2 h-4 w-4" />
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent className="px-5 pb-5 pt-0">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Library className="h-4 w-4" />
                            <span>{copy.savedOn} {new Date(savedMaterial.createdAt).toLocaleDateString(locale)}</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    <div className="mt-2">
                      <Link href="/dashboard/bookmarks" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium">
                        {copy.viewAllSavedMaterials}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="my-blogs" className="mt-0 outline-none">
              <div className="flex flex-col gap-4">
                {user.blogPosts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg border-dashed border-border bg-background">
                    <div className="w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center mb-4">
                      <PencilLine size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{copy.shareExperience}</h3>
                    <p className="text-muted-foreground max-w-sm mb-6">
                      {copy.shareExperienceBody}
                    </p>
                    <Link href="/blog/new" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] bg-[#ea580c] hover:bg-[#c2410c] text-white h-9 px-4 text-sm font-medium">
                      {copy.writeBlogPost}
                    </Link>
                  </div>
                ) : (
                  <>
                    {user.blogPosts.map((post) => (
                      <Card key={post.id} className="border-border shadow-sm">
                        <CardHeader className="p-5">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <Badge variant={post.published ? "default" : "secondary"}>
                                  {post.published ? copy.published : copy.draft}
                                </Badge>
                                <span>{copy.updated} {new Date(post.updatedAt).toLocaleDateString(locale)}</span>
                              </div>
                              <div className="space-y-2">
                                <CardTitle className="text-lg leading-snug text-foreground">{post.title}</CardTitle>
                                <CardDescription className="max-w-2xl text-sm leading-6 text-muted-foreground">
                                  {formatPreviewText(post.content, copy.defaultBlogDescription)}
                                </CardDescription>
                              </div>
                            </div>
                            {post.published ? (
                              <Link
                                href={`/blog/${post.slug}`}
                                className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium shrink-0"
                              >
                                {copy.viewArticle}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </Link>
                            ) : null}
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                    <div className="flex flex-wrap gap-3 mt-2">
                      <Link href="/dashboard/my-blogs" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] border border-border bg-card hover:bg-muted hover:text-foreground h-9 px-4 text-sm font-medium">
                        {copy.manageMyArticles}
                      </Link>
                      <Link href="/blog/new" className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] bg-[#ea580c] hover:bg-[#c2410c] text-white h-9 px-4 text-sm font-medium">
                        {copy.writeNewArticle}
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

          </Tabs>

        </div>
      </div>
    </div>
  );
}
