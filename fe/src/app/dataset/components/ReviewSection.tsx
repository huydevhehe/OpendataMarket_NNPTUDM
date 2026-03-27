"use client";

import { Star } from "lucide-react";
import { useState } from "react";
import { Dataset } from "@/types";

export default function ReviewSection({ dataset }: { dataset: Dataset }) {
    const [reviews, setReviews] = useState(dataset.reviews || []);

    return (
        <section className="bg-[#111827]/70 rounded-xl border border-gray-800 p-8 space-y-6">
            <h3 className="text-2xl font-bold text-gray-100">Đánh giá</h3>

            {reviews.length === 0 ? (
                <p className="text-gray-500 italic">Chưa có đánh giá nào.</p>
            ) : (
                <div className="space-y-4">
                    {reviews.map((rev) => (
                        <div
                            key={rev.review_id}
                            className="border-b border-gray-700 pb-3"
                        >
                            {/* STARS */}
                            <div className="flex items-center gap-2 text-yellow-400">
                                {Array.from({ length: rev.rating }).map((_, i) => (
                                    <Star key={i} size={16} fill="gold" />
                                ))}
                            </div>

                            <p className="text-gray-300 mt-2">{rev.comment}</p>

                            <p className="text-gray-500 text-sm mt-1">
                                — {rev.buyer?.full_name || "Ẩn danh"} •{" "}
                                {new Date(rev.created_at).toLocaleDateString("vi-VN")}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
