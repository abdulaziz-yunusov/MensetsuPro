"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // Assuming auth.ts has authOptions

export async function getCodingQuestions() {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    const questions = await prisma.codingQuestion.findMany({
      orderBy: { title: "asc" },
      // @ts-ignore
      include: {
        submissions: {
          select: { status: true, userId: true }
        }
      }
    });

    const questionsWithStats = questions.map((q: any) => {
      const totalAttempts = q.submissions?.length || 0;
      const passedAttempts = q.submissions?.filter((s: any) => s.status === "PASS").length || 0;
      
      let acceptanceRate = 0;
      if (totalAttempts > 0) {
        acceptanceRate = (passedAttempts / totalAttempts) * 100;
      }

      let userStatus = "TODO";
      if (currentUserId && q.submissions) {
        const userSubs = q.submissions.filter((s: any) => s.userId === currentUserId);
        if (userSubs.length > 0) {
          const hasPassed = userSubs.some((s: any) => s.status === "PASS");
          userStatus = hasPassed ? "SOLVED" : "ATTEMPTED";
        }
      }
      
      const { submissions, ...rest } = q;
      return {
        ...rest,
        acceptanceRate,
        totalAttempts,
        userStatus
      };
    });

    return { success: true, questions: questionsWithStats };
  } catch (error) {
    console.error("Error fetching coding questions:", error);
    return { success: false, error: "Failed to fetch coding questions" };
  }
}

export async function submitCodingAttempt(questionId: string, code: string, status: "PASS" | "FAIL") {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please log in first." };
    }

    // @ts-ignore - Prisma types will be updated after dev server restart
    const submission = await prisma.codingSubmission.create({
      data: {
        userId: session.user.id,
        questionId: questionId,
        code,
        status,
      }
    });

    revalidatePath("/ai-interview");
    revalidatePath("/dashboard");

    return { success: true, submission };
  } catch (error) {
    console.error("Error saving coding submission:", error);
    return { success: false, error: "Failed to save submission" };
  }
}

export async function getQuestionHistory(questionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    // @ts-ignore
    const question = await prisma.codingQuestion.findUnique({
      where: { id: questionId },
      select: { id: true, title: true, difficulty: true }
    });

    if (!question) {
      return { success: false, error: "Question not found" };
    }

    // @ts-ignore
    const submissions = await prisma.codingSubmission.findMany({
      where: { 
        userId: session.user.id,
        questionId: questionId 
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        status: true,
        code: true,
        createdAt: true,
      }
    });

    return { 
      success: true, 
      question,
      submissions 
    };
  } catch (error) {
    console.error("Error fetching question history:", error);
    return { success: false, error: "Failed to fetch question history" };
  }
}

export async function getUserCodingSubmissions() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized." };
    }

    // @ts-ignore - Prisma types will be updated after dev server restart
    const submissions = await prisma.codingSubmission.findMany({
      where: { userId: session.user.id },
      include: { question: true },
      orderBy: { createdAt: 'desc' }
    });

    return { success: true, submissions };
  } catch (error) {
    console.error("Error fetching coding submissions:", error);
    return { success: false, error: "Failed to fetch submissions" };
  }
}
