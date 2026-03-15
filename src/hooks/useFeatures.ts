import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface ForumPost {
    id: string;
    title: string;
    body: string;
    author: { firstName: string; lastName: string; role: string; profileImage: string | null };
    createdAt: string;
    isPinned: boolean;
    _count: { replies: number };
}

export interface ForumThread extends ForumPost {
    replies: {
        id: string;
        body: string;
        createdAt: string;
        author: { firstName: string; lastName: string; role: string; profileImage: string | null };
    }[];
}

export function useForumPosts(courseId: string) {
    return useQuery<ForumPost[]>({
        queryKey: ["forum", "posts", courseId],
        queryFn: async () => {
            const res = await fetch(`/api/forum?courseId=${courseId}`);
            if (!res.ok) throw new Error("Failed to fetch forum posts");
            return res.json();
        },
        enabled: !!courseId,
    });
}

export function useForumThread(threadId: string) {
    return useQuery<ForumThread>({
        queryKey: ["forum", "thread", threadId],
        queryFn: async () => {
            const res = await fetch(`/api/forum/${threadId}`);
            if (!res.ok) throw new Error("Failed to fetch thread");
            return res.json();
        },
        enabled: !!threadId,
    });
}

export function useCreateReply() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ threadId, body }: { threadId: string; body: string }) => {
            const res = await fetch(`/api/forum/${threadId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ body }),
            });
            if (!res.ok) throw new Error("Failed to post reply");
            return res.json();
        },
        onSuccess: (_, { threadId }) => {
            queryClient.invalidateQueries({ queryKey: ["forum", "thread", threadId] });
            queryClient.invalidateQueries({ queryKey: ["forum", "posts"] }); // Update reply counts
        },
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, body, courseId }: { title: string; body: string; courseId: string }) => {
            const res = await fetch("/api/forum", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, body, courseId }),
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.message || "Failed to create post");
            }
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["forum", "posts"] });
        },
    });
}

export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await fetch("/api/notifications");
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json();
        },
    });
}
