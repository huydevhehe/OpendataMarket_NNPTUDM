"use client";

/* ====== IMPORT GIỮ CHỨC NĂNG CŨ ====== */
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import {
  Brain,
  Menu,
  X,
  User,
  LogOut,
  History,
  UserCircle,
  Home,
  Store,
  Mail,
  Info,
  Shield, // icon cho Admin Panel
    Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useUserProfile } from "@/hooks/user/useUser";
import ChatDropdown from "@/app/chat/components/ChatDropdown";
import FloatingChatWidget from "@/app/chat/components/FloatingChatWidget";
import { decodeToken } from "@/lib/decodeToken";

/* ====== UI/EFFECT TỪ NAVBAR MỚI ====== */
import { motion } from "framer-motion";

type Conversation = any; // tuỳ định nghĩa thật trong code m

function NavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="block px-3 py-2 text-gray-300 hover:text-purple-400 transition-colors"
    >
      {children}
    </Link>
  );
}

export default function Navbar() {
  /* ====== GIỮ LOGIC CŨ ====== */
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  // 💬 Mini chat state (GIỮ)
  const [activeConversation, setActiveConversation] =
    useState<Conversation | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // token đã decode (user_id, role,...)
  const [decodedToken, setDecodedToken] = useState<any | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // lấy token từ localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("accessToken");
      setToken(storedToken);
    }
  }, []);

  // decode token mỗi khi token đổi
  useEffect(() => {
    if (!token) {
      setDecodedToken(null);
      return;
    }
    try {
      const d = decodeToken(token);
      setDecodedToken(d);
      // console.log("decoded navbar:", d);
    } catch (err) {
      console.error("Decode token fail in navbar:", err);
      setDecodedToken(null);
    }
  }, [token]);

  const { data: user, isLoading } = useUserProfile(token || "", !!token);

  // Phân quyền: ưu tiên role từ profile, fallback role trong token
  const rawRole =
    (user as any)?.role ?? decodedToken?.role ?? (user as any)?.user_role;
  const userRole = rawRole?.toString().toUpperCase();
  const isSeller = userRole === "SELLER";
  const isAdmin = userRole === "ADMIN";

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    window.location.reload();
  };

  const handleSelectConversation = (c: Conversation) => {
    setActiveConversation(c);
    setIsChatOpen(true);
  };

  const navItems = [
    { href: "/home", label: "Trang chủ", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/contact", label: "Liên hệ", icon: Mail },
    { href: "/about", label: "About Us", icon: Info },
  ];

  /* ====== VIEW: GIAO DIỆN/HIỆU ỨNG MỚI + CHỨC NĂNG CŨ ====== */
  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        className="fixed top-0 left-0 w-full z-50 flex justify-center transition-all duration-500"
      >
        {/* Khung trung tâm kiểu UI mới */}
        <div
          className={`flex items-center justify-between w-[90%] max-w-6xl px-6 py-3 transition-all duration-500
          ${
            scrolled
              ? "w-full max-w-full bg-slate-950/95 backdrop-blur-xl border border-white/10 shadow-lg"
              : "rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-md"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-md shadow-purple-500/30">
              <Brain className="text-white w-4 h-4" />
            </div>
            <span className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent group-hover:opacity-90 transition-all duration-300">
              OpenDataMarket
            </span>
          </Link>

          {/* Menu desktop (giữ route cũ + icon) */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                <item.icon className="w-4 h-4 mr-1 text-purple-400" />
                {item.label}
              </NavLink>
            ))}

            {/* 💬 Chat dropdown (GIỮ CHỨC NĂNG CŨ) */}
            {token && (
              <ChatDropdown
                token={token}
                onSelectConversation={handleSelectConversation}
              />
            )}
          </div>

          {/* Actions / Account */}
          <div className="hidden md:flex items-center gap-3">
            {!token ? (
              <>
                <Link href="/login">
                  <Button
                    variant="outline"
                    className="border-purple-500 text-purple-400 hover:bg-purple-500/10"
                  >
                    Đăng nhập
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-purple-500 to-green-500 text-white hover:shadow-lg">
                    Đăng ký
                  </Button>
                </Link>
              </>
            ) : isLoading ? (
              <div className="flex items-center gap-2 text-gray-300">
                <User className="text-purple-400 animate-pulse" size={20} />
                <span className="animate-pulse">Đang tải...</span>
              </div>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <UserCircle className="text-green-500" size={22} />
                    <span className="text-gray-200 font-semibold">
                      {user?.full_name || "Người dùng"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-slate-900 border border-gray-700 shadow-xl p-1"
                >
                  <DropdownMenuLabel className="text-gray-400 p-2">
                    Xin chào,{" "}
                    <span className="text-purple-400 font-semibold">
                      {user?.full_name || "Người dùng"}
                    </span>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700 my-1" />

                  {/* Lịch sử giao dịch */}
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      href="/history" // nếu route khác, chỉ cần đổi path này
                      className="flex items-center gap-2 w-full p-2 text-gray-200 hover:bg-slate-800 rounded-md"
                    >
                      <History className="w-4 h-4 text-purple-500" />
                      Lịch sử giao dịch
                    </Link>
                  </DropdownMenuItem>
{/* 💰 Ví của tôi */}
<DropdownMenuItem asChild className="p-0">
  <Link
    href="/wallet"
    className="flex items-center gap-2 w-full p-2 text-gray-200 hover:bg-slate-800 rounded-md"
  >
    <Wallet className="w-4 h-4 text-green-400" />
    Ví & nạp tiền
  </Link>
</DropdownMenuItem>
                  {/* Hồ sơ cá nhân */}
                  <DropdownMenuItem asChild className="p-0">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 w-full p-2 text-gray-200 hover:bg-slate-800 rounded-md"
                    >
                      <UserCircle className="w-4 h-4 text-purple-500" />
                      Hồ sơ cá nhân
                    </Link>
                  </DropdownMenuItem>

                  {/* Seller Panel – chỉ seller mới thấy */}
                  {isSeller && decodedToken?.user_id && (
                    <DropdownMenuItem asChild className="p-0">
                      <Link
                        href={`/seller/${decodedToken.user_id}`}
                        className="flex items-center gap-2 w-full p-2 text-gray-200 hover:bg-slate-800 rounded-md"
                      >
                        <Store className="w-4 h-4 text-purple-500" />
                        Seller Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  {/* Admin Panel – chỉ admin mới thấy */}
                  {isAdmin && (
                    <DropdownMenuItem asChild className="p-0">
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 w-full p-2 text-gray-200 hover:bg-slate-800 rounded-md"
                      >
                        <Shield className="w-4 h-4 text-purple-500" />
                        Admin Panel
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-gray-700 my-1" />

                  {/* Đăng xuất */}
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 text-red-500 hover:bg-red-900/30 rounded-md cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-purple-400"
              onClick={() => setIsOpen((v) => !v)}
            >
              {isOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="absolute top-full left-0 w-full md:hidden bg-slate-950/95 backdrop-blur-md border-t border-white/10">
            <div className="mx-auto w-[90%] max-w-6xl py-3 space-y-2">
              <MobileNavLink href="/home">Trang chủ</MobileNavLink>
              <MobileNavLink href="/marketplace">Marketplace</MobileNavLink>
              <MobileNavLink href="/contact">Liên hệ</MobileNavLink>
              <MobileNavLink href="/about">About Us</MobileNavLink>

              {token && (
                <div className="pt-2 space-y-1">
                  <p className="text-gray-300">
                    Xin chào,{" "}
                    <span className="text-purple-400 font-medium">
                      {user?.full_name || "Người dùng"}
                    </span>
                  </p>

                  {/* Lịch sử giao dịch (mobile) */}
                  <MobileNavLink href="/history">
                    📜 Lịch sử giao dịch
                  </MobileNavLink>

                  {/* Hồ sơ cá nhân (mobile) */}
                  <MobileNavLink href="/profile">
                    👤 Hồ sơ cá nhân
                  </MobileNavLink>

                  {/* Seller Panel (mobile) */}
                  {isSeller && decodedToken?.user_id && (
                    <MobileNavLink href={`/seller/${decodedToken.user_id}`}>
                      🛒 Seller Panel
                    </MobileNavLink>
                  )}

                  {/* Admin Panel (mobile) */}
                  {isAdmin && (
                    <MobileNavLink href="/admin">
                      🛡 Admin Panel
                    </MobileNavLink>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left text-red-500 hover:text-red-400 mt-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}

              {!token && (
                <div className="pt-2 flex gap-2">
                  <Link href="/login" className="w-full">
                    <Button
                      variant="outline"
                      className="w-full border-purple-500 text-purple-400 hover:bg-purple-500/10"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                  <Link href="/register" className="w-full">
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-green-500 text-white hover:shadow-lg">
                      Đăng ký
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.nav>

      {/* 💬 Mini Chat widget (GIỮ Y NGUYÊN) */}
      {isChatOpen && activeConversation && (
        <FloatingChatWidget
          conversationId={activeConversation.id}
          partnerName={
            activeConversation.seller?.full_name ||
            activeConversation.buyer?.full_name ||
            "Người dùng"
          }
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
}
