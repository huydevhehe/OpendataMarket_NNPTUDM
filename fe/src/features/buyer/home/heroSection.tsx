"use client";
// components/ui/hero-section.tsx

import { Rocket, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

// Animation variants giống file Hero bạn gửi
const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

export function HeroSection() {
  const stats = [
    { value: "1,250+", label: "Datasets" },
    { value: "50,000+", label: "Người dùng" },
    { value: "1M+", label: "Lượt tải" },
    { value: "99%", label: "Hài lòng" },
  ];

  const scrollToModels = () => {
    const element = document.querySelector("#models");
    element?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16"
    >
      {/* Floating Background Orbs – giữ nguyên */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-float"></div>
        <div
          className="absolute top-40 right-20 w-48 h-48 bg-green-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "-2s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: "-4s" }}
        ></div>
        <div
          className="absolute top-1/3 right-1/3 w-36 h-36 bg-purple-400/15 rounded-full blur-xl animate-float"
          style={{ animationDelay: "-1s" }}
        ></div>
        <div
          className="absolute bottom-1/3 left-1/2 w-28 h-28 bg-green-400/15 rounded-full blur-xl animate-float"
          style={{ animationDelay: "-3s" }}
        ></div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Heading + Subtitle */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }} // chạy lại nhiều lần khi cuộn
          variants={fadeUp}
          custom={0.0}
        >
          <h1 className="font-bold text-5xl sm:text-6xl lg:text-7xl mb-6 leading-tight text-white text-center">
            Chợ{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
              Dataset
            </span>{" "}
            Chất lượng
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.6)]">
              Việt Nam
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Khám phá, thử nghiệm và mua các mô hình AI tiên tiến nhất. Thanh
            toán dễ dàng bằng VND hoặc tiền điện tử.
          </p>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          custom={0.2} // delay nhẹ sau heading
        >
          <Button
            onClick={scrollToModels}
            size="lg"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 px-8 py-4 text-lg cursor-pointer"
          >
            <Rocket className="mr-2 h-5 w-5" />
            Khám phá ngay
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all duration-300 px-8 py-4 text-lg cursor-pointer rounded-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Xem demo
          </Button>
        </motion.div>

        {/* Stats – đoạn ở dưới, cuộn từ dưới lên sẽ thấy nó trượt lên + hiện dần */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              variants={fadeUp}
              custom={0.3 + index * 0.15} // từng card delay chút
            >
              <Card className="hover:scale-105 transition-transform duration-300 bg-black/40 backdrop-blur-md border border-purple-500/20 rounded-xl cursor-pointer shadow-lg hover:shadow-purple-500/20">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(168,85,247,0.45)] mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-300">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
