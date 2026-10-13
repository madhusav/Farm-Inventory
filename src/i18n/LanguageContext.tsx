import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const STORAGE_LANG_KEY = 'farmtrack_user_lang_v1';

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string, fallback?: string) => fallback || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language;
      if (saved && TRANSLATIONS[saved]) {
        return saved;
      }
    } catch (e) {
      console.error(e);
    }
    return 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    } catch (e) {
      console.error(e);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS['en'];
    if (dict && dict[key]) {
      return dict[key];
    }
    // Fallback to English if translation is missing in selected language
    if (TRANSLATIONS['en'] && TRANSLATIONS['en'][key]) {
      return TRANSLATIONS['en'][key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
