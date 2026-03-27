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
        <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            {/* Background orbs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-5%] w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                <div className="absolute top-1/3 left-1/3 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo / Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl shadow-lg shadow-amber-500/30 mb-4 rotate-3">
                        <BookOpen className="w-8 h-8 text-blue-950" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">ADUN E-Learn</h1>
                    <p className="text-blue-300 text-sm mt-1 font-medium">Admiralty University of Nigeria E-Learning Portal</p>
                </div>

                {/* Card */}
                <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl p-8">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white">Welcome back</h2>
                        <p className="text-blue-200 text-sm mt-1">Sign in to access your academic portal</p>
                    </div>

                    {error && (
                        <div className="flex items-start gap-3 bg-red-500/20 border border-red-500/40 rounded-xl p-3 mb-5 text-red-200 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-1.5">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="your.email@stu.adun.edu.ng"
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 transition-all text-sm"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-blue-100 mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-300/60 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:border-amber-400/60 transition-all text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-blue-950 font-bold py-3.5 rounded-xl shadow-lg shadow-amber-500/30 transition-all hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0 flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                            ) : (
                                "Sign In to Portal"
                            )}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 pt-5 border-t border-white/10">
                        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">Demo Credentials</p>
                        <div className="space-y-2">
                            {[
                                { role: "Student", email: "stu0@adun.edu.ng", color: "emerald" },
                                { role: "Lecturer", email: "n.eze@adun.edu.ng", color: "blue" },
                                { role: "Admin", email: "admin@adun.edu.ng", color: "purple" },
                            ].map(({ role, email: demoEmail, color }) => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => { setEmail(demoEmail); setPassword("password123"); }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-left group`}
                                >
                                    <span className={`text-xs font-bold text-${color}-400 group-hover:text-${color}-300`}>{role}</span>
                                    <span className="text-xs text-blue-300 font-mono truncate ml-3">{demoEmail}</span>
                                </button>
                            ))}
                            <p className="text-xs text-blue-400/60 text-center mt-1">All demo accounts use: <span className="font-mono font-bold text-blue-300">password123</span></p>
                        </div>
                    </div>
                </div>

                <p className="text-center text-blue-400/60 text-xs mt-6">
                    © {new Date().getFullYear()} Admiralty University of Nigeria. All rights reserved.
                </p>
            </div>
        </div>
    );
}
