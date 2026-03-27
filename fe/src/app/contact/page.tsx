import Image from "next/image";
import Background from "@/components/background";
import Footer from "@/components/footer";
import Navbar from "@/components/navBar";
import ContactPage from "@/features/buyer/contact/contact";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white overflow-x-hidden">
            <div className="relative z-0">
                <Background />
                <Navbar />
                <ContactPage />
                <Footer />
            </div>
        </div>
    );
}

