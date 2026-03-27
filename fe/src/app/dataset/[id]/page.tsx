"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";   // ⭐ THÊM
import { useDatasetById } from "@/hooks/dataset/useDataset";
import Background from "@/components/background";
import Footer from "@/components/footer";
import Navbar from "@/components/navBar";

import HeroSection from "../components/HeroSection";
import DatasetOverview from "../components/DatasetOverview";
import ReviewSection from "../components/ReviewSection";
import RelatedDatasets from "../components/RelatedDatasets";
import DatasetContentSection from "../components/DatasetContentSection";
import DatasetPreviewSection from "../components/DatasetPreviewSection";

import ReviewModal from "@/components/review/ReviewModal";       // ⭐ THÊM

export default function DatasetDetailPage() {
    const { id } = useParams();
    const searchParams = useSearchParams();                     // ⭐ THÊM

    const autoReview = searchParams.get("review");              // ⭐ THÊM
    const orderIdAuto = searchParams.get("order_id");           // ⭐ THÊM

    const { data: dataset, isLoading, error } = useDatasetById(id as string);

    const sidebarRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const [isFixed, setIsFixed] = useState(false);
    const [offsetTop, setOffsetTop] = useState(0);

    // ⭐ NEW: STATE POPUP REVIEW
    const [openReview, setOpenReview] = useState(false);

    // ⭐ NEW: AUTO BẬT POPUP REVIEW
    useEffect(() => {
        if (autoReview === "1") {
            setTimeout(() => setOpenReview(true), 400);
        }
    }, [autoReview]);

    useEffect(() => {
        const handleScroll = () => {
            if (!sidebarRef.current || !contentRef.current) return;

            const contentTop = contentRef.current.getBoundingClientRect().top;
            const contentBottom = contentRef.current.getBoundingClientRect().bottom;
            const windowHeight = window.innerHeight;

            if (contentTop <= 80 && contentBottom > windowHeight) {
                setIsFixed(true);
                setOffsetTop(80);
            } else {
                setIsFixed(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    if (isLoading)
        return <div className="text-center py-20 text-gray-400">Đang tải dữ liệu...</div>;
    if (error)
        return <div className="text-center py-20 text-red-400">Lỗi tải dữ liệu</div>;
    if (!dataset)
        return <div className="text-center py-20 text-yellow-400">Không tìm thấy dataset</div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">

            <Navbar />

            <div className="pt-24">
                <Background />
                <HeroSection dataset={dataset} />

                <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-3 gap-10 relative">

                    {/* CONTENT */}
                    <div ref={contentRef} className="lg:col-span-2 space-y-10">
                        <DatasetContentSection dataset={dataset} />
                        <DatasetPreviewSection />

                        <ReviewSection
                            dataset={dataset}
                        />

                        <RelatedDatasets dataset={dataset} />
                    </div>

                    {/* SIDEBAR */}
                    <div
                        ref={sidebarRef}
                        className={`lg:col-span-1 transition-all duration-300 ${
                            isFixed
                                ? "fixed right-[max(calc((100vw-1120px)/2),24px)]"
                                : "relative"
                        }`}
                        style={{
                            top: isFixed ? `${offsetTop}px` : "auto",
                            width: isFixed ? "350px" : "auto",
                        }}
                    >
                        <DatasetOverview dataset={dataset} />
                    </div>
                </div>

                <Footer />
            </div>

            {/* ⭐ POPUP REVIEW */}
            <ReviewModal
                open={openReview}
                onClose={() => setOpenReview(false)}
                datasetId={dataset.dataset_id}
                orderId={orderIdAuto}
            />
        </div>
    );
}
