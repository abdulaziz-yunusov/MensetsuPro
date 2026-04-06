/**
 * Simple language detection utility for MensetsuPro community content.
 * Matches specific character ranges for Japanese and Cyrillic (Russian).
 * Defaults to "en" or "uz" based on app context if no specific matches found.
 */
export function detectLanguage(text: string): 'en' | 'ru' | 'ja' | 'uz' {
  if (!text) return 'en';

  // Japanese: Hiragana, Katakana, Kanji
  const jaRegex = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff66-\uff9f]/;
  if (jaRegex.test(text)) return 'ja';

  // Russian: Cyrillic
  const ruRegex = /[\u0400-\u04FF]/;
  if (ruRegex.test(text)) return 'ru';

  // Uzbek: Often Latin (similar to EN) or Cyrillic. 
  // Since Latin Uzbek is very similar to English for a regex, 
  // we'll default to 'en' unless we have a specific Uzbek dictionary match or the user selects it.
  
  return 'en';
}
