"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { FileText, Image as ImageIcon, DollarSign, Layers, CheckSquare, PlusCircle, Loader2 } from "lucide-react";
import { useCreateDataset } from "@/hooks/dataset/useDataset";
import { useCategories } from "@/hooks/category/useCategory";

interface AddDatasetModalProps {
    token: string;
    onClose: () => void;
}

export default function AddDatasetModal({ token, onClose }: AddDatasetModalProps) {
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        price_vnd: 0,
        price_eth: 0,
        file_data: null as File | null,
        thumbnail_file: null as File | null,
        category_id: "",
        is_active: true,
    });

    const createMutation = useCreateDataset(token);
    const { data: categories } = useCategories();

    const handleChange = (field: string, value: any) => setFormData(prev => ({ ...prev, [field]: value }));


    const handleSubmit = async () => {
        try {
            const payload = new FormData();
            payload.append("title", formData.title);
            payload.append("description", formData.description);
            payload.append("price_vnd", String(formData.price_vnd));
            payload.append("price_eth", String(formData.price_eth));
            payload.append("category_id", formData.category_id);
            payload.append("is_active", String(formData.is_active));

            if (formData.file_data) payload.append("file_url", formData.file_data);
            if (formData.thumbnail_file) payload.append("thumbnail_url", formData.thumbnail_file);

            // console.group("🧾 FormData gửi lên backend:");
            // for (const [key, value] of payload.entries()) {
            //     if (value instanceof File) {
            //         console.log(`${key}: [File] ${value.name} (${value.type}, ${value.size} bytes)`);
            //     } else {
            //         console.log(`${key}:`, value);
            //     }
            // }
            // console.groupEnd();


            await createMutation.mutateAsync(payload); // service sẽ nhận FormData
            toast.success("Dataset đã được thêm thành công!");
            onClose();
        } catch (error: any) {
            console.error("Lỗi khi thêm dataset:", error);
            toast.error(error?.response?.data?.error || "Lỗi khi thêm dataset!");
        }
    };



    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-xl bg-slate-800 border border-slate-700 rounded-2xl text-white p-6 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-4 border-b border-slate-700/60 flex-shrink-0">
                    <DialogTitle className="flex items-center gap-2 text-3xl font-bold text-purple-400">
                        <PlusCircle className="h-7 w-7" /> Thêm Dataset Mới
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-4 overflow-y-auto flex-grow">
                    {/* Title */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Tiêu đề</label>
                        <div className="relative">
                            <Input
                                placeholder="Tiêu đề dataset"
                                value={formData.title}
                                className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                onChange={e => handleChange("title", e.target.value)}
                            />
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Mô tả</label>
                        <textarea
                            placeholder="Mô tả chi tiết"
                            rows={4}
                            value={formData.description}
                            className="w-full pl-3 pr-3 py-2 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
                            onChange={e => handleChange("description", e.target.value)}
                        />
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm font-medium mb-1">Giá (VND)</label>
                            <div className="relative">
                                <Input
                                    type="number"
                                    placeholder="Giá VND"
                                    value={formData.price_vnd}
                                    className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    onChange={e => handleChange("price_vnd", Number(e.target.value))}
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
                                    value={formData.price_eth}
                                    className="pl-10 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    onChange={e => handleChange("price_eth", Number(e.target.value))}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">Ξ</span>
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Danh mục</label>
                        <div className="relative">
                            <select
                                value={formData.category_id || ""}
                                onChange={e => handleChange("category_id", e.target.value)}
                                className="w-full appearance-none pl-10 pr-3 py-2 bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                            >
                                <option value="">-- Chọn danh mục --</option>
                                {categories?.map((cat: any, index: number) => (
                                    <option key={cat.category_id ?? `cat-${index}`} value={cat.category_id}>
                                        {cat.name}
                                    </option>
                                ))}

                            </select>
                            <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                        </div>
                    </div>

                    {/* Thumbnail */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">Thumbnail</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => handleChange("thumbnail_file", e.target.files?.[0] || null)}
                            className="hidden"
                            id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer transition">
                            <ImageIcon className="h-5 w-5 text-purple-400" />
                            {formData.thumbnail_file ? formData.thumbnail_file.name : "Chọn ảnh..."}
                        </label>
                    </div>

                    {/* Dataset File */}
                    <div>
                        <label className="block text-slate-400 text-sm font-medium mb-1">File Dataset</label>
                        <input
                            type="file"
                            accept=".csv,.zip,.txt,.json"
                            onChange={e => handleChange("file_data", e.target.files?.[0] || null)}
                            className="hidden"
                            id="file-upload"
                        />
                        <label htmlFor="file-upload" className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg cursor-pointer transition">
                            <FileText className="h-5 w-5 text-purple-400" />
                            {formData.file_data ? formData.file_data.name : "Chọn file..."}
                        </label>
                    </div>

                    {/* Toggle Active */}
                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-3 text-base font-medium text-slate-300">
                            <CheckSquare className="h-5 w-5 text-purple-500" />
                            <span className="font-semibold text-slate-200">Trạng thái:</span>
                            <span className={formData.is_active ? "text-green-400" : "text-red-400"}>
                                {formData.is_active ? "Active" : "Inactive"}
                            </span>
                        </div>
                        <label htmlFor="is-active-toggle" className="relative inline-flex items-center cursor-pointer">
                            <input
                                id="is-active-toggle"
                                type="checkbox"
                                checked={formData.is_active}
                                className="sr-only peer"
                                onChange={e => handleChange("is_active", e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-purple-500/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-700/60 flex-shrink-0">
                    <Button variant="outline" className="bg-transparent border-slate-600 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg px-6 py-3" onClick={onClose}>
                        Hủy bỏ
                    </Button>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-lg px-6 py-3 shadow-lg flex items-center gap-2" onClick={handleSubmit} disabled={createMutation.isPending}>
                        {createMutation.isPending ? <Loader2 className="animate-spin h-5 w-5" /> : <PlusCircle className="h-5 w-5" />}
                        {createMutation.isPending ? "Đang thêm..." : "Thêm mới"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
