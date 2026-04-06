"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Bookmark, Search, Filter, AlertCircle, Lightbulb, CheckCircle2, BookmarkCheck } from "lucide-react";
import { getMoreQuestions, toggleSaveQuestion } from "@/lib/actions/questions";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/i18n";
import { localizeCategory, localizeDifficulty } from "@/lib/i18n-ui";

interface Question {
  id: string;
  title: string;
  titleEn: string | null;
  recommendedAnswer: string | null;
  sampleAnswer: string | null;
  badSampleAnswer: string | null;
  tips: string | null;
  commonMistakes: string | null;
  evaluationCriteria: string | null;
  difficulty: string | null;
  category: {
    id: string;
    name: string;
  };
}

interface QuestionListProps {
  questions: Question[];
  categories: { id: string; name: string }[];
  initialSavedQuestionIds?: string[];
  userId?: string;
}

const questionListCopy: Record<
  Locale,
  {
    categories: string;
    showingQuestions: (count: number) => string;
    expectedStructure: string;
    goodPractices: string;
    commonMistakes: string;
    goodSampleAnswer: string;
    badSampleAnswer: string;
    notAvailable: string;
    evaluationCriteria: string;
    noMatch: string;
    clearFilters: string;
    loadMore: string;
    endReached: string;
    saveQuestion: string;
    savedOn: string;
  }
