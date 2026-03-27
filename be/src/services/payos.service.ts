import { PrismaClient } from "@prisma/client";
import { PayOS } from "@payos/node";

const prisma = new PrismaClient();

const payOS = new PayOS({
  clientId: process.env.PAYOS_CLIENT_ID!,
  apiKey: process.env.PAYOS_API_KEY!,
  checksumKey: process.env.PAYOS_CHECKSUM_KEY!,
});

export async function createPayOSLink(amount: number, userId: string) {
  try {
    console.log("=== [PAYOS][CREATE LINK] START ===");
    console.log("[PAYOS][INPUT]", { amount, userId });

    const orderCode = Number(String(Date.now()).slice(-6));
    console.log("[PAYOS][ORDER CODE GENERATED]", orderCode);

    // Lấy ví user
    const wallet = await prisma.wallet.findUnique({
      where: { user_id: userId },
    });

    console.log("[PAYOS][WALLET FOUND]", wallet);

    if (!wallet) {
      console.log("[PAYOS][ERROR] WALLET NOT FOUND");
      throw new Error("Wallet not found for user");
    }

    // Tạo transaction PENDING
    const tx = await prisma.walletTransaction.create({
      data: {
        wallet_id: wallet.wallet_id,
        amount,
        type: "DEPOSIT",
        status: "PENDING",
        payos_order_code: String(orderCode),
        description: "Tạo lệnh nạp tiền ",
      },
    });

    console.log("[PAYOS][TX CREATED]", tx);

    // Tạo link thanh toán
    const body = {
      orderCode,
      amount,
      description: "Nạp tiền vào ví ODM",
      cancelUrl: "http://localhost:3000/wallet",
      returnUrl: "http://localhost:3000/wallet",
    };

    console.log("[PAYOS][REQUEST BODY]", body);

    const response = await payOS.paymentRequests.create(body);

    console.log("[PAYOS][PAYOS RESPONSE]", response);
    console.log("=== [PAYOS][CREATE LINK] DONE ===");

    return response;

  } catch (err) {
    console.error("[PAYOS][CREATE LINK ERROR]", err);
    throw err;
  }
}
