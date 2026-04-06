"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import { deleteThread } from "@/lib/actions/community";
import { useRouter } from "next/navigation";

interface DeleteThreadButtonProps {
  threadId: string;
}

export function DeleteThreadButton({ threadId }: DeleteThreadButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this thread? This action cannot be undone and all comments will be removed.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const result = await deleteThread(threadId);
      if (result.success) {
        router.push("/community");
        router.refresh(); // Ensure the list is updated
      } else {
        alert(result.error || "Failed to delete thread.");
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
      size="sm" 
      className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 -mr-2"
      onClick={handleDelete}
      disabled={isDeleting}
    >
      {isDeleting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </>
      )}
    </Button>
  );
}
