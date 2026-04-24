import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";
import {
  buildFallbackFeedback,
  buildSummary,
  getFallbackQuestion,
  getPlannedQuestionCount,
  normalizeFeedbackData,
  normalizeSessionQuestion,
  parseInterviewSessionState,
  type FeedbackData,
  type ReviewEntry,
  type SessionQuestion,
} from "@/lib/interview";
import prisma from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const answer = typeof body?.answer === "string" ? body.answer : "";
    const finish = Boolean(body?.finish);
    const finalizeOnly = Boolean(body?.finalizeOnly);
    const assistantMessage = typeof body?.assistantMessage === "string" ? body.assistantMessage.trim() : "";
    const candidateFeedback = (body?.feedback ?? null) as FeedbackData | null;
    const candidateNextQuestion = (body?.nextQuestion ?? null) as SessionQuestion | null;

    const interview = await prisma.mockInterview.findUnique({
      where: { id },
    });

    if (!interview || interview.userId !== userId) {
      return NextResponse.json({ message: "Interview session not found" }, { status: 404 });
    }

    const state = parseInterviewSessionState(interview.feedbackJson);
    if (!state) {
      return NextResponse.json({ message: "Interview session state is invalid" }, { status: 409 });
    }

    if (state.status === "completed") {
      return NextResponse.json({ message: "Interview session is already completed" }, { status: 409 });
    }

    const activeQuestion = state.questions[state.currentIndex];
    if (!activeQuestion && !finalizeOnly) {
      return NextResponse.json({ message: "No active question found for this session" }, { status: 409 });
    }

    const feedback = activeQuestion
      ? normalizeFeedbackData(candidateFeedback, buildFallbackFeedback(answer, activeQuestion, state.config))
      : null;
    const reviewEntry =
      activeQuestion && !finalizeOnly
        ? ({
            questionIndex: state.currentIndex,
            question: activeQuestion,
            answer,
            feedback: feedback!,
          } satisfies ReviewEntry)
        : null;

    const history = reviewEntry ? [...state.history, reviewEntry] : state.history;
    const conversation = Array.isArray(state.conversation) ? [...state.conversation] : [];
    const totalQuestions = getPlannedQuestionCount(state.config);
    const nextQuestionIndex = state.currentIndex + 1;
    const isLastQuestion = state.currentIndex >= totalQuestions - 1;
    const nextQuestion =
      !finalizeOnly && !isLastQuestion
        ? normalizeSessionQuestion(candidateNextQuestion, getFallbackQuestion(state.config, nextQuestionIndex), nextQuestionIndex)
        : null;
    if (reviewEntry && activeQuestion && feedback) {
      const now = new Date().toISOString();
      conversation.push({
        role: "user",
        content: answer || "Question skipped.",
        createdAt: now,
        questionIndex: state.currentIndex,
      });
      conversation.push({
        role: "assistant",
        content: assistantMessage || feedback.interviewerLine,
        createdAt: now,
        questionIndex: state.currentIndex,
      });
    }
    const shouldFinish = finish || finalizeOnly || isLastQuestion;
    const elapsedSeconds = Math.max(
      0,
      Math.round((Date.now() - new Date(state.startedAt).getTime()) / 1000)
    );
    const summary = shouldFinish ? buildSummary(history, elapsedSeconds) : undefined;
    const questions = shouldFinish
      ? state.questions
      : nextQuestion
        ? [...state.questions, nextQuestion]
        : state.questions;
    const nextState = {
      ...state,
      questions,
      history,
      conversation,
      currentIndex: shouldFinish ? state.currentIndex : state.currentIndex + 1,
      updatedAt: new Date().toISOString(),
      status: shouldFinish ? "completed" : "in_progress",
      summary,
    };

    await prisma.$transaction(async (tx) => {
      if (reviewEntry && activeQuestion && feedback) {
        await tx.interviewLog.create({
          data: {
            mockInterviewId: interview.id,
            questionText: `${activeQuestion.jp}\n${activeQuestion.en}`,
            userAnswerText: answer,
            aiFeedback: JSON.stringify(feedback),
          },
        });
      }

      await tx.mockInterview.update({
        where: { id: interview.id },
        data: {
          score: shouldFinish ? summary?.overall ?? interview.score ?? feedback?.overall ?? null : interview.score,
          completedAt: shouldFinish ? new Date() : interview.completedAt,
          feedbackJson: nextState as unknown as object,
        },
      });

      if (shouldFinish) {
        await tx.progressTracker.upsert({
          where: { userId },
          update: {
            interviewsDone: {
              increment: 1,
            },
          },
          create: {
            userId,
            interviewsDone: 1,
          },
        });
      }
    });

    return NextResponse.json({
      state: nextState,
      summary,
      finished: shouldFinish,
      nextQuestion: shouldFinish ? null : nextQuestion,
    });
  } catch (error) {
    console.error("[INTERVIEW_SESSION_COMMIT]", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: getDatabaseUnavailableMessage() }, { status: 503 });
    }

    return NextResponse.json({ message: "Failed to save interview progress" }, { status: 500 });
  }
}
