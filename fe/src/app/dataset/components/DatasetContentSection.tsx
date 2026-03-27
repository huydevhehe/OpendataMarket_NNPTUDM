"use client";

import {
    ShieldCheck,
    Info,
    Database,
    BarChart2,
    PieChart as PieIcon,
} from "lucide-react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts";

import { Dataset } from "@/types";
import { useDatasetPreview } from "@/hooks/dataset/useDatasetPreview";
import { useParams } from "next/navigation";

/* =======================================================
   🧠 Helper: Suy luận kiểu dữ liệu và mô tả thông minh
======================================================= */
function inferColumnType(values: any[]): string {
    const sampleValues = values.slice(0, 10).filter(v => v !== null && v !== undefined);
    if (sampleValues.length === 0) return "unknown";

    const isNumber = sampleValues.every(v => !isNaN(Number(v)));
    if (isNumber) {
        const hasDecimal = sampleValues.some(v => String(v).includes("."));
        return hasDecimal ? "float" : "integer";
    }

    const isBoolean = sampleValues.every(v =>
        ["true", "false", true, false].includes(String(v).toLowerCase())
    );
    if (isBoolean) return "boolean";

    const isDate = sampleValues.every(v => !isNaN(Date.parse(v)));
    if (isDate) return "date";

    return "string";
}

function generateColumnDescription(name: string): string {
    const lower = name.toLowerCase();

    if (lower.includes("id")) return "Mã định danh duy nhất của bản ghi";
    if (lower.includes("name")) return "Tên của đối tượng hoặc người dùng";
    if (lower.includes("age")) return "Độ tuổi người dùng hoặc đối tượng";
    if (lower.includes("date")) return "Thời điểm ghi nhận hoặc tạo dữ liệu";
    if (lower.includes("time")) return "Thời gian cụ thể trong ngày";
    if (lower.includes("year")) return "Năm của dữ liệu hoặc sự kiện";
    if (lower.includes("location") || lower.includes("city") || lower.includes("country"))
        return "Địa điểm hoặc quốc gia liên quan";
    if (lower.includes("score") || lower.includes("mark") || lower.includes("grade"))
        return "Điểm số hoặc kết quả đánh giá";
    if (lower.includes("price") || lower.includes("cost") || lower.includes("amount"))
        return "Giá trị hoặc chi phí liên quan";
    if (lower.includes("status")) return "Trạng thái hoặc tình trạng dữ liệu";
    if (lower.includes("email")) return "Địa chỉ email";
    if (lower.includes("phone")) return "Số điện thoại liên hệ";

    return "Không có mô tả cho cột này";
}

