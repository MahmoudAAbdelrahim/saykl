"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../context/i18n";
import { useUser } from "../../../context/UserContext";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
type ProductItem = {
  _id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
  images: string[];
  owner?: {
    _id: string;
    name: string;
    email?: string;
  } | null;
  status: "pending" | "approved" | "rejected";
  message?: string;
  createdAt?: string | null;
};
type BannerMessage = {
  type: "success" | "error";
  text: string;
};
const PAGE_SIZE = 8;
const AdminProductsPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [editing, setEditing] = useState<ProductItem | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [busyAction, setBusyAction] = useState<boolean>(false);
  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
    else fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);
  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/products");
      const payload: { products?: ProductItem[]; error?: string } = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to fetch products");
      setProducts(payload.products || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Server error";
      setError(message);
      showBanner("error", message);
    } finally {
      setLoading(false);
    }
  };
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.owner?.name || "").toLowerCase().includes(q) ||
        String(p.price).toLowerCase().includes(q)
    );
  }, [products, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const stats = useMemo(() => {
    const total = products.length;
    const approved = products.filter(p => p.status === "approved").length;
    const pending = products.filter(p => p.status === "pending").length;
    const rejected = products.filter(p => p.status === "rejected").length;
    const categories = Array.from(new Set(products.map(p => p.category))).length;
    return { total, approved, pending, rejected, categories, byDay: buildByDay(products) };
  }, [products]);
  function buildByDay(list: ProductItem[]) {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toLocaleDateString("en-CA"), 0);
    }
    list.forEach(p => {
      if (!p.createdAt) return;
      const k = new Date(p.createdAt).toLocaleDateString("en-CA");
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }
  const openEdit = (p: ProductItem) => setEditing(p);
  const closeEdit = () => setEditing(null);
  const handleSave = async (payload: ProductItem) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload._id,
          name: payload.name,
          category: payload.category,
          price: payload.price,
          status: payload.status,
          message: payload.message ?? "",
        }),
      });
      const data: { product?: ProductItem; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.product) {
        setProducts(prev => prev.map(p => (p._id === data.product!._id ? data.product! : p)));
        closeEdit();
        const msg = data.product.status === "approved" ? t.productApproved : t.productRejected;
        showBanner("success", msg);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving";
      showBanner("error", message);
    } finally {
      setSaving(false);
    }
  };
  const handleDelete = async (id: string) => {
    if (!confirm(t.confirmDeleteProduct ?? "Delete this product?")) return;
    setBusyAction(true);
    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const data: { success?: boolean; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setProducts(prev => prev.filter(p => p._id !== id));
      showBanner("success", t.productDeleted ?? "Product deleted");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      showBanner("error", message);
    } finally {
      setBusyAction(false);
    }
  };
  const exportCSV = () => {
    const rows: string[][] = [["Name", "Category", "Price", "Owner", "Status", "CreatedAt"]];
    products.forEach(p => rows.push([p.name, p.category, String(p.price), p.owner?.name ?? "", p.status, p.createdAt ?? ""]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showBanner("success", t.csvExported ?? "CSV exported");
  };
  const renderMessage = (text: string, className: string) => <div className={`py-12 text-center ${className}`}>{text}</div>;
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Banner */}
        {banner && (
          <div className={`mb-4 px-4 py-3 rounded ${banner.type === "success" ? "bg-emerald-500 text-white" : "bg-red-600 text-white"}`}>
            {banner.text}
          </div>
        )}
        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white animate-fadeIn">{t.manageProductsTitle}</h1>
            <p className="text-sm text-slate-300 mt-1">{t.manageProductsSubtitle}</p>
          </div>
          <div></div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="px-4 py-2 rounded bg-white/8 text-white border border-white/10 hover:scale-105 transition">{t.backToDashboard}</Link>
            <button onClick={exportCSV} className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition">{t.exportCSV ?? "Export CSV"}</button>
            <button onClick={fetchProducts} className="px-4 py-2 rounded bg-white/6 text-white hover:scale-105 transition">{t.refresh ?? "Refresh"}</button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statTotalProducts}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.total}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statApproved}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.approved}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.rejected}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.rejected}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statPending}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.pending}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow">
            <span className="text-sm text-slate-300">{t.listingsTrend}</span>
            <div className="w-full h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byDay}>
                  <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60a5fa" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* Table container */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder={t.searchProductsPlaceholder}
                className="px-3 py-2 rounded bg-gray-50 border"
              />
              <div className="text-sm text-slate-500">{t.results}: {filtered.length}</div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => { setPage(1); setQuery(""); }} className="px-3 py-2 bg-white/6 rounded text-white">{t.clear}</button>
            </div>
          </div>
          {loading
            ? renderMessage("Loading...", "text-slate-400")
            : error
            ? renderMessage(error, "text-red-500")
            : products.length === 0
            ? renderMessage(t.noProducts, "text-slate-400")
            : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.image}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.name}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">{t.category}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.price}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 hidden md:table-cell">{t.owner}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.status}</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{t.message}</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pageItems.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50 transition-colors">
                        <td>
                        {p.images && p.images.length > 0 ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.images[0]} alt={p.name} className="w-16 h-12 object-cover rounded" />
                        ) : (
                          <span>{t.noImage}</span>
                        )}
                      </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-semibold text-gray-800">{p.name}</div>
                            <div className="text-xs text-slate-400 hidden sm:block">{p.description || "-"}</div>
                            <div className="text-xs text-slate-400 sm:hidden">{new Date(p.createdAt || "").toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{p.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">${Number(p.price).toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">{p.owner?.email?? "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{p.status}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{(p.message || p.status)}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => openEdit(p)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:scale-105 transition">{t.edit}</button>
                            <button onClick={() => handleDelete(p._id)} disabled={busyAction} className={"inline-flex items-center gap-2 px-3 py-1 rounded bg-red-100 text-red-800 hover:scale-105 transition" + (busyAction ? " opacity-60 cursor-not-allowed" : "")}>{t.delete}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-500">{t.showing} {(page - 1) * PAGE_SIZE + 1} - {Math.min(page * PAGE_SIZE, filtered.length)} {t.of} {filtered.length}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 rounded bg-white/6 text-white">{t.prev}</button>
                    <div className="px-3 py-1 text-white/90 bg-white/8 rounded">{page} / {pageCount}</div>
                    <button onClick={() => setPage(p => Math.min(pageCount, p + 1))} disabled={page === pageCount} className="px-3 py-1 rounded bg-white/6 text-white">{t.next}</button>
                  </div>
                </div>
              </>
            )}
        </div>
        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg animate-fadeIn">
              <h3 className="text-lg font-semibold mb-3">{t.editProduct}</h3>
              <label className="text-sm text-gray-600">{t.status}</label>
              <select className="w-full border rounded px-3 py-2 my-2" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value as ProductItem["status"] })}>
                <option value="pending">{t.pending}</option>
                <option value="approved">{t.approved}</option>
                <option value="rejected">{t.rejected}</option>
              </select>
              <label className="text-sm text-gray-600">{t.message}</label>
              <textarea className="w-full border rounded px-3 py-2 my-2" value={editing.message || ""} onChange={e => setEditing({ ...editing, message: e.target.value })} />
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={closeEdit} className="px-4 py-2 rounded border">{t.cancel}</button>
                <button onClick={() => handleSave(editing)} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">
                  {saving ? t.saving : t.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminProductsPage;
