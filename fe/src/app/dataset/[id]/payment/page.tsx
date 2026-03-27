// /app/dataset/[id]/payment/page.tsx
"use client";

import PayDataset from "@/features/buyer/payment/payDataset";
import { useParams } from "next/navigation";
import Background from "@/components/background";

export default function PaymentPage() {
    const { id } = useParams();

    // đơn giản gọi lại component, truyền id vào
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">
            <div className="relative z-0">
                <Background />
                <PayDataset />
            </div>
        </div>
    );
}
