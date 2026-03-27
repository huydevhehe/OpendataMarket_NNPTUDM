"use client";

import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
    partnerName: string;          // tên user đang chat / buyer / seller
    partnerFullName?: string;     // tên thật từ DB
    viewerRole?: string;          // role của người đang xem (buyer / seller / admin)
    convoBuyerName?: string;      // tên buyer trong conversation
    convoSellerName?: string;     // tên seller trong conversation
}

const AvatarPlaceholder = ({ name }: { name: string }) => (
    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-base flex-shrink-0 border-2 border-slate-500 text-white">
        {name.charAt(0).toUpperCase()}
    </div>
);

export default function ChatHeader({
    partnerName,
    partnerFullName,
    viewerRole,
    convoBuyerName,
    convoSellerName,
}: ChatHeaderProps) {

    // =========================
    // 1. TEXT PHỤ Ở DƯỚI TÊN
    // =========================
    let subText = "Hoạt động";

    if (viewerRole === "admin") {
        // admin đang xem một hội thoại buyer ↔ seller
        if (convoBuyerName && convoSellerName) {
            subText = `Đoạn chat giữa ${convoBuyerName} ↔ ${convoSellerName}`;
        }
    } else {
        // buyer / seller xem thì ghi rõ
        subText = "Bạn đang tham gia đoạn chat này";
    }

    // =========================
    // 2. TÊN HIỂN THỊ CHÍNH
    // =========================
    const displayName = partnerFullName || partnerName || "Người dùng";

    return (
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
                <AvatarPlaceholder name={displayName} />

                <div>
                    {/* TÊN Ở TRÊN */}
                    <h2 className="font-extrabold text-lg truncate max-w-[220px] text-indigo-400">
                        {displayName}
                    </h2>

                    {/* TEXT MÔ TẢ Ở DƯỚI */}
                    <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        {subText}
                    </p>
                </div>
            </div>

            <Button
                variant="ghost"
                className="text-white hover:bg-slate-800 p-2 rounded-full"
            >
                <MoreVertical className="w-5 h-5" />
            </Button>
        </div>
    );
}
