"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, type Locale, normalizeLocale } from "@/i18n";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  isLoaded: boolean;
}

const LANGUAGE_STORAGE_KEY = "mp_locale";
const LANGUAGE_COOKIE_NAME = "mp_locale";
const ONE_YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
  initialLocale?: Locale;
}

export function LanguageProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: LanguageProviderProps) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  useEffect(() => {
    const normalizedInitialLocale = normalizeLocale(initialLocale) ?? DEFAULT_LOCALE;

    setLocaleState(normalizedInitialLocale);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalizedInitialLocale);
    document.documentElement.lang = normalizedInitialLocale;
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${normalizedInitialLocale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
  }, [initialLocale]);

  const setLocale = (newLocale: Locale) => {
    if (newLocale === locale) {
      return;
    }

    setLocaleState(newLocale);
    localStorage.setItem(LANGUAGE_STORAGE_KEY, newLocale);
    document.documentElement.lang = newLocale;
    document.cookie = `${LANGUAGE_COOKIE_NAME}=${newLocale}; path=/; max-age=${ONE_YEAR_IN_SECONDS}; samesite=lax`;
    router.refresh();
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, isLoaded: true }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
