import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { contentId, contentType, targetLanguage } = await req.json();

    if (!contentId || !contentType || !targetLanguage) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // 1. Check cache
    const existing = await (prisma as any).contentTranslation.findFirst({
      where: {
        targetLanguage,
        [contentType === 'discussion' ? 'discussionId' : 'commentId']: contentId,
      }
    });

    if (existing) {
      return NextResponse.json({
        translatedTitle: existing.translatedTitle,
        translatedContent: existing.translatedContent,
        status: 'cached'
      });
    }

    // 2. Fetch original
    let originalTitle = "";
    let originalContent = "";
    let originalLanguage = "en";

    if (contentType === 'discussion') {
      const discussion = await prisma.discussion.findUnique({ where: { id: contentId } });
      if (!discussion) return NextResponse.json({ error: "Not found" }, { status: 404 });
      originalTitle = discussion.title;
      originalContent = discussion.content;
      originalLanguage = (discussion as any).language;
    } else {
      const comment = await prisma.comment.findUnique({ where: { id: contentId } });
      if (!comment) return NextResponse.json({ error: "Not found" }, { status: 404 });
      originalContent = comment.content;
      originalLanguage = (comment as any).language;
    }

    // 3. Translation Logic (Integration point for AI)
    // For now, using a mock/descriptive translation for demonstration
    // In a real app, you would call OpenAI, Gemini, or AWS Translate here
    
    const translatedTitle = originalTitle ? `[${targetLanguage.toUpperCase()}] ${originalTitle}` : undefined;
    const translatedContent = `-- TRANSLATED TO ${targetLanguage.toUpperCase()} --\n\n${originalContent}\n\n-- AUTO-TRANSLATED BY AI --`;

    // 4. Save to cache
    const saved = await (prisma as any).contentTranslation.create({
      data: {
        targetLanguage,
        translatedTitle,
        translatedContent,
        [contentType === 'discussion' ? 'discussionId' : 'commentId']: contentId,
      }
    });

    return NextResponse.json({
      translatedTitle: saved.translatedTitle,
      translatedContent: saved.translatedContent,
      status: 'new'
    });

  } catch (error) {
    console.error("[TRANSLATE_API]", error);
    return NextResponse.json({ error: "Translation failed" }, { status: 500 });
  }
}
