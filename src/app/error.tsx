"use client";

import { useEffect } from "react";
import { BookOpen, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-4">
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full bg-red-500/10 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
            </div>

            <div className="relative z-10 w-full max-w-md text-center">
                <div className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-red-400 to-red-500 shadow-lg shadow-red-500/30">
                    <BookOpen className="h-8 w-8 text-white" />
                </div>

                <h1 className="mb-2 text-4xl font-black text-white">Something went wrong</h1>
                <p className="mb-8 text-sm text-blue-300">
                    An unexpected error occurred. Please try again or return to the dashboard.
                </p>

                <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <button
                        onClick={reset}
                        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-6 py-3 font-bold text-blue-950 shadow-lg transition-all hover:-translate-y-0.5 hover:from-amber-500 hover:to-amber-600"
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

                <p className="mt-8 text-xs text-blue-400/60">
                    © {new Date().getFullYear()} Admiralty University of Nigeria
                </p>
            </div>
        </div>
    );
}
