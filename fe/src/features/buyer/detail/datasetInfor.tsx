"use client";

import { useParams } from "next/navigation";
import { useDatasetById } from "@/hooks/dataset/useDataset";
// import Background from "@/components/background"; // Loại bỏ import này nếu bạn không muốn dùng component cũ
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Star, Download, Share2, ShieldCheck, Gem, Layers } from "lucide-react"; // Thêm các icon cần thiết

export default function DatasetDetailPage() {
    const { id } = useParams();
    const { data: dataset, isLoading, error } = useDatasetById(id as string);

    if (isLoading) return <div className="text-center py-10 text-gray-400">Đang tải dữ liệu...</div>;
    if (error) return <div className="text-center py-10 text-red-500">Lỗi tải dữ liệu. Vui lòng thử lại.</div>;
    if (!dataset) return <div className="text-center py-10 text-yellow-400">Không tìm thấy dataset</div>;

    // Ảnh thumbnail
    const imageUrl = dataset.thumbnail_url
        ? `http://localhost:3001${dataset.thumbnail_url}`
        : "/placeholder.png";

    const datasetUrl = dataset.file_url
        ? `http://localhost:3001${dataset.file_url}`
        : "/placeholder.png";

    // Giả định dataset.tags là một mảng các object { tag_id: string, name: string }
    const datasetTags = Array.isArray(dataset.tags) ? dataset.tags : [];


    return (
        // Đổi màu nền chính sang màu tối sâu (Navy/Black) và loại bỏ `relative` không cần thiết
        <div>

            {/* Main content area */}
            <main className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

                {/* Breadcrumbs - Nếu có */}
                <div className="text-sm text-gray-400 mb-6 hidden md:block">
                    Home / Data Categories / <span>{dataset.category.name}</span> / <span className="text-blue-400">{dataset.title}</span>
                </div>

                {/* --- Container chính cho Dataset Detail (Giống khối giữa trong ảnh) --- */}
                <div className="bg-[#111827]/80 rounded-xl shadow-lg border border-[#2A2E35] p-6 md:p-10 lg:p-12 space-y-8">

                    {/* Header Section: FREE DATASET LIBRARY, Verified Provider, Share, Download */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-[#2A2E35] pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-4 sm:mb-0">
                            <Gem className="w-6 h-6 text-blue-400" /> {/* Icon ví dụ */}
                            <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Free Dataset Library</span>

                            <span className="flex items-center gap-1 text-green-500 text-xs px-2 py-0.5 bg-green-900/30 rounded-full font-medium">
                                <ShieldCheck className="w-3 h-3" />
                                Verified Data Provider
                            </span>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="ghost" className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full cursor-pointer">
                                <Share2 className="w-5 h-5 mr-2" />
                                Share
                            </Button>
                            {/* Trường hợp free (cả hai null) */}
                            {dataset.price_vnd === 0 && dataset.price_eth === 0 ? (
                                <a href={datasetUrl} target="_blank" rel="noopener noreferrer">
                                    <Button className="bg-green-600 hover:bg-green-700 text-white rounded-full px-5 py-2.5 flex items-center gap-2 cursor-pointer">
                                        <Download className="w-5 h-5" />
                                        Download <span className="hidden sm:inline">(Free)</span>
                                    </Button>
                                </a>
                            ) : (
                                <>
                                    {/* Nếu có giá VNĐ */}
                                    {dataset.price_vnd != null && dataset.price_vnd > 0 && (
                                        <a href={`/dataset/${dataset.dataset_id}/payment`}>
                                            <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-5 py-2.5 flex items-center gap-2 cursor-pointer">
                                                <Download className="w-5 h-5" />
                                                {dataset.price_vnd.toLocaleString()} <span className="hidden sm:inline">VNĐ</span>
                                            </Button>
                                        </a>
                                    )}

                                    {/* Nếu có giá ETH */}
                                    {dataset.price_eth != null && dataset.price_eth > 0 ? (
                                        <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-5 py-2.5 flex items-center gap-2 cursor-pointer">
                                            <Download className="w-5 h-5" />
                                            {dataset.price_eth} <span className="hidden sm:inline">ETH</span>
                                        </Button>
                                    ) : (
                                        <Button className="bg-gray-500 hover:bg-gray-500 cursor-not-allowed text-white rounded-full px-5 py-2.5 flex items-center gap-2">
                                            <Download className="w-5 h-5" />
                                            <span className="hidden sm:inline">ETH unavailable</span>
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* --- Main Content: Title, Description, Tags (Left) & Image (Right) --- */}
                    <div className="grid md:grid-cols-3 gap-8 md:gap-12 items-start">
                        {/* Left Column: Info */}
                        <div className="md:col-span-2 space-y-6">
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-50 leading-tight">
                                {dataset.title}
                            </h1>
                            <p className="text-xl text-gray-400 font-light">{dataset.description}</p> {/* Font nhẹ hơn */}

                            {/* Tags */}
                            {datasetTags.length > 0 && (
                                <div className="pt-4">
                                    <h3 className="text-md font-medium text-gray-300 mb-3">Tags and Keywords</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {datasetTags.map((tag: any) => (
                                            <span
                                                key={tag.tag_id}
                                                className="px-4 py-2 rounded-full bg-[#2A2E35] border border-[#3E444B] text-sm font-medium text-gray-300 transition-all duration-200"
                                            >
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Trusted By - Giả định có thông tin này trong dataset hoặc hardcode */}
                            <div className="pt-6 border-t border-[#2A2E35]">
                                <h3 className="text-md font-medium text-gray-300 mb-3">Trusted By</h3>
                                <div className="flex items-center gap-4">
                                    {/* Thay thế bằng các logo thật nếu có */}
                                    <img src="/logo-ai.png" alt="AI Logo" className="h-6 opacity-70 transition-opacity" />
                                    <img src="/logo-powerbi.png" alt="Power BI Logo" className="h-5 opacity-70 transition-opacity" />
                                    <span className="text-sm text-gray-500">+ more</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Thumbnail Image and Reviews */}
                        <div className="md:col-span-1 flex flex-col items-center">
                            {/* Image */}
                            <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-xl border border-[#2A2E35] mb-6 transform hover:scale-[1.03] transition-transform duration-300 ease-in-out">
                                <img
                                    src={imageUrl}
                                    alt={dataset.title}
                                    className="w-full h-auto object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "/placeholder.png";
                                    }}
                                />
                            </div>

                            {/* Reviews - Giả định có phần review */}
                            <div className="w-full max-w-sm p-4 rounded-lg bg-[#2A2E35] text-gray-400 text-center text-sm border border-[#3E444B]">
                                "No reviews yet"
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}