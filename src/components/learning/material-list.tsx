"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, PlayCircle, BookOpen, FileText, Eye, Globe, RefreshCw, ExternalLink } from "lucide-react";
import { searchExternalMaterials } from "@/lib/actions/materials";
import { ExternalMaterial } from "@/lib/services/external-materials";
import Link from "next/link";
import SaveMaterialButton from "./save-material-button";
import { useTranslation } from "@/hooks/useTranslation";
import type { Locale } from "@/i18n";
import { localizeCategory, localizeMaterialType } from "@/lib/i18n-ui";

interface Material {
  id: string;
  title: string;
  description: string | null;
  type: string;
  url: string;
  difficulty: string | null;
  isFeatured: boolean;
  views: number;
  category: {
    id: string;
    name: string;
  };
}

interface MaterialListProps {
  materials: Material[];
  categories: { id: string; name: string }[];
  savedMaterialIds?: string[];
}

export default function MaterialList({ materials, categories, savedMaterialIds = [] }: MaterialListProps) {
  const { locale } = useTranslation();
  const materialListCopy: Record<Locale, Record<string, string>> = {
    en: {
      searchMaterials: "Search materials...",
      all: "All",
      video: "Video",
      article: "Article",
      book: "Book",
      searchSource: "Search Source:",
      curated: "Curated",
      externalWeb: "External Web",
      deepSearch: "Deep Search Web",
      allTopics: "All Topics",
      webResults: "Web Discovery Results",
      query: "Query",
      viewOn: "View on",
      discoverTitle: "Discover Resources Across the Web",
      discoverSubtitle: "Use keywords like \"React Japanese Interview\" or \"Soft Skills in Japan\" to find videos, books, and articles.",
      enterThree: "Please enter at least 3 characters to search.",
      staffPicks: "Staff Picks",
      recommended: "Recommended Resource",
      featured: "Featured",
      featuredFallback: "A featured learning material selected for interview preparation.",
      views: "views",
      watchNow: "Watch Now",
      latestAdditions: "Latest Additions",
      noMatch: "No materials found matching your filters.",
      clearFilters: "Clear all filters",
    },
    ru: {
      searchMaterials: "Поиск материалов...",
      all: "Все",
      video: "Видео",
      article: "Статья",
      book: "Книга",
      searchSource: "Источник поиска:",
      curated: "Отобранные",
      externalWeb: "Веб-поиск",
      deepSearch: "Глубокий веб-поиск",
      allTopics: "Все темы",
      webResults: "Результаты поиска в сети",
      query: "Запрос",
      viewOn: "Открыть на",
      discoverTitle: "Найдите материалы по всему вебу",
      discoverSubtitle: "Используйте запросы вроде \"React Japanese Interview\" или \"Soft Skills in Japan\", чтобы найти видео, книги и статьи.",
      enterThree: "Введите не менее 3 символов для поиска.",
      staffPicks: "Выбор редакции",
      recommended: "Рекомендуемый материал",
      featured: "Рекомендуется",
      featuredFallback: "Рекомендуемый учебный материал для подготовки к интервью.",
      views: "просмотров",
      watchNow: "Смотреть",
      latestAdditions: "Последние добавления",
      noMatch: "По текущим фильтрам материалы не найдены.",
      clearFilters: "Сбросить фильтры",
    },
    ja: {
      searchMaterials: "教材を検索...",
      all: "すべて",
      video: "動画",
      article: "記事",
      book: "本",
      searchSource: "検索元:",
      curated: "厳選",
      externalWeb: "外部Web",
      deepSearch: "Webを詳しく検索",
      allTopics: "すべてのトピック",
      webResults: "Web検索結果",
      query: "検索語",
      viewOn: "表示先",
      discoverTitle: "Web全体から教材を探す",
      discoverSubtitle: "「React Japanese Interview」や「Soft Skills in Japan」のようなキーワードで動画、本、記事を探せます。",
      enterThree: "検索には3文字以上入力してください。",
      staffPicks: "スタッフおすすめ",
      recommended: "おすすめ教材",
      featured: "注目",
      featuredFallback: "面接対策向けに選ばれた注目教材です。",
      views: "閲覧",
      watchNow: "今すぐ見る",
      latestAdditions: "最新追加",
      noMatch: "条件に一致する教材が見つかりません。",
      clearFilters: "フィルターをクリア",
    },
    uz: {
      searchMaterials: "Materiallarni qidirish...",
      all: "Barchasi",
      video: "Video",
      article: "Maqola",
      book: "Kitob",
      searchSource: "Qidiruv manbasi:",
      curated: "Saralangan",
      externalWeb: "Tashqi veb",
      deepSearch: "Chuqur veb qidiruvi",
      allTopics: "Barcha mavzular",
      webResults: "Veb qidiruv natijalari",
      query: "So'rov",
      viewOn: "Ochish",
      discoverTitle: "Veb bo'ylab resurslarni toping",
      discoverSubtitle: "\"React Japanese Interview\" yoki \"Soft Skills in Japan\" kabi kalit so'zlar bilan video, kitob va maqolalarni toping.",
      enterThree: "Qidirish uchun kamida 3 ta belgi kiriting.",
      staffPicks: "Jamoa tanlovi",
      recommended: "Tavsiya etilgan resurs",
      featured: "Tavsiya etiladi",
      featuredFallback: "Intervyu tayyorgarligi uchun tanlangan material.",
      views: "ko'rish",
      watchNow: "Hozir ko'rish",
      latestAdditions: "So'nggi qo'shilganlar",
      noMatch: "Filtrlarga mos materiallar topilmadi.",
      clearFilters: "Filtrlarni tozalash",
    },
  };
  const copy = materialListCopy[locale];
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("All Topics");
  
  // External Search state
  const [isExternalSearchEnabled, setIsExternalSearchEnabled] = useState(false);
  const [externalResults, setExternalResults] = useState<ExternalMaterial[]>([]);
  const [isSearchingExternal, setIsSearchingExternal] = useState(false);

  const filteredMaterials = (materials || []).filter((m) => {
    const matchesSearch = 
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
    
    const matchesType = 
      selectedType === "all" || m.type === selectedType;
    
    const matchesCategory = 
      selectedCategory === "All Topics" || m.category.name === selectedCategory;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleExternalSearch = async () => {
    if (searchQuery.length < 3) return;
    setIsSearchingExternal(true);
    try {
      const result = await searchExternalMaterials(searchQuery);
      if (result.success) {
        setExternalResults(result.results);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSearchingExternal(false);
    }
  };

  const filteredExternalResults = (externalResults || []).filter((m) => {
    return selectedType === "all" || m.type === selectedType;
  });

  // Filter staff picks using the isFeatured flag
  const staffPicks = filteredMaterials.filter(m => m.isFeatured === true).slice(0, 3);
  
  // Find a specific hero material or just the first featured one
  const heroMaterial = materials.find(m => (m as any).isFeatured === true) || 
                       materials.find(m => m.title.toLowerCase().includes("it entry sheet")) ||
                       materials[0];

  // Ensure the hero material has the requested URL (fallback for local dev if seed not run)
  if (heroMaterial && heroMaterial.title.toLowerCase().includes("it entry sheet") && !heroMaterial.url.includes("jEXt4xBeD54")) {
    heroMaterial.url = "https://www.youtube.com/watch?v=W4zrPtW8GvA";
  }

  return (
    <>
      <div className="flex flex-col mb-8 gap-6">
        {/* Search and Filters Bar */}
        <div className="flex flex-col gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                type="search" 
                placeholder={copy.searchMaterials} 
                className="pl-9 bg-background border-transparent focus-visible:bg-card focus-visible:border-border"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && isExternalSearchEnabled && handleExternalSearch()}
              />
            </div>
            
            <Tabs defaultValue="all" className="w-full sm:w-auto" onValueChange={setSelectedType}>
              <TabsList className="bg-muted">
                <TabsTrigger value="all">{copy.all}</TabsTrigger>
                <TabsTrigger value="video" className="flex items-center gap-1.5"><PlayCircle className="w-3.5 h-3.5"/> {copy.video}</TabsTrigger>
                <TabsTrigger value="article" className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5"/> {copy.article}</TabsTrigger>
                <TabsTrigger value="book" className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5"/> {copy.book}</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2 border-t border-border/50 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-muted-foreground">{copy.searchSource}</span>
              <div className="flex bg-muted p-1 rounded-lg">
                <button 
                  onClick={() => setIsExternalSearchEnabled(false)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${!isExternalSearchEnabled ? 'bg-card text-[#1e3a8a] shadow-sm' : 'text-muted-foreground hover:text-card-foreground'}`}
                >
                  {copy.curated}
                </button>
                <button 
                  onClick={() => setIsExternalSearchEnabled(true)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${isExternalSearchEnabled ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-muted-foreground hover:text-card-foreground'}`}
                >
                  <Globe className="w-3 h-3" /> {copy.externalWeb}
                </button>
              </div>
            </div>

            {isExternalSearchEnabled && (
              <Button 
                size="sm" 
                onClick={handleExternalSearch}
                disabled={isSearchingExternal || searchQuery.length < 3}
                className="bg-[#1e3a8a] hover:bg-[#1e40af] h-8"
              >
                {isSearchingExternal ? <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin" /> : <Search className="w-3.5 h-3.5 mr-2" />}
                {copy.deepSearch}
              </Button>
            )}
          </div>
        </div>

        {/* Categories Pills (only for local search) */}
        {!isExternalSearchEnabled && (
          <div className="flex flex-wrap gap-2">
            {["All Topics", ...(categories || []).map(c => c.name)].map((cat, i) => (
              <Badge 
                key={i} 
                variant={selectedCategory === cat ? "default" : "outline"} 
                className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${selectedCategory === cat ? 'bg-[#1e3a8a] text-white hover:bg-[#1e40af]' : 'border-border text-muted-foreground hover:bg-muted'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat === "All Topics" ? copy.allTopics : localizeCategory(locale, cat)}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div>
        {isExternalSearchEnabled ? (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Globe className="text-[#1e3a8a]" />
                {copy.webResults}
              </h2>
              {searchQuery.length > 0 && (
                <span className="text-sm text-muted-foreground">{copy.query}: "{searchQuery}"</span>
              )}
            </div>

            {isSearchingExternal ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-60">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-64 bg-muted rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : filteredExternalResults.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExternalResults.map((mat) => (
                  <Card key={mat.id} className="group border-border hover:border-[#1e3a8a] transition-all cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md">
                    <CardHeader className="p-5 pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                           <div className={`p-1.5 rounded-md ${
                            mat.type === 'video' ? 'bg-red-50 text-red-600' : 
                            mat.type === 'article' ? 'bg-orange-50 text-orange-600' : 
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {mat.type === 'video' && <PlayCircle className="w-4 h-4" />}
                            {mat.type === 'article' && <FileText className="w-4 h-4" />}
                            {mat.type === 'book' && <BookOpen className="w-4 h-4" />}
                          </div>
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">{mat.source}</Badge>
                        </div>
                      </div>
                      <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-[#1e3a8a] transition-colors">{mat.title}</CardTitle>
                      <CardDescription className="text-xs mt-2 line-clamp-2 leading-relaxed h-8">
                        {mat.author && <span className="font-semibold">{mat.author} • </span>}
                        {mat.description}
                      </CardDescription>
                    </CardHeader>
                    {mat.thumbnail && (
                      <div className="px-5 pb-3 mt-1">
                        <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50">
                          <img src={mat.thumbnail} alt={mat.title} className="object-cover w-full h-full" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                            <ExternalLink className="text-white opacity-0 group-hover:opacity-100 w-8 h-8 drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div className="mt-auto px-5 pb-5 pt-3">
                      <Button asChild variant="secondary" className="w-full text-xs h-9 bg-muted hover:bg-slate-200 text-card-foreground">
                        <a href={mat.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                          {copy.viewOn} {mat.source} <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-background rounded-2xl border-2 border-dashed border-border">
                <div className="bg-card w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Globe className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-lg font-bold text-foreground">{copy.discoverTitle}</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2 text-sm">{copy.discoverSubtitle}</p>
                {searchQuery.length < 3 && (
                  <p className="text-[#ea580c] text-xs mt-4 font-semibold">{copy.enterThree}</p>
                )}
              </div>
            )}
          </section>
        ) : (
          <>
            {/* Recommended Section (Hero) */}
            {(heroMaterial || staffPicks.length > 0) && (
              <>
                <h2 className="text-xl font-bold text-foreground mb-6"> {staffPicks.length > 0 ? copy.staffPicks : copy.recommended}</h2>
                <div className="grid lg:grid-cols-2 gap-6 mb-12">
                  {heroMaterial && (
                    <Card className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:border-[#1e3a8a] hover:shadow-md">
                    <Link href={`/materials/${heroMaterial?.id}`} className="absolute inset-0 z-20" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-6 md:p-8">
                      <div>
                        <div className="mb-4 flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-[#1e3a8a]">
                            <PlayCircle className="h-5 w-5" />
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="bg-[#1e3a8a] text-white hover:bg-[#1e40af]">
                              {copy.featured}
                            </Badge>
                            <Badge variant="outline" className="border-border text-muted-foreground">
                              {heroMaterial?.category?.name ? localizeCategory(locale, heroMaterial.category.name) : copy.video}
                            </Badge>
                          </div>
                        </div>

                        <CardTitle className="text-2xl md:text-3xl font-bold leading-tight text-foreground group-hover:text-[#1e3a8a] transition-colors">
                          {heroMaterial?.title}
                        </CardTitle>

                        <CardDescription className="mt-3 max-w-2xl text-sm md:text-base leading-7 text-muted-foreground line-clamp-3">
                          {heroMaterial?.description || copy.featuredFallback}
                        </CardDescription>
                      </div>

                      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <PlayCircle className="h-4 w-4" />
                            {localizeMaterialType(locale, heroMaterial?.type)}
                          </span>
                          <span className="flex items-center gap-1.5 font-medium">
                            <Eye className="h-4 w-4" />
                            {heroMaterial?.views ?? 0} {copy.views}
                          </span>
                        </div>

                        <div className="z-30 flex items-center gap-2">
                          <SaveMaterialButton 
                            materialId={heroMaterial.id} 
                            isInitiallySaved={savedMaterialIds.includes(heroMaterial.id)}
                            variant="outline"
                            size="default"
                            showLabel={true}
                            className="bg-card border-border"
                          />
                          <Button
                            asChild
                            className="pointer-events-auto bg-[#1e3a8a] hover:bg-[#1e40af] text-white"
                          >
                            <Link href={`/materials/${heroMaterial?.id}`}>
                              {copy.watchNow}
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                    </Card>
                  )}

                  {staffPicks.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-6">
                    {staffPicks.map((mat) => {
                      return (
                        <Card key={mat.id} className="group border-border hover:border-[#1e3a8a] transition-all cursor-pointer flex flex-col h-full shadow-sm relative overflow-hidden">
                            <Link href={`/materials/${mat.id}`} className="absolute inset-0 z-20"></Link>
                            <div className="h-32 bg-muted relative overflow-hidden flex items-center justify-center">
                              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50"></div>
                              {mat.type === 'video' && <PlayCircle className="w-10 h-10 text-slate-300 z-10 group-hover:text-[#1e3a8a] transition-colors" />}
                              {mat.type === 'article' && <FileText className="w-10 h-10 text-slate-300 z-10 group-hover:text-[#ea580c] transition-colors" />}
                              {mat.type === 'book' && <BookOpen className="w-10 h-10 text-slate-300 z-10 group-hover:text-amber-500 transition-colors" />}
                            </div>
                            <CardHeader className="p-4 pb-2 flex-grow relative z-10">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{localizeMaterialType(locale, mat.type)}</span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-border">{localizeCategory(locale, mat.category.name)}</Badge>
                              </div>
                              <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-[#1e3a8a] transition-colors">{mat.title}</CardTitle>
                            </CardHeader>
                            <CardFooter className="p-4 pt-0 text-xs text-muted-foreground flex justify-between items-center relative z-10">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Eye className="w-3.5 h-3.5 text-muted-foreground" /> 
                                {mat.views ?? 0} {copy.views}
                              </span>
                              <SaveMaterialButton 
                                materialId={mat.id} 
                                isInitiallySaved={savedMaterialIds.includes(mat.id)} 
                                className="pointer-events-auto z-30"
                              />
                            </CardFooter>
                        </Card>
                      );
                    })}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Main Grid */}
            <h2 className="text-xl font-bold text-foreground mb-6">{copy.latestAdditions}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredMaterials.map((mat) => {
                  return (
                    <Card key={mat.id} className="group border-border hover:border-border transition-all cursor-pointer flex flex-col h-full shadow-sm hover:shadow-md relative overflow-hidden">
                      <Link href={`/materials/${mat.id}`} className="absolute inset-0 z-20"></Link>
                      <CardHeader className="p-5 pb-3 relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                          <div className={`p-1.5 rounded-md ${
                            mat.type === 'video' ? 'bg-blue-100 text-[#1e3a8a]' : 
                            mat.type === 'article' ? 'bg-orange-100 text-[#ea580c]' : 
                            'bg-emerald-100 text-emerald-700'
                          }`}>
                            {mat.type === 'video' && <PlayCircle className="w-4 h-4" />}
                            {mat.type === 'article' && <FileText className="w-4 h-4" />}
                            {mat.type === 'book' && <BookOpen className="w-4 h-4" />}
                          </div>
                          <Badge variant="secondary" className="bg-muted text-muted-foreground border-none font-medium">{localizeCategory(locale, mat.category.name)}</Badge>
                        </div>
                        <CardTitle className="text-base line-clamp-2 leading-snug group-hover:text-[#1e3a8a] transition-colors">{mat.title}</CardTitle>
                        <CardDescription className="text-xs mt-2 line-clamp-3 leading-relaxed">
                          {mat.description}
                        </CardDescription>
                      </CardHeader>
                      <div className="mt-auto px-5 pb-5 relative z-10">
                        <div className="h-px w-full bg-muted mb-4"></div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Eye className="w-3.5 h-3.5 text-muted-foreground" /> 
                            {mat.views ?? 0} {copy.views}
                          </span>
                          <SaveMaterialButton 
                            materialId={mat.id} 
                            isInitiallySaved={savedMaterialIds.includes(mat.id)} 
                            className="pointer-events-auto z-30"
                          />
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>

            {filteredMaterials.length === 0 && (
              <div className="text-center py-20 bg-background rounded-lg border-2 border-dashed border-border mt-4">
                <p className="text-muted-foreground">{copy.noMatch}</p>
                <Button 
                  variant="link" 
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedType("all");
                    setSelectedCategory("All Topics");
                  }}
                >
                  {copy.clearFilters}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
