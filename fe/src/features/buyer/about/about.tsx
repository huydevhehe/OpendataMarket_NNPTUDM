"use client";

import Image from "next/image";
import { Brain, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";

// Animation variants
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8 } }
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.8 } }
};

export default function AboutPage() {
    return (
        <div className="min-h-screen text-gray-200 py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* PARALLAX BACKGROUND */}
            <div className="absolute inset-0 bg-[url('/bg/stars.png')] opacity-20 bg-cover bg-center pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="show"
                className="relative z-10 max-w-7xl mx-auto"
            >

                {/* HEADER */}
<motion.div variants={fadeUp} className="mb-20 text-center">

    {/* Icon logo */}
    <div className="flex justify-center mb-4">
        <div className="
            w-16 h-16 
            bg-gradient-to-br from-[#E947FF] to-[#9B4DFF]
            rounded-2xl flex items-center justify-center
            shadow-[0_0_25px_rgba(233,71,255,0.7)]
        ">
            <Brain className="text-white w-8 h-8" />
        </div>
    </div>

    {/* Title */}
    <h1 className="
        text-5xl font-extrabold mb-4 
        bg-gradient-to-r from-[#E947FF] to-[#9B4DFF]
        text-transparent bg-clip-text
    ">
        Về OpenDataMarket
    </h1>

    {/* Subtitle */}
    <p className="text-gray-300 text-lg max-w-4xl mx-auto text-center">
        Một nền tảng giao dịch dữ liệu phi tập trung, hướng đến sự minh bạch, an toàn và thúc đẩy sáng tạo cho 
        cộng đồng AI Việt Nam.
    </p>
</motion.div>


                {/* WHY CHOOSE US */}
                <motion.section variants={fadeUp} className="mb-28 text-center">
                    <h2 className="text-3xl font-semibold mb-8">Tại sao chọn OpenDataMarket?</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mt-10">

                        {[
                            "Minh bạch & an toàn dữ liệu",
                            "Tích hợp AI hỗ trợ thông minh",
                            "Cộng đồng phát triển chất lượng",
                            "Quy trình giao dịch đơn giản – nhanh chóng"
                        ].map((text, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ scale: 1.07 }}
                                className="bg-slate-900/40 p-6 rounded-2xl border border-purple-400/20 shadow-[0_0_25px_rgba(120,60,255,0.1)]"
                            >
                                <p className="text-gray-200 font-medium">{text}</p>
                            </motion.div>
                        ))}

                    </div>
                </motion.section>

             {/* MISSION */}
<motion.section variants={fadeUp} className="mb-24">
    <h2 className="text-3xl font-semibold mb-6">Sứ mệnh của chúng tôi</h2>

    <p className="
        text-gray-300 
        leading-relaxed 
        text-lg 
        max-w-5xl 
        mx-auto 
        text-justify
    ">
        OpenDataMarket được xây dựng với mục tiêu tạo ra một hệ sinh thái dữ liệu mở, nơi mọi cá nhân và doanh nghiệp 
        có thể dễ dàng tiếp cận, chia sẻ và khai thác dữ liệu một cách minh bạch, an toàn và hiệu quả. Chúng tôi tin rằng 
        dữ liệu là nền tảng quan trọng thúc đẩy đổi mới sáng tạo trong lĩnh vực trí tuệ nhân tạo và các ngành công nghệ tương lai.
        <br /><br />
        Sứ mệnh của chúng tôi là kết nối cộng đồng phát triển, nhà nghiên cứu và doanh nghiệp thông qua các bộ dữ liệu 
        chất lượng cao, chuẩn hóa và dễ sử dụng, góp phần thúc đẩy sự phát triển bền vững của AI tại Việt Nam.
    </p>
</motion.section>

                {/* MENTOR */}
                <motion.section variants={fadeUp} className="mb-32">
                    <h2 className="text-3xl font-semibold mb-10">Chuyên gia cố vấn dự án</h2>

                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        className="
                            relative bg-slate-900/40 p-12 rounded-3xl 
                            border border-purple-500/25 shadow-[0_0_40px_rgba(155,77,255,0.3)]
                            backdrop-blur-xl
                        "
                    >
                        {/* Avatar */}
                        <div className="absolute -top-20 left-1/2 -translate-x-1/2">
                            <div className="
                                w-40 h-40 rounded-full overflow-hidden 
                                ring-4 ring-purple-500/40 shadow-[0_0_40px_rgba(155,77,255,0.6)]
                            ">
                                <Image
                                    src="/upload/thanhhien.jpg"
                                    alt="Vũ Thanh Hiền"
                                    width={260}
                                    height={260}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        </div>

                        <div className="mt-28 text-center">
                            <h3 className="text-3xl font-bold">Vũ Thanh Hiền</h3>
                            <p className="text-purple-300 text-lg font-medium">Cố vấn kỹ thuật & Mentor dự án</p>
                            <p className="text-gray-400 text-sm mt-1">Tiến sĩ KH Máy tính – HUTECH</p>

                            {/* Tags */}
                            <div className="flex justify-center flex-wrap gap-3 mt-4">
                                {["Hướng dẫn đồ án", "Thực hành dự án thực tế", "AI & Machine Learning"].map((tag, i) => (
                                    <span
                                        key={i}
                                        className="px-4 py-1 text-xs rounded-full bg-purple-600/20 text-purple-300 border border-purple-500/30"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <p className="mt-6 text-gray-300 leading-relaxed text-lg max-w-3xl mx-auto">
                                Thầy Hiền đã đồng hành cùng nhiều thế hệ sinh viên trong việc triển khai các dự án thực tế,
                                giúp sinh viên hiểu sâu công nghệ, tối ưu kỹ thuật và xây dựng tư duy phát triển phần mềm đúng chuẩn doanh nghiệp.
                            </p>

                            {/* Social */}
                            <div className="flex justify-center gap-6 mt-6">
                                <Github className="w-6 h-6 hover:text-purple-300 cursor-pointer" />
                                <Linkedin className="w-6 h-6 hover:text-purple-300 cursor-pointer" />
                            </div>
                        </div>
                    </motion.div>
                </motion.section>

                {/* TEAM */}
                <motion.section variants={fadeUp} className="mb-32">
                    <h2 className="text-3xl font-semibold mb-10">Đội ngũ phát triển</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

                        {/* Member card template */}
                        {[
                            { name: "Lâm Quốc Bảo", avatar: null, role: "Developer / Data Engineer" },
                            { name: "Nguyễn Quốc Huy", avatar: "/upload/quochuy.jpg", role: "Full Stack Developer" },
                            { name: "Đào Quốc Bảo", avatar: null, role: "Developer / Data Engineer" }
                        ].map((m, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ rotateX: 8, rotateY: -8, scale: 1.03 }}
                                className="
                                    bg-slate-900/50 p-8 rounded-2xl text-center 
                                    border border-purple-400/20 shadow-[0_0_30px_rgba(155,77,255,0.15)]
                                    transition
                                "
                            >
                                {/* Avatar */}
                                {m.avatar ? (
                                    <div className="
                                        w-28 h-28 rounded-full overflow-hidden mx-auto mb-4
                                        ring-4 ring-cyan-300/40 shadow-[0_0_35px_rgba(42,255,211,0.4)]
                                    ">
                                        <Image
                                            src={m.avatar}
                                            alt={m.name}
                                            width={260}
                                            height={260}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-24 h-24 bg-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
                                        {m.name.split(" ").map(n => n[0]).join("")}
                                    </div>
                                )}

                                <h3 className="font-semibold text-xl">{m.name}</h3>
                                <p className="text-gray-400 text-sm">{m.role}</p>

                                {/* Social */}
                                <div className="flex justify-center gap-4 mt-4">
                                    <Github className="w-5 h-5 hover:text-purple-300 cursor-pointer" />
                                    <Linkedin className="w-5 h-5 hover:text-purple-300 cursor-pointer" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                

            </motion.div>

        </div>
    );
}
