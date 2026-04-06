"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleSaveQuestion(questionId: string) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to save questions" };
    }

    const userId = session.user.id;

    // Check if already saved
    const existingSave = await prisma.savedQuestion.findUnique({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
    });

    if (existingSave) {
      // Unsave
      await prisma.savedQuestion.delete({
        where: {
          id: existingSave.id,
        },
      });
      
      revalidatePath("/questions");
      revalidatePath("/dashboard/saved-questions");
      return { success: true, saved: false };
    } else {
      // Save
      await prisma.savedQuestion.create({
        data: {
          userId,
          questionId,
        },
      });
      
      revalidatePath("/questions");
      revalidatePath("/dashboard/saved-questions");
      return { success: true, saved: true };
    }
  } catch (error) {
    console.error("Error toggling saved question:", error);
    return { success: false, error: "Failed to update saved question" };
  }
}

export async function getMoreQuestions(skip: number = 0, take: number = 10) {
  try {
    const questions = await prisma.question.findMany({
      skip,
      take,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return { 
      success: true, 
      questions: questions.map(q => ({
        ...q,
        // Ensure manual interface compatibility if needed, 
        // but here we just return the Prisma objects.
      })) 
    };
  } catch (error) {
    console.error("Error fetching more questions:", error);
    return { success: false, questions: [], error: "Failed to fetch questions" };
  }
}
