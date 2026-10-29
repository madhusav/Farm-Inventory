import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, TRANSLATIONS } from './translations';
import { db } from '../services/db';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  syncUserLanguage: (userPreferredLang?: string, userId?: string) => void;
  t: (key: string, fallback?: string) => string;
  localeText: (options: Partial<Record<Language, string>>, fallback?: string) => string;
}

const STORAGE_LANG_KEY = 'farmtrack_user_lang_v1';

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  syncUserLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  localeText: (options: Partial<Record<Language, string>>, fallback?: string) => options['en'] || fallback || '',
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      // By default English ('en') unless active user already has a saved preference
      const activeUser = db.getCurrentUser();
      if (activeUser?.id) {
        const userSaved = (activeUser.preferredLanguage || localStorage.getItem(`farmtrack_user_lang_${activeUser.id}`)) as Language;
        if (userSaved && TRANSLATIONS[userSaved]) {
          return userSaved;
        }
      }
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
      const activeUser = db.getCurrentUser();
      if (activeUser?.id) {
        localStorage.setItem(`farmtrack_user_lang_${activeUser.id}`, newLang);
        db.updateUserLanguage(activeUser.id, newLang);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const syncUserLanguage = (userPreferredLang?: string, userId?: string) => {
    try {
      const targetId = userId || db.getCurrentUser()?.id;
      const targetLang = (userPreferredLang || (targetId ? localStorage.getItem(`farmtrack_user_lang_${targetId}`) : null) || 'en') as Language;
      if (targetLang && TRANSLATIONS[targetLang]) {
        setLangState(targetLang);
        localStorage.setItem(STORAGE_LANG_KEY, targetLang);
      }
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

  const localeText = (options: Partial<Record<Language, string>>, fallback?: string): string => {
    if (options[lang]) {
      return options[lang]!;
    }
    if (options['en']) {
      return options['en']!;
    }
    return fallback || '';
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, syncUserLanguage, t, localeText }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
