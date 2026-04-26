'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '@/i18n/en';
import ar from '@/i18n/ar';
import type { TranslationKeys } from '@/i18n/en';

type Language = 'en' | 'ar';

interface LanguageContextType {
  lang: Language;
  t: TranslationKeys;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
}

const translations: Record<Language, TranslationKeys> = { en, ar };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'nop_language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');

  // Load saved language on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === 'ar' || saved === 'en') {
      setLangState(saved);
    }
  }, []);

  // Apply dir attribute to <html> whenever language changes
  useEffect(() => {
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem(STORAGE_KEY, newLang);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === 'en' ? 'ar' : 'en');
  }, [lang, setLang]);

  const value: LanguageContextType = {
    lang,
    t: translations[lang],
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    isRTL: lang === 'ar',
    setLang,
    toggleLang,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
