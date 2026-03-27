"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useDatasetById } from "@/hooks/dataset/useDataset";
import { useCreateOrder } from "@/hooks/order/useOrder";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { generateBankRef } from "@/lib/generateBankRef";
import { PaymentMethod } from "@/types";
import { toast } from "sonner";

export default function PaymentConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const datasetId = searchParams.get("dataset_id") as string;

  const { data: dataset, isLoading, isError } = useDatasetById(datasetId);

  // token
  const [token, setToken] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("accessToken");
    if (stored) setToken(stored);
  }, []);

  const createOrder = useCreateOrder(token);

  if (isLoading)
    return <p className="text-center mt-10 text-white">Đang tải dữ liệu...</p>;
  if (isError || !dataset)
    return <p className="text-center mt-10 text-red-400">Không tìm thấy dataset.</p>;

  const currentDataset = dataset;

  const amount = currentDataset.price_vnd || 0;

  // click confirm
  const handleConfirm = async () => {
    if (!token) {
      toast.error("Bạn cần đăng nhập để tiếp tục");
      router.push("/login");
      return;
    }

    try {
      const bankRef = generateBankRef();

      await createOrder.mutateAsync({
        dataset_id: currentDataset.dataset_id,
        payment_method: PaymentMethod.VND,
        total_amount: amount,
        bank_ref: bankRef,
      });

      toast.success("Xác nhận thành công, đang chuyển sang bước thanh toán...");
      router.push(
        `/dataset/payment-confirmation/waiting?ref=${bankRef}`
      );
    } catch (err: any) {
      console.log(err);
      toast.error("Lỗi tạo đơn hàng, vui lòng thử lại");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-16 min-h-screen flex items-center justify-center px-4">
      <Card className="shadow-2xl rounded-2xl overflow-hidden bg-gray-800/90 border border-gray-700 backdrop-blur-md w-full">

        {/* Header */}
        <CardHeader className="border-b border-gray-700/50 p-6 text-center bg-gray-900/50">
          <CardTitle className="text-3xl font-extrabold text-white tracking-wide">
            THÔNG BÁO QUAN TRỌNG
          </CardTitle>
          <p className="text-gray-400 text-sm mt-2">
            Vui lòng đọc kỹ trước khi tiếp tục thanh toán.
          </p>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-6 p-8 text-gray-300 leading-relaxed">

          <h2 className="text-xl text-white font-semibold">1. Điều khoản mua dataset</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn đồng ý rằng dataset là sản phẩm số, KHÔNG hoàn tiền sau khi mua.</li>
            <li>Hệ thống sẽ ghi nhận giao dịch và người bán sẽ chịu trách nhiệm hỗ trợ.</li>
            <li>Vui lòng kiểm tra kỹ tên dataset, giá tiền, thông tin người bán trước khi thanh toán.</li>
            <li>Trường hợp lừa đảo, bạn có thể gửi khiếu nại để admin xử lý.</li>
          </ul>

          <h2 className="text-xl text-white font-semibold pt-4">2. Lưu ý khi thanh toán</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sau khi bạn nhấn “XÁC NHẬN”, hệ thống sẽ tạo đơn hàng.</li>
            <li>Bạn sẽ được chuyển sang trang hiển thị hướng dẫn thanh toán chi tiết và mã giao dịch.</li>
            <li>Bạn phải chuyển khoản đúng số tiền và đúng nội dung hệ thống cung cấp.</li>
          </ul>

          <h2 className="text-xl text-white font-semibold pt-4">Dataset bạn đang mua</h2>
          <div className="bg-gray-900/40 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
            <div>
              <p className="font-bold text-white">{currentDataset.title}</p>
              <p className="text-sm text-gray-400">
                ID: {currentDataset.dataset_id}
              </p>
            </div>
            <p className="text-2xl font-bold text-yellow-300">
              {amount.toLocaleString("vi-VN")} VNĐ
            </p>
          </div>

          <div className="pt-6">
            <Button
              onClick={handleConfirm}
              disabled={createOrder.isPending}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white font-bold text-lg transition-all duration-300 shadow-xl"
            >
              {createOrder.isPending ? "Đang xử lý..." : "TÔI ĐỒNG Ý & TIẾP TỤC THANH TOÁN"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
