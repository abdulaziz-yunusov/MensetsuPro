import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";
import { evaluateInterviewAnswer } from "@/lib/interview-ai";
import { parseInterviewSessionState } from "@/lib/interview";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const interviewId = typeof body?.interviewId === "string" ? body.interviewId : "";
    const answer = typeof body?.answer === "string" ? body.answer : "";

    if (!interviewId) {
      return NextResponse.json({ message: "Missing interviewId" }, { status: 400 });
    }

    const interview = await prisma.mockInterview.findUnique({
      where: { id: interviewId },
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
    if (!activeQuestion) {
      return NextResponse.json({ message: "No active question found for this session" }, { status: 409 });
    }

    const evaluation = await evaluateInterviewAnswer(
      answer,
      activeQuestion,
      state.config,
      state.history,
      state.currentIndex
    );

    return NextResponse.json({
      feedback: evaluation.feedback,
      assistantMessage: evaluation.assistantMessage,
      nextQuestion: evaluation.nextQuestion,
      source: evaluation.source,
      question: activeQuestion,
    });
  } catch (error) {
    console.error("[INTERVIEW_EVALUATE]", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: getDatabaseUnavailableMessage() }, { status: 503 });
    }

    return NextResponse.json({ message: "Failed to evaluate answer" }, { status: 500 });
  }
}
