import { describe, expect, it } from "vitest";
import { publicEnv, getServerEnv } from "./env";

describe("publicEnv", () => {
    it("exposes validated NEXT_PUBLIC_* values", () => {
        expect(publicEnv.NEXT_PUBLIC_SUPABASE_URL).toBeTruthy();
        expect(publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeTruthy();
        expect(publicEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY).toBeTruthy();
    });
});

describe("getServerEnv", () => {
    it("returns and caches validated server env vars", () => {
        const first = getServerEnv();
        const second = getServerEnv();
        expect(first).toBe(second); // cached, same reference
        expect(first.DATABASE_URL).toBeTruthy();
        expect(first.NEXTAUTH_SECRET).toBeTruthy();
    });
});
