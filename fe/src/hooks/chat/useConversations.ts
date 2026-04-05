// src/hooks/chat/useConversations.ts
import { useQuery } from "@tanstack/react-query";
import { getConversations } from "@/services/chatService";

export const useConversations = (token: string) => {
    return useQuery({
        queryKey: ["chat_conversations"],
        queryFn: () => getConversations(token),
        enabled: !!token,
        staleTime: 10_000,
    });
};
