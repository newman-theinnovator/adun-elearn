"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";

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
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 p-4">
            {/* Background orbs */}
            <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
                <div className="absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl" />
                <div className="absolute top-1/3 left-1/3 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo / Header */}
                <div className="mb-8 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 rotate-3 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/30">
                        <BookOpen className="h-8 w-8 text-blue-950" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">ADUN E-Learn</h1>
                    <p className="mt-1 text-sm font-medium text-blue-300">
                        Admiralty University of Nigeria E-Learning Portal
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">Welcome back</h2>
                        <p className="mt-1 text-sm text-blue-200">
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
                                className="mb-1.5 block text-sm font-semibold text-blue-100"
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
                                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder-blue-300/60 transition-all focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/60 focus:outline-none"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="login-password"
                                className="mb-1.5 block text-sm font-semibold text-blue-100"
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
                                    className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 pr-12 text-sm text-white placeholder-blue-300/60 transition-all focus:border-amber-400/60 focus:ring-2 focus:ring-amber-400/60 focus:outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-blue-300 transition-colors hover:text-white"
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
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 py-3.5 text-sm font-bold text-blue-950 shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5 hover:from-amber-500 hover:to-amber-600 hover:shadow-xl disabled:translate-y-0 disabled:opacity-60"
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

                    {/* Demo credentials */}
                    <div className="mt-6 border-t border-white/10 pt-5">
                        <p className="mb-3 text-xs font-semibold tracking-wider text-blue-300 uppercase">
                            Demo Credentials
                        </p>
                        <div className="space-y-2">
                            {[
                                { role: "Student", email: "stu0@adun.edu.ng", color: "emerald" },
                                { role: "Lecturer", email: "n.eze@adun.edu.ng", color: "blue" },
                                { role: "Admin", email: "admin@adun.edu.ng", color: "purple" },
                            ].map(({ role, email: demoEmail, color }) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => {
                                        setEmail(demoEmail);
                                        setPassword("password123");
                                    }}
                                    className={`group flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left transition-all hover:bg-white/10`}
                                >
                                    <span
                                        className={`text-xs font-bold text-${color}-400 group-hover:text-${color}-300`}
                                    >
                                        {role}
                                    </span>
                                    <span className="ml-3 truncate font-mono text-xs text-blue-300">
                                        {demoEmail}
                                    </span>
                                </button>
                            ))}
                            <p className="mt-1 text-center text-xs text-blue-400/60">
                                All demo accounts use:{" "}
                                <span className="font-mono font-bold text-blue-300">
                                    password123
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-6 text-center text-xs text-blue-400/60">
                    © {new Date().getFullYear()} Admiralty University of Nigeria. All rights
                    reserved.
                </p>
            </div>
        </div>
    );
}
