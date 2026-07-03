"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useForumPosts, useCreateReply, useForumThread, useCreatePost } from "@/hooks/useFeatures";
import { useCourses } from "@/hooks/useCourses";
import { MessageSquare, ThumbsUp, Send, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ─── New Discussion Modal ────────────────────────────────────────────────────
function NewPostModal({
    open,
    onClose,
    defaultCourseId,
}: {
    open: boolean;
    onClose: () => void;
    defaultCourseId: string;
}) {
    const { data: courses } = useCourses();
    const { mutate: createPost, isPending } = useCreatePost();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [courseId, setCourseId] = useState(defaultCourseId !== "all" ? defaultCourseId : "");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim() || !courseId) return;
        createPost({ title, body, courseId }, { onSuccess: onClose });
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(next) => {
                if (!next) onClose();
            }}
        >
            <DialogContent className="max-w-xl p-0">
                <DialogHeader className="px-6 py-4">
                    <DialogTitle>New Discussion</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 p-6">
                    <div>
                        <Label htmlFor="new-post-course" className="mb-2 normal-case">
                            Course
                        </Label>
                        <Select value={courseId} onValueChange={setCourseId}>
                            <SelectTrigger id="new-post-course" aria-label="Select a course">
                                <SelectValue placeholder="Select a course…" />
                            </SelectTrigger>
                            <SelectContent>
                                {(courses || []).map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.code} — {c.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="new-post-title" className="mb-2 normal-case">
                            Title
                        </Label>
                        <Input
                            id="new-post-title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="What would you like to discuss?"
                        />
                    </div>
                    <div>
                        <Label htmlFor="new-post-body" className="mb-2 normal-case">
                            Body
                        </Label>
                        <textarea
                            id="new-post-body"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            rows={5}
                            placeholder="Share your question or thoughts in detail…"
                            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !title.trim() || !body.trim() || !courseId}
                            className="flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 disabled:opacity-50"
                        >
                            {isPending ? (
                                "Posting…"
                            ) : (
                                <>
                                    <Send className="h-4 w-4" /> Post Discussion
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Thread View ─────────────────────────────────────────────────────────────
function ThreadView({ threadId, onBack }: { threadId: string; onBack: () => void }) {
    const { data: threadData, isLoading: threadLoading } = useForumThread(threadId);
    const { mutate: createReply, isPending: replying } = useCreateReply();
    const [replyContent, setReplyContent] = useState("");

    if (threadLoading || !threadData) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-2xl" />
                <Skeleton className="ml-8 h-32 w-full rounded-2xl" />
            </div>
        );
    }

    const handleReply = () => {
        if (!replyContent.trim()) return;
        createReply({ threadId, body: replyContent }, { onSuccess: () => setReplyContent("") });
    };

    return (
        <div className="mx-auto max-w-3xl space-y-4">
            <button
                onClick={onBack}
                className="text-sm font-bold text-blue-600 hover:underline dark:text-blue-400"
            >
                ← Back to Forum
            </button>

            <Card className="mb-6 rounded-xl p-5 sm:p-6">
                <div className="flex items-start gap-4">
                    <div
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${threadData.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}
                    >
                        {threadData.author.firstName?.[0] || ""}
                        {threadData.author.lastName?.[0] || "U"}
                    </div>
                    <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold dark:text-white">
                                {threadData.author.firstName} {threadData.author.lastName}
                            </span>
                            <Badge
                                pill
                                variant={threadData.author.role === "LECTURER" ? "info" : "success"}
                                className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                            >
                                {threadData.author.role}
                            </Badge>
                            <span className="text-xs text-gray-400 dark:text-gray-500">
                                • {new Date(threadData.createdAt).toLocaleDateString("en-NG")}
                            </span>
                        </div>
                        <h2 className="mt-3 text-xl leading-tight font-bold dark:text-white">
                            {threadData.title}
                        </h2>
                        <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                            {threadData.body}
                        </p>

                        <div className="mt-6 flex items-center gap-4 text-sm font-medium text-gray-500">
                            <button className="flex items-center gap-1.5 transition-colors hover:text-blue-600">
                                <ThumbsUp className="h-4 w-4" /> 0 Likes
                            </button>
                            <span className="flex items-center gap-1.5">
                                <MessageSquare className="h-4 w-4" />{" "}
                                {threadData.replies?.length || 0} Replies
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            <div className="space-y-4">
                <h3 className="ml-2 text-sm font-bold text-gray-600 dark:text-gray-300">
                    Discussion ({threadData.replies?.length || 0})
                </h3>

                <div className="space-y-3 border-l-2 border-gray-100 pl-3 sm:pl-8 dark:border-gray-700">
                    {threadData.replies?.map((r: any) => (
                        <Card
                            key={r.id}
                            className="animate-fade-in-up relative rounded-xl p-4 sm:p-5"
                        >
                            <div className="absolute top-8 -left-3 w-6 border-b-2 border-gray-100 sm:-left-[34px] dark:border-gray-700" />
                            <div className="flex items-start gap-4">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${r.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}
                                >
                                    {r.author.firstName?.[0] || ""}
                                    {r.author.lastName?.[0] || "U"}
                                </div>
                                <div className="flex-1">
                                    <div className="mb-1.5 flex items-center gap-2">
                                        <span className="text-sm font-bold dark:text-white">
                                            {r.author.firstName} {r.author.lastName}
                                        </span>
                                        <Badge
                                            pill
                                            variant={
                                                r.author.role === "LECTURER" ? "info" : "success"
                                            }
                                            className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                        >
                                            {r.author.role}
                                        </Badge>
                                    </div>
                                    <p className="mt-1 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                        {r.body || r.content}
                                    </p>
                                    <div className="mt-3 flex items-center gap-4 text-xs font-medium tracking-wide text-gray-500">
                                        <button className="flex items-center gap-1 transition-colors hover:text-blue-600">
                                            <ThumbsUp className="h-3.5 w-3.5" /> Like
                                        </button>
                                        <span>
                                            • {new Date(r.createdAt).toLocaleDateString("en-NG")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    <Card className="relative mt-6 rounded-xl p-4 sm:p-5">
                        <div className="absolute top-8 -left-3 w-6 border-b-2 border-gray-100 sm:-left-[34px] dark:border-gray-700" />
                        <label htmlFor="reply-body" className="sr-only">
                            Reply to this discussion
                        </label>
                        <textarea
                            id="reply-body"
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 p-4 text-sm font-medium transition-all focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                            rows={3}
                            placeholder="Join the conversation..."
                        />
                        <div className="mt-3 flex justify-end">
                            <button
                                onClick={handleReply}
                                disabled={replying || !replyContent.trim()}
                                className="flex items-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 disabled:opacity-50"
                            >
                                {replying ? (
                                    "Posting..."
                                ) : (
                                    <>
                                        <Send className="h-4 w-4" /> Post Reply
                                    </>
                                )}
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

// ─── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
    useAuth();
    const [selectedCourse] = useState("all");
    const { data: forumPosts, isLoading } = useForumPosts(selectedCourse);

    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [showNewPost, setShowNewPost] = useState(false);

    if (isLoading || !forumPosts) {
        return (
            <div className="mx-auto max-w-4xl space-y-6">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
                <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
        );
    }

    if (selectedPost) {
        return <ThreadView threadId={selectedPost} onBack={() => setSelectedPost(null)} />;
    }

    return (
        <>
            <NewPostModal
                open={showNewPost}
                onClose={() => setShowNewPost(false)}
                defaultCourseId={selectedCourse}
            />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Discussion Forum</h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {forumPosts.length} active discussions
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewPost(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-900 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800 hover:shadow-lg sm:w-auto"
                    >
                        <Plus className="h-4 w-4" /> New Discussion
                    </button>
                </div>

                <div className="space-y-4">
                    {forumPosts.length === 0 ? (
                        <Card className="py-12 text-center">
                            <MessageSquare className="mx-auto mb-4 h-16 w-16 text-gray-300 dark:text-gray-600" />
                            <h3 className="mb-1 text-lg font-bold text-gray-700 dark:text-gray-200">
                                No Discussions Yet
                            </h3>
                            <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
                                Be the first to start a conversation with your peers.
                            </p>
                            <button
                                onClick={() => setShowNewPost(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-blue-900 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-blue-800"
                            >
                                <Plus className="h-4 w-4" /> Start a Discussion
                            </button>
                        </Card>
                    ) : (
                        forumPosts.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPost(p.id)}
                                className={`group cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6 dark:bg-gray-800 ${p.isPinned ? "border-amber-200 bg-amber-50/30 dark:border-amber-700/50 dark:bg-amber-900/10" : "border-gray-100 dark:border-gray-700"}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm ${p.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}
                                    >
                                        {p.author.firstName?.[0] || ""}
                                        {p.author.lastName?.[0] || "U"}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="mb-1.5 flex flex-wrap items-center gap-2">
                                            {p.isPinned && (
                                                <Badge
                                                    variant="warning"
                                                    className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                                >
                                                    📌 Pinned
                                                </Badge>
                                            )}
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                                                {p.author.firstName} {p.author.lastName}
                                            </span>
                                            <span className="text-[10px] text-gray-400">
                                                •{" "}
                                                {new Date(p.createdAt).toLocaleDateString("en-NG")}
                                            </span>
                                        </div>
                                        <h3 className="mt-1 text-lg leading-tight font-bold transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                                            {p.title}
                                        </h3>
                                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                                            {p.body}
                                        </p>

                                        <div className="mt-4 flex items-center gap-5 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5 transition-colors group-hover:text-blue-500">
                                                <MessageSquare className="h-4 w-4" />{" "}
                                                {p._count?.replies || p.replies?.length || 0}{" "}
                                                replies
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <ThumbsUp className="h-4 w-4" /> {p.likes || 0}{" "}
                                                likes
                                            </span>
                                            {p.course && (
                                                <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                                    {p.course.code}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </>
    );
}
