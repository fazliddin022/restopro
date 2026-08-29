import { auth } from "@/lib/auth-config";
import { db } from "@/lib/db";
import { orders, tables, orderItems, staff } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import {
  UtensilsCrossed, ClipboardList, DollarSign,
  Users, TrendingUp, Clock, CheckCircle, AlertCircle,
} from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();

  const [allTables, allOrders, allStaff] = await Promise.all([
    db.select().from(tables),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
    db.select().from(staff),
  ]);

  const availableTables = allTables.filter((t) => t.status === "available").length;
  const occupiedTables = allTables.filter((t) => t.status === "occupied").length;
  const activeOrders = allOrders.filter((o) => ["pending", "preparing"].includes(o.status)).length;
  const todayRevenue = allOrders
    .filter((o) => o.paymentStatus === "paid" && new Date(o.createdAt!).toDateString() === new Date().toDateString())
    .reduce((s, o) => s + o.totalPrice, 0);

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    preparing: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    ready: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    served: "bg-green-500/20 text-green-400 border-green-500/30",
    cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const TABLE_STATUS_COLORS: Record<string, string> = {
    available: "bg-green-500/20 border-green-500/30",
    occupied: "bg-red-500/20 border-red-500/30",
    reserved: "bg-yellow-500/20 border-yellow-500/30",
    cleaning: "bg-blue-500/20 border-blue-500/30",
  };

  const stats = [
    { label: "Available Tables", value: availableTables, icon: UtensilsCrossed, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
    { label: "Occupied Tables", value: occupiedTables, icon: Users, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Active Orders", value: activeOrders, icon: ClipboardList, color: "text-orange-400", bg: "bg-orange-500/10", border: "border-orange-500/20" },
    { label: "Today's Revenue", value: `$${(todayRevenue / 1000).toFixed(0)}k`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">
          Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}, {session?.user?.name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-500 mt-1">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
            <div className="flex items-center justify-between mb-3">
              <s.icon size={20} className={s.color} />
              <TrendingUp size={14} className="text-gray-600" />
            </div>
            <p className="text-3xl font-black text-white">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table overview */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <UtensilsCrossed size={18} className="text-orange-400" />
            Table Overview
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {allTables.map((table) => (
              <div key={table.id}
                className={`rounded-xl border p-3 text-center ${TABLE_STATUS_COLORS[table.status]}`}>
                <p className="text-lg font-black text-white">{table.number}</p>
                <p className="text-xs text-gray-400">{table.capacity}p</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
            {[
              { color: "bg-green-500", label: "Available" },
              { color: "bg-red-500", label: "Occupied" },
              { color: "bg-yellow-500", label: "Reserved" },
              { color: "bg-blue-500", label: "Cleaning" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${l.color}`} />
                {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-gray-900 rounded-2xl border border-white/5 p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2">
            <ClipboardList size={18} className="text-orange-400" />
            Recent Orders
          </h2>
          {allOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No orders yet</div>
          ) : (
            <div className="space-y-2">
              {allOrders.slice(0, 6).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-white/3 border border-white/5">
                  <div>
                    <p className="text-sm font-semibold text-white">Order #{order.id.slice(0, 6).toUpperCase()}</p>
                    <p className="text-xs text-gray-500">${(order.totalPrice / 1000).toFixed(0)}k</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}