"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  AlarmClock,
  ArrowRight,
  Bot,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Languages,
  MessageSquareQuote,
  RefreshCcw,
  RotateCcw,
  Sparkles,
  Star,
  Target,
} from "lucide-react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress, ProgressIndicator, ProgressTrack } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/i18n";

type CategoryId =
  | "self-introduction"
  | "motivation"
  | "strengths"
  | "teamwork"
  | "problem-solving"
  | "business-manners"
  | "technical"
  | "hr-general";

type DifficultyId = "entry" | "mid" | "advanced";
type LanguageId = "japanese" | "english" | "mixed";
type QuestionCountId = "3" | "5" | "10";

type InterviewConfig = {
  category: CategoryId | "";
  difficulty: DifficultyId | "";
  jobRole: string;
  language: LanguageId;
  questionCount: QuestionCountId;
  includeFollowUps: boolean;
  showLiveHints: boolean;
  strictMode: boolean;
};

type QuestionSeed = {
  label: string;
  jp: string;
  en: string;
  hint: string;
  keywords: string[];
};

type SessionQuestion = QuestionSeed & {
  id: string;
  isFollowUp: boolean;
  lead: string;
};

type FeedbackMetric = {
  label: "Clarity" | "Confidence" | "Relevance" | "Grammar" | "Politeness";
  value: number;
};

type FeedbackData = {
  overall: number;
  summary: string;
  strengths: string[];
  weakPoints: string[];
  suggestions: string[];
  betterSampleAnswer: string;
  naturalJapaneseVersion?: string;
  businessPoliteVersion?: string;
  metrics: FeedbackMetric[];
  interviewerLine: string;
  skipped: boolean;
};

type ReviewEntry = {
  questionIndex: number;
  question: SessionQuestion;
  answer: string;
  feedback: FeedbackData;
};

const initialConfig: InterviewConfig = {
  category: "",
  difficulty: "",
  jobRole: "",
  language: "japanese",
  questionCount: "5",
  includeFollowUps: true,
  showLiveHints: true,
  strictMode: false,
};

const categories: { value: CategoryId; label: string; description: string }[] = [
  { value: "self-introduction", label: "Self Introduction", description: "Opening pitch, background, and first impression." },
  { value: "motivation", label: "Motivation / Why this company", description: "Intent, company fit, and career direction." },
  { value: "strengths", label: "Strengths and Weaknesses", description: "Self-awareness and reflection." },
  { value: "teamwork", label: "Teamwork / Communication", description: "Collaboration and conflict handling." },
  { value: "problem-solving", label: "Problem Solving", description: "Troubleshooting and prioritization." },
  { value: "business-manners", label: "Japanese Business Manners", description: "Keigo, etiquette, and professional tone." },
  { value: "technical", label: "IT / Technical Interview", description: "Engineering judgment and architecture." },
  { value: "hr-general", label: "HR / General Questions", description: "Workstyle, learning, and fit." },
];

const difficulties: { value: DifficultyId; label: string }[] = [
  { value: "entry", label: "Entry-level" },
  { value: "mid", label: "Mid-level" },
  { value: "advanced", label: "Advanced" },
];

const languages: { value: LanguageId; label: string }[] = [
  { value: "japanese", label: "Japanese" },
  { value: "english", label: "English" },
  { value: "mixed", label: "Mixed" },
];

const questionCounts: QuestionCountId[] = ["3", "5", "10"];

const aiInterviewCopy: Record<
  Locale,
  {
    badge: string;
    title: string;
    subtitle: string;
    flow: string;
    flowValue: string;
    feedback: string;
    feedbackValue: string;
    timer: string;
    liveSession: string;
    setupTitle: string;
    setupDescription: string;
    category: string;
    categoryHint: string;
    selectCategory: string;
    difficulty: string;
    difficultyHint: string;
    selectDifficulty: string;
    jobRole: string;
    jobRoleHint: string;
    jobRolePlaceholder: string;
    language: string;
    languageHint: string;
    questionCount: string;
    questionCountHint: string;
    followUpsTitle: string;
    followUpsDesc: string;
    hintsTitle: string;
    hintsDesc: string;
    strictTitle: string;
    strictDesc: string;
    footerNote: string;
    reset: string;
    startInterview: string;
    coachPreview: string;
    coachDescription: string;
    coachName: string;
    coachRole: string;
    coachStrict: string;
    coachNatural: string;
    notSelected: string;
    sessionBadge: string;
    progress: string;
    currentQuestion: string;
    followUp: string;
    repeat: string;
    yourAnswer: string;
    answerDescription: string;
    textMode: string;
    englishPlaceholder: string;
    mixedPlaceholder: string;
    japanesePlaceholder: string;
    roleFraming: string;
    strictnessLabel: string;
    strictnessStrict: string;
    strictnessNormal: string;
    expectedStyle: string;
    clear: string;
    skipQuestion: string;
    endSession: string;
    submitAnswer: string;
  }
