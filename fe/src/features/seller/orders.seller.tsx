"use client";

import { useEffect, useState } from "react";
import { useOrders, useUpdateOrder } from "@/hooks/order/useOrder";
import { useCreateTransaction } from "@/hooks/transaction/useTransaction";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { PaymentStatus, ConfirmStatus } from "@/types";

export default function SellerOrdersPage() {
    const [token, setToken] = useState<string>("");

    useEffect(() => {
        const stored = localStorage.getItem("accessToken");
        if (stored) setToken(stored);
    }, []);

    const { data: orders, isLoading } = useOrders(token);
    const updateOrder = useUpdateOrder(token);
    const createTxn = useCreateTransaction(token);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    // ✅ Xác nhận đơn hàng -> cập nhật order + tạo transaction
    const handleConfirm = async (orderId: string, bank_ref?: string) => {
        try {
            setLoadingId(orderId);

            // B1: cập nhật trạng thái đơn hàng
            await updateOrder.mutateAsync({
                id: orderId,
                data: { status: PaymentStatus.completed },
            });

            // B2: tạo giao dịch tương ứng
            const payload = {
                order_id: orderId,
                status: ConfirmStatus.confirmed,
                bank_ref: bank_ref || null,
            };

            console.log("📦 Transaction payload gửi BE:", payload);

            await createTxn.mutateAsync(payload);

            toast.success("✅ Đã xác nhận đơn hàng và tạo giao dịch thành công!");
        } catch (err) {
            console.error("🔥 Lỗi khi xác nhận đơn hàng:", err);
            toast.error("Lỗi khi xác nhận đơn hàng hoặc tạo giao dịch");
        } finally {
            setLoadingId(null);
        }
    };

    // ❌ Huỷ đơn hàng -> cập nhật order + tạo transaction failed
    const handleCancel = async (orderId: string, bank_ref?: string) => {
        try {
            setLoadingId(orderId);

            await updateOrder.mutateAsync({
                id: orderId,
                data: { status: PaymentStatus.failed },
            });

            const payload = {
                order_id: orderId,
                status: ConfirmStatus.failed,
                bank_ref: bank_ref || null,
            };

            console.log("📦 Transaction payload gửi BE:", payload);

            await createTxn.mutateAsync(payload);

            toast.warning("🚫 Đơn hàng bị huỷ và đã ghi nhận giao dịch thất bại!");
        } catch (err) {
            console.error("🔥 Lỗi khi huỷ đơn hàng:", err);
            toast.error("Lỗi khi huỷ đơn hàng hoặc tạo giao dịch");
        } finally {
            setLoadingId(null);
        }
    };

    if (isLoading)
        return <p className="text-center text-gray-400 mt-10">Đang tải đơn hàng...</p>;

    if (!orders || orders.length === 0)
        return <p className="text-center text-gray-400 mt-10">Chưa có đơn hàng nào.</p>;

    const sortedOrders = [...orders].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return (
        <div className="max-w-5xl mx-auto py-8 space-y-4">
            <h1 className="text-2xl font-bold text-cyan-400 mb-6">📦 Đơn hàng của bạn</h1>

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
                        <p className="text-sm text-blue-300">
  Mã đơn hàng: {order.order_id}
</p>

                        <p>
                            👤 Người mua:{" "}
                            <strong>{order.buyer?.full_name || "Ẩn danh"}</strong>
                        </p>
                        <p>💰 Tổng tiền: {order.total_amount.toLocaleString()} VND</p>
                        <p>📅 Ngày đặt: {new Date(order.created_at).toLocaleString()}</p>
                        <p>🏦 Phương thức thanh toán: {order.payment_method}</p>
                        <p>🔗 Mã giao dịch: {order.bank_ref || "—"}</p>

                        {order.status === "pending" && (
                            <div className="flex gap-3 pt-3">
                                <Button
                                    onClick={() =>
                                        handleConfirm(order.order_id, order.bank_ref)
                                    }
                                    disabled={loadingId === order.order_id}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {loadingId === order.order_id
                                        ? "Đang xử lý..."
                                        : "✅ Xác nhận"}
                                </Button>

                                <Button
                                    onClick={() =>
                                        handleCancel(order.order_id, order.bank_ref)
                                    }
                                    disabled={loadingId === order.order_id}
                                    className="bg-red-600 hover:bg-red-700"
                                >
                                    ❌ Huỷ
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
