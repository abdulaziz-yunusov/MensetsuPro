import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { Bookmark, Code2, User, Briefcase, Languages, ArrowRight, ShieldCheck } from "lucide-react";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";

export const metadata = {
  title: "My Profile | MensetsuPro",
  description: "Manage your profile and interview preferences.",
};

const profileCopy: Record<
  Locale,
  {
    yourProfile: string;
    savedQuestions: string;
    savedQuestionsDesc: string;
    solvedCodeQuestions: string;
    solvedCodeQuestionsDesc: string;
    personalInfo: string;
    personalInfoDesc: string;
    displayName: string;
    emailAddress: string;
    verified: string;
    emailFixed: string;
    applicationContext: string;
    applicationContextDesc: string;
    targetJobRole: string;
    targetJobRolePlaceholder: string;
    targetJobRoleDesc: string;
    japaneseLevel: string;
    japaneseLevelDesc: string;
    unknownLevel: string;
    saveChanges: string;
    changesSaved: string;
  }
> = {
  en: {
    yourProfile: "Your Profile",
    savedQuestions: "Saved Questions",
    savedQuestionsDesc: "Bookmarked interview questions for later review.",
    solvedCodeQuestions: "Solved Code Questions",
    solvedCodeQuestionsDesc: "Review your algorithmic submissions and progress.",
    personalInfo: "Personal Information",
    personalInfoDesc: "Displayed on your forum posts and blog articles.",
    displayName: "Display Name",
    emailAddress: "Email Address",
    verified: "Verified",
    emailFixed: "Email cannot be changed. Contact support if needed.",
    applicationContext: "Application Context",
    applicationContextDesc: "Helps the AI Interviewer tailor questions to your goals.",
    targetJobRole: "Target Job Role",
    targetJobRolePlaceholder: "e.g. Frontend Engineer, DevOps, PM",
    targetJobRoleDesc: "Used to personalize your interview difficulty and topics.",
    japaneseLevel: "Japanese Level",
    japaneseLevelDesc: "Adjusts the language complexity of AI-generated scenarios.",
    unknownLevel: "I don't know / None",
    saveChanges: "Save Changes",
    changesSaved: "Changes are saved instantly after clicking below.",
  },
  ru: {
    yourProfile: "Ваш профиль",
    savedQuestions: "Сохраненные вопросы",
    savedQuestionsDesc: "Закладки с вопросами для повторения позже.",
    solvedCodeQuestions: "Решенные задачи по коду",
    solvedCodeQuestionsDesc: "Просматривайте свои решения и текущий прогресс.",
    personalInfo: "Личная информация",
    personalInfoDesc: "Показывается в ваших постах на форуме и статьях блога.",
    displayName: "Отображаемое имя",
    emailAddress: "Email адрес",
    verified: "Подтверждено",
    emailFixed: "Email изменить нельзя. При необходимости свяжитесь с поддержкой.",
    applicationContext: "Контекст подготовки",
    applicationContextDesc: "Помогает AI-помощнику подбирать вопросы под ваши цели.",
    targetJobRole: "Целевая должность",
    targetJobRolePlaceholder: "например: Frontend Engineer, DevOps, PM",
    targetJobRoleDesc: "Используется для подбора сложности и тем интервью.",
    japaneseLevel: "Уровень японского",
    japaneseLevelDesc: "Влияет на сложность AI-сценариев по языку.",
    unknownLevel: "Не знаю / Нет уровня",
    saveChanges: "Сохранить изменения",
    changesSaved: "Изменения сохранятся после нажатия кнопки ниже.",
  },
  ja: {
    yourProfile: "あなたのプロフィール",
    savedQuestions: "保存した質問",
    savedQuestionsDesc: "後で見直すために保存した面接質問です。",
    solvedCodeQuestions: "解いたコード問題",
    solvedCodeQuestionsDesc: "提出した解答と進捗を確認できます。",
    personalInfo: "基本情報",
    personalInfoDesc: "フォーラム投稿やブログ記事に表示されます。",
    displayName: "表示名",
    emailAddress: "メールアドレス",
    verified: "確認済み",
    emailFixed: "メールアドレスは変更できません。必要な場合はサポートへ連絡してください。",
    applicationContext: "応募コンテキスト",
    applicationContextDesc: "AI面接が目標に合わせて質問を調整するために使います。",
    targetJobRole: "目標職種",
    targetJobRolePlaceholder: "ä¾‹: Frontend Engineer, DevOps, PM",
    targetJobRoleDesc: "面接の難易度やテーマを調整するために使われます。",
    japaneseLevel: "日本語レベル",
    japaneseLevelDesc: "AI生成シナリオの言語難易度を調整します。",
    unknownLevel: "わからない / なし",
    saveChanges: "変更を保存",
    changesSaved: "下のボタンを押すと変更が保存されます。",
  },
  uz: {
    yourProfile: "Profilingiz",
    savedQuestions: "Saqlangan savollar",
    savedQuestionsDesc: "Keyinroq ko'rib chiqish uchun saqlangan savollar.",
    solvedCodeQuestions: "Yechilgan kod savollari",
    solvedCodeQuestionsDesc: "Topshirgan yechimlaringiz va jarayonni ko'ring.",
    personalInfo: "Shaxsiy ma'lumotlar",
    personalInfoDesc: "Forum postlaringiz va blog maqolalaringizda ko'rsatiladi.",
    displayName: "Ko'rsatiladigan ism",
    emailAddress: "Email manzil",
    verified: "Tasdiqlangan",
    emailFixed: "Emailni o'zgartirib bo'lmaydi. Kerak bo'lsa, qo'llab-quvvatlash bilan bog'laning.",
    applicationContext: "Ariza konteksti",
    applicationContextDesc: "AI intervyuerga savollarni maqsadingizga moslashtirishga yordam beradi.",
    targetJobRole: "Maqsadli lavozim",
    targetJobRolePlaceholder: "masalan: Frontend Engineer, DevOps, PM",
    targetJobRoleDesc: "Intervyu qiyinligi va mavzularini moslashtirishda ishlatiladi.",
    japaneseLevel: "Yapon tili darajasi",
    japaneseLevelDesc: "AI ssenariylarining til murakkabligini sozlaydi.",
    unknownLevel: "Bilmayman / Yo'q",
    saveChanges: "O'zgarishlarni saqlash",
    changesSaved: "Quyidagi tugma bosilgach o'zgarishlar saqlanadi.",
  },
};

