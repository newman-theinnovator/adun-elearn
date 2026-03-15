"use client";

import { useState } from "react";
import { useAuth } from "@/providers/AuthProvider";
import { useForumPosts, useCreateReply, useForumThread, useCreatePost } from "@/hooks/useFeatures";
import { useCourses } from "@/hooks/useCourses";
import { MessageSquare, ThumbsUp, Send, Plus, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// ─── New Discussion Modal ────────────────────────────────────────────────────
function NewPostModal({
    onClose,
    defaultCourseId,
}: {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-bold text-lg dark:text-white">New Discussion</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors rounded-lg p-1 hover:bg-gray-100 dark:hover:bg-gray-700">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Course</label>
                        <select
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        >
                            <option value="">Select a course…</option>
                            {(courses || []).map((c: any) => (
                                <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="What would you like to discuss?"
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">Body</label>
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            required
                            rows={5}
                            placeholder="Share your question or thoughts in detail…"
                            className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                        />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isPending || !title.trim() || !body.trim() || !courseId}
                            className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md hover:bg-blue-800 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                            {isPending ? "Posting…" : <><Send className="w-4 h-4" /> Post Discussion</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ─── Thread View ─────────────────────────────────────────────────────────────
function ThreadView({ threadId, onBack }: { threadId: string; onBack: () => void }) {
    const { data: threadData, isLoading: threadLoading } = useForumThread(threadId);
    const { mutate: createReply, isPending: replying } = useCreateReply();
    const [replyContent, setReplyContent] = useState("");

    if (threadLoading || !threadData) {
        return <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-32 w-full ml-8 rounded-2xl" /></div>;
    }

    const handleReply = () => {
        if (!replyContent.trim()) return;
        createReply({ threadId, body: replyContent }, { onSuccess: () => setReplyContent("") });
    };

    return (
        <div className="max-w-3xl mx-auto space-y-4">
            <button onClick={onBack} className="text-sm text-blue-600 dark:text-blue-400 font-bold hover:underline">
                ← Back to Forum
            </button>

            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 sm:p-6 mb-6">
                <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${threadData.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}>
                        {threadData.author.firstName?.[0] || ""}{threadData.author.lastName?.[0] || "U"}
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-bold dark:text-white text-base">{threadData.author.firstName} {threadData.author.lastName}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase ${threadData.author.role === "LECTURER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{threadData.author.role}</span>
                            <span className="text-xs text-gray-400 dark:text-gray-500">• {new Date(threadData.createdAt).toLocaleDateString("en-NG")}</span>
                        </div>
                        <h2 className="text-xl font-bold mt-3 dark:text-white leading-tight">{threadData.title}</h2>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-4 whitespace-pre-line leading-relaxed">{threadData.body}</p>

                        <div className="flex items-center gap-4 mt-6 text-sm text-gray-500 font-medium">
                            <button className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"><ThumbsUp className="w-4 h-4" /> 0 Likes</button>
                            <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {threadData.replies?.length || 0} Replies</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-600 dark:text-gray-300 text-sm ml-2">Discussion ({threadData.replies?.length || 0})</h3>

                <div className="space-y-3 pl-3 sm:pl-8 border-l-2 border-gray-100 dark:border-gray-700">
                    {threadData.replies?.map((r: any) => (
                        <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 relative animate-fade-in-up">
                            <div className="absolute -left-3 sm:-left-[34px] top-8 w-6 border-b-2 border-gray-100 dark:border-gray-700" />
                            <div className="flex items-start gap-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-sm ${r.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}>
                                    {r.author.firstName?.[0] || ""}{r.author.lastName?.[0] || "U"}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <span className="font-bold text-sm dark:text-white">{r.author.firstName} {r.author.lastName}</span>
                                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold tracking-wider uppercase ${r.author.role === "LECTURER" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"}`}>{r.author.role}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 mt-1 leading-relaxed">{r.body || r.content}</p>
                                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-medium tracking-wide">
                                        <button className="flex items-center gap-1 hover:text-blue-600 transition-colors"><ThumbsUp className="w-3.5 h-3.5" /> Like</button>
                                        <span>• {new Date(r.createdAt).toLocaleDateString("en-NG")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4 sm:p-5 relative mt-6">
                        <div className="absolute -left-3 sm:-left-[34px] top-8 w-6 border-b-2 border-gray-100 dark:border-gray-700" />
                        <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-4 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl text-sm focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                            rows={3}
                            placeholder="Join the conversation..."
                        />
                        <div className="flex justify-end mt-3">
                            <button
                                onClick={handleReply}
                                disabled={replying || !replyContent.trim()}
                                className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {replying ? "Posting..." : <><Send className="w-4 h-4" /> Post Reply</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Forum Page ───────────────────────────────────────────────────────────────
export default function ForumPage() {
    const { data: session } = useAuth();
    const user = session?.user as any;
    const [selectedCourse] = useState("all");
    const { data: forumPosts, isLoading } = useForumPosts(selectedCourse);

    const [selectedPost, setSelectedPost] = useState<string | null>(null);
    const [showNewPost, setShowNewPost] = useState(false);

    if (isLoading || !forumPosts) {
        return (
            <div className="space-y-6 max-w-4xl mx-auto">
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
            {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} defaultCourseId={selectedCourse} />}

            <div className="space-y-6 max-w-4xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold dark:text-white">Discussion Forum</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{forumPosts.length} active discussions</p>
                    </div>
                    <button
                        onClick={() => setShowNewPost(true)}
                        className="bg-blue-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 w-full sm:w-auto shadow-md transition-all hover:shadow-lg flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> New Discussion
                    </button>
                </div>

                <div className="space-y-4">
                    {forumPosts.length === 0 ? (
                        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                            <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-1">No Discussions Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Be the first to start a conversation with your peers.</p>
                            <button
                                onClick={() => setShowNewPost(true)}
                                className="bg-blue-900 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-blue-800 shadow-md transition-all inline-flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Start a Discussion
                            </button>
                        </div>
                    ) : (
                        forumPosts.map((p: any) => (
                            <div
                                key={p.id}
                                onClick={() => setSelectedPost(p.id)}
                                className={`bg-white dark:bg-gray-800 rounded-xl border shadow-sm p-5 sm:p-6 cursor-pointer hover:shadow-md transition-all hover:-translate-y-0.5 group ${p.isPinned ? "border-amber-200 dark:border-amber-700/50 bg-amber-50/30 dark:bg-amber-900/10" : "border-gray-100 dark:border-gray-700"}`}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm ${p.author.role === "LECTURER" ? "bg-blue-500" : "bg-emerald-500"}`}>
                                        {p.author.firstName?.[0] || ""}{p.author.lastName?.[0] || "U"}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                                            {p.isPinned && <span className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 px-2 py-0.5 rounded font-bold tracking-wider uppercase">📌 Pinned</span>}
                                            <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{p.author.firstName} {p.author.lastName}</span>
                                            <span className="text-[10px] text-gray-400">• {new Date(p.createdAt).toLocaleDateString("en-NG")}</span>
                                        </div>
                                        <h3 className="font-bold text-lg mt-1 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">{p.title}</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2 leading-relaxed">{p.body}</p>

                                        <div className="flex items-center gap-5 mt-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                            <span className="flex items-center gap-1.5 group-hover:text-blue-500 transition-colors"><MessageSquare className="w-4 h-4" /> {p._count?.replies || p.replies?.length || 0} replies</span>
                                            <span className="flex items-center gap-1.5"><ThumbsUp className="w-4 h-4" /> {p.likes || 0} likes</span>
                                            {p.course && <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">{p.course.code}</span>}
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
