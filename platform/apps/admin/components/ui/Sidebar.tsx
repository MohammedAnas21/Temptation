"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Calendar, Grid3X3, ShoppingBag, Users,
  CreditCard, Tag, Megaphone, BarChart3, UtensilsCrossed,
  UserCog, LogOut, Shield, Download,
} from "lucide-react";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";

const NAV = [
  { section: "Operations" },
  { href: "/",              label: "Overview",          icon: LayoutDashboard },
  { href: "/reservations", label: "Reservations",      icon: Calendar },
  { href: "/tables",       label: "Tables",            icon: Grid3X3 },
  { href: "/orders",       label: "Orders",            icon: ShoppingBag },
  { section: "Business" },
  { href: "/customers",    label: "Customers (CRM)",   icon: Users },
  { href: "/payments",     label: "Payments",          icon: CreditCard },
  { href: "/offers",       label: "Offers & Coupons",  icon: Tag },
  { href: "/campaigns",    label: "Campaigns",         icon: Megaphone },
  { section: "Content" },
  { href: "/menu",         label: "Menu Management",   icon: UtensilsCrossed },
  { href: "/analytics",    label: "Analytics",         icon: BarChart3 },
  { section: "Admin" },
  { href: "/staff",        label: "Staff",             icon: UserCog },
  { href: "/audit-logs",   label: "Audit Logs",        icon: Shield },
  { href: "/exports",      label: "Data Exports",      icon: Download },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  return (
    <aside className="w-60 min-h-screen bg-[#052A16] flex flex-col border-r border-[#F0CC8D]/10 shrink-0">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-[#F0CC8D]/10">
        <p className="text-[#F0CC8D] font-black text-base tracking-[0.25em]">TEMPTATIONS</p>
        <p className="text-[#F0CC8D]/40 text-[10px] tracking-wider mt-0.5">Admin Dashboard</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV.map((item, i) => {
          if ("section" in item) {
            return (
              <p key={i} className="text-[#F0CC8D]/30 text-[10px] font-bold uppercase tracking-widest px-2 pt-5 pb-1">
                {item.section}
              </p>
            );
          }
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-[#F0CC8D]/15 text-[#F0CC8D] border border-[#F0CC8D]/20"
                  : "text-white/60 hover:text-white/90 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#F0CC8D]/10">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-white/50 hover:text-red-400 hover:bg-red-400/10 transition-all"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
