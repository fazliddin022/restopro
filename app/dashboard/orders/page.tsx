"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, Plus, Clock, ChefHat, Bell, Check, X, DollarSign } from "lucide-react";

type OrderItem = {
  id: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  notes: string | null;
  createdAt: string;
  tableId: string;
  tableNumber: number;
  tableCapacity: number;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ElementType }> = {
  pending: { label: "Pending", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30", icon: Clock },
  preparing: { label: "Preparing", color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/30", icon: ChefHat },
  ready: { label: "Ready", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30", icon: Bell },
  served: { label: "Served", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30", icon: Check },
  cancelled: { label: "Cancelled", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30", icon: X },
};

const NEXT_STATUS: Record<string, string> = {
  pending: "preparing",
  preparing: "ready",
  ready: "served",
};

export default function OrdersPage() {
  const router = useRouter();
  const [orderList, setOrderList] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    setOrderList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const handleUpdate = async (id: string, status: string, paymentStatus?: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, paymentStatus: paymentStatus || "unpaid" }),
    });
    setOrderList(orderList.map((o) => o.id === id ? { ...o, status, paymentStatus: paymentStatus || o.paymentStatus } : o));
    setUpdating(null);
  };

  const filtered = filterStatus === "all" ? orderList : orderList.filter((o) => o.status === filterStatus);
  const formatTime = (date: string) => {
    const diff = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <ClipboardList size={28} className="text-orange-400" />
            Orders
          </h1>
          <p className="text-gray-500 mt-1">{orderList.length} total orders</p>
        </div>
        <button onClick={() => router.push("/dashboard/orders/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-orange-500/20">
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Status stats */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button onClick={() => setFilterStatus("all")}
          className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all ${filterStatus === "all" ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          All ({orderList.length})
        </button>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
          const count = orderList.filter((o) => o.status === key).length;
          return (
            <button key={key} onClick={() => setFilterStatus(key)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap flex-shrink-0 transition-all ${filterStatus === key ? `${cfg.bg} ${cfg.color} border ${cfg.border}` : "bg-white/5 text-gray-400 hover:text-white"}`}>
              {cfg.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Orders list */}
      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-gray-900 rounded-2xl border border-white/5">
          <ClipboardList size={48} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => {
            const cfg = STATUS_CONFIG[order.status];
            const Icon = cfg.icon;
            const nextStatus = NEXT_STATUS[order.status];
            return (
              <div key={order.id} className={`bg-gray-900 rounded-2xl border ${cfg.border} p-5`}>
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <Icon size={20} className={cfg.color} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-black text-white text-lg">Table #{order.tableNumber}</p>
                        <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${cfg.border} ${cfg.bg} ${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm">{formatTime(order.createdAt)} · {order.tableCapacity} seats</p>
                      <p className="text-white font-bold mt-1">${(order.totalPrice / 1000).toFixed(0)}k</p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    {nextStatus && (
                      <button onClick={() => handleUpdate(order.id, nextStatus)} disabled={updating === order.id}
                        className={`px-4 py-2 rounded-xl text-sm font-bold ${STATUS_CONFIG[nextStatus].bg} ${STATUS_CONFIG[nextStatus].color} border ${STATUS_CONFIG[nextStatus].border} hover:opacity-80 disabled:opacity-50 transition-all`}>
                        {updating === order.id ? "..." : `Mark ${STATUS_CONFIG[nextStatus].label}`}
                      </button>
                    )}
                    {order.status === "served" && order.paymentStatus === "unpaid" && (
                      <button onClick={() => handleUpdate(order.id, "served", "paid")} disabled={updating === order.id}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-green-500/20 text-green-400 border border-green-500/30 hover:opacity-80 disabled:opacity-50">
                        <DollarSign size={14} className="inline mr-1" />
                        Mark Paid
                      </button>
                    )}
                    {order.status !== "served" && order.status !== "cancelled" && (
                      <button onClick={() => handleUpdate(order.id, "cancelled")} disabled={updating === order.id}
                        className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:opacity-80">
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}