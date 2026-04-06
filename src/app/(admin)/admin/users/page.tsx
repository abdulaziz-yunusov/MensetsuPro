import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createAdminUser, deleteUserByAdmin, updateUserRole } from "@/lib/actions/admin";
import { getServerTranslation } from "@/lib/i18n-server";

export default async function AdminUsersPage() {
  const { t, locale } = await getServerTranslation();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          discussions: true,
          comments: true,
          blogPosts: true,
          mockInterviews: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('admin.users.title')}</h2>
        <p className="mt-2 text-muted-foreground">{t('admin.users.subtitle')}</p>
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>{t('admin.users.createUser')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createAdminUser} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="name">{t('admin.users.fields.name')}</Label>
              <Input id="name" name="name" placeholder={t('admin.users.placeholders.fullName')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t('admin.users.fields.email')}</Label>
              <Input id="email" name="email" type="email" placeholder={t('admin.users.placeholders.email')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('admin.users.fields.password')}</Label>
              <Input id="password" name="password" type="password" placeholder={t('admin.users.placeholders.tempPassword')} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">{t('admin.users.fields.role')}</Label>
              <select id="role" name="role" defaultValue="USER" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="USER">{t('admin.users.roles.user')}</option>
                <option value="ADMIN">{t('admin.users.roles.admin')}</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetRole">{t('admin.users.fields.targetRole')}</Label>
              <Input id="targetRole" name="targetRole" placeholder={t('admin.users.placeholders.frontendEngineer')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="japaneseLevel">{t('admin.users.fields.japaneseLevel')}</Label>
              <select id="japaneseLevel" name="japaneseLevel" defaultValue="" className="flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none">
                <option value="">{t('admin.users.jlpt.notSet')}</option>
                {["N5", "N4", "N3", "N2", "N1", "NATIVE"].map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 xl:col-span-3 flex justify-end pt-2">
              <Button type="submit">{t('admin.users.createUser')}</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader>
          <CardTitle>{t('admin.users.allUsers')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="font-bold">{t('admin.users.table.name')}</TableHead>
                <TableHead className="font-bold">{t('admin.users.table.email')}</TableHead>
                <TableHead className="font-bold">{t('admin.users.table.role')}</TableHead>
                <TableHead className="font-bold">{t('admin.users.table.profile')}</TableHead>
                <TableHead className="font-bold">{t('admin.users.table.activity')}</TableHead>
                <TableHead className="font-bold">{t('admin.users.table.joined')}</TableHead>
                <TableHead className="font-bold text-right px-6">{t('admin.users.table.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20 transition-colors">
                  <TableCell className="font-bold">{user.name}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="uppercase text-[10px] tracking-wider font-bold">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="font-medium text-foreground">{user.targetRole || "-"}</div>
                    <div>{user.japaneseLevel || t('admin.users.jlpt.noJlptSet')}</div>
                  </TableCell>
                  <TableCell className="text-[11px] text-muted-foreground">
                    <div className="flex gap-2">
                      <span className="font-bold text-foreground">{user._count.discussions}</span> {t('admin.users.table.threads')}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-foreground">{user._count.comments}</span> {t('admin.users.table.comments')}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-foreground">{user._count.blogPosts}</span> {t('admin.users.table.blogs')}
                    </div>
                    <div className="flex gap-2">
                      <span className="font-bold text-foreground">{user._count.mockInterviews}</span> {t('admin.users.table.interviews')}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-medium">{new Date(user.createdAt).toLocaleDateString(locale)}</TableCell>
                  <TableCell className="px-6">
                    <div className="flex justify-end items-center gap-3">
                      <form action={updateUserRole.bind(null, user.id)} className="flex items-center gap-2">
                        <select
                          name="role"
                          defaultValue={user.role}
                          className="flex h-8 rounded-md border border-input bg-background px-2 text-[11px] font-bold uppercase tracking-wider outline-none focus:ring-1 focus:ring-primary/20"
                        >
                          <option value="USER">{t('admin.users.roles.user')}</option>
                          <option value="ADMIN">{t('admin.users.roles.admin')}</option>
                        </select>
                        <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/5">
                          {t('common.save')}
                        </Button>
                      </form>
                      <form action={deleteUserByAdmin.bind(null, user.id)}>
                        <Button type="submit" size="sm" variant="ghost" className="h-8 px-2 text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive hover:bg-destructive/5">
                          {t('common.delete')}
                        </Button>
                      </form>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground italic">
                    {t('admin.users.table.noUsersFound')}
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
