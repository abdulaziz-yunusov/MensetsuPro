"use client";

import { useState, useOptimistic, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import { toggleSaveMaterial } from "@/lib/actions/materials";

interface SaveMaterialButtonProps {
  materialId: string;
  isInitiallySaved: boolean;
  className?: string;
  variant?: "ghost" | "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showLabel?: boolean;
}

export default function SaveMaterialButton({
  materialId,
  isInitiallySaved,
  className = "",
  variant = "ghost",
  size = "icon",
  showLabel = false,
}: SaveMaterialButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [isOptimisticSaved, addOptimisticSaved] = useOptimistic(
    isInitiallySaved,
    (state, newState: boolean) => newState
  );

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startTransition(async () => {
      const newSavedState = !isOptimisticSaved;
      addOptimisticSaved(newSavedState);
      const result = await toggleSaveMaterial(materialId);
      if (!result.success) {
        // Revert optimistic update implicitly by doing nothing or showing alert
        console.error(result.error || "Failed to save material");
        // We'd ideally toast here
      }
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`${className} ${size === "icon" ? 'rounded-full' : ''}`}
      onClick={handleToggleSave}
      disabled={isPending}
      title={isOptimisticSaved ? "Remove from bookmarks" : "Save to bookmarks"}
    >
      <Bookmark
        className={`${showLabel ? 'mr-2' : ''} w-4 h-4 transition-colors ${
          isOptimisticSaved ? "fill-[#1e3a8a] text-[#1e3a8a]" : "text-muted-foreground"
        }`}
      />
      {showLabel && (isOptimisticSaved ? "Saved" : "Save")}
    </Button>
  );
}
