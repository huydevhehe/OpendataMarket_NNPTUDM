"use client";
import { useEffect, useRef, useState } from "react";

type Tone = "normal" | "danger" | "warning" | "safe" | "note";

type Msg = { role: "user" | "assistant"; text: string; tone?: Tone };

const LS_HISTORY = "odm_chat_history_v1";
const LS_DRAFT = "odm_chat_draft_v1";

type FileMeta = { name: string; type: string; size: number };

export default function ChatWidget({ onClose }: { onClose?: () => void }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [atBottom, setAtBottom] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /* ===== Load history + draft ===== */
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LS_HISTORY);
      if (saved) {
        const parsed = JSON.parse(saved) as any[];
        const fixed: Msg[] = parsed.map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          text: m.text ?? "",
          tone: (m.tone as Tone) || "normal",
        }));
        setMessages(fixed);
      }

      const draft = localStorage.getItem(LS_DRAFT);
      if (draft) setInput(draft);
    } catch {
      // ignore
    }
  }, []);

  /* ===== Save history + auto scroll nếu đang ở cuối ===== */
  useEffect(() => {
    localStorage.setItem(LS_HISTORY, JSON.stringify(messages));
    if (atBottom) {
      scrollRef.current?.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, atBottom]);

  /* ===== Save draft ===== */
  useEffect(() => {
    const t = setTimeout(
      () => localStorage.setItem(LS_DRAFT, input),
      180
    );
    return () => clearTimeout(t);
  }, [input]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 40;
    setAtBottom(nearBottom);
  };

  /* ===== Helper: class cho bubble assistant theo tone ===== */
  function assistantBubbleClass(tone: Tone | undefined) {
    const base =
      "bg-white/8 text-slate-100 ring-1 ring-white/10 backdrop-blur px-3.5 py-2.5 rounded-2xl text-[0.95rem] leading-relaxed shadow";

    switch (tone) {
      case "danger":
        // nền vẫn tối, nhấn mạnh bằng viền trái đỏ
        return `${base} border-l-4 border-red-500/90`;
      case "warning":
        return `${base} border-l-4 border-amber-400/90`;
      case "safe":
        return `${base} border-l-4 border-emerald-400/90`;
      case "note":
        return `${base} border-l-4 border-sky-400/90`;
      default:
        return `${base} border border-white/10`;
    }
  }

  /* ===== Gửi message (text + có thể kèm fileMeta) ===== */
  async function sendMessage(
    text: string,
    fileMeta?: FileMeta | null
  ) {
    const msgText = text.trim();
    if (!msgText || sending || typing) return;

    const userMsg: Msg = { role: "user", text: msgText };
    const list = [...messages, userMsg];
    setMessages(list);
    setSending(true);

    try {
      const history = list.map((m) => ({
        role: m.role === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const body: any = { message: msgText, history };
      if (fileMeta) body.fileMeta = fileMeta;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const reply = data?.reply ?? "Xin lỗi, có lỗi xảy ra.";
      const securityNote: string | undefined = data?.securityNote;
      const fileRiskLevel: string | undefined = data?.fileRiskLevel;

      // securityNote (URL → VirusTotal) → bubble note màu xanh dương
      if (securityNote) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", text: securityNote, tone: "note" },
        ]);
      }

      // Chọn tone cho trả lời chính (file)
      let replyTone: Tone = "normal";
      if (fileMeta && fileRiskLevel) {
        if (fileRiskLevel === "dangerous") replyTone = "danger";
        else if (fileRiskLevel === "suspicious") replyTone = "warning";
        else if (fileRiskLevel === "safe") replyTone = "safe";
        else replyTone = "note";
      }

      await typeOut(reply, replyTone, (chunk, tone) => {
        setTyping(true);
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (!last || last.role !== "assistant") {
            return [...prev, { role: "assistant", text: chunk, tone }];
          }
          const copy = prev.slice();
          copy[copy.length - 1] = {
            role: "assistant",
            text: chunk,
            tone,
          };
          return copy;
        });
      });
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Mạng lỗi, thử lại giúp mình nha.",
          tone: "normal",
        },
      ]);
    } finally {
      setTyping(false);
      setSending(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || sending || typing) return;
    setInput("");
    await sendMessage(text, null);
  }

  /* ===== Hiệu ứng gõ từng chữ + 3 chấm ===== */
  async function typeOut(
    full: string,
    tone: Tone,
    onChunk: (txt: string, tone: Tone) => void
  ) {
    const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let out = "";
    const speed =
      full.length > 800 ? 8 : full.length > 300 ? 12 : 16;
    for (let i = 0; i < full.length; i++) {
      out += full[i];
      onChunk(out, tone);
      await delay(speed);
    }
  }

  /* ===== Chọn file: gửi meta (không upload) ===== */
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || sending || typing) return;

    const infoLine = `Mình muốn kiểm tra độ an toàn của file: ${file.name} (${file.type || "unknown"}, ${file.size} bytes).`;

    const meta: FileMeta = {
      name: file.name,
      type: file.type || "unknown",
      size: file.size,
    };

    await sendMessage(infoLine, meta);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /* ===== RENDER ===== */
  return (
    <div
      className="
      rounded-2xl overflow-hidden 
      border border-white/10 shadow-[0_10px_40px_rgba(2,6,23,.5)]
      bg-gradient-to-br from-slate-900/80 to-slate-800/70
      backdrop-blur-xl text-slate-100
    "
    >
      {/* Header */}
      <div
        className="relative px-4 py-3 border-b border-white/10
                   bg-gradient-to-r from-sky-600/80 via-indigo-600/80 to-fuchsia-600/70
                   text-white"
      >
        <div className="font-semibold tracking-wide">
          OpenDataMarket Chat
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-white/15 grid place-items-center transition"
          aria-label="Đóng"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M6 6L18 18M6 18L18 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-[460px] max-h-[70vh] overflow-y-auto p-3 space-y-3"
      >
        {messages.length === 0 && (
          <div className="text-sm text-slate-300/80 p-3 rounded-xl border border-white/10 bg-white/5">
            Chào bạn 👋 Mình là trợ lý của OpenDataMarket. Hãy hỏi mình
            về dataset, tài khoản, đơn hàng, thanh toán hoặc kiểm tra
            an toàn link/file trước khi bạn tải lên/tải về trên sàn.
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${
              m.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {m.role === "user" ? (
              <div
                className="
                  max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[0.95rem] leading-relaxed
                  shadow ring-1
                  bg-gradient-to-br from-sky-500 to-indigo-600 text-white ring-white/10
                "
              >
                {m.text}
              </div>
            ) : (
              <div className={assistantBubbleClass(m.tone || "normal")}>
                {m.text}
              </div>
            )}
          </div>
        ))}

        {(sending || typing) && (
          <div className="flex justify-start">
            <div className="px-3.5 py-2.5 rounded-2xl bg-white/8 ring-1 ring-white/10 shadow text-slate-100 flex items-center gap-2">
              <span className="text-xs text-slate-300">
                Đang xử lý...
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-white/70 animate-bounce" />
              <span className="inline-block w-2 h-2 rounded-full bg-white/60 animate-bounce [animation-delay:120ms]" />
              <span className="inline-block w-2 h-2 rounded-full bg-white/50 animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        )}
      </div>

      {/* Input + nút file + gửi */}
      <div className="p-3 border-t border-white/10 bg-slate-900/60">
        <div className="flex gap-2 items-center">
          {/* input file ẩn */}
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          {/* nút chọn file */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="h-10 w-10 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-slate-200 hover:bg-white/10 transition"
            title="Chọn file để kiểm tra theo đuôi"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                d="M16.5 6L9 13.5C8.17157 14.3284 8.17157 15.6716 9 16.5C9.82843 17.3284 11.1716 17.3284 12 16.5L18 10.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 7L7.5 11.5C5.84315 13.1569 5.84315 15.8431 7.5 17.5C9.15685 19.1569 11.8431 19.1569 13.5 17.5L19.5 11.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !e.shiftKey && send()
            }
            placeholder="Nhập câu hỏi về sàn OpenDataMarket..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-slate-100 placeholder:text-slate-400
                       border border-white/10 outline-none focus:border-sky-400/50 focus:ring-2 focus:ring-sky-500/30"
          />
          <button
            onClick={send}
            disabled={sending || typing || !input.trim()}
            className="px-4 py-2.5 rounded-xl text-white
                       bg-gradient-to-br from-sky-500 to-indigo-600
                       shadow disabled:opacity-60 transition active:scale-95"
          >
            Gửi
          </button>
        </div>
      </div>
    </div>
  );
}
