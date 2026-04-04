import axios from "@/lib/axios";
import { Review } from "@/types/index"; // ngài có thể định nghĩa type riêng

// 📌 Lấy tất cả review (public)
export const getAllReviews = async () => {
    const res = await axios.get<Review[]>("/reviews");
    return res.data;
};

// 📌 Lấy 1 review theo id (public)
export const getReviewById = async (id: string) => {
    const res = await axios.get<Review>(`/reviews/${id}`);
    return res.data;
};

// 📌 Tạo review (buyer)
export const createReview = async (data: Partial<Review>, token: string) => {
    const res = await axios.post<Review>("/reviews", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Cập nhật review (buyer)
export const updateReview = async (id: string, data: Partial<Review>, token: string) => {
    const res = await axios.put<Review>(`/reviews/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Xóa review (buyer chỉ xóa của mình, admin toàn quyền)
export const deleteReview = async (id: string, token: string) => {
    const res = await axios.delete(`/reviews/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
