import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
} from "@/services/transactionService";
import { Transaction } from "@/types/index";

// 📌 Lấy tất cả giao dịch (admin / seller / buyer)
export const useTransactions = (token: string) => {
    return useQuery({
        queryKey: ["transactions"],
        queryFn: () => getAllTransactions(token),
        enabled: !!token,
    });
};

// 📌 Lấy chi tiết 1 giao dịch
export const useTransactionById = (id: string, token: string) => {
    return useQuery({
        queryKey: ["transaction", id],
        queryFn: () => getTransactionById(id, token),
        enabled: !!id && !!token,
    });
};

// 📌 Tạo giao dịch (khi buyer thanh toán)
export const useCreateTransaction = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Transaction>) => createTransaction(data, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });
};

// 📌 Cập nhật trạng thái giao dịch (admin)
export const useUpdateTransaction = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Transaction> }) =>
            updateTransaction(id, data, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });
};

// 📌 Xóa giao dịch (admin)
export const useDeleteTransaction = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteTransaction(id, token),
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: ["transactions"] }),
    });
};
