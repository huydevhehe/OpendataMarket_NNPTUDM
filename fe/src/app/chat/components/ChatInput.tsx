"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizonal, Loader2 } from "lucide-react";

interface ChatInputProps {
    input: string;
    setInput: (val: string) => void;
    sendMessage: () => void;
    isSending: boolean;
}

export default function ChatInput({
    input,
    setInput,
    sendMessage,
    isSending,
}: ChatInputProps) {
    return (
        <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3 flex-shrink-0">
            <Input
                placeholder="Nhập tin nhắn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-slate-800 text-white border border-slate-700 rounded-full px-5 py-3 
                    focus:ring-4 focus:ring-indigo-500/50 focus:bg-slate-700/80 transition-all duration-200"
                disabled={isSending}
            />
            <Button
                onClick={sendMessage}
                className="bg-indigo-600 hover:bg-indigo-700 rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-lg hover:shadow-indigo-500/50 transition-all duration-200"
                disabled={!input.trim() || isSending}
            >
                {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-white" />
                ) : (
                    <SendHorizonal className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
}
