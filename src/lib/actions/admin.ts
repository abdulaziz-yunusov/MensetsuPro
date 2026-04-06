"use server";

import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { isJapaneseLevel } from "@/lib/community";
import { Role } from "@prisma/client";

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

function normalizeBoolean(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return false;
  return value === "on" || value === "true";
}

function normalizeRole(value: FormDataEntryValue | null) {
  return value === "ADMIN" ? Role.ADMIN : Role.USER;
}

function revalidateAdminArea() {
  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/admin/questions");
  revalidatePath("/admin/categories");
  revalidatePath("/admin/materials");
  revalidatePath("/admin/moderation");
}

export async function createAdminUser(formData: FormData): Promise<void> {
  const admin = await ensureAdmin();

  const name = normalizeText(formData.get("name"));
  const email = normalizeText(formData.get("email"))?.toLowerCase();
  const password = normalizeText(formData.get("password"));

  if (!name || !email || !password) return;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) return;

  const levelValue = normalizeText(formData.get("japaneseLevel"));
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: normalizeRole(formData.get("role")),
      targetRole: normalizeText(formData.get("targetRole")),
      japaneseLevel: levelValue && isJapaneseLevel(levelValue) ? levelValue : null,
    },
  });

  revalidateAdminArea();
  revalidatePath("/dashboard");
  void admin.id;
}

export async function updateUserRole(userId: string, formData: FormData): Promise<void> {
  const admin = await ensureAdmin();

  if (admin.id === userId) return;

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: normalizeRole(formData.get("role")),
    },
  });

  revalidateAdminArea();
}

export async function deleteUserByAdmin(userId: string): Promise<void> {
  const admin = await ensureAdmin();

  if (admin.id === userId) return;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) return;

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.discussion.deleteMany({ where: { authorId: userId } }),
    prisma.blogPost.deleteMany({ where: { authorId: userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);

  revalidateAdminArea();
  revalidatePath("/community");
  revalidatePath("/blog");
}

export async function createCategoryByAdmin(formData: FormData): Promise<void> {
  await ensureAdmin();

  const name = normalizeText(formData.get("name"));
  if (!name) return;

  try {
    await prisma.category.create({
      data: {
        name,
        description: normalizeText(formData.get("description")),
      },
    });
  } catch (error) {
    console.error("Create category error:", error);
    return;
  }

  revalidateAdminArea();
  revalidatePath("/community");
  revalidatePath("/questions");
  revalidatePath("/materials");
}

export async function updateCategoryByAdmin(categoryId: string, formData: FormData): Promise<void> {
  await ensureAdmin();

  const name = normalizeText(formData.get("name"));
  if (!name) return;

  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: {
        name,
        description: normalizeText(formData.get("description")),
      },
    });
  } catch (error) {
    console.error("Update category error:", error);
    return;
  }

  revalidateAdminArea();
  revalidatePath("/community");
  revalidatePath("/questions");
  revalidatePath("/materials");
}

export async function deleteCategoryByAdmin(categoryId: string): Promise<void> {
  await ensureAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      _count: {
        select: {
          questions: true,
          materials: true,
          threads: true,
        },
      },
    },
  });

  if (!category) return;

  if (category._count.questions > 0 || category._count.materials > 0 || category._count.threads > 0) return;

  await prisma.category.delete({ where: { id: categoryId } });

  revalidateAdminArea();
}

export async function createQuestionByAdmin(formData: FormData): Promise<void> {
  await ensureAdmin();

  const title = normalizeText(formData.get("title"));
  const categoryId = normalizeText(formData.get("categoryId"));

  if (!title || !categoryId) return;

  await prisma.question.create({
    data: {
      title,
      titleEn: normalizeText(formData.get("titleEn")),
      categoryId,
      difficulty: normalizeText(formData.get("difficulty")),
      recommendedAnswer: normalizeText(formData.get("recommendedAnswer")),
      sampleAnswer: normalizeText(formData.get("sampleAnswer")),
      badSampleAnswer: normalizeText(formData.get("badSampleAnswer")),
      tips: normalizeText(formData.get("tips")),
      commonMistakes: normalizeText(formData.get("commonMistakes")),
      evaluationCriteria: normalizeText(formData.get("evaluationCriteria")),
    },
  });

  revalidateAdminArea();
  revalidatePath("/questions");
}

export async function deleteQuestionByAdmin(questionId: string): Promise<void> {
  await ensureAdmin();

  await prisma.question.delete({ where: { id: questionId } });

  revalidateAdminArea();
  revalidatePath("/questions");
}

export async function createMaterialByAdmin(formData: FormData): Promise<void> {
  await ensureAdmin();

  const title = normalizeText(formData.get("title"));
  const categoryId = normalizeText(formData.get("categoryId"));
  const url = normalizeText(formData.get("url"));
  const type = normalizeText(formData.get("type"));

  if (!title || !categoryId || !url || !type) return;

  await prisma.material.create({
    data: {
      title,
      description: normalizeText(formData.get("description")),
      type,
      url,
      difficulty: normalizeText(formData.get("difficulty")),
      categoryId,
      isFeatured: normalizeBoolean(formData.get("isFeatured")),
    },
  });

  revalidateAdminArea();
  revalidatePath("/materials");
}

export async function updateMaterialByAdmin(materialId: string, formData: FormData): Promise<void> {
  await ensureAdmin();

  const title = normalizeText(formData.get("title"));
  const categoryId = normalizeText(formData.get("categoryId"));
  const url = normalizeText(formData.get("url"));
  const type = normalizeText(formData.get("type"));

  if (!title || !categoryId || !url || !type) return;

  await prisma.material.update({
    where: { id: materialId },
    data: {
      title,
      description: normalizeText(formData.get("description")),
      type,
      url,
      difficulty: normalizeText(formData.get("difficulty")),
      categoryId,
      isFeatured: normalizeBoolean(formData.get("isFeatured")),
    },
  });

  revalidateAdminArea();
  revalidatePath("/materials");
  revalidatePath(`/materials/${materialId}`);
}

export async function deleteMaterialByAdmin(materialId: string): Promise<void> {
  await ensureAdmin();

  await prisma.$transaction([
    prisma.materialView.deleteMany({ where: { materialId } }),
    prisma.material.delete({ where: { id: materialId } }),
  ]);

  revalidateAdminArea();
  revalidatePath("/materials");
}

export async function toggleBlogPublishedByAdmin(postId: string): Promise<void> {
  await ensureAdmin();

  const post = await prisma.blogPost.findUnique({
    where: { id: postId },
    select: { published: true },
  });

  if (!post) return;

  await prisma.blogPost.update({
    where: { id: postId },
    data: { published: !post.published },
  });

  revalidateAdminArea();
  revalidatePath("/blog");
}

export async function deleteBlogPostByAdmin(postId: string): Promise<void> {
  await ensureAdmin();

  await prisma.blogPost.delete({ where: { id: postId } });

  revalidateAdminArea();
  revalidatePath("/blog");
}

export async function deleteDiscussionByAdmin(discussionId: string): Promise<void> {
  await ensureAdmin();

  await prisma.discussion.delete({ where: { id: discussionId } });

  revalidateAdminArea();
  revalidatePath("/community");
  revalidatePath(`/community/thread/${discussionId}`);
}

export async function deleteCommentByAdmin(commentId: string): Promise<void> {
  await ensureAdmin();

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { discussionId: true },
  });

  if (!comment) return;

  await prisma.comment.delete({ where: { id: commentId } });

  revalidateAdminArea();
  revalidatePath("/community");
  revalidatePath(`/community/thread/${comment.discussionId}`);
}
