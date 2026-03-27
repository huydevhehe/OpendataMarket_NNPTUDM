"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "buyer" | "seller" | "admin";

type WalletItem = {
  wallet_id: string;
  user_id: string;
  balance: number;
  pending_balance: number;
  created_at: string;
  updated_at: string;
  user: {
    user_id: string;
    full_name: string | null;
    email: string | null;
    role: Role;
  };
};

type AdjustMode = "add" | "sub";

export default function WalletAdminFeature() {
  const [items, setItems] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // state cho popup
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletItem | null>(null);
  const [adjustMode, setAdjustMode] = useState<AdjustMode>("add");
  const [amountInput, setAmountInput] = useState<string>("0");
  const [note, setNote] = useState<string>("");

  const apiBase = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("accessToken"));
    }
  }, []);

  const fetchWallets = async () => {
    if (!token) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/wallet`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Không thể tải danh sách ví");
      }

      const data = (await res.json()) as WalletItem[];
      setItems(data);
    } catch (err: any) {
      toast.error(err.message || "Lỗi tải danh sách ví");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchWallets();
  }, [token]);

  // mở popup
  const openAdjustDialog = (wallet: WalletItem, mode: AdjustMode) => {
    setSelectedWallet(wallet);
    setAdjustMode(mode);
    setAmountInput("0");
    setNote("");
    setDialogOpen(true);
  };

  // preview số dư sau khi cộng / trừ
  const previewBalance = useMemo(() => {
    if (!selectedWallet) return 0;
    const raw = Number(amountInput.replace(/[^0-9.-]/g, ""));
    if (!raw || raw <= 0) return selectedWallet.balance;

    const delta = adjustMode === "add" ? raw : -raw;
    return selectedWallet.balance + delta;
  }, [selectedWallet, adjustMode, amountInput]);

  const handleConfirmAdjust = async () => {
    if (!token || !selectedWallet) return;

    const raw = Number(amountInput.replace(/[^0-9.-]/g, ""));
    if (!raw || raw <= 0) {
      toast.error("Số tiền phải > 0");
      return;
    }

    const amountDelta = adjustMode === "add" ? raw : -raw;

    setActionId(selectedWallet.wallet_id);

    try {
      const res = await fetch(`${apiBase}/wallet/admin/adjust`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          user_id: selectedWallet.user_id,
          amountDelta,
          reason: note || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Lỗi điều chỉnh số dư");
      }

      const updated = (await res.json()) as WalletItem;

      toast.success(
        `${
          adjustMode === "add" ? "Đã cộng" : "Đã trừ"
        } ${raw.toLocaleString()} VND. Số dư mới: ${updated.balance.toLocaleString()} VND.`,
      );

      setDialogOpen(false);
      setSelectedWallet(null);
      setAmountInput("0");
      setNote("");
      setActionId(null);

      // reload danh sách để đồng bộ
      fetchWallets();
    } catch (err: any) {
      toast.error(err.message || "Lỗi điều chỉnh số dư");
      setActionId(null);
    }
  };

  const roleColor: Record<Role, string> = {
    buyer: "bg-sky-600",
    seller: "bg-emerald-600",
    admin: "bg-purple-600",
  };

  return (
    <>
      {/* HEADER + LIST */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold">Quản lý ví người dùng</h1>
            <p className="text-sm text-muted-foreground">
              Xem số dư ví và điều chỉnh thủ công (cộng / trừ tiền) cho từng
              tài khoản.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchWallets}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              "Tải lại"
            )}
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <Card className="p-6 text-center text-sm text-muted-foreground">
            Chưa có ví nào trong hệ thống.
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((w) => (
              <Card
                key={w.wallet_id}
                className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:shadow-lg transition-shadow"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {w.user.full_name || "Không rõ tên"}
                    </span>
                    <Badge className={roleColor[w.user.role]}>
                      {w.user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {w.user.email} •{" "}
                    <span className="font-mono">{w.user.user_id}</span>
                  </p>
                  <p className="text-sm">
                    Số dư khả dụng:{" "}
                    <span className="font-semibold">
                      {w.balance.toLocaleString()} VND
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tiền đang treo:{" "}
                    <span className="font-semibold">
                      {w.pending_balance.toLocaleString()} VND
                    </span>
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openAdjustDialog(w, "add")}
                    disabled={actionId === w.wallet_id}
                  >
                    Cộng tiền
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openAdjustDialog(w, "sub")}
                    disabled={actionId === w.wallet_id}
                  >
                    Trừ tiền
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* POPUP ĐIỀU CHỈNH SỐ DƯ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {adjustMode === "add" ? "Cộng tiền ví" : "Trừ tiền ví"}
            </DialogTitle>
            <DialogDescription>
              {selectedWallet
                ? `Tài khoản: ${
                    selectedWallet.user.full_name ||
                    selectedWallet.user.email ||
                    selectedWallet.user.user_id
                  }`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedWallet && (
            <div className="space-y-4">
              <div className="text-sm">
                <p>
                  Số dư hiện tại:{" "}
                  <span className="font-semibold">
                    {selectedWallet.balance.toLocaleString()} VND
                  </span>
                </p>
                <p className="text-xs text-muted-foreground">
                  Tiền đang treo:{" "}
                  {selectedWallet.pending_balance.toLocaleString()} VND
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Số tiền cần {adjustMode === "add" ? "cộng" : "trừ"} (VND)
                </Label>
                <Input
                  id="amount"
                  type="number"
                  min={0}
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  placeholder="Nhập số tiền..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú (tuỳ chọn)</Label>
                <Input
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: cộng tiền khuyến mãi, trừ do hoàn tiền..."
                />
              </div>

              <div className="text-xs text-muted-foreground">
                Dự kiến số dư sau khi{" "}
                {adjustMode === "add" ? "cộng" : "trừ"}:{" "}
                <span className="font-semibold text-white">
                  {previewBalance.toLocaleString()} VND
                </span>
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              type="button"
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAdjust}
              disabled={!selectedWallet || actionId === selectedWallet?.wallet_id}
            >
              {actionId === selectedWallet?.wallet_id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : adjustMode === "add" ? (
                "Xác nhận cộng tiền"
              ) : (
                "Xác nhận trừ tiền"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
