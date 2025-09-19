"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "../../../context/LanguageContext";
import { translations } from "../../../context/i18n";
import { useUser } from "../../../context/UserContext";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type UserItem = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: "admin" | "client";
  createdAt?: string;
};

type BannerMessage = {
  type: "success" | "error";
  text: string;
};

const PAGE_SIZE = 8;

const AdminUsersPage: React.FC = () => {
  const { lang } = useLanguage();
  const t = translations[lang];
  const { user } = useUser();
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(true);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<UserItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyAction, setBusyAction] = useState(false);

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role !== "admin") router.replace("/dashboard");
    else fetchUsers();
  }, [user]);

  const showBanner = (type: "success" | "error", text: string) => {
    setBanner({ type, text });
    setTimeout(() => setBanner(null), 4000);
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/users");
      const payload: { users?: UserItem[]; error?: string } = await res.json();
      if (!res.ok) throw new Error(payload.error || "Failed to fetch users");
      setUsers(payload.users || []);
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
    if (!q) return users;
    return users.filter(
      u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const total = users.length;
    const admins = users.filter(u => u.role === "admin").length;
    const clients = total - admins;
    return { total, admins, clients, byDay: buildByDay(users) };
  }, [users]);

  function buildByDay(list: UserItem[]) {
    const map = new Map<string, number>();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toLocaleDateString("en-CA"), 0);
    }
    list.forEach(u => {
      if (!u.createdAt) return;
      const k = new Date(u.createdAt).toLocaleDateString("en-CA");
      if (map.has(k)) map.set(k, (map.get(k) || 0) + 1);
    });
    return Array.from(map.entries()).map(([date, count]) => ({ date, count }));
  }

  const openEdit = (u: UserItem) => setEditing(u);
  const closeEdit = () => setEditing(null);

  const handleSave = async (payload: UserItem) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload._id,
          name: payload.name,
          email: payload.email,
          phone: payload.phone,
          role: payload.role,
        }),
      });
      const data: { user?: UserItem; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      if (data.user) {
        setUsers(prev => prev.map(u => (u._id === data.user!._id ? data.user! : u)));
        closeEdit();
        showBanner("success", t.userSaved ?? "User saved successfully");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error saving";
      showBanner("error", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyAction(true);
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, { method: "DELETE" });
      const data: { success?: boolean; error?: string } = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setUsers(prev => prev.filter(u => u._id !== id));
      showBanner("success", t.userDeleted ?? "User deleted successfully");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Delete failed";
      showBanner("error", message);
    } finally {
      setBusyAction(false);
    }
  };

  const exportCSV = () => {
    const rows = [["Name", "Email", "Phone", "Role", "CreatedAt"]];
    users.forEach(u => rows.push([u.name, u.email, u.phone ?? "", u.role, u.createdAt ?? ""]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showBanner("success", t.csvExported ?? "CSV exported successfully");
  };

  const renderMessage = (text: string, className: string) => (
    <div className={`py-12 text-center ${className}`}>{text}</div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-black py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Banner */}
        {banner && (
          <div className={`mb-4 px-4 py-3 rounded ${banner.type === "success" ? "bg-emerald-500 text-white" : "bg-red-600 text-white"}`}>
            {banner.text}
          </div>
        )}
        {/* Page Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white animate-fadeIn">{t.manageUsersTitle}</h1>
            <p className="text-sm text-slate-300 mt-1">{t.manageUsersSubtitle}</p>
          </div>
          <div></div>
          <div className="flex items-center gap-1">
            <Link href="/dashboard" className="px-4 py-2 rounded bg-white/8 text-white border border-white/10 hover:scale-105 transition">{t.backToDashboard}</Link>
            <button onClick={exportCSV} className="px-4 py-2 rounded bg-emerald-500 text-white hover:bg-emerald-600 transition">{t.exportCSV ?? "Export CSV"}</button>
            <button onClick={fetchUsers} className="px-4 py-2 rounded bg-white/6 text-white hover:scale-105 transition">{t.refresh ?? "Refresh"}</button>
          </div>
        </div>
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statTotalUsers}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.total}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statAdmins}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.admins}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow flex flex-col">
            <span className="text-sm text-slate-300">{t.statClients}</span>
            <span className="text-2xl font-bold text-white mt-2">{stats.clients}</span>
          </div>
          <div className="bg-white/5 border border-white/6 rounded-lg p-4 shadow">
            <span className="text-sm text-slate-300">{t.signupTrend}</span>
            <div className="w-full h-20">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byDay}>
                  <XAxis dataKey="date" tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#cbd5e1", fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#60a5fa" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Table */}
        <div className="bg-white rounded-xl p-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <input
                value={query}
                onChange={e => { setQuery(e.target.value); setPage(1); }}
                placeholder={t.searchPlaceholder}
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
            : users.length === 0
            ? renderMessage(t.noUsers, "text-slate-400")
            : (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.name}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.email}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 hidden sm:table-cell">{t.phone}</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">{t.role}</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {pageItems.map(u => (
                        <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">{u.name.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="text-sm font-semibold text-gray-800">{u.name}</div>
                                <div className="text-xs text-slate-400">{new Date(u.createdAt || "").toLocaleDateString(lang === "ar" ? "ar-EG" : "en-US")}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{u.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 hidden sm:table-cell">{u.phone || "-"}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{u.role}</td>
                          <td className="px-4 py-3 text-right space-x-2">
                            <button onClick={() => openEdit(u)} className="inline-flex items-center gap-2 px-3 py-1 rounded bg-yellow-100 text-yellow-800 hover:scale-105 transition">{t.edit}</button>
                            <button onClick={() => handleDelete(u._id)} disabled={busyAction} className={"inline-flex items-center gap-2 px-3 py-1 rounded bg-red-100 text-red-800 hover:scale-105 transition" + (busyAction ? " opacity-60 cursor-not-allowed" : "")}>{t.delete}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-slate-500">{t.showing} {(page-1)*PAGE_SIZE+1} - {Math.min(page*PAGE_SIZE, filtered.length)} {t.of} {filtered.length}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="px-3 py-1 rounded bg-white/6 text-white">{t.prev}</button>
                    <div className="px-3 py-1 text-white/90 bg-white/8 rounded">{page} / {pageCount}</div>
                    <button onClick={() => setPage(p => Math.min(pageCount,p+1))} disabled={page===pageCount} className="px-3 py-1 rounded bg-white/6 text-white">{t.next}</button>
                  </div>
                </div>
              </>
            )}
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-lg animate-fadeIn">
              <h3 className="text-lg font-semibold mb-3">{t.editUser}</h3>
              <label className="text-sm text-gray-600">{t.name}</label>
              <input className="w-full border rounded px-3 py-2 my-2" value={editing.name} onChange={e => setEditing({...editing, name:e.target.value})} />
              <label className="text-sm text-gray-600">{t.email}</label>
              <input className="w-full border rounded px-3 py-2 my-2" value={editing.email} onChange={e => setEditing({...editing, email:e.target.value})} />
              <label className="text-sm text-gray-600">{t.phone}</label>
              <input className="w-full border rounded px-3 py-2 my-2" value={editing.phone||""} onChange={e => setEditing({...editing, phone:e.target.value})} />
              <label className="text-sm text-gray-600">{t.role}</label>
              <select className="w-full border rounded px-3 py-2 my-2" value={editing.role} onChange={e => setEditing({...editing, role:e.target.value as "admin"|"client"})}>
                <option value="client">{t.client}</option>
                <option value="admin">{t.admin}</option>
              </select>
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={closeEdit} className="px-4 py-2 rounded border">{t.cancel}</button>
                <button onClick={() => handleSave(editing)} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">{saving ? t.saving : t.save}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsersPage;
