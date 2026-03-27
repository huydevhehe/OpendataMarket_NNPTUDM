"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/types";
import { Database, UserCircle, Coins, Star, Download } from "lucide-react";

interface DatasetCardProps {
    dataset: Dataset;
    onView?: (dataset: Dataset) => void;
    className?: string;
}

export function DatasetCard({ dataset, onView, className }: DatasetCardProps) {
    const imageUrl = dataset.thumbnail_url
        ? `http://localhost:3001${dataset.thumbnail_url}`
        : "/placeholder.png";

    const sellerName =
        dataset?.seller?.full_name ||
        dataset?.seller?.email?.split("@")[0] ||
        "Người bán ẩn danh";

    const priceVnd = dataset.price_vnd ?? 0;
    const priceEth = dataset.price_eth ?? 0;

    const priceLabel =
        priceVnd > 0
            ? `${priceVnd.toLocaleString()} VNĐ`
            : priceEth > 0
                ? `${priceEth} ETH`
                : "Miễn phí";

    const priceColor =
        priceVnd > 0 || priceEth > 0 ? "text-purple-300" : "text-green-400";

    const fakeRating = 4.7;
    const fakeDownloads = 1200 + Math.floor(Math.random() * 500);

    return (
        <motion.div
            whileHover={{ scale: 1.03, y: -3 }}
            transition={{ duration: 0.25 }}
            className={`relative group cursor-pointer ${className}`}
        >
            <Card
                className="overflow-hidden rounded-2xl border border-gray-800 bg-slate-900/60 backdrop-blur-lg shadow-xl hover:shadow-purple-500/40 transition-all duration-300"
            >
                {/* ẢNH NỀN */}
                <div className="relative w-full h-44 overflow-hidden">
                    <motion.img
                        src={imageUrl}
                        alt={dataset.title}
                        className="w-full h-full object-cover rounded-t-2xl transform transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    {/* TAG DANH MỤC */}
                    {dataset.category?.name && (
                        <span className="absolute top-3 left-3 text-xs bg-purple-600/70 px-2 py-1 rounded-md text-white font-medium shadow-md backdrop-blur-sm">
                            {dataset.category.name}
                        </span>
                    )}
                </div>

                <CardContent className="p-5">
                    {/* TIÊU ĐỀ */}
                    <h3 className="font-bold text-lg bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent mb-1 line-clamp-1 transition-all duration-300 group-hover:scale-[1.02]">
                        {dataset.title}
                    </h3>

                    {/* MÔ TẢ */}
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2 group-hover:text-gray-300 transition-colors">
                        {dataset.description || "Không có mô tả chi tiết."}
                    </p>

                    {/* META: NGƯỜI BÁN, RATING, LƯỢT TẢI */}
                    <div className="flex items-center justify-between text-gray-400 text-sm mb-3">
                        <div className="flex items-center gap-1">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            <span className="truncate max-w-[120px]">
                                {sellerName}
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span>{fakeRating}</span>
                            <Download className="w-4 h-4 text-green-400 ml-2" />
                            <span>{fakeDownloads.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* GIÁ + ĐỊNH DẠNG */}
                    <div className="flex items-center justify-between mb-5">
                        <div
                            className={`font-semibold flex items-center gap-1 ${priceColor}`}
                        >
                            <Coins className="w-4 h-4" />
                            <span>{priceLabel}</span>
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Database className="w-3 h-3 text-green-400" />
                            {dataset.file_format?.toUpperCase() || "CSV"}
                        </div>
                    </div>

                    {/* CTA */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileHover={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Button
                            onClick={() => onView?.(dataset)}
                            className="w-full bg-gradient-to-r from-purple-600 to-green-500 text-white font-bold text-base shadow-md hover:shadow-lg hover:from-purple-500 hover:to-green-400 transition-all duration-300"
                        >
                            <motion.span
                                whileHover={{ x: 2 }}
                                transition={{ type: "spring", stiffness: 200 }}
                            >
                                🔍 Xem chi tiết
                            </motion.span>
                        </Button>
                    </motion.div>
                </CardContent>
            </Card>

            {/* BORDER GLOW HOVER */}
            <motion.div
                className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-purple-500/40 pointer-events-none transition-all duration-500"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
            />
        </motion.div>
    );
}