> = {
  en: {
    badge: "AI Interview Training",
    title: "Practice the full interview flow on one page.",
    subtitle: "Setup, live session, scored feedback, and final summary now follow the selected interface language for the visible UI.",
    flow: "Flow",
    flowValue: "Setup to summary",
    feedback: "Feedback",
    feedbackValue: "5 scoring categories",
    timer: "Timer",
    liveSession: "Live session",
    setupTitle: "Interview Setup",
    setupDescription: "Validation is inline, and the session state stays local for now.",
    category: "Category",
    categoryHint: "Choose the type of interview you want to simulate.",
    selectCategory: "Select a category",
    difficulty: "Difficulty",
    difficultyHint: "Difficulty affects interviewer pressure and scoring.",
    selectDifficulty: "Select difficulty",
    jobRole: "Job role",
    jobRoleHint: "Required. Questions will be framed around this role.",
    jobRolePlaceholder: "Frontend Developer, Backend Developer, QA Engineer, IT Support...",
    language: "Language",
    languageHint: "Controls prompt display and rewrite suggestions.",
    questionCount: "Number of questions",
    questionCountHint: "Choose 3, 5, or 10 questions.",
    followUpsTitle: "Include follow-up questions",
    followUpsDesc: "Inject deeper probing questions.",
    hintsTitle: "Show live hints",
    hintsDesc: "Keep subtle coaching visible.",
    strictTitle: "Strict interviewer mode",
    strictDesc: "Sharper scoring and more formal lines.",
    footerNote: "Text mode is active now. Voice mode stays reserved for the future API-backed version.",
    reset: "Reset",
    startInterview: "Start Interview",
    coachPreview: "Coach Preview",
    coachDescription: "The interviewer tone changes with your setup.",
    coachName: "AI Interview Coach",
    coachRole: "Japanese interview simulation",
    coachStrict: "Please answer in a more formal interview style.",
    coachNatural: "Answer naturally and professionally.",
    notSelected: "Not selected",
    sessionBadge: "AI Interview Session",
    progress: "Progress",
    currentQuestion: "Current question",
    followUp: "Follow-up",
    repeat: "Repeat",
    yourAnswer: "Your Answer",
    answerDescription: "Submit for AI-style scoring, retry if needed, then continue to the next question.",
    textMode: "Text mode",
    englishPlaceholder: "Type your answer here in English...",
    mixedPlaceholder: "Type your answer in Japanese, English, or a careful mix of both...",
    japanesePlaceholder: "Type your answer here in Japanese...",
    roleFraming: "Role framing: mention experience relevant to",
    strictnessLabel: "Strictness",
    strictnessStrict: "formal tone is scored aggressively",
    strictnessNormal: "tone is coached, but not heavily penalized",
    expectedStyle: "Expected style: conclusion first, one example, then the result.",
    clear: "Clear",
    skipQuestion: "Skip Question",
    endSession: "End Session",
    submitAnswer: "Submit Answer",
  },
  ru: {
    badge: "AI-тренировка интервью",
    title: "Пройдите полный цикл интервью на одной странице.",
    subtitle: "Настройка, живая сессия, оценка и итоговое резюме теперь следуют выбранному языку интерфейса.",
    flow: "Поток",
    flowValue: "От настройки до итога",
    feedback: "Оценка",
    feedbackValue: "5 категорий",
    timer: "Таймер",
    liveSession: "Живая сессия",
    setupTitle: "Настройка интервью",
    setupDescription: "Проверка работает сразу, а состояние сессии пока хранится локально.",
    category: "Категория",
    categoryHint: "Выберите тип интервью для тренировки.",
    selectCategory: "Выберите категорию",
    difficulty: "Сложность",
    difficultyHint: "Сложность влияет на давление интервьюера и итоговую оценку.",
    selectDifficulty: "Выберите сложность",
    jobRole: "Роль",
    jobRoleHint: "Обязательно. Вопросы будут подстроены под эту роль.",
    jobRolePlaceholder: "Frontend Developer, Backend Developer, QA Engineer, IT Support...",
    language: "Язык",
    languageHint: "Управляет показом подсказок и вариантами переписывания ответа.",
    questionCount: "Количество вопросов",
    questionCountHint: "Выберите 3, 5 или 10 вопросов.",
    followUpsTitle: "Добавлять уточняющие вопросы",
    followUpsDesc: "Включает более глубокие уточнения.",
    hintsTitle: "Показывать подсказки",
    hintsDesc: "Оставляет ненавязчивые подсказки во время сессии.",
    strictTitle: "Строгий режим интервьюера",
    strictDesc: "Более жесткая оценка и более формальные реплики.",
    footerNote: "Сейчас активен текстовый режим. Голосовой режим останется для будущей версии с API.",
    reset: "Сброс",
    startInterview: "Начать интервью",
    coachPreview: "Предпросмотр коуча",
    coachDescription: "Тон интервьюера меняется в зависимости от выбранных настроек.",
    coachName: "AI-коуч по интервью",
    coachRole: "Симуляция японского интервью",
    coachStrict: "Пожалуйста, отвечайте в более формальном стиле интервью.",
    coachNatural: "Отвечайте естественно и профессионально.",
    notSelected: "Не выбрано",
    sessionBadge: "Сессия AI-интервью",
    progress: "Прогресс",
    currentQuestion: "Текущий вопрос",
    followUp: "Уточнение",
    repeat: "Повторить",
    yourAnswer: "Ваш ответ",
    answerDescription: "Отправьте ответ на оценку, при необходимости попробуйте снова и переходите к следующему вопросу.",
    textMode: "Текстовый режим",
    englishPlaceholder: "Введите ответ здесь на английском...",
    mixedPlaceholder: "Введите ответ на японском, английском или аккуратно смешайте оба...",
    japanesePlaceholder: "Введите ответ здесь на японском...",
    roleFraming: "Фокус роли: укажите опыт, связанный с",
    strictnessLabel: "Строгость",
    strictnessStrict: "формальный тон оценивается строже",
    strictnessNormal: "тон направляется подсказками, но без жесткого штрафа",
    expectedStyle: "Ожидаемый стиль: сначала вывод, затем один пример и результат.",
    clear: "Очистить",
    skipQuestion: "Пропустить вопрос",
    endSession: "Завершить сессию",
    submitAnswer: "Отправить ответ",
  },
  ja: {
    badge: "AI面接トレーニング",
    title: "1ページで面接の流れ全体を練習できます。",
    subtitle: "設定、ライブセッション、採点フィードバック、最終サマリーが選択した表示言語に合わせて切り替わります。",
    flow: "フロー",
    flowValue: "設定からまとめまで",
    feedback: "フィードバック",
    feedbackValue: "5つの評価項目",
    timer: "タイマー",
    liveSession: "ライブセッション",
    setupTitle: "面接設定",
    setupDescription: "入力チェックはその場で行われ、セッション状態は今のところローカルに保持されます。",
    category: "カテゴリー",
    categoryHint: "練習したい面接タイプを選択してください。",
    selectCategory: "カテゴリーを選択",
    difficulty: "難易度",
    difficultyHint: "難易度は面接官の厳しさと評価に影響します。",
    selectDifficulty: "難易度を選択",
    jobRole: "職種",
    jobRoleHint: "必須です。この職種に合わせて質問が作られます。",
    jobRolePlaceholder: "Frontend Developer, Backend Developer, QA Engineer, IT Support...",
    language: "言語",
    languageHint: "プロンプト表示と書き換え提案に影響します。",
    questionCount: "質問数",
    questionCountHint: "3、5、10問から選択してください。",
    followUpsTitle: "深掘り質問を含める",
    followUpsDesc: "より深い確認質問を追加します。",
    hintsTitle: "ライブヒントを表示",
    hintsDesc: "控えめなコーチングヒントを表示します。",
    strictTitle: "厳しめ面接官モード",
    strictDesc: "より厳しい採点と、よりフォーマルな返答になります。",
    footerNote: "現在はテキストモードです。音声モードは今後のAPI連携版で対応予定です。",
    reset: "リセット",
    startInterview: "面接を開始",
    coachPreview: "コーチプレビュー",
    coachDescription: "面接官のトーンは設定に応じて変わります。",
    coachName: "AI面接コーチ",
    coachRole: "日本語面接シミュレーション",
    coachStrict: "よりフォーマルな面接スタイルで回答してください。",
    coachNatural: "自然でプロフェッショナルに回答してください。",
    notSelected: "未選択",
    sessionBadge: "AI面接セッション",
    progress: "進捗",
    currentQuestion: "現在の質問",
    followUp: "追加質問",
    repeat: "再表示",
    yourAnswer: "あなたの回答",
    answerDescription: "AI風の採点に送信し、必要なら書き直してから次の質問に進んでください。",
    textMode: "テキストモード",
    englishPlaceholder: "ここに英語で回答を入力してください...",
    mixedPlaceholder: "日本語、英語、または両方を丁寧に混ぜて回答してください...",
    japanesePlaceholder: "ここに日本語で回答を入力してください...",
    roleFraming: "職種の観点: 次の職種に関連する経験を含めてください",
    strictnessLabel: "厳しさ",
    strictnessStrict: "フォーマルなトーンが厳しく採点されます",
    strictnessNormal: "トーンは指導されますが、強い減点にはなりません",
    expectedStyle: "期待される構成: 結論、具体例、結果の順で答えてください。",
    clear: "クリア",
    skipQuestion: "質問をスキップ",
    endSession: "セッション終了",
    submitAnswer: "回答を送信",
  },
  uz: {
    badge: "AI intervyu mashqi",
    title: "Intervyuning to'liq jarayonini bitta sahifada mashq qiling.",
    subtitle: "Sozlash, jonli sessiya, baholangan fikr-mulohaza va yakuniy xulosa endi tanlangan interfeys tiliga mos ishlaydi.",
    flow: "Oqim",
    flowValue: "Sozlashdan xulosagacha",
    feedback: "Baholash",
    feedbackValue: "5 ta baholash toifasi",
    timer: "Taymer",
    liveSession: "Jonli sessiya",
    setupTitle: "Intervyu sozlamalari",
    setupDescription: "Tekshiruv shu yerning o'zida ishlaydi, sessiya holati hozircha lokal saqlanadi.",
    category: "Kategoriya",
    categoryHint: "Mashq qilmoqchi bo'lgan intervyu turini tanlang.",
    selectCategory: "Kategoriyani tanlang",
    difficulty: "Qiyinchilik",
    difficultyHint: "Qiyinchilik intervyuer bosimi va bahoga ta'sir qiladi.",
    selectDifficulty: "Qiyinchilikni tanlang",
    jobRole: "Lavozim",
    jobRoleHint: "Majburiy. Savollar shu lavozimga mos tuziladi.",
    jobRolePlaceholder: "Frontend Developer, Backend Developer, QA Engineer, IT Support...",
    language: "Til",
    languageHint: "Prompt ko'rinishi va qayta yozish tavsiyalarini boshqaradi.",
    questionCount: "Savollar soni",
    questionCountHint: "3, 5 yoki 10 ta savolni tanlang.",
    followUpsTitle: "Qo'shimcha savollarni qo'shish",
    followUpsDesc: "Savolni chuqurroq ochadigan savollarni kiritadi.",
    hintsTitle: "Jonli maslahatlarni ko'rsatish",
    hintsDesc: "Nozik ko'rsatmalarni ko'rinadigan holda qoldiradi.",
    strictTitle: "Qattiq intervyuer rejimi",
    strictDesc: "Qattiqroq baholash va rasmiyroq replikalar.",
    footerNote: "Hozir matn rejimi faol. Ovozli rejim keyingi API versiyasi uchun qoldirilgan.",
    reset: "Tiklash",
    startInterview: "Intervyuni boshlash",
    coachPreview: "Murabbiy ko'rinishi",
    coachDescription: "Intervyuer ohangi tanlangan sozlamalarga qarab o'zgaradi.",
    coachName: "AI intervyu murabbiyi",
    coachRole: "Yaponcha intervyu simulyatsiyasi",
    coachStrict: "Iltimos, yanada rasmiy intervyu uslubida javob bering.",
    coachNatural: "Tabiiy va professional tarzda javob bering.",
    notSelected: "Tanlanmagan",
    sessionBadge: "AI intervyu sessiyasi",
    progress: "Jarayon",
    currentQuestion: "Joriy savol",
    followUp: "Qo'shimcha savol",
    repeat: "Takrorlash",
    yourAnswer: "Javobingiz",
    answerDescription: "AI uslubida baholash uchun yuboring, kerak bo'lsa qayta urinib ko'ring va keyingi savolga o'ting.",
    textMode: "Matn rejimi",
    englishPlaceholder: "Javobingizni bu yerga ingliz tilida yozing...",
    mixedPlaceholder: "Javobingizni yaponcha, inglizcha yoki ikkalasini ehtiyotkor aralashtirib yozing...",
    japanesePlaceholder: "Javobingizni bu yerga yapon tilida yozing...",
    roleFraming: "Lavozim bo'yicha yo'naltirish: quyidagi lavozimga mos tajribani eslatib o'ting",
    strictnessLabel: "Qattiqlik",
    strictnessStrict: "rasmiy ohang qat'iyroq baholanadi",
    strictnessNormal: "ohang bo'yicha yo'l-yo'riq beriladi, lekin jarima kuchli emas",
    expectedStyle: "Kutilgan uslub: avval xulosa, keyin bitta misol va natija.",
    clear: "Tozalash",
    skipQuestion: "Savolni o'tkazib yuborish",
    endSession: "Sessiyani tugatish",
    submitAnswer: "Javobni yuborish",
  },
};

