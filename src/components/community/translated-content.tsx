"use client";

import React, { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Languages, RotateCcw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TranslatedContentProps {
  contentId: string;
  contentType: 'discussion' | 'comment';
  originalContent: string;
  originalTitle?: string;
  originalLanguage: string;
  className?: string;
  titleClassName?: string;
}

export function TranslatedContent({
  contentId,
  contentType,
  originalContent,
  originalTitle,
  originalLanguage,
  className,
  titleClassName,
}: TranslatedContentProps) {
  const { t, locale: targetLocale } = useTranslation();
  const [isTranslated, setIsTranslated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [translatedContent, setTranslatedContent] = useState<string | null>(null);
  const [translatedTitle, setTranslatedTitle] = useState<string | null>(null);

  const handleTranslate = async () => {
    if (isTranslated) {
      setIsTranslated(false);
      return;
    }

    if (translatedContent) {
      setIsTranslated(true);
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentId,
          contentType,
          targetLanguage: targetLocale,
        }),
      });

      if (!res.ok) throw new Error("Translation failed");

      const data = await res.json();
      setTranslatedContent(data.translatedContent);
      setTranslatedTitle(data.translatedTitle);
      setIsTranslated(true);
    } catch (error) {
      console.error(error);
      alert("Could not translate content. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const showTranslateButton = originalLanguage !== targetLocale;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-col gap-3">
        {originalTitle && (
          <h2 className={cn("text-2xl font-bold tracking-tight", titleClassName)}>
            {isTranslated && translatedTitle ? translatedTitle : originalTitle}
          </h2>
        )}
        
        <div className="relative group">
          <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
            {isTranslated && translatedContent ? translatedContent : originalContent}
          </p>
          
          {isTranslated && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/5 border border-primary/10 text-[10px] font-medium text-primary">
              <Languages size={10} />
              {t('community.translatedByAI')}
            </div>
          )}
        </div>
      </div>

      {showTranslateButton && (
        <div className="flex items-center gap-2 pt-2 border-t border-border/40 mt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTranslate}
            disabled={isLoading}
            className={cn(
              "h-8 px-2.5 text-xs font-semibold gap-1.5 rounded-lg transition-all",
              isTranslated 
                ? "text-primary bg-primary/5 hover:bg-primary/10" 
                : "text-muted-foreground hover:text-primary hover:bg-primary/5"
            )}
          >
            {isLoading ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isTranslated ? (
              <>
                <RotateCcw size={14} />
                {t('community.showOriginal')}
              </>
            ) : (
              <>
                <Languages size={14} />
                {t('community.translate')}
              </>
            )}
          </Button>
          
          {!isTranslated && !isLoading && (
            <span className="text-[10px] text-muted-foreground/60 italic font-medium">
               {t('community.originalLanguage')}: {originalLanguage.toUpperCase()}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
