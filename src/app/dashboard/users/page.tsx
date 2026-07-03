"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Search,
    UserCheck,
    UserX,
    Shield,
    GraduationCap,
    BookOpen,
    MoreVertical,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

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
        <div className="mx-auto max-w-6xl space-y-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white">User Management</h1>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {users?.length || 0} total accounts
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <label htmlFor="user-search" className="sr-only">
                        Search users
                    </label>
                    <Input
                        id="user-search"
                        type="text"
                        placeholder="Search by name, email, matric or staff ID…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select
                    value={roleFilter || "ALL"}
                    onValueChange={(v) => setRoleFilter(v === "ALL" ? "" : v)}
                >
                    <SelectTrigger aria-label="Filter by role" className="sm:w-48">
                        <SelectValue placeholder="All Roles" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">All Roles</SelectItem>
                        <SelectItem value="STUDENT">Students</SelectItem>
                        <SelectItem value="LECTURER">Lecturers</SelectItem>
                        <SelectItem value="ADMIN">Admins</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <Card>
                {isLoading ? (
                    <div className="space-y-3 p-6">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                <TableHead>User</TableHead>
                                <TableHead>ID / Matric</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filtered.length === 0 ? (
                                <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                    <TableCell
                                        colSpan={5}
                                        className="py-10 text-center text-sm text-gray-400"
                                    >
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((u) => {
                                    const RoleIcon = ROLE_ICON[u.role] || Shield;
                                    return (
                                        <TableRow key={u.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${u.role === "STUDENT" ? "bg-emerald-500" : u.role === "LECTURER" ? "bg-blue-500" : "bg-purple-500"}`}
                                                    >
                                                        {u.firstName?.[0]}
                                                        {u.lastName?.[0]}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold dark:text-white">
                                                            {u.firstName} {u.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            {u.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-mono text-xs text-gray-500 dark:text-gray-400">
                                                {u.matricNumber || u.staffId || "—"}
                                                {u.level ? (
                                                    <span className="ml-1 text-gray-400">
                                                        ({u.level}L)
                                                    </span>
                                                ) : null}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant={
                                                        u.role === "STUDENT"
                                                            ? "success"
                                                            : u.role === "LECTURER"
                                                              ? "info"
                                                              : "purple"
                                                    }
                                                >
                                                    <RoleIcon className="h-3 w-3" />
                                                    {u.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    pill
                                                    variant={u.isActive ? "success" : "destructive"}
                                                    className="font-semibold"
                                                >
                                                    {u.isActive ? (
                                                        <UserCheck className="h-3 w-3" />
                                                    ) : (
                                                        <UserX className="h-3 w-3" />
                                                    )}
                                                    {u.isActive ? "Active" : "Inactive"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="relative">
                                                <div className="relative inline-block">
                                                    <button
                                                        onClick={() =>
                                                            setActiveMenu(
                                                                activeMenu === u.id ? null : u.id
                                                            )
                                                        }
                                                        aria-label={`Actions for ${u.firstName} ${u.lastName}`}
                                                        className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        <MoreVertical className="h-4 w-4 text-gray-400" />
                                                    </button>
                                                    {activeMenu === u.id && (
                                                        <div className="absolute right-0 z-10 mt-1 w-44 overflow-hidden rounded-xl border border-gray-100 bg-white text-xs shadow-lg dark:border-gray-700 dark:bg-gray-800">
                                                            <button
                                                                className="w-full px-4 py-2.5 text-left font-medium transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                onClick={() => {
                                                                    updateUser({
                                                                        id: u.id,
                                                                        isActive: !u.isActive,
                                                                    });
                                                                    setActiveMenu(null);
                                                                }}
                                                                disabled={isPending}
                                                            >
                                                                {u.isActive
                                                                    ? "Deactivate Account"
                                                                    : "Activate Account"}
                                                            </button>
                                                            {u.role !== "ADMIN" && (
                                                                <button
                                                                    className="w-full px-4 py-2.5 text-left font-medium transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                    onClick={() => {
                                                                        const nextRole =
                                                                            u.role === "STUDENT"
                                                                                ? "LECTURER"
                                                                                : "STUDENT";
                                                                        updateUser({
                                                                            id: u.id,
                                                                            role: nextRole,
                                                                        });
                                                                        setActiveMenu(null);
                                                                    }}
                                                                    disabled={isPending}
                                                                >
                                                                    Change to{" "}
                                                                    {u.role === "STUDENT"
                                                                        ? "Lecturer"
                                                                        : "Student"}
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}