const categoryLabels: Record<CategoryId, Record<Locale, string>> = {
  "self-introduction": { en: "Self Introduction", ru: "Самопрезентация", ja: "自己紹介", uz: "O'zini tanishtirish" },
  motivation: { en: "Motivation / Why this company", ru: "Мотивация / Почему эта компания", ja: "志望動機 / なぜこの会社か", uz: "Motivatsiya / Nega bu kompaniya" },
  strengths: { en: "Strengths and Weaknesses", ru: "Сильные и слабые стороны", ja: "強みと弱み", uz: "Kuchli va zaif tomonlar" },
  teamwork: { en: "Teamwork / Communication", ru: "Командная работа / Коммуникация", ja: "チームワーク / コミュニケーション", uz: "Jamoa / Muloqot" },
  "problem-solving": { en: "Problem Solving", ru: "Решение проблем", ja: "問題解決", uz: "Muammo yechish" },
  "business-manners": { en: "Japanese Business Manners", ru: "Японский деловой этикет", ja: "日本のビジネスマナー", uz: "Yapon biznes odobi" },
  technical: { en: "IT / Technical Interview", ru: "IT / Техническое интервью", ja: "IT / 技術面接", uz: "IT / Texnik intervyu" },
  "hr-general": { en: "HR / General Questions", ru: "HR / Общие вопросы", ja: "HR / 一般質問", uz: "HR / Umumiy savollar" },
};

const difficultyLabels: Record<DifficultyId, Record<Locale, string>> = {
  entry: { en: "Entry-level", ru: "Начальный уровень", ja: "初級", uz: "Boshlang'ich daraja" },
  mid: { en: "Mid-level", ru: "Средний уровень", ja: "中級", uz: "O'rta daraja" },
  advanced: { en: "Advanced", ru: "Продвинутый", ja: "上級", uz: "Yuqori" },
};

const languageLabels: Record<LanguageId, Record<Locale, string>> = {
  japanese: { en: "Japanese", ru: "Японский", ja: "日本語", uz: "Yaponcha" },
  english: { en: "English", ru: "Английский", ja: "英語", uz: "Inglizcha" },
  mixed: { en: "Mixed", ru: "Смешанный", ja: "ミックス", uz: "Aralash" },
};

