import axios from "@/lib/axios"; // hoặc import axios trực tiếp nếu ngài chưa có custom instance
import { User } from "@/types/index"; // type User (nếu có định nghĩa chung)

// 📌 Lấy tất cả user (admin)
export const getAllUsers = async (token: string) => {
    const res = await axios.get<User[]>("/user", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};



// 📌 Lấy 1 user theo id
export const getUserById = async (id: string, token: string) => {
    const res = await axios.get<User>(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};


// 📌 Tạo user (đăng ký)
export const createUser = async (data: Partial<User>) => {
    const res = await axios.post<User>("/user", data);
    return res.data;
};

// 📌 Cập nhật user
export const updateUser = async (id: string, data: Partial<User>, token: string) => {
    const res = await axios.put<User>(`/user/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Xóa user (chỉ admin)
export const deleteUser = async (id: string, token: string) => {
    const res = await axios.delete(`/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// 📌 Lấy thông tin profile (user hiện tại)
export const getUserProfile = async (token: string): Promise<User> => {
    const res = await axios.get<{ success: boolean; data: User }>("/user/me", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data; // ✅ TS hiểu "res.data.data" là kiểu User
};

// 📌 Cập nhật thông tin profile (user hiện tại)
export const updateUserProfile = async (
    data: Partial<User>,
    token: string
): Promise<User> => {
    const res = await axios.patch<{ success: boolean; data: User }>("/user/me", data, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
};


