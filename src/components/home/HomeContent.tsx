"use client";

import Link from "next/link";
import {
  BookOpen,
  Code2,
  MessageSquare,
  PlayCircle,
  Users,
  Star,
  TrendingUp,
  Globe,
  Brain,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Layers,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface HomeContentProps {
  stats: {
    totalQuestions: number;
    totalMaterials: number;
    totalUsers: number;
    totalDiscussions: number;
    totalCodingQuestions: number;
    totalInterviews: number;
  };
  categories: any[];
  materials: any[];
}

export function HomeContent({ stats, categories, materials }: HomeContentProps) {
  const { t } = useTranslation();

  const heroStats = [
    {
      icon: Users,
      value: stats.totalUsers > 0 ? `${stats.totalUsers.toLocaleString()}+` : null,
      label: t('home.heroStats.users'),
    },
    {
      icon: MessageSquare,
      value: stats.totalQuestions > 0 ? `${stats.totalQuestions.toLocaleString()}+` : null,
      label: t('home.heroStats.questions'),
    },
    {
      icon: Code2,
      value: stats.totalCodingQuestions > 0 ? `${stats.totalCodingQuestions}` : null,
      label: t('home.heroStats.coding'),
    },
  ].filter((s) => s.value !== null);

  const platformStats = [
    { value: stats.totalQuestions, label: t('home.heroStats.questions'), icon: MessageSquare, color: "text-blue-600 bg-blue-50" },
    { value: stats.totalMaterials, label: t('nav.materials'), icon: BookOpen, color: "text-orange-600 bg-orange-50" },
    { value: stats.totalCodingQuestions, label: t('home.heroStats.coding'), icon: Code2, color: "text-emerald-600 bg-emerald-50" },
    { value: stats.totalDiscussions, label: t('home.heroStats.users'), icon: Users, color: "text-violet-600 bg-violet-50" },
  ].filter((s) => s.value > 0);

  const coreFeatures = [
    {
      icon: MessageSquare,
      color: "bg-blue-100 text-[#1e3a8a]",
      title: t('home.features.bank.title'),
      description: t('home.features.bank.desc'),
      href: "/questions",
    },
    {
      icon: Brain,
      color: "bg-orange-100 text-[#ea580c]",
      title: t('home.features.ai.title'),
      description: t('home.features.ai.desc'),
      href: "/ai-interview",
    },
    {
      icon: Code2,
      color: "bg-emerald-100 text-emerald-700",
      title: t('home.features.coding.title'),
      description: t('home.features.coding.desc'),
      href: "/ai-interview",
    },
    {
      icon: BookOpen,
      color: "bg-violet-100 text-violet-700",
      title: t('home.features.materials.title'),
      description: t('home.features.materials.desc'),
      href: "/materials",
    },
    {
      icon: Globe,
      color: "bg-sky-100 text-sky-700",
      title: t('home.features.bilingual.title'),
      description: t('home.features.bilingual.desc'),
      href: "/questions",
    },
    {
      icon: Users,
      color: "bg-rose-100 text-rose-700",
      title: t('home.features.community.title'),
      description: t('home.features.community.desc'),
      href: "/community",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="bg-[#1e3a8a] py-24 md:py-36 text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-card/[0.04] rounded-full" />
          <div className="absolute bottom-0 -left-24 w-96 h-96 bg-card/[0.04] rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-card/[0.02] rounded-full" />
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-orange-300 bg-orange-400/15 px-4 py-2 rounded-full mb-8">
            <Star size={12} className="fill-orange-300" />
            {t('home.heroBadge')}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl leading-tight">
            {t('home.heroTitle')}{" "}
            <span className="text-orange-400">{t('home.heroTitleAccent')}</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-10 max-w-2xl leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-14">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[#ea580c] hover:bg-[#c2410c] text-white text-base font-semibold px-8 h-14 shadow-lg shadow-orange-500/20"
            >
              {t('home.startNow')}
            </Link>
            <Link
              href="/ai-interview"
              className="inline-flex items-center justify-center rounded-md border transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-transparent border-white/60 text-white hover:bg-card/10 hover:text-white text-base font-semibold px-8 h-14"
            >
              {t('home.tryAI')}
            </Link>
          </div>

          {/* Real Stats Row */}
          {heroStats.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8 text-sm text-blue-200">
              {heroStats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="flex items-center gap-2">
                    {i > 0 && <div className="hidden sm:block h-4 w-px bg-blue-700 mr-2" />}
                    <Icon size={16} className="text-orange-400 flex-shrink-0" />
                    <span>
                      <strong className="text-white">{stat.value}</strong> {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Core Features ────────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#1e3a8a] bg-blue-50 border border-blue-100 px-4 py-1.5 rounded-full mb-4">
              <Layers size={12} /> {t('home.features.badge')}
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[#0f172a] mb-4">
              {t('home.features.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('home.features.subtitle')}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {coreFeatures.map(({ icon: Icon, color, title, description, href }) => (
              <Link
                key={title}
                href={href}
                className="group bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg hover:border-border hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-xl ${color} flex items-center justify-center mb-5`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[#1e3a8a] transition-colors">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[#1e3a8a] opacity-0 group-hover:opacity-100 transition-opacity">
                  {t('home.features.learnMore')} <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories + Materials ────────────────────────── */}
      <section className="py-20 bg-card border-y border-border">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-16">

            {/* Categories */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0f172a]">{t('home.categories.title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('home.categories.subtitle')}
                </p>
              </div>

              <div className="space-y-2.5">
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <Link
                      href={`/questions?categoryId=${cat.id}`}
                      key={cat.id}
                      className="group flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-[#1e3a8a] hover:bg-blue-50/50 transition-all duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-[#1e3a8a]/30 group-hover:bg-[#1e3a8a] transition-colors" />
                        <span className="font-medium text-foreground group-hover:text-[#1e3a8a] transition-colors">
                          {cat.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {cat._count.questions > 0 && (
                          <span className="text-xs text-muted-foreground font-medium">
                            {cat._count.questions} {t('home.categories.questionsCount')}
                          </span>
                        )}
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1e3a8a] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))
                ) : (
                  // Fallback to static known categories
                  ["Self-Introduction", "Why Japan?", "IT & Technical", "Strengths & Weaknesses", "Career Vision", "Behavioral"].map((cat, i) => (
                    <Link
                      href="/questions"
                      key={i}
                      className="group flex items-center justify-between p-4 rounded-xl bg-background border border-border hover:border-[#1e3a8a] hover:bg-blue-50/50 transition-all"
                    >
                      <span className="font-medium text-foreground group-hover:text-[#1e3a8a]">{cat}</span>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1e3a8a]" />
                    </Link>
                  ))
                )}
              </div>

              <div className="mt-6">
                <Link href="/questions" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2">
                  {t('home.categories.browseAll')} <ArrowRight size={15} />
                </Link>
              </div>
            </div>

            {/* Featured Materials */}
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#0f172a]">{t('home.materialsSection.title')}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {t('home.materialsSection.subtitle')}
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {materials.length > 0 ? (
                  materials.map((mat) => {
                    const typeColor =
                      mat.type === "VIDEO" ? "text-[#ea580c]" :
                      mat.type === "ARTICLE" ? "text-[#1e3a8a]" :
                      "text-emerald-600";
                    const typeLabel = mat.type === "VIDEO" ? t('home.materialsSection.videoGuide') : mat.type === "ARTICLE" ? t('home.materialsSection.article') : mat.type;
                    return (
                      <Link
                        href={mat.url || "/materials"}
                        key={mat.id}
                        target={mat.url ? "_blank" : undefined}
                        className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-[#1e3a8a]/30 hover:bg-background transition-all"
                      >
                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                          {mat.type === "VIDEO" ? (
                            <PlayCircle className="w-7 h-7 text-[#1e3a8a]" />
                          ) : (
                            <BookOpen className="w-7 h-7 text-[#1e3a8a]" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[11px] font-semibold uppercase tracking-wider ${typeColor}`}>{typeLabel}</span>
                          <h3 className="font-semibold text-foreground leading-snug group-hover:text-[#1e3a8a] transition-colors mt-0.5 line-clamp-1">
                            {mat.title}
                          </h3>
                          {mat.description && (
                            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{mat.description}</p>
                          )}
                        </div>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-[#1e3a8a] mt-1 flex-shrink-0" />
                      </Link>
                    );
                  })
                ) : (
                  // Fallback static cards if no materials in DB
                  [
                    { type: "VIDEO GUIDE", color: "text-[#ea580c]", title: "Mastering the IT Entry Sheet (ES)", desc: "Learn what top Japanese tech companies look for in your initial application." },
                    { type: "ARTICLE", color: "text-[#1e3a8a]", title: "Understanding Honne vs. Tatemae", desc: "A crucial concept for navigating behavioral questions in traditional companies." },
                    { type: "COMMUNITY", color: "text-emerald-600", title: "Top Questions asked at Mercari", desc: "Recent candidates share their experiences and coding task topics." },
                  ].map(({ type, color, title, desc }, i) => (
                    <Link
                      href="/materials"
                      key={i}
                      className="group flex items-start gap-4 p-4 rounded-xl border border-border hover:border-[#1e3a8a]/30 hover:bg-background transition-all"
                    >
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center">
                        <BookOpen className="w-7 h-7 text-[#1e3a8a]" />
                      </div>
                      <div className="flex-1">
                        <span className={`text-[11px] font-semibold uppercase tracking-wider ${color}`}>{type}</span>
                        <h3 className="font-semibold text-foreground leading-snug group-hover:text-[#1e3a8a] transition-colors mt-0.5">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{desc}</p>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <div className="mt-6">
                <Link href="/materials" className="inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:bg-muted focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-2">
                  {t('home.materialsSection.exploreAll')} <ArrowRight size={15} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Real Platform Stats ───────────────────────────── */}
      {platformStats.length > 0 && (
        <section className="py-20 bg-[#0f172a] text-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-14">
              <h2 className="text-3xl font-bold mb-3">{t('home.stats.title')}</h2>
              <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                {t('home.stats.subtitle')}
              </p>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {platformStats.map(({ value, label, icon: Icon, color }) => (
                <div
                  key={label}
                  className="bg-card/5 border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center hover:bg-card/10 transition-colors"
                >
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                    <Icon size={22} />
                  </div>
                  <p className="text-3xl font-bold text-white mb-1">{value.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Why MensetsuPro ──────────────────────────────── */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#ea580c] bg-orange-50 border border-orange-100 px-4 py-1.5 rounded-full mb-5">
                <TrendingUp size={12} /> {t('home.why.badge')}
              </div>
              <h2 className="text-3xl font-bold text-[#0f172a] mb-5 leading-tight">
                {t('home.why.title')}
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                {t('home.why.desc')}
              </p>
              <div className="space-y-4">
                {(Array.isArray(t('home.why.points')) ? t('home.why.points') : []).map((item: string) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-card-foreground text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: MessageSquare, label: t('home.features.bank.title'), desc: t('home.features.bank.desc'), color: "from-blue-500 to-blue-700" },
                { icon: Brain, label: t('home.features.ai.title'), desc: t('home.features.ai.desc'), color: "from-orange-500 to-orange-700" },
                { icon: Code2, label: t('home.features.coding.title'), desc: t('home.features.coding.desc'), color: "from-emerald-500 to-emerald-700" },
                { icon: Users, label: t('nav.community'), desc: t('home.features.community.desc'), color: "from-violet-500 to-violet-700" },
              ].map(({ icon: Icon, label, desc, color }) => (
                <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-md`}>
                  <Icon className="w-8 h-8 mb-3 opacity-90" />
                  <p className="font-semibold text-sm mb-1">{label}</p>
                  <p className="text-white/70 text-xs leading-snug line-clamp-2">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="py-24 bg-[#1e3a8a] text-white relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-card/[0.04] rounded-full" />
        </div>
        <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-orange-300 bg-orange-400/15 px-4 py-2 rounded-full mb-6">
            <Star size={12} className="fill-orange-300" /> {t('home.cta.badge')}
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 leading-tight">
            {t('home.cta.title')}
          </h2>
          <p className="text-lg text-blue-200 max-w-xl mx-auto mb-10 leading-relaxed">
            {t('home.cta.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-[#ea580c] hover:bg-[#c2410c] text-white text-base font-semibold px-10 h-14 shadow-lg shadow-orange-500/30"
            >
              {t('home.cta.createAccount')}
            </Link>
            <Link
              href="/questions"
              className="inline-flex items-center justify-center rounded-md border transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 bg-transparent border-white/50 text-white hover:bg-card/10 hover:text-white text-base font-semibold px-10 h-14"
            >
              {t('home.cta.browseQuestions')}
            </Link>
          </div>
          <p className="mt-5 text-sm text-blue-300">{t('home.cta.noCard')}</p>
        </div>
      </section>
    </div>
  );
}
