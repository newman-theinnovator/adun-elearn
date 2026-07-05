"use client";

import { useEffect } from "react";
import { RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { UNIVERSITY_NAME } from "@/lib/branding";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="from-navy-950 via-navy-900 to-navy-800 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
                <div className="bg-crimson-500/10 absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full blur-3xl" />
                <div className="bg-navy-400/20 absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="mx-auto mb-6 inline-flex rounded-2xl bg-white p-3 shadow-lg">
                    <Logo />
                </div>

                <h1 className="mb-2 text-4xl font-black text-white">Something went wrong</h1>
                <p className="text-navy-200 mb-8 text-sm">
                    An unexpected error occurred. Please try again or return to the dashboard.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        onClick={reset}
                        className="from-crimson-600 to-crimson-500 hover:from-crimson-700 hover:to-crimson-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-6 py-3 font-bold text-white shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Try Again
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/20"
                    >
                        <Home className="h-4 w-4" />
                        Go to Dashboard
                    </Link>
                </div>

                <p className="text-navy-300/60 mt-8 text-xs">
                    © {new Date().getFullYear()} {UNIVERSITY_NAME}
                </p>
            </div>
        </div>
    );
}
