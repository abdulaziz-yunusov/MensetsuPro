import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMaterialByAdmin, deleteMaterialByAdmin, updateMaterialByAdmin } from "@/lib/actions/admin";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminMaterialsPage() {
  const { t } = await getServerTranslation();

  const [materials, categories] = await Promise.all([
    prisma.material.findMany({
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.materials.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.materials.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.materials.addMaterial')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createMaterialByAdmin} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="space-y-2 xl:col-span-2">
                <Label htmlFor="title">{t('admin.materials.fields.title')}</Label>
                <Input id="title" name="title" required placeholder={t('admin.materials.placeholders.title')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">{t('admin.materials.fields.type')}</Label>
                <select id="type" name="type" defaultValue="article" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="article">{t('admin.materials.types.article')}</option>
                  <option value="video">{t('admin.materials.types.video')}</option>
                  <option value="book">{t('admin.materials.types.book')}</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">{t('admin.materials.fields.category')}</Label>
                <select id="categoryId" name="categoryId" required className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="">{t('admin.materials.placeholders.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="url">{t('admin.materials.fields.url')}</Label>
                <Input id="url" name="url" required placeholder={t('admin.materials.placeholders.url')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">{t('admin.materials.fields.difficulty')}</Label>
                <Input id="difficulty" name="difficulty" placeholder={t('admin.materials.placeholders.difficulty')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.materials.fields.description')}</Label>
              <Textarea id="description" name="description" className="min-h-[120px]" />
            </div>

            <label className="flex items-center gap-2 text-sm font-medium text-card-foreground cursor-pointer">
              <input type="checkbox" name="isFeatured" className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20" />
              {t('admin.materials.fields.isFeatured')}
            </label>

            <div className="flex justify-end pt-2">
              <Button type="submit">{t('admin.materials.addMaterial')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {materials.map((material) => (
          <Card key={material.id} className="border-border/50 shadow-sm overflow-hidden hover:border-primary/20 transition-colors">
            <CardContent className="p-5">
              <form action={updateMaterialByAdmin.bind(null, material.id)} className="grid gap-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize px-2 py-0 font-bold text-[10px] tracking-wide">
                    {t(`admin.materials.types.${material.type}`)}
                  </Badge>
                  <Badge variant="secondary" className="px-2 py-0 font-bold text-[10px] tracking-wide">
                    {material.category.name}
                  </Badge>
                  {material.isFeatured ? (
                    <Badge className="px-2 py-0 font-bold text-[10px] tracking-wide bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                      {t('admin.materials.fields.featuredShort')}
                    </Badge>
                  ) : null}
                  <span className="text-[11px] font-bold text-muted-foreground ml-auto">
                    {material.views} {t('admin.materials.fields.views')}
                  </span>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2 xl:col-span-2">
                    <Label htmlFor={`title-${material.id}`}>{t('admin.materials.fields.title')}</Label>
                    <Input id={`title-${material.id}`} name="title" defaultValue={material.title} required className="font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`type-${material.id}`}>{t('admin.materials.fields.type')}</Label>
                    <select
                      id={`type-${material.id}`}
                      name="type"
                      defaultValue={material.type}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      <option value="article">{t('admin.materials.types.article')}</option>
                      <option value="video">{t('admin.materials.types.video')}</option>
                      <option value="book">{t('admin.materials.types.book')}</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`category-${material.id}`}>{t('admin.materials.fields.category')}</Label>
                    <select
                      id={`category-${material.id}`}
                      name="categoryId"
                      defaultValue={material.categoryId}
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`url-${material.id}`}>{t('admin.materials.fields.url')}</Label>
                    <Input id={`url-${material.id}`} name="url" defaultValue={material.url} required className="text-xs font-mono text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`difficulty-${material.id}`}>{t('admin.materials.fields.difficulty')}</Label>
                    <Input id={`difficulty-${material.id}`} name="difficulty" defaultValue={material.difficulty || ""} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`description-${material.id}`}>{t('admin.materials.fields.description')}</Label>
                  <Textarea id={`description-${material.id}`} name="description" defaultValue={material.description || ""} className="min-h-[100px] text-sm" />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/50">
                  <label className="flex items-center gap-2 text-sm font-bold text-card-foreground cursor-pointer">
                    <input type="checkbox" name="isFeatured" defaultChecked={material.isFeatured} className="h-4 w-4 rounded border-input text-primary focus:ring-primary/20" />
                    {t('admin.materials.fields.featuredShort')}
                  </label>
                  <div className="flex gap-2">
                    <Button type="submit" variant="ghost" className="h-9 px-4 text-xs font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5">
                      {t('common.save')}
                    </Button>
                    <Button formAction={deleteMaterialByAdmin.bind(null, material.id)} variant="ghost" className="h-9 px-4 text-xs font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5">
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        ))}

        {materials.length === 0 ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-12 text-center text-muted-foreground italic">
              {t('admin.materials.noMaterialsFound')}
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
