import type { Locale } from "@/i18n";

export const discussionTypeOptions = [
  {
    value: "QUESTION",
    label: "Question / Help",
    description: "Ask for advice, clarification, or support on a topic.",
  },
  {
    value: "MOCK_ANSWER",
    label: "Mock Answer Feedback",
    description: "Post an answer and get structured interview feedback.",
  },
  {
    value: "EXPERIENCE",
    label: "Interview Experience",
    description: "Share what happened in a real interview and what you learned.",
  },
  {
    value: "RESUME_REVIEW",
    label: "Resume / Self-Intro Review",
    description: "Request feedback on your self-introduction or application story.",
  },
] as const;

export const defaultCategorySeeds = [
  { name: "Self-Introduction", description: "Questions about your background and personal history." },
  { name: "Motivation / Why Japan", description: "Questions about your drive to work in Japan." },
  { name: "Behavioral & Strengths", description: "Questions about your personality and soft skills." },
  { name: "IT & Technical", description: "Technical questions related to software engineering." },
  { name: "Teamwork & Communication", description: "Questions about collaborating with others." },
  { name: "Career Vision", description: "Questions about your future goals." },
  { name: "Preparation", description: "Materials for initial application phases." },
  { name: "Culture", description: "Insights into Japanese corporate culture." },
  { name: "Language", description: "Resources for Japanese language proficiency." },
  { name: "Technical", description: "Resources for technical skill improvement." },
  { name: "Strategy", description: "Interview and job hunting strategies." },
] as const;

export const discussionStatusOptions = [
  { value: "all", label: "All status" },
  { value: "OPEN", label: "Open" },
  { value: "SOLVED", label: "Solved" },
  { value: "UNANSWERED", label: "Unanswered" },
] as const;

export const communitySortOptions = [
  { value: "recent", label: "Latest activity" },
  { value: "most_discussed", label: "Most discussed" },
  { value: "most_helpful", label: "Most reactions" },
] as const;

export const reactionTypeOptions = ["LIKE", "DISLIKE"] as const;

export type DiscussionTypeValue = (typeof discussionTypeOptions)[number]["value"];
export type DiscussionStatusFilterValue = (typeof discussionStatusOptions)[number]["value"];
export type CommunitySortValue = (typeof communitySortOptions)[number]["value"];
export type ReactionTypeValue = (typeof reactionTypeOptions)[number];

const discussionTypeSet = new Set(discussionTypeOptions.map((option) => option.value));
const sortValueSet = new Set(communitySortOptions.map((option) => option.value));
const statusFilterSet = new Set(discussionStatusOptions.map((option) => option.value));
const reactionTypeSet = new Set(reactionTypeOptions);
const japaneseLevels = ["N5", "N4", "N3", "N2", "N1", "NATIVE"] as const;
const japaneseLevelSet = new Set(japaneseLevels);

export function isDiscussionType(value: string): value is DiscussionTypeValue {
  return discussionTypeSet.has(value as DiscussionTypeValue);
}

export function isCommunitySort(value: string): value is CommunitySortValue {
  return sortValueSet.has(value as CommunitySortValue);
}

export function isDiscussionStatusFilter(value: string): value is DiscussionStatusFilterValue {
  return statusFilterSet.has(value as DiscussionStatusFilterValue);
}

export function isJapaneseLevel(value: string): value is (typeof japaneseLevels)[number] {
  return japaneseLevelSet.has(value as (typeof japaneseLevels)[number]);
}

export function isReactionType(value: string): value is ReactionTypeValue {
  return reactionTypeSet.has(value as ReactionTypeValue);
}

export function getDiscussionTypeLabel(value: string) {
  return discussionTypeOptions.find((option) => option.value === value)?.label ?? value;
}

export function getDiscussionStatusLabel(value: string) {
  if (value === "OPEN") return "Open";
  if (value === "SOLVED") return "Solved";
  return value;
}

export function getDiscussionTypeHint(value: DiscussionTypeValue) {
  switch (value) {
    case "QUESTION":
      return "Explain the issue clearly and include what you already tried.";
    case "MOCK_ANSWER":
      return "Share the interview prompt and your full answer so peers can score it.";
    case "EXPERIENCE":
      return "Summarize the company, stage, and key lessons for future candidates.";
    case "RESUME_REVIEW":
      return "Paste the self-introduction, summary, or resume section you want reviewed.";
  }
}

