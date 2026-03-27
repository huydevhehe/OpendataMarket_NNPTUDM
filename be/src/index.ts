import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

// 🧩 Routes
import loginRouter from "./routes/login.route";
import register from "./routes/register.route";
import dataset from "./routes/dataset.route";
import category from "./routes/category.route";
import user from "./routes/user.route";
import tag from "./routes/tag.route";
import transaction from "./routes/transaction.route";
import order from "./routes/order.route";
import review from "./routes/review.route";
import chat from "./routes/chat.route";
import seller from "./routes/seller.routes";
import uploadRouter from "./routes/upload.route";
import sellerUploadRouter from "./routes/sellerUpload.route";
import aiSearch from "./routes/aiSearch.route";
import walletRoutes from "./routes/wallet.route";
import payosRoutes from "./routes/payos.route";
import escrowRoutes from "./routes/escrow.route";
import withdrawRoutes from "./routes/withdraw.route";
import cookieParser from "cookie-parser";

import complaintRoute from "./routes/complaint.route";
import { payosWebhook } from "./controllers/payos.controller";

const prisma = new PrismaClient();
const app = express();
const port = 3001;

app.post("/payos/webhook",
  express.raw({ type: "*/*" }),
  payosWebhook
);

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],

    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));


app.set("trust proxy", 1);
// ✅ Routes
app.use("/", loginRouter);
app.use("/", register);
app.use("/user", user);
app.use("/dataset", dataset);
app.use("/category", category);
app.use("/tag", tag);
app.use("/transaction", transaction);
app.use("/order", order);
app.use("/review", review);
app.use("/chat", chat);
app.use("/seller", seller);
app.use("/ai", aiSearch);
app.use("/wallet", walletRoutes);

app.use("/escrow", escrowRoutes);
app.use("/withdraw", withdrawRoutes);
app.use("/api/payos", payosRoutes);
app.use("/payos", payosRoutes); 

app.use("/api/complaints", complaintRoute);
// ⚙️ Static file
app.use("/upload", express.static(path.join(__dirname, "../public/upload")));

// ✅ Create HTTP server (Socket.IO cần attach vào HTTP server)
const server = http.createServer(app);
app.use("/seller-upload", sellerUploadRouter); // 👈 prefix
// ✅ Route upload API
app.use("/api/upload", uploadRouter);
app.use((req, res, next) => {
    req.io = io;  // ⭐ attach socket.io vào request
    next();
});
// ✅ Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
    },
});

// 🔐 Middleware xác thực Socket.IO bằng JWT
// 🔐 Middleware xác thực Socket.IO + load full user info
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Missing token"));

  try {
    // Giải mã token → chỉ có user_id, role
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || "mysecretkey");

    // ⭐ LẤY FULL USER TỪ DATABASE (QUAN TRỌNG)
    const dbUser = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
      select: {
        user_id: true,
        full_name: true,
        role: true,
        email: true,
      },
    });

    if (!dbUser) return next(new Error("User not found"));

    // Gắn user đầy đủ vào socket
    (socket as any).user = dbUser;

    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});


// 🧠 Lưu online user (user_id -> socketId)
const onlineUsers = new Map<string, string>();

io.on("connection", (socket) => {
    const user = (socket as any).user;
    console.log(`✅ User connected: ${user.user_id} (${user.role})`);
    onlineUsers.set(user.user_id, socket.id);

    // Khi có tin nhắn gửi đi
    socket.on("send_message", async (data) => {
        const { conversation_id, content } = data;

        // Lưu DB
        const message = await prisma.message.create({
            data: {
                conversation_id,
                sender_id: user.user_id,
                content,
            },
            include: {
                sender: {
                    select: { full_name: true, role: true },
                },
            },
        });

        // Lấy thông tin conversation
        const convo = await prisma.conversation.findUnique({
            where: { id: conversation_id },
        });
        if (!convo) return;

        const buyerId = convo.buyer_id;
        const sellerId = convo.seller_id;

        // Người gửi
        const senderSocket = onlineUsers.get(user.user_id);

        // Gửi cho buyer nếu đang online
        const buyerSocket = onlineUsers.get(buyerId);
        if (buyerSocket) {
            io.to(buyerSocket).emit("receive_message", message);
        }

        // Gửi cho seller nếu đang online
        const sellerSocket = onlineUsers.get(sellerId);
        if (sellerSocket) {
            io.to(sellerSocket).emit("receive_message", message);
        }

        // 🔥 QUAN TRỌNG: Gửi CHO TẤT CẢ ADMIN ĐANG ONLINE
        for (let [uid, sid] of onlineUsers.entries()) {
            if (uid !== buyerId && uid !== sellerId) {
                io.to(sid).emit("receive_message", message);
            }
        }

        // Gửi lại cho người gửi
        if (senderSocket) {
            io.to(senderSocket).emit("message_sent", message);
        }
    });

    socket.on("disconnect", () => {
        onlineUsers.delete(user.user_id);
    });
});


// ✅ Khởi động server (phải là server.listen chứ không phải app.listen)
server.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
});
