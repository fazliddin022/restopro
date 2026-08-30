"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Plus, Minus, ShoppingCart, X, Check, Search } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  prepTime: number | null;
  isPopular: boolean | null;
  categoryId: string;
  categoryName: string;
  categoryIcon: string | null;
};

type Table = { id: string; number: number; capacity: number; status: string; };
type CartItem = { menuItem: MenuItem; quantity: number; notes: string; };

function NewOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTableId = searchParams.get("tableId");

  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [tableList, setTableList] = useState<Table[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTableId, setSelectedTableId] = useState(preselectedTableId || "");
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [placing, setPlacing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetch("/api/menu").then((r) => r.json()), fetch("/api/tables").then((r) => r.json())])
      .then(([menu, tables]) => {
        setMenuList(menu);
        setTableList(tables.filter((t: Table) => t.status === "available" || t.id === preselectedTableId));
        setLoading(false);
      });
  }, [preselectedTableId]);

  const categories = ["all", ...new Set(menuList.map((m) => m.categoryName))];
  const filtered = menuList.filter((m) => {
    const matchCat = activeCategory === "all" || m.categoryName === activeCategory;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === item.id);
      if (existing) return prev.map((c) => c.menuItem.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { menuItem: item, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItem.id === id);
      if (existing?.quantity === 1) return prev.filter((c) => c.menuItem.id !== id);
      return prev.map((c) => c.menuItem.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  };

  const getQty = (id: string) => cart.find((c) => c.menuItem.id === id)?.quantity || 0;
  const total = cart.reduce((s, c) => s + c.menuItem.price * c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!selectedTableId || cart.length === 0) return;
    setPlacing(true);
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId: selectedTableId,
          notes: orderNotes,
          items: cart.map((c) => ({
            menuItemId: c.menuItem.id,
            quantity: c.quantity,
            price: c.menuItem.price,
            name: c.menuItem.name,
            notes: c.notes,
          })),
        }),
      });
      router.push("/dashboard/orders");
    } finally { setPlacing(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-500">Loading menu...</div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-white">New Order</h1>
        <button onClick={() => router.back()} className="px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 text-sm font-medium transition-all">
          Cancel
        </button>
      </div>

      {/* Table select */}
      <div className="bg-gray-900 rounded-2xl border border-white/5 p-4">
        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Select Table *</label>
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
          {tableList.map((t) => (
            <button key={t.id} onClick={() => setSelectedTableId(t.id)}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                selectedTableId === t.id
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "bg-white/5 text-gray-400 hover:bg-white/10"
              }`}>
              #{t.number}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Menu */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + Categories */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search menu..."
                className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-all" />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 capitalize transition-all ${activeCategory === cat ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map((item) => {
              const qty = getQty(item.id);
              return (
                <div key={item.id} className={`bg-gray-900 rounded-2xl border p-4 transition-all ${qty > 0 ? "border-orange-500/50" : "border-white/5 hover:border-white/10"}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-white text-sm truncate">{item.name}</p>
                        {item.isPopular && <span className="text-xs bg-orange-500/20 text-orange-400 px-1.5 py-0.5 rounded-full flex-shrink-0">🔥</span>}
                      </div>
                      {item.description && <p className="text-xs text-gray-500 line-clamp-1 mb-2">{item.description}</p>}
                      <div className="flex items-center justify-between">
                        <p className="font-black text-orange-400">${(item.price / 1000).toFixed(0)}k</p>
                        {item.prepTime && <span className="text-xs text-gray-600">{item.prepTime} min</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2 mt-3">
                    {qty > 0 ? (
                      <div className="flex items-center gap-2">
                        <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                          <Minus size={14} />
                        </button>
                        <span className="font-black text-white w-6 text-center">{qty}</span>
                        <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600 transition-all">
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => addToCart(item)} className="flex items-center gap-1.5 px-4 py-1.5 bg-orange-500/20 text-orange-400 rounded-xl text-xs font-bold hover:bg-orange-500/30 transition-all">
                        <Plus size={13} /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cart */}
        <div>
          <div className="bg-gray-900 rounded-2xl border border-white/5 p-5 sticky top-8">
            <h2 className="font-black text-white text-xl mb-4 flex items-center gap-2">
              <ShoppingCart size={20} className="text-orange-400" />
              Order ({cart.reduce((s, c) => s + c.quantity, 0)} items)
            </h2>

            {cart.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <ShoppingCart size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">No items added</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                  {cart.map((item) => (
                    <div key={item.menuItem.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{item.menuItem.name}</p>
                        <p className="text-xs text-orange-400 font-bold">${(item.menuItem.price * item.quantity / 1000).toFixed(0)}k</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => removeFromCart(item.menuItem.id)} className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                          <Minus size={11} />
                        </button>
                        <span className="text-sm font-bold text-white w-5 text-center">{item.quantity}</span>
                        <button onClick={() => addToCart(item.menuItem)} className="w-6 h-6 rounded-lg bg-orange-500 flex items-center justify-center text-white hover:bg-orange-600">
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <textarea value={orderNotes} onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Order notes (optional)..." rows={2}
                  className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none resize-none mb-4" />

                <div className="flex justify-between text-sm mb-4 pt-3 border-t border-white/5">
                  <span className="text-gray-500">Total</span>
                  <span className="font-black text-white text-lg">${(total / 1000).toFixed(0)}k</span>
                </div>

                <button onClick={handlePlaceOrder} disabled={placing || !selectedTableId}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                  <Check size={18} />
                  {placing ? "Placing..." : "Place Order"}
                </button>
                {!selectedTableId && <p className="text-xs text-red-400 text-center mt-2">Please select a table first</p>}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewOrderPage() {
  return (
    <Suspense fallback={<div className="text-gray-500 text-center py-16">Loading...</div>}>
      <NewOrderContent />
    </Suspense>
  );
}