"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Shield, Bell, LogOut, Save } from "lucide-react";

interface Preferences {
    emailNotifications: boolean;
    forumAlerts: boolean;
    gradeAlerts: boolean;
}

function useSettings() {
    return useQuery<Preferences>({
        queryKey: ["settings"],
        queryFn: async () => {
            const res = await fetch("/api/settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            return res.json();
        },
    });
}

function useSaveSettings() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (prefs: Preferences) => {
            const res = await fetch("/api/settings", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(prefs),
            });
            if (!res.ok) throw new Error("Failed to save settings");
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
    });
}

export default function SettingsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: prefs, isLoading } = useSettings();
    const { mutate: saveSettings, isPending, isSuccess } = useSaveSettings();

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [forumAlerts, setForumAlerts] = useState(true);
    const [gradeAlerts, setGradeAlerts] = useState(true);
    const [saved, setSaved] = useState(false);

    // Sync state from server
    useEffect(() => {
        if (prefs) {
            setEmailNotifications(prefs.emailNotifications);
            setForumAlerts(prefs.forumAlerts);
            setGradeAlerts(prefs.gradeAlerts);
        }
    }, [prefs]);

    const handleSave = () => {
        saveSettings(
            { emailNotifications, forumAlerts, gradeAlerts },
            {
                onSuccess: () => {
                    setSaved(true);
                    setTimeout(() => setSaved(false), 2000);
                },
            }
        );
    };

    if (!user) return null;

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and notification preferences</p>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-sm dark:text-white uppercase tracking-wider">Account</h2>
                </div>
                <div className="p-5 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">First Name</label>
                            <input defaultValue={user.firstName} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-xl text-sm bg-gray-50 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Last Name</label>
                            <input defaultValue={user.lastName} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-xl text-sm bg-gray-50 cursor-not-allowed" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Email</label>
                        <input defaultValue={user.email} disabled className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 rounded-xl text-sm bg-gray-50 cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Role</label>
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg ${user.role === "ADMIN" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" : user.role === "LECTURER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>
                                {user.role}
                            </span>
                            <span className="text-xs text-gray-400">Contact an administrator to change your role</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Notification Preferences */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-blue-600" />
                    <h2 className="font-bold text-sm dark:text-white uppercase tracking-wider">Notifications</h2>
                </div>
                <div className="p-5 space-y-4">
                    {[
                        { label: "Email Notifications", desc: "Receive important system emails", value: emailNotifications, set: setEmailNotifications },
                        { label: "Forum Alerts", desc: "Get notified on replies to your posts", value: forumAlerts, set: setForumAlerts },
                        { label: "Grade Alerts", desc: "Get notified when your grades are posted", value: gradeAlerts, set: setGradeAlerts },
                    ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="font-semibold text-sm dark:text-white">{pref.label}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{pref.desc}</p>
                            </div>
                            <button
                                onClick={() => pref.set(!pref.value)}
                                className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${pref.value ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                            >
                                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${pref.value ? "translate-x-5" : "translate-x-0"}`} />
                            </button>
                        </div>
                    ))}
                </div>
                <div className="px-5 pb-5">
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="flex items-center gap-2 bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 transition-all shadow-md disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isPending ? "Saving…" : saved ? "Saved! ✓" : "Save Preferences"}
                    </button>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-red-100 dark:border-red-900/30 flex items-center gap-2">
                    <LogOut className="w-4 h-4 text-red-500" />
                    <h2 className="font-bold text-sm text-red-600 dark:text-red-400 uppercase tracking-wider">Account Actions</h2>
                </div>
                <div className="p-5">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Signing out will end your current session.</p>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2 border border-red-200 dark:border-red-900/40 text-red-600 dark:text-red-400 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    >
                        <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
