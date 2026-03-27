// fe/src/hooks/seller/useAdminSellerVerification.ts

"use client";

import { useEffect, useState, useCallback } from "react";
import {
  fetchAdminSellerRequests,
  approveSellerRequest,
  rejectSellerRequest,
  type SellerVerificationDto,
} from "@/services/sellerVerificationApi";

export function useAdminSellerVerification(
  token: string | null,
  enabled: boolean
) {
  const [items, setItems] = useState<SellerVerificationDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled || !token) return;

    setLoading(true);
    setError(null);

    try {
      const data = await fetchAdminSellerRequests(token);
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Không thể tải danh sách yêu cầu Seller.");
    } finally {
      setLoading(false);
    }
  }, [enabled, token]);

  useEffect(() => {
    load();
  }, [load]);

  // ✅ Admin duyệt
  const approve = async (id: string) => {
    if (!token) throw new Error("Missing token");
    await approveSellerRequest(id, token);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: "APPROVED" } : item
      )
    );
  };

  // ❌ Admin từ chối (kèm lý do)
  const reject = async (id: string, admin_note: string) => {
    if (!token) throw new Error("Missing token");
    await rejectSellerRequest(id, token, admin_note);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, status: "REJECTED", admin_note }
          : item
      )
    );
  };

  return {
    items,
    loading,
    error,
    approve,
    reject, // (id, reason)
    refetch: load,
  };
}
