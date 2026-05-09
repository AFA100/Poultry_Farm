import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";
import { logout } from "@/api/auth";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/provinces", label: "Provinces" },
  { to: "/farms", label: "Farms" },
  { to: "/employees", label: "Employees" },
  { to: "/chickens", label: "Chickens" },
  { to: "/feed", label: "Feed" },
  { to: "/finance", label: "Finance" },
  { to: "/reports", label: "Reports" },
];

export default function MainLayout() {
  const { user, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const refresh = localStorage.getItem("refresh_token") || "";
    try {
      await logout(refresh);
    } finally {
      clearAuth();
      navigate("/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col">
        <div className="px-4 py-5 border-b">
          <span className="font-semibold text-gray-800 text-sm">Poultry ERP</span>
        </div>
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-4 py-4 border-t">
          <p className="text-xs text-gray-500 truncate mb-2">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-red-500 hover:text-red-700"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
