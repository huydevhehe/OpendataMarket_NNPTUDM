"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string;
  order_id: string;
  buyer_id: string;
  seller_id: string;
  reason: string;
  phone: string;
  seller_action?: "COMPENSATED" | "REQUEST_REFUND" | null;
  status: "PENDING" | "SELLER_COMPENSATED" | "SELLER_REFUND" | "ADMIN_REFUNDED" | "ADMIN_CLOSED";
  buyer?: { full_name: string };
  seller?: { full_name: string };
  created_at: string;
}

export default function AdminComplaintPage() {
  const [token, setToken] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) setToken(t);
  }, []);

  useEffect(() => {
    if (!token) return;

    const load = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/complaints/admin", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setComplaints(res.data);
      } catch (err) {
        console.error("Lỗi load khiếu nại:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token]);

    // Admin duyệt hoàn tiền
const handleRefund = async (complaint: any) => {
  try {
    const escrowId = complaint?.order?.escrow?.escrow_id;
console.log("Complaint FE nhận:", complaint);
console.log("Escrow FE:", complaint?.order?.escrow);
console.log("Escrow ID FE:", escrowId);


    if (!escrowId) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không tìm thấy escrow_id",
      });
      return;
    }

    await axios.patch(
      `http://localhost:3001/api/complaints/${complaint.id}/admin/refund`,
     { escrow_id: complaint.order.escrow?.escrow_id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    Swal.fire({
      icon: "success",
      title: "Đã hoàn tiền buyer",
         }).then(() => {
      window.location.reload(); // 🔥 reload trang để mất nút
    });
  } catch (err) {
    Swal.fire({ icon: "error", title: "Lỗi!", text: "Không thể hoàn tiền." });
  }
};

  // Admin đóng khi seller đã đền bù
  const handleClose = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:3001/api/complaints/${id}/admin/close`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Đã đóng khiếu nại",
      });

      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "ADMIN_CLOSED" } : c))
      );
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "Lỗi!", text: "Không thể đóng khiếu nại." });
    }
  };

  if (loading) return <p className="text-center text-gray-400">Đang tải...</p>;
  if (complaints.length === 0) return <p className="text-center text-gray-400">Không có khiếu nại nào.</p>;

  return (
    <div className="space-y-4 mt-4">
      <h1 className="text-2xl font-bold text-red-400">📛 Quản lý khiếu nại</h1>

      {complaints.map((c) => (
        <Card key={c.id} className="bg-gray-900/60 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Khiếu nại đơn hàng: <span className="text-cyan-300">{c.order_id}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300 space-y-2">
            <p>📄 Lý do: {c.reason}</p>
            <p>👤 Buyer: <span className="text-cyan-300">{c.buyer?.full_name}</span></p>
<p>🏪 Seller: <span className="text-purple-300">{c.seller?.full_name}</span></p>

            <p>📱 SĐT Buyer: {c.phone}</p>

            <p className="mt-2 text-sm">
              <span className="font-semibold">Trạng thái: </span>
              {c.status === "PENDING" && <span className="text-yellow-300">Buyer đã gửi khiếu nại tới seller chờ seller phản hồi </span>}
              {c.status === "SELLER_COMPENSATED" && <span className="text-green-300">Seller: Đã đền bù</span>}
              {c.status === "SELLER_REFUND" && <span className="text-red-300">Seller: Yêu cầu hoàn tiền</span>}
              {c.status === "ADMIN_REFUNDED" && <span className="text-blue-300">Admin: Đã hoàn tiền</span>}
              {c.status === "ADMIN_CLOSED" && <span className="text-gray-300">Admin: Đã đóng khiếu nại</span>}
            </p>

            {/* Admin hành động */}
            {c.status === "SELLER_REFUND" && (
              <Button
                className="bg-red-600 hover:bg-red-700 mt-3"
                onClick={() => handleRefund(c)}

              >
                Duyệt hoàn tiền
              </Button>
            )}

            {c.status === "SELLER_COMPENSATED" && (
              <Button
                className="bg-green-600 hover:bg-green-700 mt-3"
                onClick={() => handleClose(c.id)}
              >
                Đóng khiếu nại
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
