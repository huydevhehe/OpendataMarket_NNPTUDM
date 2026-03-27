import { useMutation } from '@tanstack/react-query';
import { login, logout, register } from '@/services/authService';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner'; // dùng sonner thay cho toast cũ
import { User } from 'lucide-react';
import { decodeToken } from '@/lib/decodeToken';

export const useAuth = () => {
    const router = useRouter();


    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            const decodedToken = decodeToken(data.token);
            toast.success("Đăng nhập thành công");

            // console.log("Decoded Token:", decodedToken);

            if (decodedToken?.role === "buyer") {
                router.push("/");
            } else if (decodedToken?.role === "seller") {
                router.push(`/seller/${decodedToken.user_id}`);
            } else if (decodedToken?.role === "admin") {
                router.push("/admin");
            }
        },
        onError: (error: any) => {
            if (error.response?.status === 401) {
                toast.error("Sai email hoặc mật khẩu. Vui lòng thử lại.");
            }
        },
    });

    const registerMutation = useMutation({
        mutationFn: register,
        onSuccess: () => {
            toast.success('Đăng ký thành công');
            router.push('/login');
        },
        onError: () => {
            toast.error('Đăng ký thất bại');
        },
    });

    const logoutMutation = useMutation({
        mutationFn: logout,
        onSuccess: () => {
            toast.success('Đăng xuất thành công');
            router.push('/login');
        },
        onError: () => {
            toast.error('Đăng xuất thất bại');
        },
    });

    return {
        login: loginMutation.mutate,
        loginLoading: loginMutation.status === 'pending',
        register: registerMutation.mutate,
        registerLoading: registerMutation.status === 'success',
        logout: logoutMutation.mutate,
        logoutLoading: logoutMutation.status === 'error',
    };
};
