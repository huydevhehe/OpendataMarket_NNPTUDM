"use client";

import { useState } from "react";
import PaymentPopup from "./PaymentPopup";

export default function PaymentButton({ dataset, token }) {
    const [open, setOpen] = useState(false);

    const handleClose = (success) => {
        setOpen(false);
        if (success) {
            window.location.href = "/history"; // chuyển đến lịch sử
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
                Thanh toán
            </button>

            <PaymentPopup 
                open={open}
                onClose={handleClose}
                dataset={dataset}
                userToken={token}
            />
        </>
    );
}
