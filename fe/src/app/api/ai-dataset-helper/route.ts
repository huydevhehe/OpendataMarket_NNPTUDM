// fe/src/app/api/ai-dataset-helper/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.OPENROUTER_API_KEY;
const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const APP_TITLE = "OpenDataMarket AI Dataset Helper";

type InputDataset = {
  dataset_id: string;
  name?: string;
  description?: string | null;
  tags?: string[] | null;
  // có thêm field gì cũng được, không ảnh hưởng
};

async function askAIWithMatchedDatasets(
  query: string,
  matched: InputDataset[]
): Promise<string> {
  // Nếu quên cấu hình KEY thì không gọi AI, trả câu mặc định
  if (!API_KEY) {
    return (
      "Mình đã tìm được một số dataset phù hợp với nhu cầu của bạn. " +
      "Tuy nhiên hệ thống AI chưa được cấu hình đầy đủ, bạn thử xem danh sách dataset bên dưới nhé."
    );
  }

  const listText = matched
    .map(
      (d, idx) =>
        `${idx + 1}. ${d.name ?? "Không tên"} - ${d.description ?? ""} ` +
        (Array.isArray(d.tags) && d.tags.length
          ? `Tags: ${d.tags.join(", ")}`
          : "")
    )
    .join("\n");

  const resp = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": APP_DOMAIN,
      "X-Title": APP_TITLE,
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-chat", // hoặc model khác bạn thích
      temperature: 0.4,
      messages: [
        {
          role: "system",
          content:
            "Bạn là trợ lý gợi ý dataset cho sàn OpenDataMarket. " +
            "Người dùng đã nhập một nhu cầu tìm dataset. Hệ thống đã chọn sẵn một vài dataset phù hợp dưới đây. " +
            "Nhiệm vụ của bạn: trả lời BẰNG TIẾNG VIỆT, tối đa 1–2 câu, không quá 40 từ. " +
            "Giọng thân thiện, xưng 'Mình'. " +
            "Hãy: 1) công nhận nhu cầu của người dùng, 2) nói ngắn gọn là các dataset bên dưới khá phù hợp, " +
            "3) mời người dùng mô tả thêm nếu cần dataset chi tiết hơn.\n\n" +
            "DANH SÁCH DATASET PHÙ HỢP:\n" +
            listText,
        },
        {
          role: "user",
          content:
            "Nhu cầu của mình là: " +
            query +
            ". Hãy gợi ý ngắn cho mình dựa trên các dataset trên.",
        },
      ],
    }),
  });

  if (!resp.ok) {
    throw new Error("OpenRouter error");
  }

  const data = await resp.json();
  return (
    data?.choices?.[0]?.message?.content?.trim() ||
    "Mình đã tìm được một số dataset có vẻ phù hợp, bạn xem danh sách bên dưới nhé."
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));

    const rawQuery = String(body?.query ?? "").trim();
    const inputDatasets: InputDataset[] = Array.isArray(body?.datasets)
      ? body.datasets
      : [];

    if (!rawQuery) {
      return NextResponse.json(
        {
          reply:
            "Bạn hãy mô tả bài toán hoặc loại dataset bạn cần, ví dụ: 'AI nhận diện trái cây từ ảnh'.",
          datasets: [],
        },
        { status: 200 }
      );
    }

    // Nếu FE chưa gửi datasets lên thì coi như không có data để tìm
    if (!inputDatasets.length) {
      return NextResponse.json(
        {
          reply:
            "Rất tiếc, hiện mình không nhận được danh sách dataset để tìm kiếm. Bạn thử tải lại trang hoặc liên hệ admin nhé.",
          datasets: [],
        },
        { status: 200 }
      );
    }

    // ===== MATCH DATASET DỰA TRÊN TEXT =====
    const q = rawQuery.toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);

    const matched = inputDatasets.filter((d) => {
      const haystack =
        (
          (d.name ?? "") +
          " " +
          (d.description ?? "") +
          " " +
          (Array.isArray(d.tags) ? d.tags.join(" ") : "")
        )
          .toString()
          .toLowerCase();

      // match nếu chứa full query hoặc chứa ít nhất 1 từ (dài > 2 ký tự)
      return (
        haystack.includes(q) ||
        words.some((w) => w.length > 2 && haystack.includes(w))
      );
    });

    // ===== KHÔNG CÓ DATASET PHÙ HỢP =====
    if (matched.length === 0) {
      return NextResponse.json(
        {
          reply:
            "Rất tiếc, dataset đúng nhu cầu của bạn hiện chưa có trong hệ thống. " +
            "Mình có thể gợi ý các loại dataset khác gần giống, nếu cần bạn hãy mô tả thêm giúp mình nhé.",
          datasets: [],
        },
        { status: 200 }
      );
    }

    // ===== CÓ DATASET PHÙ HỢP -> HỎI AI VIẾT CÂU GỢI Ý =====
    const aiReply = await askAIWithMatchedDatasets(rawQuery, matched);

    return NextResponse.json(
      {
        reply: aiReply,
        datasets: matched,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("ai-dataset-helper error:", err);

    return NextResponse.json(
      {
        reply:
          "Có lỗi xảy ra khi mình xử lý yêu cầu này. Bạn thử lại sau giúp mình nhé.",
        datasets: [],
      },
      { status: 500 }
    );
  }
}
