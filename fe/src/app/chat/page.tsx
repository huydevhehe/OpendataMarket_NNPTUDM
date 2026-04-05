// app/chat/page.tsx

import { MessageSquare } from "lucide-react";

export default function ChatDefaultPage() {
    return (
        <div className="flex flex-col items-center justify-center flex-1 h-full bg-slate-950 p-6 text-gray-400">
            <MessageSquare className="w-16 h-16 text-purple-600 mb-4 opacity-50" />
            <h1 className="text-xl font-semibold mb-2">Chào mừng đến với Hộp thư của bạn</h1>
            <p className="text-center max-w-sm">
                Vui lòng chọn một cuộc hội thoại từ danh sách bên trái để xem tin nhắn.
            </p>
        </div>
    );
}