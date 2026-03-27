import { jwtDecode } from "jwt-decode";

export interface UserPayload {
    user_id: string;
    role: string;
    wallet_address?: string;
    iat?: number;
    exp?: number;
}

// ✅ Hàm decode token an toàn
export const decodeToken = (token: string): UserPayload | null => {
    try {
        // 🔹 Nếu token rỗng hoặc sai định dạng, return null luôn
        if (!token || !token.includes(".")) {
            return null;
        }

        const decoded = jwtDecode<UserPayload>(token);
        return decoded;
    } catch (error) {
        console.error("Invalid token:", error);
        return null;
    }
};
