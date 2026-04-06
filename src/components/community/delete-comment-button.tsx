"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteComment } from "@/lib/actions/community";
import { usePathname } from "next/navigation";

interface DeleteCommentButtonProps {
  commentId: string;
}

export function DeleteCommentButton({ commentId }: DeleteCommentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const pathname = usePathname();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteComment(commentId, pathname);
      if (!result.success) {
        alert(result.error || "Failed to delete comment.");
      }
    } catch (error) {
      console.error(error);
      alert("An unexpected error occurred.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Trash2 className="w-3.5 h-3.5" />
      )}
    </Button>
  );
}
