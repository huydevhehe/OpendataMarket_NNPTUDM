// fe/src/services/sellerVerificationApi.ts

export type SellerStatus = "PENDING" | "APPROVED" | "REJECTED";

export type SellerVerificationDto = {
  id: string;
  user_id: string;
  full_name: string;
  phone_number: string | null;
  id_number: string;
  bank_name: string;
  bank_user_name: string;
  bank_account: string;
  shop_description: string | null;
  front_image_url: string;
  back_image_url: string;
  status: SellerStatus;
  admin_note?: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at?: string | null;

  // ✅ Kết quả AI từ backend (nullable)
  ai_score?: number | null;
  ai_analysis?: string | null;

  user?: {
    user_id: string;
    email: string;
    full_name: string | null;
  } | null;
};

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// ✅ Lấy list tất cả yêu cầu seller cho admin
export async function fetchAdminSellerRequests(
  token: string
): Promise<SellerVerificationDto[]> {
  const res = await fetch(`${API_BASE}/seller/verification/admin/all`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message || "Không thể lấy danh sách yêu cầu Seller."
    );
  }

  return data;
}

// ✅ Admin duyệt yêu cầu seller
export async function approveSellerRequest(id: string, token: string) {
  const res = await fetch(`${API_BASE}/seller/verification/${id}/approve`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Không thể duyệt yêu cầu Seller.");
  }

  return data;
}

// ✅ Admin từ chối yêu cầu seller (kèm lý do)
export async function rejectSellerRequest(
  id: string,
  token: string,
  admin_note: string
) {
  const res = await fetch(`${API_BASE}/seller/verification/${id}/reject`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ admin_note }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || "Không thể từ chối yêu cầu Seller.");
  }

  return data;
}
