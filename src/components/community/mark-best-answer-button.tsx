"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { markBestAnswer } from "@/lib/actions/community";
import { CheckCircle2, Loader2, Star } from "lucide-react";

interface MarkBestAnswerButtonProps {
  commentId: string;
  isBestAnswer: boolean;
}

export function MarkBestAnswerButton({ commentId, isBestAnswer }: MarkBestAnswerButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);

    startTransition(async () => {
      const result = await markBestAnswer(commentId);
      if (!result.success) {
        setError(result.error ?? "Failed to update best answer.");
      }
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant={isBestAnswer ? "secondary" : "outline"}
        size="sm"
        onClick={handleClick}
        disabled={isPending}
        className={isBestAnswer ? "text-emerald-700" : ""}
      >
        {isPending ? (
          <Loader2 className="animate-spin" />
        ) : isBestAnswer ? (
          <CheckCircle2 className="fill-current" />
        ) : (
          <Star />
        )}
        {isBestAnswer ? "Best answer" : "Mark best"}
      </Button>
      {error ? <span className="text-xs text-rose-600">{error}</span> : null}
    </div>
  );
}
