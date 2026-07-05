import Link from "next/link";
import {
    BookOpen,
    ClipboardCheck,
    Brain,
    MessageSquare,
    BarChart3,
    ShieldCheck,
    ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { APP_NAME, UNIVERSITY_NAME, DEPARTMENT_NAME } from "@/lib/branding";

const FEATURES = [
    {
        icon: BookOpen,
        title: "Structured Course Delivery",
        description:
            "Modules, lecture content, and resources organized by course, semester, and level.",
    },
    {
        icon: ClipboardCheck,
        title: "Assessments & Grading",
        description:
            "Quizzes, assignments, and exams with transparent grading and instant feedback.",
    },
    {
        icon: Brain,
        title: "AI-Powered Insights",
        description:
            "Personalized performance predictions and recommendations generated from real academic data.",
    },
    {
        icon: BarChart3,
        title: "Real-Time Analytics",
        description:
            "Department, course, and individual performance dashboards for admins, lecturers, and students.",
    },
    {
        icon: MessageSquare,
        title: "Discussion Forums",
        description:
            "Course-specific discussion threads for questions, clarifications, and peer support.",
    },
    {
        icon: ShieldCheck,
        title: "Role-Based Access",
        description:
            "Admin-provisioned accounts with dedicated views for students, lecturers, and administrators.",
    },
];

export default function LandingPage() {
    return (
        <div className="dark:bg-navy-950 flex min-h-screen flex-col bg-white">
            {/* Nav */}
            <header className="dark:bg-navy-950/80 sticky top-0 z-30 border-b border-gray-100 bg-white/80 backdrop-blur-md dark:border-white/10">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <Logo size="sm" />
                        <span className="text-navy-900 text-lg font-bold dark:text-white">
                            {APP_NAME}
                        </span>
                    </div>
                    <Link
                        href="/login"
                        className="bg-navy-800 hover:bg-navy-700 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                    >
                        Sign In
                    </Link>
                </div>
            </header>

            {/* Hero */}
            <section className="from-navy-950 via-navy-900 to-navy-800 relative overflow-hidden bg-gradient-to-br px-4 py-20 text-center sm:px-6 sm:py-28">
                <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
                    <div className="bg-navy-400/20 absolute top-[-10%] right-[-5%] h-72 w-72 rounded-full blur-3xl" />
                    <div className="bg-crimson-500/10 absolute bottom-[-10%] left-[-5%] h-96 w-96 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 mx-auto max-w-3xl">
                    <div className="mb-6 inline-flex rounded-2xl bg-white p-3 shadow-lg">
                        <Logo size="md" />
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white sm:text-5xl">
                        The E-Learning Portal for the {DEPARTMENT_NAME} Department
                    </h1>
                    <p className="text-navy-200 mx-auto mt-5 max-w-2xl text-base sm:text-lg">
                        Courses, assessments, grades, and AI-powered performance insights — built
                        exclusively for {UNIVERSITY_NAME}&apos;s Software Engineering students,
                        lecturers, and administrators.
                    </p>
                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/login"
                            className="from-crimson-600 to-crimson-500 shadow-crimson-500/30 hover:from-crimson-700 hover:to-crimson-600 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                        >
                            Sign In to Portal
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="flex-1 px-4 py-16 sm:px-6 sm:py-24">
                <div className="mx-auto max-w-6xl">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-navy-900 text-2xl font-bold sm:text-3xl dark:text-white">
                            Everything the department needs, in one portal
                        </h2>
                        <p className="mt-3 text-sm text-gray-500 sm:text-base dark:text-gray-400">
                            A single, role-aware platform replacing scattered spreadsheets, email
                            threads, and paper records.
                        </p>
                    </div>

                    <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.title}
                                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
                            >
                                <div className="bg-navy-50 text-navy-700 dark:bg-navy-900/40 dark:text-navy-300 mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl">
                                    <feature.icon className="h-5 w-5" />
                                </div>
                                <h3 className="text-navy-900 font-bold dark:text-white">
                                    {feature.title}
                                </h3>
                                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-100 px-4 py-8 text-center dark:border-gray-800">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    © {new Date().getFullYear()} {UNIVERSITY_NAME}. All rights reserved.
                </p>
                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    Built by{" "}
                    <a
                        href="https://newmanukpakacom.vercel.app/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-crimson-600 hover:text-crimson-700 dark:text-crimson-400 dark:hover:text-crimson-300 font-semibold transition-colors"
                    >
                        ƈɛʀɛɮʀօ 😈
                    </a>
                </p>
            </footer>
        </div>
    );
}
