"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isDiscussionType, isJapaneseLevel, isReactionType, type ReactionTypeValue } from "@/lib/community";
import { DiscussionType } from "@prisma/client";

function revalidateCommunityPaths(threadId?: string) {
  revalidatePath("/community");
  revalidatePath("/dashboard");

  if (threadId) {
    revalidatePath(`/community/thread/${threadId}`);
  }
}

function normalizeOptionalText(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeFeedbackScore(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
    return null;
  }

  return parsed;
}

async function getAuthenticatedCommunityUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return { session: null, user: null };
  }

  const userLookupFilters = [
    session.user.id ? { id: session.user.id } : null,
    session.user.email ? { email: session.user.email } : null,
  ].filter(Boolean) as Array<{ id?: string; email?: string }>;

  if (userLookupFilters.length === 0) {
    return { session, user: null };
  }

  const user = await prisma.user.findFirst({
    where: {
      OR: userLookupFilters,
    },
    select: {
      id: true,
      email: true,
      role: true,
      targetRole: true,
      japaneseLevel: true,
    },
  });

  return { session, user };
}

export async function createDiscussion(formData: FormData): Promise<void> {
  const { session, user } = await getAuthenticatedCommunityUser();
  if (!session?.user) {
    redirect("/login?callbackUrl=/community/new");
  }

  const title = normalizeOptionalText(formData.get("title"));
  const content = normalizeOptionalText(formData.get("content"));
  const categoryId = normalizeOptionalText(formData.get("categoryId"));
  const typeValue = normalizeOptionalText(formData.get("type")) ?? "QUESTION";

  if (!title || !content || !categoryId || !isDiscussionType(typeValue)) return;
  if (!user) return;

  const roleContext = normalizeOptionalText(formData.get("roleContext")) ?? user?.targetRole ?? null;
  const levelValue = normalizeOptionalText(formData.get("levelContext"));
  const levelContext = levelValue && isJapaneseLevel(levelValue)
    ? levelValue
    : user?.japaneseLevel ?? null;

  const thread = await prisma.discussion.create({
    data: {
      title,
      content,
      language: ((formData.get("language") as string) || "en") as any,
      categoryId,
      authorId: user.id,
      type: typeValue,
      roleContext,
      levelContext,
      prompt: normalizeOptionalText(formData.get("prompt")),
      companyContext: normalizeOptionalText(formData.get("companyContext")),
      stageContext: normalizeOptionalText(formData.get("stageContext")),
      outcomeContext: normalizeOptionalText(formData.get("outcomeContext")),
      triedContext: normalizeOptionalText(formData.get("triedContext")),
      lastActivityAt: new Date(),
    },
  });

  revalidateCommunityPaths(thread.id);
  redirect(`/community/thread/${thread.id}`);
}

export async function createComment(discussionId: string, formData: FormData): Promise<void> {
  const { user } = await getAuthenticatedCommunityUser();
  if (!user) return;

  const content = normalizeOptionalText(formData.get("content"));
  if (!content) return;

  const discussion = await prisma.discussion.findUnique({
    where: { id: discussionId },
    select: { id: true, type: true },
  });

  if (!discussion) return;

  const now = new Date();

  await prisma.$transaction([
    prisma.comment.create({
      data: {
        content,
        language: ((formData.get("language") as string) || "en") as any,
        authorId: user.id,
        discussionId,
        feedbackClarity: discussion.type === DiscussionType.MOCK_ANSWER
          ? normalizeFeedbackScore(formData.get("feedbackClarity"))
          : null,
        feedbackRelevance: discussion.type === DiscussionType.MOCK_ANSWER
          ? normalizeFeedbackScore(formData.get("feedbackRelevance"))
          : null,
        feedbackGrammar: discussion.type === DiscussionType.MOCK_ANSWER
          ? normalizeFeedbackScore(formData.get("feedbackGrammar"))
          : null,
        feedbackPoliteness: discussion.type === DiscussionType.MOCK_ANSWER
          ? normalizeFeedbackScore(formData.get("feedbackPoliteness"))
          : null,
      },
    }),
    prisma.discussion.update({
      where: { id: discussionId },
      data: { lastActivityAt: now },
    }),
  ]);

  revalidateCommunityPaths(discussionId);
}

