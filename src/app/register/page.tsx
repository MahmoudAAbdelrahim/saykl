"use client";

import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useRouter } from "next/navigation";
import { useUser } from "../context/UserContext"; // استدعاء الـ context

// ✅ تعريف الـ User هنا مباشرة
type User = {
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin";
  userId: string;
};

const RegisterPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const router = useRouter();
  const { login } = useUser(); // دالة تحديث المستخدم من الـ context

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (data.error) {
        setMessage(data.error);
        return;
      }

      setMessage(t.accountCreated);

      // ✅ نستخدم الـ type اللي فوق
      const newUser: User = {
        name,
        email,
        phone,
        role: "client",            // ثابتة كـ client
        userId: String(data.userId) // نحولها String احتياطي
      };

      // حفظ في localStorage + تحديث context
      localStorage.setItem("user", JSON.stringify(newUser));
      login(newUser);

      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      console.error(err);
      setMessage(t.serverError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {t.createAccount}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* الاسم الكامل */}
          <div className="relative">
            <input
              type="text"
              placeholder={t.fullName}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm">
              {t.fullName}
            </label>
          </div>

          {/* الايميل */}
          <div className="relative">
            <input
              type="email"
              placeholder={t.email}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm">
              {t.email}
            </label>
          </div>

          {/* رقم الهاتف */}
          <div className="relative">
            <input
              type="text"
              placeholder={t.phone}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm">
              {t.phone}
            </label>
          </div>

          {/* كلمة المرور */}
          <div className="relative">
            <input
              type="password"
              placeholder={t.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer h-12 w-full border-b-2 border-gray-300 text-gray-900 placeholder-transparent focus:outline-none focus:border-blue-500 transition-colors"
              required
            />
            <label className="absolute left-0 -top-3.5 text-gray-500 text-sm transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-base peer-focus:-top-3.5 peer-focus:text-blue-500 peer-focus:text-sm">
              {t.password}
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
          >
            {t.register}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-green-500 font-semibold">
            {message}
          </p>
        )}

        <p className="text-center mt-6 text-gray-500">
          {t.alreadyHaveAccount}{" "}
          <a href="/login" className="text-blue-500 hover:underline">
            {t.login}
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
