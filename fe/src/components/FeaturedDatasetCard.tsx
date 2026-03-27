"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/types";
import { Coins, UserCircle, Star, Database, Download } from "lucide-react";

interface FeaturedDatasetCardProps {
    dataset: Dataset;
    onView?: (dataset: Dataset) => void;
}

export default function FeaturedDatasetCard({ dataset, onView }: FeaturedDatasetCardProps) {
    const imageUrl = dataset.thumbnail_url
        ? `http://localhost:3001${dataset.thumbnail_url}`
        : "/placeholder.png";

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

    const sellerName =
        dataset?.seller?.full_name ||
        dataset?.seller?.email?.split("@")[0] ||
        "Người bán ẩn danh";

    return (
        <motion.div
            className="relative w-full h-[380px] rounded-3xl overflow-hidden border border-purple-500/10 shadow-2xl bg-slate-950/50 backdrop-blur-md mb-16"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* ẢNH NỀN */}
            <motion.img
                src={imageUrl}
                alt={dataset.title}
                className="absolute inset-0 w-full h-full object-cover brightness-75 transition-transform duration-700 group-hover:scale-105"
            />

            {/* LỚP PHỦ GRADIENT */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-slate-950/60 to-transparent" />

            {/* NỘI DUNG */}
            <div className="relative z-10 p-10 flex flex-col justify-between h-full max-w-2xl">
                <div>
                    <p className="text-sm font-medium text-purple-400 uppercase mb-2 tracking-widest">
                        🔥 Featured Dataset
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-purple-400 to-green-400 bg-clip-text text-transparent leading-tight drop-shadow-lg mb-4">
                        {dataset.title}
                    </h1>
                    <p className="text-gray-300 text-base md:text-lg mb-6 line-clamp-3">
                        {dataset.description ||
                            "Khám phá dataset độc quyền được chia sẻ bởi cộng đồng AI Việt Nam."}
                    </p>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                            <UserCircle className="w-4 h-4 text-purple-400" />
                            {sellerName}
                        </span>
                        <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" /> 4.9
                        </span>
                        <span className="flex items-center gap-1">
                            <Download className="w-4 h-4 text-green-400" />{" "}
                            {Math.floor(1200 + Math.random() * 600).toLocaleString()}
                        </span>
                    </div>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className={`flex items-center gap-1 ${priceColor} text-lg font-semibold`}>
                        <Coins className="w-5 h-5" />
                        {priceLabel}
                    </div>
                    <Button
                        onClick={() => onView?.(dataset)}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-green-500 text-white font-bold text-base shadow-md hover:shadow-lg hover:from-purple-500 hover:to-green-400 transition-all duration-300"
                    >
                        Khám phá ngay →
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
