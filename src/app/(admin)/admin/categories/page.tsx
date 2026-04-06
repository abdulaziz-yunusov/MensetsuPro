import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategoryByAdmin, deleteCategoryByAdmin, updateCategoryByAdmin } from "@/lib/actions/admin";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminCategoriesPage() {
  const { t } = await getServerTranslation();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: {
          questions: true,
          materials: true,
          threads: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.categories.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.categories.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.categories.addCategory')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategoryByAdmin} className="grid gap-4 md:grid-cols-[1fr_2fr_auto] md:items-end">
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin.categories.fields.name')}</Label>
              <Input id="name" name="name" placeholder={t('admin.categories.placeholders.name')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.categories.fields.description')}</Label>
              <Input id="description" name="description" placeholder={t('admin.categories.placeholders.description')} />
            </div>
            <Button type="submit">{t('admin.categories.addCategory')}</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.categories.allCategories')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {categories.map((category) => (
            <form
              key={category.id}
              action={updateCategoryByAdmin.bind(null, category.id)}
              className="rounded-xl border border-border/50 p-5 hover:border-primary/20 transition-colors"
            >
              <div className="grid gap-6 lg:grid-cols-[1.5fr_2fr_1fr_auto] lg:items-center">
                <div className="space-y-2">
                  <Label htmlFor={`name-${category.id}`} className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.categories.fields.name')}
                  </Label>
                  <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required className="font-bold" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`description-${category.id}`} className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    {t('admin.categories.fields.description')}
                  </Label>
                  <Textarea
                    id={`description-${category.id}`}
                    name="description"
                    defaultValue={category.description || ""}
                    className="min-h-[80px] text-sm"
                  />
                </div>
                <div className="text-[11px] font-bold text-muted-foreground space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <div className="flex justify-between items-center">
                    <span>{t('admin.categories.fields.questions')}</span>
                    <span className="text-foreground text-xs">{category._count.questions}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('admin.categories.fields.materials')}</span>
                    <span className="text-foreground text-xs">{category._count.materials}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>{t('admin.categories.fields.threads')}</span>
                    <span className="text-foreground text-xs">{category._count.threads}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="ghost" className="h-9 px-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5">
                    {t('common.save')}
                  </Button>
                  <Button formAction={deleteCategoryByAdmin.bind(null, category.id)} variant="ghost" className="h-9 px-4 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5">
                    {t('common.delete')}
                  </Button>
                </div>
              </div>
            </form>
          ))}

          {categories.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground italic bg-muted/20 rounded-xl border border-dashed">
              {t('admin.categories.noCategoriesFound')}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
