"use client";
import { useEffect, useState } from "react";
import { Brain, Facebook, Twitter, Linkedin, Github, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { motion } from "framer-motion";

// hiệu ứng fade up đơn giản
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay },
  }),
};

export function Footer() {
  const productLinks = [
    { label: "Mô hình AI", href: "#models" },
    { label: "Playground", href: "#playground" },
    { label: "API Service", href: "#api" },
    { label: "Enterprise", href: "#enterprise" },
    { label: "Training Hub", href: "#training" },
  ];

  const supportLinks = [
    { label: "Tài liệu", href: "#docs" },
    { label: "Hướng dẫn", href: "#guides" },
    { label: "Community", href: "#community" },
    { label: "Liên hệ", href: "#contact" },
    { label: "Bug Report", href: "#bug-report" },
  ];

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
    { icon: Github, href: "#", label: "GitHub" },
  ];

  // --- state cho form (GIỮ NGUYÊN) ---
  const [email, setEmail] = useState("");
  const [name, setName] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // --- lấy tên user đã login (GIỮ NGUYÊN) ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user"); // tuỳ hệ thống auth của bạn
      if (raw) {
        const u = JSON.parse(raw);
        if (u?.name) setName(u.name);
        if (u?.email && !email) setEmail(u.email); // auto fill nếu có
      }
    } catch {}
  }, []);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }), // gửi cả name để mail chào tên
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Đăng ký thất bại");
      setMsg({ type: "ok", text: "Đã gửi! Vui lòng kiểm tra hộp thư." });
      setEmail("");
    } catch (err: any) {
      setMsg({ type: "err", text: err?.message || "Có lỗi, thử lại sau." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.footer
      className="bg-transparent py-10 border-t border-purple-600/20"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.3 }} // kéo tới footer là trồi lên
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.3 }}
        >
          {/* Company */}
          <motion.div variants={fadeUp} custom={0}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">
                OpenDataMarket
              </span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Nền tảng giao dịch datasets hàng đầu Việt Nam, kết nối các nhà
              phát triển & người dùng.
            </p>

            <div className="flex space-x-3">
              {socialLinks.map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  aria-label={s.label}
                  className="w-9 h-9 bg-white/5 border border-white/10 backdrop-blur rounded-lg flex items-center justify-center hover:border-purple-500/40 hover:text-purple-400 transition"
                >
                  <s.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </motion.div>

          {/* Product */}
          <motion.div variants={fadeUp} custom={0.1}>
            <h4 className="font-semibold text-white mb-4">Sản phẩm</h4>
            <ul className="space-y-2">
              {productLinks.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="text-gray-400 hover:text-purple-400 text-sm transition"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div variants={fadeUp} custom={0.2}>
            <h4 className="font-semibold text-white mb-4">Hỗ trợ</h4>
            <ul className="space-y-2">
              {supportLinks.map((l, i) => (
                <li key={i}>
                  <a
                    href={l.href}
                    className="text-gray-400 hover:text-purple-400 text-sm transition"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Subscribe */}
          <motion.div variants={fadeUp} custom={0.3}>
            <h4 className="font-semibold text-white mb-4">Nhận thông báo</h4>
            <p className="text-gray-400 text-sm mb-3">
              Cập nhật dataset mới nhất
            </p>

            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="email@example.com"
                className="bg-white/5 border border-purple-500/30 text-white placeholder-gray-400"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:shadow-lg hover:shadow-purple-500/40 transition disabled:opacity-60"
              >
                <Send className="mr-2 h-4 w-4" />
                {loading ? "Đang gửi..." : "Đăng ký"}
              </Button>

              {msg && (
                <p
                  className={`text-xs ${
                    msg.type === "ok" ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {msg.text}
                </p>
              )}
              {name && (
                <p className="text-[11px] text-gray-400">
                  Đăng ký với tên:{" "}
                  <span className="text-gray-300 font-medium">{name}</span>
                </p>
              )}
            </form>
          </motion.div>
        </motion.div>

        {/* Bottom */}
        <motion.div
          className="border-t border-purple-500/10 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span>© 2025 OpenDataMarket. All rights reserved.</span>
          <div className="flex space-x-6 mt-3 md:mt-0">
            <a className="hover:text-purple-400 transition" href="#terms">
              Điều khoản
            </a>
            <a className="hover:text-purple-400 transition" href="#privacy">
              Bảo mật
            </a>
            <a className="hover:text-purple-400 transition" href="#cookies">
              Cookies
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
export default Footer;