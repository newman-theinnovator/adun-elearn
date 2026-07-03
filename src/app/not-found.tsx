import Link from "next/link";
import { BookOpen, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center max-w-md w-full">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 mb-6 rotate-3 mx-auto">
                    <BookOpen className="w-8 h-8 text-blue-950" />
                </div>

                <h1 className="text-8xl font-black text-white mb-2">404</h1>
                <h2 className="text-2xl font-bold text-blue-100 mb-3">Page Not Found</h2>
                <p className="text-blue-300 text-sm mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-bold py-3 px-6 rounded-xl shadow-lg transition-all hover:-translate-y-0.5"
                    >
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    <Link
                        href="/login"
                        className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all hover:-translate-y-0.5"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>

                <p className="text-blue-400/60 text-xs mt-8">
                    © {new Date().getFullYear()} Admiralty University of Nigeria
                </p>
            </div>
        </div>
    );
}
