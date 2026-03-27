"use client";

import { useEffect, useRef } from "react";

interface MessageListProps {
  messages: any[];
  currentUserId: string | null;
  isLoading?: boolean;
}

// Hàm format thời gian
function formatTime(dateString: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (isLoading)
    return <div className="p-4 text-gray-400">Đang tải...</div>;

  // Remove duplicated messages theo id
  const uniqueMessages = Array.from(
    new Map(messages.map((m) => [m.id, m])).values()
  );

  return (
    <div className="flex flex-col gap-4 p-4 overflow-y-auto h-full">
      {uniqueMessages.map((m) => {
        const isMe = m.sender_id === currentUserId;

        return (
          <div
            key={m.id}
            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
          >
            {/* Tên người gửi */}
            <span className="text-xs text-gray-400 mb-1">
              {m.sender_name || m.sender?.full_name || "Không rõ"}
            </span>

            {/* Bubble */}
            <div
              className={`px-4 py-2 rounded-xl max-w-xs ${
                isMe
                  ? "bg-purple-600 text-white"
                  : "bg-slate-700 text-white"
              }`}
            >
              {m.content}
            </div>

            {/* Thời gian */}
            <span className="text-xs text-gray-500 mt-1">
              {formatTime(m.created_at)}
            </span>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}
