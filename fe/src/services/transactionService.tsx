import axios from "@/lib/axios";
import { Transaction } from "@/types/index"; // ngài có thể định nghĩa type riêng

// 📌 Lấy tất cả giao dịch (chỉ admin)
export const getAllTransactions = async (token: string) => {
    const res = await axios.get<Transaction[]>("/transaction", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Lấy 1 giao dịch theo id (buyer, seller, admin)
export const getTransactionById = async (id: string, token: string) => {
    const res = await axios.get<Transaction>(`/transaction/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Tạo giao dịch (buyer)
export const createTransaction = async (data: Partial<Transaction>, token: string) => {
    const res = await axios.post<Transaction>("/transaction", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Cập nhật giao dịch (admin)
export const updateTransaction = async (id: string, data: Partial<Transaction>, token: string) => {
    const res = await axios.put<Transaction>(`/transaction/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Xóa giao dịch (admin)
export const deleteTransaction = async (id: string, token: string) => {
    const res = await axios.delete(`/transaction/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};
