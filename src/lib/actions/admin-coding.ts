"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

async function ensureAdmin() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  return session.user;
}

function normalizeText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createCodingQuestionByAdmin(formData: FormData) {
  await ensureAdmin();

  const title = normalizeText(formData.get("title"));
  const categoryId = normalizeText(formData.get("categoryId"));
  const description = normalizeText(formData.get("description"));
  const difficulty = normalizeText(formData.get("difficulty")) || "Beginner";
  const initialCode = normalizeText(formData.get("initialCode"));
  const testCasesInput = normalizeText(formData.get("testCases"));

  if (!title || !categoryId || !description || !testCasesInput) {
    return { success: false, error: "admin.coding.messages.validationError" };
  }

  let testCases;
  try {
    testCases = JSON.parse(testCasesInput);
    if (!Array.isArray(testCases)) {
      throw new Error("Test cases must be a JSON array.");
    }
    // Basic validation that each test case has input and expectedOutput
    for (const tc of testCases) {
      if (!tc.hasOwnProperty("input") || !tc.hasOwnProperty("expectedOutput")) {
        throw new Error("Each test case must have 'input' and 'expectedOutput' keys.");
      }
      if (!Array.isArray(tc.input)) {
        throw new Error("'input' must be an array of arguments.");
      }
    }
  } catch (err: any) {
    return { success: false, error: "admin.coding.messages.invalidJson" };
  }

  try {
    // @ts-ignore
    await prisma.codingQuestion.create({
      data: {
        title,
        description,
        difficulty,
        categoryId,
        initialCode,
        testCases,
      },
    });

    revalidatePath("/admin/coding-questions");
    revalidatePath("/ai-interview");
    return { success: true };
  } catch (error) {
    console.error("Failed to create coding question:", error);
    return { success: false, error: "admin.coding.messages.dbError" };
  }
}

export async function deleteCodingQuestionByAdmin(questionId: string) {
  await ensureAdmin();

  try {
    // @ts-ignore
    await prisma.codingQuestion.delete({ where: { id: questionId } });
    revalidatePath("/admin/coding-questions");
    revalidatePath("/ai-interview");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete coding question:", error);
    return { success: false, error: "admin.coding.messages.deleteError" };
  }
}

export async function getCategoriesForAdmin() {
  await ensureAdmin();
  try {
    const categories = await prisma.category.findMany({
      where: {
        OR: [
          { name: { contains: "Technical", mode: "insensitive" } },
          { name: { contains: "IT", mode: "insensitive" } },
          { name: { contains: "Algorithm", mode: "insensitive" } },
          { name: { contains: "Coding", mode: "insensitive" } }
        ]
      },
      orderBy: { name: "asc" }
    });
    return { success: true, categories };
  } catch (error) {
    return { success: false, error: "Failed to load categories." };
  }
}
