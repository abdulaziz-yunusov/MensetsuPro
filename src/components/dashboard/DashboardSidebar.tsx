"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Bookmark, History, FileText, Settings, LayoutDashboard, Code2, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { cn } from "@/lib/utils";

const navItems = [
  { nameKey: "dashboard.sidebar.overview", href: "/dashboard", icon: LayoutDashboard },
  { nameKey: "dashboard.sidebar.profile", href: "/dashboard/profile", icon: User },
  { nameKey: "dashboard.sidebar.coding", href: "/dashboard/coding-attempts", icon: Code2 },
  { nameKey: "dashboard.sidebar.questions", href: "/dashboard/saved-questions", icon: Bookmark },
  { nameKey: "dashboard.sidebar.interviews", href: "/dashboard/mock-interviews", icon: History },
  { nameKey: "dashboard.sidebar.articles", href: "/dashboard/my-blogs", icon: FileText },
  { nameKey: "dashboard.sidebar.materials", href: "/dashboard/bookmarks", icon: Heart }, // Updated to Bookmark in original, using Heart for visual variety if needed, but let's stick to consistent icons
  { nameKey: "dashboard.sidebar.settings", href: "/dashboard/settings", icon: Settings },
];

export function DashboardSidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col hidden md:flex">
      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1 px-4">
          <h3 className="mb-4 px-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t('dashboard.sidebar.title')}
          </h3>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors mb-1",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-card-foreground hover:bg-muted hover:text-primary"
                )}
              >
                <Icon className={cn(
                  "mr-3 h-5 w-5",
                  isActive ? "text-primary" : "text-muted-foreground"
                )} />
                {t(item.nameKey)}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
