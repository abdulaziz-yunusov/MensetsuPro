import { Metadata } from "next";
import prisma from "@/lib/prisma";
import MaterialList from "@/components/learning/material-list";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerTranslation } from "@/lib/i18n-server";
import type { Locale } from "@/i18n";

const bookmarksMetadata: Record<Locale, Metadata> = {
  en: {
    title: "Saved Materials | MensetsuPro",
    description: "Your bookmarked learning resources.",
  },
  ru: {
    title: "Сохраненные материалы | MensetsuPro",
    description: "Ваши сохраненные учебные ресурсы.",
  },
  ja: {
    title: "保存した教材 | MensetsuPro",
    description: "保存した学習リソースを確認できます。",
  },
  uz: {
    title: "Saqlangan materiallar | MensetsuPro",
    description: "Saqlab qo'ygan o'quv resurslaringiz.",
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const { locale } = await getServerTranslation();
  return bookmarksMetadata[locale];
}

export default async function BookmarksPage() {
  const { locale } = await getServerTranslation();
  const session = await getServerSession(authOptions);

  const bookmarksCopy: Record<Locale, Record<string, string>> = {
    en: {
      title: "Saved Materials",
      subtitle: "Articles, Books, and Videos you have bookmarked for study.",
      exploreMore: "Explore More Materials",
      emptyTitle: "No Bookmarks Yet",
      emptySubtitle: "You haven't saved any learning materials yet. Start exploring or search for specific topics to find resources worth saving.",
      browse: "Browse Materials",
    },
    ru: {
      title: "Сохраненные материалы",
      subtitle: "Статьи, книги и видео, которые вы сохранили для обучения.",
      exploreMore: "Открыть больше материалов",
      emptyTitle: "Закладок пока нет",
      emptySubtitle: "Вы еще не сохранили учебные материалы. Начните просмотр или найдите нужную тему и сохраните полезные ресурсы.",
      browse: "Открыть материалы",
    },
    ja: {
      title: "保存した教材",
      subtitle: "学習用に保存した記事、本、動画です。",
      exploreMore: "さらに教材を見る",
      emptyTitle: "まだブックマークはありません",
      emptySubtitle: "まだ学習教材を保存していません。まずは教材を探して、後で見返したいものを保存してください。",
      browse: "教材を見る",
    },
    uz: {
      title: "Saqlangan materiallar",
      subtitle: "O'qish uchun saqlab qo'ygan maqola, kitob va videolar.",
      exploreMore: "Yana materiallarni ko'rish",
      emptyTitle: "Hali xatcho'plar yo'q",
      emptySubtitle: "Hali hech qanday o'quv materiali saqlanmagan. Avval materiallarni ko'rib chiqing va foydali topganlaringizni saqlang.",
      browse: "Materiallarni ko'rish",
    },
  };
  const copy = bookmarksCopy[locale];

  if (!session?.user?.id) {
    redirect("/login");
  }

  const savedMaterialsRecords = await prisma.savedMaterial.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      material: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const materials = savedMaterialsRecords.map((record: any) => record.material);
  const savedMaterialIds = materials.map((m: any) => m.id as string);

  // Get categories for filters (only those present in saved materials)
  const categoryIds = Array.from(new Set(materials.map((m: any) => m.categoryId as string))) as string[];
  const categories = await prisma.category.findMany({
    where: {
      id: { in: categoryIds },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{copy.title}</h2>
          <p className="text-muted-foreground mt-1">
            {copy.subtitle}
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/materials">{copy.exploreMore}</Link>
        </Button>
      </div>

      {materials.length > 0 ? (
        <MaterialList 
          materials={materials} 
          categories={categories} 
          savedMaterialIds={savedMaterialIds}
        />
      ) : (
        <Card className="bg-background border-dashed">
          <CardContent className="flex flex-col items-center justify-center p-16 text-center space-y-4">
            <div className="p-4 bg-card rounded-full shadow-sm mb-2">
              <Library className="w-12 h-12 text-slate-300" />
            </div>
            <h3 className="text-xl font-semibold">{copy.emptyTitle}</h3>
            <p className="text-muted-foreground max-w-md">
              {copy.emptySubtitle}
            </p>
            <Button asChild className="mt-4 bg-[#1e3a8a] hover:bg-[#1e40af]">
              <Link href="/materials">{copy.browse}</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
