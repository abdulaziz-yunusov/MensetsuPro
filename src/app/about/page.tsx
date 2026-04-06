import Link from "next/link";
import {
  ArrowRight,
  Bot,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  Globe2,
  Languages,
  MessageSquareText,
  Sparkles,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";

const heroStats = [
  {
    icon: MessageSquareText,
    value: "100+",
    label: "Practice questions",
    description: "Behavioral, technical, and motivation prompts in one flow.",
  },
  {
    icon: BriefcaseBusiness,
    value: "20+",
    label: "Interview categories",
    description: "Role-aware practice paths for software and IT candidates.",
  },
  {
    icon: Languages,
    value: "3",
    label: "Language modes",
    description: "Train in Japanese, English, or mixed interview settings.",
  },
  {
    icon: Bot,
    value: "AI",
    label: "Feedback system",
    description: "Actionable scoring, structure coaching, and delivery notes.",
  },
];

const heroHighlights = [
  {
    label: "Built for",
    value: "Students and early-career developers",
  },
  {
    label: "Focused on",
    value: "Japan-specific hiring expectations",
  },
  {
    label: "Improves",
    value: "Confidence, clarity, and interview structure",
  },
];

const missionPoints = [
  {
    icon: Bot,
    title: "Real-time AI mock interviews",
    description:
      "Practice with guided prompts, instant scoring, and follow-up questions that feel close to a live interview.",
    accent: "bg-blue-100 text-blue-700",
  },
  {
    icon: BriefcaseBusiness,
    title: "IT-specific interview practice",
    description:
      "Train on technical, behavioral, and motivation questions built for software roles in Japanese companies.",
    accent: "bg-emerald-100 text-emerald-700",
  },
  {
    icon: Languages,
    title: "Culturally accurate Japanese feedback",
    description:
      "Improve clarity, Keigo, and business tone with feedback designed for Japan-focused job hunting.",
    accent: "bg-rose-100 text-rose-700",
  },
];

const trustCards = [
  {
    icon: MessageSquareText,
    title: "AI mock interviews",
    description: "Structured answer review with practical next-step feedback after every round.",
  },
  {
    icon: Globe2,
    title: "Japanese-specific guidance",
    description: "Designed around language, etiquette, and hiring expectations in Japanese workplaces.",
  },
  {
    icon: Building2,
    title: "Technical interview support",
    description: "Question banks and materials focused on IT roles, coding screens, and motivation stories.",
  },
  {
    icon: Target,
    title: "Progress tracking",
    description: "Keep practice sessions, saved materials, and improvement history in one workflow.",
  },
];

const workflowSteps = [
  {
    title: "Set the interview context",
    description:
      "Choose the role, difficulty, and interview focus that matches your target company.",
  },
  {
    title: "Practice with structured AI guidance",
    description:
      "Answer realistic prompts, get scored feedback, and improve weak parts while the session is still fresh.",
  },
  {
    title: "Turn review into a study plan",
    description:
      "Jump from feedback into curated materials so every next round is more focused than the last.",
  },
];

export default function AboutPage() {
  const primaryButtonClass = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold transition-all outline-none",
    "h-12 px-6",
    "bg-[#2563eb] text-white shadow-lg shadow-blue-900/15 hover:bg-[#1d4ed8]",
  );

  const secondaryButtonClass = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-base transition-all outline-none",
    "h-12 px-6",
    "border-border bg-card font-medium text-card-foreground shadow-sm shadow-slate-200/60 hover:border-slate-400 hover:bg-background",
  );

  const darkSecondaryButtonClass = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl border text-base transition-all outline-none",
    "h-12 px-6",
    "border-white/20 bg-card/5 font-medium text-white hover:bg-card/10 hover:text-white",
  );

  const ctaPrimaryButtonClass = cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-base font-semibold transition-all outline-none",
    "h-12 px-6",
    "bg-card text-foreground hover:bg-muted",
  );

  return (
    <div className="bg-[#f8fafc] text-foreground">
      <section className="relative overflow-hidden border-b border-border/70">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(37,99,235,0.14),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.08),_transparent_28%)]" />
        <div className="container relative mx-auto max-w-7xl px-4 pb-12 pt-10 md:px-6 md:pb-14 md:pt-12">
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:gap-5">
            <div className="max-w-3xl pt-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
                <Sparkles className="size-3.5" />
                About MensetsuPro
              </div>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground md:text-6xl xl:text-[4.45rem]">
                Japanese interview practice built for ambitious IT candidates.
              </h1>

              <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground md:text-[1.22rem] md:leading-9">
                MensetsuPro helps students and professionals prepare for Japanese job interviews with realistic AI practice, structured feedback, and curated learning materials.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ai-interview"
                  className={primaryButtonClass}
                >
                  Start Interview Practice
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/materials"
                  className={secondaryButtonClass}
                >
                  Explore Materials
                </Link>
              </div>

              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {heroHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/80 bg-card/90 px-4 py-4 shadow-sm shadow-slate-200/60 backdrop-blur"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{item.label}</div>
                    <div className="mt-2 text-[15px] font-medium leading-7 text-card-foreground md:text-base">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3 lg:pl-2">
              <div className="rounded-[28px] border border-border/90 bg-card p-3 shadow-[0_30px_80px_-38px_rgba(15,23,42,0.45)]">
                <div className="rounded-[24px] bg-slate-950 p-4 text-white md:p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.28em] text-sky-300">Product Preview</p>
                      <h2 className="mt-1 text-lg font-medium text-white/95 md:text-[1.15rem]">
                        AI Interview Workspace
                      </h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="size-2.5 rounded-full bg-rose-400" />
                      <span className="size-2.5 rounded-full bg-amber-300" />
                      <span className="size-2.5 rounded-full bg-emerald-400" />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[1.18fr_0.82fr]">
                    <div className="space-y-3 rounded-2xl bg-card/6 p-3.5">
                      <div className="rounded-2xl border border-white/10 bg-card/8 p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                          <Bot className="size-4 text-sky-300" />
                          Interviewer prompt
                        </div>
                        <p className="mt-3 text-sm leading-6 text-slate-300">
                          Tell me about a difficult engineering project and how you explained tradeoffs to non-technical teammates.
                        </p>
                      </div>

                      <div className="rounded-2xl bg-card p-4 text-foreground">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">Feedback summary</div>
                            <div className="mt-2 text-3xl font-semibold tracking-tight">84/100</div>
                          </div>
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
                            Politeness strong
                          </div>
                        </div>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl bg-background px-3 py-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Clarity</div>
                            <div className="mt-1 text-lg font-semibold">86</div>
                          </div>
                          <div className="rounded-xl bg-background px-3 py-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Relevance</div>
                            <div className="mt-1 text-lg font-semibold">82</div>
                          </div>
                          <div className="rounded-xl bg-background px-3 py-3">
                            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Keigo</div>
                            <div className="mt-1 text-lg font-semibold">89</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="rounded-2xl border border-white/10 bg-card/6 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Session Mode</div>
                        <div className="mt-2 text-lg font-medium">Backend Engineer / Mid-level</div>
                        <p className="mt-3 text-sm leading-6 text-muted-foreground">
                          Structured around behavioral, technical, and motivation rounds.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-500/25 to-sky-400/10 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-sky-200">Coaching Focus</div>
                        <div className="mt-2 text-lg font-medium">Clearer story arc</div>
                        <p className="mt-2 text-sm leading-6 text-slate-200">
                          Add more concrete outcome metrics and close with impact on the team.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-card/6 p-4">
                        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Materials Linked</div>
                        <div className="mt-2 text-lg font-medium">Interview etiquette, answer structure, coding review</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {heroStats.map(({ icon: Icon, value, label, description }) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-border bg-card px-4 py-3.5 shadow-sm shadow-slate-200/60"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[1.75rem] font-semibold tracking-tight text-foreground">{value}</div>
                        <div className="mt-1 text-sm font-semibold leading-6 text-foreground">{label}</div>
                      </div>
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                        <Icon className="size-[18px]" />
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-card">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.03fr)_minmax(0,0.97fr)] xl:gap-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.26em] text-blue-700">Our Mission</p>
              <h2 className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
                A focused platform for Japanese interview readiness, not a generic study site.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-8 text-muted-foreground md:text-lg">
                The Japanese IT market offers real opportunity, but language, interview culture, and communication style create friction for many candidates. MensetsuPro turns that gap into a repeatable practice workflow.
              </p>
              <div className="mt-6 rounded-3xl border border-blue-100 bg-blue-50/70 px-5 py-5">
                <p className="text-sm leading-7 text-card-foreground md:text-base">
                  Instead of generic prep advice, the platform stays centered on realistic interview practice, culturally accurate feedback, and study materials that connect directly to the next improvement step.
                </p>
              </div>

              <div className="mt-7 space-y-4">
                {missionPoints.map(({ icon: Icon, title, description, accent }) => (
                  <div
                    key={title}
                    className="flex gap-4 rounded-2xl border border-border bg-background px-5 py-5"
                  >
                    <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{title}</h3>
                      <p className="mt-2 text-sm leading-7 text-muted-foreground md:text-base">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-3xl border border-border bg-[#f8fafc] p-6 shadow-sm shadow-slate-200/60">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-700">How It Works</p>
                    <h3 className="mt-1 text-xl font-medium text-foreground">A tighter feedback loop for interview prep</h3>
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  {workflowSteps.map(({ title, description }, index) => (
                    <div key={title} className="flex gap-4 rounded-2xl bg-card px-4 py-4 ring-1 ring-slate-200">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-foreground md:text-[15px]">{title}</h4>
                        <p className="mt-1 text-sm leading-7 text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border bg-slate-950 p-6 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.8)]">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-300">Why Candidates Stay</p>
                <h3 className="mt-3 text-2xl font-medium tracking-tight">One workflow from preparation to interview-day confidence.</h3>
                <p className="mt-4 text-sm leading-7 text-slate-300 md:text-base">
                  Instead of jumping between random articles, untranslated question lists, and vague AI prompts, learners can practice, review, and study inside one focused system.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-card/6 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Interview prep</div>
                    <div className="mt-2 text-lg font-medium">Behavioral + technical + cultural</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-card/6 px-4 py-4">
                    <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Learning path</div>
                    <div className="mt-2 text-lg font-medium">Practice sessions linked to materials</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f8fafc]">
        <div className="container mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.26em] text-blue-700">Trust Indicators</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
              Built around the parts of interview prep that usually get ignored.
            </h2>
            <p className="mt-4 text-base leading-8 text-muted-foreground md:text-lg">
              The product is designed to support the parts candidates usually have to stitch together manually: realistic practice, Japanese communication nuance, technical preparation, and measurable progress.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustCards.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="rounded-3xl border border-border bg-card px-5 py-5 shadow-sm shadow-slate-200/60"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-lg font-medium text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 pt-3 md:pb-20">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="rounded-[32px] bg-[linear-gradient(135deg,#020617_0%,#0f172a_62%,#1e3a8a_135%)] px-6 py-7 text-white shadow-[0_30px_80px_-40px_rgba(15,23,42,0.95)] md:px-10 md:py-8">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-sky-300">Next Step</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] md:text-[2.35rem]">
                  Start practicing with a clearer, more realistic interview routine.
                </h2>
                <p className="mt-3 text-base leading-8 text-slate-300 md:text-lg">
                  Use AI practice, role-specific questions, and structured learning materials to prepare with more confidence before the next application cycle.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ai-interview"
                  className={ctaPrimaryButtonClass}
                >
                  Start Practicing
                  <ArrowRight className="ml-2 size-4" />
                </Link>
                <Link
                  href="/materials"
                  className={darkSecondaryButtonClass}
                >
                  Explore Materials
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
