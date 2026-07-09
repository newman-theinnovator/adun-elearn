"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import {
    useForumPosts,
    useCreateReply,
    useForumThread,
    useLikePost,
    useLikeReply,
    usePinThread,
    useDeletePost,
    useDeleteReply,
} from "@/hooks/useFeatures";
import { useCourses } from "@/hooks/useCourses";
import { MessageSquare, ThumbsUp, Send, Plus, Pin, Trash2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NewPostModal } from "@/components/forum/NewPostModal";

// ─── Thread Modal ────────────────────────────────────────────────────────────
function ThreadModal({ threadId, onClose }: { threadId: string | null; onClose: () => void }) {
    const { data: session } = useAuth();
    const currentUser = session?.user as any;
    const { data: threadData, isLoading: threadLoading } = useForumThread(threadId || "");
    const { mutate: createReply, isPending: replying } = useCreateReply();
    const { mutate: likePost } = useLikePost();
    const { mutate: likeReply } = useLikeReply();
    const { mutate: pinThread, isPending: pinning, error: pinError } = usePinThread();
    const { mutate: deletePost, isPending: deletingPost } = useDeletePost();
    const { mutate: deleteReply } = useDeleteReply();
    const [replyContent, setReplyContent] = useState("");
    const [likedPost, setLikedPost] = useState(false);
    const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());

    const canModerate = (authorId: string) =>
        currentUser?.role === "ADMIN" || currentUser?.id === authorId;

    if (!threadId) return null;

    if (threadLoading || !threadData) {
        return (
            <Dialog open={!!threadId} onOpenChange={(open) => !open && onClose()}>
                <DialogContent className="max-w-2xl">
                    <div className="space-y-4 p-5">
                        <Skeleton className="h-32 w-full rounded-2xl" />
                        <Skeleton className="ml-8 h-24 w-full rounded-2xl" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    const handleReply = () => {
        if (!replyContent.trim()) return;
        createReply({ threadId, body: replyContent }, { onSuccess: () => setReplyContent("") });
    };

    const handleDeletePost = () => {
        if (!confirm("Delete this discussion and all its replies?")) return;
        deletePost(threadId, { onSuccess: onClose });
    };

    return (
        <Dialog open={!!threadId} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                <DialogHeader className="sr-only">
                    <DialogTitle>{threadData.title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 p-5 sm:p-6">
                    {pinError && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {pinError.message}
                        </p>
                    )}

                    <Card className="mb-2 rounded-xl border-0 p-0 shadow-none">
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
                                        variant={
                                            threadData.author.role === "LECTURER"
                                                ? "info"
                                                : "success"
                                        }
                                        className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                    >
                                        {threadData.author.role}
                                    </Badge>
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                        •{" "}
                                        {new Date(threadData.createdAt).toLocaleDateString("en-NG")}
                                    </span>
                                    {threadData.isPinned && (
                                        <Badge
                                            variant="warning"
                                            className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase"
                                        >
                                            📌 Pinned
                                        </Badge>
                                    )}
                                    <div className="ml-auto flex items-center gap-2">
                                        {(currentUser?.role === "LECTURER" ||
                                            currentUser?.role === "ADMIN") && (
                                            <button
                                                onClick={() => pinThread(threadId)}
                                                disabled={pinning}
                                                className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold text-gray-500 transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                                            >
                                                <Pin className="h-3 w-3" />
                                                {threadData.isPinned ? "Unpin" : "Pin"}
                                            </button>
                                        )}
                                        {canModerate(threadData.authorId) && (
                                            <button
                                                onClick={handleDeletePost}
                                                disabled={deletingPost}
                                                className="flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                                Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <h2 className="mt-3 text-xl leading-tight font-bold dark:text-white">
                                    {threadData.title}
                                </h2>
                                <p className="mt-4 text-sm leading-relaxed whitespace-pre-line text-gray-700 dark:text-gray-300">
                                    {threadData.body}
                                </p>

                                <div className="mt-6 flex items-center gap-4 text-sm font-medium text-gray-500">
                                    <button
                                        onClick={() => {
                                            if (likedPost) return;
                                            setLikedPost(true);
                                            likePost(threadId);
                                        }}
                                        disabled={likedPost}
                                        className={`flex items-center gap-1.5 transition-colors ${likedPost ? "text-blue-600" : "hover:text-blue-600"}`}
                                    >
                                        <ThumbsUp className="h-4 w-4" /> {threadData.likes || 0}{" "}
                                        Likes
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
                                                        r.author.role === "LECTURER"
                                                            ? "info"
                                                            : "success"
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
                                                <button
                                                    onClick={() => {
                                                        if (likedReplies.has(r.id)) return;
                                                        setLikedReplies((prev) =>
                                                            new Set(prev).add(r.id)
                                                        );
                                                        likeReply({ replyId: r.id, threadId });
                                                    }}
                                                    disabled={likedReplies.has(r.id)}
                                                    className={`flex items-center gap-1 transition-colors ${likedReplies.has(r.id) ? "text-blue-600" : "hover:text-blue-600"}`}
                                                >
                                                    <ThumbsUp className="h-3.5 w-3.5" />{" "}
                                                    {r.likes || 0} Like
                                                    {r.likes === 1 ? "" : "s"}
                                                </button>
                                                <span>
                                                    •{" "}
                                                    {new Date(r.createdAt).toLocaleDateString(
                                                        "en-NG"
                                                    )}
                                                </span>
                                                {canModerate(r.authorId) && (
                                                    <button
                                                        onClick={() => {
                                                            if (!confirm("Delete this reply?"))
                                                                return;
                                                            deleteReply({
                                                                replyId: r.id,
                                                                threadId,
                                                            });
                                                        }}
                                                        className="ml-auto flex items-center gap-1 text-red-500 transition-colors hover:text-red-600"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" /> Delete
                                                    </button>
                                                )}
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
                                        className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
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
            </DialogContent>
        </Dialog>
    );
}

// ─── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
    useAuth();
    const [selectedCourse, setSelectedCourse] = useState("all");
    const { data: forumPosts, isLoading } = useForumPosts(selectedCourse);
    const { data: courses } = useCourses();

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

    return (
        <>
            <ThreadModal threadId={selectedPost} onClose={() => setSelectedPost(null)} />
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
                    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger aria-label="Filter by course" className="sm:w-56">
                                <SelectValue placeholder="All Courses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Courses</SelectItem>
                                {(courses || []).map((c: any) => (
                                    <SelectItem key={c.id} value={c.id}>
                                        {c.code}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <button
                            onClick={() => setShowNewPost(true)}
                            className="bg-navy-800 hover:bg-navy-700 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:shadow-lg sm:w-auto"
                        >
                            <Plus className="h-4 w-4" /> New Discussion
                        </button>
                    </div>
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
                                className="bg-navy-800 hover:bg-navy-700 inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all"
                            >
                                <Plus className="h-4 w-4" /> Start a Discussion
                            </button>
                        </Card>
                    ) : (
                        forumPosts.map((p: any) => {
                            // A discussion tied to a completed-semester course is
                            // stale context — dim it the same way completed
                            // courses are dimmed, so current-semester threads
                            // stand out at a glance.
                            const isCompleted = p.course?.semester === "First";

                            return (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedPost(p.id)}
                                    className={`group cursor-pointer rounded-xl border bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6 dark:bg-gray-800 ${p.isPinned ? "border-amber-200 bg-amber-50/30 dark:border-amber-700/50 dark:bg-amber-900/10" : "border-gray-100 dark:border-gray-700"} ${isCompleted ? "opacity-60 hover:opacity-100" : ""}`}
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
                                                    {new Date(p.createdAt).toLocaleDateString(
                                                        "en-NG"
                                                    )}
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
                                                {isCompleted && (
                                                    <span className="rounded bg-gray-100 px-2 py-0.5 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
                                                        Completed
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
