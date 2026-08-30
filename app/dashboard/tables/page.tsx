"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { UtensilsCrossed, Users, Plus, X, Check } from "lucide-react";

type Table = {
  id: string;
  number: number;
  capacity: number;
  status: string;
  floor: number;
  note: string | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  available: { label: "Available", color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/30" },
  occupied: { label: "Occupied", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/30" },
  reserved: { label: "Reserved", color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/30" },
  cleaning: { label: "Cleaning", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/30" },
};

export default function TablesPage() {
  const router = useRouter();
  const [tableList, setTableList] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [filterFloor, setFilterFloor] = useState(0);

  const fetchTables = useCallback(async () => {
    const res = await fetch("/api/tables");
    setTableList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

  const handleStatusChange = async (table: Table, status: string) => {
    await fetch(`/api/tables/${table.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setTableList(tableList.map((t) => t.id === table.id ? { ...t, status } : t));
    setSelectedTable(null);
  };

  const floors = [...new Set(tableList.map((t) => t.floor))].sort();
  const filtered = filterFloor === 0 ? tableList : tableList.filter((t) => t.floor === filterFloor);

  const stats = Object.entries(STATUS_CONFIG).map(([key, cfg]) => ({
    ...cfg,
    key,
    count: tableList.filter((t) => t.status === key).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <UtensilsCrossed size={28} className="text-orange-400" />
            Tables
          </h1>
          <p className="text-gray-500 mt-1">{tableList.length} tables total</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/orders/new")}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-orange-500/20"
        >
          <Plus size={16} /> New Order
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.key} className={`rounded-xl border ${s.border} ${s.bg} p-4 cursor-pointer`}>
            <p className={`text-2xl font-black ${s.color}`}>{s.count}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Floor filter */}
      <div className="flex gap-2">
        <button onClick={() => setFilterFloor(0)}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterFloor === 0 ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
          All Floors
        </button>
        {floors.map((f) => (
          <button key={f} onClick={() => setFilterFloor(f!)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterFloor === f ? "bg-orange-500 text-white" : "bg-white/5 text-gray-400 hover:text-white"}`}>
            Floor {f}
          </button>
        ))}
      </div>

      {/* Table grid */}
      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => <div key={i} className="h-28 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((table) => {
            const cfg = STATUS_CONFIG[table.status];
            return (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table)}
                className={`relative rounded-2xl border ${cfg.border} ${cfg.bg} p-4 text-center hover:scale-105 transition-all group`}
              >
                <div className={`text-3xl font-black ${cfg.color}`}>{table.number}</div>
                <div className="flex items-center justify-center gap-1 mt-2">
                  <Users size={12} className="text-gray-500" />
                  <span className="text-xs text-gray-500">{table.capacity}</span>
                </div>
                <div className={`text-xs font-semibold mt-1 ${cfg.color}`}>{cfg.label}</div>
                <div className="text-xs text-gray-600 mt-0.5">F{table.floor}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Table detail modal */}
      {selectedTable && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-sm border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-black text-white">Table #{selectedTable.number}</h2>
                <p className="text-gray-500 text-sm">Floor {selectedTable.floor} · {selectedTable.capacity} people</p>
              </div>
              <button onClick={() => setSelectedTable(null)} className="p-2 bg-white/5 rounded-xl text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className={`p-3 rounded-xl border ${STATUS_CONFIG[selectedTable.status].border} ${STATUS_CONFIG[selectedTable.status].bg} mb-5 text-center`}>
              <span className={`font-bold ${STATUS_CONFIG[selectedTable.status].color}`}>
                {STATUS_CONFIG[selectedTable.status].label}
              </span>
            </div>

            <div className="space-y-2 mb-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Change Status</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => handleStatusChange(selectedTable, key)}
                    disabled={selectedTable.status === key}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      selectedTable.status === key
                        ? `${cfg.border} ${cfg.bg} ${cfg.color} opacity-50 cursor-not-allowed`
                        : "border-white/10 text-gray-400 hover:bg-white/5"
                    }`}
                  >
                    {cfg.label}
                  </button>
                ))}
              </div>
            </div>

            {selectedTable.status === "available" && (
              <button
                onClick={() => { router.push(`/dashboard/orders/new?tableId=${selectedTable.id}`); setSelectedTable(null); }}
                className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 transition-all"
              >
                + New Order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}