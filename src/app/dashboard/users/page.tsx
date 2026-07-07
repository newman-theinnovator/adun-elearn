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
    UserPlus,
    KeyRound,
    Copy,
    Check,
    Pencil,
    Eye,
    Award,
    Users as UsersIcon,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { MATRIC_NUMBER_REGEX, MATRIC_NUMBER_FORMAT_HINT } from "@/lib/validators";

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

type UserUpdateInput = {
    id: string;
    role?: string;
    isActive?: boolean;
    firstName?: string;
    lastName?: string;
    email?: string;
    level?: number | null;
    matricNumber?: string;
    staffId?: string;
};

function useUpdateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async ({ id, ...data }: UserUpdateInput) => {
            const res = await fetch(`/api/users/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to update user");
            }
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

function useUserProfile(userId: string | null) {
    return useQuery<any>({
        queryKey: ["admin", "user-profile", userId],
        queryFn: async () => {
            const res = await fetch(`/api/users/${userId}/profile`);
            if (!res.ok) throw new Error("Failed to fetch user profile");
            return res.json();
        },
        enabled: !!userId,
    });
}

type NewUserInput = {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    level?: number;
    matricNumber?: string;
    staffId?: string;
};

function useCreateUser() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: async (data: NewUserInput) => {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create user");
            }
            return res.json();
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "users"] }),
    });
}

function useResetPassword() {
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await fetch(`/api/users/${id}/reset-password`, { method: "POST" });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to reset password");
            }
            return res.json() as Promise<{ tempPassword: string }>;
        },
    });
}

function ResetPasswordDialog({
    user,
    onOpenChange,
}: {
    user: UserRecord | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [tempPassword, setTempPassword] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const { mutate: resetPassword, isPending, error } = useResetPassword();

    const handleClose = (next: boolean) => {
        if (!next) {
            setTempPassword(null);
            setCopied(false);
        }
        onOpenChange(next);
    };

    const handleConfirm = () => {
        if (!user) return;
        resetPassword(user.id, {
            onSuccess: (data) => setTempPassword(data.tempPassword),
        });
    };

    const handleCopy = () => {
        if (!tempPassword) return;
        navigator.clipboard.writeText(tempPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Dialog open={!!user} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Reset Password</DialogTitle>
                    <DialogDescription>
                        {tempPassword
                            ? "A new temporary password has been generated and emailed to the account."
                            : `Generate a new temporary password for ${user?.firstName} ${user?.lastName}? Their current password will stop working immediately.`}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 p-5">
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error.message}
                        </p>
                    )}
                    {tempPassword && (
                        <div>
                            <Label className="mb-2 normal-case">Temporary Password</Label>
                            <div className="flex items-center gap-2">
                                <code className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 font-mono text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                                    {tempPassword}
                                </code>
                                <button
                                    type="button"
                                    onClick={handleCopy}
                                    aria-label="Copy temporary password"
                                    className="rounded-lg border border-gray-200 p-2.5 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
                                >
                                    {copied ? (
                                        <Check className="h-4 w-4 text-emerald-600" />
                                    ) : (
                                        <Copy className="h-4 w-4 text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter className="-mx-5 mt-2 -mb-5">
                    {tempPassword ? (
                        <button
                            type="button"
                            onClick={() => handleClose(false)}
                            className="bg-navy-800 hover:bg-navy-700 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all"
                        >
                            Done
                        </button>
                    ) : (
                        <>
                            <button
                                type="button"
                                onClick={() => handleClose(false)}
                                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={isPending}
                                className="bg-navy-800 hover:bg-navy-700 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                            >
                                {isPending ? "Resetting…" : "Reset Password"}
                            </button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function CreateUserDialog({
    open,
    onOpenChange,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("STUDENT");
    const [level, setLevel] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [staffId, setStaffId] = useState("");
    const [error, setError] = useState("");

    const { mutate: createUser, isPending } = useCreateUser();

    const reset = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setRole("STUDENT");
        setLevel("");
        setMatricNumber("");
        setStaffId("");
        setError("");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (matricNumber && !MATRIC_NUMBER_REGEX.test(matricNumber)) {
            setError(`Matric number must follow the format ${MATRIC_NUMBER_FORMAT_HINT}`);
            return;
        }
        createUser(
            {
                firstName,
                lastName,
                email,
                role,
                level: level ? Number(level) : undefined,
                matricNumber: matricNumber || undefined,
                staffId: staffId || undefined,
            },
            {
                onSuccess: () => {
                    reset();
                    onOpenChange(false);
                },
                onError: (err: Error) => setError(err.message),
            }
        );
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) reset();
                onOpenChange(next);
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create User</DialogTitle>
                    <DialogDescription>
                        A temporary password will be emailed to the new account.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="new-user-first-name" className="mb-2 normal-case">
                                First Name
                            </Label>
                            <Input
                                id="new-user-first-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="new-user-last-name" className="mb-2 normal-case">
                                Last Name
                            </Label>
                            <Input
                                id="new-user-last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="new-user-email" className="mb-2 normal-case">
                            Email
                        </Label>
                        <Input
                            id="new-user-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@adun.edu.ng or any real email address"
                            required
                        />
                        <p className="mt-1.5 text-xs text-gray-400">
                            Any real address works — e.g. Gmail — the temporary password is sent
                            there.
                        </p>
                    </div>
                    <div>
                        <Label htmlFor="new-user-role" className="mb-2 normal-case">
                            Role
                        </Label>
                        <Select value={role} onValueChange={setRole}>
                            <SelectTrigger id="new-user-role">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STUDENT">Student</SelectItem>
                                <SelectItem value="LECTURER">Lecturer</SelectItem>
                                <SelectItem value="ADMIN">Admin</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {role === "STUDENT" && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="new-user-level" className="mb-2 normal-case">
                                    Level
                                </Label>
                                <Input
                                    id="new-user-level"
                                    type="number"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    placeholder="100–400"
                                />
                            </div>
                            <div>
                                <Label htmlFor="new-user-matric" className="mb-2 normal-case">
                                    Matric Number
                                </Label>
                                <Input
                                    id="new-user-matric"
                                    value={matricNumber}
                                    onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                                    placeholder="ADUN/FS/SEN/22/041"
                                />
                            </div>
                        </div>
                    )}
                    {role === "STUDENT" && (
                        <p className="-mt-2 text-xs text-gray-400">
                            Format: {MATRIC_NUMBER_FORMAT_HINT}
                        </p>
                    )}
                    {role === "LECTURER" && (
                        <div>
                            <Label htmlFor="new-user-staff-id" className="mb-2 normal-case">
                                Staff ID
                            </Label>
                            <Input
                                id="new-user-staff-id"
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                            />
                        </div>
                    )}
                    <DialogFooter className="-mx-5 mt-2 -mb-5">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !firstName || !lastName || !email}
                            className="bg-navy-800 hover:bg-navy-700 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                        >
                            {isPending ? "Creating…" : "Create User"}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function EditUserDialog({
    user,
    onOpenChange,
}: {
    user: UserRecord | null;
    onOpenChange: (open: boolean) => void;
}) {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [level, setLevel] = useState("");
    const [matricNumber, setMatricNumber] = useState("");
    const [staffId, setStaffId] = useState("");
    const [error, setError] = useState("");

    const { mutate: updateUser, isPending } = useUpdateUser();

    const hydrate = (u: UserRecord) => {
        setFirstName(u.firstName);
        setLastName(u.lastName);
        setEmail(u.email);
        setLevel(u.level ? String(u.level) : "");
        setMatricNumber(u.matricNumber || "");
        setStaffId(u.staffId || "");
        setError("");
    };

    // Track the last hydrated user id so we re-hydrate exactly once per open
    const [hydratedFor, setHydratedFor] = useState<string | null>(null);
    if (user && hydratedFor !== user.id) {
        hydrate(user);
        setHydratedFor(user.id);
    }
    if (!user && hydratedFor !== null) {
        setHydratedFor(null);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setError("");
        if (matricNumber && !MATRIC_NUMBER_REGEX.test(matricNumber)) {
            setError(`Matric number must follow the format ${MATRIC_NUMBER_FORMAT_HINT}`);
            return;
        }
        updateUser(
            {
                id: user.id,
                firstName,
                lastName,
                email,
                level: user.role === "STUDENT" ? (level ? Number(level) : null) : undefined,
                matricNumber: user.role === "STUDENT" ? matricNumber : undefined,
                staffId: user.role === "LECTURER" ? staffId : undefined,
            },
            {
                onSuccess: () => onOpenChange(false),
                onError: (err: Error) => setError(err.message),
            }
        );
    };

    return (
        <Dialog open={!!user} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update {user?.firstName} {user?.lastName}&apos;s account details.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-5">
                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {error}
                        </p>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="edit-user-first-name" className="mb-2 normal-case">
                                First Name
                            </Label>
                            <Input
                                id="edit-user-first-name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="edit-user-last-name" className="mb-2 normal-case">
                                Last Name
                            </Label>
                            <Input
                                id="edit-user-last-name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="edit-user-email" className="mb-2 normal-case">
                            Email
                        </Label>
                        <Input
                            id="edit-user-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {user?.role === "STUDENT" && (
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <Label htmlFor="edit-user-level" className="mb-2 normal-case">
                                    Level
                                </Label>
                                <Input
                                    id="edit-user-level"
                                    type="number"
                                    value={level}
                                    onChange={(e) => setLevel(e.target.value)}
                                    placeholder="100–400"
                                />
                            </div>
                            <div>
                                <Label htmlFor="edit-user-matric" className="mb-2 normal-case">
                                    Matric Number
                                </Label>
                                <Input
                                    id="edit-user-matric"
                                    value={matricNumber}
                                    onChange={(e) => setMatricNumber(e.target.value.toUpperCase())}
                                    placeholder="ADUN/FS/SEN/22/041"
                                />
                            </div>
                        </div>
                    )}
                    {user?.role === "STUDENT" && (
                        <p className="-mt-2 text-xs text-gray-400">
                            Format: {MATRIC_NUMBER_FORMAT_HINT}
                        </p>
                    )}
                    {user?.role === "LECTURER" && (
                        <div>
                            <Label htmlFor="edit-user-staff-id" className="mb-2 normal-case">
                                Staff ID
                            </Label>
                            <Input
                                id="edit-user-staff-id"
                                value={staffId}
                                onChange={(e) => setStaffId(e.target.value)}
                            />
                        </div>
                    )}
                    <DialogFooter className="-mx-5 mt-2 -mb-5">
                        <button
                            type="button"
                            onClick={() => onOpenChange(false)}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !firstName || !lastName || !email}
                            className="bg-navy-800 hover:bg-navy-700 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
                        >
                            {isPending ? "Saving…" : "Save Changes"}
                        </button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function ProfileDialog({
    userId,
    onOpenChange,
}: {
    userId: string | null;
    onOpenChange: (open: boolean) => void;
}) {
    const { data, isLoading } = useUserProfile(userId);

    const gradeVariant = (grade: string): "success" | "info" | "warning" | "destructive" => {
        if (grade?.startsWith("A")) return "success";
        if (grade?.startsWith("B")) return "info";
        if (grade?.startsWith("C")) return "warning";
        return "destructive";
    };

    return (
        <Dialog open={!!userId} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>
                        {data?.user ? `${data.user.firstName} ${data.user.lastName}` : "Profile"}
                    </DialogTitle>
                    <DialogDescription>
                        {data?.user?.role === "STUDENT" && data.user.matricNumber}
                        {data?.user?.role === "LECTURER" && data.user.staffId}
                        {data?.user?.role === "ADMIN" && data.user.email}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
                    {isLoading || !data ? (
                        <div className="space-y-3">
                            <Skeleton className="h-20 w-full rounded-xl" />
                            <Skeleton className="h-40 w-full rounded-xl" />
                        </div>
                    ) : data.user.role === "LECTURER" ? (
                        <div>
                            <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                                <BookOpen className="h-4 w-4 text-blue-500" /> Courses Teaching (
                                {data.coursesTeaching?.length || 0})
                            </h4>
                            <div className="space-y-2">
                                {(data.coursesTeaching || []).map((c: any) => (
                                    <div
                                        key={c.id}
                                        className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm dark:border-gray-700"
                                    >
                                        <div>
                                            <p className="font-semibold dark:text-white">
                                                {c.code} — {c.title}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {c.semester} Semester • {c.level} Level • {c.unit}{" "}
                                                Unit{c.unit === 1 ? "" : "s"}
                                            </p>
                                        </div>
                                        <Badge variant="info">
                                            <UsersIcon className="h-3 w-3" />
                                            {c._count?.enrollments || 0}
                                        </Badge>
                                    </div>
                                ))}
                                {(data.coursesTeaching || []).length === 0 && (
                                    <p className="py-6 text-center text-sm text-gray-400">
                                        Not assigned to any courses yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : data.user.role === "ADMIN" ? (
                        <p className="py-6 text-center text-sm text-gray-400">
                            Administrator accounts don&apos;t have academic records.
                        </p>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                <div className="rounded-xl border border-gray-100 p-3 text-center dark:border-gray-700">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {data.summary?.cgpa}
                                    </p>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                        CGPA
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 p-3 text-center dark:border-gray-700">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {data.summary?.predictedGrade}
                                    </p>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                        Predicted
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 p-3 text-center dark:border-gray-700">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {data.summary?.loginCount}
                                    </p>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                        Logins
                                    </p>
                                </div>
                                <div className="rounded-xl border border-gray-100 p-3 text-center dark:border-gray-700">
                                    <p className="text-2xl font-black text-gray-900 dark:text-white">
                                        {data.summary?.contentCompletionRate}%
                                    </p>
                                    <p className="text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
                                        Content Done
                                    </p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                                    <BookOpen className="h-4 w-4 text-blue-500" /> Enrolled Courses
                                    ({data.enrollments?.length || 0})
                                </h4>
                                <div className="space-y-2">
                                    {(data.enrollments || []).map((e: any) => (
                                        <div
                                            key={e.id}
                                            className="flex items-center justify-between rounded-xl border border-gray-100 p-3 text-sm dark:border-gray-700"
                                        >
                                            <p className="font-semibold dark:text-white">
                                                {e.course.code} — {e.course.title}
                                            </p>
                                            <span className="text-xs text-gray-400 capitalize">
                                                {e.course.semester} Semester • {e.course.level}L
                                            </span>
                                        </div>
                                    ))}
                                    {(data.enrollments || []).length === 0 && (
                                        <p className="py-4 text-center text-sm text-gray-400">
                                            Not enrolled in any courses.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-3 flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                                    <Award className="h-4 w-4 text-emerald-500" /> Grade History
                                </h4>
                                <div className="space-y-4">
                                    {(data.gradesBySemester || []).map((sem: any) => (
                                        <div key={sem.semester}>
                                            <p className="mb-2 text-xs font-bold tracking-wider text-gray-400 uppercase">
                                                {sem.semester}
                                            </p>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                                                        <TableHead>Course</TableHead>
                                                        <TableHead className="text-center">
                                                            Total
                                                        </TableHead>
                                                        <TableHead className="text-center">
                                                            Grade
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {sem.grades.map((g: any) => (
                                                        <TableRow key={g.id}>
                                                            <TableCell>
                                                                <p className="font-semibold dark:text-white">
                                                                    {g.course.code}
                                                                </p>
                                                                <p className="text-xs text-gray-400">
                                                                    {g.course.title}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="text-center font-bold dark:text-white">
                                                                {g.total ?? "—"}
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge
                                                                    variant={gradeVariant(g.grade)}
                                                                >
                                                                    {g.grade || "—"}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    ))}
                                    {(data.gradesBySemester || []).length === 0 && (
                                        <p className="py-4 text-center text-sm text-gray-400">
                                            No grade records yet.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
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
    const [createOpen, setCreateOpen] = useState(false);
    const [resetPasswordUser, setResetPasswordUser] = useState<UserRecord | null>(null);
    const [editUser, setEditUser] = useState<UserRecord | null>(null);
    const [profileUserId, setProfileUserId] = useState<string | null>(null);

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
                <button
                    onClick={() => setCreateOpen(true)}
                    className="bg-navy-800 hover:bg-navy-700 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                    <UserPlus className="h-4 w-4" /> Create User
                </button>
            </div>

            <CreateUserDialog open={createOpen} onOpenChange={setCreateOpen} />
            <ResetPasswordDialog
                user={resetPasswordUser}
                onOpenChange={(open) => !open && setResetPasswordUser(null)}
            />
            <EditUserDialog user={editUser} onOpenChange={(open) => !open && setEditUser(null)} />
            <ProfileDialog
                userId={profileUserId}
                onOpenChange={(open) => !open && setProfileUserId(null)}
            />

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
                                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                onClick={() => {
                                                                    setEditUser(u);
                                                                    setActiveMenu(null);
                                                                }}
                                                            >
                                                                <Pencil className="h-3.5 w-3.5" />
                                                                Edit Details
                                                            </button>
                                                            {u.role !== "ADMIN" && (
                                                                <button
                                                                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                    onClick={() => {
                                                                        setProfileUserId(u.id);
                                                                        setActiveMenu(null);
                                                                    }}
                                                                >
                                                                    <Eye className="h-3.5 w-3.5" />
                                                                    View Profile
                                                                </button>
                                                            )}
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
                                                            <button
                                                                className="flex w-full items-center gap-2 px-4 py-2.5 text-left font-medium transition-colors hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                                                                onClick={() => {
                                                                    setResetPasswordUser(u);
                                                                    setActiveMenu(null);
                                                                }}
                                                            >
                                                                <KeyRound className="h-3.5 w-3.5" />
                                                                Reset Password
                                                            </button>
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
