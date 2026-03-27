// utils/generateBankRef.ts
export function generateBankRef(prefix = "PAY") {
    if (typeof window === "undefined") {
        // SSR: trả về chuỗi placeholder tạm
        return `${prefix}XXXXXX`;
    }

    // client: sinh thật
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestamp = Date.now().toString().slice(-4);
    return `${prefix}${timestamp}${random}`; // ví dụ: PAY5042QW9ZP3
}
