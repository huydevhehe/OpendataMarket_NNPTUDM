import axios from "@/lib/axios";
import { Tag } from "@/types/index"; // ngài có thể định nghĩa type riêng

// 📌 Lấy tất cả tag (public)
export const getAllTags = async () => {
    const res = await axios.get<Tag[]>("/tags");
    return res.data;
};

// 📌 Lấy 1 tag theo id (public)
export const getTagById = async (id: string) => {
    const res = await axios.get<Tag>(`/tags/${id}`);
    return res.data;
};

// 📌 Tạo tag (seller hoặc admin)
export const createTag = async (data: Partial<Tag>, token: string) => {
    const res = await axios.post<Tag>("/tags", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Cập nhật tag (seller hoặc admin)
export const updateTag = async (id: string, data: Partial<Tag>, token: string) => {
    const res = await axios.put<Tag>(`/tags/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Xóa tag (seller hoặc admin)
export const deleteTag = async (id: string, token: string) => {
    const res = await axios.delete(`/tags/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
