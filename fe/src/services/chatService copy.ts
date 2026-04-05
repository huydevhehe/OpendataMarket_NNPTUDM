// src/services/chatService.ts
import api from "@/lib/axios";
import { Conversation, Message } from "@/types";

// Buyer tạo hoặc lấy conversation với seller
export const createConversation = async (seller_id: string, token: string) => {
    const res = await api.post<{ success: boolean; data: Conversation }>(
        "/chat/conversations",
        { seller_id },
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
};

// Lấy danh sách conversation (buyer/seller)
export const getConversations = async (token: string) => {
    const res = await api.get<{ success: boolean; data: Conversation[] }>(
        "/chat/conversations",
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
};

// Gửi tin nhắn (buyer/seller)
export const sendMessage = async (
    payload: { conversation_id: string; content: string },
    token: string
) => {
    const res = await api.post<{ success: boolean; data: Message }>(
        "/chat/messages",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
};

// Lấy tin nhắn theo conversation
export const getMessagesByConversation = async (
    conversation_id: string,
    token: string
) => {
    const res = await api.get<{ success: boolean; data: Message[] }>(
        `/chat/conversations/${conversation_id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
};

// Đánh dấu đã đọc
export const markAsRead = async (message_id: string, token: string) => {
    const res = await api.patch<{ success: boolean; message: string }>(
        `/chat/messages/${message_id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data;
};
