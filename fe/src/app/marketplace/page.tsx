"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
    Search,
    SortAsc,
    SortDesc,
    Grid3X3,
    List,
    Database,
    Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DatasetCard } from "@/components/datasetCard";
import { useActiveDatasets } from "@/hooks/dataset/useDataset";
import { useCategories } from "@/hooks/category/useCategory";
import { Dataset } from "@/types";
import Navbar from "@/components/navBar";

export default function MarketplacePage() {
    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const { data: categories = [] } = useCategories();
    const { data: allDatasets = [], isLoading } = useActiveDatasets();

    const datasets = useMemo(() => {
        let filtered = allDatasets.filter((ds: Dataset) => {
            const matchSearch = ds.title.toLowerCase().includes(search.toLowerCase());
            const matchCat = selectedCategory
                ? ds.category?.category_id === selectedCategory
                : true;
            return matchSearch && matchCat;
        });

        return filtered.sort((a, b) =>
            sortOrder === "asc"
                ? a.title.localeCompare(b.title)
                : b.title.localeCompare(a.title)
        );
    }, [allDatasets, search, selectedCategory, sortOrder]);

    if (isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 pt-32">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div
                                key={i}
                                className="rounded-2xl glass p-4 flex flex-col space-y-4 animate-pulse"
                            >
                                <Skeleton className="h-48 w-full rounded-xl bg-slate-800" />
                                <Skeleton className="h-6 w-3/4 bg-slate-700" />
                                <Skeleton className="h-4 w-1/2 bg-slate-700" />
                                <Skeleton className="h-8 w-24 bg-slate-700 rounded-lg" />
                            </div>
                        ))}
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white py-16 pt-32">
                <div className="max-w-7xl mx-auto px-6">
                    {/* 🪄 Hero Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-16 space-y-6"
                    >
                        <h1 className="text-6xl font-extrabold bg-gradient-to-r from-purple-400 via-green-400 to-cyan-400 bg-clip-text text-transparent">
                            Marketplace Datasets
                        </h1>
                        <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
                            Khám phá, chia sẻ và thương mại hóa dữ liệu AI – nơi cộng đồng Việt Nam
                            kết nối tri thức & sáng tạo 🚀
                        </p>
                        <div className="flex justify-center gap-6 mt-6">
                            {[
                                { label: "Datasets", value: "12.5K+", color: "text-green-400" },
                                { label: "Người dùng", value: "3.2K+", color: "text-purple-400" },
                                { label: "Danh mục", value: "48+", color: "text-cyan-400" },
                            ].map((s, i) => (
                                <div
                                    key={i}
                                    className="bg-slate-900/60 rounded-lg px-4 py-3 border border-gray-700 backdrop-blur-md"
                                >
                                    <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                                    <p className="text-gray-400 text-sm">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* 🔍 Search & Sort */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-10">
                        <div className="relative w-full sm:w-1/2">
                            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm dataset..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full bg-slate-900 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                                }
                                className="glass border-white/20 hover:bg-purple-500/20 transition-all"
                            >
                                {sortOrder === "asc" ? <SortAsc /> : <SortDesc />}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() =>
                                    setViewMode(viewMode === "grid" ? "list" : "grid")
                                }
                                className="glass border-white/20 hover:bg-green-500/20 transition-all"
                            >
                                {viewMode === "grid" ? <List /> : <Grid3X3 />}
                            </Button>
                        </div>
                    </div>

                    {/* 🧩 Category Filter */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-wrap gap-3 mb-12 justify-center"
                    >
                        <Button
                            onClick={() => setSelectedCategory(null)}
                            className={`rounded-full px-6 py-2 transition-all duration-300 ${!selectedCategory
                                    ? "bg-gradient-to-r from-purple-500 to-green-400 text-white shadow-lg shadow-purple-500/20"
                                    : "bg-slate-800 border border-gray-600 text-gray-300 hover:bg-slate-700"
                                }`}
                        >
                            🔥 Tất cả
                        </Button>
                        {categories.map((cat) => (
                            <Button
                                key={cat.category_id}
                                onClick={() => setSelectedCategory(cat.category_id)}
                                className={`rounded-full px-6 py-2 transition-all duration-300 ${selectedCategory === cat.category_id
                                        ? "bg-gradient-to-r from-purple-500 to-green-400 text-white shadow-lg shadow-purple-500/20 scale-105"
                                        : "bg-slate-800 border border-gray-600 text-gray-300 hover:bg-slate-700"
                                    }`}
                            >
                                <Database className="w-4 h-4 mr-2 text-purple-400" />
                                {cat.name}
                            </Button>
                        ))}
                    </motion.div>

                    {/* 🧠 Datasets Section */}
                    {datasets.length === 0 ? (
                        <p className="text-center text-gray-400 mt-20 text-lg">
                            Không tìm thấy dataset nào phù hợp 😔
                        </p>
                    ) : (
                        <motion.div
                            layout
                            className={`grid ${viewMode === "grid"
                                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                    : "grid-cols-1 gap-4"
                                }`}
                        >
                            {datasets.map((ds, index) => (
                                <motion.div
                                    key={ds.dataset_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative"
                                >
                                    <DatasetCard
                                        dataset={ds}
                                        onView={() =>
                                            (window.location.href = `/dataset/${ds.dataset_id}`)
                                        }
                                        className={`glass ${viewMode === "grid"
                                                ? "hover:scale-105"
                                                : "flex hover:translate-x-1"
                                            } hover:shadow-lg hover:shadow-purple-500/30 transition-all duration-300`}
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-end justify-center">
                                        <Button
                                            size="sm"
                                            className="mb-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full"
                                        >
                                            Xem chi tiết
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    )}

                    {/* 🌈 CTA Section */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mt-20"
                    >
                        <h3 className="text-2xl font-semibold mb-4 text-gray-100">
                            Bạn có dữ liệu AI muốn chia sẻ?
                        </h3>
                        <Button
                            onClick={() => (window.location.href = "/upload")}
                            className="bg-gradient-to-r from-green-500 to-purple-500 text-white px-8 py-3 rounded-full hover:scale-105 transition-all"
                        >
                            📤 Đăng dataset của bạn ngay
                        </Button>
                    </motion.div>

                    {/* Back to top */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-center mt-12"
                    >
                        <Button
                            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                            className="bg-gradient-to-r from-purple-500 to-green-400 px-8 py-3 rounded-xl hover:scale-105 transition-all shadow-md shadow-green-500/20"
                        >
                            <Grid3X3 className="mr-2 h-5 w-5" />
                            Trở lại đầu trang
                        </Button>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