const jlptLabels: Record<Locale, Record<string, string>> = {
  en: {
    N5: "JLPT N5 - Beginner",
    N4: "JLPT N4 - Basic",
    N3: "JLPT N3 - Intermediate",
    N2: "JLPT N2 - Business Level",
    N1: "JLPT N1 - Advanced",
    NATIVE: "Native / Fluent",
  },
  ru: {
    N5: "JLPT N5 - Начальный",
    N4: "JLPT N4 - Базовый",
    N3: "JLPT N3 - Средний",
    N2: "JLPT N2 - Деловой уровень",
    N1: "JLPT N1 - Продвинутый",
    NATIVE: "Носитель / Свободно",
  },
  ja: {
    N5: "JLPT N5 - 初級",
    N4: "JLPT N4 - 基礎",
    N3: "JLPT N3 - 中級",
    N2: "JLPT N2 - ビジネスレベル",
    N1: "JLPT N1 - 上級",
    NATIVE: "ネイティブ / 流暢",
  },
  uz: {
    N5: "JLPT N5 - Boshlang'ich",
    N4: "JLPT N4 - Asosiy",
    N3: "JLPT N3 - O'rta",
    N2: "JLPT N2 - Biznes darajasi",
    N1: "JLPT N1 - Yuqori",
    NATIVE: "Ona tili / Ravon",
  },
};

