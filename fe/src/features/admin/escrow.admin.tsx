"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

type EscrowStatus =
  | "HOLDING"
  | "RELEASED"
  | "DISPUTED"
  | "REFUNDED"
  | "CANCELLED";

type EscrowDto = {
  escrow_id: string;
  order_id: string;
  amount: number;
  status: EscrowStatus;
  release_at: string; // ISO string
  created_at: string;
  released_at: string | null;

  buyer: {
    full_name: string | null;
    email: string | null;
  };

  seller: {
    full_name: string | null;
    email: string | null;
  };

  dataset: {
    title: string;
  };
};

type ModalType = "release" | "refund" | "extend" | null;

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Lấy token admin giống các trang admin khác
const getAdminToken = () =>
  Cookies.get("accessToken") || localStorage.getItem("accessToken") || "";

export default function EscrowAdminPage() {
  const [items, setItems] = useState<EscrowDto[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalType, setModalType] = useState<ModalType>(null);
  const [selected, setSelected] = useState<EscrowDto | null>(null);
  const [note, setNote] = useState("");
  const [extraDays, setExtraDays] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // =================== FETCH LIST ===================

  const fetchData = async () => {
    try {
      setLoading(true);

      const token = getAdminToken();
      if (!token) {
        toast.error("Bạn chưa đăng nhập admin.");
        setItems([]);
        return;
      }

      const res = await fetch(`${API_URL}/escrow/admin`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        let msg = "Không thể tải danh sách escrow";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      const data: EscrowDto[] = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Không thể tải danh sách escrow");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // =================== HELPERS ===================

  const formatDateTime = (value: string | null) => {
    if (!value) return "—";
    try {
      return format(new Date(value), "HH:mm dd/MM/yyyy", { locale: vi });
    } catch {
      return value;
    }
  };

  const formatMoney = (amount: number) =>
    amount.toLocaleString("vi-VN") + " VND";

  const statusBadge = (status: EscrowStatus) => {
    switch (status) {
      case "HOLDING":
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            Đang giam tiền
          </span>
        );
      case "RELEASED":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
            Đã giải ngân
          </span>
        );
      case "REFUNDED":
        return (
          <span className="inline-flex items-center rounded-full bg-sky-500/15 px-3 py-1 text-xs font-semibold text-sky-300">
            Đã hoàn tiền
          </span>
        );
      case "DISPUTED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
            Khiếu nại
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center rounded-full bg-slate-500/20 px-3 py-1 text-xs font-semibold text-slate-300">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-slate-500/20 px-3 py-1 text-xs font-semibold text-slate-200">
            {status}
          </span>
        );
    }
  };

  const canOperate = (e: EscrowDto) => e.status === "HOLDING";

  // =================== MODAL ===================

  const openModal = (type: ModalType, escrow: EscrowDto) => {
    setSelected(escrow);
    setModalType(type);
    setNote("");
    setExtraDays(1);
  };

  const closeModal = () => {
    if (submitting) return;
    setModalType(null);
    setSelected(null);
    setNote("");
    setExtraDays(1);
  };

  const handleSubmit = async () => {
    if (!selected || !modalType) return;

    const token = getAdminToken();
    if (!token) {
      toast.error("Bạn chưa đăng nhập admin.");
      return;
    }

    try {
      setSubmitting(true);

      let url = `${API_URL}/escrow/${selected.escrow_id}/release`;
      const body: any = { note };

      if (modalType === "refund") {
        url = `${API_URL}/escrow/${selected.escrow_id}/refund`;
      }

      if (modalType === "extend") {
        url = `${API_URL}/escrow/${selected.escrow_id}/extend`;
        body.extraDays = extraDays;
      }

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        let msg = "Thao tác escrow không thành công";
        try {
          const data = await res.json();
          if (data?.message) msg = data.message;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      if (modalType === "release") {
        toast.success("Giải ngân cho seller thành công");
      } else if (modalType === "refund") {
        toast.success("Hoàn tiền cho buyer thành công");
      } else {
        toast.success("Gia hạn thời gian giam thành công");
      }

      closeModal();
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Thao tác escrow không thành công");
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle =
    modalType === "release"
      ? "Giải ngân cho seller"
      : modalType === "refund"
      ? "Hoàn tiền cho buyer"
      : modalType === "extend"
      ? "Gia hạn thời gian giam"
      : "";

  const modalDescription =
    modalType === "release"
      ? "Chuyển toàn bộ số tiền đang giam cho seller. Sau khi giải ngân sẽ không thể hoàn tiền lại cho buyer."
      : modalType === "refund"
      ? "Hoàn toàn bộ số tiền đang giam về ví của buyer. Sau khi hoàn tiền sẽ không thể giải ngân cho seller."
      : modalType === "extend"
      ? "Gia hạn thêm thời gian giam tiền. Trong thời gian này admin vẫn có thể giải ngân hoặc hoàn tiền."
      : "";

  // =================== RENDER ===================

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">
          Tiền đang giam (Escrow)
        </h2>
        <p className="mt-1 text-sm text-slate-300">
          Admin giám sát tiền trung gian giữa buyer và seller, có thể giải
          ngân hoặc hoàn tiền, gia hạn thời gian giam.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-slate-400">Đang tải danh sách escrow...</p>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-sm text-slate-300">
          Chưa có escrow nào.
        </div>
      )}

      <div className="space-y-4">
        {items.map((e) => (
          <div
            key={e.escrow_id}
            className="flex flex-col gap-4 rounded-xl border border-slate-800 bg-slate-900/70 p-4 shadow-lg shadow-slate-950/40 md:flex-row md:items-center md:justify-between"
          >
            {/* Left */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold uppercase tracking-wide text-emerald-300">
                  {e.dataset?.title || "Dataset"}
                </p>
                {statusBadge(e.status)}
              </div>

              <p className="text-xs text-slate-300">
                Buyer:{" "}
                <span className="font-medium">
                  {e.buyer.full_name || "Ẩn danh"}
                </span>{" "}
                <span className="text-slate-400">({e.buyer.email})</span>
              </p>
              <p className="text-xs text-slate-300">
                Seller:{" "}
                <span className="font-medium">
                  {e.seller.full_name || "Seller"}
                </span>{" "}
                <span className="text-slate-400">({e.seller.email})</span>
              </p>

              <p className="text-xs text-slate-400">
                Tạo lúc: {formatDateTime(e.created_at)} • Giải ngân dự kiến:{" "}
                {formatDateTime(e.release_at)}
              </p>

              {e.released_at && (
                <p className="text-xs text-slate-400">
                  Đã thực hiện lúc: {formatDateTime(e.released_at)}
                </p>
              )}

              <p className="text-[11px] text-slate-500">
                Mã escrow: {e.escrow_id} • Mã đơn: {e.order_id}
              </p>
            </div>

            {/* Right */}
            <div className="flex flex-col items-end gap-3 md:min-w-[260px]">
              <p className="text-right text-lg font-semibold text-emerald-300">
                {formatMoney(e.amount)}
              </p>

              <div className="flex flex-wrap justify-end gap-2">
                <button
                  onClick={() => openModal("release", e)}
                  disabled={!canOperate(e)}
                  className="rounded-full bg-emerald-500/80 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600/60 disabled:text-slate-300"
                >
                  Giải ngân
                </button>

                <button
                  onClick={() => openModal("refund", e)}
                  disabled={!canOperate(e)}
                  className="rounded-full bg-sky-500/80 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-600/60 disabled:text-slate-300"
                >
                  Hoàn tiền buyer
                </button>

                <button
                  onClick={() => openModal("extend", e)}
                  disabled={!canOperate(e)}
                  className="rounded-full bg-amber-500/80 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-amber-400 disabled:cursor-not-allowed disabled:bg-slate-600/60 disabled:text-slate-300"
                >
                  Gia hạn giam
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalType && selected && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">{modalTitle}</h3>
            <p className="mt-1 text-xs text-slate-300">{modalDescription}</p>

            <div className="mt-4 space-y-2 rounded-xl bg-slate-900/80 p-3 text-xs text-slate-300">
              <p className="font-medium text-emerald-300">
                {selected.dataset?.title || "Dataset"}
              </p>
              <p>
                Số tiền:{" "}
                <span className="font-semibold text-emerald-300">
                  {formatMoney(selected.amount)}
                </span>
              </p>
              <p>
                Buyer:{" "}
                <span className="font-semibold">
                  {selected.buyer.full_name || "Ẩn danh"}
                </span>{" "}
                ({selected.buyer.email})
              </p>
              <p>
                Seller:{" "}
                <span className="font-semibold">
                  {selected.seller.full_name || "Seller"}
                </span>{" "}
                ({selected.seller.email})
              </p>
            </div>

            {modalType === "extend" && (
              <div className="mt-4 space-y-1">
                <label className="text-xs font-medium text-slate-200">
                  Số ngày muốn gia hạn thêm
                </label>
                <input
                  type="number"
                  min={1}
                  value={extraDays}
                  onChange={(e) =>
                    setExtraDays(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-24 rounded-lg border border-slate-700 bg-slate-950 px-2 py-1 text-sm text-slate-100 outline-none focus:border-emerald-400"
                />
                <p className="text-[11px] text-slate-400">
                  Hệ thống sẽ cộng thêm số ngày này vào ngày giải ngân dự kiến
                  hiện tại.
                </p>
              </div>
            )}

            <div className="mt-4 space-y-1">
              <label className="text-xs font-medium text-slate-200">
                Ghi chú (tuỳ chọn, sẽ lưu vào log)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-400"
                placeholder="Ví dụ: Người mua xác nhận đã nhận được dataset..."
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={submitting}
                className="rounded-full border border-slate-600 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="rounded-full bg-emerald-500 px-5 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
