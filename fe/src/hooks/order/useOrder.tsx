import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getAllOrders,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder,
} from "@/services/orderService";
import { Order } from "@/types/index";

// 📌 Lấy tất cả đơn hàng (buyer, seller, admin)
export const useOrders = (token: string) => {
    return useQuery({
        queryKey: ["orders"],
        queryFn: () => getAllOrders(token),
        enabled: !!token,
    });
};

// 📌 Lấy 1 đơn hàng theo id
export const useOrderById = (id: string, token: string) => {
    return useQuery({
        queryKey: ["order", id],
        queryFn: () => getOrderById(id, token),
        enabled: !!id && !!token,
    });
};

// 📌 Tạo đơn hàng (buyer)
export const useCreateOrder = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Order>) => createOrder(data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    });
};

// 📌 Cập nhật đơn hàng (admin)
export const useUpdateOrder = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Order> }) =>
            updateOrder(id, data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    });
};

// 📌 Xóa đơn hàng (admin)
export const useDeleteOrder = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteOrder(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["orders"] }),
    });
};
