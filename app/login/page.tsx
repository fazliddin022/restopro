"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChefHat, Mail, Lock, Eye, EyeOff } from "lucide-react";

const DEMO_ROLES = [
  { email: "admin@restopro.com", password: "admin123", role: "Admin", color: "from-purple-500 to-pink-500" },
  { email: "chef@restopro.com", password: "chef123", role: "Chef", color: "from-orange-500 to-red-500" },
  { email: "cashier@restopro.com", password: "cashier123", role: "Cashier", color: "from-green-500 to-emerald-500" },
  { email: "waiter@restopro.com", password: "waiter123", role: "Waiter", color: "from-blue-500 to-cyan-500" },
];

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    if (res?.error) { setError("Invalid email or password!"); return; }
    router.push("/dashboard");
  };

  const fillDemo = (email: string, password: string) => {
    setForm({ email, password });
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-4xl relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">

        {/* Left — Branding */}
        <div className="hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <ChefHat size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">RestoPro</h1>
              <p className="text-gray-500 text-sm">Restaurant Management</p>
            </div>
          </div>

          <h2 className="text-4xl font-black text-white mb-4 leading-tight">
            Manage your restaurant <span className="text-orange-400">smarter</span>
          </h2>
          <p className="text-gray-400 mb-8">Tables, orders, kitchen, payments — all in one place.</p>

          {/* Features */}
          <div className="space-y-3">
            {[
              { icon: "🪑", text: "Table management & reservations" },
              { icon: "🍽️", text: "Real-time kitchen display" },
              { icon: "💳", text: "Fast payment processing" },
              { icon: "📊", text: "Sales analytics & reports" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5">
                <span className="text-xl">{f.icon}</span>
                <span className="text-sm text-gray-300">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Form */}
        <div>
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
              <ChefHat size={24} className="text-white" />
            </div>
            <h1 className="text-2xl font-black text-white">RestoPro</h1>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
            <h2 className="text-2xl font-black text-white mb-2">Welcome back!</h2>
            <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

            {/* Demo roles */}
            <div className="grid grid-cols-2 gap-2 mb-6">
              {DEMO_ROLES.map((r) => (
                <button key={r.role} onClick={() => fillDemo(r.email, r.password)}
                  className={`py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r ${r.color} opacity-80 hover:opacity-100 transition-all`}>
                  {r.role}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-600 text-center mb-6">Click a role to auto-fill credentials</p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com" onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input type={showPassword ? "text" : "password"} value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                    className="w-full pl-11 pr-11 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-gray-600 outline-none focus:border-orange-500/50 transition-all" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-sm text-red-400">{error}</div>
              )}

              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-2xl hover:from-orange-600 hover:to-red-700 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/20">
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}