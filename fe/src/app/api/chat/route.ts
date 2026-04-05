// app/api/chat/route.ts — All-in-one, không cần .env
import { NextResponse } from "next/server";

/* =================== CONFIG (hardcode) =================== */
const API_KEY = "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"; // <-- THAY KEY CỦA BẠN
const APP_DOMAIN = "http://localhost:3000";                 // dùng làm HTTP-Referer
const APP_TITLE = "OpenDataMarket Chat";
/* ======================================================== */

// ===== Utils =====
function normalizeVN(str: string) {
    return (str || "")
        .toLowerCase()
        .normalize("NFD").replace(/\p{Diacritic}/gu, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

// ===== Knowledge (local, không tốn AI) =====
const KNOWLEDGE = [
    {
        keywords: [
            "ten du an", "du an ten gi", "ten cai san", "san nay ten gi",
            "ten web", "project name", "ten app"
        ],
        answer: "Tên dự án là OpenDataMarket – sàn giao dịch dataset mở."
    },
    {
        keywords: ["dataset la gi", "dataset", "du lieu"],
        answer: "Dataset là tập hợp dữ liệu được tổ chức để phục vụ xử lý, phân tích hoặc huấn luyện mô hình."
    },
    {
        keywords: ["gia", "mua dataset", "thanh toan", "mua nhu the nao"],
        answer: "Bạn có thể mua dataset bằng VNĐ hoặc chuyển khoản. Chọn dataset → thanh toán → tải về ngay."
    },
    {
        keywords: ["tai khoan", "dang nhap", "dang ky"],
        answer: "Tài khoản giúp bạn lưu lịch sử mua dataset, tải lại và nhận cập nhật miễn phí."
    }
];

function scoreForKeyword(msgTokens: string[], key: string) {
    const keyTokens = normalizeVN(key).split(" ").filter(w => w.length >= 4);
    if (!keyTokens.length) return 0;
    const msg = msgTokens.join(" ");
    if (msg.includes(keyTokens.join(" "))) return 10; // trúng cụm
    let s = 0;
    for (const t of keyTokens) if (msgTokens.includes(t)) s += 2; // trúng từ dài
    return s;
}
function searchLocalAnswer(text: string) {
    const msgNorm = normalizeVN(text);
    const msgTokens = msgNorm.split(" ").filter(Boolean);
    let best = { score: 0, answer: null as string | null };
    for (const item of KNOWLEDGE) {
        let maxK = 0;
        for (const k of item.keywords) maxK = Math.max(maxK, scoreForKeyword(msgTokens, k));
        if (maxK > best.score) best = { score: maxK, answer: item.answer };
    }
    return best.score >= 3 ? best.answer : null;
}

// ===== Time & period =====
function getVNTime() {
    return new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh",
        hour: "2-digit", minute: "2-digit", second: "2-digit"
    }).format(new Date());
}
function getDayPeriod() {
    const hour = parseInt(new Intl.DateTimeFormat("vi-VN", {
        timeZone: "Asia/Ho_Chi_Minh", hour: "numeric", hour12: false
    }).format(new Date()), 10);
    if (hour >= 5 && hour < 11) return "buổi sáng";
    if (hour >= 11 && hour < 14) return "buổi trưa";
    if (hour >= 14 && hour < 18) return "buổi chiều";
    if (hour >= 18 && hour <= 23) return "buổi tối";
    return "ban đêm";
}

