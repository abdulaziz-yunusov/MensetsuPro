"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, LayoutDashboard, LogOut, ShieldCheck, ChevronDown, UserCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useTranslation } from "@/hooks/useTranslation";
import { LanguageSwitcher } from "@/components/common/LanguageSwitcher";
import { useTheme } from "next-themes";

const navLinks = [
  { href: "/questions", key: "nav.questionBank" },
  { href: "/materials", key: "nav.materials" },
  { href: "/ai-interview", key: "nav.aiInterviewer" },
  { href: "/community", key: "nav.community" },
  { href: "/faq", key: "nav.faq" },
];

export function Navbar() {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: session, status } = useSession();
  const { resolvedTheme } = useTheme();
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const isLoggedIn = status === "authenticated" && !!session;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!accountMenuOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [accountMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-sm shadow-sm dark:bg-slate-950/95 dark:border-slate-800">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary font-bold text-primary-foreground text-sm">
              M
            </div>
            <span className="text-xl font-bold tracking-tight text-primary dark:text-blue-400">
              MensetsuPro
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground dark:text-slate-300">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-primary dark:hover:text-blue-400 transition-colors"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-3">
              {isLoggedIn ? (
                <div className="relative" ref={accountMenuRef}>
                  <button
                    type="button"
                    onClick={() => setAccountMenuOpen((value) => !value)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-border bg-background px-4 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                    aria-haspopup="menu"
                    aria-expanded={accountMenuOpen}
                    aria-label={t("nav.accountMenu")}
                  >
                    <UserCircle2 size={18} className="text-muted-foreground dark:text-slate-400" />
                    <span>{t("nav.accountMenu")}</span>
                    <ChevronDown
                      size={16}
                      className={`text-muted-foreground transition-transform dark:text-slate-400 ${accountMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {accountMenuOpen ? (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-border bg-card p-2 shadow-xl dark:border-slate-800 dark:bg-slate-950">
                      <div className="px-3 py-2">
                        <p className="truncate text-sm font-semibold text-card-foreground dark:text-slate-100">
                          {session.user?.name || "MensetsuPro"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground dark:text-slate-400">
                          {session.user?.email}
                        </p>
                      </div>

                      <div className="my-2 h-px bg-border dark:bg-slate-800" />

                      <div className="space-y-1">
                        <Link
                          href="/dashboard"
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted dark:text-slate-200 dark:hover:bg-slate-900"
                          onClick={() => setAccountMenuOpen(false)}
                        >
                          <LayoutDashboard size={16} className="text-muted-foreground dark:text-slate-400" />
                          {t("nav.dashboard")}
                        </Link>

                        {session?.user?.role === "ADMIN" ? (
                          <Link
                            href="/admin"
                            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted dark:text-slate-200 dark:hover:bg-slate-900"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            <ShieldCheck size={16} className="text-muted-foreground dark:text-slate-400" />
                            {t("nav.adminPanel")}
                          </Link>
                        ) : null}

                        <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium text-card-foreground hover:bg-muted dark:text-slate-200 dark:hover:bg-slate-900">
                          <div className="min-w-0">
                            <div>{t("common.theme")}</div>
                            <div className="text-xs font-normal text-muted-foreground dark:text-slate-400">
                              {mounted && resolvedTheme === "dark" ? t("common.darkMode") : t("common.lightMode")}
                            </div>
                          </div>
                          <ThemeToggle />
                        </div>

                        <button
                          onClick={() => {
                            setAccountMenuOpen(false);
                            signOut({ callbackUrl: "/" });
                          }}
                          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
                        >
                          <LogOut size={16} />
                          {t("nav.signOut")}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-muted-foreground dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors"
                  >
                    {t('nav.logIn')}
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-[min(var(--radius-md),10px)] bg-[#ea580c] hover:bg-[#c2410c] text-white h-9 px-4 text-sm font-medium transition-colors"
                  >
                    {t('nav.signUpFree')}
                  </Link>
                </>
              )}
            </div>
            
            <div className="hidden md:flex items-center gap-2">
              <LanguageSwitcher />
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex items-center justify-center h-10 w-10 rounded-md text-muted-foreground dark:text-slate-300 hover:bg-muted dark:hover:bg-slate-800 transition-colors"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile slide-out drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <div className="absolute top-0 right-0 h-full w-72 bg-card dark:bg-slate-950 shadow-xl flex flex-col">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#1e3a8a] font-bold text-white text-sm">
                  M
                </div>
                <span className="font-bold text-[#1e3a8a] dark:text-blue-400">MensetsuPro</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground dark:text-muted-foreground hover:bg-muted dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav links */}
            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <ul className="space-y-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="block px-4 py-3 rounded-lg text-card-foreground dark:text-slate-300 font-medium hover:bg-background dark:hover:bg-foreground hover:text-[#1e3a8a] dark:hover:text-blue-400 transition-colors"
                      onClick={() => setMobileOpen(false)}
                    >
                      {t(link.key)}
                    </Link>
                  </li>
                ))}
              </ul>
              
              <div className="mt-6 px-4 py-3 bg-background dark:bg-foreground rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground dark:text-slate-300">{t('common.language')}</span>
                  <LanguageSwitcher />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-card-foreground dark:text-slate-300">{t('common.theme')}</span>
                  <ThemeToggle />
                </div>
              </div>
            </nav>

            {/* Mobile auth buttons */}
            <div className="px-6 py-6 border-t dark:border-slate-800 space-y-3">
              {isLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-[#1e3a8a] dark:border-blue-500 text-[#1e3a8a] dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    <LayoutDashboard size={16} />
                    {t('nav.dashboard')}
                  </Link>
                  {session?.user?.role === "ADMIN" && (
                    <Link
                      href="/admin"
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors text-sm"
                      onClick={() => setMobileOpen(false)}
                    >
                      <ShieldCheck size={16} />
                      {t('nav.adminPanel')}
                    </Link>
                  )}
                  <button
                    onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 font-medium hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors text-sm"
                  >
                    <LogOut size={16} />
                    {t('nav.signOut')}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block w-full text-center py-2.5 rounded-lg border border-border dark:border-slate-700 text-card-foreground dark:text-slate-300 font-medium hover:bg-background dark:hover:bg-slate-800 transition-colors text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.logIn')}
                  </Link>
                  <Link
                    href="/register"
                    className="block w-full text-center py-2.5 rounded-lg bg-[#ea580c] hover:bg-[#c2410c] text-white font-medium transition-colors text-sm"
                    onClick={() => setMobileOpen(false)}
                  >
                    {t('nav.signUpFree')}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
