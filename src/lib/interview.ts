export type CategoryId =
  | "self-introduction"
  | "motivation"
  | "strengths"
  | "teamwork"
  | "problem-solving"
  | "business-manners"
  | "technical"
  | "hr-general";

export type DifficultyId = "entry" | "mid" | "advanced";
export type LanguageId = "japanese" | "english" | "mixed";
export type QuestionCountId = "3" | "5" | "10";
export type FeedbackMetricLabel = "Clarity" | "Confidence" | "Relevance" | "Grammar" | "Politeness";

export type InterviewConfig = {
  category: CategoryId | "";
  difficulty: DifficultyId | "";
  jobRole: string;
  language: LanguageId;
  questionCount: QuestionCountId;
  includeFollowUps: boolean;
  showLiveHints: boolean;
  strictMode: boolean;
};

export type StoredInterviewConfig = Omit<InterviewConfig, "category" | "difficulty"> & {
  category: CategoryId;
  difficulty: DifficultyId;
};

export type QuestionSeed = {
  label: string;
  jp: string;
  en: string;
  hint: string;
  keywords: string[];
};

export type SessionQuestion = QuestionSeed & {
  id: string;
  isFollowUp: boolean;
  lead: string;
};

export type FeedbackMetric = {
  label: FeedbackMetricLabel;
  value: number;
};

