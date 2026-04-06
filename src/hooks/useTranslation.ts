"use client";

import { useLanguage } from '@/components/providers/LanguageProvider';
import { t } from '@/i18n';

/**
 * Hook to use translations in components.
 * Usage: const { t } = useTranslation();
 * t('key.path')
 */
export function useTranslation() {
  const { locale, setLocale, isLoaded } = useLanguage();

  return {
    t: (key: string) => t(locale, key),
    locale,
    setLocale,
    isLoaded
  };
}
