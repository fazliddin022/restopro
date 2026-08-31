"use client";

import { useEffect, useState, useCallback } from "react";
import { Coffee, Plus, X, Check, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type MenuItemType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  prepTime: number | null;
  calories: number | null;
  isAvailable: boolean | null;
  isPopular: boolean | null;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
};

type Category = { id: string; name: string; icon: string | null; };

const EMPTY_FORM = {
  name: "", description: "", price: "",
  prepTime: "10", categoryId: "", isAvailable: true, isPopular: false,
};

export default function MenuPage() {
  const [menuList, setMenuList] = useState<MenuItemType[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MenuItemType | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    const [mRes, cRes] = await Promise.all([
      fetch("/api/menu"),
      fetch("/api/categories"),
    ]);
    setMenuList(await mRes.json());
    setCategories(await cRes.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleOpen = (item?: MenuItemType) => {
    if (item) {
      setEditing(item);
      setForm({
        name: item.name,
        description: item.description || "",
        price: String(item.price),
        prepTime: String(item.prepTime || 10),
        categoryId: item.categoryId,
        isAvailable: item.isAvailable ?? true,
        isPopular: item.isPopular ?? false,
      });
    } else {
      setEditing(null);
      setForm(EMPTY_FORM);
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price) return;
    setSaving(true);
    try {
      if (editing) {
        const res = await fetch(`/api/menu/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setMenuList(menuList.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
      }
      setShowModal(false);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this menu item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    setMenuList(menuList.filter((m) => m.id !== id));
  };

  const handleToggle = async (item: MenuItemType) => {
    await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...item, isAvailable: !item.isAvailable }),
    });
    setMenuList(menuList.map((m) => m.id === item.id ? { ...m, isAvailable: !m.isAvailable } : m));
  };

  const filtered = activeCategory === "all" ? menuList : menuList.filter((m) => m.categoryName === activeCategory);
  const categoryNames = ["all", ...new Set(menuList.map((m) => m.categoryName))];
  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Coffee size={28} className="text-orange-400" />
            Menu
          </h1>
          <p className="text-gray-500 mt-1">{menuList.length} items</p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categoryNames.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 capitalize transition-all ${activeCategory === cat ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            {cat === "all" ? "All Items" : cat}
          </button>
        ))}
      </div>

      {/* Menu grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className={`bg-gray-900 rounded-2xl border p-4 transition-all ${item.isAvailable ? "border-white/5" : "border-white/5 opacity-50"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-white truncate">{item.name}</p>
                    {item.isPopular && <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full flex-shrink-0">🔥</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{item.categoryName}</p>
                  {item.description && <p className="text-xs text-gray-600 mt-1 line-clamp-1">{item.description}</p>}
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="font-black text-orange-400">${(item.price / 1000).toFixed(0)}k</p>
                <div className="flex gap-1">
                  <button onClick={() => handleToggle(item)}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all ${item.isAvailable ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-500"}`}>
                    {item.isAvailable ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleOpen(item)} className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {showModal && editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-xl">Edit Item</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-xl text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Item name *" className={inputClass} />
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" rows={2} className={`${inputClass} resize-none`} />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" className={inputClass} />
                <input type="number" value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} placeholder="Prep time (min)" className={inputClass} />
              </div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Available</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} className="w-4 h-4" />
                  <span className="text-sm text-gray-300">Popular</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-semibold text-gray-400">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}