export type FeedbackData = {
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

export type ReviewEntry = {
  questionIndex: number;
  question: SessionQuestion;
  answer: string;
  feedback: FeedbackData;
};

export type ChatRole = "assistant" | "user";

export type ChatMessage = {
  role: ChatRole;
  content: string;
  createdAt: string;
  questionIndex?: number;
};

export type InterviewSummary = {
  overall: number;
  bestMetric: string;
  weakestMetric: string;
  completedQuestions: number;
  skippedQuestions: number;
  tips: string[];
  nextStep: string;
  summaryText: string;
  averages: Record<FeedbackMetricLabel, number>;
  duration: number;
};

export type InterviewSessionState = {
  config: StoredInterviewConfig;
  questions: SessionQuestion[];
  currentIndex: number;
  history: ReviewEntry[];
  conversation?: ChatMessage[];
  startedAt: string;
  updatedAt: string;
  status: "in_progress" | "completed";
  summary?: InterviewSummary;
};

export const initialInterviewConfig: InterviewConfig = {
  category: "",
  difficulty: "",
  jobRole: "",
  language: "japanese",
  questionCount: "5",
  includeFollowUps: true,
  showLiveHints: true,
  strictMode: false,
};

export const interviewCategories: { value: CategoryId; label: string; description: string }[] = [
  { value: "self-introduction", label: "Self Introduction", description: "Opening pitch, background, and first impression." },
  { value: "motivation", label: "Motivation / Why this company", description: "Intent, company fit, and career direction." },
  { value: "strengths", label: "Strengths and Weaknesses", description: "Self-awareness and reflection." },
  { value: "teamwork", label: "Teamwork / Communication", description: "Collaboration and conflict handling." },
  { value: "problem-solving", label: "Problem Solving", description: "Troubleshooting and prioritization." },
  { value: "business-manners", label: "Japanese Business Manners", description: "Keigo, etiquette, and professional tone." },
  { value: "technical", label: "IT / Technical Interview", description: "Engineering judgment and architecture." },
  { value: "hr-general", label: "HR / General Questions", description: "Workstyle, learning, and fit." },
];

export const interviewDifficulties: { value: DifficultyId; label: string }[] = [
  { value: "entry", label: "Entry-level" },
  { value: "mid", label: "Mid-level" },
  { value: "advanced", label: "Advanced" },
];

export const interviewLanguages: { value: LanguageId; label: string }[] = [
  { value: "japanese", label: "Japanese" },
  { value: "english", label: "English" },
  { value: "mixed", label: "Mixed" },
];

export const interviewQuestionCounts: QuestionCountId[] = ["3", "5", "10"];

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

const metricLabels: FeedbackMetricLabel[] = ["Clarity", "Confidence", "Relevance", "Grammar", "Politeness"];
const japanesePolitePatterns = [/よろしくお願いいたします/u, /よろしくお願いします/u, /申します/u, /いたします/u, /ございます/u, /御社/u, /貴社/u];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function getDifficultyPressure(difficulty: DifficultyId) {
  switch (difficulty) {
    case "advanced":
      return 10;
    case "mid":
      return 5;
    default:
      return 0;
  }
}

function getRolePrompt(role: string, language: LanguageId) {
  const normalizedRole = normalizeWhitespace(role);
  if (!normalizedRole) {
    return { jp: "", en: "" };
  }

  if (language === "english") {
    return {
      jp: "",
      en: ` Please answer with the expectations of a ${normalizedRole} role in mind.`,
    };
  }

  return {
    jp: ` ${normalizedRole}職として期待される視点も含めてお答えください。`,
    en: ` Please answer with the expectations of a ${normalizedRole} role in mind.`,
  };
}

function buildQuestionLead(config: StoredInterviewConfig, isFirstQuestion: boolean, isFollowUp: boolean) {
  if (isFirstQuestion) {
    if (config.strictMode || config.difficulty === "advanced") {
      return "We will begin now. Please answer clearly, concisely, and in a formal interview style.";
    }

    return "Thank you for joining. Let's begin the mock interview.";
  }

  if (isFollowUp) {
    if (config.strictMode || config.difficulty === "advanced") {
      return "Please explain that in more detail and keep the tone appropriately formal.";
    }

    return "Could you explain that in a little more detail?";
  }

  if (config.difficulty === "advanced") {
    return "Thank you. Let's move forward. Please keep your answer concise and precise.";
  }

  return "Thank you. Let's move to the next question.";
}

function createQuestionId(index: number) {
  return `session-question-${index + 1}`;
}

export function buildQuestions(config: StoredInterviewConfig) {
  const base = questionSeeds[config.category];
  const total = Number(config.questionCount);
  const questions: SessionQuestion[] = [];
  const rolePrompt = getRolePrompt(config.jobRole, config.language);
  const advancedHint =
    config.difficulty === "advanced" ? " Add tradeoffs, measurable impact, and a concise conclusion." : "";
  let index = 0;

  while (questions.length < total) {
    const seed = base[index % base.length];
    const isFirstQuestion = questions.length === 0;

    questions.push({
      ...seed,
      jp: `${seed.jp}${rolePrompt.jp}`,
      en: `${seed.en}${rolePrompt.en}`,
      hint: `${seed.hint}${advancedHint}`.trim(),
      keywords: config.difficulty === "advanced" ? [...seed.keywords, "tradeoff", "impact"] : seed.keywords,
      id: `${config.category}-${questions.length + 1}`,
      isFollowUp: false,
      lead: buildQuestionLead(config, isFirstQuestion, false),
    });

    if (config.includeFollowUps && questions.length < total) {
      questions.push({
        label: `${seed.label} follow-up`,
        jp: `${seed.jp}${rolePrompt.jp} その点について、もう一つ具体例を加えて説明してください。`,
        en: `${seed.en}${rolePrompt.en} Please add one more concrete example as well.`,
        hint: `Use one specific example and make the result measurable.${advancedHint}`,
        keywords: [...seed.keywords, "example", "result"],
        id: `${config.category}-${questions.length + 1}`,
        isFollowUp: true,
        lead: buildQuestionLead(config, false, true),
      });
    }

    index += 1;
  }

  return questions.slice(0, total);
}

export function getPlannedQuestionCount(config: StoredInterviewConfig) {
  return Number(config.questionCount);
}

export function getFallbackQuestion(config: StoredInterviewConfig, index: number) {
  return buildQuestions(config)[index] ?? null;
}

export function normalizeSessionQuestion(
  candidate: unknown,
  fallback: SessionQuestion | null,
  index: number
): SessionQuestion {
  const base =
    fallback ??
    ({
      id: createQuestionId(index),
      label: `Question ${index + 1}`,
      jp: "この質問に回答してください。",
      en: "Please answer this interview question.",
      hint: "Give a concise answer with one concrete example.",
      keywords: ["experience", "example", "result"],
      isFollowUp: false,
      lead: "Please answer clearly and concisely.",
    } satisfies SessionQuestion);

  if (!candidate || typeof candidate !== "object") {
    return base;
  }

  const value = candidate as Partial<SessionQuestion>;
  const keywords =
    Array.isArray(value.keywords) && value.keywords.some((item) => typeof item === "string" && item.trim())
      ? value.keywords.filter((item): item is string => typeof item === "string" && item.trim()).slice(0, 8)
      : base.keywords;

  return {
    id: typeof value.id === "string" && value.id.trim() ? value.id : base.id,
    label: typeof value.label === "string" && value.label.trim() ? value.label : base.label,
    jp: typeof value.jp === "string" && value.jp.trim() ? value.jp : base.jp,
    en: typeof value.en === "string" && value.en.trim() ? value.en : base.en,
    hint: typeof value.hint === "string" && value.hint.trim() ? value.hint : base.hint,
    keywords,
    isFollowUp: typeof value.isFollowUp === "boolean" ? value.isFollowUp : base.isFollowUp,
    lead: typeof value.lead === "string" && value.lead.trim() ? value.lead : base.lead,
  };
}

export function buildSampleAnswer(question: SessionQuestion, config: StoredInterviewConfig) {
  if (config.language === "english") {
    return `Thank you for the question about ${question.label.toLowerCase()}. For a ${config.jobRole} role, I would answer this by giving a concise overview, one concrete example, and the result I created. I try to keep my explanation relevant to the role and easy for the interviewer to follow.`;
  }

  return `本日は${question.label}についてご質問いただきありがとうございます。${config.jobRole}としての経験に関連する内容を、結論から簡潔にお伝えし、その後に具体例と結果を補足する形で回答いたします。面接では、分かりやすさと丁寧さの両方を意識してお話しいたします。`;
}

function buildNaturalJapaneseVersion(answer: string, question: SessionQuestion, config: StoredInterviewConfig) {
  const normalized = normalizeWhitespace(answer);
  if (!normalized) {
    return buildSampleAnswer(question, config);
  }

  if (normalized.includes("です。") || normalized.includes("ます。")) {
    return normalized;
  }

  return `${normalized}。`;
}

function buildBusinessPoliteVersion(answer: string, question: SessionQuestion, config: StoredInterviewConfig) {
  const normalized = normalizeWhitespace(answer);
  if (!normalized) {
    return buildSampleAnswer(question, config);
  }

  if (/申します|いたします|ございます/u.test(normalized)) {
    return normalized;
  }

  return `恐れ入ります。${normalized.replace(/です/g, "でございます").replace(/します/g, "いたします")}`;
}

export function buildFallbackFeedback(answer: string, question: SessionQuestion, config: StoredInterviewConfig): FeedbackData {
  const trimmedAnswer = answer.trim();
  const normalizedLower = trimmedAnswer.toLowerCase();
  const isSkipped = !trimmedAnswer;
  const answerLength = trimmedAnswer.length;
  const structure = answer.split("\n").filter((line) => line.trim()).length;
  const hasKeywords = question.keywords.some((keyword) => normalizedLower.includes(keyword.toLowerCase()));
  const politeHits = japanesePolitePatterns.filter((pattern) => pattern.test(trimmedAnswer)).length;
  const englishCourtesyHits = ["thank", "appreciate", "glad", "certainly"].filter((token) => normalizedLower.includes(token)).length;
  const difficultyPressure = getDifficultyPressure(config.difficulty) + (config.strictMode ? 8 : 0);

  let clarity = isSkipped ? 20 : 48 + Math.floor(answerLength / 22) + (structure >= 2 ? 14 : 0) + (hasKeywords ? 8 : 0) - difficultyPressure;
  let confidence = isSkipped ? 25 : 52 + Math.floor(answerLength / 28) + (hasKeywords ? 12 : 0) - Math.floor(difficultyPressure / 2);
  let relevance = isSkipped ? 25 : 56 + (hasKeywords ? 24 : 4) + Math.min(10, question.keywords.length * 2) - Math.floor(difficultyPressure / 2);
  let grammar = isSkipped ? 35 : 58 + (answerLength > 60 ? 12 : 0) + ((trimmedAnswer.includes("。") || /[.!?]/.test(trimmedAnswer)) ? 10 : 0) - Math.floor(difficultyPressure / 2);
  let politeness =
    isSkipped
      ? 30
      : 52 +
        (config.language !== "english" ? politeHits * 8 : englishCourtesyHits * 8) +
        (config.strictMode ? -6 : 0) +
        (config.language === "mixed" ? 4 : 0);

  clarity = clamp(clarity, 20, 95);
  confidence = clamp(confidence, 20, 95);
  relevance = clamp(relevance, 20, 95);
  grammar = clamp(grammar, 20, 95);
  politeness = clamp(politeness, 20, 95);

  const overall = Math.round((clarity + confidence + relevance + grammar + politeness) / 5);
  const metrics: FeedbackMetric[] = [
    { label: "Clarity", value: clarity },
    { label: "Confidence", value: confidence },
    { label: "Relevance", value: relevance },
    { label: "Grammar", value: grammar },
    { label: "Politeness", value: politeness },
  ];

  const strengths: string[] = [];
  const weakPoints: string[] = [];
  const suggestions: string[] = [];

  if (clarity >= 70) strengths.push("Clear opening and structure");
  if (confidence >= 70) strengths.push("Confident tone and delivery");
  if (relevance >= 75) strengths.push("Relevant examples and keywords");
  if (grammar >= 70) strengths.push("Good grammar and sentence flow");
  if (politeness >= 70) strengths.push("Professional and respectful tone");

  if (clarity < 60) weakPoints.push("Opening could be clearer; start with your conclusion first.");
  if (confidence < 60) weakPoints.push("Build more confidence by adding one concrete accomplishment.");
  if (relevance < 60) weakPoints.push("The answer needs stronger alignment with the question and role.");
  if (grammar < 60) weakPoints.push("Sentence flow is rough in places. Use shorter, cleaner statements.");
  if (politeness < 60) weakPoints.push("Use more formal interview phrasing and more respectful wording.");

  if (answerLength < 35) suggestions.push("Expand your answer with more detail and one concrete example.");
  if (!hasKeywords) suggestions.push(`Try incorporating key terms like: ${question.keywords.slice(0, 3).join(", ")}`);
  if (structure < 2) suggestions.push("Structure your answer as conclusion, example, and result.");
  if (config.strictMode && politeness < 75) suggestions.push("In strict mode, keigo and business phrasing need to be more precise.");
  if (config.difficulty === "advanced" && relevance < 75) suggestions.push("Advanced sessions should show tradeoffs, judgment, and measurable impact.");
  if (metrics.some((metric) => metric.value < 60)) suggestions.push("Re-answer this question after revising your structure and tone.");

  const interviewerLine =
    overall > 84
      ? "Excellent answer. Clear, confident, and well-structured."
      : overall > 72
        ? "That was solid. The structure worked and the example was relevant."
        : overall > 58
          ? "Good effort. Strengthen the structure and make the example more concrete."
          : "That answer was too thin for the question. Add a clearer structure and a stronger example.";

  const naturalJapaneseVersion =
    config.language === "english" ? undefined : buildNaturalJapaneseVersion(trimmedAnswer, question, config);
  const businessPoliteVersion =
    config.language === "english" ? undefined : buildBusinessPoliteVersion(trimmedAnswer, question, config);

  return {
    overall,
    summary: interviewerLine,
    strengths: strengths.length > 0 ? strengths : ["Answer was recorded."],
    weakPoints: weakPoints.length > 0 ? weakPoints : ["No major risk stood out in this answer."],
    suggestions: suggestions.length > 0 ? suggestions : ["Keep practicing to make the answer tighter and more memorable."],
    betterSampleAnswer: buildSampleAnswer(question, config),
    naturalJapaneseVersion,
    businessPoliteVersion,
    metrics,
    interviewerLine,
    skipped: isSkipped,
  };
}

function isMetricLabel(value: unknown): value is FeedbackMetricLabel {
  return typeof value === "string" && metricLabels.includes(value as FeedbackMetricLabel);
}

export function normalizeFeedbackData(candidate: unknown, fallback: FeedbackData): FeedbackData {
  if (!candidate || typeof candidate !== "object") {
    return fallback;
  }

  const value = candidate as Partial<FeedbackData> & {
    metrics?: Array<Partial<FeedbackMetric>>;
  };
  const metrics =
    Array.isArray(value.metrics) && value.metrics.length === metricLabels.length
      ? metricLabels.map((label, index) => {
          const metric = value.metrics?.find((item) => item?.label === label) ?? value.metrics?.[index];
          return {
            label,
            value: clamp(Number(metric?.value ?? fallback.metrics[index].value), 0, 100),
          };
        })
      : fallback.metrics;

  return {
    overall: clamp(Number(value.overall ?? fallback.overall), 0, 100),
    summary: typeof value.summary === "string" && value.summary.trim() ? value.summary : fallback.summary,
    strengths: Array.isArray(value.strengths) && value.strengths.every((item) => typeof item === "string") && value.strengths.length > 0 ? value.strengths : fallback.strengths,
    weakPoints: Array.isArray(value.weakPoints) && value.weakPoints.every((item) => typeof item === "string") && value.weakPoints.length > 0 ? value.weakPoints : fallback.weakPoints,
    suggestions: Array.isArray(value.suggestions) && value.suggestions.every((item) => typeof item === "string") && value.suggestions.length > 0 ? value.suggestions : fallback.suggestions,
    betterSampleAnswer:
      typeof value.betterSampleAnswer === "string" && value.betterSampleAnswer.trim()
        ? value.betterSampleAnswer
        : fallback.betterSampleAnswer,
    naturalJapaneseVersion:
      typeof value.naturalJapaneseVersion === "string" && value.naturalJapaneseVersion.trim()
        ? value.naturalJapaneseVersion
        : fallback.naturalJapaneseVersion,
    businessPoliteVersion:
      typeof value.businessPoliteVersion === "string" && value.businessPoliteVersion.trim()
        ? value.businessPoliteVersion
        : fallback.businessPoliteVersion,
    metrics,
    interviewerLine:
      typeof value.interviewerLine === "string" && value.interviewerLine.trim()
        ? value.interviewerLine
        : fallback.interviewerLine,
    skipped: typeof value.skipped === "boolean" ? value.skipped : fallback.skipped,
  };
}

export function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function buildSummary(history: ReviewEntry[], elapsedSeconds: number): InterviewSummary {
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
      averages: { Clarity: 0, Confidence: 0, Relevance: 0, Grammar: 0, Politeness: 0 },
      duration: elapsedSeconds,
    };
  }

  const averages = metricLabels.reduce<Record<FeedbackMetricLabel, number>>((acc, label) => {
    acc[label] = Math.round(
      history.reduce((sum, entry) => {
        const metric = entry.feedback.metrics.find((item) => item.label === label);
        return sum + (metric?.value ?? 0);
      }, 0) / history.length
    );
    return acc;
  }, {} as Record<FeedbackMetricLabel, number>);

  const ordered = Object.entries(averages).sort((a, b) => b[1] - a[1]);
  const overall = Math.round(history.reduce((sum, entry) => sum + entry.feedback.overall, 0) / history.length);
  const bestMetric = ordered[0]?.[0] ?? "Not enough data";
  const weakestMetric = ordered[ordered.length - 1]?.[0] ?? "Not enough data";
  const skippedQuestions = history.filter((entry) => entry.feedback.skipped).length;

  return {
    overall,
    bestMetric,
    weakestMetric,
    completedQuestions: history.length - skippedQuestions,
    skippedQuestions,
    tips: [
      weakestMetric === "Politeness"
        ? "Practice more formal Japanese interview phrasing before the next strict session."
        : `Do one focused drill to improve ${weakestMetric.toLowerCase()}.`,
      averages.Clarity < 72
        ? "Use a repeatable answer frame so your opening line is faster and clearer."
        : "Keep the structure and add one stronger measurable example.",
      averages.Relevance < 75
        ? "Tie every answer back to the role, team, or impact you can create."
        : "Stay specific and preserve the role alignment you showed in this session.",
    ],
    nextStep:
      weakestMetric === "Politeness"
        ? "Run one short strict-mode session focused on keigo and end-of-answer phrasing."
        : `Repeat the same category once more and prioritize ${weakestMetric.toLowerCase()} in every answer.`,
    summaryText: `You finished ${history.length} reviewed question${history.length > 1 ? "s" : ""} in ${formatDuration(
      elapsedSeconds
    )}. ${bestMetric} was the strongest area, while ${weakestMetric} needs the next cycle of work.`,
    averages,
    duration: elapsedSeconds,
  };
}

