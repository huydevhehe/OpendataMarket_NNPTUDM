"use client";

import {
  User,
  BarChart3,
  Users,
  Database,
  Layers,
  Settings,
  LogOut,
  Store,          // Seller
  ShieldCheck,    // Escrow
  Wallet,         // Withdraw
  AlertTriangle   // ⭐ ICON KHIẾU NẠI
} from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

interface AdminSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export default function AdminSidebar({
  currentTab,
  onSelectTab,
}: AdminSidebarProps) {
  const [open] = useState(false);

  let userInfo = { name: "Admin User", email: "admin@example.com" };
  try {
    const token =
      Cookies.get("accessToken") || localStorage.getItem("accessToken") || "";
    if (token) {
      const decoded: any = jwtDecode(token);
      if (decoded?.name || decoded?.email) {
        userInfo = {
          name: decoded.name || "Admin",
          email: decoded.email || "",
        };
      }
    }
  } catch {}

  const handleLogout = () => {
    Cookies.remove("accessToken");
    localStorage.removeItem("accessToken");
    window.location.href = "/login";
  };

  // ⭐ MENU ITEMS (giữ nguyên + thêm complaints)
  const menuItems = [
    { key: "dashboard", label: "Bảng điều khiển", icon: BarChart3 },
    { key: "users", label: "Người dùng", icon: Users },
    { key: "datasets", label: "Dataset", icon: Database },
    { key: "sellers", label: "Seller", icon: Store },
    { key: "categories", label: "Danh mục", icon: Layers },

    // 💰 Tiền
    { key: "wallets", label: "Ví người dùng", icon: Wallet },
    { key: "escrow", label: "Tiền giam (Escrow)", icon: ShieldCheck },
    { key: "withdraw", label: "Rút tiền", icon: Wallet },

    // ⭐ THÊM TAB KHIẾU NẠI
    { key: "complaints", label: "Khiếu nại", icon: AlertTriangle },

    { key: "settings", label: "Cài đặt", icon: Settings },
  ];

  return (
    <aside className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col relative fixed top-0 left-0 bottom-0 z-20">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
            <BarChart3 className="text-white w-4 h-4" />
          </div>
          <span className="text-xl font-semibold text-white">
            Admin Panel
          </span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.key;
          return (
            <div
              key={item.key}
              onClick={() => onSelectTab(item.key)}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium cursor-pointer transition-all ${
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800 hover:bg-gray-800/50 transition-colors relative group">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
            <User className="text-white w-4 h-4" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-white">{userInfo.name}</p>
            <p className="text-xs text-gray-400">{userInfo.email}</p>
          </div>
        </div>

        <div className="hidden group-hover:block absolute bottom-16 left-4 right-4 bg-gray-900 border border-gray-700 rounded-xl shadow-lg animate-in fade-in slide-in-from-bottom-2 z-50">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded-lg"
          >
            <LogOut className="w-4 h-4 mr-2 text-gray-400" />
            Đăng xuất
          </button>
        </div>
      </div>
    </aside>
  );
}
