"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Mail, User } from "lucide-react";

export default function ContactPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // TODO: gửi dữ liệu đến backend
            console.log({ name, email, message });
            await new Promise((r) => setTimeout(r, 1000)); // mock API call
            setSubmitted(true);
            setName("");
            setEmail("");
            setMessage("");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen from-slate-950 via-slate-900 to-slate-950 py-24 px-4 sm:px-6 lg:px-8 text-gray-200">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-green-500 rounded-lg flex items-center justify-center">
                            <Mail className="text-white w-6 h-6" />
                        </div>
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold mb-2 gradient-text">
                        Liên hệ với chúng tôi
                    </h1>
                    <p className="text-gray-400 text-base sm:text-lg">
                        Bạn có thắc mắc, góp ý hay muốn hợp tác? Hãy điền thông tin bên dưới và chúng tôi sẽ liên hệ sớm nhất.
                    </p>
                </div>

                {/* Form Card */}
                <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-2xl shadow-lg">
                    {submitted && (
                        <div className="mb-6 p-4 bg-green-600 text-white rounded-lg text-center">
                            Cảm ơn bạn! Chúng tôi đã nhận được thông tin của bạn.
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                id="name"
                                type="text"
                                placeholder="Họ và tên"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="pl-10 bg-slate-800 border-gray-600 focus:border-purple-500"
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="pl-10 bg-slate-800 border-gray-600 focus:border-purple-500"
                            />
                        </div>

                        <Textarea
                            id="message"
                            placeholder="Nhập tin nhắn của bạn..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            className="bg-slate-800 border-gray-600 focus:border-purple-500"
                        />

                        <Button
                            type="submit"
                            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-500 to-green-500 hover:shadow-lg transition-all"
                            disabled={loading}
                        >
                            <Send className="h-4 w-4" />
                            {loading ? "Đang gửi..." : "Gửi tin nhắn"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
