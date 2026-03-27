"use client";

import React, { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { FaUser, FaLock, FaPhone, FaWallet, FaUniversity, FaEnvelope, FaUserTag } from "react-icons/fa";

interface RegisterFormData {
    email: string;
    password: string;
    full_name: string;
    role: string;
    phone_number: string;
    bank_account: string;
    bank_name: string;
    wallet_address: string;
}

export default function RegisterForm() {
    const { register, registerLoading } = useAuth();

    const [formData, setFormData] = useState<RegisterFormData>({
        email: '',
        password: '',
        full_name: '',
        role: 'buyer',
        phone_number: '',
        bank_account: '',
        bank_name: '',
        wallet_address: '',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
            wallet_address: formData.wallet_address.trim() === '' ? null : formData.wallet_address.trim(),
        };

        register(dataToSend);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
            <div className="bg-black/50 backdrop-blur-md border border-purple-700 p-8 md:p-10 rounded-2xl shadow-xl w-full max-w-xl animate-fade-in animate-slide-down text-white">
                <h2 className="text-3xl font-bold text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-green-400">
                    Đăng ký tài khoản
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                        { name: "full_name", label: "Họ và tên", icon: <FaUser /> },
                        { name: "email", label: "Email", icon: <FaEnvelope />, type: "email" },
                        { name: "password", label: "Mật khẩu", icon: <FaLock />, type: "password" },
                       // { name: "role", label: "Vai trò", icon: <FaUserTag /> },
                        { name: "phone_number", label: "Số điện thoại", icon: <FaPhone /> },
                        { name: "bank_account", label: "Số tài khoản ngân hàng", icon: <FaUniversity /> },
                        { name: "bank_name", label: "Tên ngân hàng", icon: <FaUniversity /> },
                        { name: "wallet_address", label: "Địa chỉ ví (nếu có)", icon: <FaWallet />, optional: true },
                    ].map((field) => (
                        <div key={field.name}>
                            <label htmlFor={field.name} className="block text-sm font-medium mb-1">
                                {field.label}
                            </label>
                            <div className="flex items-center border border-purple-500 rounded-xl px-3 py-2 bg-gray-900 focus-within:ring-2 focus-within:ring-purple-400">
                                <span className="text-purple-400 mr-2">{field.icon}</span>
                                <input
                                    id={field.name}
                                    name={field.name}
                                    type={field.type || "text"}
                                    value={(formData as any)[field.name]}
                                    onChange={handleChange}
                                    required={!field.optional}
                                    className="w-full bg-transparent text-white outline-none placeholder-gray-400"
                                    placeholder={field.label}
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-500 to-green-400 hover:from-purple-600 hover:to-green-500 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        disabled={registerLoading}
                    >
                        {registerLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                    <a href="/login" className="text-sm text-purple-400 hover:underline">
                        Đã có tài khoản? Đăng nhập
                    </a>
                </form>
            </div>
        </div>
    );
}
