"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME, UNIVERSITY_NAME } from "@/lib/branding";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password. Please try again.");
            } else {
                router.push("/dashboard");
                router.refresh();
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="from-navy-950 via-navy-900 to-navy-800 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
            {/* Background orbs */}
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
                <div className="bg-navy-400/20 absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full blur-3xl" />
                <div className="bg-crimson-500/10 absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full blur-3xl" />
                <div className="bg-crimson-400/10 absolute top-1/3 left-1/3 h-48 w-48 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo / Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex rounded-2xl bg-white p-3 shadow-lg">
                        <Logo />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">{APP_NAME}</h1>
                    <p className="text-navy-200 mt-1 text-sm font-medium">
                        {UNIVERSITY_NAME} E-Learning Portal
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">Welcome back</h2>
                        <p className="text-navy-200 mt-1 text-sm">
                            Sign in to access your academic portal
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-500/40 bg-red-500/20 p-3 text-sm text-red-200">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label
                                htmlFor="login-email"
                                className="text-navy-100 mb-1.5 block text-sm font-semibold"
                            >
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your.email@stu.adun.edu.ng"
                                required
                                className="placeholder-navy-300/60 focus:border-crimson-500/60 focus:ring-crimson-500/60 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white transition-all focus:ring-2 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="text-navy-100 mb-1.5 block text-sm font-semibold"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="placeholder-navy-300/60 focus:border-crimson-500/60 focus:ring-crimson-500/60 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white transition-all focus:ring-2 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="text-navy-300 absolute top-1/2 right-3 -translate-y-1/2 p-1 transition-colors hover:text-white"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="from-crimson-600 to-crimson-500 shadow-crimson-500/30 hover:from-crimson-700 hover:to-crimson-600 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in...
                                </>
                            ) : (
                                "Sign In to Portal"
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-navy-300/60 mt-6 text-center text-xs">
                    © {new Date().getFullYear()} {UNIVERSITY_NAME}. All rights reserved.
                </p>
            </div>
        </div>
    );
}
