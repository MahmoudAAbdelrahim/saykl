"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../context/LanguageContext";
import { translations } from "../context/i18n";
import { useUser } from "../context/UserContext";

type User = {
  name: string;
  email: string;
  phone?: string;
  role: "client" | "admin";
  userId: string;
};

const LoginPage = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { login } = useUser();

  // ✅ لو المستخدم مسجل دخول بالفعل
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      router.replace("/"); 
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // 🟢 ناخد الـ userId زي ما هو جاي من الـ API
        const loggedUser: User = {
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          role: data.user.role || "client",
          userId: data.user.userId || data.user._id || "", // ✅ هنا هنضمن انه يتسحب صح
        };

        // تخزين في localStorage + context
        localStorage.setItem("user", JSON.stringify(loggedUser));
        login(loggedUser);

        setMessage(t.loginSuccess);
        router.push("/");
      } else {
        setMessage(data.error || t.loginFailed);
      }
    } catch (err) {
      console.error(err);
      setMessage(t.serverError);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-gray-900 to-black">
      <div className="bg-white shadow-2xl rounded-xl p-10 w-full max-w-md animate-fadeIn">
        <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
          {t.login}
        </h1>

        <form className="space-y-5" onSubmit={handleSubmit}>
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

          {/* الباسورد */}
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
            {t.login}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-red-500 font-semibold">
            {message}
          </p>
        )}

        <p className="text-center mt-6 text-gray-500">
          {t.dontHaveAccount}{" "}
          <a href="/register" className="text-blue-500 hover:underline">
            {t.createAccount}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
