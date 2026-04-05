"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { decodeToken } from "@/lib/decodeToken";
import ChatHeader from "../components/ChatHeader";
import MessageList from "../components/MessageList";
import ChatInput from "../components/ChatInput";

interface Message {
    id: string;
    sender_id: string;
    conversation_id: string;
    content: string;
    created_at: string;
    is_pending?: boolean;
}

export default function ChatPage() {
    const { id: conversationId } = useParams<{ id: string }>();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [partnerName, setPartnerName] = useState("Đang tải...");
    const [isLoading, setIsLoading] = useState(true);

    const token =
        typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const fetchMessages = useCallback(async () => {
        if (!token || !conversationId) return;

        setIsLoading(true);
        try {
            const res = await fetch(
                `http://localhost:3001/chat/conversations/${conversationId}/messages`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const json = await res.json();
            if (json.success) {
                setMessages(json.data || []);
                const decoded = decodeToken(token);
                setCurrentUserId(decoded?.user_id || null);
                setPartnerName(json.partnerInfo?.full_name || "Người dùng");
            }
        } catch (err) {
            console.error("❌ Lỗi tải tin nhắn:", err);
        } finally {
            setIsLoading(false);
        }
    }, [conversationId, token]);

    useEffect(() => {
        if (!token || !conversationId) {
            window.location.href = "/login";
            return;
        }

        fetchMessages();

        const s = io("http://localhost:3001", {
            auth: { token },
            transports: ["websocket"],
        });
        setSocket(s);

        const handleReceiveMessage = (msg: Message) => {
            if (msg.conversation_id === conversationId) {
                setMessages((prev) => [...prev, msg]);
            }
        };

        const handleMessageSent = (msg: Message) => {
            if (msg.conversation_id === conversationId) {
                setMessages((prev) =>
                    prev.filter((m) => !m.is_pending).concat(msg)
                );
                setIsSending(false);
            }
        };

        // 🎧 Đăng ký listener
        s.on("receive_message", handleReceiveMessage);
        s.on("message_sent", handleMessageSent);

        // ✅ Cleanup chính xác theo React rule
        return () => {
            s.off("receive_message", handleReceiveMessage);
            s.off("message_sent", handleMessageSent);
            s.disconnect(); // ✅ an toàn, đúng type
        };
    }, [conversationId, fetchMessages, token]);


    const sendMessage = () => {
        const content = input.trim();
        if (!content || !socket || !currentUserId) return;

        setIsSending(true);
        const tempId = Date.now().toString();
        const pendingMessage: Message = {
            id: tempId,
            conversation_id: conversationId,
            sender_id: currentUserId,
            content,
            created_at: new Date().toISOString(),
            is_pending: true,
        };
        setMessages((prev) => [...prev, pendingMessage]);
        socket.emit("send_message", { conversation_id: conversationId, content });
        setInput("");
    };

    return (
        <div className="flex flex-col flex-1 bg-slate-950 text-white h-full max-h-screen">
            <ChatHeader partnerName={partnerName} />
            <MessageList
                messages={messages}
                currentUserId={currentUserId}
                partnerName={partnerName}
                isLoading={isLoading}
            />
            <ChatInput
                input={input}
                setInput={setInput}
                sendMessage={sendMessage}
                isSending={isSending}
            />
        </div>
    );
}
