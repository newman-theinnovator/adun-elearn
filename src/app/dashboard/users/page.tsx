"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Search, UserCheck, UserX, Shield, GraduationCap, BookOpen, MoreVertical } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface UserRecord {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: "STUDENT" | "LECTURER" | "ADMIN";
    isActive: boolean;
    matricNumber?: string | null;
    staffId?: string | null;
    level?: number | null;
}

function useUsers(role?: string) {
    return useQuery<UserRecord[]>({
        queryKey: ["admin", "users", role],
        queryFn: async () => {
            const url = role ? `/api/users?role=${role}` : "/api/users";
            const res = await fetch(url);
            if (!res.ok) throw new Error("Failed to fetch users");
            return res.json();
        },
    });
}

function useUpdateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string; role?: string; isActive?: boolean }) => {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) throw new Error("Failed to update user");
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

const ROLE_ICON: Record<string, React.ElementType> = {
    STUDENT: BookOpen,
    LECTURER: GraduationCap,
    ADMIN: Shield,
};

const ROLE_COLOR: Record<string, string> = {
    STUDENT: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    LECTURER: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    ADMIN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

export default function UsersPage() {
    const [search, setSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const { data: users, isLoading } = useUsers(roleFilter || undefined);
    const { mutate: updateUser, isPending } = useUpdateUser();

    const filtered = (users || []).filter((u) => {
        const q = search.toLowerCase();
        return (
            u.firstName?.toLowerCase().includes(q) ||
            u.lastName?.toLowerCase().includes(q) ||
            u.email?.toLowerCase().includes(q) ||
            u.matricNumber?.toLowerCase().includes(q) ||
            u.staffId?.toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">User Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {users?.length || 0} total accounts
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, matric or staff ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                </div>
                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                    <option value="">All Roles</option>
                    <option value="STUDENT">Students</option>
                    <option value="LECTURER">Lecturers</option>
                    <option value="ADMIN">Admins</option>
                </select>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800/80 border-b border-gray-100 dark:border-gray-700">
                                <tr>
                                    <th className="text-left py-4 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">User</th>
                                    <th className="text-left py-4 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">ID / Matric</th>
                                    <th className="text-center py-4 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Role</th>
                                    <th className="text-center py-4 px-5 font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-xs">Status</th>
                                    <th className="py-4 px-5" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filtered.length === 0 ? (
                                    <tr><td colSpan={5} className="py-10 text-center text-gray-400 text-sm">No users found.</td></tr>
                                ) : filtered.map((u) => {
                                    const RoleIcon = ROLE_ICON[u.role] || Shield;
                                    return (
                                        <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 ${u.role === "STUDENT" ? "bg-emerald-500" : u.role === "LECTURER" ? "bg-blue-500" : "bg-purple-500"}`}>
                                                        {u.firstName?.[0]}{u.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold dark:text-white">{u.firstName} {u.lastName}</p>
                                                        <p className="text-xs text-gray-400">{u.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5 text-gray-500 dark:text-gray-400 text-xs font-mono">
                                                {u.matricNumber || u.staffId || "—"}
                                                {u.level ? <span className="ml-1 text-gray-400">({u.level}L)</span> : null}
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${ROLE_COLOR[u.role]}`}>
                                                    <RoleIcon className="w-3 h-3" />
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${u.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400"}`}>
                                                    {u.isActive ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                                                    {u.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-5 relative">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === u.id ? null : u.id)}
                                                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                                    </button>
                                                    {activeMenu === u.id && (
                                                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 overflow-hidden text-xs">
                                                            <button
                                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium dark:text-gray-200"
                                                                onClick={() => {
                                                                    updateUser({ id: u.id, isActive: !u.isActive });
                                                                    setActiveMenu(null);
                                                                }}
                                                                disabled={isPending}
                                                            >
                                                                {u.isActive ? "Deactivate Account" : "Activate Account"}
                                                            </button>
                                                            {u.role !== "ADMIN" && (
                                                                <button
                                                                    className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium dark:text-gray-200"
                                                                    onClick={() => {
                                                                        const nextRole = u.role === "STUDENT" ? "LECTURER" : "STUDENT";
                                                                        updateUser({ id: u.id, role: nextRole });
                                                                        setActiveMenu(null);
                                                                    }}
                                                                    disabled={isPending}
                                                                >
                                                                    Change to {u.role === "STUDENT" ? "Lecturer" : "Student"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