export function getPromptView(question: SessionQuestion, language: LanguageId) {
  if (language === "english") {
    return { primary: question.en, secondary: question.jp };
  }

  if (language === "mixed") {
    return { primary: question.jp, secondary: question.en };
  }

  return { primary: question.jp, secondary: question.en };
}

export function buildConversationTranscript(state: InterviewSessionState): ChatMessage[] {
  if (Array.isArray(state.conversation) && state.conversation.length > 0) {
    return state.conversation;
  }

  const transcript: ChatMessage[] = [];
  const firstQuestion = state.questions[0];
  const now = state.startedAt ?? new Date().toISOString();

  if (firstQuestion) {
    transcript.push({
      role: "assistant",
      content: `${firstQuestion.lead} ${getPromptView(firstQuestion, state.config.language).primary}`.trim(),
      createdAt: now,
      questionIndex: 0,
    });
  }

  for (const entry of state.history) {
    transcript.push({
      role: "user",
      content: entry.answer || "Question skipped.",
      createdAt: now,
      questionIndex: entry.questionIndex,
    });
    transcript.push({
      role: "assistant",
      content: entry.feedback.interviewerLine || entry.feedback.summary,
      createdAt: now,
      questionIndex: entry.questionIndex,
    });
  }

  const activeQuestion = state.questions[state.currentIndex];
  const shouldAppendActiveQuestion =
    activeQuestion &&
    state.status !== "completed" &&
    !(state.currentIndex === 0 && transcript.length === 1 && state.history.length === 0);

  if (shouldAppendActiveQuestion) {
    transcript.push({
      role: "assistant",
      content: `${activeQuestion.lead} ${getPromptView(activeQuestion, state.config.language).primary}`.trim(),
      createdAt: now,
      questionIndex: state.currentIndex,
    });
  }

  return transcript;
}

