import type { Locale } from "@/i18n";

type LocaleMap = Record<Locale, string>;

const difficultyLabels: Record<string, LocaleMap> = {
  beginner: {
    en: "Beginner",
    ru: "Начинающий",
    ja: "初級",
    uz: "Boshlang'ich",
  },
  intermediate: {
    en: "Intermediate",
    ru: "Средний",
    ja: "中級",
    uz: "O'rta",
  },
  advanced: {
    en: "Advanced",
    ru: "Продвинутый",
    ja: "上級",
    uz: "Yuqori",
  },
  easy: {
    en: "Easy",
    ru: "Легко",
    ja: "易しい",
    uz: "Oson",
  },
  medium: {
    en: "Medium",
    ru: "Средне",
    ja: "普通",
    uz: "O'rta",
  },
  hard: {
    en: "Hard",
    ru: "Сложно",
    ja: "難しい",
    uz: "Qiyin",
  },
  "entry-level": {
    en: "Entry-level",
    ru: "Начальный уровень",
    ja: "初級レベル",
    uz: "Boshlang'ich daraja",
  },
  "mid-level": {
    en: "Mid-level",
    ru: "Средний уровень",
    ja: "中級レベル",
    uz: "O'rta daraja",
  },
};

const categoryLabels: Record<string, LocaleMap> = {
  "self-introduction": {
    en: "Self-Introduction",
    ru: "Самопрезентация",
    ja: "自己紹介",
    uz: "O'zini tanishtirish",
  },
  "self introduction": {
    en: "Self-Introduction",
    ru: "Самопрезентация",
    ja: "自己紹介",
    uz: "O'zini tanishtirish",
  },
  "career vision": {
    en: "Career Vision",
    ru: "Карьерные цели",
    ja: "キャリアビジョン",
    uz: "Karyera yo'nalishi",
  },
  strategy: {
    en: "Strategy",
    ru: "Стратегия",
    ja: "戦略",
    uz: "Strategiya",
  },
  motivation: {
    en: "Motivation",
    ru: "Мотивация",
    ja: "志望動機",
    uz: "Motivatsiya",
  },
  "strengths and weaknesses": {
    en: "Strengths and Weaknesses",
    ru: "Сильные и слабые стороны",
    ja: "強みと弱み",
    uz: "Kuchli va zaif tomonlar",
  },
  teamwork: {
    en: "Teamwork",
    ru: "Командная работа",
    ja: "チームワーク",
    uz: "Jamoaviy ish",
  },
  communication: {
    en: "Communication",
    ru: "Коммуникация",
    ja: "コミュニケーション",
    uz: "Muloqot",
  },
  "problem solving": {
    en: "Problem Solving",
    ru: "Решение проблем",
    ja: "問題解決",
    uz: "Muammo yechish",
  },
  "business manners": {
    en: "Japanese Business Manners",
    ru: "Японский деловой этикет",
    ja: "日本のビジネスマナー",
    uz: "Yapon biznes odobi",
  },
  technical: {
    en: "Technical",
    ru: "Техническое",
    ja: "技術面接",
    uz: "Texnik",
  },
  "hr general": {
    en: "HR / General",
    ru: "HR / Общие вопросы",
    ja: "人事 / 一般質問",
    uz: "HR / Umumiy savollar",
  },
};

const materialTypeLabels: Record<string, LocaleMap> = {
  article: {
    en: "Article",
    ru: "Статья",
    ja: "記事",
    uz: "Maqola",
  },
  video: {
    en: "Video",
    ru: "Видео",
    ja: "動画",
    uz: "Video",
  },
  book: {
    en: "Book",
    ru: "Книга",
    ja: "本",
    uz: "Kitob",
  },
};

function normalizeKey(value: string | null | undefined) {
  return value?.trim().toLowerCase().replace(/[_/]+/g, " ").replace(/\s+/g, " ") ?? "";
}

export function localizeDifficulty(locale: Locale, value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const normalized = normalizeKey(value);
  return difficultyLabels[normalized]?.[locale] ?? value;
}

export function localizeCategory(locale: Locale, value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const normalized = normalizeKey(value);
  return categoryLabels[normalized]?.[locale] ?? value;
}

export function localizeMaterialType(locale: Locale, value: string | null | undefined) {
  if (!value) {
    return "";
  }

  const normalized = normalizeKey(value);
  return materialTypeLabels[normalized]?.[locale] ?? value;
}