> = {
  en: {
    categories: "Categories",
    showingQuestions: (count) => `${count} questions shown`,
    expectedStructure: "Expected Structure",
    goodPractices: "Good Practices & Tips",
    commonMistakes: "Common Mistakes",
    goodSampleAnswer: "Good Sample Answer",
    badSampleAnswer: "Bad Sample Answer",
    notAvailable: "Not available for this question.",
    evaluationCriteria: "Evaluation Criteria",
    noMatch: "No questions found matching your filters.",
    clearFilters: "Clear all filters",
    loadMore: "Load More Questions",
    endReached: "You've reached the end of the question bank.",
    saveQuestion: "Save Question",
    savedOn: "Saved on",
  },
  ru: {
    categories: "Категории",
    showingQuestions: (count) => `Показано вопросов: ${count}`,
    expectedStructure: "Ожидаемая структура",
    goodPractices: "Полезные советы",
    commonMistakes: "Частые ошибки",
    goodSampleAnswer: "Хороший пример ответа",
    badSampleAnswer: "Неудачный пример ответа",
    notAvailable: "Для этого вопроса пример пока недоступен.",
    evaluationCriteria: "Критерии оценки",
    noMatch: "По этим фильтрам вопросы не найдены.",
    clearFilters: "Сбросить фильтры",
    loadMore: "Загрузить еще вопросы",
    endReached: "Вы дошли до конца банка вопросов.",
    saveQuestion: "Сохранить вопрос",
    savedOn: "Сохранено",
  },
  ja: {
    categories: "カテゴリー",
    showingQuestions: (count) => `${count}件の質問を表示中`,
    expectedStructure: "想定される回答構成",
    goodPractices: "良いポイントとコツ",
    commonMistakes: "よくあるミス",
    goodSampleAnswer: "良い回答例",
    badSampleAnswer: "悪い回答例",
    notAvailable: "この質問ではまだ利用できません。",
    evaluationCriteria: "評価基準",
    noMatch: "条件に一致する質問が見つかりません。",
    clearFilters: "フィルターをリセット",
    loadMore: "さらに質問を読み込む",
    endReached: "質問バンクの最後まで表示しました。",
    saveQuestion: "質問を保存",
    savedOn: "保存日",
  },
  uz: {
    categories: "Kategoriyalar",
    showingQuestions: (count) => `${count} ta savol ko'rsatilmoqda`,
    expectedStructure: "Tavsiya etilgan tuzilma",
    goodPractices: "Foydali maslahatlar",
    commonMistakes: "Ko'p uchraydigan xatolar",
    goodSampleAnswer: "Yaxshi javob namunasi",
    badSampleAnswer: "Noto'g'ri javob namunasi",
    notAvailable: "Bu savol uchun namuna hozircha mavjud emas.",
    evaluationCriteria: "Baholash mezonlari",
    noMatch: "Filtrlarga mos savollar topilmadi.",
    clearFilters: "Filtrlarni tozalash",
    loadMore: "Yana savollarni yuklash",
    endReached: "Savollar bankining oxiriga yetdingiz.",
    saveQuestion: "Savolni saqlash",
    savedOn: "Saqlangan sana",
  },
};
export default function QuestionList({ 
  questions, 
  categories, 
  initialSavedQuestionIds = [],
  userId 
}: QuestionListProps) {
  const router = useRouter();
  const { t, locale } = useTranslation();
  const copy = questionListCopy[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  
  // Pagination state
  const [displayedQuestions, setDisplayedQuestions] = useState<Question[]>(questions);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Saved state
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set(initialSavedQuestionIds));
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const handleToggleSave = async (questionId: string) => {
    if (!userId) {
      router.push("/login?callbackUrl=/questions");
      return;
    }

    if (isSaving) return;

    // Optimistic UI
    const newSavedIds = new Set(savedIds);
    const isCurrentlySaved = newSavedIds.has(questionId);
    
    if (isCurrentlySaved) {
      newSavedIds.delete(questionId);
    } else {
      newSavedIds.add(questionId);
    }
    setSavedIds(newSavedIds);
    setIsSaving(questionId);

    try {
      const result = await toggleSaveQuestion(questionId);
      if (!result.success) {
        // Revert optimistic update
        setSavedIds(new Set(savedIds));
        console.error(result.error || "Failed to update saved question");
      }
    } catch (error) {
      setSavedIds(new Set(savedIds));
      console.error("An unexpected error occurred", error);
    } finally {
      setIsSaving(null);
    }
  };

  const filteredQuestions = displayedQuestions.filter((q) => {
    const matchesSearch = 
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.titleEn?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesCategory = 
      !selectedCategory || q.category.name === selectedCategory;
    
    const matchesDifficulty = 
      !selectedDifficulty || q.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    const skip = displayedQuestions.length;
    
    try {
      const result = await getMoreQuestions(skip, 10);
      
      if (result.success && result.questions) {
        // Cast to Question[] to match our manual interface if necessary
        const newQuestions = result.questions as unknown as Question[];
        setDisplayedQuestions(prev => [...prev, ...newQuestions]);
        
        if (result.questions.length < 10) {
          setHasMore(false);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Failed to load more questions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar logic remains same... */}
      {/* ... */}
      {/* Left Sidebar Filters */}
      <aside className="w-full lg:w-1/4 flex flex-col gap-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              type="search" 
              placeholder={t("questions.search")} 
              className="pl-9 bg-card"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Card className="border-border">
          <CardContent className="p-5">
            <div className="flex items-center gap-2 font-semibold text-foreground mb-4 pb-2 border-b border-border/50">
              <Filter className="w-4 h-4" />
              {copy.categories}
            </div>
            <div className="flex flex-col gap-1">
              <button 
                className={`text-left px-3 py-2 rounded-md transition-colors text-sm ${!selectedCategory ? 'bg-blue-50 text-[#1e3a8a] font-medium' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}
                onClick={() => setSelectedCategory(null)}
              >
                {t("questions.allCategories")}
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat.id} 
                  className={`text-left px-3 py-2 rounded-md transition-colors text-sm ${selectedCategory === cat.name ? 'bg-blue-50 text-[#1e3a8a] font-medium' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  {localizeCategory(locale, cat.name)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 font-semibold text-foreground mt-8 mb-4 pb-2 border-b border-border/50">
              {t("questions.difficulty")}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Beginner", "Intermediate", "Advanced"].map((diff) => (
                <Badge 
                  key={diff} 
                  variant={selectedDifficulty === diff ? "default" : "outline"} 
                  className={`cursor-pointer hover:bg-muted border-border font-normal ${selectedDifficulty === diff ? 'bg-[#1e3a8a] text-white' : ''}`}
                  onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? null : diff)}
                >
                  {localizeDifficulty(locale, diff)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </aside>

      {/* Right Content - Question List */}
      <main className="w-full lg:w-3/4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-muted-foreground">{copy.showingQuestions(filteredQuestions.length)}</span>
        </div>

        <Accordion className="flex flex-col gap-4">
          {filteredQuestions.map((q) => (
            <AccordionItem key={q.id} value={`item-${q.id}`} className="bg-card border border-border rounded-lg px-2 shadow-sm [&[data-state=open]]:border-[#1e3a8a]">
              <AccordionTrigger className="hover:no-underline px-4 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full text-left gap-4 pr-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-muted text-card-foreground">{localizeCategory(locale, q.category.name)}</Badge>
                      <Badge variant="outline" className={`border-transparent ${
                        q.difficulty === 'Beginner' ? 'bg-emerald-50 text-emerald-700' :
                        q.difficulty === 'Intermediate' ? 'bg-amber-50 text-amber-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>{localizeDifficulty(locale, q.difficulty)}</Badge>
                    </div>
                    <span className="font-bold text-lg text-foreground leading-snug">{q.title}</span>
                    <span className="text-sm text-muted-foreground">{q.titleEn}</span>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-4 pb-6 pt-2">
                <div className="flex justify-end mb-4 border-b border-border/50 pb-4">
                  <Button 
                    variant={savedIds.has(q.id) ? "secondary" : "outline"} 
                    size="sm" 
                    className="gap-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleSave(q.id);
                    }}
                    disabled={isSaving === q.id}
                  >
                    {savedIds.has(q.id) ? (
                      <BookmarkCheck className="w-4 h-4 text-[#1e3a8a] fill-[#1e3a8a]" />
                    ) : (
                      <Bookmark className="w-4 h-4 text-muted-foreground" />
                    )}
                    {savedIds.has(q.id) ? t("questions.saved") : copy.saveQuestion}
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {q.recommendedAnswer && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          {copy.expectedStructure}
                        </h4>
                        <div className="bg-background rounded-md p-4 text-sm text-card-foreground whitespace-pre-line border border-border shadow-sm">
                          {q.recommendedAnswer}
                        </div>
                      </div>
                    )}

                    {q.tips && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                          <Lightbulb className="w-5 h-5 text-indigo-500" />
                          {copy.goodPractices}
                        </h4>
                        <div className="bg-indigo-50/20 rounded-md p-4 text-sm text-card-foreground whitespace-pre-line border border-indigo-100 shadow-sm">
                          {q.tips}
                        </div>
                      </div>
                    )}

                    {q.commonMistakes && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                          <AlertCircle className="w-5 h-5 text-rose-600" />
                          {copy.commonMistakes}
                        </h4>
                        <div className="bg-rose-50/50 rounded-md p-4 text-sm text-rose-900 whitespace-pre-line border border-rose-100 shadow-sm">
                          {q.commonMistakes}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {q.sampleAnswer && (
                      <div>
                        <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                          {copy.goodSampleAnswer}
                        </h4>
                        <div className="bg-emerald-50/40 rounded-md p-4 text-sm text-foreground leading-relaxed border border-emerald-100 shadow-sm italic">
                          "{q.sampleAnswer}"
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                        <AlertCircle className="w-5 h-5 text-muted-foreground" />
                        {copy.badSampleAnswer}
                      </h4>
                      <div className="bg-background rounded-md p-4 text-sm text-muted-foreground leading-relaxed border border-border shadow-sm opacity-90 italic">
                        {q.badSampleAnswer ? `"${q.badSampleAnswer}"` : copy.notAvailable}
                      </div>
                    </div>
                  </div>
                </div>

                {q.evaluationCriteria && (
                  <div className="mt-8 border-t border-border/50 pt-6">
                    <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
                      <Search className="w-5 h-5 text-[#1e3a8a]" />
                      {copy.evaluationCriteria}
                    </h4>
                    <div className="bg-blue-50/30 rounded-md p-4 text-sm text-card-foreground whitespace-pre-line border border-blue-100 shadow-sm">
                      {q.evaluationCriteria}
                    </div>
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {filteredQuestions.length === 0 && (
          <div className="text-center py-20 bg-background rounded-lg border-2 border-dashed border-border mt-4">
            <p className="text-muted-foreground">{copy.noMatch}</p>
            <Button 
              variant="link" 
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
                setSelectedDifficulty(null);
              }}
            >
              {copy.clearFilters}
            </Button>
          </div>
        )}

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <Button 
              variant="outline" 
              className="w-full sm:w-auto min-w-[200px]"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 mr-2 border-2 border-border border-t-slate-600 rounded-full animate-spin"></span>
                  {t("common.loading")}
                </>
              ) : copy.loadMore}
            </Button>
          </div>
        )}

        {!hasMore && displayedQuestions.length > 0 && (
          <p className="text-center text-muted-foreground text-sm mt-8">{copy.endReached}</p>
        )}
      </main>
    </div>
  );
}
