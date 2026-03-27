"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

type PlanId = "buyer" | "seller" | "enterprise";

const plans = [
  {
    id: "buyer",
    titleEn: "Buyer account",
    titleVi: "Tài khoản người mua",
    price: "Free",
    priceSub: "/month",
    button: "Đăng ký miễn phí",
    description:
      "Phù hợp cho người dùng muốn tải dữ liệu và khám phá kho dữ liệu.",
    features: [
      "Tải xuống tập dữ liệu miễn phí hoặc có phí",
      "Theo dõi lịch sử tải xuống",
      "Tìm kiếm & lọc dataset nâng cao",
      "Hỗ trợ qua email",
    ],
  },
  {
    id: "seller",
    titleEn: "Seller account",
    titleVi: "Tài khoản người bán",
    price: "$0",
    priceSub: "/month · transaction fee applies",
    button: "Đăng ký người bán",
    description:
      "Dành cho người bán tập dữ liệu muốn đăng, quản lý doanh thu và khách hàng.",
    features: [
      "Đăng và quản lý dataset",
      "Bảng điều khiển doanh thu",
      "Rút tiền tự động theo chu kỳ",
      "Thống kê lượt tải & hành vi người dùng",
      "Hỗ trợ ưu tiên",
    ],
  },
  {
    id: "enterprise",
    titleEn: "Business account",
    titleVi: "Doanh nghiệp",
    price: "Coming soon",
    button: "Sắp ra mắt",
    description:
      "Giải pháp dành cho tổ chức lớn với nhu cầu bảo mật, tích hợp và mở rộng.",
    features: [
      "Quản lý nhiều phòng ban",
      "Phân quyền nâng cao",
      "Ký hợp đồng SLA",
      "Tích hợp hệ thống nội bộ",
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay },
  }),
};

export default function AccountPlans() {
  const router = useRouter();
  const [selected, setSelected] = useState<PlanId>("seller");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoggedIn(!!localStorage.getItem("accessToken"));
    }
  }, []);

  const reorder = (): PlanId[] => {
    if (selected === "buyer") return ["seller", "buyer", "enterprise"];
    if (selected === "enterprise") return ["seller", "enterprise", "buyer"];
    return ["buyer", "seller", "enterprise"];
  };

  const orderedPlans = reorder().map(
    (id) => plans.find((p) => p.id === id)!
  );

  // --- HANDLE BUTTONS ---

  const handleBuyerClick = () => {
    if (!isLoggedIn) return router.push("/register");
    toast.info("Bạn đã có tài khoản rồi.");
  };

  const handleSellerClick = () => {
    if (!isLoggedIn) {
      return toast.error("Bạn cần đăng nhập trước.");
    }
    router.push("/seller/register");
  };

  const handleEnterpriseClick = () => {
    toast.info("Gói doanh nghiệp đang được phát triển.");
  };

  return (
    <section className="relative py-24 px-4">
      {/* background nhẹ cho section */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(168,85,247,0.18),_transparent_60%),radial-gradient(circle_at_bottom,_rgba(56,189,248,0.16),_transparent_55%)]" />

      <div className="container mx-auto max-w-6xl">
        {/* ==== TITLE ==== */}
        <motion.div
          className="text-center mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-flex items-center px-4 py-1 mb-4 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs md:text-sm text-purple-200 uppercase tracking-[0.15em]">
            Chọn loại tài khoản
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Đăng ký{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              Account
            </span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Mỗi loại tài khoản có quyền lợi khác nhau, phù hợp cho từng nhu cầu
            của người mua, người bán và doanh nghiệp.
          </p>
        </motion.div>

        {/* ==== PLANS ==== */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
        >
          {orderedPlans.map((plan, index) => {
            const isSel = plan.id === selected;

            const clickButton = () => {
              if (plan.id === "buyer") return handleBuyerClick();
              if (plan.id === "seller") return handleSellerClick();
              return handleEnterpriseClick();
            };

            return (
              <motion.div
                key={plan.id}
                variants={fadeUp}
                custom={0.1 + index * 0.12}
                className="relative"
              >
                {/* viền glow cho card đang chọn */}
                {isSel && (
                  <div className="pointer-events-none absolute -inset-[2px] rounded-3xl bg-gradient-to-b from-purple-500/70 via-pink-500/70 to-sky-500/70 opacity-70 blur-lg" />
                )}

                <Card
                  onClick={() => setSelected(plan.id)}
                  className={`relative p-8 h-full cursor-pointer transition-all duration-300 rounded-3xl border
                    ${
                      isSel
                        ? "bg-slate-950/80 border-purple-400/70 shadow-[0_0_45px_rgba(168,85,247,0.5)] scale-[1.04]"
                        : "bg-slate-950/60 border-slate-700/70 hover:border-purple-400/60 hover:shadow-[0_0_28px_rgba(168,85,247,0.35)] hover:-translate-y-1"
                    } backdrop-blur-xl`}
                >
                  {/* Badge */}
                  <div className="mb-4 flex justify-between items-center">
                    {isSel && (
                      <span className="inline-flex px-3 py-1 rounded-full bg-purple-500/15 border border-purple-400/60 text-xs font-semibold text-purple-100">
                        Đang chọn
                      </span>
                    )}

                    {!isSel && plan.id === "seller" && (
                      <span className="inline-flex px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/60 text-xs font-semibold text-emerald-200">
                        Phổ biến nhất
                      </span>
                    )}
                  </div>

                  {/* English + Vietnamese titles */}
                  <h3 className="text-2xl font-bold mb-1 text-white">
                    {plan.titleEn}
                  </h3>
                  <p className="text-sm text-purple-200/80 mb-4">
                    {plan.titleVi}
                  </p>

                  <p className="text-sm md:text-[15px] text-muted-foreground mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-extrabold text-white">
                      {plan.price}
                    </span>
                    {plan.priceSub && (
                      <span className="block text-xs md:text-sm text-muted-foreground mt-1">
                        {plan.priceSub}
                      </span>
                    )}
                  </div>

                  <Button
                    variant={isSel ? "hero" : "outline"}
                    className={`w-full mb-6 text-sm md:text-base ${
                      isSel
                        ? "shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                        : "hover:shadow-[0_0_18px_rgba(168,85,247,0.45)]"
                    }`}
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      clickButton();
                    }}
                  >
                    {plan.button}
                  </Button>

                  {/* Features */}
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-full bg-purple-500/15 p-1.5">
                          <Check className="w-4 h-4 text-purple-300" />
                        </span>
                        <span className="text-sm text-muted-foreground leading-relaxed">
                          {f}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
