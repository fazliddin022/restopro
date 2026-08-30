"use client";

import { useEffect, useState, useCallback } from "react";
import { ChefHat, Clock, Check, Bell, RefreshCw } from "lucide-react";

type KitchenOrder = {
  id: string;
  status: string;
  notes: string | null;
  createdAt: string;
  tableNumber: number;
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<KitchenOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.filter((o: KitchenOrder) => ["pending", "preparing"].includes(o.status)));
    setLastRefresh(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdate = async (id: string, status: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus: "unpaid" }),
    });
    setOrders(orders.filter((o) => o.id !== id || status === "preparing")
      .map((o) => o.id === id ? { ...o, status } : o));
    setUpdating(null);
    if (status === "ready") await fetchOrders();
  };

  const getElapsed = (date: string) => {
    const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    return mins;
  };

  const getUrgency = (mins: number) => {
    if (mins >= 20) return "border-red-500/50 bg-red-500/5";
    if (mins >= 10) return "border-yellow-500/50 bg-yellow-500/5";
    return "border-white/10 bg-gray-900";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ChefHat size={28} className="text-orange-400" />
            Kitchen Display
          </h1>
          <p className="text-gray-500 mt-1">
            Last updated: {lastRefresh.toLocaleTimeString()} · Auto-refresh every 10s
          </p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 px-4 py-2 bg-white/5 text-gray-400 rounded-xl hover:bg-white/10 transition-all text-sm font-medium">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="h-48 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-24 bg-gray-900 rounded-2xl border border-white/5">
          <ChefHat size={64} className="text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-black text-gray-500">No active orders</h2>
          <p className="text-gray-600 mt-2">Kitchen is clear! 🎉</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => {
            const elapsed = getElapsed(order.createdAt);
            return (
              <div key={order.id} className={`rounded-2xl border p-5 transition-all ${getUrgency(elapsed)}`}>
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-black text-white">Table #{order.tableNumber}</h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Clock size={13} className={elapsed >= 20 ? "text-red-400" : elapsed >= 10 ? "text-yellow-400" : "text-gray-500"} />
                      <span className={`text-sm font-bold ${elapsed >= 20 ? "text-red-400" : elapsed >= 10 ? "text-yellow-400" : "text-gray-500"}`}>
                        {elapsed} min ago
                      </span>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    order.status === "pending"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-orange-500/20 text-orange-400 border border-orange-500/30"
                  }`}>
                    {order.status === "pending" ? "⏳ Pending" : "🔥 Preparing"}
                  </span>
                </div>

                {order.notes && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 mb-4 text-sm text-yellow-300">
                    📝 {order.notes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 mt-4">
                  {order.status === "pending" && (
                    <button onClick={() => handleUpdate(order.id, "preparing")} disabled={updating === order.id}
                      className="flex-1 py-3 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-xl font-bold text-sm hover:bg-orange-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      <ChefHat size={16} />
                      {updating === order.id ? "..." : "Start Preparing"}
                    </button>
                  )}
                  {order.status === "preparing" && (
                    <button onClick={() => handleUpdate(order.id, "ready")} disabled={updating === order.id}
                      className="flex-1 py-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl font-bold text-sm hover:bg-green-500/30 disabled:opacity-50 transition-all flex items-center justify-center gap-2">
                      <Bell size={16} />
                      {updating === order.id ? "..." : "Mark Ready"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}