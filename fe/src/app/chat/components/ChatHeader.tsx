"use client";

import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";

interface ChatHeaderProps {
    partnerName: string;
}

const AvatarPlaceholder = ({ name }: { name: string }) => (
    <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center font-bold text-base flex-shrink-0 border-2 border-slate-500 text-white">
        {name.charAt(0).toUpperCase()}
    </div>
);

export default function ChatHeader({ partnerName }: ChatHeaderProps) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 shadow-lg flex-shrink-0">
            <div className="flex items-center gap-3">
                <AvatarPlaceholder name={partnerName} />
                <div>
                    <h2 className="font-extrabold text-lg truncate max-w-[200px] text-indigo-400">
                        {partnerName}
                    </h2>
                    <p className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Hoạt động
                    </p>
                </div>
            </div>

            <Button
                variant="ghost"
                className="text-white hover:bg-slate-800 p-2 rounded-full"
            >
                <MoreVertical className="w-5 h-5" />
            </Button>
        </div>
    );
}
