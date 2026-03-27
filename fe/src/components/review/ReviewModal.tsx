"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReviewModal({ open, onClose, datasetId, orderId, onSubmitted }) {
    const router = useRouter();

    // Không render nếu open = false
    if (!open) return null;

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    // Khi popup mở → reset input
    useEffect(() => {
        if (open) {
            setRating(5);
            setComment("");
        }
    }, [open]);

    const submitReview = async () => {
        try {
            const token = localStorage.getItem("accessToken");

            const res = await fetch("http://localhost:3001/review", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    dataset_id: datasetId,
                    order_id: orderId,
                    rating,
                    comment,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                alert("Đánh giá thành công!");

                // Cập nhật UI không reload
                if (onSubmitted) onSubmitted(data);

                // Xóa query ?review=1&order_id=...
                router.replace(`/dataset/${datasetId}`);

                onClose();
            } else {
                alert(data.error || "Lỗi đánh giá!");
            }
        } catch (err) {
            console.log(err);
            alert("Lỗi server.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-slate-900 p-6 rounded-xl w-[90%] max-w-md border border-slate-700 shadow-xl">

                <h2 className="text-xl font-bold text-white mb-3">Đánh giá dataset</h2>

                <p className="text-gray-400 text-sm mb-3">
                    Mã đơn hàng: {orderId}
                </p>

                {/* STAR RATING */}
                <div className="flex gap-2 mb-4">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <Star
                            key={num}
                            size={28}
                            onClick={() => setRating(num)}
                            className={`cursor-pointer ${
                                num <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-500"
                            }`}
                        />
                    ))}
                </div>

                {/* COMMENT */}
                <textarea
                    className="w-full p-2 bg-slate-800 text-white rounded mb-4 resize-none"
                    rows={3}
                    placeholder="Nhận xét của bạn..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                />

                <div className="flex justify-end gap-2">
                    <button
                        onClick={() => {
                            router.replace(`/dataset/${datasetId}`);
                            onClose();
                        }}
                        className="px-4 py-2 rounded bg-gray-600 text-white"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={submitReview}
                        className="px-4 py-2 rounded bg-yellow-500 text-black font-bold"
                    >
                        Gửi đánh giá
                    </button>
                </div>
            </div>
        </div>
    );
}