// ===== Weather (Open-Meteo, free) =====
const CITY_ALIAS = new Map<string, string>([
    ["hcm", "Ho Chi Minh"], ["tphcm", "Ho Chi Minh"], ["sai gon", "Ho Chi Minh"], ["ho chi minh", "Ho Chi Minh"],
    ["ha noi", "Ha Noi"], ["hn", "Ha Noi"], ["hanoi", "Ha Noi"],
    ["da nang", "Da Nang"], ["danang", "Da Nang"],
    ["can tho", "Can Tho"], ["nha trang", "Nha Trang"],
    ["da lat", "Da Lat"], ["hai phong", "Hai Phong"],
    ["vung tau", "Vung Tau"], ["quy nhon", "Quy Nhon"], ["hue", "Hue"],
]);
function extractCityFromNL(text: string) {
    const norm = normalizeVN(text);
    for (const [k, v] of CITY_ALIAS.entries()) if (norm.includes(k)) return v;
    const m = norm.match(/\b(?:o|tai)\s+([a-z\s\-]{2,})(?=\s|$)/i);
    if (m && m[1]) return m[1].trim();
    return null;
}
async function getWeather(cityText: string) {
    try {
        const cityQuery = extractCityFromNL(cityText) || cityText || "Ho Chi Minh";
        const alias = CITY_ALIAS.get(normalizeVN(cityQuery)) || cityQuery;

        const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(alias)}&count=1&language=vi`,
            { cache: "no-store" }
        );
        const geo = (await geoRes.json())?.results?.[0];
        if (!geo) return "Không tìm thấy địa điểm 😢";

        const wRes = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${geo.latitude}&longitude=${geo.longitude}` +
            `&current=temperature_2m,precipitation_probability&timezone=Asia%2FHo_Chi_Minh`,
            { cache: "no-store" }
        );
        const data = await wRes.json();
        const temp = data?.current?.temperature_2m;
        const rain = data?.current?.precipitation_probability;
        return `🌤 Hiện tại ở ${geo.name}: ${temp}°C, mưa: ${rain}%`;
    } catch {
        return "Mình chưa lấy được thời tiết 🙏 để lát thử lại nha.";
    }
}

// ===== Gọi LLM (server gọi, FE không biết OpenRouter) =====
async function callLLM(history: any[], message: string) {
    const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": APP_DOMAIN, // lộ domain của bạn thôi
            "X-Title": APP_TITLE,
        },
        body: JSON.stringify({
            model: "deepseek/deepseek-chat",
            temperature: 0.4,
            messages: [
                { role: "system", content: "Bạn là trợ lý thân thiện của OpenDataMarket, xưng 'Mình - Bạn', trả lời tự nhiên, ngắn gọn." },
                ...history,
                { role: "user", content: message },
            ],
        }),
        cache: "no-store",
    });
    const data = await resp.json();
    return data?.choices?.[0]?.message?.content?.trim()
        || "Mình chưa hiểu ý bạn 😅 bạn nói lại giúp mình nha.";
}

// ===== API handler =====
export async function POST(req: Request) {
    try {
        const { message, history = [] } = await req.json();
        const msg = String(message || "").trim();
        const low = normalizeVN(msg);

        // 1) chào
        if (["hi", "hello", "chao", "xin chao"].includes(low)) {
            return NextResponse.json({ reply: "Chào bạn 👋 Mình đây! Bạn muốn hỏi về dataset, giá hay cách mua không?" });
        }
        // 2) giờ
        if (low.includes("may gio") || low.includes("gio la bao nhieu") || low.includes("gio la may") || low.includes("gio hien tai")) {
            return NextResponse.json({ reply: `⏰ Bây giờ ở Việt Nam là ${getVNTime()} (${getDayPeriod()}).` });
        }
        // 3) thời tiết
        if (low.includes("thoi tiet") || low.includes("mua")) {
            const reply = await getWeather(msg);
            return NextResponse.json({ reply });
        }
        // 4) knowledge local
        const local = searchLocalAnswer(msg);
        if (local) return NextResponse.json({ reply: local });
        // 5) AI
        const ai = await callLLM(history, msg);
        return NextResponse.json({ reply: ai });
    } catch {
        return NextResponse.json({ reply: "Có lỗi khi xử lý yêu cầu. Thử lại giúp mình nha!" }, { status: 500 });
    }
}
