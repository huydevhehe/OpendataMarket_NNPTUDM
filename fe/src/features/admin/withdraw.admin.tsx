"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

type WithdrawStatus = "PENDING" | "APPROVED" | "REJECTED";

type WithdrawRequest = {
  withdraw_id: string;
  user_id: string;
  amount: number;
  status: WithdrawStatus;
  created_at: string;
  processed_at: string | null;
  note: string | null;
  user?: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    role: string;
  };
  admin?: {
    user_id: string;
    full_name: string | null;
    email: string | null;
  };
};

export default function WithdrawAdminFeature() {
  const [items, setItems] = useState<WithdrawRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const fetchData = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/withdraw/admin`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không thể tải danh sách rút tiền");
      }

      const data = (await res.json()) as WithdrawRequest[];
      setItems(data);
    } catch (error: any) {
      toast.error(error.message || "Lỗi tải dữ liệu rút tiền");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  const postAction = async (path: string, body: any) => {
    if (!token) return;
    const res = await fetch(`${apiBase}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Lỗi thao tác rút tiền");
    }
    return res.json().catch(() => ({}));
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    try {
      await postAction("/withdraw/admin/approve", { withdraw_id: id });
      toast.success("Đã duyệt rút tiền");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Lỗi duyệt rút tiền");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    const note = prompt("Lý do từ chối (có thể bỏ trống):") || undefined;
    setActionId(id);
    try {
      await postAction("/withdraw/admin/reject", { withdraw_id: id, note });
      toast.success("Đã từ chối yêu cầu rút");
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Lỗi từ chối rút tiền");
    } finally {
      setActionId(null);
    }
  };

  const statusStyle: Record<WithdrawStatus, string> = {
    PENDING: "bg-amber-500",
    APPROVED: "bg-emerald-600",
    REJECTED: "bg-rose-600",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Quản lý rút tiền</h1>
          <p className="text-sm text-muted-foreground">
            Admin duyệt hoặc từ chối các yêu cầu rút tiền của seller.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Tải lại"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-6 text-center text-sm text-muted-foreground">
          Chưa có yêu cầu rút tiền nào.
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((w) => (
            <Card
              key={w.withdraw_id}
              className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-lg transition-shadow"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">
                    {w.user?.full_name || "Không rõ tên"}{" "}
                    <span className="text-xs text-muted-foreground">
                      ({w.user?.email || "Không có email"})
                    </span>
                  </span>
                  <Badge className={statusStyle[w.status]}>
                    {w.status}
                  </Badge>
                </div>
                <p className="text-sm">
                  Số tiền:{" "}
                  <span className="font-semibold">
                    {w.amount.toLocaleString()} VND
                  </span>
                </p>
                {w.note && (
                  <p className="text-xs text-muted-foreground">
                    Ghi chú: {w.note}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Tạo lúc: {new Date(w.created_at).toLocaleString("vi-VN")}
                </p>
                {w.processed_at && (
                  <p className="text-xs text-muted-foreground">
                    Xử lý lúc:{" "}
                    {new Date(w.processed_at).toLocaleString("vi-VN")}
                  </p>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                {w.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(w.withdraw_id)}
                      disabled={actionId === w.withdraw_id}
                    >
                      {actionId === w.withdraw_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Duyệt"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleReject(w.withdraw_id)}
                      disabled={actionId === w.withdraw_id}
                    >
                      {actionId === w.withdraw_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Từ chối"
                      )}
                    </Button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
