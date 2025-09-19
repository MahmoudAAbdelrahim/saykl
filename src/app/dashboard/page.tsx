// src/app/dashboard/page.tsx
"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useUser } from "../context/UserContext";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang]; // 🟢 كله من الترجمة
  const { user } = useUser();
  const router = useRouter();

  // لو مش مسجل → رجّعه على طول
  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen flex items-start justify-center bg-gradient-to-br from-blue-900 via-slate-900 to-black py-16">
      <div className="w-full max-w-5xl px-4">
        <div className="bg-white shadow-2xl rounded-xl p-8 animate-fadeIn">
          {/* الهيدر */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{t.dashboardTitle}</h1>
              <p className="text-gray-600 mt-1">{t.dashboardSubtitle}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-500">{t.welcomeLabel}</p>
                <p className="font-semibold text-gray-800">{user.name}</p>
              </div>
              <div className="hidden md:block w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow">
                {user.name?.charAt(0).toUpperCase() ?? "U"}
              </div>
            </div>
          </header>

          {/* المحتوى */}
          <main className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* اليسار */}
            <section className="col-span-1 md:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-white to-slate-50 border rounded-lg p-5 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  {t.quickActions}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <Link href="/dashboard/client/add-product" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
                    {t.addProduct}
                  </Link>

                  <Link href="/products" className="px-4 py-2 rounded-lg bg-gray-100 border text-gray-800 hover:bg-gray-200 transition">
                    {t.browseProducts}
                  </Link>

                  {user.role === "client" && (
                    <Link href="/dashboard/client/products" className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition">
                      {t.myProducts}
                    </Link>
                  )}

                  {user.role === "admin" && (
                    <>
                      <Link href="/dashboard/admin/products" className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition">
                        {t.manageProducts}
                      </Link>
                      <Link href="/dashboard/admin/users" className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition">
                        {t.manageUsers}
                      </Link>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <h3 className="text-lg font-medium text-gray-800 mb-2">{t.recentActivity}</h3>
                <p className="text-sm text-gray-600">{t.recentActivityHint}</p>
              </div>
            </section>

            {/* اليمين */}
            <aside className="col-span-1 space-y-6">
              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <p className="text-sm text-gray-500">{t.emailLabel}</p>
                <p className="font-semibold text-gray-800">{user.email}</p>

                {user.phone && (
                  <>
                    <p className="mt-3 text-sm text-gray-500">{t.phoneLabel}</p>
                    <p className="font-semibold text-gray-800">{user.phone}</p>
                  </>
                )}

                <div className="mt-4">
                  <p className="text-sm text-gray-500">{t.roleLabel}</p>
                  <p className="font-semibold text-gray-800 capitalize">{user.role}</p>
                </div>
              </div>

              <div className="bg-white border rounded-lg p-5 shadow-sm">
                <h4 className="text-sm text-gray-500">{t.help}</h4>
                <p className="text-sm text-gray-600 mt-2">{t.helpHint}</p>
              </div>
            </aside>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
