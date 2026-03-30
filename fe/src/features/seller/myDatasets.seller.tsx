"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

// Giữ nguyên các component UI
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import Image from "next/image";
import { Dataset } from "@/types/index";
import {
    useDeleteDataset,
    useDatasetBySellerId,
    useUpdateDataset,
} from "@/hooks/dataset/useDataset";

import AddDatasetModal from "@/components/addDataset";

// ✨ IMPORT ICONS MỚI TỪ LUCIDE-REACT (Đã FIX LỖI Category) ✨
import {
    FolderKanban,
    Trash2,
    Edit,
    Eye,
    HandCoins,
    DollarSign,
    Circle,
    Package,
    Loader2,
    Image as ImageIcon,
    FileText,
    Tag,
    Layers, // Dùng Layers thay cho Category
    User,
    Calendar,
    CheckSquare,
} from "lucide-react";

export default function SellerMyDatasets() {
    const params = useParams();
    const sellerId = params?.id as string;
    const [token, setToken] = useState<string | null>(null);
    const [editingDataset, setEditingDataset] = useState<Dataset | null>(null);
    const [openAddModal, setOpenAddModal] = useState(false);


    useEffect(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) setToken(storedToken);
    }, []);

    const { data, isLoading, refetch } = useDatasetBySellerId(sellerId);
    const datasets: Dataset[] = Array.isArray(data) ? data : (data as any)?.data || [];

    const deleteMutation = useDeleteDataset(token || "");
    const updateMutation = useUpdateDataset(token || "");

    const handleDelete = async (id: string) => {
        if (!token) {
            toast.error("Unauthorized");
            return;
        }
        if (!confirm("Bạn có chắc muốn xóa dataset này không?")) return;
        try {
            await deleteMutation.mutateAsync(id);
            toast.success("Dataset đã được xóa thành công.");
            refetch();
        } catch (err) {
            console.error(err);
            toast.error("Đã xảy ra lỗi khi xóa dataset.");
        }
    };

    const handleSave = async () => {
        if (!editingDataset || !token) return;

        try {
            // 🧾 Tạo FormData
            const formData = new FormData();
            formData.append("title", editingDataset.title);
            formData.append("description", editingDataset.description || "");
            formData.append("price_vnd", String(editingDataset.price_vnd || 0));
            formData.append("price_eth", String(editingDataset.price_eth || 0));
            formData.append("is_active", String(editingDataset.is_active));

            // 🖼️ Nếu có thumbnail mới (File), append vào
            if ((editingDataset as any).thumbnail_file instanceof File)
                formData.append("thumbnail_url", (editingDataset as any).thumbnail_file);

            // 📂 Nếu có file dataset mới, append vào
            if ((editingDataset as any).file_data instanceof File)
                formData.append("file_url", (editingDataset as any).file_data);

            // ⚙️ Log kiểm tra
            console.log("🧾 [EditDataset] FormData gửi lên backend:");
            for (const [key, value] of formData.entries()) {
                console.log(key, value instanceof File ? `[File] ${value.name}` : value);
            }

            // 🚀 Gửi request update
            await updateMutation.mutateAsync({
                id: editingDataset.dataset_id,
                formData,
            });

            toast.success("Dataset đã được cập nhật thành công!");
            setEditingDataset(null);
            refetch();
        } catch (err: any) {
            console.error("❌ Lỗi khi cập nhật dataset:", err);
            toast.error(err?.response?.data?.error || "Đã xảy ra lỗi khi cập nhật dataset!");
        }
    };


    if (isLoading) return (
        <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2 h-6 w-6" /> Đang tải danh sách dataset...
        </div>
    );

    if (!datasets.length)
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Package className="h-12 w-12 mb-4 text-gray-600" />
            <p className="text-lg">Người bán này chưa có dataset nào.</p>
        </div>


    return (
        // ✨ ĐÃ BỎ background gradient ✨
        <div className="space-y-6 p-6 min-h-screen">
            <h2 className="flex items-center gap-3 text-4xl font-extrabold text-white pb-4 border-b border-slate-700/50">
                <FolderKanban className="h-9 w-9 text-purple-400" /> My Datasets
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {datasets.map((d: Dataset) => {
                    const imageUrl = d.thumbnail_url
                        ? `http://localhost:3001${d.thumbnail_url}`
                        : "/placeholder.png";

                    return (
                        <Card
                            key={d.dataset_id}
                            className="
                                bg-slate-800/80 backdrop-blur-sm border border-slate-700 rounded-2xl shadow-lg transition-all duration-300 ease-in-out
                                hover:border-purple-500 hover:shadow-xl hover:shadow-purple-900/40 hover:-translate-y-2">

                            <CardHeader className="p-5 pb-3">
                                <CardTitle className="text-white text-2xl font-semibold truncate">
                                    {d.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-4 p-5 pt-0">
                                <div className="relative w-full h-48 rounded-lg overflow-hidden border border-slate-700/60 shadow-inner">
                                    <Image
                                        src={imageUrl}
                                        alt={d.title}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                {/* ⚠️ ĐÃ SỬA: Thêm h-16 để cố định chiều cao của phần mô tả */}
                                <p className="text-slate-300 text-sm leading-relaxed h-16 line-clamp-3">
                                    {d.description || "Chưa có mô tả chi tiết cho dataset này."}
                                </p>

                                <div className="flex justify-between items-center text-base font-medium pt-2 border-t border-slate-800">
                                    <span className="text-green-400 flex items-center gap-1.5 font-bold">
                                        <DollarSign className="h-5 w-5 text-green-500" />
                                        {d.price_vnd?.toLocaleString()} VND
                                    </span>
                                    <span className="text-green-400 flex items-center gap-1.5 font-bold">
                                        <HandCoins className="h-5 w-5 text-green-500" />
                                        {d.price_eth?.toLocaleString()} ETH
                                    </span>
                                    <span
                                        className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5
                                                ${d.is_active
                                                ? "bg-green-700/30 text-green-300 border border-green-700"
                                                : "bg-red-700/30 text-red-300 border border-red-700"
                                            }`}
                                    >
                                        <Circle className={`h-2.5 w-2.5 fill-current ${d.is_active ? "text-green-400" : "text-red-400"}`} />
                                        {d.is_active ? "Active" : "Inactive"}
                                    </span>
                                </div>

                                <div className="flex justify-between gap-3 pt-4">
                                    <Button
                                        size="lg"
                                        variant="ghost"
                                        className="text-blue-400 hover:bg-blue-900/30 flex-1 border border-blue-700/60 rounded-xl transition-colors duration-200"
                                        onClick={() =>
                                            window.open(`/dataset/${d.dataset_id}`, "_blank")
                                        }
                                    >
                                        <Eye className="h-5 w-5 mr-2" /> Xem
                                    </Button>

                                    <Button
                                        size="lg"
                                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1 rounded-xl shadow-md hover:shadow-lg transition-colors duration-200"
                                        onClick={() => setEditingDataset(d)}
                                    >
                                        <Edit className="h-5 w-5 mr-2" /> Sửa
                                    </Button>

                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        className="bg-red-600 hover:bg-red-700 text-white flex-1 rounded-xl shadow-md hover:shadow-lg transition-colors duration-200"
                                        disabled={deleteMutation.isPending}
                                        onClick={() => handleDelete(d.dataset_id)}
                                    >
                                        {deleteMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Trash2 className="h-5 w-5 mr-2" />}
                                        {deleteMutation.isPending ? "Đang xóa" : "Xóa"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Floating Form Modal */}
            {editingDataset && (
                <Dialog open={!!editingDataset} onOpenChange={() => setEditingDataset(null)}>
                    {/* ✨ FIX LỖI MODAL DÀI - Thêm max-h-[90vh] và overflow-hidden cho DialogContent. */}
                    <DialogContent className="max-w-xl bg-slate-800 border border-slate-700 rounded-2xl text-white p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="pb-4 border-b border-slate-700/60 flex-shrink-0">
                            <DialogTitle className="flex items-center gap-2 text-3xl font-bold text-purple-400">
                                <Edit className="h-7 w-7" /> Sửa Dataset
                            </DialogTitle>
                        </DialogHeader>

                        {/* ✨ NỘI DUNG MODAL CÓ THỂ CUỘN ĐƯỢC ✨ */}
                        <div className="space-y-5 py-4 overflow-y-auto flex-grow">
                            {/* Thumbnail preview */}
                            {editingDataset.thumbnail_url && (
                                <div className="w-full h-48 rounded-lg overflow-hidden relative border border-slate-700/60 shadow-inner">
                                    <img
                                        src={`http://localhost:3001${editingDataset.thumbnail_url}`}
                                        alt={editingDataset.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                                    />
                                </div>
                            )}

                            {/* Text fields */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Tiêu đề</label>
                                <div className="relative">
                                    <Input
                                        placeholder="Tiêu đề dataset"
                                        value={editingDataset.title}
                                        className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        onChange={(e) =>
                                            setEditingDataset(prev => prev ? { ...prev, title: e.target.value } : prev)
                                        }
                                    />
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                </div>
                            </div>
                            {/* Mô tả (Description) đã được làm rộng hơn */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Mô tả</label>
                                <div className="relative">
                                    <textarea // ✨ Thay thế <Input> bằng <textarea> ✨
                                        placeholder="Mô tả chi tiết"
                                        rows={4} // ✨ Thêm thuộc tính rows để đặt chiều cao 4 dòng ✨
                                        value={editingDataset.description || ""}
                                        className="
                                            w-full pl-3 pr-3 py-2 
                                            bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 
                                            rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent 
                                            resize-none // Không cho phép kéo giãn bằng chuột
                                        "
                                        onChange={(e) =>
                                            setEditingDataset(prev => prev ? { ...prev, description: e.target.value } : prev)
                                        }
                                    />
                                    {/* Bỏ icon FileText vì nó không còn phù hợp với Textarea nhiều dòng */}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1">Giá (VND)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="Giá VND"
                                            value={editingDataset.price_vnd || 0}
                                            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            onChange={(e) =>
                                                setEditingDataset(prev => prev ? { ...prev, price_vnd: Number(e.target.value) } : prev)
                                            }
                                        />
                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm font-medium mb-1">Giá (ETH)</label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            placeholder="Giá ETH"
                                            value={editingDataset.price_eth || 0}
                                            className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            onChange={(e) =>
                                                setEditingDataset(prev => prev ? { ...prev, price_eth: Number(e.target.value) } : prev)
                                            }
                                        />
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">Ξ</span>
                                    </div>
                                </div>
                            </div>
                            {/* Upload Thumbnail */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Cập nhật Thumbnail</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setEditingDataset(prev => prev ? { ...prev, thumbnail_file: e.target.files?.[0] } : prev)
                                    }
                                    className="bg-slate-900 border-slate-700 text-white file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                            </div>

                            {/* Upload Dataset File */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-1">Cập nhật File Dataset</label>
                                <Input
                                    type="file"
                                    accept=".csv,.zip,.json"
                                    onChange={(e) =>
                                        setEditingDataset(prev => prev ? { ...prev, file_data: e.target.files?.[0] } : prev)
                                    }
                                    className="bg-slate-900 border-slate-700 text-white file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700"
                                />
                            </div>

                            {/* Toggle is_active - Không có khung viền, chỉ có chữ và cần gạt */}
                            <div className="flex items-center justify-between mt-4">
                                {/* Label bên trái (Không nằm trong div có nền) */}
                                <div className="flex items-center gap-3 text-base font-medium text-slate-300">
                                    <CheckSquare className="h-5 w-5 text-purple-500" />
                                    {/* Chỉ hiển thị trạng thái hiện tại */}
                                    <span className="font-semibold text-slate-200">Trạng thái:</span>
                                    <span className={editingDataset.is_active ? "text-green-400" : "text-red-400"}>
                                        {editingDataset.is_active ? "Active (Hiển thị công khai)" : "Hidden (Không hiển thị)"}
                                    </span>
                                </div>

                                {/* Toggle Switch (Cần Gạt) - Độc lập */}
                                <label htmlFor="is-active-toggle" className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        id="is-active-toggle"
                                        type="checkbox"
                                        checked={editingDataset.is_active}
                                        className="sr-only peer" // Ẩn checkbox gốc
                                        onChange={(e) =>
                                            setEditingDataset(prev => prev ? { ...prev, is_active: e.target.checked } : prev)
                                        }
                                    />
                                    {/* Thanh nền của cần gạt */}
                                    <div className="
                                        w-11 h-6 bg-slate-700 rounded-full peer 
                                        peer-focus:ring-2 peer-focus:ring-purple-500/50 
                                        peer-checked:after:translate-x-full 
                                        peer-checked:after:border-white 
                                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                        after:bg-white after:border-gray-300 after:border after:rounded-full 
                                        after:h-5 after:w-5 after:transition-all 
                                        peer-checked:bg-purple-600
                                    "></div>
                                </label>
                            </div>

                            {/* Display related info read-only */}
                            <div className="mt-5 text-sm text-slate-400 space-y-2 p-4 bg-slate-900 rounded-lg border border-slate-700 shadow-inner">
                                {/* ✨ DÙNG ICON Layers THAY CHO Category ✨ */}
                                <div className="flex items-center gap-2"><Layers className="h-4 w-4 text-slate-500" /> <span className="font-semibold">Category:</span> {editingDataset.category?.name || "N/A"}</div>
                                <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-500" /> <span className="font-semibold">Seller:</span> {editingDataset.seller?.full_name || "N/A"}</div>
                                <div className="flex items-center gap-2"><Tag className="h-4 w-4 text-slate-500" /> <span className="font-semibold">Tags:</span> {editingDataset.tags?.map(t => t.name).join(", ") || "N/A"}</div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500" /> <span className="font-semibold">Created at:</span> {new Date(editingDataset.created_at).toLocaleString()}</div>
                                <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500" /> <span className="font-semibold">Updated at:</span> {new Date(editingDataset.updated_at).toLocaleString()}</div>
                            </div>
                        </div>

                        {/* ✨ NÚT THAO TÁC CỐ ĐỊNH Ở DƯỚI (Footer) ✨ */}
                        <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700/60 flex-shrink-0">
                            <Button
                                variant="outline"
                                className="bg-transparent border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg px-6 py-3 transition-colors duration-200"
                                onClick={() => setEditingDataset(null)}
                            >
                                Huỷ bỏ
                            </Button>
                            <Button
                                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg px-6 py-3 shadow-lg transition-all duration-200 flex items-center gap-2"
                                onClick={handleSave}
                                disabled={updateMutation.isPending}
                            >
                                {updateMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <Edit className="h-5 w-5" />}
                                {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            {/* 🌟 Floating Add Button */}
            <Button
                onClick={() => setOpenAddModal(true)}
                className="fixed bottom-8 right-8 rounded-full h-14 w-14 bg-gradient-to-r from-purple-600 to-blue-500 
             hover:from-purple-700 hover:to-blue-600 text-white shadow-lg shadow-purple-900/40 
             flex items-center justify-center text-3xl transition-all duration-300 hover:scale-110 z-50"
            >
                +
            </Button>

            {/* 🌟 Modal thêm dataset */}
            {openAddModal && (
                <AddDatasetModal
                    token={token || ""}
                    onClose={() => {
                        setOpenAddModal(false);
                        refetch();
                    }}
                />
            )}

        </div>

    );
}