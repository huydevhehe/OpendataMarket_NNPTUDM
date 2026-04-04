import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllReviews,
    getReviewById,
    createReview,
    updateReview,
    deleteReview,
} from "@/services/reviewService";
import { Review } from "@/types/index";

// 📌 Lấy tất cả đánh giá (public)
export const useReviews = () => {
    return useQuery({
        queryKey: ["reviews"],
        queryFn: getAllReviews,
    });
};

// 📌 Lấy 1 đánh giá cụ thể
export const useReviewById = (id: string) => {
    return useQuery({
        queryKey: ["review", id],
        queryFn: () => getReviewById(id),
        enabled: !!id,
    });
};

// 📌 Tạo đánh giá (buyer)
export const useCreateReview = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Review>) => createReview(data, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    });
};

// 📌 Cập nhật đánh giá (buyer)
export const useUpdateReview = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Review> }) =>
            updateReview(id, data, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    });
};

// 📌 Xóa đánh giá (buyer hoặc admin)
export const useDeleteReview = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteReview(id, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["reviews"] }),
    });
};
