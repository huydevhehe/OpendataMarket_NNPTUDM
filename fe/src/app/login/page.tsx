"use client";

import React, { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { FaUser, FaLock } from "react-icons/fa";

interface LoginFormData {
    email: string;
    password: string;
}

export default function LoginForm() {
    const [formData, setFormData] = useState<LoginFormData>({
        email: "",
        password: "",
    });
    const [error, setError] = useState<string | null>(null);

    const { login, loginLoading } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        login(formData);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
            <div className="bg-black/50 backdrop-blur-md border border-purple-700 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-md animate-fade-in animate-slide-down">
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
                    Đăng nhập
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6 text-white">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                        </label>
                        <div className="flex items-center border border-purple-500 rounded-xl px-3 py-2 bg-gray-900 focus-within:ring-2 focus-within:ring-purple-400">
                            <FaUser className="mr-2 text-purple-400" />
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="example@email.com"
                                className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium mb-1">
                            Mật khẩu
                        </label>
                        <div className="flex items-center border border-purple-500 rounded-xl px-3 py-2 bg-gray-900 focus-within:ring-2 focus-within:ring-purple-400">
                            <FaLock className="mr-2 text-purple-400" />
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="••••••••"
                                className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full bg-gradient-to-r from-purple-500 to-green-400 hover:from-purple-600 hover:to-green-500 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                    >
                        {loginLoading ? "Đang đăng nhập..." : "Đăng nhập"}
                    </button>
                    <a href="/register" className="text-sm text-purple-400 hover:underline">
                        Chưa có tài khoản? Đăng ký
                    </a>
                </form>
            </div>
        </div>
    );
}
