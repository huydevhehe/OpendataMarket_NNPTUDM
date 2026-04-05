import axios from "@/lib/axios";
import { Category } from "@/types/index"; // ngài có thể định nghĩa type này riêng

// 📌 Lấy tất cả category (public)
export const getAllCategories = async () => {
    const res = await axios.get<Category[]>("/category");
    return res.data;
};

// 📌 Lấy 1 category theo id (public)
export const getCategoryById = async (id: string) => {
    const res = await axios.get<Category>(`/category/${id}`);
    return res.data;
};

// 📌 Tạo category (admin)
export const createCategory = async (data: Partial<Category>, token: string) => {
    const res = await axios.post<Category>("/category", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Cập nhật category (admin)
export const updateCategory = async (id: string, data: Partial<Category>, token: string) => {
    const res = await axios.put<Category>(`/category/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Xóa category (admin)
export const deleteCategory = async (id: string, token: string) => {
    const res = await axios.delete(`/category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
