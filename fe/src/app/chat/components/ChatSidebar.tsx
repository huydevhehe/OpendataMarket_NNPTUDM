"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useConversations } from "@/hooks/chat/useConversations";
import { decodeToken } from "@/lib/decodeToken";
import { MessageSquare } from "lucide-react";
import { Conversation } from "@/types";

interface ChatSidebarProps {
    onClose?: () => void; // dùng cho mobile
}

export default function ChatSidebar({ onClose }: ChatSidebarProps) {
    const [token, setToken] = useState("");
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const t = localStorage.getItem("accessToken") || "";
        setToken(t);
    }, []);

    const { data: conversations } = useConversations(token);
    const decoded = decodeToken(token);

    // 💡 Lấy màu avatar ngẫu nhiên ổn định
    const getAvatarColor = (id: string) => {
        const colors = [
            "bg-indigo-500",
            "bg-pink-500",
            "bg-green-500",
            "bg-yellow-500",
            "bg-cyan-500",
        ];
        return colors[id.charCodeAt(0) % colors.length];
    };

    const Avatar = ({ name, id }: { name: string; id: string }) => (
        <div
            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border border-slate-700 ${getAvatarColor(
                id
            )}`}
        >
            {name.charAt(0).toUpperCase()}
        </div>
    );

    const formatShortTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);
        if (diff < 1) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
        if (diff < 7) return date.toLocaleDateString("vi-VN", { weekday: "short" });
        return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
    };

    // Sắp xếp theo tin nhắn mới nhất
    const sorted = conversations?.slice().sort((a, b) => {
        const t1 = new Date(a.messages?.[0]?.created_at || 0).getTime();
        const t2 = new Date(b.messages?.[0]?.created_at || 0).getTime();
        return t2 - t1;
    });

    return (
        <div className="flex flex-col h-full overflow-y-auto w-full bg-slate-900">
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-slate-900 z-10">
                <h2 className="font-extrabold text-2xl text-indigo-400 flex items-center gap-2">
                    <MessageSquare className="w-6 h-6" /> Chat
                </h2>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition text-sm"
                    >
                        ✕
                    </button>
                )}
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-800">
                {sorted?.length === 0 && (
                    <div className="text-center text-gray-500 p-8">Không có hội thoại nào.</div>
                )}

                {sorted?.map((c) => {
                    const partner = decoded?.user_id === c.buyer_id ? c.seller : c.buyer;
                    const name =
                        partner?.full_name ||
                        partner?.email?.split("@")[0] ||
                        "Người dùng ẩn danh";
                    const lastMsg = c.messages?.[0];
                    const isActive = pathname.includes(c.id);
                    const isUnread =
                        lastMsg &&
                        !lastMsg.is_read &&
                        lastMsg.sender_id !== decoded?.user_id;

                    return (
                        <div
                            key={c.id}
                            onClick={() => {
                                router.push(`/chat/${c.id}`);
                                onClose?.();
                            }}
                            className={`flex gap-3 p-4 transition-all duration-200 border-l-4 rounded-lg 
                                ${isActive
                                    ? "bg-slate-800 border-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                                    : "hover:bg-slate-800 border-transparent hover:border-slate-700"
                                } cursor-pointer`}
                        >
                            <Avatar name={name} id={partner?.user_id || name} />
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold truncate text-white">{name}</p>
                                    {lastMsg && (
                                        <p className="text-xs text-gray-500 ml-2 flex-shrink-0">
                                            {formatShortTime(lastMsg.created_at)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center">
                                    <p className="text-sm text-gray-400 truncate mt-0.5 flex-1">
                                        {lastMsg?.content || "Bắt đầu cuộc trò chuyện..."}
                                    </p>
                                    {isUnread && (
                                        <span className="w-2 h-2 bg-blue-400 rounded-full ml-2"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
