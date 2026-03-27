// app/api/chat/route.ts — Chat + check URL (VirusTotal) + cảnh báo file theo đuôi
import { NextResponse } from "next/server";

/* ========= CONFIG ========= */
const API_KEY = process.env.OPENROUTER_API_KEY as string;
const APP_DOMAIN = process.env.APP_DOMAIN || "http://localhost:3000";
const APP_TITLE = process.env.APP_TITLE || "OpenDataMarket Chat";
const VT_API_KEY = process.env.VIRUSTOTAL_API_KEY as string | undefined;

if (!API_KEY) {
  throw new Error(
    "Missing OPENROUTER_API_KEY. Thêm OPENROUTER_API_KEY vào fe/.env.local."
  );
}
/* ========================== */

/* ========= UTILS ========= */
function normalizeVN(str: string) {
  return (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
/* ========================= */

/* ========= LOCAL FAQ (free) ========= */
const KNOWLEDGE = [
  {
    keywords: [
      "ten du an",
      "du an ten gi",
      "ten cai san",
      "san nay ten gi",
      "ten web",
      "project name",
      "ten app",
      "opendatamarket",
    ],
    answer:
      "Tên dự án là OpenDataMarket – sàn giao dịch dataset mở, kết nối người mua và người bán dữ liệu.",
  },
  {
    keywords: ["dataset la gi", "dataset", "du lieu", "data la gi"],
    answer:
      "Dataset là tập dữ liệu được tổ chức (CSV, Excel, JSON, v.v.) dùng cho phân tích, báo cáo hoặc huấn luyện mô hình AI.",
  },
  {
    keywords: ["gia", "mua dataset", "thanh toan", "mua nhu the nao"],
    answer:
      "Bạn có thể mua dataset bằng VNĐ hoặc chuyển khoản. Chọn dataset → thanh toán → tải về file dữ liệu ngay trong tài khoản.",
  },
  {
    keywords: ["tai khoan", "dang nhap", "dang ky", "ho so"],
    answer:
      "Tài khoản giúp bạn quản lý dataset đã mua/bán, lưu lịch sử giao dịch và cập nhật phiên bản dataset mới.",
  },
];

function scoreForKeyword(msgTokens: string[], key: string) {
  const keyTokens = normalizeVN(key)
    .split(" ")
    .filter((w) => w.length >= 4);
  if (!keyTokens.length) return 0;
  const msg = msgTokens.join(" ");
  if (msg.includes(keyTokens.join(" "))) return 10;
  let s = 0;
  for (const t of keyTokens) if (msgTokens.includes(t)) s += 2;
  return s;
}
function searchLocalAnswer(text: string) {
  const msgNorm = normalizeVN(text);
  const msgTokens = msgNorm.split(" ").filter(Boolean);
  let best = { score: 0, answer: null as string | null };
  for (const item of KNOWLEDGE) {
    let maxK = 0;
    for (const k of item.keywords)
      maxK = Math.max(maxK, scoreForKeyword(msgTokens, k));
    if (maxK > best.score) best = { score: maxK, answer: item.answer };
  }
  return best.score >= 3 ? best.answer : null;
}
/* ==================================== */

/* ========= TIME & WEATHER ========= */
function getVNTime() {
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());
}
function getDayPeriod() {
  const hour = parseInt(
    new Intl.DateTimeFormat("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
    10
  );
  if (hour >= 5 && hour < 11) return "buổi sáng";
  if (hour >= 11 && hour < 14) return "buổi trưa";
  if (hour >= 14 && hour < 18) return "buổi chiều";
  if (hour >= 18 && hour <= 23) return "buổi tối";
  return "ban đêm";
}

const CITY_ALIAS = new Map<string, string>([
  ["hcm", "Ho Chi Minh"],
  ["tphcm", "Ho Chi Minh"],
  ["sai gon", "Ho Chi Minh"],
  ["ho chi minh", "Ho Chi Minh"],
  ["ha noi", "Ha Noi"],
  ["hn", "Ha Noi"],
  ["hanoi", "Ha Noi"],
  ["da nang", "Da Nang"],
  ["danang", "Da Nang"],
  ["can tho", "Can Tho"],
  ["nha trang", "Nha Trang"],
  ["da lat", "Da Lat"],
  ["hai phong", "Hai Phong"],
  ["vung tau", "Vung Tau"],
  ["quy nhon", "Quy Nhon"],
  ["hue", "Hue"],
]);
function extractCityFromNL(text: string) {
  const norm = normalizeVN(text);
  for (const [k, v] of CITY_ALIAS.entries())
    if (norm.includes(k)) return v;
  const m = norm.match(
    /\b(?:o|tai)\s+([a-z\s\-]{2,})(?=\s|$)/i
  );
  if (m && m[1]) return m[1].trim();
  return null;
}
async function getWeather(cityText: string) {
  try {
    const cityQuery =
      extractCityFromNL(cityText) || cityText || "Ho Chi Minh";
    const alias =
      CITY_ALIAS.get(normalizeVN(cityQuery)) || cityQuery;

    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
        alias
      )}&count=1&language=vi`,
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
/* ==================================== */

/* ========= URL CHECK (VirusTotal) ========= */
function extractFirstUrl(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : null;
}

type SimpleUrlRisk = "safe" | "suspicious" | "dangerous" | "unknown";

async function checkUrlWithVirusTotal(
  url: string
): Promise<{ level: SimpleUrlRisk; note: string }> {
  if (!VT_API_KEY) {
    return {
      level: "unknown",
      note:
        "ℹ️ Hệ thống chưa cấu hình VIRUSTOTAL_API_KEY nên chỉ cảnh báo link ở mức cơ bản.",
    };
  }

  try {
    const scanRes = await fetch("https://www.virustotal.com/api/v3/urls", {
      method: "POST",
      headers: {
        "x-apikey": VT_API_KEY,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `url=${encodeURIComponent(url)}`,
    });

    const scanJson = (await scanRes.json()) as any;
    const analysisId = scanJson?.data?.id;
    if (!analysisId) {
      return {
        level: "unknown",
        note: "ℹ️ Không lấy được mã phân tích từ VirusTotal cho link này.",
      };
    }

    const reportRes = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      { headers: { "x-apikey": VT_API_KEY } }
    );
    const reportJson = (await reportRes.json()) as any;
    const stats =
      reportJson?.data?.attributes?.stats ||
      reportJson?.data?.attributes?.last_analysis_stats;

    if (!stats) {
      return {
        level: "unknown",
        note:
          "ℹ️ VirusTotal không trả về thống kê rõ ràng, bạn nên cẩn thận khi bấm link này.",
      };
    }

    const malicious = stats.malicious ?? 0;
    const suspicious = stats.suspicious ?? 0;

    if (malicious > 0) {
      return {
        level: "dangerous",
        note: `⚠ VirusTotal: **${malicious} engine** đánh dấu URL này là *malicious*. Tuyệt đối không nên bấm vào link này hoặc nhập mật khẩu / thông tin ngân hàng.`,
      };
    }

    if (suspicious > 0) {
      return {
        level: "suspicious",
        note: `⚠ VirusTotal: có **${suspicious} engine** đánh dấu URL này là *suspicious*. Chỉ mở nếu bạn thật sự tin tưởng nguồn gửi.`,
      };
    }

    return {
      level: "safe",
      note:
        "✅ VirusTotal: chưa engine nào đánh dấu URL này là nguy hiểm. Tuy nhiên bạn vẫn nên cẩn thận khi đăng nhập hoặc chia sẻ dữ liệu.",
    };
  } catch (e) {
    console.error("VirusTotal URL check error:", e);
    return {
      level: "unknown",
      note:
        "ℹ️ Lỗi khi gọi VirusTotal, hiện chỉ cảnh báo được ở mức cơ bản.",
    };
  }
}
/* =========================================== */

/* ========= FILE META (đuôi file) ========= */
type FileMeta = { name?: string; type?: string; size?: number };
type FileRisk = "safe" | "suspicious" | "dangerous" | "unknown";

function analyzeFileMeta(meta?: FileMeta) {
  if (!meta?.name) {
    return {
      level: "unknown" as FileRisk,
      reply:
        "Mình không nhận được thông tin file nên chưa thể đánh giá mức độ an toàn. Bạn thử chọn lại file giúp mình nhé.",
    };
  }

  const name = meta.name;
  const size = meta.size ?? 0;
  const type = meta.type || "unknown";

  const lowerName = name.toLowerCase();
  const dotIndex = lowerName.lastIndexOf(".");
  const ext = dotIndex >= 0 ? lowerName.slice(dotIndex + 1) : "";

  const highRisk = [
    "exe",
    "bat",
    "cmd",
    "vbs",
    "js",
    "jse",
    "wsf",
    "ps1",
    "psm1",
    "scr",
    "pif",
    "com",
    "cpl",
    "dll",
    "sys",
    "drv",
    "apk",
    "jar",
    "gadget",
    "hta",
    "reg",
  ];
  const mediumRisk = [
    "docm",
    "xlsm",
    "pptm",
    "xlsb",
    "doc",
    "xls",
    "ppt",
    "rtf",
    "chm",
    "iso",
    "img",
    "vhd",
    "vhdx",
    "zip",
    "rar",
    "7z",
    "gz",
    "tgz",
    "tar",
    "bz2",
  ];
  const dataExt = [
    "csv",
    "tsv",
    "xlsx",
    "xls",
    "json",
    "txt",
    "xml",
    "parquet",
    "avro",
    "orc",
  ];

  let level: FileRisk = "unknown";
  let reason = "";

  if (highRisk.includes(ext)) {
    level = "dangerous";
    reason =
      "Đây là file thực thi hoặc script (.exe, .bat, .vbs, .js, .dll, .apk...). Những file này có thể chạy mã trực tiếp trên máy của bạn.";
  } else if (mediumRisk.includes(ext)) {
    level = "suspicious";
    reason =
      "Đây là file tài liệu hoặc đóng gói (Office cũ/Office có macro, ISO, ZIP, RAR...) – thường được dùng để ẩn mã độc bên trong.";
  } else if (dataExt.includes(ext)) {
    level = "safe";
    reason =
      "Đây là dạng file dữ liệu (CSV, Excel, JSON, TXT...) phù hợp để làm dataset trên OpenDataMarket.";
  } else {
    level = "unknown";
    reason =
      "Đuôi file này không thuộc nhóm dữ liệu phổ biến trên sàn và cũng không phải dạng thực thi điển hình.";
  }

  const sizeLine =
    size > 0
      ? `Kích thước file khoảng **${size} bytes**.`
      : "Không xác định được kích thước file.";

  const header = `Bạn muốn kiểm tra file: **${name}** (kiểu: \`${type}\`, kích thước: ${size} bytes).`;

  let riskLine = "";
  if (level === "dangerous") {
    riskLine =
      "🔴 **Mức độ: NGUY HIỂM (không nên mở)**.\n" +
      "- Không nên chạy file này trực tiếp trên máy dùng cho công việc/thông tin cá nhân.\n" +
      "- Nếu đây không phải file bạn tự tạo hoặc tải từ nguồn thực sự tin cậy, hãy xóa file hoặc chỉ phân tích trong môi trường ảo.\n";
  } else if (level === "suspicious") {
    riskLine =
      "🟠 **Mức độ: NGHI VẤN**.\n" +
      "- Bạn nên quét thêm bằng VirusTotal hoặc phần mềm diệt virus trước khi mở.\n" +
      "- Khi làm dataset, nên ưu tiên các định dạng dữ liệu thuần (.csv, .xlsx, .json) thay vì file nén/tài liệu có macro.\n";
  } else if (level === "safe") {
    riskLine =
      "🟢 **Mức độ: TƯƠNG ĐỐI AN TOÀN VỀ ĐỊNH DẠNG**.\n" +
      "- Đây là loại file dữ liệu phổ biến khi giao dịch dataset trên OpenDataMarket.\n" +
      "- Tuy nhiên, bạn vẫn nên kiểm tra nội dung file và nguồn gửi trước khi sử dụng cho phân tích thật.\n";
  } else {
    riskLine =
      "⚪ **Mức độ: KHÔNG RÕ**.\n" +
      "- Hệ thống không phân loại rõ được đuôi file này. Bạn nên kiểm tra kỹ nguồn gửi và có thể quét thêm bằng công cụ bảo mật nếu thấy nghi ngờ.\n";
  }

  const reply =
    `${header}\n\n${sizeLine}\n\n` +
    `📁 **Phân tích theo đuôi file (.${ext || "không xác định"})**:\n` +
    `${reason}\n\n` +
    `${riskLine}` +
    "Nếu đây là dataset dùng trên OpenDataMarket, bạn nên ưu tiên các file dữ liệu thuần (.csv, .xlsx, .json, .txt) và hạn chế tải lên/tải về các file thực thi hoặc tài liệu có macro.";

  return { level, reply };
}
/* ==================================== */

/* ========= LLM ========= */
async function callLLM(history: any[], message: string) {
  const resp = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": APP_DOMAIN,
        "X-Title": APP_TITLE,
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "Bạn là trợ lý thân thiện của sàn OpenDataMarket. CHỈ trả lời các câu hỏi liên quan tới: dataset, dữ liệu, tài khoản người mua/người bán, đơn hàng, thanh toán, bảo mật link/file trong phạm vi sàn. Nếu câu hỏi ngoài lề (đời sống, game, phim, chuyện cá nhân...), hãy trả lời ngắn gọn rằng: 'Rất tiếc, trợ lý này chỉ hỗ trợ câu hỏi liên quan tới sàn OpenDataMarket.'",
          },
          ...history,
          { role: "user", content: message },
        ],
      }),
      cache: "no-store",
    }
  );
  const data = await resp.json();
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "Mình chưa hiểu ý bạn 😅 bạn nói lại giúp mình nha."
  );
}
/* ======================= */