const questionSeeds: Record<CategoryId, QuestionSeed[]> = {
  "self-introduction": [
    {
      label: "Introduce yourself",
      jp: "まず、自己紹介とこれまでのご経歴を簡潔に教えてください。",
      en: "Please introduce yourself and briefly walk me through your background.",
      hint: "Cover your current status, relevant experience, and why it fits the role.",
      keywords: ["experience", "background", "role", "project"],
    },
    {
      label: "First 90 days",
      jp: "入社後90日間でどのように立ち上がる計画ですか。",
      en: "What would your first 90 days in this role look like?",
      hint: "Show how you learn, build trust, and deliver early value.",
      keywords: ["90 days", "plan", "ramp up", "impact"],
    },
  ],
  motivation: [
    {
      label: "Why this company",
      jp: "なぜ当社を志望しているのか、理由を教えてください。",
      en: "Why do you want to join this company?",
      hint: "Connect your goals to the company, not only the brand.",
      keywords: ["company", "motivation", "fit", "career"],
    },
    {
      label: "Why now",
      jp: "今のタイミングで転職を考えている理由は何ですか。",
      en: "Why are you considering a change at this point in your career?",
      hint: "Keep the tone forward-looking and professional.",
      keywords: ["timing", "career", "change", "growth"],
    },
  ],
  strengths: [
    {
      label: "Core strength",
      jp: "あなたの強みを、具体的な業務経験とあわせて教えてください。",
      en: "What is one of your main strengths, and how has it helped you at work?",
      hint: "Use one real example with a measurable result.",
      keywords: ["strength", "impact", "example", "result"],
    },
    {
      label: "Weakness in progress",
      jp: "改善に取り組んでいる弱みを一つ教えてください。",
      en: "Tell me about one weakness you are actively improving.",
      hint: "Choose a real weakness and explain how you manage it.",
      keywords: ["weakness", "improvement", "reflection", "growth"],
    },
  ],
  teamwork: [
    {
      label: "Handling disagreement",
      jp: "チームで難しい意見の違いがあったとき、どのように対応しましたか。",
      en: "How do you handle disagreements within a team?",
      hint: "Show listening, alignment, and a calm decision process.",
      keywords: ["team", "disagreement", "communication", "alignment"],
    },
    {
      label: "Shared success",
      jp: "周囲と連携して成果を出した経験を教えてください。",
      en: "Describe a time when collaboration led to a strong result.",
      hint: "Focus on your role inside the team outcome.",
      keywords: ["collaboration", "team", "result", "support"],
    },
  ],
  "problem-solving": [
    {
      label: "Root cause analysis",
      jp: "難しい問題や障害をどのように切り分けて解決しますか。",
      en: "How do you approach a problem when the root cause is not immediately clear?",
      hint: "Explain your process step by step instead of jumping to tools.",
      keywords: ["problem", "root cause", "investigate", "hypothesis"],
    },
    {
      label: "Tradeoff decision",
      jp: "スピードと品質の両方が求められる状況で、どのように優先順位を決めますか。",
      en: "How do you decide priorities when both speed and quality matter?",
      hint: "State a framework, not just a preference.",
      keywords: ["priority", "quality", "risk", "deadline"],
    },
  ],
  "business-manners": [
    {
      label: "Formal expression",
      jp: "面接で意識している丁寧な表現や、避けている言い回しを教えてください。",
      en: "What polite interview language do you try to use, and what phrasing do you avoid?",
      hint: "Mention specific phrasing, not only general respect.",
      keywords: ["polite", "formal", "keigo", "expression"],
    },
    {
      label: "Question etiquette",
      jp: "面接の最後に逆質問をするとき、どのような点に気をつけますか。",
      en: "What do you pay attention to when asking your own questions at the end of an interview?",
      hint: "Ask thoughtful questions that show preparation and respect.",
      keywords: ["question", "preparation", "respect", "role"],
    },
  ],
  technical: [
    {
      label: "Technical decision",
      jp: "最近行った重要な技術的判断を一つ説明してください。",
      en: "Describe one important technical decision you made recently.",
      hint: "Explain context, options, tradeoffs, and result.",
      keywords: ["technical", "decision", "tradeoff", "system"],
    },
    {
      label: "Quality under pressure",
      jp: "納期が厳しい状況でも、妥協しない品質基準は何ですか。",
      en: "Under tight deadlines, what quality bar do you refuse to compromise on?",
      hint: "Show judgment instead of saying everything is equally important.",
      keywords: ["deadline", "quality", "testing", "risk"],
    },
  ],
  "hr-general": [
    {
      label: "Work environment",
      jp: "どのような職場環境で最も力を発揮できますか。",
      en: "In what kind of work environment do you perform best?",
      hint: "Be specific without sounding rigid or demanding.",
      keywords: ["environment", "team", "clarity", "communication"],
    },
    {
      label: "Learning approach",
      jp: "新しい分野に入ったとき、どのように学習を進めますか。",
      en: "How do you approach learning when you enter a new or unfamiliar domain?",
      hint: "Show a practical system for ramping up quickly.",
      keywords: ["learning", "new", "domain", "approach"],
    },
  ],
};
const metricColors: Record<FeedbackMetric["label"], string> = {
  Clarity: "bg-emerald-500",
  Confidence: "bg-sky-500",
  Relevance: "bg-teal-500",
  Grammar: "bg-amber-500",
  Politeness: "bg-rose-500",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function buildQuestions(config: Required<Pick<InterviewConfig, "category" | "difficulty" | "questionCount" | "includeFollowUps" | "strictMode">>) {
  const category = config.category as CategoryId;
  if (!category || !questionSeeds[category]) throw new Error(`Invalid category: ${config.category}`);
  const base = questionSeeds[category];
  const total = Number(config.questionCount);
  const questions: SessionQuestion[] = [];
  let index = 0;

  while (questions.length < total) {
    const seed = base[index % base.length];
    questions.push({
      ...seed,
      id: `${config.category}-${questions.length + 1}`,
      isFollowUp: false,
      lead: questions.length === 0
        ? config.strictMode
          ? "We will begin now. Please answer clearly, concisely, and in a formal interview style."
          : "Thank you for joining. Let's begin the mock interview."
        : "Thank you. Let's move to the next question.",
    });

    if (config.includeFollowUps && questions.length < total) {
      questions.push({
        label: `${seed.label} follow-up`,
        jp: `${seed.jp} その点について、もう一つ具体例を加えて説明してください。`, 
        en: `${seed.en} Please add one more concrete example as well.`,
        hint: "Use one specific example and make the result measurable.",
        keywords: [...seed.keywords, "example", "result"],
        id: `${config.category}-${questions.length + 1}`,
        isFollowUp: true,
        lead: config.strictMode
          ? "Please explain that in more detail and keep the tone appropriately formal."
          : "Could you explain that in a little more detail?",
      });
    }

    index += 1;
  }

  return questions.slice(0, total);
}

function buildSampleAnswer(question: SessionQuestion, config: InterviewConfig) {
  if (config.language === "english") {
    return `Thank you for the question about ${question.label.toLowerCase()}. For a ${config.jobRole} role, I would answer this by giving a concise overview, one concrete example, and the result I created. I try to keep my explanation relevant to the role and easy for the interviewer to follow.`;
  }

  return `本日は${question.label}についてご質問いただきありがとうございます。${config.jobRole}としての経験に関連する内容を、結論から簡潔にお伝えし、その後に具体例と結果を補足する形で回答いたします。面接では、分かりやすさと丁寧さの両方を意識してお話しします。`;
}
function buildSummary(history: ReviewEntry[], elapsedSeconds: number) {
  if (history.length === 0) {
    return {
      overall: 0,
      bestMetric: "Not enough data",
      weakestMetric: "Not enough data",
      completedQuestions: 0,
      skippedQuestions: 0,
      tips: ["Complete at least one reviewed answer to unlock useful summary guidance."],
      nextStep: "Run a short 3-question session and answer every prompt, even briefly.",
      summaryText: "The session ended before enough review data was collected.",
      averages: { Clarity: 0, Confidence: 0, Relevance: 0, Grammar: 0, Politeness: 0 } as Record<FeedbackMetric["label"], number>,
      duration: elapsedSeconds,
    };
  }

  const labels: FeedbackMetric["label"][] = ["Clarity", "Confidence", "Relevance", "Grammar", "Politeness"];
  const averages = labels.reduce<Record<FeedbackMetric["label"], number>>((acc, label) => {
    acc[label] = Math.round(history.reduce((sum, entry) => sum + entry.feedback.metrics.find((item) => item.label === label)!.value, 0) / history.length);
    return acc;
  }, {} as Record<FeedbackMetric["label"], number>);

  const ordered = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const overall = Math.round(history.reduce((sum, entry) => sum + entry.feedback.overall, 0) / history.length);
  const bestMetric = ordered[0][0];
  const weakestMetric = ordered[ordered.length - 1][0];
  const skippedQuestions = history.filter((entry) => entry.feedback.skipped).length;

  return {
    overall,
    bestMetric,
    weakestMetric,
    completedQuestions: history.length - skippedQuestions,
    skippedQuestions,
    tips: [
      weakestMetric === "Politeness" ? "Practice more formal Japanese interview phrasing before the next strict session." : `Do one focused drill to improve ${weakestMetric.toLowerCase()}.`,
      averages.Clarity < 72 ? "Use a repeatable answer frame so your opening line is faster and clearer." : "Keep the structure and add one stronger measurable example.",
      skippedQuestions > 0 ? "Turn each skipped question into a short written template." : "Push yourself to answer the first sentence more decisively.",
    ],
    nextStep:
      weakestMetric === "Clarity"
        ? "Practice clearer self-introductions and open with your conclusion before details."
        : weakestMetric === "Politeness"
          ? "Improve polite Japanese expressions and rehearse more formal closings."
          : `Run another session and focus on lifting ${weakestMetric.toLowerCase()} without losing relevance.`,
    summaryText: `You finished ${history.length} reviewed question${history.length > 1 ? "s" : ""} in ${formatDuration(elapsedSeconds)}. ${bestMetric} was the strongest area, while ${weakestMetric} needs the next cycle of work.`,
    averages,
    duration: elapsedSeconds,
  };
}

export default function AIInterviewWorkspace() {
  const { locale } = useTranslation();
  const copy = aiInterviewCopy[locale];
  const localizedCategories = categories.map((item) => ({ ...item, label: categoryLabels[item.value][locale] }));
  const localizedDifficulties = difficulties.map((item) => ({ ...item, label: difficultyLabels[item.value][locale] }));
  const localizedLanguages = languages.map((item) => ({ ...item, label: languageLabels[item.value][locale] }));
  const [screen, setScreen] = useState<"setup" | "session" | "summary">("setup");
  const [config, setConfig] = useState<InterviewConfig>(initialConfig);
  const [errors, setErrors] = useState<Partial<Record<"category" | "difficulty" | "jobRole", string>>>({});
  const [questions, setQuestions] = useState<SessionQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [draftAnswer, setDraftAnswer] = useState("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "thinking" | "shown">("idle");
  const [draftReview, setDraftReview] = useState<ReviewEntry | null>(null);
  const [history, setHistory] = useState<ReviewEntry[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [interviewerLine, setInterviewerLine] = useState(copy.coachNatural);
  const [reviewExpanded, setReviewExpanded] = useState(true);
  const [sessionError, setSessionError] = useState("");

  const activeQuestion = questions[currentIndex];
  const summary = useMemo(() => buildSummary(history, elapsedSeconds), [history, elapsedSeconds]);

  useEffect(() => {
    if (screen !== "session" || !startedAt) return;
    const timer = window.setInterval(() => setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000)), 1000);
    return () => window.clearInterval(timer);
  }, [screen, startedAt]);

  const updateConfig = <K extends keyof InterviewConfig>(key: K, value: InterviewConfig[K]) => {
    setConfig((current) => ({ ...current, [key]: value }));
    if (key === "category" || key === "difficulty" || key === "jobRole") {
      setErrors((current) => ({ ...current, [key]: undefined }));
    }
  };

  const startSession = () => {
    const nextErrors: Partial<Record<"category" | "difficulty" | "jobRole", string>> = {};
    if (!config.category) nextErrors.category = "Choose an interview category.";
    if (!config.difficulty) nextErrors.difficulty = "Choose a difficulty level.";
    if (!config.jobRole.trim()) nextErrors.jobRole = "Enter the target role you want to practice for.";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const nextQuestions = buildQuestions({
      category: config.category as CategoryId,
      difficulty: config.difficulty as DifficultyId,
      questionCount: config.questionCount,
      includeFollowUps: config.includeFollowUps,
      strictMode: config.strictMode,
    });

    if (nextQuestions.length === 0) {
      setSessionError("No questions were generated for this setup. Please adjust the configuration.");
      return;
    }

    setQuestions(nextQuestions);
    setCurrentIndex(0);
    setDraftAnswer("");
    setDraftReview(null);
    setFeedbackState("idle");
    setHistory([]);
    setStartedAt(Date.now());
    setElapsedSeconds(0);
    setReviewExpanded(true);
    setScreen("session");
    setSessionError("");
    setInterviewerLine(
      config.strictMode
        ? "We will begin now. Please answer concisely, formally, and with clear interview structure."
        : "We will begin now. Answer naturally, but keep your language professional."
    );
  };

  const resetSetup = () => {
    setConfig(initialConfig);
    setErrors({});
    setSessionError("");
  };

  const evaluateAnswer = (answer: string) => {
    if (!activeQuestion) return;
    setFeedbackState("thinking");
    setInterviewerLine("Thank you. Please wait while I review your answer.");

    window.setTimeout(() => {
      const feedback = buildFeedback(answer, activeQuestion, config);
      setDraftReview({ questionIndex: currentIndex, question: activeQuestion, answer, feedback });
      setFeedbackState("shown");
      setInterviewerLine(feedback.interviewerLine);
    }, 1000);
  };

  const commitReview = () => {
    if (!draftReview) return history;
    const next = [...history, draftReview];
    setHistory(next);
    setDraftReview(null);
    return next;
  };

  const nextQuestion = () => {
    const nextHistory = commitReview();
    if (currentIndex >= questions.length - 1) {
      setFeedbackState("idle");
      setScreen("summary");
      setReviewExpanded(true);
      return;
    }
    setCurrentIndex((value) => value + 1);
    setDraftAnswer("");
    setFeedbackState("idle");
    setInterviewerLine(nextHistory[nextHistory.length - 1]?.feedback.interviewerLine ?? "Thank you. Let's continue.");
  };

  const endSession = () => {
    if (feedbackState === "shown") commitReview();
    setFeedbackState("idle");
    setScreen("summary");
    setReviewExpanded(true);
  };

  return (
    <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.14),_transparent_28%),linear-gradient(180deg,#f8fafc_0%,#eef6f5_48%,#ffffff_100%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(13,148,136,0.14),_transparent_28%),linear-gradient(180deg,#020617_0%,#0f172a_48%,#020617_100%)]">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Badge className="bg-teal-700 text-white hover:bg-teal-700">{copy.badge}</Badge>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
              {copy.subtitle}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 md:min-w-[24rem]">
            <StatPill icon={Sparkles} label={copy.flow} value={copy.flowValue} />
            <StatPill icon={Brain} label={copy.feedback} value={copy.feedbackValue} />
            <StatPill icon={AlarmClock} label={copy.timer} value={screen === "summary" ? formatDuration(elapsedSeconds) : copy.liveSession} />
          </div>
        </div>

        {screen === "setup" ? (
          <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <Card className="border-white/70 bg-card/90 shadow-xl shadow-slate-200/70">
              <CardHeader className="border-b border-border/50 bg-card/80">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <Sparkles className="size-5 text-teal-700" />
                  {copy.setupTitle}
                </CardTitle>
                <CardDescription>{copy.setupDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6 pt-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Field label={copy.category} hint={errors.category ?? copy.categoryHint} error={Boolean(errors.category)}>
                    <select className={fieldClass(Boolean(errors.category))} value={config.category} onChange={(e) => updateConfig("category", e.target.value as CategoryId | "")}>
                      <option value="">{copy.selectCategory}</option>
                      {localizedCategories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </Field>
                  <Field label={copy.difficulty} hint={errors.difficulty ?? copy.difficultyHint} error={Boolean(errors.difficulty)}>
                    <select className={fieldClass(Boolean(errors.difficulty))} value={config.difficulty} onChange={(e) => updateConfig("difficulty", e.target.value as DifficultyId | "")}>
                      <option value="">{copy.selectDifficulty}</option>
                      {localizedDifficulties.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>
                  </Field>
                </div>

                <Field label={copy.jobRole} hint={errors.jobRole ?? copy.jobRoleHint} error={Boolean(errors.jobRole)}>
                  <Input
                    value={config.jobRole}
                    onChange={(e) => updateConfig("jobRole", e.target.value)}
                    placeholder={copy.jobRolePlaceholder}
                    className={cn("h-11 rounded-xl border-border px-3 focus-visible:border-teal-700 focus-visible:ring-teal-100", errors.jobRole && "border-rose-300 focus-visible:border-rose-500 focus-visible:ring-rose-100")}
                  />
                </Field>

                <div className="grid gap-6 md:grid-cols-2">
                  <Field label={copy.language} hint={copy.languageHint}>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {localizedLanguages.map((item) => <ToggleButton key={item.value} active={config.language === item.value} onClick={() => updateConfig("language", item.value)}>{item.label}</ToggleButton>)}
                    </div>
                  </Field>
                  <Field label={copy.questionCount} hint={copy.questionCountHint}>
                    <div className="flex flex-wrap gap-2">
                      {questionCounts.map((value) => <ToggleButton key={value} active={config.questionCount === value} onClick={() => updateConfig("questionCount", value)}>{value}</ToggleButton>)}
                    </div>
                  </Field>
                </div>

                <div className="grid gap-3 rounded-3xl border border-border bg-background/80 p-4 md:grid-cols-3">
                  <OptionToggle checked={config.includeFollowUps} title={copy.followUpsTitle} description={copy.followUpsDesc} onClick={() => updateConfig("includeFollowUps", !config.includeFollowUps)} />
                  <OptionToggle checked={config.showLiveHints} title={copy.hintsTitle} description={copy.hintsDesc} onClick={() => updateConfig("showLiveHints", !config.showLiveHints)} />
                  <OptionToggle checked={config.strictMode} title={copy.strictTitle} description={copy.strictDesc} onClick={() => updateConfig("strictMode", !config.strictMode)} />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-3 border-t border-border/50 bg-background/80 sm:flex-row sm:justify-between">
                <p className="text-xs leading-5 text-muted-foreground">{copy.footerNote}</p>
                <div className="flex w-full gap-3 sm:w-auto">
                  <Button variant="outline" className="h-10 flex-1 rounded-xl sm:flex-none" onClick={resetSetup}><RotateCcw className="mr-2 size-4" />{copy.reset}</Button>
                  <Button className="h-10 flex-1 rounded-xl bg-teal-700 text-white hover:bg-teal-800 sm:flex-none" onClick={startSession}>{copy.startInterview}<ArrowRight className="ml-2 size-4" /></Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="border-transparent bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white"><Bot className="size-5 text-teal-300" />{copy.coachPreview}</CardTitle>
                <CardDescription className="text-slate-300">{copy.coachDescription}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="rounded-3xl border border-white/10 bg-card/5 p-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12 ring-2 ring-teal-400/40">
                      <AvatarImage src="/images/ai-interviewer.png" alt="AI Interview Coach" />
                      <AvatarFallback className="bg-teal-950 text-teal-100">AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{copy.coachName}</div>
                      <div className="text-xs text-slate-300">{copy.coachRole}</div>
                    </div>
                  </div>
                  <div className="mt-5 rounded-2xl bg-card/10 p-4 text-sm leading-6 text-slate-100">
                    {config.strictMode ? copy.coachStrict : copy.coachNatural}
                  </div>
                </div>
                <div className="grid gap-3 text-sm">
                  <PreviewRow label={copy.category} value={localizedCategories.find((item) => item.value === config.category)?.label ?? copy.notSelected} />
                  <PreviewRow label={copy.difficulty} value={localizedDifficulties.find((item) => item.value === config.difficulty)?.label ?? copy.notSelected} />
                  <PreviewRow label={copy.language} value={localizedLanguages.find((item) => item.value === config.language)?.label ?? languageLabels.japanese[locale]} />
                  <PreviewRow label={copy.questionCount} value={config.questionCount} />
                </div>
                {sessionError ? <div className="rounded-2xl bg-rose-50 p-4 text-sm text-rose-700">{sessionError}</div> : null}
              </CardContent>
            </Card>
          </div>
        ) : null}

        {screen === "session" && activeQuestion ? (
          <div className="grid gap-6">
            <Card className="border-white/70 bg-card/90 shadow-lg shadow-slate-200/70">
              <CardContent className="grid gap-4 py-5">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-teal-700 text-white hover:bg-teal-700">{copy.sessionBadge}</Badge>
                      <Badge variant="outline" className="border-teal-200 bg-teal-50 text-teal-800">{localizedCategories.find((item) => item.value === config.category)?.label}</Badge>
                      <Badge variant="outline" className="border-sky-200 bg-sky-50 text-sky-800">{localizedDifficulties.find((item) => item.value === config.difficulty)?.label}</Badge>
                      <Badge variant="outline" className="border-border bg-background text-card-foreground">{config.jobRole}</Badge>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span>{currentIndex + 1} / {questions.length}</span>
                      <span className="inline-flex items-center gap-1"><AlarmClock className="size-4 text-teal-700" />{formatDuration(elapsedSeconds)}</span>
                      <span className="inline-flex items-center gap-1"><Languages className="size-4 text-teal-700" />{localizedLanguages.find((item) => item.value === config.language)?.label}</span>
                    </div>
                  </div>
                  <div className="xl:w-80">
                    <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
                      <span>{copy.progress}</span><span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
                    </div>
                    <Progress value={((currentIndex + 1) / questions.length) * 100} className="gap-0">
                      <ProgressTrack className="h-2 rounded-full bg-slate-200">
                        <ProgressIndicator className="bg-gradient-to-r from-teal-700 to-cyan-500" />
                      </ProgressTrack>
                    </Progress>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <Card className="overflow-hidden border-transparent bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
                <CardContent className="grid gap-5 px-6 py-8">
                  <div className="flex items-center gap-4">
                    <Avatar className="size-16 ring-4 ring-white/10">
                      <AvatarImage src="/images/ai-interviewer.png" alt="AI Interview Coach" />
                      <AvatarFallback className="bg-teal-950 text-teal-50">AI</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-semibold text-white">{copy.coachName}</div>
                      <div className="text-sm text-slate-300">{copy.coachRole}</div>
                    </div>
                  </div>
                  <div className="rounded-3xl border border-white/10 bg-card/6 p-5 text-sm leading-7 text-slate-100">{interviewerLine}</div>
                  <div className="rounded-3xl border border-white/10 bg-black/20 p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{copy.currentQuestion}</div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-medium text-white">{activeQuestion.label}</span>
                          {activeQuestion.isFollowUp ? <Badge className="bg-card/10 text-teal-100 hover:bg-card/10">{copy.followUp}</Badge> : null}
                        </div>
                      </div>
                      <button type="button" onClick={() => setInterviewerLine(activeQuestion.lead)} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-card/8">
                        <RefreshCcw className="size-3.5" />{copy.repeat}
                      </button>
                    </div>
                    <div className="mt-4 rounded-2xl bg-card px-5 py-4 text-foreground shadow-lg shadow-black/10">
                      <p className="text-lg font-semibold leading-8">{getPromptView(activeQuestion, config.language).primary}</p>
                      <p className="mt-3 text-sm leading-6 text-muted-foreground">{getPromptView(activeQuestion, config.language).secondary}</p>
                    </div>
                    {config.showLiveHints ? <div className="mt-4 rounded-2xl border border-teal-300/20 bg-teal-400/10 p-4 text-sm leading-6 text-teal-50">{activeQuestion.hint}</div> : null}
                  </div>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden border-white/70 bg-card/90 shadow-xl shadow-slate-200/70">
                <CardHeader className="border-b border-border/50 bg-card/75">
                  <CardTitle className="flex items-center gap-2 text-lg text-foreground"><MessageSquareQuote className="size-5 text-teal-700" />{copy.yourAnswer}</CardTitle>
                  <CardDescription>{copy.answerDescription}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 pt-6">
                  <div className="flex items-center justify-between text-sm">
                    <div className="font-medium text-foreground">{copy.textMode}</div>
                    <div className="text-xs text-muted-foreground">{draftAnswer.trim().length} characters</div>
                  </div>
                  <Textarea
                    value={draftAnswer}
                    onChange={(e) => setDraftAnswer(e.target.value)}
                    placeholder={config.language === "english" ? copy.englishPlaceholder : config.language === "mixed" ? copy.mixedPlaceholder : copy.japanesePlaceholder}
                    disabled={feedbackState === "thinking"}
                    className="min-h-[240px] rounded-3xl border-border bg-background/80 px-4 py-4 text-base leading-7 focus-visible:border-teal-700 focus-visible:ring-teal-100"
                  />
                  <div className="grid gap-3 rounded-3xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">
                    <p>{copy.roleFraming} <span className="font-medium text-foreground">{config.jobRole}</span>.</p>
                    <p>{copy.strictnessLabel}: {config.strictMode ? copy.strictnessStrict : copy.strictnessNormal}.</p>
                    <p>{copy.expectedStyle}</p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-border/50 bg-background/80 sm:flex-row sm:justify-between">
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => setDraftAnswer("")} disabled={!draftAnswer || feedbackState === "thinking"}>{copy.clear}</Button>
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => evaluateAnswer("")} disabled={feedbackState === "thinking"}>{copy.skipQuestion}</Button>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                    <Button variant="outline" className="h-10 rounded-xl border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800" onClick={endSession} disabled={feedbackState === "thinking"}>{copy.endSession}</Button>
                    <Button className="h-10 rounded-xl bg-teal-700 text-white hover:bg-teal-800" onClick={() => evaluateAnswer(draftAnswer)} disabled={!draftAnswer.trim() || feedbackState === "thinking"}>{copy.submitAnswer}<ArrowRight className="ml-2 size-4" /></Button>
                  </div>
                </CardFooter>

                {feedbackState === "thinking" ? (
                  <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/35 p-6 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-slate-950 px-6 py-7 text-white shadow-2xl shadow-black/30">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-full bg-teal-500/15"><Brain className="size-6 animate-pulse text-teal-300" /></div>
                        <div><div className="font-medium">AI is thinking</div><div className="mt-1 text-sm text-slate-300">Checking clarity, relevance, grammar, confidence, and politeness.</div></div>
                      </div>
                    </div>
                  </div>
                ) : null}

                {feedbackState === "shown" && draftReview ? (
                  <div className="absolute inset-0 z-20 overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm">
                    <div className="mx-auto mt-2 w-full max-w-2xl rounded-[2rem] border border-white/15 bg-card shadow-2xl shadow-black/25">
                      <div className="border-b border-border/50 bg-[linear-gradient(135deg,#ecfeff_0%,#ffffff_55%,#f8fafc_100%)] px-6 py-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-teal-700 text-white hover:bg-teal-700">Feedback</Badge>
                              {draftReview.feedback.skipped ? <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Skipped answer</Badge> : null}
                            </div>
                            <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground">{draftReview.feedback.overall}/100 overall</h2>
                            <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{draftReview.feedback.summary}</p>
                          </div>
                          <div className="rounded-3xl border border-border bg-card px-4 py-3 text-sm leading-6 text-card-foreground">{draftReview.feedback.interviewerLine}</div>
                        </div>
                      </div>
                      <div className="grid gap-6 px-6 py-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          {draftReview.feedback.metrics.map((metric) => (
                            <div key={metric.label} className="rounded-3xl border border-border bg-background/80 p-4">
                              <div className="mb-3 flex items-center justify-between text-sm"><span className="font-medium text-foreground">{metric.label}</span><span className="font-semibold text-card-foreground">{metric.value}</span></div>
                              <Progress value={metric.value} className="gap-0">
                                <ProgressTrack className="h-2 rounded-full bg-slate-200"><ProgressIndicator className={metricColors[metric.label]} /></ProgressTrack>
                              </Progress>
                            </div>
                          ))}
                        </div>
                        <FeedbackBlock title="Strengths" items={draftReview.feedback.strengths} tone="positive" />
                        <FeedbackBlock title="Weak points" items={draftReview.feedback.weakPoints} tone="warning" />
                        <FeedbackBlock title="Suggestions for improvement" items={draftReview.feedback.suggestions} tone="neutral" />
                        <ResponseCard title="Better sample answer" content={draftReview.feedback.betterSampleAnswer} />
                        {draftReview.feedback.naturalJapaneseVersion ? <ResponseCard title="More natural Japanese version" content={draftReview.feedback.naturalJapaneseVersion} /> : null}
                        {draftReview.feedback.businessPoliteVersion ? <ResponseCard title="Business polite version" content={draftReview.feedback.businessPoliteVersion} /> : null}
                      </div>
                      <div className="flex flex-col gap-3 rounded-b-[2rem] border-t border-border/50 bg-background/80 px-6 py-5 sm:flex-row sm:justify-between">
                        <Button variant="outline" className="h-10 rounded-xl" onClick={() => { setFeedbackState("idle"); setDraftReview(null); setInterviewerLine("Please revise your answer with clearer structure and stronger interview language."); }}>Retry Answer</Button>
                        <div className="flex flex-col gap-3 sm:flex-row">
                          <Button variant="outline" className="h-10 rounded-xl border-rose-200 text-rose-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800" onClick={endSession}>End Session</Button>
                          <Button className="h-10 rounded-xl bg-teal-700 text-white hover:bg-teal-800" onClick={nextQuestion}>{currentIndex >= questions.length - 1 ? "Finish Session" : "Next Question"}<ChevronRight className="ml-2 size-4" /></Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </Card>
            </div>
          </div>
        ) : null}

        {screen === "summary" ? (
          <div className="grid gap-6">
            <Card className="overflow-hidden border-transparent bg-slate-950 text-white shadow-2xl shadow-slate-300/60">
              <CardContent className="grid gap-6 px-6 py-8 md:grid-cols-[1.1fr_0.9fr] md:px-8">
                <div>
                  <Badge className="bg-teal-500 text-foreground hover:bg-teal-400">Session complete</Badge>
                  <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Final interview summary</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 md:text-base">Review the strongest area, the weakest area, and the next training target.</p>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <SummaryPill label="Overall performance" value={`${summary.overall}/100`} />
                    <SummaryPill label="Best skill area" value={summary.bestMetric} />
                    <SummaryPill label="Weakest skill area" value={summary.weakestMetric} />
                    <SummaryPill label="Session duration" value={formatDuration(elapsedSeconds)} />
                  </div>
                </div>
                <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-card/5 p-5">
                  <div className="text-sm font-medium text-white">Personalized tips</div>
                  {summary.tips.map((tip) => <p key={tip} className="text-sm leading-6 text-slate-200">{tip}</p>)}
                  <div className="rounded-3xl border border-white/10 bg-black/15 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-white"><Target className="size-4 text-teal-300" />Recommended next step</div>
                    <p className="mt-3 text-sm leading-6 text-slate-200">{summary.nextStep}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
              <Card className="border-white/70 bg-card/90 shadow-lg shadow-slate-200/70">
                <CardHeader><CardTitle className="text-lg text-foreground">Session breakdown</CardTitle><CardDescription>{summary.summaryText}</CardDescription></CardHeader>
                <CardContent className="grid gap-4">
                  <PreviewRow label="Questions completed" value={`${summary.completedQuestions} / ${questions.length || history.length || 0}`} />
                  <PreviewRow label="Skipped questions" value={String(summary.skippedQuestions)} />
                  <PreviewRow label="Average clarity" value={`${summary.averages.Clarity}/100`} />
                  <PreviewRow label="Average confidence" value={`${summary.averages.Confidence}/100`} />
                  <PreviewRow label="Average relevance" value={`${summary.averages.Relevance}/100`} />
                  <PreviewRow label="Average grammar" value={`${summary.averages.Grammar}/100`} />
                  <PreviewRow label="Average politeness" value={`${summary.averages.Politeness}/100`} />
                </CardContent>
                <CardFooter className="flex flex-col gap-3 border-t border-border/50 bg-background/80 sm:flex-row sm:justify-between">
                  <Button variant="outline" className="h-10 rounded-xl" onClick={() => setReviewExpanded((value) => !value)}>{reviewExpanded ? "Hide Review Answers" : "Review Answers"}</Button>
                  <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                    <Button variant="outline" className="h-10 rounded-xl" onClick={() => { setScreen("setup"); setQuestions([]); setCurrentIndex(0); setDraftAnswer(""); setDraftReview(null); setHistory([]); setFeedbackState("idle"); setElapsedSeconds(0); setStartedAt(null); setInterviewerLine(copy.coachNatural); }}>Start New Session</Button>
                    <Button asChild className="h-10 rounded-xl bg-teal-700 text-white hover:bg-teal-800"><Link href="/dashboard/mock-interviews">Back to Dashboard</Link></Button>
                  </div>
                </CardFooter>
              </Card>

              <Card className="border-white/70 bg-card/90 shadow-lg shadow-slate-200/70">
                <CardHeader><CardTitle className="text-lg text-foreground">Session setup used</CardTitle><CardDescription>The summary is built entirely from client-side state.</CardDescription></CardHeader>
                <CardContent className="grid gap-3 text-sm">
                  <PreviewRow label={copy.category} value={localizedCategories.find((item) => item.value === config.category)?.label ?? "-"} />
                  <PreviewRow label={copy.difficulty} value={localizedDifficulties.find((item) => item.value === config.difficulty)?.label ?? "-"} />
                  <PreviewRow label={copy.language} value={localizedLanguages.find((item) => item.value === config.language)?.label ?? "-"} />
                  <PreviewRow label="Role" value={config.jobRole || "-"} />
                </CardContent>
              </Card>
            </div>

            {reviewExpanded ? (
              <Card className="border-white/70 bg-card/90 shadow-lg shadow-slate-200/70">
                <CardHeader><CardTitle className="text-lg text-foreground">Review answers</CardTitle><CardDescription>Previous answers are kept in component state and rendered in collapsible sections.</CardDescription></CardHeader>
                <CardContent>
                  {history.length === 0 ? <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">No reviewed answers were recorded in this session.</div> : (
                    <Accordion className="gap-3">
                      {history.map((entry) => (
                        <AccordionItem key={entry.question.id} value={entry.question.id} className="rounded-3xl border border-border px-5">
                          <AccordionTrigger className="py-5 text-left text-sm font-medium text-foreground hover:no-underline">
                            <div><div>Question {entry.questionIndex + 1}</div><div className="mt-1 text-xs font-normal text-muted-foreground">{entry.question.label}</div></div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-5 text-sm text-muted-foreground">
                            <div className="grid gap-4">
                              <ResponseCard title="Question" content={getPromptView(entry.question, config.language).primary} />
                              <ResponseCard title="Your answer" content={entry.answer || "Question skipped."} />
                              <ResponseCard title="AI summary" content={entry.feedback.summary} />
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function fieldClass(hasError: boolean) {
  return cn("h-11 w-full rounded-xl border bg-card px-3 text-sm text-foreground outline-none transition focus:border-teal-700 focus:ring-4 focus:ring-teal-100", hasError ? "border-rose-300 focus:border-rose-500 focus:ring-rose-100" : "border-border");
}

function Field({ label, hint, error = false, children }: { label: string; hint: string; error?: boolean; children: ReactNode }) {
  return <div className="grid gap-2.5"><Label className="text-sm font-medium text-foreground">{label}</Label>{children}<p className={cn("text-xs", error ? "font-medium text-rose-600" : "text-muted-foreground")}>{hint}</p></div>;
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={cn("rounded-2xl border px-4 py-3 text-sm font-medium transition", active ? "border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-700/20" : "border-border bg-card text-card-foreground hover:border-teal-200 hover:bg-teal-50")}>{children}</button>;
}

function OptionToggle({ checked, title, description, onClick }: { checked: boolean; title: string; description: string; onClick: () => void }) {
  return <button type="button" aria-pressed={checked} onClick={onClick} className={cn("rounded-2xl border px-4 py-4 text-left transition", checked ? "border-teal-700 bg-teal-700 text-white shadow-lg shadow-teal-700/20" : "border-border bg-card text-card-foreground hover:border-teal-200 hover:bg-teal-50")}><div className="font-medium">{title}</div><p className={cn("mt-3 text-xs leading-5", checked ? "text-teal-50" : "text-muted-foreground")}>{description}</p></button>;
}

function FeedbackBlock({ title, items, tone }: { title: string; items: string[]; tone: "positive" | "warning" | "neutral" }) {
  const classes = tone === "positive" ? "border-emerald-100 bg-emerald-50/80" : tone === "warning" ? "border-amber-100 bg-amber-50/80" : "border-border bg-background/80";
  return <div className={cn("rounded-3xl border p-4", classes)}><div className="flex items-center gap-2 text-sm font-medium text-foreground">{tone === "positive" ? <CheckCircle2 className="size-4 text-emerald-600" /> : tone === "warning" ? <CircleAlert className="size-4 text-amber-600" /> : <Star className="size-4 text-teal-700" />}{title}</div><div className="mt-3 grid gap-2 text-sm leading-6 text-card-foreground">{items.map((item) => <p key={item}>{item}</p>)}</div></div>;
}

function ResponseCard({ title, content }: { title: string; content: string }) {
  return <div className="rounded-3xl border border-border bg-background/80 p-5"><div className="text-sm font-medium text-foreground">{title}</div><p className="mt-3 whitespace-pre-line text-sm leading-7 text-card-foreground">{content}</p></div>;
}

function StatPill({ icon: Icon, label, value }: { icon: typeof Sparkles; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/70 bg-card/75 px-4 py-3 shadow-sm shadow-slate-200/70"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><Icon className="size-3.5 text-teal-700" />{label}</div><div className="mt-2 text-sm font-medium text-foreground">{value}</div></div>;
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return <div className="flex items-center justify-between gap-4 border-b border-dashed border-border pb-3 text-sm last:border-b-0 last:pb-0"><span className="text-muted-foreground">{label}</span><span className="text-right font-medium text-foreground">{value}</span></div>;
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl border border-white/10 bg-card/6 p-4"><div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div><div className="mt-2 text-lg font-semibold text-white">{value}</div></div>;
}
