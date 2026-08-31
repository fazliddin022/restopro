"use client";

import { useEffect, useState, useCallback } from "react";
import { CreditCard, DollarSign, TrendingUp, Clock, Check } from "lucide-react";

type OrderItem = {
  id: string;
  status: string;
  totalPrice: number;
  paymentStatus: string;
  paymentMethod: string | null;
  createdAt: string;
  tableNumber: number;
};

export default function PaymentsPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    const res = await fetch("/api/orders");
    const data = await res.json();
    setOrders(data.filter((o: OrderItem) => o.status === "served" || o.paymentStatus === "paid"));
    setLoading(false);
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handlePayment = async (id: string, method: string) => {
    setUpdating(id);
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "served", paymentStatus: "paid", paymentMethod: method }),
    });
    setOrders(orders.map((o) => o.id === id ? { ...o, paymentStatus: "paid", paymentMethod: method } : o));
    setUpdating(null);
  };

  const totalRevenue = orders.filter((o) => o.paymentStatus === "paid").reduce((s, o) => s + o.totalPrice, 0);
  const unpaidTotal = orders.filter((o) => o.paymentStatus === "unpaid").reduce((s, o) => s + o.totalPrice, 0);
  const paidCount = orders.filter((o) => o.paymentStatus === "paid").length;
  const unpaidCount = orders.filter((o) => o.paymentStatus === "unpaid").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-2">
          <CreditCard size={28} className="text-orange-400" />
          Payments
        </h1>
        <p className="text-gray-500 mt-1">Manage payments for served orders</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Revenue", value: `$${(totalRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { label: "Paid Orders", value: paidCount, icon: Check, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Unpaid Orders", value: unpaidCount, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
          { label: "Pending Amount", value: `$${(unpaidTotal / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        ].map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Unpaid orders */}
      {unpaidCount > 0 && (
        <div>
          <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
            <Clock size={18} className="text-yellow-400" /> Awaiting Payment
          </h2>
          <div className="space-y-3">
            {orders.filter((o) => o.paymentStatus === "unpaid").map((order) => (
              <div key={order.id} className="bg-gray-900 rounded-2xl border border-yellow-500/30 p-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div>
                    <p className="font-black text-white text-xl">Table #{order.tableNumber}</p>
                    <p className="text-gray-500 text-sm">{new Date(order.createdAt).toLocaleTimeString()}</p>
                  </div>
                  <p className="text-3xl font-black text-white">${(order.totalPrice / 1000).toFixed(0)}k</p>
                  <div className="flex gap-2">
                    {["cash", "card", "online"].map((method) => (
                      <button key={method} onClick={() => handlePayment(order.id, method)} disabled={updating === order.id}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold capitalize bg-orange-500/20 text-orange-400 border border-orange-500/30 hover:bg-orange-500/30 disabled:opacity-50 transition-all">
                        {updating === order.id ? "..." : method}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid orders */}
      <div>
        <h2 className="text-lg font-black text-white mb-3 flex items-center gap-2">
          <Check size={18} className="text-green-400" /> Paid Orders
        </h2>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="bg-gray-900 rounded-2xl border border-white/5 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5 bg-white/3">
                  {["Table", "Amount", "Method", "Time"].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.filter((o) => o.paymentStatus === "paid").map((order, i) => (
                  <tr key={order.id} className={i < orders.filter((o) => o.paymentStatus === "paid").length - 1 ? "border-b border-white/5" : ""}>
                    <td className="px-5 py-4 font-bold text-white">Table #{order.tableNumber}</td>
                    <td className="px-5 py-4 font-black text-green-400">${(order.totalPrice / 1000).toFixed(0)}k</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 capitalize">
                        {order.paymentMethod || "cash"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}