import { useState, useRef } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import { logout } from "@/api/auth";
import { getProvinces } from "@/api/provinces";
import DiamondBackground from "@/components/DiamondBackground";
import type { Province } from "@/types";

// ── Chicken-eating-wheat SVG logo ─────────────────────────────────────────────
function ChickenLogo({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Poultry ERP logo"
    >
      {/* Wheat stalk */}
      <line x1="18" y1="56" x2="18" y2="28" stroke="#d4a017" strokeWidth="2" strokeLinecap="round" />
      {/* Wheat grains left */}
      <ellipse cx="13" cy="44" rx="4" ry="2.5" fill="#d4a017" transform="rotate(-30 13 44)" />
      <ellipse cx="11" cy="37" rx="4" ry="2.5" fill="#d4a017" transform="rotate(-30 11 37)" />
      <ellipse cx="13" cy="30" rx="3.5" ry="2" fill="#d4a017" transform="rotate(-30 13 30)" />
      {/* Wheat grains right */}
      <ellipse cx="23" cy="44" rx="4" ry="2.5" fill="#d4a017" transform="rotate(30 23 44)" />
      <ellipse cx="25" cy="37" rx="4" ry="2.5" fill="#d4a017" transform="rotate(30 25 37)" />
      <ellipse cx="23" cy="30" rx="3.5" ry="2" fill="#d4a017" transform="rotate(30 23 30)" />
      {/* Wheat top */}
      <ellipse cx="18" cy="25" rx="3" ry="5" fill="#d4a017" />

      {/* Chicken body */}
      <ellipse cx="42" cy="42" rx="13" ry="10" fill="#f5a623" />
      {/* Chicken head */}
      <circle cx="52" cy="32" r="7" fill="#f5a623" />
      {/* Beak (pointing left toward wheat) */}
      <polygon points="45,31 45,34 40,32.5" fill="#e8720c" />
      {/* Eye */}
      <circle cx="53" cy="30" r="1.5" fill="#2a1508" />
      <circle cx="53.5" cy="29.5" r="0.5" fill="white" />
      {/* Comb */}
      <path d="M50 25 Q52 22 54 25 Q56 22 58 25" stroke="#e8720c" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Wattle */}
      <ellipse cx="47" cy="35" rx="2" ry="3" fill="#e8720c" />
      {/* Wing */}
      <path d="M32 38 Q38 32 48 36" stroke="#e07b10" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Tail feathers */}
      <path d="M29 40 Q24 34 26 28" stroke="#e07b10" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M29 42 Q22 38 22 32" stroke="#f5a623" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M30 44 Q24 42 25 36" stroke="#d4a017" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Legs */}
      <line x1="38" y1="51" x2="36" y2="58" stroke="#e8720c" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="52" x2="43" y2="59" stroke="#e8720c" strokeWidth="2" strokeLinecap="round" />
      {/* Feet */}
      <line x1="36" y1="58" x2="32" y2="60" stroke="#e8720c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="36" y1="58" x2="36" y2="62" stroke="#e8720c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="59" x2="39" y2="61" stroke="#e8720c" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="43" y1="59" x2="44" y2="63" stroke="#e8720c" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ── Nav item types ────────────────────────────────────────────────────────────
interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
  {
    to: "/farms",
    label: "Farms",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    to: "/employees",
    label: "Employees",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: "/chickens",
    label: "Chickens",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    to: "/feed",
    label: "Feed",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    to: "/finance",
    label: "Finance",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    to: "/provinces",
    label: "Provinces",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    ),
  },
  {
    to: "/reports",
    label: "Reports",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

const adminNavItems: NavItem[] = [
  {
    to: "/admin/users",
    label: "Users",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    to: "/admin/roles",
    label: "Roles",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  },
  {
    to: "/admin/permissions",
    label: "Permissions",
    icon: (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
      </svg>
    ),
  },
];

// ── Sidebar nav link ──────────────────────────────────────────────────────────
function SideNavLink({ item, expanded }: { item: NavItem; expanded: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.to === "/dashboard"}
      title={!expanded ? item.label : undefined}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
          isActive
            ? "bg-sidebar-accent text-sidebar-primary"
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
        }`
      }
    >
      {item.icon}
      <span
        className="truncate transition-all duration-200 whitespace-nowrap"
        style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0, overflow: "hidden" }}
      >
        {item.label}
      </span>
    </NavLink>
  );
}

// ── Main layout ───────────────────────────────────────────────────────────────
export default function MainLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch provinces for sub-items
  const { data: provData } = useQuery({
    queryKey: ["provinces"],
    queryFn: () => getProvinces({ page_size: "200" }),
  });
  const provinces = provData?.data.results ?? [];

  const handleMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    setExpanded(true);
  };
  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setExpanded(false), 180);
  };

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token") || "";
    try { await logout(refresh); } finally {
      clearAuth();
      navigate("/login");
    }
  };

  // Is any dashboard route active?
  const isDashboardActive =
    location.pathname === "/dashboard" ||
    location.pathname.startsWith("/provinces/") && location.pathname.endsWith("/dashboard");

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DiamondBackground />

      {/* ── Sidebar ── */}
      <aside
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative z-20 flex flex-col shrink-0"
        style={{
          width: expanded ? "15rem" : "4rem",
          transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
          background: "hsl(var(--sidebar-background))",
          borderRight: "1px solid hsl(var(--sidebar-border))",
          overflow: "hidden",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-3 py-4 border-b shrink-0"
          style={{ borderColor: "hsl(var(--sidebar-border))", minHeight: "4rem" }}
        >
          <div className="shrink-0 w-8 h-8 flex items-center justify-center">
            <ChickenLogo size={36} />
          </div>
          <span
            className="font-bold text-sm tracking-wide whitespace-nowrap transition-all duration-200"
            style={{
              color: "hsl(var(--sidebar-foreground))",
              opacity: expanded ? 1 : 0,
              width: expanded ? "auto" : 0,
              overflow: "hidden",
            }}
          >
            Poultry ERP
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden">

          {/* ── Dashboard group ── */}
          <div>
            {/* System Dashboard top-level button */}
            <button
              type="button"
              onClick={() => {
                navigate("/dashboard");
                if (expanded) setDashOpen((o) => !o);
              }}
              title={!expanded ? "Dashboard" : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isDashboardActive
                  ? "bg-sidebar-accent text-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
              }`}
            >
              {/* Dashboard icon */}
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span
                className="flex-1 text-left truncate whitespace-nowrap transition-all duration-200"
                style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0, overflow: "hidden" }}
              >
                Dashboard
              </span>
              {/* Chevron — only visible when expanded */}
              {expanded && (
                <svg
                  className="h-3.5 w-3.5 shrink-0 transition-transform duration-200"
                  style={{ transform: dashOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>

            {/* Province sub-items — slide open when dashOpen && expanded */}
            <div
              style={{
                maxHeight: expanded && dashOpen ? `${(provinces.length + 1) * 44}px` : 0,
                overflow: "hidden",
                transition: "max-height 0.25s cubic-bezier(0.4,0,0.2,1)",
              }}
            >
              {/* System-wide link */}
              <NavLink
                to="/dashboard"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 pl-10 pr-3 py-2 rounded-lg text-xs font-medium transition-colors mt-0.5 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                  }`
                }
              >
                <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="truncate">System Overview</span>
              </NavLink>

              {/* Per-province links */}
              {provinces.map((p: Province) => (
                <NavLink
                  key={p.id}
                  to={`/provinces/${p.id}/dashboard`}
                  className={({ isActive }) =>
                    `flex items-center gap-2 pl-10 pr-3 py-2 rounded-lg text-xs font-medium transition-colors mt-0.5 ${
                      isActive
                        ? "bg-sidebar-accent text-sidebar-primary"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-primary"
                    }`
                  }
                >
                  <svg className="h-3.5 w-3.5 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <span className="truncate">{p.name}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* ── Rest of nav ── */}
          {mainNavItems.map((item) => (
            <SideNavLink key={item.to} item={item} expanded={expanded} />
          ))}

          {/* ── Admin section ── */}
          <div className="mt-2">
            {/* Divider + label */}
            <div
              className="flex items-center gap-2 px-3 py-1.5 overflow-hidden"
              style={{ opacity: expanded ? 1 : 0, transition: "opacity 0.2s" }}
            >
              <div className="h-px flex-1 bg-sidebar-border" />
              <span className="text-xs font-semibold uppercase tracking-widest shrink-0"
                style={{ color: "hsl(var(--sidebar-foreground) / 0.4)" }}>
                Admin
              </span>
              <div className="h-px flex-1 bg-sidebar-border" />
            </div>
            {/* Collapsed: just a thin divider */}
            {!expanded && <div className="mx-3 my-1.5 h-px bg-sidebar-border opacity-40" />}

            {adminNavItems.map((item) => (
              <SideNavLink key={item.to} item={item} expanded={expanded} />
            ))}
          </div>
        </nav>

        {/* User footer */}
        <div
          className="px-2 py-3 border-t shrink-0"
          style={{ borderColor: "hsl(var(--sidebar-border))" }}
        >
          <div className="flex items-center gap-3 px-1">
            <div
              className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
              style={{ background: "hsl(var(--sidebar-primary))" }}
            >
              {user?.full_name?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div
              className="min-w-0 flex-1 transition-all duration-200"
              style={{ opacity: expanded ? 1 : 0, width: expanded ? "auto" : 0, overflow: "hidden" }}
            >
              <p className="text-xs font-medium truncate whitespace-nowrap" style={{ color: "hsl(var(--sidebar-foreground))" }}>
                {user?.full_name ?? "User"}
              </p>
              <p className="text-xs truncate whitespace-nowrap" style={{ color: "hsl(var(--sidebar-foreground) / 0.5)" }}>
                {user?.email}
              </p>
            </div>
          </div>
          {expanded && (
            <button
              onClick={handleLogout}
              className="mt-2 w-full text-left text-xs px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
              style={{ color: "hsl(var(--sidebar-foreground) / 0.55)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "hsl(0 72% 51%)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "hsl(var(--sidebar-foreground) / 0.55)")}
            >
              Sign out
            </button>
          )}
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="relative z-10 flex-1 overflow-auto">
        <div className="max-w-[1600px] mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