export async function toggleSaveDiscussion(discussionId: string) {
  const { user } = await getAuthenticatedCommunityUser();
  if (!user) {
    return { success: false, error: "You must be logged in to save discussions." };
  }

  try {
    const existingSave = await prisma.savedDiscussion.findUnique({
      where: {
        userId_discussionId: {
          userId: user.id,
          discussionId,
        },
      },
    });

    if (existingSave) {
      await prisma.savedDiscussion.delete({
        where: { id: existingSave.id },
      });

      revalidateCommunityPaths(discussionId);
      return { success: true, saved: false };
    }

    await prisma.savedDiscussion.create({
      data: {
        userId: user.id,
        discussionId,
      },
    });

    revalidateCommunityPaths(discussionId);
    return { success: true, saved: true };
  } catch (error) {
    console.error("Error toggling saved discussion:", error);
    return { success: false, error: "Failed to update saved discussion." };
  }
}

export async function toggleDiscussionReaction(discussionId: string, type: ReactionTypeValue) {
  const { user } = await getAuthenticatedCommunityUser();
  if (!user) {
    return { success: false, error: "You must be logged in to react to discussions." };
  }

  if (!isReactionType(type)) {
    return { success: false, error: "Unsupported reaction type." };
  }

  try {
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        userId_discussionId: {
          userId: user.id,
          discussionId,
        },
      },
    });

    if (existingReaction?.type === type) {
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });

      revalidateCommunityPaths(discussionId);
      return { success: true, reaction: null };
    }

    if (existingReaction) {
      await prisma.reaction.update({
        where: { id: existingReaction.id },
        data: { type },
      });
    } else {
      await prisma.reaction.create({
        data: {
          type,
          userId: user.id,
          discussionId,
        },
      });
    }

    revalidateCommunityPaths(discussionId);
    return { success: true, reaction: type };
  } catch (error) {
    console.error("Error toggling discussion reaction:", error);
    return { success: false, error: "Failed to update discussion reaction." };
  }
}

export async function markBestAnswer(commentId: string) {
  const { user } = await getAuthenticatedCommunityUser();
  if (!user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        isBestAnswer: true,
        discussionId: true,
        discussion: {
          select: {
            authorId: true,
          },
        },
      },
    });

    if (!comment) {
      return { success: false, error: "Reply not found." };
    }

    const isAuthor = comment.discussion.authorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { success: false, error: "Only the thread owner or an admin can mark a best answer." };
    }

    if (comment.isBestAnswer) {
      await prisma.$transaction([
        prisma.comment.update({
          where: { id: comment.id },
          data: { isBestAnswer: false },
        }),
        prisma.discussion.update({
          where: { id: comment.discussionId },
          data: { status: "OPEN" },
        }),
      ]);
    } else {
      await prisma.$transaction([
        prisma.comment.updateMany({
          where: { discussionId: comment.discussionId },
          data: { isBestAnswer: false },
        }),
        prisma.comment.update({
          where: { id: comment.id },
          data: { isBestAnswer: true },
        }),
        prisma.discussion.update({
          where: { id: comment.discussionId },
          data: {
            status: "SOLVED",
            lastActivityAt: new Date(),
          },
        }),
      ]);
    }

    revalidateCommunityPaths(comment.discussionId);
    return { success: true, isBestAnswer: !comment.isBestAnswer };
  } catch (error) {
    console.error("Error marking best answer:", error);
    return { success: false, error: "Failed to update best answer." };
  }
}

export async function deleteThread(threadId: string) {
  const { user } = await getAuthenticatedCommunityUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const thread = await prisma.discussion.findUnique({
      where: { id: threadId },
      select: { authorId: true },
    });

    if (!thread) {
      return { success: false, error: "Thread not found." };
    }

    const isAuthor = thread.authorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { success: false, error: "Unauthorized. You cannot delete this thread." };
    }

    await prisma.discussion.delete({
      where: { id: threadId },
    });

    revalidateCommunityPaths(threadId);
    return { success: true };
  } catch (error) {
    console.error("Delete thread error:", error);
    return { success: false, error: "Failed to delete thread. Please try again." };
  }
}

export async function deleteComment(commentId: string, path: string) {
  const { user } = await getAuthenticatedCommunityUser();

  if (!user) {
    return { success: false, error: "Unauthorized. Please sign in." };
  }

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        authorId: true,
        isBestAnswer: true,
        discussionId: true,
      },
    });

    if (!comment) {
      return { success: false, error: "Comment not found." };
    }

    const isAuthor = comment.authorId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return { success: false, error: "Unauthorized. You cannot delete this comment." };
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    await prisma.discussion.update({
      where: { id: comment.discussionId },
      data: {
        ...(comment.isBestAnswer ? { status: "OPEN" } : {}),
        lastActivityAt: new Date(),
      },
    });

    revalidatePath(path);
    revalidateCommunityPaths(comment.discussionId);
    return { success: true };
  } catch (error) {
    console.error("Delete comment error:", error);
    return { success: false, error: "Failed to delete comment. Please try again." };
  }
}
