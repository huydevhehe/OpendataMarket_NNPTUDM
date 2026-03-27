"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/user/useUser";
import { useAdminSellerVerification } from "@/hooks/seller/useAdminSellerVerification";
import type { SellerStatus } from "@/services/sellerVerificationApi";

export default function SellerAdmin() {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // popup từ chối
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const { data: profile, isLoading: profileLoading } = useUserProfile(
    token || "",
    isClient
  );

  // chỉ admin mới vào được
  useEffect(() => {
    if (!isClient || profileLoading) return;

    if (!token) {
      toast.error("Bạn cần đăng nhập.");
      return router.push("/login");
    }

    if (profile && profile.role !== "admin") {
      toast.error("Chỉ admin mới vào được trang này.");
      return router.push("/");
    }
  }, [isClient, token, profile, profileLoading, router]);

  const {
    items,
    loading: listLoading,
    approve,
    reject,
  } = useAdminSellerVerification(
    token,
    !!token && !!profile && profile.role === "admin"
  );
console.log("Seller items:", items);

  const handleApprove = async (id: string) => {
    try {
      await approve(id);
      toast.success("Đã duyệt seller.");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi duyệt yêu cầu.");
    }
  };

  const openRejectModal = (id: string) => {
    setRejectId(id);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const handleConfirmReject = async () => {
    if (!rejectId) return;
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }

    try {
      await reject(rejectId, rejectReason.trim());
      toast.success("Đã từ chối yêu cầu seller.");
      setShowRejectModal(false);
      setRejectReason("");
      setRejectId(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Lỗi khi từ chối yêu cầu.");
    }
  };

  if (!isClient || profileLoading || listLoading) {
    return (
      <div className="text-white/80 text-sm">
        Đang tải danh sách yêu cầu Seller...
      </div>
    );
  }

  if (!profile || profile.role !== "admin") {
    return (
      <div className="text-red-300 text-sm">
        Bạn không có quyền xem danh sách này.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
            Quản lý yêu cầu Seller
          </h2>
          <p className="mt-1 text-xs md:text-sm text-gray-300">
            Xem, duyệt hoặc từ chối các yêu cầu đăng ký tài khoản người bán.
          </p>
        </div>
        <span className="text-xs md:text-sm px-3 py-1 rounded-full bg-black/40 border border-purple-500/60 text-purple-200">
          Tổng: <span className="font-semibold">{items.length}</span> yêu cầu
        </span>
      </div>

      {items.length === 0 ? (
        <div className="text-gray-300 text-sm">
          Chưa có yêu cầu Seller nào.
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => {
            // 🧠 Meta hiển thị cho điểm AI
            const aiMeta = getAiScoreMeta(item.ai_score as number | null | undefined);
            return (
              <div
                key={item.id}
                className="relative overflow-hidden rounded-2xl border border-purple-700/50 bg-gradient-to-br from-black/60 via-[#090921]/70 to-black/60 backdrop-blur-xl p-4 shadow-[0_0_18px_rgba(168,85,247,0.45)] hover:shadow-[0_0_32px_rgba(168,85,247,0.8)] transition duration-300"
              >
                {/* Card top */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-white">
                        {item.full_name}
                      </h3>
                      <span className="text-xs text-gray-400">
                        ({item.user?.email || "No email"})
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Gửi lúc:{" "}
                      {new Date(item.created_at).toLocaleString("vi-VN")}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={item.status} />

                    <span
                      className={`px-2 py-1 rounded-full text-[10px] font-semibold border ${aiMeta.badgeClass}`}
                    >
                      AI: {aiMeta.scoreText} – {aiMeta.levelLabel}
                    </span>


                    {item.status === "PENDING" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(item.id)}
                        >
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500 text-red-400 hover:bg-red-900/40"
                          onClick={() => openRejectModal(item.id)}
                        >
                          Từ chối
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-200 mb-3">
                  <div className="space-y-0.5">
                    <p>📞 {item.phone_number || "Không có"}</p>
                    <p>CCCD: {item.id_number}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p>🏦 {item.bank_name}</p>
                    <p>
                      Chủ TK: {item.bank_user_name} – {item.bank_account}
                    </p>
                  </div>
                  <div className="space-y-0.5">
                    <p>Mô tả shop: {item.shop_description || "–"}</p>
                  </div>
                </div>

                {/* Image links */}
                <div className="flex flex-wrap gap-3 text-xs mb-2">
                  <a
                    href={item.front_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-purple-400/70 px-3 py-1 text-purple-200 hover:bg-purple-500/20 hover:text-purple-50 transition"
                  >
                    Xem ảnh mặt trước
                  </a>
                  <a
                    href={item.back_image_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-purple-400/70 px-3 py-1 text-purple-200 hover:bg-purple-500/20 hover:text-purple-50 transition"
                  >
                    Xem ảnh mặt sau
                  </a>
                </div>

                {/* 🧠 Khung ghi chú AI cho admin */}
                <div className="mt-3 rounded-2xl border border-indigo-500/60 bg-indigo-950/40 px-3 py-3 text-xs text-indigo-100 space-y-1">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-semibold text-[11px] tracking-wide text-indigo-200 uppercase">
                      Đánh giá từ AI
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${aiMeta.badgeClass}`}
                    >
                      Điểm AI: {aiMeta.scoreText} – {aiMeta.levelLabel}
                    </span>
                  </div>
                  <p className="leading-relaxed whitespace-pre-line">
                    {item.ai_analysis ||
                      "AI chưa trả về phân tích chi tiết, vui lòng kiểm tra lại cấu hình AI ở backend."}
                  </p>
                  <p className="mt-1 text-[10px] text-indigo-300/80 italic">
                    Gợi ý: dùng block này để tham khảo, quyết định cuối cùng vẫn do Admin.
                  </p>
                </div>


                {/* Lý do từ chối */}
                {item.status === "REJECTED" && item.admin_note && (
                  <div className="mt-2 text-xs text-red-200 bg-red-500/10 border border-red-500/50 rounded-xl px-3 py-2 flex items-start gap-2">
                    <span className="mt-[2px]">⚠️</span>
                    <p>
                      <span className="font-semibold">Lý do từ chối:&nbsp;</span>
                      {item.admin_note}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal từ chối */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-600 bg-[#070920]/95 p-6 shadow-[0_0_30px_rgba(168,85,247,0.7)]">
            <h3 className="text-lg font-semibold mb-3 text-purple-200">
              Nhập lý do từ chối
            </h3>
            <p className="text-xs text-gray-300 mb-3">
              Lý do này sẽ hiển thị cho người dùng ở trang Hồ sơ sau khi yêu
              cầu bị từ chối.
            </p>

            <textarea
              className="w-full min-h-[120px] rounded-xl border border-purple-500/60 bg-black/40 p-3 text-sm text-white outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Ví dụ: Ảnh CCCD không rõ, vui lòng chụp lại và gửi yêu cầu mới..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />

            <div className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                className="border-gray-500 text-gray-200 hover:bg-gray-800/60"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                  setRejectId(null);
                }}
              >
                Hủy
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={handleConfirmReject}
              >
                Xác nhận từ chối
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SellerStatus }) {
  let label = "";
  let className = "";

  switch (status) {
    case "PENDING":
      label = "Đang chờ duyệt";
      className =
        "bg-yellow-500/20 text-yellow-300 border border-yellow-500/60";
      break;
    case "APPROVED":
      label = "Đã duyệt";
      className =
        "bg-green-500/20 text-green-300 border border-green-500/60";
      break;
    case "REJECTED":
      label = "Đã từ chối";
      className = "bg-red-500/20 text-red-300 border border-red-500/60";
      break;
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

/**
 * Tính meta hiển thị cho điểm AI (màu + label)
 */
function getAiScoreMeta(score?: number | null) {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return {
      scoreText: "N/A",
      levelLabel: "Chưa có đánh giá",
      badgeClass: "border-slate-400/60 text-slate-200 bg-slate-600/20",
    };
  }

  const rounded = Math.round(score);
  let levelLabel = "";
  let badgeClass = "";

  if (rounded >= 80) {
    levelLabel = "Tin cậy cao";
    badgeClass = "border-emerald-400/70 text-emerald-200 bg-emerald-900/30";
  } else if (rounded >= 50) {
    levelLabel = "Mức trung bình";
    badgeClass = "border-yellow-400/70 text-yellow-200 bg-yellow-900/30";
  } else {
    levelLabel = "Rủi ro cao";
    badgeClass = "border-red-400/70 text-red-200 bg-red-900/30";
  }

  return {
    scoreText: `${rounded}/100`,
    levelLabel,
    badgeClass,
  };
}
