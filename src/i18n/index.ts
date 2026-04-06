import en from "./locales/en.json";
import ru from "./locales/ru.json";
import ja from "./locales/ja.json";
import uz from "./locales/uz.json";

export type Locale = "en" | "ru" | "ja" | "uz";

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALES: Locale[] = ["en", "ru", "ja", "uz"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
  ja: "\u65e5\u672c\u8a9e",
  uz: "O'zbek",
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: "EN",
  ru: "RU",
  ja: "JA",
  uz: "UZ",
};

type Dictionary = typeof en;

const dictionaries: Record<Locale, Dictionary> = {
  en,
  ru: ru as Dictionary,
  ja: ja as Dictionary,
  uz: uz as Dictionary,
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && LOCALES.includes(value as Locale);
}

export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .toLowerCase()
    .split(";")[0]
    .trim()
    .split(/[-_]/)[0];

  return isLocale(normalized) ? normalized : null;
}

export function getPreferredLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) {
    return DEFAULT_LOCALE;
  }

  for (const language of acceptLanguage.split(",")) {
    const locale = normalizeLocale(language.trim());
    if (locale) {
      return locale;
    }
  }

  return DEFAULT_LOCALE;
}

export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  return normalizeLocale(window.navigator.language) ?? DEFAULT_LOCALE;
}

export function getDictionary(locale: string | null | undefined): Dictionary {
  const normalizedLocale = normalizeLocale(locale) ?? DEFAULT_LOCALE;
  return dictionaries[normalizedLocale];
}

/**
 * Get translation by dot-notation key.
 * Example: t(locale, "nav.dashboard")
 */
export function t(locale: Locale, key: string): any {
  const dictionary = getDictionary(locale);

  const value = key.split(".").reduce((obj: any, part) => {
    return obj && obj[part];
  }, dictionary);

  if (value !== undefined && value !== null) {
    return value;
  }

  if (process.env.NODE_ENV !== "production") {
    console.warn(`[i18n] Translation key not found: ${key} for locale: ${locale}`);
  }

  return key;
}
