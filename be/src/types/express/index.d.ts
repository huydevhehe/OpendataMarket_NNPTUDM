import { Server as SocketIOServer } from "socket.io";

declare global {
  namespace Express {
    export interface Request {
      user?: {
        user_id: string;
        role: string;
        email?: string;
        full_name?: string;
      };

      io: SocketIOServer; // ⭐ Thêm dòng này – BẮT BUỘC PHẢI CÓ
    }
  }
}

export {};
