"use client";

import { useState } from "react";
import { useCreatePost } from "@/hooks/useFeatures";
import { useCourses } from "@/hooks/useCourses";
import { Send } from "lucide-react";
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

export function NewPostModal({
    open,
    onClose,
    defaultCourseId,
    lockCourse = false,
}: {
    open: boolean;
    onClose: () => void;
    defaultCourseId: string;
    lockCourse?: boolean;
}) {
    const { data: courses } = useCourses();
    const { mutate: createPost, isPending } = useCreatePost();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");

    // Completed-semester courses are archived — no new discussions there.
    const availableCourses = (courses || []).filter((c: any) => c.semester !== "First");
    const isDefaultArchived = !availableCourses.some((c: any) => c.id === defaultCourseId);
    const [courseId, setCourseId] = useState(
        defaultCourseId !== "all" && !isDefaultArchived ? defaultCourseId : ""
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !body.trim() || !courseId) return;
        createPost(
            { title, body, courseId },
            {
                onSuccess: () => {
                    setTitle("");
                    setBody("");
                    onClose();
                },
            }
        );
    };

    const activeCourse = (courses || []).find((c: any) => c.id === courseId);

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
                        {lockCourse ? (
                            <p className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-200">
                                {activeCourse
                                    ? `${activeCourse.code} — ${activeCourse.title}`
                                    : "This course"}
                            </p>
                        ) : (
                            <Select value={courseId} onValueChange={setCourseId}>
                                <SelectTrigger id="new-post-course" aria-label="Select a course">
                                    <SelectValue placeholder="Select a course…" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableCourses.map((c: any) => (
                                        <SelectItem key={c.id} value={c.id}>
                                            {c.code} — {c.title}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
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
                            className="bg-navy-800 hover:bg-navy-700 flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all disabled:opacity-50"
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
