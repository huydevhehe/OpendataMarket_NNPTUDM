"use client";

import { useEffect, useState, useRef } from "react";
import io, { Socket } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2, SendHorizonal } from "lucide-react";
import { decodeToken } from "@/lib/decodeToken";

interface Message {
    id: string;
    conversation_id: string;
    sender_id: string;
    content: string;
    created_at: string;
}

interface FloatingChatWidgetProps {
    conversationId: string;
    partnerName: string;
    onClose: () => void;
}

export default function FloatingChatWidget({
    conversationId,
    partnerName,
    onClose,
}: FloatingChatWidgetProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    // 🧩 Fetch tin nhắn cũ
    useEffect(() => {
        if (!conversationId || !token) return;
        const fetchMessages = async () => {
            const res = await fetch(
                `http://localhost:3001/chat/conversations/${conversationId}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const json = await res.json();
            if (json.success) setMessages(json.data);
        };
        fetchMessages();

        const decoded = decodeToken(token);
        setCurrentUserId(decoded?.user_id || null);
    }, [conversationId, token]);

    // ⚙️ Kết nối socket
    useEffect(() => {
        if (!token) return;

        const s = io("http://localhost:3001", {
            auth: { token },
            transports: ["websocket"],
        });
        setSocket(s);

        s.on("receive_message", (msg: Message) => {
            if (msg.conversation_id === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        });

        s.on("message_sent", (msg: Message) => {
            if (msg.conversation_id === conversationId) {
                setMessages((prev) => [...prev, msg]);
                setIsSending(false);
            }
        });

        // ✅ Cleanup chuẩn
        return () => {
            s.disconnect(); // <- không return gì cả
        };
    }, [conversationId, token]);


    // 🔽 Auto scroll xuống cuối
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!socket || !input.trim()) return;
        setIsSending(true);
        socket.emit("send_message", {
            conversation_id: conversationId,
            content: input,
        });
        setInput("");
    };

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[520px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[100] animate-in slide-in-from-bottom duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                <div className="font-semibold text-purple-400">{partnerName}</div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-slate-700 transition"
                >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {messages.length === 0 && (
                    <p className="text-gray-500 text-center mt-10 text-sm">
                        Chưa có tin nhắn nào
                    </p>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === currentUserId ? "justify-end" : "justify-start"
                            }`}
                    >
                        <div
                            className={`px-3 py-2 rounded-xl max-w-[75%] ${msg.sender_id === currentUserId
                                ? "bg-purple-600 text-white"
                                : "bg-slate-700 text-gray-100"
                                }`}
                        >
                            {msg.content}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-slate-700 bg-slate-800 flex items-center gap-2">
                <Input
                    placeholder="Nhập tin nhắn..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 bg-slate-700 text-white border-slate-600"
                    disabled={isSending}
                />
                <Button
                    onClick={sendMessage}
                    className="bg-purple-600 hover:bg-purple-700 rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    disabled={isSending || !input.trim()}
                >
                    {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <SendHorizonal className="w-4 h-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
