// app/chat/page.tsx

"use client";
import ChatSidebar from "./components/ChatSidebar";
import { MessageSquare } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function ChatDefaultPage() {
    const searchParams = useSearchParams();
    const tab = (searchParams.get("tab") as "direct" | "follow") || "direct";

    return (
        <div className="flex h-full">
            {/* SIDEBAR */}
            <ChatSidebar activeTab={tab} />

            {/* CONTENT */}
            <div className="flex flex-col items-center justify-center flex-1 h-full bg-slate-950 p-6 text-gray-400">
                <MessageSquare className="w-16 h-16 text-purple-600 mb-4 opacity-50" />
                <h1 className="text-xl font-semibold mb-2">Chào mừng đến với Hộp thư của bạn</h1>
                <p className="text-center max-w-sm">
                    Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để xem tin nhắn.
                </p>
            </div>
        </div>
    );
}
