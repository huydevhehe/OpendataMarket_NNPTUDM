import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag,
} from "@/services/tagService";
import { Tag } from "@/types/index";

// 📌 Lấy tất cả tag (public)
export const useTags = () => {
    return useQuery({
        queryKey: ["tags"],
        queryFn: getAllTags,
    });
};

// 📌 Lấy 1 tag theo id
export const useTagById = (id: string) => {
    return useQuery({
        queryKey: ["tag", id],
        queryFn: () => getTagById(id),
        enabled: !!id,
    });
};

// 📌 Seller hoặc Admin tạo tag
export const useCreateTag = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Tag>) => createTag(data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
    });
};

// 📌 Seller hoặc Admin cập nhật tag
export const useUpdateTag = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Tag> }) =>
            updateTag(id, data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
    });
};

// 📌 Seller hoặc Admin xóa tag
export const useDeleteTag = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTag(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tags"] }),
    });
};
