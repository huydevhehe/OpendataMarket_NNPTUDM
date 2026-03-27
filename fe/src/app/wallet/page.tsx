"use client";

import { useEffect, useState } from "react";
import axios from "axios";

import Background from "@/components/background";
import Footer from "@/components/footer";
import Navbar from "@/components/navBar";

import {
  Wallet2,
  ArrowUpRight,
  ArrowDownRight,
  Clock3,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type WalletTxStatus = "PENDING" | "COMPLETED" | "FAILED";

type WalletTxType =
  | "DEPOSIT"
  | "PURCHASE"
  | "ESCROW_HOLD"
  | "ESCROW_RELEASE"
  | "WITHDRAW_REQ"
  | "WITHDRAW_DONE"
  | "ADJUST";

interface Wallet {
  wallet_id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  created_at: string;
  updated_at: string;
}

interface WalletTransaction {
  wallet_tx_id: string;
  wallet_id: string;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  description?: string | null;
  ref_order_id?: string | null;
  payos_order_code?: string | null;
  bank_reference?: string | null;
  created_at: string;
}

interface WalletResponse {
  wallet: Wallet;
  transactions: WalletTransaction[];
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function WalletPage() {
  const [data, setData] = useState<WalletResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("50000");
  const [topupLoading, setTopupLoading] = useState(false);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setLoading(true);
        setError(null);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("accessToken")
            : null;

        if (!token) {
          setError("Bạn cần đăng nhập để xem ví.");
          setLoading(false);
          return;
        }

        const res = await axios.get<WalletResponse>(
          `${API_BASE}/wallet/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        setData(res.data);
      } catch (err) {
        console.error("FETCH WALLET ERROR:", err);
        setError("Không thể tải thông tin ví. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchWallet();
  }, []);

  const formatMoney = (v: number) =>
    v.toLocaleString("vi-VN", { maximumFractionDigits: 0 }) + " VND";

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("vi-VN", {
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  // ==========================
  //      PAYOS TOPUP
  // ==========================
    const handleTopup = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;

    if (!token) {
      toast.error("Bạn cần đăng nhập để nạp tiền.");
      return;
    }

    const value = Number(amount);
    if (!value || value < 1000) {
      toast.error("Số tiền tối thiểu là 1.000 VND");
      return;
    }

    try {
      setTopupLoading(true);

      // GỌI API BACKEND /payos/create
      const res = await axios.post(
        `${API_BASE}/payos/create`,
        { amount: value },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

     const checkoutUrl = res?.data?.data?.checkoutUrl;


      if (!checkoutUrl) {
        toast.error("Không tìm thấy link thanh toán Auto.");
        return;
      }

      toast.success("Đang chuyển đến trang nạp auto ...");
      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error("TOPUP ERROR:", err);
      const msg =
        err?.response?.data?.error ||
        "Không thể tạo link nạp tiền. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setTopupLoading(false);
    }
  };


  const getAmountColor = (tx: WalletTransaction) => {
    if (tx.amount > 0) return "text-emerald-400";
    if (tx.amount < 0) return "text-red-400";
    return "text-gray-300";
  };

  const getTypeLabel = (type: WalletTxType) => {
    switch (type) {
      case "DEPOSIT":
        return "Nạp ví";
      case "PURCHASE":
        return "Mua dataset";
      case "ESCROW_HOLD":
        return "Tiền giam (escrow)";
      case "ESCROW_RELEASE":
        return "Giải ngân cho seller";
      case "WITHDRAW_REQ":
        return "Yêu cầu rút tiền";
      case "WITHDRAW_DONE":
        return "Rút tiền thành công";
      case "ADJUST":
        return "Điều chỉnh bởi admin";
      default:
        return type;
    }
  };

  const getStatusBadge = (status: WalletTxStatus) => {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge className="bg-emerald-600/80 text-white flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Hoàn tất
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-amber-500/80 text-white flex items-center gap-1">
            <Clock3 className="w-3 h-3" />
            Đang xử lý
          </Badge>
        );
      case "FAILED":
        return (
          <Badge className="bg-red-600/80 text-white flex items-center gap-1">
            <XCircle className="w-3 h-3" />
            Thất bại
          </Badge>
        );
      default:
        return null;
    }
  };

  const transactions = data?.transactions || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white">
      <Background />
      <Navbar />

      <main className="relative z-10 max-w-5xl mx-auto px-4 pb-16 pt-28 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
            <Wallet2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold">Ví của tôi</h1>
            <p className="text-sm text-gray-200">
              Xem số dư ví, lịch sử biến động và Nạp tiền tự động .
            </p>
          </div>
        </div>

        {/* THÔNG TIN VÍ */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-slate-900/70 border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">Số dư ví</span>
              <Wallet2 className="w-4 h-4 text-purple-400" />
            </div>
            {loading ? (
              <div className="h-10 flex items-center">
                <span className="text-gray-200 text-sm">
                  Đang tải số dư...
                </span>
              </div>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : data ? (
              <>
                <p className="text-2xl font-bold text-white">
                  {formatMoney(data.wallet.balance)}
                </p>
                <p className="text-xs text-gray-200">
                  Tiền đang giam (escrow / chờ rút):{" "}
                  <span className="font-medium text-amber-400">
                    {formatMoney(data.wallet.pending_balance)}
                  </span>
                </p>
                <p className="text-[11px] text-gray-200 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Số dư khả dụng dùng để mua dataset hoặc rút về ngân hàng.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-200">
                Chưa có dữ liệu ví.
              </p>
            )}
          </Card>

          {/* FORM NẠP TIỀN */}
          <Card className="bg-slate-900/70 border-slate-800 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-200">
                Nạp tiền tự động vào ví  Auto duyệt 
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-300">
                Số tiền muốn nạp (VND)
              </label>
              <Input
                type="number"
                min={1000}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-950/60 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-purple-500"
              />

              <p className="text-[11px] text-gray-200">
                Số tiền tối thiểu: 1.000 VND. Hệ thống sẽ tự động duyệt tiền trong 60s.
              </p>
            </div>

            <Button
              className="w-full mt-1"
              onClick={handleTopup}
              disabled={topupLoading}
            >
              {topupLoading ? (
                <span className="flex items-center gap-2 text-sm">
                  <Clock3 className="w-4 h-4 animate-spin" />
                  Đang tạo link nạp tiền...
                </span>
              ) : (
                "Nạp tiền tự động"
              )}
            </Button>
          </Card>
        </div>

        {/* LỊCH SỬ VÍ */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lịch sử ví gần đây</h2>
            <span className="text-xs text-gray-500">
              Hiển thị tối đa 50 giao dịch gần nhất.
            </span>
          </div>

          {loading ? (
            <div className="py-10 text-center text-sm text-gray-200">
              Đang tải lịch sử ví...
            </div>
          ) : !data || transactions.length === 0 ? (
            <Card className="p-4 bg-slate-900/70 border-slate-800 text-sm text-gray-200">
              Chưa có giao dịch ví nào.
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <Card
                  key={tx.wallet_tx_id}
                  className="p-4 bg-slate-900/70 border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center">
                      {tx.amount >= 0 ? (
                        <ArrowDownRight className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {getTypeLabel(tx.type)}
                      </p>
                      <p className="text-xs text-slate-300">
                        {tx.description || "Không có mô tả"}
                      </p>
                      <p className="text-[11px] text-gray-500 flex items-center gap-1 mt-1">
                        <Clock3 className="w-3 h-3" />
                        {formatDateTime(tx.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span
                      className={
                        "text-sm font-semibold " + getAmountColor(tx)
                      }
                    >
                      {tx.amount > 0 ? "+" : ""}
                      {formatMoney(Math.abs(tx.amount))}
                    </span>
                    {getStatusBadge(tx.status)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
