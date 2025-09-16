"use client";

import React, { useEffect, useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext";

interface User {
  name: string;
  email: string;
  phone: string;
  role: string;
  userId: string;
}

const ProfilePage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
const { logout } = useUser();

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      router.push("/login");
    }
  }, [router]);
const handleLogout = () => {
  logout(); // 🟢 يمسح من context + localStorage
  router.push("/login");
};

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {t.profile}
        </h1>

        <div className="space-y-4 text-gray-700">
          <p>
            <strong>{t.fullName}:</strong> {user.name}
          </p>
          <p>
            <strong>{t.email}:</strong> {user.email}
          </p>
          <p>
            <strong>{t.phone}:</strong> {user.phone}
          </p>

        </div>

        <button
          onClick={handleLogout}
          className="mt-6 w-full py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-all transform hover:scale-105"
        >
          {t.logout}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
