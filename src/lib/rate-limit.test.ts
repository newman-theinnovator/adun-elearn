import { beforeEach, describe, expect, it, vi } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("checkRateLimit", () => {
    beforeEach(() => {
        vi.useRealTimers();
    });

    it("allows requests under the limit", () => {
        const key = `test-key-${Math.random()}`;
        const result = checkRateLimit(key);
        expect(result.allowed).toBe(true);
        expect(result.remaining).toBe(59);
    });

    it("blocks requests once the limit is exceeded", () => {
        const key = `test-key-${Math.random()}`;
        let last;
        for (let i = 0; i < 61; i++) {
            last = checkRateLimit(key);
        }
        expect(last!.allowed).toBe(false);
        expect(last!.remaining).toBe(0);
    });

    it("tracks separate buckets per key", () => {
        const keyA = `test-key-a-${Math.random()}`;
        const keyB = `test-key-b-${Math.random()}`;
        for (let i = 0; i < 60; i++) checkRateLimit(keyA);
        const resultA = checkRateLimit(keyA);
        const resultB = checkRateLimit(keyB);
        expect(resultA.allowed).toBe(false);
        expect(resultB.allowed).toBe(true);
    });
});

describe("getClientIp", () => {
    it("reads the first entry from x-forwarded-for", () => {
        const req = new Request("http://localhost", {
            headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
        });
        expect(getClientIp(req)).toBe("1.2.3.4");
    });

    it("falls back to x-real-ip", () => {
        const req = new Request("http://localhost", {
            headers: { "x-real-ip": "9.9.9.9" },
        });
        expect(getClientIp(req)).toBe("9.9.9.9");
    });

    it("returns 'unknown' when no IP headers are present", () => {
        const req = new Request("http://localhost");
        expect(getClientIp(req)).toBe("unknown");
    });
});
