import { PrismaClient } from "@prisma/client";
import { UserPayload } from "../middleware/VerifyToken";

const prisma = new PrismaClient();

// Lấy tất cả transaction
export const getAll = async () => {
  return await prisma.transaction.findMany();
};

// Lấy transaction theo id (buyer chỉ được xem txn của mình, seller xem txn liên quan đến dataset mình bán, admin xem tất cả)
export const getById = async (id: string, user: UserPayload) => {
  const txn = await prisma.transaction.findUnique({
    where: { transaction_id: id },
    include: {
      order: {
        include: { dataset: true },
      },
    },
  });

  if (!txn) throw new Error("Transaction not found");

  if (user.role === "buyer" && txn.order.buyer_id !== user.user_id) {
    throw new Error("Not allowed");
  }

  if (user.role === "seller" && txn.order.dataset.seller_id !== user.user_id) {
    throw new Error("Not allowed");
  }

  return txn;
};

// Tạo transaction (buyer)
export const create = async (data: any) => {
  // gắn buyer_id gián tiếp qua order
  const order = await prisma.order.findUnique({
    where: { order_id: data.order_id },
  });

  if (!order) throw new Error("Order not found");
  // if (order.buyer_id !== buyerId) throw new Error("Not allowed");

  return await prisma.transaction.create({ data });
};

// Cập nhật transaction (seller xác nhận, admin toàn quyền)
export const update = async (id: string, data: any, user: UserPayload) => {
  const txn = await prisma.transaction.findUnique({
    where: { transaction_id: id },
    include: { order: { include: { dataset: true } } },
  });

  if (!txn) throw new Error("Transaction not found");

  if (user.role === "seller" && txn.order.dataset.seller_id !== user.user_id) {
    throw new Error("Not allowed");
  }

  return await prisma.transaction.update({
    where: { transaction_id: id },
    data,
  });
};

// Xóa transaction (admin)
export const remove = async (id: string) => {
  return await prisma.transaction.delete({
    where: { transaction_id: id },
  });
};
