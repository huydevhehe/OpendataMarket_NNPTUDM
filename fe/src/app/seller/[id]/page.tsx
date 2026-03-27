"use client";

import Background from "@/components/background";
import SellerSidebar from "@/features/seller/sideBar.seller";
import { useAuthGuard } from "@/hooks/auth/useAuthGuard";
import { useState } from "react";

import SellerEscrowPage from "@/features/seller/escrow.seller";
import SellerWithdrawPage from "@/features/seller/withdraw.seller";

// 🧩 Import các tab component (bố thêm dần sau)
import SellerDatasetPage from "@/features/seller/myDatasets.seller";
import SellerOrderPage from "@/features/seller/orders.seller";

// ⭐ NEW: import trang khiếu nại
import SellerComplaintPage from "@/features/seller/complaints.seller";

export default function SellerDashboardPage() {
    // useAuthGuard(); // chặn chưa đăng nhập
    const [tab, setTab] = useState("datasets");

    const SIDEBAR_WIDTH_CLASS = "w-64";

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-x-hidden">
            <div className="relative z-0">
                <Background />
                <div className="flex">

                    {/* Sidebar cố định bên trái */}
                    <div className={`fixed top-0 left-0 h-screen ${SIDEBAR_WIDTH_CLASS} z-10`}>
                        <SellerSidebar currentTab={tab} onSelectTab={setTab} />
                    </div>

                    {/* Main content */}
                    <main className={`flex-1 p-6 ml-64 hidden-scrollbar`}>

                        {tab === "datasets" && <SellerDatasetPage />}
                        {tab === "orders" && <SellerOrderPage />}

                        {/* ⭐ NEW: tab khiếu nại */}
                        {tab === "complaints" && <SellerComplaintPage />}

                        {/* {tab === "reviews" && <SellerReviewPage />} */}
                        {/* {tab === "statistics" && <SellerStatsPage />} */}

                        {tab === "escrow" && <SellerEscrowPage />}
                        {tab === "withdraw" && <SellerWithdrawPage />}
                    </main>

                </div>
            </div>
        </div>
    );
}