export function createInterviewSessionState(config: StoredInterviewConfig): InterviewSessionState {
  const now = new Date().toISOString();
  return {
    config,
    questions: [],
    currentIndex: 0,
    history: [],
    conversation: [],
    startedAt: now,
    updatedAt: now,
    status: "in_progress",
  };
}

export function parseStoredInterviewConfig(candidate: unknown): StoredInterviewConfig | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const config = candidate as Partial<StoredInterviewConfig>;
  if (
    typeof config.category !== "string" ||
    typeof config.difficulty !== "string" ||
    typeof config.jobRole !== "string" ||
    typeof config.language !== "string" ||
    typeof config.questionCount !== "string" ||
    typeof config.includeFollowUps !== "boolean" ||
    typeof config.showLiveHints !== "boolean" ||
    typeof config.strictMode !== "boolean"
  ) {
    return null;
  }

  const normalizedJobRole = normalizeWhitespace(config.jobRole);
  if (!normalizedJobRole) {
    return null;
  }

  if (
    !interviewCategories.some((item) => item.value === config.category) ||
    !interviewDifficulties.some((item) => item.value === config.difficulty) ||
    !interviewLanguages.some((item) => item.value === config.language) ||
    !interviewQuestionCounts.includes(config.questionCount as QuestionCountId)
  ) {
    return null;
  }

  return {
    category: config.category as CategoryId,
    difficulty: config.difficulty as DifficultyId,
    jobRole: normalizedJobRole,
    language: config.language as LanguageId,
    questionCount: config.questionCount as QuestionCountId,
    includeFollowUps: config.includeFollowUps,
    showLiveHints: config.showLiveHints,
    strictMode: config.strictMode,
  };
}

