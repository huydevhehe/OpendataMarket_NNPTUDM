// src/lib/socket.ts
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const getSocket = () => {
    if (typeof window === "undefined") return null;
    const token =
        localStorage.getItem("accessToken") ||
        (typeof document !== "undefined" ? "" : "");

    if (!socket) {
        socket = io("http://localhost:3001", {
            transports: ["websocket"],
            autoConnect: !!token,
            auth: { token },
        });

        // Re-auth nếu token đổi
        socket.on("connect_error", (err) => {
            // eslint-disable-next-line no-console
            console.warn("[socket] connect_error:", err.message);
        });
    }
    return socket;
};

export const reconnectSocketWithNewToken = (token: string) => {
    if (!socket) return;
    socket.auth = { token };
    if (!socket.connected) socket.connect();
};
