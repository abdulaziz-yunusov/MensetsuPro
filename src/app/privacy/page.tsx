import type { Metadata } from "next";
import {
  Bot,
  Database,
  Eye,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy | MensetsuPro",
  description:
    "Read how MensetsuPro collects, uses, stores, and protects personal information across the platform.",
};

const summaryCards = [
  {
    icon: Database,
    title: "What we collect",
    description:
      "Account details, profile inputs, interview responses, and forum submissions used to operate the platform.",
  },
  {
    icon: Bot,
    title: "Why we use it",
    description:
      "To deliver AI interview practice, improve product quality, support users, and protect the service.",
  },
  {
    icon: LockKeyhole,
    title: "How we protect it",
    description:
      "Sensitive account data is stored with security controls and access is limited to operational needs.",
  },
  {
    icon: Eye,
    title: "When we share it",
    description:
      "Only with your consent, trusted processors, or when required for legal and security reasons.",
  },
];

const policySections = [
  {
    id: "information-we-collect",
    number: "01",
    title: "Information we collect",
    body: [
      "We collect the information needed to create and maintain your MensetsuPro account, including login credentials, profile details, and settings related to your interview practice.",
      "If you use AI interview features, we may process the text, prompts, answers, and related session data you submit during practice. If you participate in community areas, the posts, comments, and other content you publish may also be stored.",
      "We may also collect technical information such as device, browser, approximate usage logs, and diagnostic events to keep the platform stable and secure.",
    ],
  },
  {
    id: "how-we-use-information",
    number: "02",
    title: "How we use information",
    body: [
      "We use collected information to provide core product features, personalize interview practice, deliver AI-generated feedback, and keep your learning history available across sessions.",
      "Information is also used to monitor performance, investigate misuse, respond to support requests, and improve the relevance and reliability of our questions, materials, and product experience.",
    ],
  },
  {
    id: "ai-and-third-party-processing",
    number: "03",
    title: "AI and third-party processing",
    body: [
      "Some platform features rely on third-party service providers. For example, interview responses or prompts may be processed by AI providers to generate evaluations or feedback in real time.",
      "We work with service providers only when they help us operate the product, and we expect them to handle data under appropriate confidentiality and security obligations.",
    ],
  },
  {
    id: "sharing-and-disclosure",
    number: "04",
    title: "Sharing and disclosure",
    body: [
      "We do not sell your personal information. We may share information with service providers acting on our behalf, when you ask us to do so, or when disclosure is necessary to comply with legal obligations, enforce our policies, or protect users and the platform.",
      "Content you intentionally make public in community features may be visible to other users and should be treated as public information.",
    ],
  },
  {
    id: "retention-and-security",
    number: "05",
    title: "Data retention and security",
    body: [
      "We retain data for as long as it is reasonably necessary to operate the service, meet legal obligations, resolve disputes, and maintain security records.",
      "We use administrative and technical safeguards designed to reduce unauthorized access, loss, misuse, or disclosure. No internet-based service can guarantee absolute security, but we aim to apply reasonable protection standards throughout the platform.",
    ],
  },
  {
    id: "your-choices",
    number: "06",
    title: "Your choices and contact",
    body: [
      "You can review or update parts of your account information through the platform. If you need help with account access, support, or privacy questions, contact the MensetsuPro team.",
      "If we materially change this Privacy Policy, we may update this page and revise the effective date so users can understand what changed and when.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-card text-foreground selection:bg-blue-100 min-h-screen">
      
      {/* Header Section */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-600 uppercase mb-4">
            <ShieldCheck className="size-4" />
            Legal & Privacy
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            This page explains what information we collect, how it is used across the platform, when it may be shared, and what users should expect when using AI interview and community features.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">Last Updated:</span>
            <time dateTime="2026-03-27">March 27, 2026</time>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
          
          {/* Left Column: Document Body */}
          <main className="space-y-16">
            
            {/* Summary Section */}
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-6">Privacy at a glance</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {summaryCards.map(({ icon: Icon, title, description }) => (
                  <div key={title} className="rounded-lg border border-border bg-card p-5">
                    <div className="mb-3 inline-flex size-10 items-center justify-center rounded-md bg-muted text-card-foreground">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="border-border" />

            {/* Detailed Policy Sections */}
            <div className="space-y-12">
              {policySections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground mb-4 flex items-center gap-3">
                    <span className="text-sm font-bold text-muted-foreground select-none">{section.number}.</span>
                    {section.title}
                  </h2>
                  <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
                    {section.body.map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </main>

          {/* Right Column: Sticky Sidebar / Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-8">
              
              {/* Table of Contents */}
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground mb-4">
                  On this page
                </h3>
                <nav className="flex flex-col space-y-2.5 border-l border-border pl-4">
                  {policySections.map((section) => (
                    <a
                      key={section.id}
                      href={`#${section.id}`}
                      className="text-sm text-muted-foreground hover:text-blue-600 transition-colors"
                    >
                      {section.title}
                    </a>
                  ))}
                </nav>
              </div>

              {/* Contact Card */}
              <div className="rounded-lg border border-border bg-background p-5">
                <div className="flex items-center gap-2 text-foreground font-semibold mb-2">
                  <Mail className="size-4 text-muted-foreground" />
                  <h4>Questions?</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  For privacy-related requests or policy questions, contact our team.
                </p>
                <a 
                  href="mailto:ayunusov238@gmail.com" 
                  className="inline-flex w-full items-center justify-center rounded-md bg-card px-3 py-2 text-sm font-medium text-foreground shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-background"
                >
                  Contact Support
                </a>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}