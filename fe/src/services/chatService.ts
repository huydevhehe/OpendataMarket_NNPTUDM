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
// 🟦 Lấy hoặc tạo cuộc chat mặc định với admin
export const getAdminConversation = async (token: string) => {
    const res = await api.get<{ success: boolean; data: Conversation }>(
        "/chat/admin/default",
        { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
};
// Admin: xem toàn bộ buyer ↔ seller
export const getFollowConversations = async (token: string) => {
  const res = await api.get<{ success: boolean; data: Conversation[] }>(
    "/chat/admin/follow",
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Admin join cuộc chat
export const joinConversation = async (token: string, id: string) => {
  const res = await api.patch<{ success: boolean; data: Conversation }>(
    `/chat/admin/join/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};

// Admin leave cuộc chat
export const leaveConversation = async (token: string, id: string) => {
  const res = await api.patch<{ success: boolean; data: Conversation }>(
    `/chat/admin/leave/${id}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data.data;
};
