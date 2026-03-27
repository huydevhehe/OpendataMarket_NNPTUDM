"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Complaint {
  id: string;
  order_id: string;
  seller_id: string;
  buyer_id: string;
  reason: string;
  phone: string;
  seller_action?: "COMPENSATED" | "REQUEST_REFUND" | null;
  buyer?: { full_name: string };
  created_at: string;
}

export default function SellerComplaintPage() {
  const [token, setToken] = useState("");
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Lấy token
  useEffect(() => {
    const t = localStorage.getItem("accessToken");
    if (t) setToken(t);
  }, []);

  // Load complaint
  useEffect(() => {
    if (!token) return;

    const fetchComplaints = async () => {
      try {
        const res = await axios.get("http://localhost:3001/api/complaints/seller", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setComplaints(res.data as Complaint[]);
      } catch (err) {
        console.error("Lỗi khi tải khiếu nại:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [token]);

  // Seller xử lý
  const handleSellerAction = async (id: string, action: "COMPENSATED" | "REQUEST_REFUND") => {
    try {
      await axios.patch(
        `http://localhost:3001/api/complaints/${id}/seller`,
        { action },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // update UI
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, seller_action: action } : c))
      );

      Swal.fire({
        icon: "success",
        title: "Cập nhật thành công!",
        text: action === "COMPENSATED" ? "Bạn đã chọn: Đã đền bù" : "Bạn đã chọn: Hoàn tiền",
        confirmButtonColor: "#3085d6",
      });
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể cập nhật trạng thái.",
      });
    }
  };

  if (loading)
    return <p className="text-center text-gray-400 mt-10">Đang tải khiếu nại...</p>;

  if (complaints.length === 0)
    return <p className="text-center text-gray-400 mt-10">Không có khiếu nại nào.</p>;

  return (
    <div className="space-y-4 mt-4">
      <h1 className="text-2xl font-bold text-cyan-400">📛 Khiếu nại</h1>

      {complaints.map((c) => (
        <Card key={c.id} className="bg-gray-900/60 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              Khiếu nại đơn hàng:{" "}
              <span className="text-cyan-300 font-mono">{c.order_id}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="text-gray-300 space-y-2">
            <p>📄 <span className="font-semibold">Lý do:</span> {c.reason}</p>
            <p>📱 <span className="font-semibold">Số điện thoại Buyer:</span> {c.phone}</p>
            <p>👤 <span className="font-semibold">Tên người mua :</span> {c.buyer?.full_name || "Không rõ"}</p>


            {/* NEW: Trạng thái */}
            <p className="mt-2 text-sm">
              <span className="font-semibold text-gray-300">Trạng thái: </span>
              {c.seller_action === null || !c.seller_action ? (
                <span className="text-yellow-300">Chờ xử lý</span>
              ) : c.seller_action === "COMPENSATED" ? (
                <span className="text-green-400">Đã Xử Lý</span>
              ) : (
                <span className="text-red-400">Yêu cầu hoàn tiền</span>
              )}
            </p>

            <p className="text-yellow-400 text-sm mt-3">
              Nếu bạn không xử lý trong 24H, admin sẽ tự động duyệt hoàn tiền cho buyer.
              vui lòng liên hệ buyer để thỏa thuận trước khi xử lý.
            </p>

            {/* Nếu chưa xử lý thì hiện 2 nút */}
            {!c.seller_action && (
              <div className="flex gap-3 pt-3">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleSellerAction(c.id, "COMPENSATED")}
                >
                  Đã Xử Lý
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => handleSellerAction(c.id, "REQUEST_REFUND")}
                >
                  Hoàn tiền
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
