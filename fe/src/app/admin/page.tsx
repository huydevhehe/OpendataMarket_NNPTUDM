"use client";

import Background from "@/components/background";
import AdminSidebar from "@/features/admin/sideBar.admin";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useState } from "react";

import CategoryManager from "@/features/admin/category.admin";
import UserManager from "@/features/admin/user.admin";
import AdminDatasetPage from "@/features/admin/dataset.admin";
import SellerAdmin from "@/features/admin/seller.admin";

// ⭐ THÊM 2 FEATURE
import EscrowAdminFeature from "@/features/admin/escrow.admin";
import WithdrawAdminFeature from "@/features/admin/withdraw.admin";
import WalletAdminFeature from "@/features/admin/wallet.admin";

// ⭐ THÊM MỚI: KHIẾU NẠI ADMIN
import AdminComplaintPage from "@/features/admin/complaints.admin";

export default function AdminHome() {
  useAuthGuard();
  const [tab, setTab] = useState("dashboard");

  const SIDEBAR_WIDTH_CLASS = "w-64";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">
      <div className="relative z-0">
        <Background />
        <div className="flex">
          <div
            className={`fixed top-0 left-0 h-screen ${SIDEBAR_WIDTH_CLASS} z-10`}
          >
            <AdminSidebar currentTab={tab} onSelectTab={setTab} />
          </div>

          <main className="flex-1 p-6 text-white hidden-scrollbar ml-64">
            {tab === "dashboard" && <div>📊 Trang tổng quan</div>}

            {tab === "users" && <UserManager />}
            {tab === "datasets" && <AdminDatasetPage />}
            {tab === "categories" && <CategoryManager />}
            {tab === "sellers" && <SellerAdmin />}
            {tab === "wallets" && <WalletAdminFeature />}

            {/* TIỀN GIAM */}
            {tab === "escrow" && <EscrowAdminFeature />}

            {/* RÚT TIỀN */}
            {tab === "withdraw" && <WithdrawAdminFeature />}

            {/* ⭐ TAB MỚI: KHIẾU NẠI */}
            {tab === "complaints" && <AdminComplaintPage />}

            {tab === "settings" && <div>⚙️ Cài đặt hệ thống</div>}
          </main>
        </div>
      </div>
    </div>
  );
}
