// src/app/components/Navbar.tsx
"use client";

import Link from "next/link";
import React from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useUser } from "../context/UserContext";

// ✅ تعريف شكل المستخدم
interface User {
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "client";
  userId: string;
}

const Navbar = () => {
  const { lang, toggleLang } = useLanguage();
  const { user } = useUser(); // 🟢 بناخد الـ user من الـ Context
  const t = translations[lang];

  const renderLinks = () => {
    if (!user) {
      // 🚫 مش مسجل دخول
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
      // 👑 أدمن
      return (
        <>
          <li><Link href="/">{t.home}</Link></li>
          <li><Link href="/dashboard">{t.dashboard}</Link></li>
          <li><Link href="/products">{t.products}</Link></li>
          <li><Link href="/admin/products">{t.manageProducts}</Link></li>
          <li><Link href="/admin/users">{t.manageUsers}</Link></li>
          <li><Link href="/profile">{t.profile}</Link></li>
        </>
      );
    }

    // 👤 مستخدم عادي (client)
    return (
      <>
        <li><Link href="/">{t.home}</Link></li>
        <li><Link href="/dashboard">{t.dashboard}</Link></li>
        <li><Link href="/products">{t.products}</Link></li>
        <li><Link href="/my-products">{t.myProducts}</Link></li>
        <li><Link href="/profile">{t.profile}</Link></li>
      </>
    );
  };

  return (
    <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between items-center">
      <div className="text-xl font-bold">سايكل</div>
      <ul className="flex space-x-6">
        {renderLinks()}
        <li>
          <button
            onClick={toggleLang}
            className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600"
          >
            {lang === "en" ? "AR" : "EN"}
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;
