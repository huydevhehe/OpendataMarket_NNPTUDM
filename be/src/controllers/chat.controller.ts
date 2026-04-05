import { Request, Response } from "express";
import * as chatService from "../services/chat.service";
import { AuthRequest } from "../middleware/VerifyToken";

// 🧩 Tạo hoặc lấy conversation
export const createConversation = async (req: AuthRequest, res: Response) => {
    try {
        const { seller_id } = req.body;
        const convo = await chatService.createOrGetConversation(req.user!.user_id, seller_id);
        res.status(201).json({ success: true, data: convo });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 📋 Lấy danh sách conversation của user
export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const convos = await chatService.getUserConversations(req.user!.user_id, req.user!.role);
        res.json({ success: true, data: convos });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 💬 Gửi tin nhắn
// 💬 Gửi tin nhắn
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { conversation_id, content } = req.body;
    const userId = req.user!.user_id;

    const message = await chatService.sendMessage(conversation_id, userId, content, req.io);

    res.status(201).json({ success: true, data: message });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// 📜 Lấy tin nhắn
// 📨 Lấy tin nhắn
export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        // lấy tin nhắn
        const messages = await chatService.getMessagesByConversation(id);

        // lấy data conversation (buyer + seller)
        const convo = await chatService.getConversationById(id);
        if (!convo) {
            return res.status(404).json({ success: false, message: "Conversation not found" });
        }

        // xác định partner (người còn lại)
        let partner = null;

        if (req.user!.user_id === convo.buyer_id) {
            partner = convo.seller;
        } else {
            partner = convo.buyer;
        }

       res.json({
    success: true,
    data: messages,
    partnerInfo: partner,
    conversationInfo: {
        buyer: convo.buyer,
        seller: convo.seller
    }
});

    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};


// 🟦 Admin JOIN conversation
export const joinConversation = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await chatService.adminJoinConversation(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// 🟥 Admin LEAVE conversation
export const leaveConversation = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        await chatService.adminLeaveConversation(id);
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// user → admin chat
export const getAdminConversation = async (req: AuthRequest, res: Response) => {
    try {
        const convo = await chatService.getOrCreateAdminChat(req.user!.user_id);
        res.json({ success: true, data: convo });
    } catch (err: any) {
        res.status(500).json({ success: false, message: err.message });
    }
};
export const markAsRead = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const updated = await chatService.markAsRead(id, req.user!.user_id);

        res.json({
            success: true,
            data: updated,
        });
    } catch (err: any) {
        console.error("markAsRead error:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
};
export const getFollowConversations = async (req: AuthRequest, res: Response) => {
  try {
    const convos = await chatService.getFollowConversations();
    res.json({ success: true, data: convos });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
