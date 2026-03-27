"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    BarChart,
    ShieldCheck,
    Download,
    DollarSign,
    Info,
    Database,
    ScrollText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dataset } from "@/types";
import {
    BarChart as Chart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import { useDatasetPreview } from "@/hooks/dataset/useDatasetPreview";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import ChatWithSellerButton from "@/components/ChatWithSellerButton"; // ✅ Thêm import này

export default function DatasetOverview({ dataset }: { dataset: Dataset }) {
    const [activeTab, setActiveTab] = useState<"info" | "preview" | "license">("info");
    const { id } = useParams();
    const { data: previewData, isLoading, error } = useDatasetPreview(id as string, 5);

    // 🧭 Metadata thật
    const metadata = {
        rows: previewData?.total_rows?.toLocaleString() ?? "—",
        columns: previewData?.total_columns ?? "—",
        format: dataset.file_format || "CSV",
        size: dataset.file_size_mb ? `${dataset.file_size_mb} MB` : "—",
        updated: dataset.updated_at,
    };

    // 🎨 Demo chart
    const countryDistribution = [
        { country: "Vietnam", users: 400 },
        { country: "USA", users: 300 },
        { country: "Japan", users: 250 },
        { country: "Korea", users: 150 },
    ];
    const COLORS = ["#A855F7", "#22D3EE", "#34D399", "#FBBF24"];

    // ⚙️ Xử lý tải hoặc mua dataset
    const handleAction = () => {
        if (!dataset.file_url) {
            toast.error("❌ Dataset này chưa có file để tải.");
            return;
        }

        const token = localStorage.getItem("accessToken");
        const downloadUrl = `http://localhost:3001/dataset/${dataset.dataset_id}/download`;

        // 🔹 Miễn phí → tải ngay
        if (dataset.price_vnd === 0 && dataset.price_eth === 0) {
            window.open(downloadUrl, "_blank");
            return;
        }

        // 🔹 Nếu chưa đăng nhập → yêu cầu đăng nhập
        if (!token) {
            toast.warning("⚠️ Bạn cần đăng nhập để mua hoặc tải dataset này!");
            return;
        }

        // 🔹 Nếu có giá VNĐ → chuyển sang trang thanh toán VNĐ
        if (dataset.price_vnd && dataset.price_vnd > 0) {
            window.location.href = `/dataset/${dataset.dataset_id}/payment`;
            return;
        }

        // 🔹 Nếu có giá ETH → xử lý sau (web3 hoặc chuyển hướng)
        if (dataset.price_eth && dataset.price_eth > 0) {
            toast.info("🪙 Chức năng thanh toán bằng ETH sẽ sớm được cập nhật.");
            return;
        }

        toast.error("Không thể xác định phương thức mua dataset này.");
    };

    return (
        <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-[#151823]/90 rounded-xl border border-gray-800 p-6 md:p-8 shadow-xl backdrop-blur-md"
        >
            {/* 🧭 Tabs */}
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                {[
                    { id: "info", label: "Thông tin", icon: Info },
                    { id: "preview", label: "Preview", icon: Database },
                    { id: "license", label: "License", icon: ScrollText },
                ].map((tab) => (
                    <Button
                        key={tab.id}
                        variant={activeTab === tab.id ? "default" : "outline"}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 rounded-full text-sm transition-all duration-200 ${activeTab === tab.id
                            ? "bg-gradient-to-r from-purple-500 to-green-400 text-white shadow-lg"
                            : "bg-slate-800 border border-gray-700 text-gray-300 hover:bg-slate-700"
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </Button>
                ))}
            </div>

            {/* 🧠 Tab content */}
            <AnimatePresence mode="wait">
                {activeTab === "info" && (
                    <motion.div
                        key="info"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-400" /> Thông tin Dataset
                        </h3>

                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex justify-between">
                                <span>📦 Số dòng:</span> <span>{metadata.rows}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🧱 Số cột:</span> <span>{metadata.columns}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>💾 Dung lượng:</span> <span>{metadata.size}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>📁 Định dạng:</span> <span>{metadata.format}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>🕒 Cập nhật:</span>
                                <span>{new Date(metadata.updated).toLocaleDateString("vi-VN")}</span>
                            </div>
                        </div>

                        <div className="bg-[#111827]/80 p-3 rounded-lg border border-gray-700 text-sm">
                            <h4 className="font-semibold text-gray-200 mb-2">💡 Ứng dụng / Giá trị</h4>
                            <ul className="list-disc list-inside text-gray-400 space-y-1">
                                <li>Huấn luyện mô hình AI / Machine Learning</li>
                                <li>Phân tích hành vi khách hàng & thị trường</li>
                                <li>Tiết kiệm thời gian thu thập & xử lý dữ liệu</li>
                            </ul>
                        </div>
                    </motion.div>
                )}

                {activeTab === "preview" && (
                    <motion.div
                        key="preview"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                            <BarChart className="w-5 h-5 text-purple-400" /> Dataset Preview
                        </h3>

                        <div className="bg-[#0f172a] p-3 rounded-lg border border-gray-700 overflow-x-auto text-sm text-gray-300">
                            {isLoading ? (
                                <p className="text-gray-500">Đang tải dữ liệu...</p>
                            ) : error ? (
                                <p className="text-red-400">Không thể tải preview.</p>
                            ) : previewData?.rows?.length ? (
                                <table className="min-w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            {previewData.columns?.map((col: string) => (
                                                <th
                                                    key={col}
                                                    className="border-b border-gray-600 p-2 text-gray-400 text-left"
                                                >
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {previewData.rows.slice(0, 5).map((row: any, i: number) => (
                                            <tr key={i} className="hover:bg-gray-800/30">
                                                {previewData.columns.map((col: string) => (
                                                    <td key={col} className="p-2 border-b border-gray-700">
                                                        {String(row[col] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-400">Không có dữ liệu để hiển thị.</p>
                            )}
                        </div>

                        <div className="bg-[#0f172a]/80 p-4 rounded-lg border border-gray-700 text-gray-200">
                            <h4 className="font-semibold text-gray-100 mb-3">
                                📈 Phân bố người dùng theo quốc gia
                            </h4>
                            <ResponsiveContainer width="100%" height={250}>
                                <Chart
                                    data={countryDistribution}
                                    margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="country" stroke="#9CA3AF" />
                                    <YAxis stroke="#9CA3AF" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "#1F2937",
                                            border: "1px solid #374151",
                                            color: "#fff",
                                        }}
                                    />
                                    <Bar dataKey="users">
                                        {countryDistribution.map((_, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </Chart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                )}

                {activeTab === "license" && (
                    <motion.div
                        key="license"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h3 className="text-xl font-semibold text-gray-100 flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-green-400" /> Giấy phép sử dụng
                        </h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            📜 <strong>License:</strong> CC BY 4.0 — Cho phép sao chép, chỉnh sửa, chia sẻ và
                            sử dụng thương mại, miễn là ghi nguồn tác giả.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 🛒 CTA Section */}
            <div className="pt-8 border-t border-gray-700 space-y-3">
                <Button
                    onClick={handleAction}
                    className={`w-full flex items-center justify-center gap-2 rounded-full text-white transition-all ${dataset.price_vnd === 0 && dataset.price_eth === 0
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-gradient-to-r from-purple-500 to-blue-500 hover:opacity-90"
                        }`}
                >
                    {dataset.price_vnd === 0 && dataset.price_eth === 0 ? (
                        <>
                            <Download className="w-4 h-4" /> Tải miễn phí
                        </>
                    ) : dataset.price_vnd && dataset.price_vnd > 0 ? (
                        <>
                            <DollarSign className="w-4 h-4" /> {dataset.price_vnd.toLocaleString()} VNĐ
                        </>
                    ) : dataset.price_eth && dataset.price_eth > 0 ? (
                        <>
                            <Download className="w-4 h-4" /> {dataset.price_eth} ETH
                        </>
                    ) : (
                        <>
                            <Download className="w-4 h-4" /> Không khả dụng
                        </>
                    )}
                </Button>

                {/* 💬 Nút chat với người bán */}
                {dataset?.seller?.user_id && (
                    <ChatWithSellerButton sellerId={dataset.seller.user_id} />
                )}
            </div>
        </motion.section>
    );
}
