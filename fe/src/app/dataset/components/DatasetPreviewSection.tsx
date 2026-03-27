"use client";

import { Download, Eye, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useParams } from "next/navigation";
import { useDatasetPreview } from "@/hooks/dataset/useDatasetPreview";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export default function DatasetPreviewSection() {
    const { id } = useParams();
    const { data, isLoading, error } = useDatasetPreview(id as string);
    const { data: fullData } = useDatasetPreview(id as string, 50); // 👈 lấy thêm 50 dòng khi modal mở

    const columns = data?.columns || [];
    const rows = data?.rows || [];

    const columnsFull = fullData?.columns || [];
    const rowsFull = fullData?.rows || [];

    const handleSampleDownload = () => {
        const sampleUrl = `http://localhost:3001/dataset/${id}/sample`;
        window.open(sampleUrl, "_blank");
    };


    const handleDownload = () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            alert("⚠️ Bạn cần đăng nhập để tải dataset này!");
            return;
        }
        const downloadUrl = `http://localhost:3001/dataset/${id}/download?token=${token}`;
        window.open(downloadUrl, "_blank");
    };

    if (isLoading)
        return <div className="text-gray-400 mt-10">Đang tải dữ liệu mẫu...</div>;
    if (error)
        return <div className="text-red-400 mt-10">Lỗi tải dữ liệu preview</div>;

    return (
        <section className="bg-[#0f172a]/80 border border-[#2A2E35] rounded-xl shadow-lg p-8 mt-10 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center border-b border-[#2A2E35] pb-4">
                <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-6 h-6 text-green-400" />
                    <h3 className="text-2xl font-semibold text-gray-100">
                        Dataset Preview
                    </h3>
                </div>
                <div className="flex gap-3">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button
                                variant="outline"
                                className="border border-gray-600 text-gray-300 hover:bg-purple-600/20"
                            >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem toàn bộ
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-5xl bg-[#0f172a] border border-gray-700">
                            <DialogHeader>
                                <DialogTitle className="text-xl text-gray-100 mb-4">
                                    Toàn bộ Dataset (50 dòng đầu)
                                </DialogTitle>
                            </DialogHeader>
                            <div className="overflow-x-auto max-h-[70vh]">
                                <table className="min-w-full text-sm text-gray-300 border-collapse">
                                    <thead className="text-gray-400 border-b border-gray-700 sticky top-0 bg-[#0f172a]">
                                        <tr>
                                            {columnsFull.map((col) => (
                                                <th key={col} className="text-left py-2 px-4">
                                                    {col}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rowsFull.map((row, index) => (
                                            <tr
                                                key={index}
                                                className="border-b border-gray-800 hover:bg-gray-800/40 transition-all"
                                            >
                                                {columnsFull.map((col) => (
                                                    <td key={col} className="py-2 px-4">
                                                        {String(row[col] ?? "")}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <Button
                        onClick={handleSampleDownload} // ✅ gọi API sample, không phải full
                        className="bg-gradient-to-r from-purple-500 to-green-500 text-white hover:shadow-lg"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Tải file mẫu (.csv)
                    </Button>

                </div>
            </div>

            {/* Table Preview (5 dòng) */}
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-gray-300 border-collapse">
                    <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            {columns.map((col) => (
                                <th key={col} className="text-left py-2 px-4">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, index) => (
                            <tr
                                key={index}
                                className="border-b border-gray-800 hover:bg-gray-800/40 transition-all"
                            >
                                {columns.map((col) => (
                                    <td key={col} className="py-2 px-4">
                                        {String(row[col] ?? "")}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Notice */}
            <div className="flex items-center gap-3 bg-[#1a1f2e] border border-gray-700 rounded-lg px-4 py-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-gray-400 text-sm">
                    Đây chỉ là 5 dòng đầu tiên của dataset. Nhấn “Xem toàn bộ” để xem
                    thêm 50 dòng, hoặc tải file mẫu.
                </p>
            </div>
        </section>
    );
}
