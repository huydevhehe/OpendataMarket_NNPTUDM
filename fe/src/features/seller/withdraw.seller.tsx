"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

type WithdrawDto = {
  withdraw_id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  created_at: string;
  processed_at: string | null;
  note: string | null;
};

export default function WithdrawSellerPage() {
  const [items, setItems] = useState<WithdrawDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------
  // LOAD LỊCH SỬ RÚT TIỀN (đúng route: /withdraw/me)
  // ---------------------------------------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/withdraw/me`,
        { credentials: "include" }
      );

      if (!res.ok) {
        throw new Error("Không thể tải lịch sử rút tiền");
      }

      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi tải dữ liệu rút tiền");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = () => {
    setAmount("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalOpen(false);
  };

  // ---------------------------------------------------
  // GỬI YÊU CẦU RÚT TIỀN (đúng route: POST /withdraw)
  // ---------------------------------------------------
  const handleSubmit = async () => {
    const value = Number(amount.replace(/[^0-9]/g, ""));
    if (!value || value <= 0) {
      toast.error("Vui lòng nhập số tiền hợp lệ");
      return;
    }

    try {
      setSubmitting(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/withdraw`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: value }),
        }
      );

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || "Tạo yêu cầu rút tiền thất bại");
      }

      toast.success("Đã tạo yêu cầu rút tiền, chờ admin duyệt");
      closeModal();
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Lỗi khi gửi yêu cầu rút tiền");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status: WithdrawDto["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-500/20 text-amber-300 border-amber-400/50";
      case "APPROVED":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-400/50";
      case "REJECTED":
        return "bg-rose-500/20 text-rose-300 border-rose-400/50";
      default:
        return "bg-slate-700 text-slate-100 border-slate-500";
    }
  };

  const getStatusLabel = (status: WithdrawDto["status"]) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ duyệt";
      case "APPROVED":
        return "Đã thanh toán";
      case "REJECTED":
        return "Bị từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Rút tiền</h2>
          <p className="text-sm text-slate-400">
            Tạo yêu cầu rút số dư khả dụng, admin sẽ kiểm tra và duyệt.
          </p>
        </div>

        <button
          onClick={openModal}
          className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-sm font-semibold shadow-md transition"
        >
          + Tạo yêu cầu rút tiền
        </button>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Đang tải lịch sử rút tiền...</p>
      )}

      {!loading && items.length === 0 && (
        <div className="px-4 py-3 bg-slate-900/70 border border-slate-700 rounded-lg text-sm text-slate-400">
          Chưa có yêu cầu rút tiền nào.
        </div>
      )}

      <div className="space-y-3">
        {items.map((w) => (
          <div
            key={w.withdraw_id}
            className="p-4 bg-slate-900/70 border border-slate-800 rounded-lg flex items-center justify-between"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-50">
                  {w.amount.toLocaleString()} VND
                </span>
                <span
                  className={`text-[11px] uppercase tracking-wide border px-2 py-0.5 rounded-full ${getStatusBadgeClass(
                    w.status
                  )}`}
                >
                  {getStatusLabel(w.status)}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Tạo lúc:{" "}
                {new Date(w.created_at).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              {w.note && (
                <p className="text-xs text-slate-500 mt-1">
                  Ghi chú admin: <span className="text-slate-200">{w.note}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL NHẬP SỐ TIỀN */}
      {modalOpen && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-white">
              Yêu cầu rút tiền
            </h3>
            <p className="text-sm text-slate-300">
              Nhập số tiền muốn rút (VND). Hệ thống sẽ trừ khỏi số dư khả dụng.
            </p>

            <div className="space-y-2">
              <label className="text-xs text-slate-400">
                Số tiền cần rút (VND)
              </label>
              <input
                type="number"
                min={0}
                placeholder="Ví dụ: 500000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={closeModal}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm border border-slate-600 text-slate-200 hover:bg-slate-800 transition disabled:opacity-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-900 bg-emerald-500 hover:bg-emerald-400 transition disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Xác nhận rút tiền"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
