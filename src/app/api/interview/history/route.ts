import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { getDatabaseUnavailableMessage, isDatabaseConnectionError } from "@/lib/db-error";
import { parseInterviewSessionState } from "@/lib/interview";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const interviews = await prisma.mockInterview.findMany({
      where: {
        userId,
        score: {
          not: null,
        },
      },
      include: {
        logs: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return NextResponse.json({
      interviews: interviews.map((interview) => {
        const state = parseInterviewSessionState(interview.feedbackJson);
        return {
          id: interview.id,
          jobRole: interview.jobRole,
          difficulty: interview.difficulty,
          score: interview.score,
          completedAt: interview.completedAt,
          logsCount: interview.logs.length,
          summary: state?.summary ?? null,
        };
      }),
    });
  } catch (error) {
    console.error("[INTERVIEW_HISTORY]", error);

    if (isDatabaseConnectionError(error)) {
      return NextResponse.json({ message: getDatabaseUnavailableMessage() }, { status: 503 });
    }

    return NextResponse.json({ message: "Failed to load interview history" }, { status: 500 });
  }
}