export function parseInterviewSessionState(candidate: unknown): InterviewSessionState | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const state = candidate as Partial<InterviewSessionState>;
  const config = parseStoredInterviewConfig(state.config);
  if (!config || !Array.isArray(state.questions) || !Array.isArray(state.history)) {
    return null;
  }

  const questions = state.questions.filter((item): item is SessionQuestion => {
    if (!item || typeof item !== "object") return false;
    const question = item as Partial<SessionQuestion>;
    return (
      typeof question.id === "string" &&
      typeof question.label === "string" &&
      typeof question.jp === "string" &&
      typeof question.en === "string" &&
      typeof question.hint === "string" &&
      Array.isArray(question.keywords) &&
      question.keywords.every((keyword) => typeof keyword === "string") &&
      typeof question.isFollowUp === "boolean" &&
      typeof question.lead === "string"
    );
  });

  const history = state.history.filter((item): item is ReviewEntry => {
    if (!item || typeof item !== "object") return false;
    const review = item as Partial<ReviewEntry>;
    return (
      typeof review.questionIndex === "number" &&
      typeof review.answer === "string" &&
      !!review.question &&
      typeof review.question === "object" &&
      !!review.feedback &&
      typeof review.feedback === "object"
    );
  }).map((entry) => {
    const question = entry.question as SessionQuestion;
    const fallback = buildFallbackFeedback(entry.answer, question, config);
    return {
      questionIndex: entry.questionIndex,
      answer: entry.answer,
      question,
      feedback: normalizeFeedbackData(entry.feedback, fallback),
    };
  });

  const conversation =
    Array.isArray(state.conversation)
      ? state.conversation.filter((item): item is ChatMessage => {
          if (!item || typeof item !== "object") return false;
          const message = item as Partial<ChatMessage>;
          return (
            (message.role === "assistant" || message.role === "user") &&
            typeof message.content === "string" &&
            typeof message.createdAt === "string"
          );
        })
      : [];

  const currentIndex = clamp(Number(state.currentIndex ?? 0), 0, Math.max(questions.length - 1, 0));
  const elapsedSeconds = Math.max(
    0,
    Math.round((Date.now() - new Date(state.startedAt ?? new Date().toISOString()).getTime()) / 1000)
  );

  return {
    config,
    questions,
    currentIndex,
    history,
    conversation,
    startedAt: typeof state.startedAt === "string" ? state.startedAt : new Date().toISOString(),
    updatedAt: typeof state.updatedAt === "string" ? state.updatedAt : new Date().toISOString(),
    status: state.status === "completed" ? "completed" : "in_progress",
    summary: state.summary ? buildSummary(history, Number(state.summary.duration ?? elapsedSeconds)) : undefined,
  };
}
