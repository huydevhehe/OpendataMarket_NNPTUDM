import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
} from "@/services/categoryService";
import { Category } from "@/types/index";

// 📌 Lấy tất cả category (public)
export const useCategories = () => {
    return useQuery({
        queryKey: ["categories"],
        queryFn: getAllCategories,
    });
};

// 📌 Lấy 1 category theo id
export const useCategoryById = (id: string) => {
    return useQuery({
        queryKey: ["category", id],
        queryFn: () => getCategoryById(id),
        enabled: !!id,
    });
};

// 📌 Tạo category (admin)
export const useCreateCategory = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Category>) => createCategory(data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

// 📌 Cập nhật category (admin)
export const useUpdateCategory = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Category> }) =>
            updateCategory(id, data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};

// 📌 Xóa category (admin)
export const useDeleteCategory = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteCategory(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["categories"] }),
    });
};
