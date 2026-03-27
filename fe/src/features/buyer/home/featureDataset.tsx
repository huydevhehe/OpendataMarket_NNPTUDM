"use client";

import { useState, FormEvent } from "react";
import { Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DatasetCard } from "@/components/datasetCard";
import { Dataset, Category } from "@/types/index";
import { useActiveDatasets } from "@/hooks/dataset/useDataset";
import { useCategories } from "@/hooks/category/useCategory";
import { motion } from "framer-motion";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Hook filter dataset theo category (GIỮ NGUYÊN)
const useDatasetsWithFilter = (categoryId: string | null) => {
  const { data: allDatasets = [], isLoading } = useActiveDatasets();

  const filteredDatasets = categoryId
    ? allDatasets.filter(
        (ds: Dataset) => ds.category?.category_id === categoryId
      )
    : allDatasets;

  return { data: filteredDatasets, isLoading };
};

export function FeaturedDatasets() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { data: categories = [], isLoading: categoriesLoading } =
    useCategories();
  const { data: datasets = [], isLoading: datasetsLoading } =
    useDatasetsWithFilter(selectedCategory);

  // ===== STATE & HANDLER CHO AI SEARCH (GIỮ NGUYÊN) =====
  const [aiQuery, setAiQuery] = useState("");
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDatasets, setAiDatasets] = useState<Dataset[] | null>(null);

  const handleViewDataset = (dataset: Dataset) => {
    window.location.href = `/dataset/${dataset.dataset_id}`;
  };

  const handleAskAI = async (e: FormEvent) => {
    e.preventDefault();

    const query = aiQuery.trim();
    if (!query || aiLoading) return;

    try {
      setAiLoading(true);
      setAiReply(null);
      setAiDatasets(null);

      const res = await fetch(`${API_BASE_URL}/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      setAiReply(data?.reply ?? null);

      if (Array.isArray(data?.datasets)) {
        setAiDatasets(data.datasets as Dataset[]);
      } else {
        setAiDatasets(null);
      }
    } catch (error) {
      console.error("AI search error:", error);
      setAiReply(
        "Có lỗi khi hỏi AI gợi ý dataset. Bạn thử lại sau giúp mình nhé."
      );
      setAiDatasets(null);
    } finally {
      setAiLoading(false);
    }
  };

  // Nếu AI đã trả về dataset (kể cả rỗng) thì ưu tiên hiển thị nó
  const displayDatasets =
    aiDatasets !== null ? aiDatasets : (datasets as Dataset[]);

  return (
    <section
      id="datasets"
      className="py-20 bg-gradient-to-b from-transparent to-slate-900/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header + AI search input */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }} // cuộn lên/xuống vẫn chạy lại
          transition={{ duration: 0.8 }}
        >
          <h2 className="font-bold text-4xl sm:text-5xl mb-6 text-white">
            Dataset{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_14px_rgba(168,85,247,0.45)]">
              Nổi bật
            </span>
          </h2>
          <p className="text-xl text-gray-300/90 max-w-2xl mx-auto mb-6">
            Khám phá các bộ dữ liệu được đánh giá cao nhất từ cộng đồng
          </p>

          {/* Ô tìm kiếm có AI hỗ trợ */}
          <form
            onSubmit={handleAskAI}
            className="max-w-2xl mx-auto flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4"
          >
            <input
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-full bg-slate-900/70 border border-purple-500/40 text-sm sm:text-base text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/70 focus:border-purple-400 shadow-[0_0_14px_rgba(168,85,247,0.35)]"
              placeholder="Mô tả dataset bạn cần (vd: AI nhận diện trái cây từ ảnh...)"
            />
            <Button
              type="submit"
              disabled={aiLoading}
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm sm:text-base font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/40 hover:scale-105 hover:shadow-purple-400/60 active:scale-95 transition-transform disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {aiLoading ? "AI Đang Tìm" : "Tìm Kiếm Bằng AI"}
            </Button>
          </form>

          {aiReply && (
            <p className="mt-3 text-sm sm:text-base text-purple-200/90 max-w-2xl mx-auto bg-slate-900/60 border border-purple-500/30 rounded-2xl px-4 py-3">
              {aiReply}
            </p>
          )}
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          {categoriesLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-28 rounded-full" />
            ))
          ) : (
            <>
              {/* Tất cả */}
              <Button
                variant={!selectedCategory ? "default" : "outline"}
                onClick={() => {
                  setSelectedCategory(null);
                  setAiDatasets(null); // reset AI khi đổi filter tay
                  setAiReply(null);
                }}
                className={`transition-all duration-300 font-semibold rounded-full px-6 py-2 ${
                  !selectedCategory
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/40"
                    : "border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:scale-105 cursor-pointer"
                }`}
              >
                🔥 Tất cả
              </Button>

              {categories.map((cat: Category) => (
                <Button
                  key={cat.category_id}
                  variant={
                    selectedCategory === cat.category_id ? "default" : "outline"
                  }
                  onClick={() => {
                    setSelectedCategory(cat.category_id);
                    setAiDatasets(null); // khi lọc bằng category thì bỏ kết quả AI
                  }}
                  className={`transition-all duration-300 font-semibold rounded-full px-6 py-2 ${
                    selectedCategory === cat.category_id
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                      : "border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:scale-105 cursor-pointer"
                  }`}
                >
                  {cat.name}
                </Button>
              ))}
            </>
          )}
        </motion.div>

        {/* Datasets Grid */}
        {datasetsLoading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden bg-black/40 backdrop-blur-md border border-purple-500/20"
              >
                <Skeleton className="h-48 w-full" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-24" />
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            {displayDatasets.map((dataset: Dataset, index) => (
              <motion.div
                key={dataset.dataset_id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6, delay: index * 0.08 }}
              >
                <DatasetCard
                  dataset={dataset}
                  onView={handleViewDataset}
                  className="w-full h-auto relative z-0 rounded-xl transition-all duration-300 hover:scale-105 bg-black/40 backdrop-blur-md border border-purple-500/20 shadow-lg hover:shadow-purple-500/20"
                />
              </motion.div>
            ))}

            {/* Nếu AI đã tìm mà không có dataset nào phù hợp */}
            {aiDatasets && aiDatasets.length === 0 && (
              <motion.p
                className="col-span-full text-center text-gray-300 mt-4"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.2 }}
                transition={{ duration: 0.6 }}
              >
                AI không tìm được dataset phù hợp với mô tả của bạn.
                Bạn thử mô tả cụ thể hơn, đổi từ khóa hoặc chọn bộ lọc phía trên
                nhé.
              </motion.p>
            )}
          </motion.div>
        )}

        {/* View All */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Button
            variant="outline"
            size="lg"
            className="border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:text-white hover:scale-110 transition-all duration-300"
            onClick={() => (window.location.href = "/marketplace")}
          >
            <Grid3X3 className="mr-2 h-5 w-5" />
            Xem tất cả dataset
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
