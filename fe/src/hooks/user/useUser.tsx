import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile } from "@/services/userService";
import {
    getAllUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
} from "@/services/userService";
import { User } from "@/types/index";

// 📌 Lấy tất cả user (admin)
export const useUsers = (token: string) => {
    return useQuery({
        queryKey: ["users"],
        queryFn: () => getAllUsers(token),
        enabled: !!token,
    });
};

// 📌 Lấy 1 user theo id
export const useUserById = (id: string, token: string) => {
    return useQuery({
        queryKey: ["user", id],
        queryFn: () => getUserById(id, token),
        enabled: !!id && !!token,
    });
};

// 📌 Tạo user (đăng ký)
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createUser,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    });
};

// 📌 Cập nhật user
export const useUpdateUser = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
            updateUser(id, data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    });
};

// 📌 Xóa user
export const useDeleteUser = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deleteUser(id, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
    });
};

export const useUserProfile = (token: string, isClient = true) => {
    return useQuery({
        queryKey: ["userProfile"],
        queryFn: () => getUserProfile(token),
        enabled: !!token && isClient, // ✅ chỉ chạy khi client sẵn sàng và có token
    });
};


export const useUpdateUserProfile = (token: string) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<User>) => updateUserProfile(data, token),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["userProfile"] }),
    });
};