import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  type Locale,
  getDictionary,
  getPreferredLocale,
  normalizeLocale,
} from "@/i18n";

export async function getRequestLocale(explicitLocale?: string | null): Promise<Locale> {
  const explicit = normalizeLocale(explicitLocale);
  if (explicit) {
    return explicit;
  }

  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get("mp_locale")?.value);
  if (cookieLocale) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return getPreferredLocale(headerStore.get("accept-language"));
}

/**
 * Server-side translation helper.
 * Use this in Server Components to access localized strings.
 */
export async function getServerTranslation(locale?: string | null) {
  const resolvedLocale = await getRequestLocale(locale);
  const dictionary = getDictionary(resolvedLocale);

  const t = (key: string) => {
    const value = key.split(".").reduce((current: any, part) => {
      return current && current[part];
    }, dictionary);

    if (value !== undefined && value !== null) {
      return value;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Translation key not found: ${key} for locale: ${resolvedLocale}`);
    }

    return key;
  };

  return { t, locale: resolvedLocale };
}

export { DEFAULT_LOCALE };
