"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Terminal, AlertCircle } from "lucide-react";
import { createCodingQuestionByAdmin, deleteCodingQuestionByAdmin, getCategoriesForAdmin } from "@/lib/actions/admin-coding";
import { getCodingQuestions } from "@/actions/coding";
import { useTranslation } from "@/hooks/useTranslation";

export default function AdminCodingQuestionsPage() {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      const [res, catRes] = await Promise.all([
        getCodingQuestions(),
        getCategoriesForAdmin()
      ]);
      
      if (res.success && res.questions) {
        setQuestions(res.questions);
      }
      if (catRes.success && catRes.categories) {
        setCategories(catRes.categories);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(t('admin.coding.messages.deleteConfirm'))) return;
    const res = await deleteCodingQuestionByAdmin(id);
    if (res.success) {
      setQuestions(q => q.filter(question => question.id !== id));
      alert(t('admin.coding.messages.deleteSuccess'));
    } else {
      alert(res.error || t('admin.coding.messages.deleteError'));
    }
  };

  const [errorMsg, setErrorMsg] = useState("");
  
  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");
    
    const formData = new FormData(e.currentTarget);
    const res = await createCodingQuestionByAdmin(formData);
    
    if (res.success) {
      alert(t('admin.coding.messages.createSuccess'));
      window.location.reload();
    } else {
       if (res.error?.includes("Database error")) {
          setErrorMsg(t('admin.coding.messages.dbError'));
       } else {
          setErrorMsg(res.error || t('admin.coding.messages.validationError'));
       }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Terminal className="text-sky-700 size-6" /> {t('admin.coding.title')}
        </h2>
        <p className="mt-2 text-muted-foreground">{t('admin.coding.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.coding.addChallenge')}</CardTitle>
          <CardDescription>
            {t('admin.coding.addDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4">
            {errorMsg && (
              <div className="flex items-start gap-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-4 text-sm text-rose-800 dark:text-rose-200 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex flex-col gap-1">
                  <p className="font-semibold text-rose-900 dark:text-rose-100">{t('admin.coding.messages.submissionFailed')}</p>
                  <p className="whitespace-pre-wrap">{errorMsg}</p>
                </div>
              </div>
            )}
            
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">{t('admin.coding.fields.title')}</Label>
                <Input id="title" name="title" placeholder={t('admin.coding.placeholders.title')} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="difficulty">{t('admin.coding.fields.difficulty')}</Label>
                <select id="difficulty" name="difficulty" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-sky-700/20 outline-none transition-all">
                  <option value="Beginner">{t('admin.coding.difficulties.Beginner')}</option>
                  <option value="Intermediate">{t('admin.coding.difficulties.Intermediate')}</option>
                  <option value="Advanced">{t('admin.coding.difficulties.Advanced')}</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoryId">{t('admin.coding.fields.category')}</Label>
              <select id="categoryId" name="categoryId" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-sky-700/20 outline-none transition-all">
                 <option value="">{t('admin.coding.placeholders.selectCategory')}</option>
                 {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('admin.coding.fields.description')}</Label>
              <Textarea id="description" name="description" className="min-h-[100px]" placeholder={t('admin.coding.placeholders.description')} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="initialCode">{t('admin.coding.fields.initialCode')}</Label>
              <Textarea id="initialCode" name="initialCode" className="min-h-[100px] font-mono text-sm leading-relaxed" placeholder={t('admin.coding.placeholders.initialCode')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="testCases">{t('admin.coding.fields.testCases')}</Label>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block mb-2">
                {t('admin.coding.fields.testCasesHint')}
              </span>
              <Textarea 
                id="testCases" 
                name="testCases" 
                className="min-h-[150px] font-mono text-sm leading-relaxed bg-muted/30" 
                placeholder={`[\n  { "input": [10], "expectedOutput": 5 },\n  { "input": [null], "expectedOutput": [] }\n]`} 
                required 
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" className="bg-sky-700 hover:bg-sky-800 text-white font-bold px-8 shadow-md transition-all active:scale-95">
                {t('admin.coding.buttons.create')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 pb-4 border-b border-border/50">
          <CardTitle className="text-lg font-bold">{t('admin.coding.allChallenges')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">{t('admin.coding.fields.title')}</TableHead>
                <TableHead className="font-bold">{t('admin.coding.fields.difficulty')}</TableHead>
                <TableHead className="font-bold">{t('admin.coding.fields.dateAdded')}</TableHead>
                <TableHead className="text-right px-6 font-bold">{t('admin.users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground animate-pulse">
                    {t('admin.coding.messages.loading')}
                  </TableCell>
                </TableRow>
              ) : questions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center text-muted-foreground italic">
                    {t('admin.coding.messages.noQuestions')}
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((q) => (
                  <TableRow key={q.id} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-bold max-w-[300px] truncate">{q.title}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest ${
                        q.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                        q.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' :
                        'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300'
                      }`}>
                        {t(`admin.coding.difficulties.${q.difficulty}`)}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(q.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right px-6">
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(q.id)} className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5">
                        {t('common.delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