/* =======================================================
   🧩 Component chính
======================================================= */
export default function DatasetContentSection({ dataset }: { dataset: Dataset }) {
    const datasetTags = Array.isArray(dataset.tags) ? dataset.tags : [];
    const { id } = useParams();
    const { data: previewData, isLoading } = useDatasetPreview(id as string);

    // 🧭 Metadata thật
    const metadata = {
        rows: previewData?.total_rows?.toLocaleString() ?? "—",
        columns: previewData?.total_columns ?? "—",
        format: dataset.file_format || "CSV",
        size: dataset.file_size_mb ? `${dataset.file_size_mb} MB` : "—",
        updated: dataset.updated_at,
    };

    // ✅ Mock visualization data (sau này thay bằng API)
    const barData = [
        { name: "18-24", users: 4000 },
        { name: "25-34", users: 8000 },
        { name: "35-44", users: 6200 },
        { name: "45-54", users: 3500 },
        { name: "55+", users: 1800 },
    ];

    const pieData = [
        { name: "Việt Nam", value: 45 },
        { name: "Thái Lan", value: 20 },
        { name: "Singapore", value: 15 },
        { name: "Malaysia", value: 10 },
        { name: "Khác", value: 10 },
    ];

    const COLORS = ["#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EF4444"];

    return (
        <section className="bg-[#111827]/80 rounded-xl border border-[#2A2E35] p-8 shadow-lg space-y-10">
            {/* ================= Header ================= */}
            <div className="flex flex-wrap justify-between items-center border-b border-[#2A2E35] pb-4">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                    <span>Verified Provider</span>
                </div>
                <span className="text-xs bg-purple-700/30 px-3 py-1 rounded-full text-purple-300">
                    {dataset.category?.name}
                </span>
            </div>

            {/* ================= Dataset Info ================= */}
            <div>
                <h2 className="text-4xl font-bold text-gray-100 mb-4">
                    {dataset.title}
                </h2>
                <p className="text-gray-400 leading-relaxed">
                    {dataset.description ||
                        "Không có mô tả chi tiết cho dataset này. Bạn có thể liên hệ người bán để biết thêm thông tin."}
                </p>
            </div>

            {/* ================= Quick Stats ================= */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                    { label: "Định dạng", value: metadata.format },
                    { label: "Số dòng", value: isLoading ? "..." : metadata.rows },
                    { label: "Số cột", value: isLoading ? "..." : metadata.columns },
                    { label: "Kích thước", value: metadata.size },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="bg-[#1a1f2e] border border-gray-700 rounded-lg py-3"
                    >
                        <p className="text-purple-400 font-bold text-lg">{stat.value}</p>
                        <p className="text-gray-400 text-xs">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ================= Technical Overview ================= */}
            <div className="bg-[#0f172a]/80 p-6 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-100">
                    <Info className="w-5 h-5 text-purple-400" /> Tổng quan kỹ thuật
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Dataset bao gồm dữ liệu thương mại điện tử được thu thập trong giai đoạn
                    2020–2024, đã được tiền xử lý, chuẩn hóa và loại bỏ dữ liệu trùng lặp.
                    Phù hợp cho các bài toán{" "}
                    <span className="text-green-400">Machine Learning</span>,
                    <span className="text-blue-400"> Clustering</span> và
                    <span className="text-yellow-400"> Forecasting</span>.
                </p>
            </div>

            {/* ================= Data Schema Table ================= */}
            <div className="bg-[#0f172a]/80 p-6 rounded-lg border border-gray-700 space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2 text-gray-100">
                    <Database className="w-5 h-5 text-green-400" /> Cấu trúc dữ liệu
                </h3>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-gray-300 border-collapse">
                        <thead className="text-gray-400 border-b border-gray-700">
                            <tr>
                                <th className="text-left py-2 px-4">Cột</th>
                                <th className="text-left py-2 px-4">Kiểu</th>
                                <th className="text-left py-2 px-4">Mô tả</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-500">
                                        Đang tải cấu trúc dữ liệu...
                                    </td>
                                </tr>
                            ) : previewData?.columns && previewData.columns.length > 0 ? (
                                previewData.columns.map((col: string, i: number) => {
                                    const values = previewData.rows?.map(r => r[col]);
                                    const type = inferColumnType(values);
                                    const desc = generateColumnDescription(col);
                                    return (
                                        <tr
                                            key={i}
                                            className="border-b border-gray-800 hover:bg-gray-800/40 transition-colors"
                                        >
                                            <td className="py-2 px-4 font-medium text-gray-200">{col}</td>
                                            <td className="py-2 px-4 text-purple-400">{type}</td>
                                            <td className="py-2 px-4 text-gray-400">{desc}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="text-center py-4 text-gray-500">
                                        Không tìm thấy cấu trúc dữ liệu.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ================= Visualization Section ================= */}
            <div className="space-y-10 mt-6">
                <div className="flex items-center gap-3">
                    <BarChart2 className="w-6 h-6 text-green-400" />
                    <h3 className="text-2xl font-semibold text-gray-100">
                        Dataset Visualization
                    </h3>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Một số biểu đồ minh họa giúp bạn hình dung phân bố dữ liệu trước khi tải xuống.
                    Đây chỉ là bản xem trước mẫu – biểu đồ thực tế sẽ hiển thị khi có API thống kê.
                </p>
                {/* ... giữ nguyên phần biểu đồ & tag như trước ... */}
            </div>

            {datasetTags.length > 0 && (
                <div>
                    <h3 className="text-md font-medium text-gray-300 mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                        {datasetTags.map((tag: any) => (
                            <span
                                key={tag.tag_id}
                                className="px-4 py-2 rounded-full bg-[#1E2230] border border-[#3E444B] text-sm text-gray-300 hover:bg-purple-700/20 transition-all"
                            >
                                #{tag.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
