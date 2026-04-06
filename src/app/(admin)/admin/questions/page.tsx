import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { createQuestionByAdmin, deleteQuestionByAdmin } from "@/lib/actions/admin";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminQuestionsPage() {
  const { t, locale } = await getServerTranslation();

  const [questions, categories] = await Promise.all([
    prisma.question.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        _count: {
          select: { savedBy: true },
        },
      },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.questions.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.questions.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.questions.addQuestion')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createQuestionByAdmin as any} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="title">{t('admin.questions.fields.title')}</Label>
                <Input id="title" name="title" placeholder={t('admin.questions.placeholders.title')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryId">{t('admin.questions.fields.category')}</Label>
                <select id="categoryId" name="categoryId" required className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                  <option value="">{t('admin.questions.placeholders.selectCategory')}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titleEn">{t('admin.questions.fields.titleEn')}</Label>
                <Input id="titleEn" name="titleEn" placeholder={t('admin.questions.placeholders.titleEn')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">{t('admin.questions.fields.difficulty')}</Label>
                <Input id="difficulty" name="difficulty" placeholder={t('admin.questions.placeholders.difficulty')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recommendedAnswer">{t('admin.questions.fields.recommendedAnswer')}</Label>
              <Textarea id="recommendedAnswer" name="recommendedAnswer" className="min-h-[140px]" placeholder={t('admin.questions.placeholders.recommendedAnswer')} />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sampleAnswer">{t('admin.questions.fields.sampleAnswer')}</Label>
                <Textarea id="sampleAnswer" name="sampleAnswer" className="min-h-[140px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="badSampleAnswer">{t('admin.questions.fields.badSampleAnswer')}</Label>
                <Textarea id="badSampleAnswer" name="badSampleAnswer" className="min-h-[140px]" placeholder={t('admin.questions.placeholders.badSampleAnswer')} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tips">{t('admin.questions.fields.tips')}</Label>
                <Textarea id="tips" name="tips" className="min-h-[120px]" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="commonMistakes">{t('admin.questions.fields.commonMistakes')}</Label>
                <Textarea id="commonMistakes" name="commonMistakes" className="min-h-[120px]" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evaluationCriteria">{t('admin.questions.fields.evaluationCriteria')}</Label>
              <Textarea id="evaluationCriteria" name="evaluationCriteria" className="min-h-[120px]" placeholder={t('admin.questions.placeholders.evaluationCriteria')} />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit">{t('admin.questions.addQuestion')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{t('admin.questions.allQuestions')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">{t('admin.questions.table.title')}</TableHead>
                <TableHead className="font-bold">{t('admin.questions.table.category')}</TableHead>
                <TableHead className="font-bold">{t('admin.questions.table.difficulty')}</TableHead>
                <TableHead className="font-bold">{t('admin.questions.table.saves')}</TableHead>
                <TableHead className="font-bold">{t('admin.questions.table.added')}</TableHead>
                <TableHead className="font-bold text-right px-6">{t('admin.questions.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {questions.map((question) => (
                <TableRow key={question.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="max-w-[360px]">
                    <div className="font-bold text-foreground line-clamp-1">{question.title}</div>
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-1 italic">{question.titleEn || t('admin.questions.table.noEnglishTranslation')}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium bg-muted px-2 py-0.5 rounded-full">{question.category.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium">{question.difficulty || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-bold text-primary">{question._count.savedBy}</span>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{new Date(question.createdAt).toLocaleDateString(locale)}</TableCell>
                  <TableCell className="px-6 text-right">
                    <form action={deleteQuestionByAdmin.bind(null, question.id) as any}>
                      <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5 transition-colors">
                        {t('common.delete')}
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
              {questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground italic">
                    {t('admin.questions.table.noQuestionsFound')}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
