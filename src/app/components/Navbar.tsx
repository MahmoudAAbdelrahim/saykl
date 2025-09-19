// src/app/components/Navbar.tsx
"use client";

import Link from "next/link";
import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useUser } from "../context/UserContext";

interface User {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "client";
  userId: string;
}

const Navbar = () => {
  const { lang, toggleLang } = useLanguage();
  const { user } = useUser();
  const t = translations[lang];
  const [isOpen, setIsOpen] = useState(false);

  const renderLinks = () => {
    if (!user) {
      return (
        <>
          <li><Link href="/">{t.home}</Link></li>
          <li><Link href="/products">{t.products}</Link></li>
          <li><Link href="/login">{t.login}</Link></li>
          <li><Link href="/register">{t.createAccount}</Link></li>
        </>
      );
    }

    if (user.role === "admin") {
      return (
        <>
          <li><Link href="/">{t.home}</Link></li>
          <li><Link href="/dashboard">{t.dashboard}</Link></li>
          <li><Link href="/products">{t.products}</Link></li>
          <li><Link href="/dashboard/admin/products">{t.manageProducts}</Link></li>
          <li><Link href="/dashboard/admin/users">{t.manageUsers}</Link></li>
          <li><Link href="/profile">{t.profile}</Link></li>
        </>
      );
    }

    return (
      <>
        <li><Link href="/">{t.home}</Link></li>
        <li><Link href="/dashboard">{t.dashboard}</Link></li>
        <li><Link href="/products">{t.products}</Link></li>
        <li><Link href="/dashboard/client/products">{t.myProducts}</Link></li>
        <li><Link href="/profile">{t.profile}</Link></li>
      </>
    );
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center relative z-50">
      {/* Logo */}
      <div className="text-xl font-bold">سايكل</div>

      {/* Desktop menu */}
      <ul className="hidden md:flex space-x-6 items-center">
        {renderLinks()}
      </ul>

      {/* Controls (Language + Hamburger) */}
      <div className="flex items-center space-x-3 z-50">


        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col space-y-1"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
          <span className="w-6 h-0.5 bg-white"></span>
        </button>

                {/* Lang Button ثابت */}
        <button
          onClick={toggleLang}
          className="bg-gray-700 gap-20 px-2 py-1 rounded hover:bg-gray-600"
        >
          {lang === "en" ? "AR" : "EN"}
        </button>

      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <ul className="absolute top-full left-0 w-full bg-gray-900 flex flex-col space-y-4 px-6 py-4 md:hidden z-40">
          {renderLinks()}
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
