"use client";

import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

export function NewsletterForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <div>
      <h3 className="font-semibold text-white mb-2">{t('footer.newsletterTitle')}</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {t('footer.newsletterSubtitle')}
      </p>

      {status === "success" ? (
        <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t('common.success')}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <input
            suppressHydrationWarning
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('footer.newsletterPlaceholder')}
            className="w-full rounded-lg px-3 py-2.5 text-sm bg-card/10 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-white/30 transition-colors"
            required
          />
          <button
            suppressHydrationWarning
            type="submit"
            disabled={status === "loading"}
            className="w-full rounded-lg px-3 py-2.5 text-sm font-semibold bg-[#ea580c] hover:bg-[#c2410c] text-white transition-colors disabled:opacity-60"
          >
            {status === "loading" ? t('common.loading') : t('footer.newsletterButton')}
          </button>
        </form>
      )}
    </div>
  );
}
