"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, Users, HelpCircle, Tags, 
  BookOpen, ShieldAlert, Code2, LogOut, Globe 
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";

const navItems = [
  { nameKey: "admin.nav.overview", href: "/admin", icon: LayoutDashboard },
  { nameKey: "admin.nav.users", href: "/admin/users", icon: Users },
  { nameKey: "admin.nav.questions", href: "/admin/questions", icon: HelpCircle },
  { nameKey: "admin.nav.codingTest", href: "/admin/coding-questions", icon: Code2 },
  { nameKey: "admin.nav.categories", href: "/admin/categories", icon: Tags },
  { nameKey: "admin.nav.materials", href: "/admin/materials", icon: BookOpen },
  { nameKey: "admin.nav.moderation", href: "/admin/moderation", icon: ShieldAlert },
];

export function AdminSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-300 flex flex-col h-screen border-r border-slate-800 shadow-xl">
      <div className="h-20 flex items-center px-6 font-bold text-white text-xl border-b border-slate-800 bg-[#1e293b]/30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            A
          </div>
          <span className="tracking-tight">{t('admin.title')}</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group",
                  isActive 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5 transition-colors",
                  isActive ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                )} />
                {t(item.nameKey)}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-slate-800 bg-[#1e293b]/20">
        <div className="mb-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3 ml-2 flex items-center gap-2">
            <Globe className="w-3 h-3" /> {t('common.language')}
          </p>
          <LanguageSwitcher variant="compact" />
        </div>
        
        <Link 
          href="/dashboard"
          className="flex items-center px-4 py-2.5 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all group"
        >
          <LogOut className="mr-3 h-4 w-4 text-slate-500 group-hover:text-slate-300" />
          {t('nav.dashboard')}
        </Link>
      </div>
    </aside>
  );
}
