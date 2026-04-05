// src/hooks/chat/useSendMessage.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { sendMessage } from "@/services/chatService";
import type { Message } from "@/types";

export const useSendMessage = (token: string, conversationId: string) => {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: (content: string) =>
            sendMessage({ conversation_id: conversationId, content }, token),
        onMutate: async (content) => {
            await qc.cancelQueries({ queryKey: ["chat_messages", conversationId] });
            const prev = qc.getQueryData<Message[]>(["chat_messages", conversationId]) || [];

            const optimistic: Message = {
                id: "optimistic-" + Math.random().toString(36).slice(2),
                conversation_id: conversationId,
                sender_id: "me",
                content,
                is_read: false,
                created_at: new Date().toISOString(),
            };
            qc.setQueryData<Message[]>(["chat_messages", conversationId], [...prev, optimistic]);
            return { prev };
        },
        onError: (_err, _vars, ctx) => {
            if (ctx?.prev) qc.setQueryData(["chat_messages", conversationId], ctx.prev);
        },
        onSettled: () => {
            qc.invalidateQueries({ queryKey: ["chat_messages", conversationId] });
        },
    });
};
