"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createDiscussion } from "@/lib/actions/community";
import { discussionTypeOptions, getDiscussionTypeHint, type DiscussionTypeValue } from "@/lib/community";
import { useTranslation } from "@/hooks/useTranslation";
import { detectLanguage } from "@/lib/i18n-utils";
import { Globe, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface NewDiscussionFormProps {
  categories: { id: string; name: string }[];
  defaultRoleContext?: string | null;
  defaultLevelContext?: string | null;
}

type DiscussionFieldName =
  | "categoryId"
  | "title"
  | "prompt"
  | "companyContext"
  | "stageContext"
  | "outcomeContext"
  | "triedContext"
  | "content"
  | "language";

type FormErrors = Partial<Record<DiscussionFieldName, string>>;

function getRequiredFieldsByType(type: DiscussionTypeValue): DiscussionFieldName[] {
  const shared: DiscussionFieldName[] = ["categoryId", "title", "content"];

  if (type === "QUESTION") {
    return [...shared, "prompt", "triedContext"];
  }

  if (type === "MOCK_ANSWER") {
    return [...shared, "prompt"];
  }

  if (type === "EXPERIENCE") {
    return [...shared, "companyContext", "stageContext", "outcomeContext"];
  }

  return [...shared, "triedContext"];
}

function getFieldMessage(field: DiscussionFieldName, type: DiscussionTypeValue) {
  switch (field) {
    case "categoryId":
      return "Select a category for this discussion.";
    case "title":
      return "Enter a title for your discussion.";
    case "prompt":
      return type === "MOCK_ANSWER"
        ? "Paste the interview prompt you answered."
        : "Paste the question or prompt you need help with.";
    case "companyContext":
      return "Enter the company or industry context.";
    case "stageContext":
      return "Enter the interview stage.";
    case "outcomeContext":
      return "Enter the interview outcome.";
    case "triedContext":
      return "Show what you already tried or your current draft.";
    case "content":
      return "Add the main discussion details.";
    default:
      return "This field is required.";
  }
}

function RequiredMark() {
  return <span className="text-rose-600 ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm font-medium text-rose-600 mt-1">{message}</p>;
}

export function NewDiscussionForm({
  categories,
  defaultRoleContext,
  defaultLevelContext,
}: NewDiscussionFormProps) {
  const { t, locale: appLocale } = useTranslation();
  const [discussionType, setDiscussionType] = useState<DiscussionTypeValue>("QUESTION");
  const [errors, setErrors] = useState<FormErrors>({});
  const [selectedLanguage, setSelectedLanguage] = useState<string>(appLocale || "en");
  const [isAutoDetecting, setIsAutoDetecting] = useState(true);

  const requiredFields = useMemo(
    () => new Set<DiscussionFieldName>(getRequiredFieldsByType(discussionType)),
    [discussionType]
  );

  const errorList = Object.values(errors);

  const clearFieldError = (field: DiscussionFieldName) => {
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    clearFieldError("content");
    
    if (isAutoDetecting && text.length > 5) {
      const detected = detectLanguage(text);
      if (detected !== selectedLanguage) {
        setSelectedLanguage(detected);
      }
    }
  };

  const validateForm = (formData: FormData) => {
    const nextErrors: FormErrors = {};

    for (const field of requiredFields) {
      const value = formData.get(field);
      const normalized = typeof value === "string" ? value.trim() : "";

      if (!normalized) {
        nextErrors[field] = getFieldMessage(field, discussionType);
      }
    }

    return nextErrors;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(event.currentTarget);
    const nextErrors = validateForm(formData);

    if (Object.keys(nextErrors).length > 0) {
      event.preventDefault();
      setErrors(nextErrors);
    }
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/30 border-b border-border/50">
        <CardTitle className="text-2xl font-bold flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-primary" /> {t('community.newPost.title')}
        </CardTitle>
      </CardHeader>
      <form action={createDiscussion} onSubmit={handleSubmit} noValidate>
        <input type="hidden" name="language" value={selectedLanguage} />
        
        <CardContent className="space-y-6 pt-6">
          {errorList.length > 0 ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <p className="font-semibold">Fill the highlighted fields before posting.</p>
              <ul className="mt-2 list-disc pl-5">
                {errorList.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="type" className="font-semibold">{t('community.newPost.type')} <RequiredMark /></Label>
              <select
                id="type"
                name="type"
                value={discussionType}
                onChange={(event) => {
                  setDiscussionType(event.target.value as DiscussionTypeValue);
                  setErrors({});
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              >
                {discussionTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground mt-1">
                {discussionTypeOptions.find((option) => option.value === discussionType)?.description}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId" className="font-semibold">{t('community.newPost.category')} <RequiredMark /></Label>
              <select
                id="categoryId"
                name="categoryId"
                disabled={categories.length === 0}
                onChange={() => clearFieldError("categoryId")}
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none",
                  errors.categoryId && "border-rose-500 ring-rose-500/10"
                )}
              >
                <option value="">{t('community.newPost.selectCategory')}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <FieldError message={errors.categoryId} />
            </div>
          </div>

          <div className="bg-muted/30 p-5 rounded-2xl border border-border/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-semibold flex items-center gap-2">
                  <Globe size={16} className="text-primary" /> {t('community.newPost.language')}
                </p>
                <p className="text-xs text-muted-foreground">{t('community.newPost.languageDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    setSelectedLanguage(e.target.value);
                    setIsAutoDetecting(false);
                  }}
                  className="h-10 rounded-lg border border-border bg-background px-4 text-sm font-semibold shadow-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                >
                  <option value="en">English (EN)</option>
                  <option value="ru">Русский (RU)</option>
                  <option value="ja">日本語 (JP)</option>
                  <option value="uz">O'zbek (UZ)</option>
                </select>
                <button
                  type="button"
                  onClick={() => setIsAutoDetecting(!isAutoDetecting)}
                  className={cn(
                    "text-[10px] whitespace-nowrap font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition-all border",
                    isAutoDetecting 
                      ? "bg-primary/10 text-primary border-primary/20" 
                      : "bg-background text-muted-foreground border-border"
                  )}
                >
                  {isAutoDetecting ? "Auto-detect: ON" : "Auto-detect: OFF"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="roleContext" className="font-semibold">Target role</Label>
              <Input
                id="roleContext"
                name="roleContext"
                defaultValue={defaultRoleContext ?? ""}
                placeholder="Frontend Engineer, QA, Product Manager"
                className="bg-card/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="levelContext" className="font-semibold">Japanese level</Label>
              <select
                id="levelContext"
                name="levelContext"
                defaultValue={defaultLevelContext ?? ""}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              >
                <option value="">Not specified</option>
                {["N5", "N4", "N3", "N2", "N1", "NATIVE"].map((level) => (
                  <option key={level} value={level}>
                    JLPT {level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="font-semibold">{t('community.newPost.postTitle')} <RequiredMark /></Label>
            <Input
              id="title"
              name="title"
              onChange={() => clearFieldError("title")}
              placeholder={t('community.newPost.placeholderTitle')}
              className={cn("bg-card/50", errors.title && "border-rose-500")}
            />
            <FieldError message={errors.title} />
          </div>

          {(discussionType === "MOCK_ANSWER" || discussionType === "QUESTION") && (
            <div className="space-y-2">
              <Label htmlFor="prompt" className="font-semibold">Interview prompt or question <RequiredMark /></Label>
              <Textarea
                id="prompt"
                name="prompt"
                onChange={() => clearFieldError("prompt")}
                className={cn("min-h-[100px] bg-card/50", errors.prompt && "border-rose-500")}
                placeholder="Paste the exact prompt or question you are answering."
              />
              <FieldError message={errors.prompt} />
            </div>
          )}

          {discussionType === "EXPERIENCE" && (
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="companyContext" className="font-semibold">Company / industry <RequiredMark /></Label>
                <Input
                  id="companyContext"
                  name="companyContext"
                  onChange={() => clearFieldError("companyContext")}
                  placeholder="Rakuten, startup, fintech"
                  className={cn("bg-card/50", errors.companyContext && "border-rose-500")}
                />
                <FieldError message={errors.companyContext} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stageContext" className="font-semibold">Stage <RequiredMark /></Label>
                <Input
                  id="stageContext"
                  name="stageContext"
                  onChange={() => clearFieldError("stageContext")}
                  placeholder="Screening, final round"
                  className={cn("bg-card/50", errors.stageContext && "border-rose-500")}
                />
                <FieldError message={errors.stageContext} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="outcomeContext" className="font-semibold">Outcome <RequiredMark /></Label>
                <Input
                  id="outcomeContext"
                  name="outcomeContext"
                  onChange={() => clearFieldError("outcomeContext")}
                  placeholder="Waiting, rejected, offer"
                  className={cn("bg-card/50", errors.outcomeContext && "border-rose-500")}
                />
                <FieldError message={errors.outcomeContext} />
              </div>
            </div>
          )}

          {(discussionType === "QUESTION" || discussionType === "RESUME_REVIEW") && (
            <div className="space-y-2">
              <Label htmlFor="triedContext" className="font-semibold">What have you tried so far? <RequiredMark /></Label>
              <Textarea
                id="triedContext"
                name="triedContext"
                onChange={() => clearFieldError("triedContext")}
                className={cn("min-h-[110px] bg-card/50", errors.triedContext && "border-rose-500")}
                placeholder="Show your attempt, current draft, or what advice you already applied."
              />
              <FieldError message={errors.triedContext} />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="content" className="font-semibold">{t('community.newPost.details')} <RequiredMark /></Label>
            <Textarea
              id="content"
              name="content"
              onChange={handleContentChange}
              className={cn("min-h-[220px] bg-card/50", errors.content && "border-rose-500")}
              placeholder={getDiscussionTypeHint(discussionType)}
            />
            <FieldError message={errors.content} />
            <p className="text-xs text-muted-foreground mt-2 italic">
              Clear posts get better answers. Include your context, current level, and the specific feedback you need.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-4 border-t border-border/50 p-6 bg-muted/20">
          <Button variant="outline" asChild className="rounded-lg px-6">
            <Link href="/community">{t('common.cancel')}</Link>
          </Button>
          <Button type="submit" disabled={categories.length === 0} className="rounded-lg px-10 font-bold">
            {t('community.newPost.submit')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
