import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";
import { createInterviewSessionState, parseStoredInterviewConfig } from "@/lib/interview";
import { generateInterviewOpeningTurn } from "@/lib/interview-ai";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const config = parseStoredInterviewConfig(body);

    if (!config) {
      return NextResponse.json({ message: "Invalid interview configuration" }, { status: 400 });
    }

    const state = createInterviewSessionState(config);
    const openingTurn = await generateInterviewOpeningTurn(config);
    state.questions = [openingTurn.question];
    state.conversation = [
      {
        role: "assistant",
        content: openingTurn.message,
        createdAt: state.startedAt,
        questionIndex: 0,
      },
    ];

    const interview = await prisma.mockInterview.create({
      data: {
        userId,
        jobRole: config.jobRole,
        difficulty: config.difficulty,
        feedbackJson: state as unknown as object,
      },
    });

    return NextResponse.json({
      interviewId: interview.id,
      state,
    });
  } catch (error) {
    console.error("[INTERVIEW_START]", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: getDatabaseUnavailableMessage() }, { status: 503 });
    }

    return NextResponse.json({ message: "Failed to start interview session" }, { status: 500 });
  }
}
