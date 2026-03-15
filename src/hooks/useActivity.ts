import { useMutation } from "@tanstack/react-query";

type ActivityAction =
    | "LOGIN"
    | "VIEW_COURSE"
    | "VIEW_MODULE"
    | "SUBMIT_ASSESSMENT"
    | "CREATE_FORUM_POST"
    | "CREATE_FORUM_REPLY";

export function useLogActivity() {
    return useMutation({
        mutationFn: async ({
            action,
            metadata,
        }: {
            action: ActivityAction;
            metadata?: Record<string, string>;
        }) => {
            const res = await fetch("/api/activity", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, metadata }),
            });
            if (!res.ok) throw new Error("Failed to log activity");
            return res.json();
        },
        // Fire-and-forget — don't block UI on logging
        onError: () => {
            // Silently swallow activity-logging errors
        },
    });
}
