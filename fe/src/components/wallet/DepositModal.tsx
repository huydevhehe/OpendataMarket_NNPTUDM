"use client";// file auto napạp tie
import { useState } from "react";
import axios from "@/lib/axios";
import { toast } from "sonner";

export default function DepositModal({ open, onClose }) {
  const [amount, setAmount] = useState("");

  const handleCreate = async () => {
    try {
      const res = await axios.post("/momo/create", { amount: Number(amount) });

      toast.success("Tạo yêu cầu nạp thành công!");

      window.location.href = `/wallet/deposit?id=${res.data.deposit.id}&qr=${encodeURIComponent(res.data.qr)}`;
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Lỗi!");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-slate-800 p-6 rounded-lg w-80 text-white">
        <h3 className="text-lg font-semibold">Nạp tiền vào ví</h3>
        <input
          type="number"
          className="mt-3 w-full p-2 rounded bg-slate-700"
          placeholder="Nhập số tiền..."
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 rounded">Hủy</button>
          <button onClick={handleCreate} className="px-4 py-2 bg-green-600 rounded">Tạo QR</button>
        </div>
      </div>
    </div>
  );
}
