"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleDiscussionReaction } from "@/lib/actions/community";
import { cn } from "@/lib/utils";
import { type ReactionTypeValue } from "@/lib/community";
import { ThumbsDown, ThumbsUp } from "lucide-react";

interface ThreadReactionControlsProps {
  threadId: string;
  callbackUrl: string;
  initialReaction: ReactionTypeValue | null;
  likeCount: number;
  dislikeCount: number;
  compact?: boolean;
}

type ReactionState = {
  reaction: ReactionTypeValue | null;
  likeCount: number;
  dislikeCount: number;
};

function getNextReactionState(state: ReactionState, nextReaction: ReactionTypeValue): ReactionState {
  const updated = { ...state };

  if (state.reaction === nextReaction) {
    updated.reaction = null;
    if (nextReaction === "LIKE") updated.likeCount -= 1;
    if (nextReaction === "DISLIKE") updated.dislikeCount -= 1;
    return updated;
  }

  if (state.reaction === "LIKE") updated.likeCount -= 1;
  if (state.reaction === "DISLIKE") updated.dislikeCount -= 1;

  updated.reaction = nextReaction;
  if (nextReaction === "LIKE") updated.likeCount += 1;
  if (nextReaction === "DISLIKE") updated.dislikeCount += 1;

  return updated;
}

export function ThreadReactionControls({
  threadId,
  callbackUrl,
  initialReaction,
  likeCount,
  dislikeCount,
  compact = false,
}: ThreadReactionControlsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ReactionState>({
    reaction: initialReaction,
    likeCount,
    dislikeCount,
  });

  const handleReact = (event: React.MouseEvent, type: ReactionTypeValue) => {
    event.preventDefault();
    event.stopPropagation();

    const previousState = { ...state };

    startTransition(async () => {
      setState((currentState) => getNextReactionState(currentState, type));
      const result = await toggleDiscussionReaction(threadId, type);
      if (!result.success) {
        setState(previousState);
        if (result.error?.includes("logged in")) {
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      }
    });
  };

  return (
    <div className={cn("flex items-center gap-2", compact && "gap-1")}>
      <Button
        type="button"
        variant={state.reaction === "LIKE" ? "secondary" : "outline"}
        size={compact ? "icon-sm" : "sm"}
        disabled={isPending}
        onClick={(event) => handleReact(event, "LIKE")}
        className={cn(state.reaction === "LIKE" && "text-emerald-700")}
      >
        <ThumbsUp className={state.reaction === "LIKE" ? "fill-current" : ""} />
        {compact ? null : <span>{state.likeCount}</span>}
      </Button>

      <Button
        type="button"
        variant={state.reaction === "DISLIKE" ? "secondary" : "outline"}
        size={compact ? "icon-sm" : "sm"}
        disabled={isPending}
        onClick={(event) => handleReact(event, "DISLIKE")}
        className={cn(state.reaction === "DISLIKE" && "text-rose-700")}
      >
        <ThumbsDown className={state.reaction === "DISLIKE" ? "fill-current" : ""} />
        {compact ? null : <span>{state.dislikeCount}</span>}
      </Button>
    </div>
  );
}
