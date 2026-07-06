"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { signOut } from "next-auth/react";
import { Shield, Bell, LogOut, Save, KeyRound } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

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

function useChangePassword() {
    return useMutation({
        mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
            const res = await fetch("/api/settings/change-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to change password");
            }
            return res.json();
        },
    });
}

export default function SettingsPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const { data: prefs } = useSettings();
    const { mutate: saveSettings, isPending } = useSaveSettings();

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [forumAlerts, setForumAlerts] = useState(true);
    const [gradeAlerts, setGradeAlerts] = useState(true);
    const [saved, setSaved] = useState(false);
    const [syncedPrefsId, setSyncedPrefsId] = useState<Preferences | null>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordSaved, setPasswordSaved] = useState(false);
    const {
        mutate: changePassword,
        isPending: isChangingPassword,
        error: passwordError,
    } = useChangePassword();

    // Sync state from server (only once per fetched prefs object, to avoid
    // clobbering in-progress local edits on every render)
    if (prefs && syncedPrefsId !== prefs) {
        setSyncedPrefsId(prefs);
        setEmailNotifications(prefs.emailNotifications);
        setForumAlerts(prefs.forumAlerts);
        setGradeAlerts(prefs.gradeAlerts);
    }

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

    const [confirmMismatch, setConfirmMismatch] = useState(false);

    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            setConfirmMismatch(true);
            return;
        }
        setConfirmMismatch(false);
        changePassword(
            { currentPassword, newPassword },
            {
                onSuccess: () => {
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setPasswordSaved(true);
                    setTimeout(() => setPasswordSaved(false), 2000);
                },
            }
        );
    };

    if (!user) return null;

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold dark:text-white">Settings</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Manage your account and notification preferences
                </p>
            </div>

            {/* Account Info */}
            <Card>
                <CardHeader>
                    <Shield className="h-4 w-4 text-blue-600" />
                    <CardTitle>Account</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor="settings-first-name">First Name</Label>
                            <Input
                                id="settings-first-name"
                                defaultValue={user.firstName}
                                disabled
                            />
                        </div>
                        <div>
                            <Label htmlFor="settings-last-name">Last Name</Label>
                            <Input id="settings-last-name" defaultValue={user.lastName} disabled />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="settings-email">Email</Label>
                        <Input id="settings-email" defaultValue={user.email} disabled />
                    </div>
                    <div>
                        <Label>Role</Label>
                        <div className="flex items-center gap-2">
                            <Badge
                                variant={
                                    user.role === "ADMIN"
                                        ? "purple"
                                        : user.role === "LECTURER"
                                          ? "info"
                                          : "success"
                                }
                            >
                                {user.role}
                            </Badge>
                            <span className="text-xs text-gray-400">
                                Contact an administrator to change your role
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Change Password */}
            <Card>
                <CardHeader>
                    <KeyRound className="h-4 w-4 text-blue-600" />
                    <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        {passwordError && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                {passwordError.message}
                            </p>
                        )}
                        {confirmMismatch && (
                            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                New password and confirmation do not match.
                            </p>
                        )}
                        <div>
                            <Label htmlFor="settings-current-password">Current Password</Label>
                            <Input
                                id="settings-current-password"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <Label htmlFor="settings-new-password">New Password</Label>
                                <Input
                                    id="settings-new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <Label htmlFor="settings-confirm-password">
                                    Confirm New Password
                                </Label>
                                <Input
                                    id="settings-confirm-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    minLength={6}
                                    required
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isChangingPassword}
                            className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                        >
                            <KeyRound className="h-4 w-4" />
                            {isChangingPassword
                                ? "Updating…"
                                : passwordSaved
                                  ? "Updated! ✓"
                                  : "Update Password"}
                        </button>
                    </form>
                </CardContent>
            </Card>

            {/* Notification Preferences */}
            <Card>
                <CardHeader>
                    <Bell className="h-4 w-4 text-blue-600" />
                    <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[
                        {
                            label: "Email Notifications",
                            desc: "Receive important system emails",
                            value: emailNotifications,
                            set: setEmailNotifications,
                        },
                        {
                            label: "Forum Alerts",
                            desc: "Get notified on replies to your posts",
                            value: forumAlerts,
                            set: setForumAlerts,
                        },
                        {
                            label: "Grade Alerts",
                            desc: "Get notified when your grades are posted",
                            value: gradeAlerts,
                            set: setGradeAlerts,
                        },
                    ].map((pref) => (
                        <div key={pref.label} className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm font-semibold dark:text-white">
                                    {pref.label}
                                </p>
                                <p className="mt-0.5 text-xs text-gray-400">{pref.desc}</p>
                            </div>
                            <button
                                onClick={() => pref.set(!pref.value)}
                                role="switch"
                                aria-checked={pref.value}
                                aria-label={pref.label}
                                className={`relative h-6 w-11 rounded-full transition-colors duration-200 focus:outline-none ${pref.value ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"}`}
                            >
                                <span
                                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${pref.value ? "translate-x-5" : "translate-x-0"}`}
                                />
                            </button>
                        </div>
                    ))}
                </CardContent>
                <div className="px-5 pb-5">
                    <button
                        onClick={handleSave}
                        disabled={isPending}
                        className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                    >
                        <Save className="h-4 w-4" />
                        {isPending ? "Saving…" : saved ? "Saved! ✓" : "Save Preferences"}
                    </button>
                </div>
            </Card>

            {/* Danger Zone */}
            <Card className="border-red-100 dark:border-red-900/30">
                <CardHeader className="border-red-100 dark:border-red-900/30">
                    <LogOut className="h-4 w-4 text-red-500" />
                    <CardTitle className="text-red-600 dark:text-red-400">
                        Account Actions
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        Signing out will end your current session.
                    </p>
                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className="flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 transition-all hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                </CardContent>
            </Card>
        </div>
    );
}
