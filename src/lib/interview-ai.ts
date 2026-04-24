import { generateGeminiJson } from "@/lib/gemini";
import {
  buildFallbackFeedback,
  getFallbackQuestion,
  getPlannedQuestionCount,
  getPromptView,
  normalizeFeedbackData,
  normalizeSessionQuestion,
  type FeedbackData,
  type ReviewEntry,
  type SessionQuestion,
  type StoredInterviewConfig,
} from "@/lib/interview";

type InterviewOpeningTurn = {
  message: string;
  question: SessionQuestion;
  source: "gemini" | "fallback";
};

type InterviewAnswerTurn = {
  feedback: FeedbackData;
  assistantMessage: string;
  nextQuestion: SessionQuestion | null;
  source: "gemini" | "fallback";
};

function getInterviewLanguageInstruction(config: StoredInterviewConfig) {
  switch (config.language) {
    case "english":
      return "Use English for the interviewer message and question. Also provide a natural Japanese translation in the question.jp field.";
    case "mixed":
      return "Use Japanese first, but keep it easy to follow for a bilingual candidate. Also provide an English translation in the question.en field.";
    default:
      return "Use Japanese for the interviewer message and question. Also provide an English translation in the question.en field.";
  }
}

function buildRecentHistory(history: ReviewEntry[]) {
  return history.slice(-3).map((entry) => ({
    question: entry.question.label,
    asked: {
      jp: entry.question.jp,
      en: entry.question.en,
    },
    answer: entry.answer,
    summary: entry.feedback.summary,
    weakPoints: entry.feedback.weakPoints,
    overall: entry.feedback.overall,
  }));
}

function buildOpeningPrompt(config: StoredInterviewConfig, fallbackQuestion: SessionQuestion) {
  return [
    "You are a realistic mock interviewer for Japanese IT job interviews.",
    "Start the interview and ask the first question.",
    "Return only JSON.",
    "The message should sound like a real interviewer, not an app.",
    "Ask exactly one question.",
    "Keep the interviewer message concise: 2 to 4 sentences.",
    getInterviewLanguageInstruction(config),
    "The JSON must match this shape:",
    JSON.stringify({
      message: "string",
      question: {
        label: "short label",
        jp: "question in Japanese",
        en: "question in English",
        hint: "brief hidden coaching hint",
        keywords: ["keyword"],
        isFollowUp: false,
        lead: "short lead-in before the question",
      },
    }),
    "",
    `Category: ${config.category}`,
    `Difficulty: ${config.difficulty}`,
    `Job role: ${config.jobRole}`,
    `Strict mode: ${config.strictMode ? "true" : "false"}`,
    `Include follow-ups: ${config.includeFollowUps ? "true" : "false"}`,
    `Total questions in session: ${getPlannedQuestionCount(config)}`,
    "",
    "Fallback seed if you need guidance:",
    JSON.stringify(
      {
        label: fallbackQuestion.label,
        jp: fallbackQuestion.jp,
        en: fallbackQuestion.en,
        hint: fallbackQuestion.hint,
        keywords: fallbackQuestion.keywords,
      },
      null,
      2
    ),
  ].join("\n");
}

function buildAnswerTurnPrompt(
  answer: string,
  currentQuestion: SessionQuestion,
  config: StoredInterviewConfig,
  history: ReviewEntry[],
  questionIndex: number
) {
  const totalQuestions = getPlannedQuestionCount(config);
  const isLastQuestion = questionIndex >= totalQuestions - 1;

  return [
    "You are conducting a realistic AI mock interview for a Japanese IT candidate.",
    "Evaluate the candidate's latest answer and decide how to continue the interview.",
    "Return only JSON.",
    "Use stricter scoring if strictMode is true or difficulty is advanced.",
    "Score these metrics from 0 to 100: Clarity, Confidence, Relevance, Grammar, Politeness.",
    "If the answer is empty, set skipped=true and score harshly.",
    "If language is japanese or mixed, include naturalJapaneseVersion and businessPoliteVersion.",
    "The assistantMessage must sound like a real interviewer response.",
    isLastQuestion
      ? "This is the final planned question. Do not ask another question. nextQuestion must be null."
      : "There are more questions remaining. Ask exactly one adaptive next question and include it in nextQuestion.",
    getInterviewLanguageInstruction(config),
    "The JSON must match this shape:",
    JSON.stringify({
      feedback: {
        overall: 0,
        summary: "Short overall summary",
        strengths: ["string"],
        weakPoints: ["string"],
        suggestions: ["string"],
        betterSampleAnswer: "string",
        naturalJapaneseVersion: "string or omit when not relevant",
        businessPoliteVersion: "string or omit when not relevant",
        metrics: [
          { label: "Clarity", value: 0 },
          { label: "Confidence", value: 0 },
          { label: "Relevance", value: 0 },
          { label: "Grammar", value: 0 },
          { label: "Politeness", value: 0 },
        ],
        interviewerLine: "One short judgment line",
        skipped: false,
      },
      assistantMessage: "string",
      nextQuestion: {
        label: "short label",
        jp: "question in Japanese",
        en: "question in English",
        hint: "brief hidden coaching hint",
        keywords: ["keyword"],
        isFollowUp: false,
        lead: "short lead-in before the question",
      },
    }),
    "",
    `Category: ${config.category}`,
    `Difficulty: ${config.difficulty}`,
    `Language: ${config.language}`,
    `Job role: ${config.jobRole}`,
    `Strict mode: ${config.strictMode ? "true" : "false"}`,
    `Question number: ${questionIndex + 1} of ${totalQuestions}`,
    "",
    "Current question:",
    JSON.stringify(
      {
        label: currentQuestion.label,
        jp: currentQuestion.jp,
        en: currentQuestion.en,
        hint: currentQuestion.hint,
        keywords: currentQuestion.keywords,
      },
      null,
      2
    ),
    "",
    "Recent interview history:",
    JSON.stringify(buildRecentHistory(history), null, 2),
    "",
    "Candidate answer:",
    answer || "[EMPTY ANSWER]",
  ].join("\n");
}

