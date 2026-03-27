// src/services/auth.ts  (FIXED ✔)
import api from '@/lib/axios';
import { LoginInput, RegisterInput, LoginResponse, RegisterResponse } from '@/types/index';

// Hàm set cookie an toàn
const setCookie = (name: string, value: string, days = 7) => {
    const expires = new Date(Date.now() + days * 86400000).toUTCString();
    document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`;
};

// Login function
export const login = async (data: LoginInput): Promise<LoginResponse> => {
    const res = await api.post<LoginResponse>('/login', data);
    const token = res.data.token;

    if (token) {
        // Lưu localStorage
        localStorage.setItem('accessToken', token);

        // Lưu cookie để BE verify
        setCookie('accessToken', token);

        // Gắn Authorization header cho axios
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    return res.data;
};

// Register function
export const register = async (data: RegisterInput): Promise<RegisterResponse> => {
    const res = await api.post<RegisterResponse>('/register', data);
    return res.data;
};

// Logout function
export const logout = () => {
    localStorage.removeItem('accessToken');

    // Xoá cookie token
    document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    delete api.defaults.headers.common['Authorization'];
    return Promise.resolve();
};
