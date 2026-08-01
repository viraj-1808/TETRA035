import React, { createContext, useContext, useState } from "react";
import en from "./i18n/en.json";
import hi from "./i18n/hi.json";
import gu from "./i18n/gu.json";

const LanguageContext = createContext();

const translations = { en, hi, gu };

export function LanguageProvider({ children }) {
  const saved = localStorage.getItem("farm-guard-lang");
  const [language, setLanguage] = useState(saved || "en");

  const t = (key) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}