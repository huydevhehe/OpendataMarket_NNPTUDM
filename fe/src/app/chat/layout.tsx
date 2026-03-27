"use client";

import { useState } from "react";
import ChatSidebar from "./components/ChatSidebar";
import { Menu } from "lucide-react";

export default function ChatLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-[100dvh] bg-slate-950 text-white relative overflow-hidden">
            {/* --- Sidebar (desktop + mobile overlay) --- */}
            {/* Desktop mode */}
            <div
                className="hidden md:flex md:w-[350px] lg:w-[380px] border-r border-slate-800 
                           bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_12px_rgba(0,0,0,0.3)] 
                           transition-all duration-300 ease-in-out"
            >
                <ChatSidebar />
            </div>

            {/* Mobile Drawer */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-y-0 left-0 z-40 w-[85%] max-w-sm bg-slate-900 border-r border-slate-800 
                               shadow-2xl transition-all duration-300 ease-in-out md:hidden"
                >
                    <ChatSidebar onClose={() => setSidebarOpen(false)} />
                </div>
            )}

            {/* --- Main Chat Window --- */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Mobile Header Toggle */}
                <div className="flex md:hidden items-center justify-between p-4 border-b border-slate-800 bg-slate-900 shadow-md sticky top-0 z-20">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                    >
                        <Menu className="w-5 h-5 text-indigo-400" />
                    </button>
                    <h1 className="font-semibold text-indigo-400 text-lg">Chat</h1>
                    <div className="w-8" /> {/* Giữ cân đối */}
                </div>

                {children}
            </div>
        </div>
    );
}
