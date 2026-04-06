import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  UserCircle,
} from "lucide-react";
import { DeleteThreadButton } from "@/components/community/delete-thread-button";
import { DeleteCommentButton } from "@/components/community/delete-comment-button";
import { SaveThreadButton } from "@/components/community/save-thread-button";
import { ThreadReactionControls } from "@/components/community/thread-reaction-controls";
import { MarkBestAnswerButton } from "@/components/community/mark-best-answer-button";
import { TranslatedContent } from "@/components/community/translated-content";
import { createComment } from "@/lib/actions/community";
import {
  formatRelativeRole,
  getDiscussionStatusLabel,
  getDiscussionTypeLabel,
  peerFeedbackFields,
} from "@/lib/community";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const thread = await prisma.discussion.findUnique({
    where: { id },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          targetRole: true,
          japaneseLevel: true,
        },
      },
      category: true,
      reactions: {
        select: {
          type: true,
          userId: true,
        },
      },
      comments: {
        include: {
          author: {
            select: {
              id: true,
              name: true,
              targetRole: true,
              japaneseLevel: true,
            },
          },
        },
        orderBy: [{ isBestAnswer: "desc" }, { createdAt: "asc" }],
      },
      _count: {
        select: {
          comments: true,
          savedBy: true,
        },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  const [isSaved, userReaction, relatedQuestions, relatedMaterials] = await Promise.all([
    session?.user?.id
      ? prisma.savedDiscussion.findUnique({
          where: {
            userId_discussionId: {
              userId: session.user.id,
              discussionId: id,
            },
          },
        }).then(Boolean)
      : Promise.resolve(false),
    session?.user?.id
      ? prisma.reaction.findUnique({
          where: {
            userId_discussionId: {
              userId: session.user.id,
              discussionId: id,
            },
          },
          select: { type: true },
        })
      : Promise.resolve(null),
    prisma.question.findMany({
      where: { categoryId: thread.categoryId },
      take: 3,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.material.findMany({
      where: { categoryId: thread.categoryId },
      take: 3,
      orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      include: { category: true },
    }),
  ]);

  const likeCount = thread.reactions.filter((reaction) => reaction.type === "LIKE").length;
  const dislikeCount = thread.reactions.filter((reaction) => reaction.type === "DISLIKE").length;
  const callbackUrl = `/community/thread/${id}`;
  const canManageThread = session?.user?.id === thread.authorId || session?.user?.role === "ADMIN";
  const threadRoleLabel = formatRelativeRole(
    thread.roleContext ?? thread.author.targetRole,
    thread.levelContext ?? thread.author.japaneseLevel
  );
  const postCommentAction = createComment.bind(null, id);

  return (
    <div className="container mx-auto max-w-6xl py-10">
      <div className="mb-8">
        <Link href="/community" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Community
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_360px]">
        <div className="space-y-8">
          <Card className="border-border">
            <CardHeader className="space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <Badge variant="secondary">{thread.category.name}</Badge>
                    <Badge variant="outline">{getDiscussionTypeLabel(thread.type)}</Badge>
                    <Badge
                      variant={thread.status === "SOLVED" ? "secondary" : "outline"}
                      className={thread.status === "SOLVED" ? "text-emerald-700" : ""}
                    >
                      {thread.status === "SOLVED" ? <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> : null}
                      {getDiscussionStatusLabel(thread.status)}
                    </Badge>
                    <span className="text-muted-foreground">{new Date(thread.createdAt).toLocaleString()}</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-2 font-medium text-card-foreground">
                      <UserCircle className="h-5 w-5 text-muted-foreground" />
                      {thread.author.name}
                    </span>
                    {threadRoleLabel ? (
                      <span className="rounded-full bg-muted px-3 py-1 font-medium">{threadRoleLabel}</span>
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
                    {thread.outcomeContext ? (
                      <span className="rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-700">
                        {thread.outcomeContext}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <SaveThreadButton
                    threadId={thread.id}
                    isInitiallySaved={isSaved}
                    callbackUrl={callbackUrl}
                  />
                  <ThreadReactionControls
                    threadId={thread.id}
                    callbackUrl={callbackUrl}
                    initialReaction={userReaction?.type ?? null}
                    likeCount={likeCount}
                    dislikeCount={dislikeCount}
                  />
                  {canManageThread ? <DeleteThreadButton threadId={id} /> : null}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <TranslatedContent
                contentId={thread.id}
                contentType="discussion"
                originalContent={thread.content}
                originalTitle={thread.title}
                originalLanguage={(thread as any).language}
                titleClassName="text-3xl font-bold text-foreground"
              />

              {thread.prompt ? (
                <div className="rounded-2xl border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-card-foreground mb-2">Prompt / question</p>
                  <TranslatedContent
                    contentId={`${thread.id}-prompt`}
                    contentType="discussion"
                    originalContent={thread.prompt}
                    originalLanguage={(thread as any).language}
                  />
                </div>
              ) : null}

              {thread.triedContext ? (
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-sm font-semibold text-card-foreground mb-2">What has been tried</p>
                  <TranslatedContent
                    contentId={`${thread.id}-tried`}
                    contentType="discussion"
                    originalContent={thread.triedContext}
                    originalLanguage={(thread as any).language}
                  />
                </div>
              ) : null}
            </CardContent>

            <CardFooter className="flex flex-wrap items-center justify-between gap-3 border-t bg-background/80">
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MessageSquare className="h-4 w-4" />
                  {thread._count.comments} replies
                </span>
                <span className="inline-flex items-center gap-1">
                  <Bookmark className="h-4 w-4" />
                  {thread._count.savedBy} saves
                </span>
              </div>

              {thread.type === "MOCK_ANSWER" ? (
                <Button asChild variant="outline">
                  <Link href="/ai-interview">
                    Practice Similar Question
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </CardFooter>
          </Card>

          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-foreground">Replies ({thread.comments.length})</h2>
              {thread.status === "SOLVED" ? (
                <span className="text-sm font-medium text-emerald-700">Marked as solved</span>
              ) : null}
            </div>

            {thread.comments.length > 0 ? (
              <div className="space-y-4">
                {thread.comments.map((comment) => {
                  const commentRoleLabel = formatRelativeRole(comment.author.targetRole, comment.author.japaneseLevel);
                  const scoreEntries = peerFeedbackFields
                    .map((field) => {
                      const score = comment[field.name];
                      if (!score) return null;
                      return { label: field.label, score };
                    })
                    .filter(Boolean) as { label: string; score: number }[];

                  return (
                    <Card
                      key={comment.id}
                      className={comment.isBestAnswer ? "border-emerald-300 bg-emerald-50/60" : "border-border bg-card"}
                    >
                      <CardContent className="p-6">
                        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-semibold text-foreground">{comment.author.name}</span>
                              {commentRoleLabel ? (
                                <span className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-slate-200">
                                  {commentRoleLabel}
                                </span>
                              ) : null}
                              {comment.isBestAnswer ? (
                                <Badge variant="secondary" className="text-emerald-700">
                                  <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
                                  Best answer
                                </Badge>
                              ) : null}
                            </div>
                            <p className="text-xs text-muted-foreground">{new Date(comment.createdAt).toLocaleString()}</p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {canManageThread ? (
                              <MarkBestAnswerButton commentId={comment.id} isBestAnswer={comment.isBestAnswer} />
                            ) : null}
                            {(session?.user?.id === comment.authorId || session?.user?.role === "ADMIN") ? (
                              <DeleteCommentButton commentId={comment.id} />
                            ) : null}
                          </div>
                        </div>

                        <TranslatedContent
                          contentId={comment.id}
                          contentType="comment"
                          originalContent={comment.content}
                          originalLanguage={(comment as any).language}
                        />

                        {scoreEntries.length > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {scoreEntries.map((entry) => (
                              <span
                                key={entry.label}
                                className="rounded-full bg-card px-3 py-1 text-xs font-medium text-muted-foreground ring-1 ring-slate-200"
                              >
                                {entry.label}: {entry.score}/5
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background py-12 text-center text-muted-foreground">
                No replies yet. Be the first to give focused feedback.
              </div>
            )}

            {session?.user ? (
              <Card className="border-primary/20 bg-primary/5">
                <form action={postCommentAction}>
                  <CardHeader>
                    <CardTitle className="text-lg">Add a reply</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Keep replies practical. Reference the question, suggest a stronger structure, and explain why.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    {thread.type === "MOCK_ANSWER" ? (
                      <div className="grid gap-4 md:grid-cols-4">
                        {peerFeedbackFields.map((field) => (
                          <div key={field.name} className="space-y-2">
                            <label htmlFor={field.name} className="text-sm font-medium text-card-foreground">
                              {field.label}
                            </label>
                            <select
                              id={field.name}
                              name={field.name}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                              defaultValue=""
                            >
                              <option value="">Skip</option>
                              {[1, 2, 3, 4, 5].map((value) => (
                                <option key={value} value={value}>
                                  {value}/5
                                </option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    <Textarea
                      name="content"
                      required
                      placeholder="Share a concrete improvement suggestion or helpful example."
                      className="min-h-[140px] bg-card"
                    />
                  </CardContent>
                  <CardFooter className="flex justify-end">
                    <Button type="submit">Post Reply</Button>
                  </CardFooter>
                </form>
              </Card>
            ) : (
              <div className="rounded-2xl bg-muted p-6 text-center text-muted-foreground">
                Please{" "}
                <Link href={`/login?callbackUrl=${callbackUrl}`} className="font-semibold text-primary hover:underline">
                  sign in
                </Link>{" "}
                to save this thread, react, and add a reply.
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg">Practice next</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {relatedQuestions.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-card-foreground">Related interview questions</p>
                  {relatedQuestions.map((question) => (
                    <Link
                      key={question.id}
                      href={`/questions/${question.id}`}
                      className="block rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-background"
                    >
                      <p className="font-medium text-foreground">{question.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{question.category.name}</p>
                    </Link>
                  ))}
                </div>
              ) : null}

              {relatedMaterials.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-card-foreground">Related learning materials</p>
                  {relatedMaterials.map((material) => (
                    <Link
                      key={material.id}
                      href={`/materials/${material.id}`}
                      className="block rounded-xl border border-border p-4 transition-colors hover:border-primary hover:bg-background"
                    >
                      <p className="font-medium text-foreground">{material.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{material.type} | {material.category.name}</p>
                    </Link>
                  ))}
                </div>
              ) : null}

              {relatedQuestions.length === 0 && relatedMaterials.length === 0 ? (
                <p className="text-sm text-muted-foreground">No related practice content found for this category yet.</p>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border bg-background/70">
            <CardHeader>
              <CardTitle className="text-lg">How to get better feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Ask for one specific outcome: structure, grammar, confidence, or Japanese politeness.</p>
              <p>Share the original prompt so reviewers can judge relevance.</p>
              <p>Mark the best answer when the thread is resolved to help the next learner faster.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
