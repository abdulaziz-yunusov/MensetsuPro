"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleSaveDiscussion } from "@/lib/actions/community";
import { useRouter } from "next/navigation";

interface SaveThreadButtonProps {
  threadId: string;
  isInitiallySaved: boolean;
  callbackUrl: string;
  showLabel?: boolean;
  variant?: "ghost" | "outline" | "secondary" | "default";
  size?: "default" | "sm" | "lg" | "icon" | "icon-sm";
  className?: string;
}

export function SaveThreadButton({
  threadId,
  isInitiallySaved,
  callbackUrl,
  showLabel = true,
  variant = "outline",
  size = "sm",
  className,
}: SaveThreadButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);

  const handleSave = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    startTransition(async () => {
      const nextState = !isSaved;
      setIsSaved(nextState);

      const result = await toggleSaveDiscussion(threadId);
      if (!result.success) {
        setIsSaved(!nextState);
        if (result.error?.includes("logged in")) {
          router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
        }
      }
    });
  };

  return (
    <Button
      type="button"
      variant={isSaved ? "secondary" : variant}
      size={size}
      onClick={handleSave}
      disabled={isPending}
      className={className}
      title={isSaved ? "Saved discussion" : "Save discussion"}
    >
      <Bookmark className={isSaved ? "fill-current" : ""} />
      {showLabel ? (isSaved ? "Saved" : "Save") : null}
    </Button>
  );
}
