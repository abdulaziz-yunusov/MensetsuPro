"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NewsletterForm } from "@/components/features/NewsletterForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock3,
  Copy,
  Github,
  Linkedin,
  Mail,
  SendHorizontal,
  Twitter,
  Youtube,
} from "lucide-react";

const socialLinks = [
  { href: "https://github.com", icon: Github, label: "GitHub" },
  { href: "https://twitter.com", icon: Twitter, label: "Twitter/X" },
  { href: "https://linkedin.com", icon: Linkedin, label: "LinkedIn" },
  { href: "https://youtube.com", icon: Youtube, label: "YouTube" },
];

const supportEmail = "ayunusov238@gmail.com";
const contactTopics = [
  "Bug report",
  "Feature request",
  "General feedback",
  "Account help",
  "Other",
];

export function Footer() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [contactOpen, setContactOpen] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);
  const [contactTopic, setContactTopic] = useState(contactTopics[0]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<{
    type: "idle" | "success" | "error";
    message: string;
  }>({
    type: "idle",
    message: "",
  });

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(supportEmail);
      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 2000);
    } catch {
      setEmailCopied(false);
    }
  };

  const handleContactSubmit = async () => {
    const trimmedMessage = contactMessage.trim();

    if (trimmedMessage.length < 10) {
      setSubmitState({
        type: "error",
        message: "Write a little more detail so the team can understand the issue.",
      });
      return;
    }

    setIsSubmitting(true);
    setSubmitState({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: contactTopic,
          email: contactEmail.trim(),
          message: trimmedMessage,
        }),
      });

      const result = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(result.error || "Failed to send your message.");
      }

      setSubmitState({
        type: "success",
        message: "Your message was sent to the MensetsuPro support team.",
      });
      setContactMessage("");
      setContactEmail("");
      setContactTopic(contactTopics[0]);
    } catch (error) {
      setSubmitState({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to send your message.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactOpenChange = (open: boolean) => {
    setContactOpen(open);

    if (!open) {
      setSubmitState({ type: "idle", message: "" });
      setEmailCopied(false);
    }
  };

  return (
    <footer className="bg-[#0f172a] text-slate-300">
      <div className="container mx-auto grid gap-10 px-4 py-14 md:grid-cols-2 md:gap-8 md:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Link href="/" className="mb-4 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-card font-bold text-[#0f172a]">
              M
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              MensetsuPro
            </span>
          </Link>

          <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
            {t('footer.tagline')}
          </p>

          <div className="flex items-center gap-3">
            {socialLinks.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-card/5 text-muted-foreground transition-colors hover:bg-card/15 hover:text-white"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">{t('footer.features')}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/questions" className="transition-colors hover:text-white">
                {t('nav.questionBank')}
              </Link>
            </li>
            <li>
              <Link href="/ai-interview" className="transition-colors hover:text-white">
                {t('nav.aiInterviewer')}
              </Link>
            </li>
            <li>
              <Link href="/community" className="transition-colors hover:text-white">
                {t('nav.community')}
              </Link>
            </li>
            <li>
              <Link href="/materials" className="transition-colors hover:text-white">
                {t('nav.materials')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">{t('footer.company')}</h3>
          <ul className="space-y-2.5 text-sm">
            <li>
              <Link href="/about" className="transition-colors hover:text-white">
                {t('footer.aboutUs')}
              </Link>
            </li>
            <li>
              <Link href="/community" className="transition-colors hover:text-white">
                {t('nav.community')}
              </Link>
            </li>
            <li>
              <Link href="/blog" className="transition-colors hover:text-white">
                {t('footer.blog')}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="transition-colors hover:text-white">
                {t('nav.faq')}
              </Link>
            </li>
            <li>
              <Dialog open={contactOpen} onOpenChange={handleContactOpenChange}>
                <DialogTrigger
                  render={
                    <button
                      type="button"
                      className="text-left transition-colors hover:text-white"
                    />
                  }
                >
                  {t('footer.contact')}
                </DialogTrigger>

                <DialogContent className="w-[min(92vw,560px)] max-h-[88vh] overflow-y-auto rounded-[24px] border border-border bg-card p-0 text-foreground shadow-[0_24px_60px_-24px_rgba(15,23,42,0.28)]">
                  <div className="border-b border-border/50 bg-[linear-gradient(180deg,rgba(37,99,235,0.06),rgba(255,255,255,0))] px-7 py-6">
                    <DialogHeader className="gap-4">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 shadow-sm shadow-blue-100/80">
                        <Mail className="size-5" />
                      </div>
                      <div className="space-y-2">
                        <DialogTitle className="text-[28px] font-semibold tracking-tight text-foreground">
                          {t('footer.contact')} MensetsuPro
                        </DialogTitle>
                        <DialogDescription className="max-w-md text-[15px] leading-6 text-muted-foreground">
                          {t('community.subtitle')}
                        </DialogDescription>
                      </div>
                    </DialogHeader>
                  </div>

                  <div className="p-6">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border bg-background/70 px-4 py-3.5">
                        <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          Support Email
                        </div>
                        <div className="mt-1.5 text-sm font-medium text-foreground break-all">
                          {supportEmail}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-background/70 px-4 py-3.5">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          <Clock3 className="size-3.5" />
                          Response Time
                        </div>
                        <div className="mt-2 text-base font-medium text-foreground">
                          Within 1-2 business days
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-border bg-background/60 p-4">
                      <div className="text-sm font-semibold text-foreground">
                        Send a message
                      </div>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        Use this form for bug reports, feature ideas, account issues, or general product feedback.
                      </p>

                      <div className="mt-4 grid gap-3.5">
                        <div>
                          <label
                            htmlFor="contact-topic"
                            className="text-sm font-medium text-foreground"
                          >
                            Topic
                          </label>
                          <select
                            id="contact-topic"
                            value={contactTopic}
                            onChange={(event) => setContactTopic(event.target.value)}
                            className="mt-2 flex h-11 w-full rounded-xl border border-border bg-card px-3 text-sm text-card-foreground outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                          >
                            {contactTopics.map((topic) => (
                              <option key={topic} value={topic}>
                                {topic}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label
                            htmlFor="contact-email"
                            className="text-sm font-medium text-foreground"
                          >
                            Your Email
                          </label>
                          <Input
                            id="contact-email"
                            type="email"
                            value={contactEmail}
                            onChange={(event) => setContactEmail(event.target.value)}
                            placeholder="Optional, for replies"
                            className="mt-2 h-11 rounded-xl border-border bg-card px-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-100"
                          />
                        </div>

                        <div>
                          <label
                            htmlFor="contact-message"
                            className="text-sm font-medium text-foreground"
                          >
                            Message
                          </label>
                          <Textarea
                            id="contact-message"
                            value={contactMessage}
                            onChange={(event) => setContactMessage(event.target.value)}
                            placeholder="Describe the bug, feature idea, or feedback you want to send."
                            className="mt-2 min-h-[120px] rounded-xl border-border bg-card px-3 py-3 text-sm text-card-foreground placeholder:text-muted-foreground focus-visible:border-blue-500 focus-visible:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        className="h-11 rounded-xl bg-[#2563eb] px-5 text-white shadow-sm hover:bg-[#1d4ed8]"
                        onClick={handleContactSubmit}
                        disabled={isSubmitting}
                      >
                        <SendHorizontal className="size-4" />
                        {isSubmitting ? "Sending..." : t('common.submit')}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl border-border bg-card px-5 text-card-foreground hover:bg-muted"
                        onClick={handleCopyEmail}>
                        <Clock3 className="size-4" />
                        {emailCopied ? "Email Copied" : "Copy Email"}
                      </Button>
                    </div>

                    {submitState.type !== "idle" && (
                      <div
                        className={`mt-4 rounded-xl border px-4 py-3 text-sm leading-6 ${
                          submitState.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-rose-200 bg-rose-50 text-rose-700"
                        }`}
                      >
                        {submitState.message}
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-white">
                {t('footer.privacyPolicy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="transition-colors hover:text-white">
                {t('footer.termsOfService')}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-slate-800">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-5 text-sm text-muted-foreground sm:flex-row md:px-6">
          <span>
            &copy; {new Date().getFullYear()} MensetsuPro. {t('footer.copyright')}
          </span>
          <span className="text-xs">
            {t('footer.inspiredBy')} &middot; {t('footer.builtFor')}
          </span>
        </div>
      </div>
    </footer>
  );
}
