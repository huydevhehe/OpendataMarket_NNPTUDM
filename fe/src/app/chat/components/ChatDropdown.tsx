"use client";

import { useEffect, useState } from "react";
import io, { Socket } from "socket.io-client";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useConversations } from "@/hooks/chat/useConversations";
import { decodeToken } from "@/lib/decodeToken";
import { Conversation } from "@/types";

const AvatarPlaceholder = ({ name }: { name: string }) => (
    <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-sm">
        {name.charAt(0).toUpperCase()}
    </div>
);

interface ChatDropdownProps {
    token: string;
    onSelectConversation: (c: Conversation) => void;
}

export default function ChatDropdown({ token, onSelectConversation }: ChatDropdownProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [hasNewMsg, setHasNewMsg] = useState(false);

    const { data: conversations, refetch } = useConversations(token);
    const decoded = decodeToken(token || "");

    useEffect(() => {
        if (!token) return;
        const s = io("http://localhost:3001", {
            auth: { token },
            transports: ["websocket"],
        });
        setSocket(s);

        s.on("receive_message", () => {
            setUnreadCount((prev) => prev + 1);
            setHasNewMsg(true);
            setTimeout(() => setHasNewMsg(false), 1500);
            refetch();
        });

        // ✅ Cleanup chuẩn cho TypeScript
        return () => {
            s.disconnect(); // không return gì hết
        };
    }, [token, refetch]);


    const formatShortTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className={`relative p-2 rounded-full transition-all duration-300 ${hasNewMsg ? "animate-pulse ring-2 ring-purple-500/40" : ""
                        }`}
                >
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-[10px] text-white rounded-full px-1.5">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                className="w-80 bg-slate-900 border border-slate-800 shadow-xl p-1"
            >
                <DropdownMenuLabel className="text-purple-400 font-semibold p-2">
                    Tin nhắn gần đây
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />

                {conversations && conversations.length > 0 ? (
                    conversations.slice(0, 5).map((c) => {
                        const partner =
                            decoded?.user_id === c.buyer_id ? c.seller : c.buyer;
                        const name =
                            partner?.full_name ||
                            partner?.email?.split("@")[0] ||
                            "Người dùng";
                        const lastMsg = c.messages?.[0];
                        return (
                            <DropdownMenuItem
                                key={c.id}
                                onClick={() => onSelectConversation(c)}
                                className="flex items-center gap-3 p-2 hover:bg-slate-800 rounded-lg cursor-pointer"
                            >
                                <AvatarPlaceholder name={name} />
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-100 truncate">{name}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {lastMsg?.content || "Không có tin nhắn"}
                                    </p>
                                </div>
                                {lastMsg?.created_at && (
                                    <p className="text-[10px] text-gray-500">
                                        {formatShortTime(lastMsg.created_at)}
                                    </p>
                                )}
                            </DropdownMenuItem>
                        );
                    })
                ) : (
                    <p className="text-gray-500 text-sm text-center p-4">
                        Không có hội thoại nào
                    </p>
                )}

                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem asChild>
                    <Link
                        href="/chat"
                        target="_blank"
                        className="text-center w-full text-purple-400 font-semibold py-1.5 hover:text-purple-300 transition"
                    >
                        Xem tất cả tin nhắn
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
