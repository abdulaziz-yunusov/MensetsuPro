import type { Metadata } from "next";
import { FileText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms of Service | MensetsuPro",
  description: "Read the Terms of Service and usage agreements for MensetsuPro.",
};

const termsSections = [
  {
    id: "acceptance-of-terms",
    number: "01",
    title: "Acceptance of Terms",
    body: [
      "By accessing and using MensetsuPro, you accept and agree to be bound by the terms and provision of this agreement."
    ],
  },
  {
    id: "use-license",
    number: "02",
    title: "Use License",
    body: [
      "Permission is granted to temporarily download one copy of the materials (information or software) on MensetsuPro's website for personal, non-commercial transitory viewing only."
    ],
  },
  {
    id: "user-account",
    number: "03",
    title: "User Account",
    body: [
      "If you create an account on the platform, you are responsible for maintaining the security of your account, and you are fully responsible for all activities that occur under the account."
    ],
  },
  {
    id: "prohibited-conduct",
    number: "04",
    title: "Prohibited Conduct",
    body: [
      "Users agree not to use the service to post inappropriate content, attempt to hack the platform's AI models, or scrape our curated question database for external commercial use."
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-card text-foreground selection:bg-blue-100 min-h-screen">
      
      {/* Header Section */}
      <header className="border-b border-border bg-background">
        <div className="container mx-auto max-w-5xl px-6 py-16 md:py-24">
          <div className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-blue-600 uppercase mb-4">
            <FileText className="size-4" />
            Legal & Terms
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
            These terms govern your use of the MensetsuPro platform. Please read them carefully to understand your rights and responsibilities.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-card-foreground">Last Updated:</span>
            <time dateTime="2023-10">October 2023</time>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="container mx-auto max-w-5xl px-6 py-12 md:py-16">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1fr_280px]">
          
          {/* Left Column: Document Body */}
          <main className="space-y-12">
            {termsSections.map((section) => (
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
                  {termsSections.map((section) => (
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
                  If you have questions about these terms, contact our support team.
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