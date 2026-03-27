"use client";

import { useEffect, useState } from "react";
import { useUserProfile, useUpdateUserProfile } from "@/hooks/user/useUser";
import { toast } from "sonner";
import { User } from "@/types";

// 🧩 layout chung (giống trang home)
import Background from "@/components/background";
import Navbar from "@/components/navBar";
import Footer from "@/components/footer";

export default function ProfilePage() {
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  // ✅ Dùng React Query lấy profile
  const { data: profile, isLoading } = useUserProfile(token || "", isClient);
  const updateMutation = useUpdateUserProfile(token || "");

  const [form, setForm] = useState<Partial<User>>({});
  const [isEditing, setIsEditing] = useState(false);

  // 🧠 Trạng thái seller (NONE / PENDING / APPROVED / REJECTED)
  const [sellerStatus, setSellerStatus] = useState<
    "NONE" | "PENDING" | "APPROVED" | "REJECTED"
  >("NONE");
  const [sellerAdminNote, setSellerAdminNote] = useState<string | null>(null);

  // 🔄 Lấy trạng thái seller hiện tại
  useEffect(() => {
    if (!isClient || !token) return;

    const fetchSellerStatus = async () => {
      try {
        const res = await fetch("http://localhost:3001/seller/verification/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          // chưa đăng ký seller
          setSellerStatus("NONE");
          setSellerAdminNote(null);
          return;
        }

        const data = await res.json();
        if (!data) {
          setSellerStatus("NONE");
          setSellerAdminNote(null);
          return;
        }

        setSellerStatus(data.status as any);
        setSellerAdminNote(data.admin_note || null);
      } catch {
        // lỗi thì bỏ qua, tránh làm crash profile
      }
    };

    fetchSellerStatus();
  }, [isClient, token]);

  // ✅ Gán form khi có dữ liệu
  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  // ✅ Lưu thay đổi
  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync(form);
      toast.success("Cập nhật thành công!");
      setIsEditing(false);
    } catch {
      toast.error("Không thể cập nhật thông tin");
    }
  };

  // ✅ Loading state (Skeleton)
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">
        <div className="relative z-0">
          <Background />
          <Navbar />
          <ProfileSkeleton />
          <Footer />
        </div>
      </div>
    );
  }

  // ✅ Không tìm thấy user
  if (!profile)
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex items-center justify-center text-gray-300">
        Không tìm thấy thông tin người dùng.
      </div>
    );

  // ✅ Hiển thị giao diện chính
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">
      <div className="relative z-0">
        <Background />
        <Navbar />

        <main className="py-10 px-4">
          <div className="max-w-3xl mx-auto bg-black/40 border border-purple-700/70 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-white transition-all duration-300">
            {/* Header */}
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-green-400 rounded-full flex items-center justify-center text-3xl font-bold shadow-md uppercase">
                {profile.full_name?.charAt(0) ||
                  profile.email?.charAt(0) ||
                  "U"}
              </div>

              <h2 className="text-2xl font-semibold mt-4">
                {profile.full_name ||
                  profile.email?.split("@")[0] ||
                  "Người dùng"}
              </h2>

              <p className="text-sm text-gray-400">
                Vai trò:{" "}
                <span className="uppercase text-purple-400 font-semibold">
                  {profile.role?.toUpperCase() || "CHƯA XÁC ĐỊNH"}
                </span>
              </p>
            </div>

            {/* 🆕 Khung trạng thái tài khoản Seller */}
            <div className="mb-6">
              {sellerStatus === "NONE" && (
                <div className="rounded-xl border border-slate-600/60 bg-black/50 px-4 py-3 text-sm text-gray-200 flex items-center justify-between">
                  <span>Bạn chưa đăng ký trở thành Seller.</span>
                  <button
                    onClick={() => (window.location.href = "/seller/register")}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white"
                  >
                    Đăng ký Seller
                  </button>
                </div>
              )}

              {sellerStatus === "PENDING" && (
                <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
                  <p>
                    Bạn đã gửi yêu cầu đăng ký{" "}
                    <span className="font-semibold">tài khoản Seller</span>. Yêu
                    cầu hiện đang{" "}
                    <span className="font-semibold">chờ admin xét duyệt</span>.
                  </p>
                </div>
              )}

              {sellerStatus === "APPROVED" && (
                <div className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  <p>
                    Tài khoản của bạn đã được{" "}
                    <span className="font-semibold">
                      xác thực trở thành Seller
                    </span>
                    . Bạn có thể bắt đầu đăng và quản lý dataset.
                  </p>
                </div>
              )}

              {sellerStatus === "REJECTED" && (
                <div className="rounded-xl border border-red-500/60 bg-red-500/10 px-4 py-3 text-sm text-red-100 space-y-2">
                  <p>
                    Yêu cầu đăng ký Seller của bạn đã{" "}
                    <span className="font-semibold">bị từ chối</span>.
                  </p>
                  {sellerAdminNote && (
                    <p className="text-xs">
                      <span className="font-semibold">Lý do:</span>{" "}
                      {sellerAdminNote}
                    </p>
                  )}
                  <button
                    onClick={() => (window.location.href = "/seller/register")}
                    className="mt-1 inline-flex px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white"
                  >
                    Đăng ký xét duyệt lại
                  </button>
                </div>
              )}
            </div>

            {/* Form fields */}
            <div className="space-y-4">
              {fields.map(({ key, label, disabled }) => {
                const value =
                  form[key as keyof User] ??
                  profile[key as keyof User] ??
                  "";
                return (
                  <Field
                    key={key}
                    label={label}
                    value={String(value)}
                    disabled={!isEditing || disabled}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                  />
                );
              })}
            </div>

            {/* Dates */}
            <div className="text-sm text-gray-500 mt-6 space-y-1">
              <p>
                Ngày tạo:{" "}
                {new Date(profile.created_at).toLocaleString("vi-VN")}
              </p>
              <p>
                Cập nhật:{" "}
                {new Date(profile.updated_at).toLocaleString("vi-VN")}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3 mt-6">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition"
                >
                  Chỉnh sửa
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSave}
                    className={`px-5 py-2 rounded-lg text-white font-semibold transition ${
                      updateMutation.isPending
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-green-500 hover:bg-green-600"
                    }`}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Đang lưu..." : "Lưu"}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setForm(profile);
                    }}
                    className="px-5 py-2 bg-gray-500 hover:bg-gray-600 rounded-lg font-semibold transition"
                  >
                    Hủy
                  </button>
                </>
              )}
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}

