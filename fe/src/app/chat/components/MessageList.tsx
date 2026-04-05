"use client";

import { useRef, useEffect } from "react";
import { Loader2 } from "lucide-react";

interface Message {
    id: string;
    sender_id: string;
    conversation_id: string;
    content: string;
    created_at: string;
    is_pending?: boolean;
}

interface MessageListProps {
    messages: Message[];
    currentUserId: string | null;
    partnerName: string;
    isLoading: boolean;
}

const AvatarPlaceholder = ({ name }: { name: string }) => (
    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs flex-shrink-0 text-white border border-slate-500">
        {name.charAt(0).toUpperCase()}
    </div>
);

export default function MessageList({
    messages,
    currentUserId,
    partnerName,
    isLoading,
}: MessageListProps) {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading)
        return (
            <div className="text-center text-indigo-400 mt-10 flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Đang tải tin nhắn...
            </div>
        );

    if (!isLoading && messages.length === 0)
        return (
            <p className="text-center text-gray-500 mt-10">
                Chào mừng! Bắt đầu cuộc trò chuyện đầu tiên với{" "}
                <span className="font-semibold text-indigo-400">{partnerName}</span> nhé!
            </p>
        );

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
            {messages.map((msg) => {
                const isCurrentUser = msg.sender_id === currentUserId;
                return (
                    <div
                        key={msg.id}
                        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"
                            } transition-opacity duration-300 ${msg.is_pending ? "opacity-50" : "opacity-100"
                            }`}
                    >
                        <div className="flex max-w-[80%] md:max-w-[65%]">
                            {!isCurrentUser && (
                                <div className="self-end mr-2 hidden sm:block">
                                    <AvatarPlaceholder name={partnerName} />
                                </div>
                            )}
                            <div
                                className={`group relative px-4 py-2 mx-1 break-words text-sm rounded-3xl shadow-lg transition-all duration-200 
                ${isCurrentUser
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-br-md"
                                        : "bg-slate-700 text-gray-100 rounded-bl-md"
                                    }
                hover:shadow-xl hover:scale-[1.01] transform origin-center`}
                            >
                                <p className="pr-10">{msg.content}</p>
                                <span
                                    className={`absolute text-[10px] opacity-70 bottom-1 right-2 transition-opacity duration-300 
                    ${isCurrentUser ? "text-indigo-200" : "text-gray-400"}
                  `}
                                >
                                    {msg.is_pending ? "Đang gửi..." : formatTime(msg.created_at)}
                                </span>
                                {msg.is_pending && (
                                    <Loader2 className="absolute top-1 right-1 w-3 h-3 text-white animate-spin" />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>
    );
}
