"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

type EscrowStatus = "HOLDING" | "RELEASED" | "DISPUTED" | "REFUNDED" | "CANCELLED";

type EscrowDto = {
  escrow_id: string;
  amount: number;
  status: EscrowStatus;
  release_at: string;          // ISO string từ BE
  created_at: string;          // ISO string từ BE
  released_at: string | null;
  buyer?: {
    email: string | null;
  } | null;
  order?: {
    order_id: string;
    dataset?: {
      title: string;
    } | null;
  } | null;
};

export default function SellerEscrowPage() {
  const [items, setItems] = useState<EscrowDto[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchData() {
    try {
      setLoading(true);
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Bạn chưa đăng nhập");
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/escrow/seller`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => null))?.message || "Không thể tải danh sách escrow";
        throw new Error(msg);
      }

      const data = (await res.json()) as EscrowDto[] | { data: EscrowDto[] };

      const list = Array.isArray(data) ? data : Array.isArray((data as any).data) ? (data as any).data : [];
      setItems(list);
    } catch (err: any) {
      console.error("Error fetch escrow seller:", err);
      toast.error(err?.message || "Không thể tải danh sách escrow");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const getStatusColor = (status: EscrowStatus) => {
    switch (status) {
      case "HOLDING":
        return "text-yellow-400";
      case "RELEASED":
        return "text-emerald-400";
      case "REFUNDED":
        return "text-sky-400";
      case "DISPUTED":
        return "text-red-400";
      case "CANCELLED":
        return "text-slate-400";
      default:
        return "text-slate-400";
    }
  };

  const getStatusText = (status: EscrowStatus) => {
    switch (status) {
      case "HOLDING":
        return "Đang giam tiền";
      case "RELEASED":
        return "Đã giải ngân cho bạn";
      case "REFUNDED":
        return "Đã hoàn tiền cho buyer";
      case "DISPUTED":
        return "Đang tranh chấp";
      case "CANCELLED":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "---";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "---";
    try {
      return format(d, "HH:mm dd/MM/yyyy", { locale: vi });
    } catch {
      return value;
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-semibold">Tiền đang giam (Escrow)</h2>
        <p className="text-sm text-slate-400">
          Xem các đơn hàng đang được sàn giữ tiền hộ.
        </p>

        {loading && <p className="text-slate-400 mt-4">Đang tải...</p>}

        {!loading && (!Array.isArray(items) || items.length === 0) && (
          <div className="mt-4 px-4 py-3 bg-slate-900/60 border border-slate-700 rounded-lg text-sm text-slate-400">
            Chưa có escrow nào.
          </div>
        )}

        {Array.isArray(items) && items.length > 0 && (
          <div className="mt-4 space-y-3">
            {items.map((e) => {
              const datasetTitle = e.order?.dataset?.title || "Dataset không tên";
              const buyerEmail = e.buyer?.email || "Không rõ";
              const statusColor = getStatusColor(e.status);
              const statusText = getStatusText(e.status);

              // Nếu không có order_id thì fallback sang escrow_id cho đỡ trống
              const orderCode =
                e.order?.order_id?.substring(0, 8) || e.escrow_id.substring(0, 8);

              return (
                <div
                  key={e.escrow_id}
                  className="bg-slate-900/70 border border-slate-800 rounded-xl px-4 py-3 flex items-center justify-between gap-4"
                >
                  {/* Trái: thông tin dataset & buyer */}
                  <div className="flex-1">
                    <p className="text-xs text-slate-400 mb-1">
                      Dataset
                    </p>
                    <p className="text-white font-medium">
                      {e.dataset?.title || "Dataset"}
                    </p>

                    <div className="mt-1 text-xs text-slate-400 space-y-0.5">
                      <p>Buyer: {buyerEmail}</p>
                      <p>
                        {/* vẫn ghi là “Mã đơn”, nhưng thực tế có thể là mã escrow nếu order_id không có */}
                        Mã đơn:{" "}
                        <span className="text-slate-200 font-mono">
                          {orderCode}
                        </span>
                      </p>
                    </div>

                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400">
                      <p>
                        <span className="text-slate-500">Tạo lúc: </span>
                        <span className="text-slate-200">
                          {formatDate(e.created_at)}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Giải ngân dự kiến: </span>
                        <span className="text-slate-200">
                          {formatDate(e.release_at)}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Trạng thái: </span>
                        <span className={statusColor}>{statusText}</span>
                      </p>
                    </div>

                    {e.released_at && (
                      <p className="mt-1 text-xs text-slate-400">
                        <span className="text-slate-500">Đã giải ngân lúc: </span>
                        <span className="text-slate-200">
                          {formatDate(e.released_at)}
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Phải: số tiền */}
                  <div className="text-right min-w-[140px]">
                    <p className="text-xs text-slate-400 mb-1">Số tiền</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {e.amount.toLocaleString("vi-VN")} VND
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