export const peerFeedbackFields = [
  { name: "feedbackClarity", label: "Clarity" },
  { name: "feedbackRelevance", label: "Relevance" },
  { name: "feedbackGrammar", label: "Grammar" },
  { name: "feedbackPoliteness", label: "Politeness" },
] as const;

export function formatRelativeRole(roleContext?: string | null, levelContext?: string | null) {
  if (roleContext && levelContext) {
    return `${roleContext} | JLPT ${levelContext}`;
  }

  if (roleContext) {
    return roleContext;
  }

  if (levelContext) {
    return `JLPT ${levelContext}`;
  }

  return null;
}

const discussionTypeLocaleLabels: Record<string, Record<Locale, string>> = {
  QUESTION: {
    en: "Question / Help",
    ru: "Вопрос / Помощь",
    ja: "質問 / ヘルプ",
    uz: "Savol / Yordam",
  },
  MOCK_ANSWER: {
    en: "Mock Answer Feedback",
    ru: "Разбор пробного ответа",
    ja: "模擬回答フィードバック",
    uz: "Mock javob bo'yicha fikr",
  },
  EXPERIENCE: {
    en: "Interview Experience",
    ru: "Опыт интервью",
    ja: "面接体験",
    uz: "Intervyu tajribasi",
  },
  RESUME_REVIEW: {
    en: "Resume / Self-Intro Review",
    ru: "Проверка резюме / самопрезентации",
    ja: "履歴書 / 自己紹介レビュー",
    uz: "Rezyume / o'zini tanishtirish tahlili",
  },
};

const discussionStatusLocaleLabels: Record<string, Record<Locale, string>> = {
  all: {
    en: "All status",
    ru: "Все статусы",
    ja: "すべての状態",
    uz: "Barcha holatlar",
  },
  OPEN: {
    en: "Open",
    ru: "Открыто",
    ja: "受付中",
    uz: "Ochiq",
  },
  SOLVED: {
    en: "Solved",
    ru: "Решено",
    ja: "解決済み",
    uz: "Yechilgan",
  },
  UNANSWERED: {
    en: "Unanswered",
    ru: "Без ответа",
    ja: "未回答",
    uz: "Javobsiz",
  },
};

const communitySortLocaleLabels: Record<string, Record<Locale, string>> = {
  recent: {
    en: "Latest activity",
    ru: "Последняя активность",
    ja: "最新のアクティビティ",
    uz: "So'nggi faollik",
  },
  most_discussed: {
    en: "Most discussed",
    ru: "Самые обсуждаемые",
    ja: "議論が多い順",
    uz: "Eng ko'p muhokama qilingan",
  },
  most_helpful: {
    en: "Most reactions",
    ru: "Больше всего реакций",
    ja: "リアクションが多い順",
    uz: "Eng ko'p reaksiya",
  },
};

export function getLocalizedDiscussionTypeLabel(locale: Locale, value: string) {
  return discussionTypeLocaleLabels[value]?.[locale] ?? getDiscussionTypeLabel(value);
}

export function getLocalizedDiscussionStatusLabel(locale: Locale, value: string) {
  return discussionStatusLocaleLabels[value]?.[locale] ?? getDiscussionStatusLabel(value);
}

export function getLocalizedDiscussionTypeOptions(locale: Locale) {
  return discussionTypeOptions.map((option) => ({
    ...option,
    label: discussionTypeLocaleLabels[option.value]?.[locale] ?? option.label,
  }));
}

export function getLocalizedDiscussionStatusOptions(locale: Locale) {
  return discussionStatusOptions.map((option) => ({
    ...option,
    label: discussionStatusLocaleLabels[option.value]?.[locale] ?? option.label,
  }));
}

export function getLocalizedCommunitySortOptions(locale: Locale) {
  return communitySortOptions.map((option) => ({
    ...option,
    label: communitySortLocaleLabels[option.value]?.[locale] ?? option.label,
  }));
}
