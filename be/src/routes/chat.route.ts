import { Router } from "express";
import * as chatController from "../controllers/chat.controller";
import { verifyToken, requireRole } from "../middleware/VerifyToken";

const router = Router();

// 🟩 Buyer khởi tạo chat với Seller
router.post(
    "/conversations",
    verifyToken,
    requireRole(["buyer"]),
    chatController.createConversation
);

// 🟦 Lấy danh sách chat (buyer / seller / admin)
router.get(
    "/conversations",
    verifyToken,
    requireRole(["buyer", "seller", "admin"]),
    chatController.getConversations
);

// 💬 Gửi tin nhắn
router.post(
    "/messages",
    verifyToken,
    requireRole(["buyer", "seller", "admin"]),
    chatController.sendMessage
);

// 📜 Lấy tất cả tin nhắn của 1 conversation
router.get(
    "/conversations/:id/messages",
    verifyToken,
    chatController.getMessages
);

// ✔ Đánh dấu tin nhắn đã đọc
router.patch(
    "/messages/:id/read",
    verifyToken,
    chatController.markAsRead
);

// ⭐ LẤY HOẶC TẠO CONVERSATION ADMIN
// Allow: buyer, seller → (admin KHÔNG TỰ TẠO chat với admin)
router.get(
    "/admin/default",
    verifyToken,
    requireRole(["buyer", "seller"]),   // đúng chuẩn
    chatController.getAdminConversation
);
router.patch("/:id/admin/join", verifyToken, requireRole(["admin"]), chatController.joinConversation);
router.patch("/:id/admin/leave", verifyToken, requireRole(["admin"]), chatController.leaveConversation);
// 👁 Lấy danh sách hội thoại để admin theo dõi (buyer ↔ seller)
router.get(
  "/admin/follow",
  verifyToken,
  requireRole(["admin"]),
  chatController.getFollowConversations
);
export default router;
