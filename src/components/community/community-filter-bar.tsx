import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Locale } from "@/i18n";
import {
  getLocalizedCommunitySortOptions,
  getLocalizedDiscussionStatusOptions,
  getLocalizedDiscussionTypeOptions,
} from "@/lib/community";
import { localizeCategory } from "@/lib/i18n-ui";

interface CommunityFilterBarProps {
  categories: { id: string; name: string }[];
  locale: Locale;
  filters: {
    q: string;
    category: string;
    type: string;
    status: string;
    sort: string;
  };
}

export function CommunityFilterBar({ categories, filters, locale }: CommunityFilterBarProps) {
  const discussionTypeOptions = getLocalizedDiscussionTypeOptions(locale);
  const discussionStatusOptions = getLocalizedDiscussionStatusOptions(locale);
  const communitySortOptions = getLocalizedCommunitySortOptions(locale);

  const copy: Record<Locale, Record<string, string>> = {
    en: {
      search: "Search",
      searchPlaceholder: "Search by title, content, or company",
      category: "Category",
      allCategories: "All categories",
      type: "Type",
      allTypes: "All types",
      status: "Status",
      sort: "Sort",
      apply: "Apply",
      clear: "Clear",
    },
    ru: {
      search: "Поиск",
      searchPlaceholder: "Поиск по заголовку, содержанию или компании",
      category: "Категория",
      allCategories: "Все категории",
      type: "Тип",
      allTypes: "Все типы",
      status: "Статус",
      sort: "Сортировка",
      apply: "Применить",
      clear: "Сбросить",
    },
    ja: {
      search: "検索",
      searchPlaceholder: "タイトル、内容、会社名で検索",
      category: "カテゴリー",
      allCategories: "すべてのカテゴリー",
      type: "種類",
      allTypes: "すべての種類",
      status: "状態",
      sort: "並び替え",
      apply: "適用",
      clear: "クリア",
    },
    uz: {
      search: "Qidiruv",
      searchPlaceholder: "Sarlavha, matn yoki kompaniya bo'yicha qidiring",
      category: "Kategoriya",
      allCategories: "Barcha kategoriyalar",
      type: "Turi",
      allTypes: "Barcha turlar",
      status: "Holat",
      sort: "Saralash",
      apply: "Qo'llash",
      clear: "Tozalash",
    },
  };

  const labels = copy[locale];
  return (
    <form method="get" className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="grid gap-4 lg:grid-cols-[2fr_repeat(4,1fr)_auto] lg:items-end">
        <div className="space-y-2">
          <label htmlFor="q" className="text-sm font-medium text-card-foreground">
            {labels.search}
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="q"
              name="q"
              defaultValue={filters.q}
              placeholder={labels.searchPlaceholder}
              className="pl-9"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium text-card-foreground">
            {labels.category}
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">{labels.allCategories}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {localizeCategory(locale, category.name)}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-card-foreground">
            {labels.type}
          </label>
          <select
            id="type"
            name="type"
            defaultValue={filters.type}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="all">{labels.allTypes}</option>
            {discussionTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-card-foreground">
            {labels.status}
          </label>
          <select
            id="status"
            name="status"
            defaultValue={filters.status}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {discussionStatusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="sort" className="text-sm font-medium text-card-foreground">
            {labels.sort}
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={filters.sort}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {communitySortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button type="submit" className="w-full lg:w-auto">
            {labels.apply}
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/community">{labels.clear}</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}
