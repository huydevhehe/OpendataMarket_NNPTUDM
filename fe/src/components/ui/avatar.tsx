"use client";

import * as React from "react";

export function Avatar({
    className,
    children,
}: {
    className?: string;
    children: React.ReactNode;
}) {
    return (
        <div
            className={`rounded-full bg-slate-700 flex items-center justify-center text-white font-medium ${className}`}
        >
            {children}
        </div>
    );
}

export function AvatarFallback({
    children,
}: {
    children: React.ReactNode;
}) {
    return <span>{children}</span>;
}
