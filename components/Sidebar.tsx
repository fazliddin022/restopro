"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  ChefHat, LayoutDashboard, UtensilsCrossed,
  ClipboardList, CreditCard, Package,
  Users, LogOut, Coffee,
} from "lucide-react";

export default function Sidebar({ role, name }: { role: string; name: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["admin", "cashier", "waiter", "chef"] },
    { href: "/dashboard/tables", label: "Tables", icon: UtensilsCrossed, roles: ["admin", "cashier", "waiter"] },
    { href: "/dashboard/orders", label: "Orders", icon: ClipboardList, roles: ["admin", "cashier", "waiter"] },
    { href: "/dashboard/kitchen", label: "Kitchen", icon: ChefHat, roles: ["admin", "chef"] },
    { href: "/dashboard/menu", label: "Menu", icon: Coffee, roles: ["admin"] },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard, roles: ["admin", "cashier"] },
    { href: "/dashboard/inventory", label: "Inventory", icon: Package, roles: ["admin"] },
    { href: "/dashboard/staff", label: "Staff", icon: Users, roles: ["admin"] },
  ].filter((l) => l.roles.includes(role));

  const ROLE_COLORS: Record<string, string> = {
    admin: "text-purple-400 bg-purple-500/20",
    chef: "text-orange-400 bg-orange-500/20",
    cashier: "text-green-400 bg-green-500/20",
    waiter: "text-blue-400 bg-blue-500/20",
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-white/5 fixed top-0 left-0 bottom-0 flex flex-col z-40">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <ChefHat size={20} className="text-white" />
          </div>
          <div>
            <p className="font-black text-white">RestoPro</p>
            <p className="text-xs text-gray-500">Management</p>
          </div>
        </div>

        {/* User */}
        <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-white/5">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
            {name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{name}</p>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize ${ROLE_COLORS[role]}`}>
              {role}
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium no-underline transition-all ${
                active
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <link.icon size={18} />
              {link.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );
}