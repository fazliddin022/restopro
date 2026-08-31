"use client";

import { useEffect, useState, useCallback } from "react";
import { Users, Plus, X, Check, Trash2, Mail, Phone } from "lucide-react";

type StaffMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  isActive: boolean | null;
  createdAt: string;
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  chef: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  cashier: "bg-green-500/20 text-green-400 border-green-500/30",
  waiter: "bg-blue-500/20 text-blue-400 border-blue-500/30",
};

const EMPTY_FORM = { name: "", email: "", password: "", phone: "", role: "waiter" };

export default function StaffPage() {
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    const res = await fetch("/api/staff");
    setStaffList(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    try {
      await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchStaff();
      setShowModal(false);
      setForm(EMPTY_FORM);
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this staff member?")) return;
    await fetch(`/api/staff/${id}`, { method: "DELETE" });
    setStaffList(staffList.filter((s) => s.id !== id));
  };

  const inputClass = "w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-all";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Users size={28} className="text-orange-400" />
            Staff
          </h1>
          <p className="text-gray-500 mt-1">{staffList.length} team members</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:opacity-90 shadow-lg shadow-orange-500/20">
          <Plus size={16} /> Add Staff
        </button>
      </div>

      {/* Role stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {["admin", "chef", "cashier", "waiter"].map((role) => (
          <div key={role} className={`rounded-xl border p-4 capitalize ${ROLE_COLORS[role]}`}>
            <p className="text-2xl font-black">{staffList.filter((s) => s.role === role).length}</p>
            <p className="text-xs mt-0.5 opacity-70">{role}s</p>
          </div>
        ))}
      </div>

      {/* Staff grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-36 bg-white/5 rounded-2xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map((member) => (
            <div key={member.id} className="bg-gray-900 rounded-2xl border border-white/5 p-5 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white font-black text-xl">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-white">{member.name}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border capitalize ${ROLE_COLORS[member.role]}`}>
                      {member.role}
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDelete(member.id)} className="p-1.5 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-2"><Mail size={12} />{member.email}</div>
                {member.phone && <div className="flex items-center gap-2"><Phone size={12} />{member.phone}</div>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-3xl p-6 w-full max-w-md border border-white/10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-black text-white text-xl">Add Staff Member</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-white/5 rounded-xl text-gray-400"><X size={16} /></button>
            </div>
            <div className="space-y-3">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name *" className={inputClass} />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email *" className={inputClass} />
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password (default: staff123)" className={inputClass} />
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone" className={inputClass} />
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Role</label>
                <div className="grid grid-cols-2 gap-2">
                  {["admin", "chef", "cashier", "waiter"].map((role) => (
                    <button key={role} onClick={() => setForm({ ...form, role })}
                      className={`py-2.5 rounded-xl text-sm font-bold capitalize border transition-all ${
                        form.role === role ? ROLE_COLORS[role] : "border-white/10 text-gray-500"
                      }`}>
                      {role}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-3 bg-white/5 rounded-xl text-sm font-semibold text-gray-400">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.name || !form.email}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2">
                <Check size={16} /> {saving ? "Adding..." : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}