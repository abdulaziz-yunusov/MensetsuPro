import prisma from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bookmark, CheckCircle2, MessageSquare, Plus, ThumbsDown, ThumbsUp } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CommunityFilterBar } from "@/components/community/community-filter-bar";
import { SaveThreadButton } from "@/components/community/save-thread-button";
import { ThreadReactionControls } from "@/components/community/thread-reaction-controls";
import {
  formatRelativeRole,
  getLocalizedDiscussionStatusLabel,
  getLocalizedDiscussionTypeLabel,
  isCommunitySort,
  isDiscussionStatusFilter,
  isDiscussionType,
} from "@/lib/community";
import { DatabaseUnavailableBanner } from "@/components/layout/database-unavailable-banner";
import { isDatabaseConnectionError } from "@/lib/db-error";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";
import { localizeCategory } from "@/lib/i18n-ui";

type CommunitySearchParams = Promise<{
  q?: string;
  category?: string;
  type?: string;
  status?: string;
  sort?: string;
}>;

export default async function CommunityPage({ searchParams }: { searchParams: CommunitySearchParams }) {
  const { locale } = await getServerTranslation();
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = await searchParams;

  const communityPageCopy: Record<Locale, Record<string, string>> = {
    en: {
      title: "Community Practice Hub",
      subtitle: "Structured peer feedback, solved threads, and direct links into your interview practice workflow.",
      startDiscussion: "Start Discussion",
      signIn: "Sign in to participate",
      discussionsInView: "Discussions in view",
      solvedThreads: "Solved threads",
      needReplies: "Need replies",
      postedBy: "Posted by",
      prompt: "Prompt",
      replies: "replies",
      likes: "likes",
      dislikes: "dislikes",
      saves: "saves",
      emptyTitle: "No discussions matched these filters.",
      emptySubtitle: "Try clearing a filter or start a focused discussion for your interview prep.",
      clearFilters: "Clear filters",
    },
    ru: {
      title: "Центр практики сообщества",
      subtitle: "Структурированный отзыв от сообщества, решенные темы и быстрые переходы к вашей подготовке.",
      startDiscussion: "Начать обсуждение",
      signIn: "Войти для участия",
      discussionsInView: "Тем в списке",
      solvedThreads: "Решенные темы",
      needReplies: "Нужны ответы",
      postedBy: "Автор",
      prompt: "Промпт",
      replies: "ответов",
      likes: "лайков",
      dislikes: "дизлайков",
      saves: "сохранений",
      emptyTitle: "По текущим фильтрам обсуждения не найдены.",
      emptySubtitle: "Попробуйте сбросить фильтры или создать отдельную тему по подготовке.",
      clearFilters: "Сбросить фильтры",
    },
    ja: {
      title: "コミュニティ練習ハブ",
      subtitle: "体系的な相互フィードバック、解決済みスレッド、面接練習への導線をまとめています。",
      startDiscussion: "ディスカッションを始める",
      signIn: "参加するにはログイン",
      discussionsInView: "表示中の議論",
      solvedThreads: "解決済みスレッド",
      needReplies: "返信待ち",
      postedBy: "投稿者",
      prompt: "プロンプト",
      replies: "件の返信",
      likes: "件のいいね",
      dislikes: "件の低評価",
      saves: "件の保存",
      emptyTitle: "条件に一致するディスカッションが見つかりません。",
      emptySubtitle: "フィルターをクリアするか、面接対策に関する新しい話題を作成してください。",
      clearFilters: "フィルターをクリア",
    },
    uz: {
      title: "Hamjamiyat mashq markazi",
      subtitle: "Tuzilgan hamjamiyat fikrlari, yechilgan mavzular va intervyu mashg'ulotiga tezkor o'tishlar.",
      startDiscussion: "Muhokama boshlash",
      signIn: "Qatnashish uchun kiring",
      discussionsInView: "Ko'rinayotgan muhokamalar",
      solvedThreads: "Yechilgan mavzular",
      needReplies: "Javob kerak",
      postedBy: "Muallif",
      prompt: "Prompt",
      replies: "javob",
      likes: "layk",
      dislikes: "dislayk",
      saves: "saqlash",
      emptyTitle: "Bu filtrlarga mos muhokamalar topilmadi.",
      emptySubtitle: "Filtrni tozalab ko'ring yoki intervyu tayyorgarligi uchun yangi mavzu oching.",
      clearFilters: "Filtrlarni tozalash",
    },
  };
  const copy = communityPageCopy[locale];

  const filters = {
    q: resolvedSearchParams.q?.trim() ?? "",
    category: resolvedSearchParams.category ?? "all",
    type: resolvedSearchParams.type && isDiscussionType(resolvedSearchParams.type) ? resolvedSearchParams.type : "all",
    status: resolvedSearchParams.status && isDiscussionStatusFilter(resolvedSearchParams.status) ? resolvedSearchParams.status : "all",
    sort: resolvedSearchParams.sort && isCommunitySort(resolvedSearchParams.sort) ? resolvedSearchParams.sort : "recent",
  };

  const where: any = {};

  if (filters.q) {
    where.OR = [
      { title: { contains: filters.q, mode: "insensitive" } },
      { content: { contains: filters.q, mode: "insensitive" } },
      { prompt: { contains: filters.q, mode: "insensitive" } },
      { companyContext: { contains: filters.q, mode: "insensitive" } },
      { stageContext: { contains: filters.q, mode: "insensitive" } },
      { outcomeContext: { contains: filters.q, mode: "insensitive" } },
    ];
  }

  if (filters.category !== "all") {
    where.categoryId = filters.category;
  }

  if (filters.type !== "all") {
    where.type = filters.type;
  }

  if (filters.status === "OPEN" || filters.status === "SOLVED") {
    where.status = filters.status;
  } else if (filters.status === "UNANSWERED") {
    where.comments = { none: {} };
  }

  const orderBy: any = (() => {
    if (filters.sort === "most_discussed") {
      return [{ comments: { _count: "desc" } }, { lastActivityAt: "desc" }] as const;
    }

    if (filters.sort === "most_helpful") {
      return [{ reactions: { _count: "desc" } }, { lastActivityAt: "desc" }] as const;
    }

    return [{ lastActivityAt: "desc" }] as const;
  })();

  let categories: { id: string; name: string }[] = [];
  let threads: any[] = [];
  let dbUnavailable = false;

  try {
    [categories, threads] = await Promise.all([
      prisma.category.findMany({
        where: { threads: { some: {} } },
        orderBy: { name: "asc" },
      }),
      prisma.discussion.findMany({
        where,
        orderBy,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              targetRole: true,
              japaneseLevel: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          reactions: {
            select: {
              type: true,
            },
          },
          _count: {
            select: {
              comments: true,
              savedBy: true,
            },
          },
        },
      }),
    ]);
  } catch (error) {
    if (!isDatabaseConnectionError(error)) {
      throw error;
    }

    dbUnavailable = true;
  }

  const threadIds = threads.map((thread) => thread.id);

  let savedThreadIds: { discussionId: string }[] = [];
  let userReactions: { discussionId: string; type: "LIKE" | "DISLIKE" }[] = [];

  if (!dbUnavailable && session?.user?.id && threadIds.length > 0) {
    [savedThreadIds, userReactions] = await Promise.all([
      prisma.savedDiscussion.findMany({
        where: {
          userId: session.user.id,
          discussionId: { in: threadIds },
        },
        select: { discussionId: true },
      }),
      prisma.reaction.findMany({
        where: {
          userId: session.user.id,
          discussionId: { in: threadIds },
        },
        select: {
          discussionId: true,
          type: true,
        },
      }),
    ]);
  }

  const savedDiscussionSet = new Set(savedThreadIds.map((item) => item.discussionId));
  const userReactionMap = new Map(userReactions.map((item) => [item.discussionId, item.type]));

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">{copy.title}</h1>
          <p className="text-lg text-muted-foreground">
            {copy.subtitle}
          </p>
        </div>

        {session?.user ? (
          <Button asChild>
            <Link href="/community/new">
              <Plus className="mr-2 h-4 w-4" />
              {copy.startDiscussion}
            </Link>
          </Button>
        ) : (
          <Button variant="outline" asChild>
            <Link href="/login?callbackUrl=/community">{copy.signIn}</Link>
          </Button>
        )}
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card className="border-border bg-background/80">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground">{copy.discussionsInView}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{threads.length}</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/70">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-emerald-700">{copy.solvedThreads}</p>
            <p className="mt-2 text-3xl font-bold text-emerald-900">
              {threads.filter((thread) => thread.status === "SOLVED").length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/70">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-amber-700">{copy.needReplies}</p>
            <p className="mt-2 text-3xl font-bold text-amber-900">
              {threads.filter((thread) => thread._count.comments === 0).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8">
        {dbUnavailable ? <DatabaseUnavailableBanner resourceName="Community discussions" /> : null}
        <CommunityFilterBar categories={categories} filters={filters} locale={locale} />
      </div>

      <div className="grid gap-4">
        {threads.map((thread) => {
          const likeCount = thread.reactions.filter((reaction: { type: string }) => reaction.type === "LIKE").length;
          const dislikeCount = thread.reactions.filter((reaction: { type: string }) => reaction.type === "DISLIKE").length;
          const roleLabel = formatRelativeRole(
            thread.roleContext ?? thread.author.targetRole,
            thread.levelContext ?? thread.author.japaneseLevel
          );

          return (
            <Card key={thread.id} className="border-border transition-colors hover:border-border">
              <CardContent className="flex flex-col gap-5 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="secondary">{localizeCategory(locale, thread.category.name)}</Badge>
                      <Badge variant="outline">{getLocalizedDiscussionTypeLabel(locale, thread.type)}</Badge>
                      <Badge
                        variant={thread.status === "SOLVED" ? "secondary" : "outline"}
                        className={thread.status === "SOLVED" ? "text-emerald-700" : ""}
                      >
                        {thread.status === "SOLVED" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : null}
                        {getLocalizedDiscussionStatusLabel(locale, thread.status)}
                      </Badge>
                      <span>
                        {copy.postedBy} <span className="font-semibold text-card-foreground">{thread.author.name}</span>
                      </span>
                      <span>{new Date(thread.lastActivityAt).toLocaleDateString(locale)}</span>
                    </div>

                    <div className="space-y-2">
                      <Link href={`/community/thread/${thread.id}`} className="block">
                        <h2 className="text-2xl font-semibold text-foreground transition-colors hover:text-primary">
                          {thread.title}
                        </h2>
                      </Link>
                      <p className="line-clamp-3 text-muted-foreground">{thread.content}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      {roleLabel ? (
                        <span className="rounded-full bg-muted px-3 py-1 font-medium text-muted-foreground">{roleLabel}</span>
                      ) : null}
                      {thread.companyContext ? (
                        <span className="rounded-full bg-orange-50 px-3 py-1 font-medium text-orange-700">
                          {thread.companyContext}
                        </span>
                      ) : null}
                      {thread.stageContext ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-700">
                          {thread.stageContext}
                        </span>
                      ) : null}
                    </div>

                    {thread.prompt ? (
                      <div className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-muted-foreground">
                        <span className="font-semibold text-card-foreground">{copy.prompt}:</span> {thread.prompt}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-3 lg:items-end">
                    <div className="flex items-center gap-2">
                      <SaveThreadButton
                        threadId={thread.id}
                        isInitiallySaved={savedDiscussionSet.has(thread.id)}
                        callbackUrl="/community"
                      />
                      <ThreadReactionControls
                        threadId={thread.id}
                        callbackUrl="/community"
                        initialReaction={userReactionMap.get(thread.id) ?? null}
                        likeCount={likeCount}
                        dislikeCount={dislikeCount}
                      />
                    </div>

                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {thread._count.comments} {copy.replies}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        {likeCount} {copy.likes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        {dislikeCount} {copy.dislikes}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        {thread._count.savedBy} {copy.saves}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {threads.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background py-14 text-center">
            <h2 className="text-xl font-semibold text-foreground">{copy.emptyTitle}</h2>
            <p className="mt-2 text-muted-foreground">{copy.emptySubtitle}</p>
            <div className="mt-6">
              <Button variant="outline" asChild>
                <Link href="/community">{copy.clearFilters}</Link>
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