function buildFallbackAssistantMessage(
  feedback: FeedbackData,
  nextQuestion: SessionQuestion | null,
  config: StoredInterviewConfig
) {
  if (!nextQuestion) {
    return config.language === "english"
      ? `${feedback.interviewerLine} This concludes the interview. Please review the feedback below.`
      : `${feedback.interviewerLine} 面接はここで終了です。下のフィードバックを確認してください。`;
  }

  const prompt = getPromptView(nextQuestion, config.language).primary;
  return `${feedback.interviewerLine} ${nextQuestion.lead} ${prompt}`.trim();
}

export async function generateInterviewOpeningTurn(config: StoredInterviewConfig): Promise<InterviewOpeningTurn> {
  const fallbackQuestion = normalizeSessionQuestion(getFallbackQuestion(config, 0), null, 0);
  const fallbackMessage = `${fallbackQuestion.lead} ${getPromptView(fallbackQuestion, config.language).primary}`.trim();

  if (!process.env.GEMINI_API_KEY) {
    return {
      message: fallbackMessage,
      question: fallbackQuestion,
      source: "fallback",
    };
  }

  try {
    const parsed = await generateGeminiJson({
      systemInstruction:
        "You are a realistic interviewer. Return only valid JSON with a concise opening message and one interview question.",
      contents: [
        {
          role: "user",
          parts: [{ text: buildOpeningPrompt(config, fallbackQuestion) }],
        },
      ],
      temperature: 0.7,
      maxOutputTokens: 900,
    });

    const message =
      typeof parsed?.message === "string" && parsed.message.trim() ? parsed.message.trim() : fallbackMessage;
    const question = normalizeSessionQuestion(parsed?.question, fallbackQuestion, 0);

    return {
      message,
      question,
      source: "gemini",
    };
  } catch (error) {
    console.error("[INTERVIEW_OPENING_TURN]", error);
    return {
      message: fallbackMessage,
      question: fallbackQuestion,
      source: "fallback",
    };
  }
}

export async function evaluateInterviewAnswer(
  answer: string,
  question: SessionQuestion,
  config: StoredInterviewConfig,
  history: ReviewEntry[] = [],
  questionIndex = 0
): Promise<InterviewAnswerTurn> {
  const fallbackFeedback = buildFallbackFeedback(answer, question, config);
  const fallbackNextQuestion =
    questionIndex >= getPlannedQuestionCount(config) - 1
      ? null
      : normalizeSessionQuestion(getFallbackQuestion(config, questionIndex + 1), null, questionIndex + 1);
  const fallbackAssistantMessage = buildFallbackAssistantMessage(fallbackFeedback, fallbackNextQuestion, config);

  if (!process.env.GEMINI_API_KEY) {
    return {
      feedback: fallbackFeedback,
      assistantMessage: fallbackAssistantMessage,
      nextQuestion: fallbackNextQuestion,
      source: "fallback",
    };
  }

  try {
    const parsed = await generateGeminiJson({
      systemInstruction:
        "You are a realistic mock interviewer. Return only valid JSON. Never include markdown, code fences, or commentary outside the JSON object.",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: buildAnswerTurnPrompt(answer, question, config, history, questionIndex),
            },
          ],
        },
      ],
      temperature: 0.35,
      maxOutputTokens: 1800,
    });

    const feedback = normalizeFeedbackData(parsed?.feedback, fallbackFeedback);
    const nextQuestion =
      questionIndex >= getPlannedQuestionCount(config) - 1
        ? null
        : normalizeSessionQuestion(parsed?.nextQuestion, fallbackNextQuestion, questionIndex + 1);
    const assistantMessage =
      typeof parsed?.assistantMessage === "string" && parsed.assistantMessage.trim()
        ? parsed.assistantMessage.trim()
        : buildFallbackAssistantMessage(feedback, nextQuestion, config);

    return {
      feedback,
      assistantMessage,
      nextQuestion,
      source: "gemini",
    };
  } catch (error) {
    console.error("[INTERVIEW_ANSWER_TURN]", error);
    return {
      feedback: fallbackFeedback,
      assistantMessage: fallbackAssistantMessage,
      nextQuestion: fallbackNextQuestion,
      source: "fallback",
    };
  }
}
