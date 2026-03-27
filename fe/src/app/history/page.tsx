"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Background from "@/components/background";
import Footer from "@/components/footer";
import Navbar from "@/components/navBar";
import {
  ShoppingCart,
  CheckCircle2,
  Clock3,
  Download,
  CreditCard,
  CalendarDays,
  Hash,
} from "lucide-react";
import Swal from "sweetalert2";

type OrderStatus = "pending" | "completed" | "cancelled" | string;

interface Dataset {
  title?: string | null;
  file_url?: string | null;
  dataset_id?: string | null;
}

interface OrderItem {
  order_id: string;
  total_amount: number;
  payment_method: string;
  status: OrderStatus;
  created_at: string;
  dataset?: Dataset;
  seller_id?: string;
    // thêm dòng này
  complaint?: {
    status: string;
    seller_action?: string | null;
  } | null;
}

export default function HistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================
  // STATE KHIẾU NẠI
  // ==========================
  const [openComplaint, setOpenComplaint] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [reason, setReason] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        if (!token) {
          setError("Bạn cần đăng nhập để xem lịch sử giao dịch.");
          setLoading(false);
          return;
        }

        const res = await axios.get("http://localhost:3001/order", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = res.data as any;
        const data: OrderItem[] = Array.isArray(responseData) ? responseData : (responseData?.data || []);
        setOrders(data);
      } catch (err) {
        console.error("FETCH ORDERS ERROR:", err);
        setError("Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Gửi khiếu nại
  const handleSendComplaint = async () => {
    if (!selectedOrder) return;

    if (!reason || !phone) {
      alert("Vui lòng nhập đầy đủ lý do và số điện thoại.");
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
console.log("ORDER SELECTED:", selectedOrder);
console.log("SELECTED ORDER:", selectedOrder);
console.log("SELLER ID FE:", (selectedOrder as any).dataset.seller_id);

      const res = await axios.post(
        "http://localhost:3001/api/complaints",
        {
          order_id: selectedOrder.order_id,
          seller_id: (selectedOrder as any).dataset.seller_id,



          reason,
          phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
  title: "Gửi khiếu nại thành công!",
  text: "Seller và admin sẽ xem xét khiếu nại của bạn.",
  icon: "success",
  confirmButtonText: "OK"
});

      setOpenComplaint(false);
      setReason("");
      setPhone("");
    } catch (err: any) {
      console.error(err);
      Swal.fire({
  title: "Lỗi!",
  text: "Gửi khiếu nại thất bại, bạn đã khiếu nại đơn này rồi .",
  icon: "error",
  confirmButtonText: "Đóng"
});

    }
  };

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VND";

  const formatDateTime = (iso: string) =>
    iso ? new Date(iso).toLocaleString("vi-VN") : "";

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden">
      <Background />
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto pt-28 pb-20 px-4">
        <div className="flex items-center gap-3 mb-8">
          <ShoppingCart className="w-7 h-7 text-teal-300" />
          <h1 className="text-3xl md:text-4xl font-bold text-teal-300">
            Lịch sử giao dịch
          </h1>
        </div>

        {loading && (
          <div className="text-center text-gray-300 py-8">
            Đang tải dữ liệu...
          </div>
        )}

        {!loading && error && (
          <div className="text-center text-red-400 py-8">{error}</div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center text-gray-300 py-8">
            Bạn chưa có giao dịch nào.
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.order_id}
              className="rounded-2xl bg-slate-900/70 border border-teal-500/25 p-5 md:p-6 shadow-lg shadow-teal-500/20"
            >
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-teal-400/80">
                    Dataset
                  </p>
                  <h2 className="mt-1 text-lg font-semibold text-teal-200">
                    {order.dataset?.title || "Dataset không tên"}
                  </h2>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold
                     ${
                    order.status === "completed"
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : order.status === "cancelled"
                      ? "bg-red-500/20 text-red-300 border border-red-500/40"
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8 text-sm text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-yellow-500/15 text-yellow-300">
                    💰
                  </span>
                  <span>
                    <span className="font-medium">Tổng tiền:</span>{" "}
                    {formatMoney(order.total_amount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-sky-300" />
                  <span>
                    <span className="font-medium">Ngày đặt:</span>{" "}
                    {formatDateTime(order.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-purple-300" />
                  <span>
                    <span className="font-medium">Thanh toán:</span>{" "}
                    {order.payment_method}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-pink-300" />
                  <span>
                    <span className="font-medium">Mã đơn hàng:</span>{" "}
                    {order.order_id}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
{/* Trạng thái khiếu nại */}
{order.complaint && (
  <span className="inline-flex items-center gap-2 text-red-300 text-sm mb-2">
    ⚠
    {order.complaint.status === "PENDING" &&
      "Trạng thái: Buyer đã gửi khiếu nại – chờ seller xử lý"}

    {order.complaint.status === "SELLER_COMPENSATED" &&
      "Trạng thái: Seller đã đền bù – nếu bạn không có ý kiến trong 24H tiền sẽ tự động duyệt cho seller "}

    {order.complaint.status === "SELLER_REFUND" &&
      "Trạng thái: Seller chấp nhận hoàn tiền – chờ admin duyệt"}

    {order.complaint.status === "ADMIN_REFUNDED" &&
      "Trạng thái: Admin đã duyệt hoàn tiền"}

    {order.complaint.status === "ADMIN_CLOSED" &&
      "Trạng thái: Admin đã đóng đơn khiếu nại "}
  </span>
)}

                {/* Trạng thái */}
                {order.status === "completed" ? (
                  <span className="inline-flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    Thanh toán thành công!
                  </span>
                ) : order.status === "cancelled" ? (
                  <span className="inline-flex items-center gap-2 text-red-300 text-sm">
                    <Clock3 className="w-4 h-4" />
                    Đơn hàng đã bị hủy.
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-amber-300 text-sm">
                    <Clock3 className="w-4 h-4" />
                    Đơn hàng đang xử lý...
                  </span>
                )}

                <div className="flex items-center gap-3">

                 {/* Nút tải dataset */}
{order.status === "completed" && order.dataset?.file_url && (
  <a
    href={`http://localhost:3001${order.dataset.file_url.startsWith("/")
      ? order.dataset.file_url
      : "/" + order.dataset.file_url}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-white text-sm font-semibold shadow-md shadow-sky-500/30 transition-colors"
  >
    <Download className="w-4 h-4" />
    Tải dataset
  </a>
)}


                  {/* Nút đánh giá dataset */}
                  {order.status === "completed" &&
                    order.dataset &&
                    order.dataset.dataset_id && (
                      <button
                        onClick={() =>
                          router.push(
                            `/dataset/${order.dataset!.dataset_id}?review=1&order_id=${order.order_id}`
                          )
                        }
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-semibold shadow-md shadow-yellow-500/30 transition-colors"
                      >
                        ⭐ Đánh giá dataset
                      </button>
                    )}

                  {/* =======================
                      Nút KHIẾU NẠI
                  ======================== */}
                  <button
                    onClick={() => {
                      setSelectedOrder(order);
                      setOpenComplaint(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold shadow-md shadow-red-500/30 transition-colors"
                  >
                    ⚠ Khiếu nại
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {/* ===========================
            POPUP KHIẾU NẠI
      ============================ */}
      {openComplaint && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[420px] text-black">

            <h2 className="text-xl font-bold mb-4 text-red-600">
              Gửi khiếu nại đơn hàng
            </h2>

            <p className="text-sm text-gray-600 mb-2">
              Đơn hàng: {selectedOrder?.order_id}
            </p>

            <div className="mb-3">
              <label className="font-medium">Lý do khiếu nại</label>
              <textarea
                className="w-full border rounded p-2 mt-1"
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="font-medium">Số điện thoại</label>
              <input
                className="w-full border rounded p-2 mt-1"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setOpenComplaint(false)}
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-200 text-black"
              >
                Hủy
              </button>

              <button
                onClick={handleSendComplaint}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white"
              >
                Gửi khiếu nại
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