/* ========= GIỚI HẠN CHỦ ĐỀ ========= */
const ON_TOPIC_KEYWORDS = [
  "dataset",
  "du lieu",
  "data",
  "san giao dich",
  "opendatamarket",
  "nguoi ban",
  "seller",
  "buyer",
  "nguoi mua",
  "tai khoan",
  "dang nhap",
  "dang ky",
  "ho so",
  "don hang",
  "order",
  "gia",
  "thanh toan",
  "tag",
  "category",
  "cccd",
  "xac minh",
  "kiem duyet",
  "bao mat",
  "link",
  "url",
  "file",
  "virus",
  "scam",
  "lua dao",
];

function isOnTopic(norm: string) {
  if (
    norm.includes("may gio") ||
    norm.includes("gio hien tai") ||
    norm.includes("gio la bao nhieu") ||
    norm.includes("thoi tiet")
  ) {
    return true;
  }
  for (const k of ON_TOPIC_KEYWORDS) if (norm.includes(k)) return true;
  return false;
}
/* ==================================== */

/* ========= HANDLER ========= */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { message, history = [], fileMeta } = body as {
      message: string;
      history?: any[];
      fileMeta?: FileMeta | null;
    };

    const msg = String(message || "").trim();
    const low = normalizeVN(msg);

    // 1) Nếu FE gửi kèm fileMeta → chỉ phân tích đuôi file, không gọi LLM
    if (fileMeta) {
      const { level, reply } = analyzeFileMeta(fileMeta);
      return NextResponse.json({
        reply,
        securityNote: null,
        fileRiskLevel: level,
      });
    }

    // 2) Check URL (VirusTotal)
    let securityNote: string | null = null;
    const url = extractFirstUrl(msg);
    if (url) {
      const vtResult = await checkUrlWithVirusTotal(url);
      securityNote = vtResult.note;
    }

    const makeResponse = (reply: string) =>
      NextResponse.json({ reply, securityNote });

    // 3) Chào
    if (["hi", "hello", "chao", "xin chao"].includes(low)) {
      return makeResponse(
        "Chào bạn 👋 Mình là trợ lý của sàn OpenDataMarket. Bạn muốn hỏi về dataset, tài khoản hay thanh toán?"
      );
    }

    // 4) Giờ
    if (
      low.includes("may gio") ||
      low.includes("gio la bao nhieu") ||
      low.includes("gio la may") ||
      low.includes("gio hien tai")
    ) {
      return makeResponse(
        `⏰ Bây giờ ở Việt Nam là ${getVNTime()} (${getDayPeriod()}).`
      );
    }

    // 5) Thời tiết
    if (low.includes("thoi tiet") || low.includes("mua ngoai troi")) {
      const reply = await getWeather(msg);
      return makeResponse(reply);
    }

    // 6) Nếu câu hỏi ngoài phạm vi sàn → từ chối
    if (!isOnTopic(low)) {
      const reply =
        "Rất tiếc, trợ lý này **chỉ hỗ trợ các câu hỏi liên quan tới sàn OpenDataMarket** (dataset, tài khoản, đơn hàng, thanh toán, bảo mật link/file...). Bạn vui lòng đặt câu hỏi liên quan tới sàn giúp mình nhé.";
      return makeResponse(reply);
    }

    // 7) Local FAQ
    const local = searchLocalAnswer(msg);
    if (local) return makeResponse(local);

    // 8) Gọi AI
    const ai = await callLLM(history, msg);
    return makeResponse(ai);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        reply: "Có lỗi khi xử lý yêu cầu. Thử lại giúp mình nha!",
        securityNote: null,
      },
      { status: 500 }
    );
  }
}
/* ============================== */