// 🧩 Field component
function Field({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full rounded-xl border border-purple-600/70 px-3 py-2 bg-gray-900/70 text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-400 outline-none transition ${
          disabled ? "opacity-70 cursor-not-allowed" : ""
        }`}
      />
    </div>
  );
}

// 🧩 Skeleton khi đang loading
function ProfileSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-3xl w-full bg-black/40 border border-purple-700 p-8 rounded-3xl shadow-2xl backdrop-blur-md text-white space-y-4 animate-pulse">
        <div className="flex flex-col items-center mb-6">
          <div className="w-24 h-24 rounded-full bg-purple-700/30 mb-4"></div>
          <div className="h-6 w-32 bg-purple-700/30 mb-2 rounded"></div>
          <div className="h-4 w-24 bg-purple-700/20 rounded"></div>
        </div>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 w-full bg-purple-700/10 rounded-md" />
        ))}
      </div>
    </div>
  );
}

// 🧠 Cấu hình các field
const fields = [
  { key: "full_name", label: "Họ và tên" },
  { key: "email", label: "Email", disabled: true },
  { key: "phone_number", label: "Số điện thoại" },
  { key: "wallet_address", label: "Địa chỉ ví", disabled: true },
  { key: "bank_name", label: "Tên ngân hàng" },
  { key: "bank_user_name", label: "Chủ tài khoản" },
  { key: "bank_account", label: "Số tài khoản" },
];
