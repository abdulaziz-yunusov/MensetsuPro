"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Palette, Globe, Bell } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTranslation } from "@/hooks/useTranslation";

export default function SettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6 max-w-3xl pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('dashboard.settings.title')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('dashboard.settings.subtitle')}
        </p>
      </div>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Palette className="w-5 h-5 text-primary" /> {t('dashboard.settings.appearance.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.settings.appearance.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">{t('dashboard.settings.appearance.theme')}</Label>
              <p className="text-sm text-muted-foreground">{t('dashboard.settings.appearance.themeDesc')}</p>
            </div>
            <ThemeToggle />
          </div>

          <div className="pt-6 border-t border-border/50">
            <div className="mb-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> {t('dashboard.settings.appearance.language')}
              </Label>
              <p className="text-sm text-muted-foreground">{t('dashboard.settings.appearance.languageDesc')}</p>
            </div>
            <LanguageSwitcher variant="full" className="mt-4" />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/50 shadow-sm">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Bell className="w-5 h-5 text-primary" /> {t('dashboard.settings.notifications.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.settings.notifications.desc')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">{t('dashboard.settings.notifications.marketing')}</Label>
              <p className="text-sm text-muted-foreground">{t('dashboard.settings.notifications.marketingDesc')}</p>
            </div>
            <div className="flex items-center space-x-2">
               <input type="checkbox" className="h-5 w-5 rounded border-border text-primary" defaultChecked />
            </div>
          </div>
          <div className="flex items-center justify-between pt-6 border-t border-border/50">
            <div className="space-y-0.5">
              <Label className="text-base font-semibold">{t('dashboard.settings.notifications.community')}</Label>
              <p className="text-sm text-muted-foreground">{t('dashboard.settings.notifications.communityDesc')}</p>
            </div>
            <div className="flex items-center space-x-2">
               <input type="checkbox" className="h-5 w-5 rounded border-border text-primary" defaultChecked />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 border-t px-6 py-4 justify-end">
          <Button className="rounded-lg px-6">{t('dashboard.settings.save')}</Button>
        </CardFooter>
      </Card>

      <Card className="border-red-200/60 bg-red-50/10 overflow-hidden shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-red-600 flex items-center text-xl">
             <AlertCircle className="w-5 h-5 mr-2" /> {t('dashboard.settings.dangerZone.title')}
          </CardTitle>
          <CardDescription>{t('dashboard.settings.dangerZone.desc')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="rounded-lg px-6 font-semibold">
            {t('dashboard.settings.dangerZone.delete')}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
