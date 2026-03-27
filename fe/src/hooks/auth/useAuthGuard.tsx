"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

interface DecodedToken {
    user_id: string;
    email: string;
    role: string;
    exp: number;
}

export function useAuthGuard() {
    const router = useRouter();

    useEffect(() => {
        let token = Cookies.get("accessToken");

        // Fallback sang localStorage nếu chưa có cookie
        if (!token) token = localStorage.getItem("accessToken") || "";

        // ❌ Không có token → redirect login
        if (!token) {
            router.replace("/login");
            alert("Bạn đéo có quyền vào đây !!!");
            return;
        }

        try {
            const decoded = jwtDecode<DecodedToken>(token);

            // ⏰ Token hết hạn → xóa và redirect
            if (decoded.exp * 1000 < Date.now()) {
                Cookies.remove("accessToken");
                localStorage.removeItem("accessToken");
                router.replace("/login");
                return;
            }

            // ⚠️ Nếu role KHÔNG phải admin → redirect
            if (decoded.role !== "admin") {
                alert("Truy cập bị từ chối! Chỉ admin mới được phép vào.");
                router.replace("/login");
                return;
            }

        } catch (err) {
            // ❌ Token lỗi hoặc không decode được → redirect
            console.error("Lỗi decode token:", err);
            Cookies.remove("accessToken");
            localStorage.removeItem("accessToken");
            router.replace("/login");
        }
    }, [router]);
}
