"use client";

import { useOrders } from "@/hooks/order/useOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function BuyerOrderStatusPage() {
    const [token, setToken] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("accessToken");
        setToken(stored);
        setMounted(true);
    }, []);

    // 🔹 Luôn gọi useOrders, nhưng nếu chưa có token thì skip trong hook
    const { data: orders, isLoading } = useOrders(token ?? "");

    // 🔹 SSR placeholder
    if (!mounted) {
        return <p className="text-center text-gray-400 mt-10">Đang tải đơn hàng...</p>;
    }

    // 🔹 Nếu chưa đăng nhập
    if (!token) {
        return <p className="text-center text-gray-400 mt-10">
            Vui lòng đăng nhập để xem đơn hàng.
        </p>;
    }

    if (isLoading)
        return <p className="text-center text-gray-400 mt-10">Đang tải đơn hàng...</p>;

    if (!orders || orders.length === 0)
        return <p className="text-center text-gray-400 mt-10">Bạn chưa có đơn hàng nào.</p>;

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-4">
            <h1 className="text-2xl font-bold text-cyan-400 mb-6">🛒 Đơn hàng của tôi</h1>

            {sortedOrders.map((order: any) => (
                <Card
                    key={order.order_id}
                    className="bg-gray-900/60 border border-gray-700 hover:border-cyan-600 transition-colors"
                >
                    <CardHeader>
                        <CardTitle className="text-white flex justify-between items-center">
                            <span>{order.dataset?.title || "Dataset không xác định"}</span>
                            <Badge
                                className={
                                    order.status === "pending"
                                        ? "bg-yellow-500/20 text-yellow-300"
                                        : order.status === "completed"
                                            ? "bg-green-500/20 text-green-300"
                                            : "bg-red-500/20 text-red-300"
                                }
                            >
                                {order.status}
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="text-gray-300 space-y-2">
                        <p>💰 Tổng tiền: {order.total_amount.toLocaleString()} VND</p>
                        <p>📅 Ngày đặt: {new Date(order.created_at).toLocaleString()}</p>
                        <p>🏦 Phương thức thanh toán: {order.payment_method}</p>
                        <p>🔗 Mã giao dịch: {order.bank_ref || "—"}</p>

                        {order.status === "pending" && (
                            <p className="text-yellow-400 font-semibold pt-3">
                                ⏳ Đang chờ người bán xác nhận thanh toán...
                            </p>
                        )}

                        {order.status === "completed" && (
                            <div className="pt-3">
                                <p className="text-green-400 font-semibold">
                                    ✅ Thanh toán thành công!
                                </p>
                                <Link
                                    href={`http://localhost:3001${order.dataset.file_url}`}
                                    className="inline-block mt-2"
                                >
                                    <Button className="bg-cyan-600 hover:bg-cyan-700">
                                        ⬇️ Tải Dataset
                                    </Button>
                                </Link>
                            </div>
                        )}

                        {order.status === "failed" && (
                            <p className="text-red-400 font-semibold pt-3">
                                ❌ Người bán đã huỷ đơn hàng này.
                            </p>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
