"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/user/useUser";

type SellerFormState = {
  full_name: string;
  phone: string;
  id_number: string;
  bank_name: string;
  bank_owner: string;
  bank_account: string;
  shop_description: string;
  front_image: File | null;
  back_image: File | null;
};

export default function SellerRegisterScreen() {
  const router = useRouter();

  // giống profile: lấy token từ localStorage
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  // gọi hook lấy profile, giống ProfilePage
  const { data: profile, isLoading } = useUserProfile(token || "", isClient);

  const [form, setForm] = useState<SellerFormState>({
    full_name: "",
    phone: "",
    id_number: "",
    bank_name: "",
    bank_owner: "",
    bank_account: "",
    shop_description: "",
    front_image: null,
    back_image: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // nếu không có token → đá về login
  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      toast.error("Bạn cần đăng nhập trước khi đăng ký Seller.");
      router.push("/login"); // nếu route login khác thì sửa lại
    }
  }, [isClient, token, router]);

  // Prefill dữ liệu từ profile khi đã load xong
  useEffect(() => {
    if (!profile) return;

    setForm((prev) => ({
      ...prev,
      full_name: profile.full_name ?? prev.full_name,
      phone: profile.phone_number ?? prev.phone,
      bank_name: profile.bank_name ?? prev.bank_name,
      bank_owner: profile.bank_user_name ?? prev.bank_owner,
      bank_account: profile.bank_account ?? prev.bank_account,
    }));
  }, [profile]);

  const handleChange =
    (field: keyof SellerFormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleFileChange =
    (field: "front_image" | "back_image") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null;
      setForm((prev) => ({ ...prev, [field]: file }));
    };

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!profile) {
    return toast.error("Không tìm thấy thông tin người dùng.");
  }

  if (!token) {
    toast.error("Bạn cần đăng nhập trước khi đăng ký Seller.");
    return router.push("/login");
  }

  if (!form.full_name || !form.id_number || !form.front_image || !form.back_image) {
    return toast.error(
      "Vui lòng nhập đầy đủ họ tên, số CCCD và tải lên cả 2 ảnh mặt trước / mặt sau."
    );
  }

  if (!profile.bank_name || !profile.bank_user_name || !profile.bank_account) {
    return toast.error(
      "Vui lòng cập nhật đầy đủ thông tin ngân hàng trong trang Hồ sơ trước khi đăng ký Seller."
    );
  }

  try {
    setIsSubmitting(true);

    // 1️⃣ Upload ảnh lên backend để lấy URL
    const fileForm = new FormData();
    fileForm.append("front_image", form.front_image);
    fileForm.append("back_image", form.back_image);

    const uploadRes = await fetch("http://localhost:3001/seller-upload/images", {
      method: "POST",
      body: fileForm, // KHÔNG set Content-Type, browser tự set
    });

    const uploadData = await uploadRes.json();
    if (!uploadRes.ok) {
      throw new Error(uploadData.message || "Không thể upload ảnh CCCD.");
    }

    const frontImageUrl = uploadData.front_image_url;
    const backImageUrl = uploadData.back_image_url;

    // 2️⃣ Gửi request Seller kèm URL ảnh thật
    const res = await fetch("http://localhost:3001/seller/verification", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        full_name: form.full_name,
        phone_number: form.phone,
        id_number: form.id_number,
        bank_name: profile.bank_name,
        bank_user_name: profile.bank_user_name,
        bank_account: profile.bank_account,
        shop_description: form.shop_description,
        front_image_url: frontImageUrl,
        back_image_url: backImageUrl,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Không thể gửi yêu cầu Seller.");
    }

    toast.success("Đã gửi yêu cầu Seller, đang chờ admin xét duyệt.");
    router.push("/profile");
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Lỗi khi gửi yêu cầu Seller.");
  } finally {
    setIsSubmitting(false);
  }
};


  // loading giống profile
  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] px-4">
        <div className="max-w-2xl w-full bg-black/40 border border-purple-700 p-8 rounded-2xl shadow-2xl backdrop-blur-md text-white space-y-4 animate-pulse">
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] flex items-center justify-center text-white">
        Không tìm thấy thông tin người dùng.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-black/40 border border-purple-500/40 rounded-3xl shadow-2xl backdrop-blur-md text-white p-8 md:p-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            Đăng ký{" "}
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 text-transparent bg-clip-text">
              Seller account
            </span>
          </h1>
          <p className="text-sm md:text-base text-gray-300">
            Hoàn tất thông tin bên dưới để gửi yêu cầu trở thành người bán dataset trên OpenDataMarket.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Nhóm 1: thông tin cá nhân */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Thông tin cá nhân</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Họ và tên</label>
                <Input
                  placeholder="VD: Nguyễn Văn A"
                  value={form.full_name}
                  onChange={handleChange("full_name")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Số điện thoại</label>
                <Input
                  placeholder="VD: 0909xxx..."
                  value={form.phone}
                  onChange={handleChange("phone")}
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Số CCCD / CMND</label>
                <Input
                  placeholder="VD: 0790xxxxxxx"
                  value={form.id_number}
                  onChange={handleChange("id_number")}
                />
              </div>
            </div>
          </div>

          {/* Nhóm 2: thanh toán – lấy từ profile & disable */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Thông tin thanh toán</h2>
            <p className="text-xs text-gray-400 mb-2">
              Các thông tin dưới đây được lấy từ hồ sơ cá nhân. Nếu cần thay đổi, hãy chỉnh sửa tại trang{" "}
              <span className="font-semibold">Hồ sơ</span>.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Tên ngân hàng</label>
                <Input
                  placeholder="VD: MB Bank, Vietcombank..."
                  value={form.bank_name}
                  onChange={handleChange("bank_name")}
                  disabled
                  className="bg-white/5 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Chủ tài khoản</label>
                <Input
                  placeholder="Tên in trên tài khoản"
                  value={form.bank_owner}
                  onChange={handleChange("bank_owner")}
                  disabled
                  className="bg-white/5 cursor-not-allowed"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Số tài khoản</label>
                <Input
                  placeholder="Nhập số tài khoản ngân hàng"
                  value={form.bank_account}
                  onChange={handleChange("bank_account")}
                  disabled
                  className="bg-white/5 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 3: mô tả gian hàng */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Mô tả gian hàng</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm mb-1">Mô tả ngắn</label>
                <Textarea
                  placeholder="Mô tả ngắn về loại dataset bạn sẽ bán..."
                  value={form.shop_description}
                  onChange={handleChange("shop_description")}
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </div>

          {/* Nhóm 4: CCCD */}
          <div>
            <h2 className="text-lg font-semibold mb-3">Xác minh CCCD / CMND</h2>
            <p className="text-sm text-gray-300 mb-3">
              Vui lòng tải lên ảnh rõ nét, không bị chói sáng, thấy đủ 4 góc. Thông tin này sẽ được dùng để
              xác minh danh tính và gửi cho AI phân tích hỗ trợ admin xét duyệt.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Ảnh mặt trước</label>
                <Input type="file" accept="image/*" onChange={handleFileChange("front_image")} />
              </div>
              <div>
                <label className="block text-sm mb-1">Ảnh mặt sau</label>
                <Input type="file" accept="image/*" onChange={handleFileChange("back_image")} />
              </div>
            </div>
          </div>

          {/* Check + submit */}
          <div className="flex items-start gap-2 text-sm">
            <input type="checkbox" required className="mt-1" />
            <span>
              Tôi cam kết các thông tin cung cấp là chính xác và đồng ý cho hệ thống sử dụng AI để hỗ trợ
              xét duyệt tài khoản Seller của tôi.
            </span>
          </div>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu xét duyệt"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