export default async function ProfilePage() {
  const { locale } = await getServerTranslation();
  const copy = profileCopy[locale];
  const levelLabels = jlptLabels[locale];
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) return null;

  const initials = (user.name || user.email || "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function updateProfile(formData: FormData) {
    "use server";
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    const name = formData.get("name") as string;
    const targetRole = formData.get("targetRole") as string;
    const japaneseLevel = formData.get("japaneseLevel") as string;

    const finalJapaneseLevel =
      japaneseLevel && ["N5", "N4", "N3", "N2", "N1", "NATIVE"].includes(japaneseLevel)
        ? (japaneseLevel as any)
        : null;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || user?.name,
        targetRole,
        japaneseLevel: finalJapaneseLevel,
      },
    });

    revalidatePath("/dashboard/profile");
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Page Header */}
      <div className="flex items-center gap-5">
        <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] flex items-center justify-center text-white text-xl font-bold shadow-md select-none">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {user.name || copy.yourProfile}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
        </div>
      </div>

      {/* Quick Access Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/saved-questions"
          className="group flex items-start gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-[#1e3a8a]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground group-hover:text-[#1e3a8a] transition-colors">
              {copy.savedQuestions}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
              {copy.savedQuestionsDesc}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#1e3a8a] mt-1 flex-shrink-0 transition-colors" />
        </Link>

        <Link
          href="/dashboard/coding-attempts"
          className="group flex items-start gap-4 p-5 bg-card border border-border rounded-2xl shadow-sm hover:border-sky-300 hover:shadow-md transition-all"
        >
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-sky-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-foreground group-hover:text-sky-700 transition-colors">
              {copy.solvedCodeQuestions}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-snug">
              {copy.solvedCodeQuestionsDesc}
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-sky-600 mt-1 flex-shrink-0 transition-colors" />
        </Link>
      </div>

      {/* Main Settings Form */}
      <form action={updateProfile}>
        <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">

          {/* Personal Information Header */}
          <div className="px-6 py-5 border-b border-border/50">
            <div className="flex items-center gap-2.5 mb-1">
              <User className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{copy.personalInfo}</h2>
            </div>
            <p className="text-sm text-muted-foreground ml-[26px]">
              {copy.personalInfoDesc}
            </p>
          </div>

          <div className="px-6 py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-card-foreground">
                  {copy.displayName}
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={user.name || ""}
                  required
                  className="h-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="text-sm font-medium text-card-foreground">
                    {copy.emailAddress}
                  </Label>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                    <ShieldCheck className="w-3 h-3" /> {copy.verified}
                  </span>
                </div>
                <Input
                  id="email"
                  defaultValue={user.email || ""}
                  disabled
                  className="h-10 bg-background border-border text-muted-foreground cursor-not-allowed"
                />
                <p className="text-[11px] text-muted-foreground">
                  {copy.emailFixed}
                </p>
              </div>
            </div>
          </div>

          {/* Application Context Header */}
          <div className="px-6 py-5 border-t border-border/50">
            <div className="flex items-center gap-2.5 mb-1">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-base font-semibold text-foreground">{copy.applicationContext}</h2>
            </div>
            <p className="text-sm text-muted-foreground ml-[26px]">
              {copy.applicationContextDesc}
            </p>
          </div>

          <div className="px-6 pb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <Label
                  htmlFor="targetRole"
                  className="text-sm font-medium text-card-foreground flex items-center gap-1.5"
                >
                  <Briefcase className="w-3.5 h-3.5 text-muted-foreground" /> {copy.targetJobRole}
                </Label>
                <Input
                  id="targetRole"
                  name="targetRole"
                  defaultValue={user.targetRole || ""}
                  placeholder={copy.targetJobRolePlaceholder}
                  className="h-10 bg-card border-border text-foreground placeholder:text-muted-foreground"
                />
                <p className="text-[11px] text-muted-foreground">
                  {copy.targetJobRoleDesc}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="japaneseLevel"
                  className="text-sm font-medium text-card-foreground flex items-center gap-1.5"
                >
                  <Languages className="w-3.5 h-3.5 text-muted-foreground" /> {copy.japaneseLevel}
                </Label>
                <select
                  id="japaneseLevel"
                  name="japaneseLevel"
                  defaultValue={user.japaneseLevel || ""}
                  className="flex h-10 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-colors"
                >
                  <option value="">{copy.unknownLevel}</option>
                  <option value="N5">{levelLabels.N5}</option>
                  <option value="N4">{levelLabels.N4}</option>
                  <option value="N3">{levelLabels.N3}</option>
                  <option value="N2">{levelLabels.N2}</option>
                  <option value="N1">{levelLabels.N1}</option>
                  <option value="NATIVE">{levelLabels.NATIVE}</option>
                </select>
                <p className="text-[11px] text-muted-foreground">
                  {copy.japaneseLevelDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Save Footer */}
          <div className="flex items-center justify-between px-6 py-4 bg-background border-t border-border/50 rounded-b-2xl">
            <p className="text-xs text-muted-foreground">
              {copy.changesSaved}
            </p>
            <Button
              type="submit"
              className="bg-[#1e3a8a] hover:bg-[#1e40af] text-white font-semibold px-6 h-10 rounded-xl shadow-sm transition-colors"
            >
              {copy.saveChanges}
            </Button>
          </div>

        </div>
      </form>
    </div>
  );
}

