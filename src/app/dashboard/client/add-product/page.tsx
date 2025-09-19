"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../context/i18n";
import { useUser } from "../../../context/UserContext";

type BannerMessage = {
  type: "success" | "error";
  text: string;
};

const AddProductPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { user } = useUser();
  const router = useRouter();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [loading, setLoading] = useState(false);

  if (!user) {
    router.replace("/login");
    return null;
  }

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const handleSubmit = async () => {
    if (!name || !description || !price || !category || !imageFile) {
      showBanner("error", t.fillAllFields || "اكمل كل البيانات!");
      return;
    }

    setLoading(true);
    try {
      // رفع الصورة على Cloudinary
      const formDataCloud = new FormData();
      formDataCloud.append("file", imageFile);
      formDataCloud.append("upload_preset", "unsigned_dashboard");
      formDataCloud.append("folder", "products");

      const cloudRes = await fetch(
        "https://api.cloudinary.com/v1_1/dfbadbos5/image/upload",
        { method: "POST", body: formDataCloud }
      );

      const cloudData: { secure_url?: string } = await cloudRes.json();

      if (!cloudRes.ok || !cloudData.secure_url)
        throw new Error(`Upload failed: ${JSON.stringify(cloudData)}`);

const ownerId = user!.userId;

if (!ownerId) {
  showBanner("error", "User ID not found. تأكد أنك مسجل دخول");
  setLoading(false);
  return;
}
      const bodyData = {
        name,
        description,
        price: parseFloat(price),
        category,
        ownerId,
        images: [cloudData.secure_url], // array لازم تبقى
        status: "pending",
        message: "",
        createdAt: new Date().toISOString(),
      };
console.log({
  name,
  description,
  price: parseFloat(price),
  category,
  ownerId,
  images: [cloudData.secure_url],
});

      const res = await fetch("/api/client/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add product");

      showBanner("success", t.productAdded || "تم إضافة المنتج بنجاح!");

      // إعادة تعيين الحقول
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setImageFile(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error";
      showBanner("error", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black py-12 px-4 flex justify-center items-center">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fadeIn">
        <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">{t.addProductTitle}</h2>

        {banner && (
          <div
            className={`mb-4 px-4 py-3 rounded ${
              banner.type === "success" ? "bg-emerald-500 text-white" : "bg-red-600 text-white"
            } animate-fadeIn`}
          >
            {banner.text}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">{t.Name}</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.namePlaceholder}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">{t.description}</label>
            <textarea
              className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.descriptionPlaceholder}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">{t.price}</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder={t.pricePlaceholder}
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">{t.category}</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1 focus:ring-2 focus:ring-blue-400 outline-none transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={t.categoryPlaceholder}
            />
          </div>

          <label className="flex flex-col items-center justify-center h-32 rounded-2xl border-2 border-dashed cursor-pointer mt-2">
            <span>{imageFile ? imageFile.name : "اضغط لاختيار صورة"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => e.target.files && setImageFile(e.target.files[0])}
            />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          {loading ? t.saving : t.submit}
        </button>
      </div>
    </div>
  );
};

export default AddProductPage;
