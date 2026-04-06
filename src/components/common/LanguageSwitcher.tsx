"use client";

import { useState, useRef, useEffect } from 'react';
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT_LABELS } from '@/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function LanguageSwitcher({ className, variant = 'compact' }: LanguageSwitcherProps) {
  const { locale: currentLocale, setLocale, isLoaded } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isLoaded) return null;

  if (variant === 'full') {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-4 gap-2", className)}>
        {LOCALES.map((loc) => (
          <button
            key={loc}
            onClick={() => setLocale(loc)}
            className={cn(
              "flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200",
              currentLocale === loc
                ? "border-primary bg-primary/5 text-primary ring-2 ring-primary/10"
                : "border-border bg-card hover:border-primary/30 hover:bg-muted"
            )}
          >
            <span className="text-xl font-bold mb-2 text-muted-foreground">{LOCALE_SHORT_LABELS[loc]}</span>
            <span className="text-sm font-medium">{LOCALE_LABELS[loc]}</span>
            {currentLocale === loc && (
              <Check className="w-4 h-4 mt-2" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("relative inline-block", className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted transition-colors text-sm font-medium text-card-foreground shadow-sm min-w-[100px]"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className="text-[11px] font-bold text-muted-foreground w-5 text-left">{LOCALE_SHORT_LABELS[currentLocale]}</span>
        <span className="flex-1 text-left">{LOCALE_LABELS[currentLocale]}</span>
        <ChevronDown size={14} className={cn("text-muted-foreground transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-card shadow-lg z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-1">
            {LOCALES.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setLocale(loc);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm text-left transition-colors",
                  currentLocale === loc
                    ? "bg-primary/10 text-primary font-bold"
                    : "text-card-foreground hover:bg-muted"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-muted-foreground/60 w-5">{LOCALE_SHORT_LABELS[loc]}</span>
                  <span>{LOCALE_LABELS[loc]}</span>
                </div>
                {currentLocale === loc && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
