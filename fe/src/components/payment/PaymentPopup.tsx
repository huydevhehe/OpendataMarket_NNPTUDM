"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PaymentPopup({ open, onClose, dataset, userToken }) {
    const [wallet, setWallet] = useState(null);
    const [loading, setLoading] = useState(false);

    // Load wallet balance
    useEffect(() => {
        if (!open) return;

        const fetchWallet = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/wallet/me`, {
                    headers: { Authorization: `Bearer ${userToken}` }
                });
                const data = await res.json();
                setWallet(data.balance);
            } catch (err) {
                toast.error("Không thể tải số dư ví");
            }
        };

        fetchWallet();
    }, [open]);

    const handleConfirm = async () => {
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/order`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    dataset_id: dataset.dataset_id,
                    payment_method: "wallet"
                })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error || "Thanh toán thất bại");
            } else {
                toast.success("Thanh toán thành công!");
                onClose(true); // notify parent success
            }

        } catch (err) {
            toast.error("Lỗi kết nối máy chủ");
        }

        setLoading(false);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="bg-[#0f0f1a] border border-gray-700 text-white">
                <DialogHeader>
                    <DialogTitle className="text-xl">Xác nhận thanh toán</DialogTitle>
                </DialogHeader>

                <div className="mt-4 space-y-3">
                    <div>
                        <p className="text-gray-400">Tên dataset:</p>
                        <p className="text-lg font-semibold">{dataset.title}</p>
                    </div>

                    <div>
                        <p className="text-gray-400">Giá:</p>
                        <p className="text-green-400 font-bold text-lg">
                            {dataset.price_vnd.toLocaleString()} VNĐ
                        </p>
                    </div>

                    <div>
                        <p className="text-gray-400">Số dư ví hiện tại:</p>
                        <p className="text-blue-400 font-semibold text-lg">
                            {wallet !== null ? `${wallet.toLocaleString()} VNĐ` : "Đang tải..."}
                        </p>
                    </div>

                    {wallet !== null && (
                        <div>
                            <p className="text-gray-400">Số dư sau khi trừ:</p>
                            <p className="text-yellow-400 font-semibold text-lg">
                                {(wallet - dataset.price_vnd).toLocaleString()} VNĐ
                            </p>
                        </div>
                    )}

                    <div className="flex justify-between pt-5">
                        <Button 
                            variant="outline" 
                            className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            onClick={() => onClose(false)}
                        >
                            Trở lại
                        </Button>

                        <Button 
                            disabled={loading || wallet < dataset.price_vnd}
                            onClick={handleConfirm}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {loading ? "Đang xử lý..." : "Xác nhận thanh toán"}
                        </Button>
                    </div>

                    {wallet < dataset.price_vnd && (
                        <p className="text-red-400 text-sm pt-2">
                            Số dư không đủ. Hãy nạp thêm tiền vào ví.
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
