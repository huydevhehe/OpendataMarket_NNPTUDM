import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// 🧩 Tạo hoặc lấy conversation buyer ↔ seller
export const createOrGetConversation = async (buyerId: string, sellerId: string) => {
    let convo = await prisma.conversation.findFirst({
        where: { buyer_id: buyerId, seller_id: sellerId },
    });

    if (!convo) {
        convo = await prisma.conversation.create({
            data: { buyer_id: buyerId, seller_id: sellerId },
        });
    }
    return convo;
};

// 📌 Lấy conversation theo vai trò (buyer / seller / admin)
// Lấy danh sách conversation theo user + role
export const getUserConversations = async (userId: string, role: string) => {

  // Nếu ADMIN → chỉ lấy các hội thoại có ADMIN tham gia (tab direct)
  if (role === "admin") {
    return prisma.conversation.findMany({
      where: {
        OR: [
          { buyer_id: userId },
          { seller_id: userId }
        ],
        AND: [
          {
            OR: [
              { buyer: { role: "admin" } },
              { seller: { role: "admin" } }
            ]
          }
        ]
      },
      include: {
        buyer: { select: { user_id: true, full_name: true, email: true, role: true } },
        seller: { select: { user_id: true, full_name: true, email: true, role: true } },
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
      },
      orderBy: { updated_at: "desc" },
    });
  }

  // Buyer / Seller → nhận hội thoại của chính họ
  return prisma.conversation.findMany({
    where: {
      OR: [
        { buyer_id: userId },
        { seller_id: userId }
      ]
    },
    include: {
      buyer: { select: { user_id: true, full_name: true, email: true, role: true } },
      seller: { select: { user_id: true, full_name: true, email: true, role: true } },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1,
      },
    },
    orderBy: { updated_at: "desc" },
  });
};


// 💬 Gửi tin nhắn
// 💬 Gửi tin nhắn (FULL SENDER + EMIT SOCKET)
export const sendMessage = async (conversationId: string, senderId: string, content: string, io?: any) => {
  // 1) Tạo message
  const msg = await prisma.message.create({
    data: {
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    },
  });

  // 2) Lấy lại message với đầy đủ thông tin người gửi
  const fullMsg = await prisma.message.findUnique({
    where: { id: msg.id },
    include: {
      sender: {
        select: {
          user_id: true,
          full_name: true,
          role: true,
        },
      },
    },
  });

  // 3) Emit socket cho buyer/seller/admin đang join room
  if (io) {
    io.to(conversationId).emit("receive_message", fullMsg);
  }

  return fullMsg;
};


// 📜 Lấy tin nhắn theo conversation
// Lấy tin nhắn theo conversation + kèm thông tin người gửi
export const getMessagesByConversation = async (conversation_id: string) => {
  return prisma.message.findMany({
    where: { conversation_id },
    orderBy: { created_at: "asc" },
    include: {
      sender: {
        select: {
          user_id: true,
          full_name: true,
          role: true
        }
      }
    }
  });
};

// 🟦 Admin JOIN chat
export const adminJoinConversation = async (conversationId: string) => {
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { admin_joined: true },
    });

    await prisma.message.create({
        data: {
            conversation_id: conversationId,
            sender_id: "system",
            content: "Admin đã tham gia cuộc trò chuyện",
        }
    });

    return prisma.conversation.findUnique({ where: { id: conversationId } });
};


// 🟥 Admin LEAVE chat
export const adminLeaveConversation = async (conversationId: string) => {
    await prisma.conversation.update({
        where: { id: conversationId },
        data: { admin_joined: false },
    });

    await prisma.message.create({
        data: {
            conversation_id: conversationId,
            sender_id: "system",
            
            content: "Admin đã rời cuộc trò chuyện",
        },
    });
};

// 🟨 Chat user → admin
export const getOrCreateAdminChat = async (userId: string) => {
    const admin = await prisma.user.findFirst({
        where: { role: "admin" },
    });

    if (!admin) throw new Error("Admin not found");

    let convo = await prisma.conversation.findFirst({
        where: { buyer_id: userId, seller_id: admin.user_id },
    });

    if (!convo) {
        convo = await prisma.conversation.create({
            data: {
                buyer_id: userId,
                seller_id: admin.user_id,
            },
        });
    }

    return convo;
};
export const markAsRead = async (messageId: string, userId: string) => {
    // Lấy message
    const msg = await prisma.message.findUnique({
        where: { id: messageId },
    });

    if (!msg) throw new Error("Message not found");

    // Không đánh dấu tin nhắn của chính mình
    if (msg.sender_id === userId) return msg;

    // Đã đọc rồi → không update thêm
    if (msg.is_read === true) return msg;

    // Update is_read
    return prisma.message.update({
        where: { id: messageId },
        data: { is_read: true },
    });
};
export const getFollowConversations = async () => {
  return prisma.conversation.findMany({
    where: {
      // CHỈ LẤY BUYER ↔ SELLER
      buyer: { role: "buyer" },
      seller: { role: "seller" }
    },
    include: {
      buyer: {
        select: {
          user_id: true,
          full_name: true,
          role: true
        }
      },
      seller: {
        select: {
          user_id: true,
          full_name: true,
          role: true
        }
      },
      messages: {
        orderBy: { created_at: "desc" },
        take: 1
      }
    },
    orderBy: { updated_at: "desc" }
  });
};
export const getConversationById = async (id: string) => {
    return prisma.conversation.findUnique({
        where: { id },
        include: {
            buyer: true,
            seller: true
        }
    });
};
