"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Wrench, ShieldAlert, Zap, Factory,
  MessageSquare, BarChart3, LogOut, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { href: "/dashboard",   icon: LayoutDashboard, label: "Dashboard",   badge: null },
  { href: "/maintenance", icon: Wrench,          label: "Maintenance",  badge: "3" },
  { href: "/safety",      icon: ShieldAlert,     label: "Safety",       badge: "!" },
  { href: "/energy",      icon: Zap,             label: "Energy",       badge: null },
  { href: "/production",  icon: Factory,         label: "Production",   badge: null },
  { href: "/chat",        icon: MessageSquare,   label: "AI Assistant", badge: null },
  { href: "/reports",     icon: BarChart3,       label: "Reports",      badge: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState<{ name: string; role: string; email: string } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const u = localStorage.getItem("apis_user");
      if (u) setUser(JSON.parse(u));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("apis_token");
    localStorage.removeItem("apis_user");
    router.push("/login");
  };

  return (
    <aside
      className={`flex flex-col h-screen bg-surface-50 border-r border-card-border/40 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-card-border/40">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-steel-500 to-steel-700 flex items-center justify-center flex-shrink-0 glow-steel">
          <span className="text-white font-bold text-xs">TS</span>
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-white truncate">Tata Steel</div>
            <div className="text-xs text-steel-400 font-medium">APIS Platform</div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="ml-auto text-muted-foreground hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* System Status */}
      {!collapsed && (
        <div className="mx-3 my-3 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/20">
          <div className="flex items-center gap-2">
            <div className="status-dot-green" />
            <span className="text-xs text-green-400 font-medium">All Systems Operational</span>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-2 py-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, badge }) => {
          const active = pathname === href || pathname.startsWith(href);
          return (
            <Link href={href} key={href}>
              <div
                className={`nav-item ${active ? "active" : ""} ${collapsed ? "justify-center px-2" : ""}`}
                title={collapsed ? label : undefined}
              >
                <Icon size={18} className={active ? "text-steel-400" : ""} />
                {!collapsed && (
                  <span className="flex-1">{label}</span>
                )}
                {!collapsed && badge && (
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    badge === "!" ? "bg-red-500 text-white" : "bg-amber-500/20 text-amber-400"
                  }`}>
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-card-border/40 p-2 space-y-1">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-card/40">
            <div className="w-7 h-7 rounded-full bg-steel-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {user.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.role}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`nav-item w-full hover:bg-red-500/10 hover:text-red-400 ${collapsed ? "justify-center px-2" : ""}`}
        >
          <LogOut size={16} />
          {!collapsed && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
}
