"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en, TranslationType } from "./en";
import { pl } from "./pl";
import { cs } from "./cs";

type Language = "en" | "pl" | "cs";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationType;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const dictionaries = { en, pl, cs };

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    // Detect browser language or stored preference
    const stored = localStorage.getItem("walloon_lang") as Language;
    if (stored && (stored === "en" || stored === "pl" || stored === "cs")) {
      setLanguageState(stored);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "pl") {
        setLanguageState("pl");
      } else if (browserLang === "cs") {
        setLanguageState("cs");
      } else {
        setLanguageState("en");
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("walloon_lang", lang);
  };

  const t = dictionaries[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
