import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";
import { parseInterviewSessionState } from "@/lib/interview";
import prisma from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const interview = await prisma.mockInterview.findUnique({
      where: { id },
      include: { logs: true },
    });

    if (!interview || interview.userId !== userId) {
      return NextResponse.json({ message: "Interview session not found" }, { status: 404 });
    }

    const state = parseInterviewSessionState(interview.feedbackJson);
    if (!state) {
      return NextResponse.json({ message: "Interview session state is invalid" }, { status: 409 });
    }

    return NextResponse.json({
      interviewId: interview.id,
      state,
      score: interview.score,
      completedAt: interview.completedAt,
      logsCount: interview.logs.length,
    });
  } catch (error) {
    console.error("[INTERVIEW_SESSION_GET]", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: getDatabaseUnavailableMessage() }, { status: 503 });
    }

    return NextResponse.json({ message: "Failed to load interview session" }, { status: 500 });
  }
}
