import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/utils/supabase/client";

export function useRealtime(userId: string) {
    const queryClient = useQueryClient();
    const [onlineUsers, setOnlineUsers] = useState<number>(1);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    useEffect(() => {
        if (!userId) return;

        const supabase = createClient();

        // 1. Setup Channels for CDC
        const gradeChannel = supabase.channel("realtime-grades")
            .on("postgres_changes", { event: "*", schema: "public", table: "grades" }, () => {
                console.log("Realtime: Grades updated, refreshing analytics...");
                queryClient.invalidateQueries({ queryKey: ["analytics"] });
                queryClient.invalidateQueries({ queryKey: ["grades"] });
                setLastUpdated(new Date());
            })
            .subscribe();

        const submissionChannel = supabase.channel("realtime-submissions")
            .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
                console.log("Realtime: Submissions updated, refreshing assessments & analytics...");
                queryClient.invalidateQueries({ queryKey: ["analytics"] });
                queryClient.invalidateQueries({ queryKey: ["assessments"] });
                queryClient.invalidateQueries({ queryKey: ["assessment"] });
                setLastUpdated(new Date());
            })
            .subscribe();

        const progressChannel = supabase.channel("realtime-progress")
            .on("postgres_changes", { event: "*", schema: "public", table: "content_progress" }, () => {
                console.log("Realtime: Progress updated, refreshing analytics...");
                queryClient.invalidateQueries({ queryKey: ["analytics"] });
                queryClient.invalidateQueries({ queryKey: ["progress"] });
                setLastUpdated(new Date());
            })
            .subscribe();

        // 2. Setup Presence for "Users online"
        const presenceChannel = supabase.channel("adun-online-users", {
            config: { presence: { key: userId } }
        });

        presenceChannel
            .on("presence", { event: "sync" }, () => {
                const newState = presenceChannel.presenceState();
                setOnlineUsers(Object.keys(newState).length);
            })
            .subscribe(async (status) => {
                if (status === "SUBSCRIBED") {
                    await presenceChannel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(gradeChannel);
            supabase.removeChannel(submissionChannel);
            supabase.removeChannel(progressChannel);
            supabase.removeChannel(presenceChannel);
        };
    }, [userId, queryClient]);

    return { onlineUsers, lastUpdated };
}
