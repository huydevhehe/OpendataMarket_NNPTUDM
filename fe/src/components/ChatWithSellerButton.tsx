"use client";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
    sellerId: string;
}

export default function ChatWithSellerButton({ sellerId }: Props) {
    // ChatWithSellerButton.tsx
    const handleChat = async () => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            toast.warning("⚠️ Bạn cần đăng nhập để chat với người bán!");
            return;
        }

        try {
            const res = await fetch(`http://localhost:3001/chat/conversations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ seller_id: sellerId }),
            });

            const data = await res.json();
            if (data?.data?.id) {
                window.open(`/chat/${data.data.id}`, "_blank");
            } else {
                toast.error("Không thể mở hội thoại với người bán.");
            }
        } catch (err) {
            toast.error("Lỗi khi mở khung chat!");
        }
    };


    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="pt-2"
        >
            <Button
                onClick={handleChat}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full 
                   bg-gradient-to-r from-purple-500 via-indigo-500 to-green-400 
                   text-white font-semibold shadow-lg shadow-purple-500/30 
                   hover:scale-[1.03] hover:shadow-green-400/20 transition-all duration-300"
            >
                <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                >
                    <MessageSquare className="w-5 h-5" />
                </motion.div>
                <span>Chat với người bán</span>
            </Button>

            <p className="text-center text-gray-400 text-xs mt-2 italic">
                Mở khung chat riêng để trao đổi chi tiết hơn 💬
            </p>
        </motion.div>
    );
}
