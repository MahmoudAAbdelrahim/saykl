// src/app/context/LanguageContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "en" | "ar";

interface LanguageContextProps {
  lang: Language;
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Language>("en");

  // تحميل اللغة من localStorage عند البداية
  useEffect(() => {
    const storedLang = localStorage.getItem("lang") as Language | null;
    if (storedLang) {
      setLang(storedLang);
    }
  }, []);

  const toggleLang = () => {
    const newLang = lang === "en" ? "ar" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang); // حفظ اللغة
  };

  return (
    <LanguageContext.Provider value={{ lang, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
