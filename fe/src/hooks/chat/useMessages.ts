// src/hooks/chat/useMessages.ts
import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getMessagesByConversation } from "@/services/chatService";
import { getSocket } from "@/lib/socket";
import type { Message } from "@/types";

export const useMessages = (conversationId: string, token: string) => {
    const qc = useQueryClient();

    const q = useQuery({
        queryKey: ["chat_messages", conversationId],
        queryFn: () => getMessagesByConversation(conversationId, token),
        enabled: !!token && !!conversationId,
        refetchOnWindowFocus: false,
    });

    // Lắng nghe socket: receive_message + message_sent
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        const onReceive = (msg: Message) => {
            if (msg.conversation_id !== conversationId) return;
            qc.setQueryData<Message[]>(
                ["chat_messages", conversationId],
                (old = []) => [...old, msg]
            );
        };

        const onSelfSent = (msg: Message) => {
            if (msg.conversation_id !== conversationId) return;
            qc.setQueryData<Message[]>(
                ["chat_messages", conversationId],
                (old = []) => {
                    // Nếu đã có optimistic record với content giống, có thể thay thế
                    return [...old, msg];
                }
            );
        };

        socket.on("receive_message", onReceive);
        socket.on("message_sent", onSelfSent);
        return () => {
            socket.off("receive_message", onReceive);
            socket.off("message_sent", onSelfSent);
        };
    }, [conversationId, qc]);

    return q;
};
