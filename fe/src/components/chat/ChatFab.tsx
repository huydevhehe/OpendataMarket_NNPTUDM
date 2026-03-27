"use client";
import { useEffect, useState } from "react";
import ChatWidget from "./ChatWidget";

const LS_OPEN = "odm_chat_open_v1";

export default function ChatFab() {
    const [open, setOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Load client state
    useEffect(() => {
        setMounted(true);
        const saved = localStorage.getItem(LS_OPEN);
        if (saved) setOpen(saved === "1");
    }, []);

    // Save state
    useEffect(() => {
        if (mounted) {
            localStorage.setItem(LS_OPEN, open ? "1" : "0");
        }
    }, [open, mounted]);

    // Ngăn render SSR → tránh mismatch hoàn toàn
    if (!mounted) return null;

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setOpen(o => !o)}
                className="fixed bottom-15 left-5 z-50 h-14 w-14 rounded-full 
                   bg-gradient-to-br from-sky-500 to-indigo-600 text-white 
                   shadow-[0_10px_30px_rgba(2,132,199,.45)] 
                   ring-1 ring-white/10 backdrop-blur transition-all
                   hover:scale-105 active:scale-95"
                aria-label={open ? "Đóng chat" : "Mở chat"}
            >
                {open ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" className="m-auto">
                        <path d="M6 6L18 18M6 18L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" className="m-auto">
                        <path d="M4 5h16v11H7l-3 3V5z" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                )}
            </button>

            {/* Panel */}
            <div
                className={`fixed bottom-30 left-5 z-50 w-[380px] max-w-[94vw] 
                    transition-all duration-300
                    ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
            >
                <ChatWidget onClose={() => setOpen(false)} />
            </div>
        </>
    );
}
