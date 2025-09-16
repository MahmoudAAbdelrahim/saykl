// src/app/page.tsx
"use client";

import React from "react";
import { useLanguage } from "./context/LanguageContext";
import { translations } from "./context/i18n";

const HomePage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];

  return (
    <div className="flex flex-col items-center justify-center mt-10">
      <h1 className="text-4xl font-bold mb-4">{t.welcome}</h1>
      <p className="text-gray-700 text-lg text-center max-w-xl">{t.description}</p>
    </div>
  );
};

export default HomePage;
