/**
 * In-memory sliding-window rate limiter, keyed by client IP + route.
 *
 * Not distributed — resets on server restart and doesn't share state across
 * serverless instances. Sufficient for this app's scale; swap for a Redis-backed
 * limiter (e.g. Upstash) if the app is ever deployed across multiple instances.
 */

type Bucket = {
    count: number;
    windowStart: number;
};

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 60;

const buckets = new Map<string, Bucket>();

// Periodically drop stale buckets so this Map doesn't grow unbounded.
const CLEANUP_INTERVAL_MS = 5 * 60_000;
let lastCleanup = Date.now();

function cleanupStaleBuckets(now: number) {
    if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
    lastCleanup = now;
    for (const [key, bucket] of buckets) {
        if (now - bucket.windowStart > WINDOW_MS) {
            buckets.delete(key);
        }
    }
}

export type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    limit: number;
    resetAt: number;
};

export function checkRateLimit(key: string): RateLimitResult {
    const now = Date.now();
    cleanupStaleBuckets(now);

    const existing = buckets.get(key);

    if (!existing || now - existing.windowStart >= WINDOW_MS) {
        buckets.set(key, { count: 1, windowStart: now });
        return {
            allowed: true,
            remaining: MAX_REQUESTS_PER_WINDOW - 1,
            limit: MAX_REQUESTS_PER_WINDOW,
            resetAt: now + WINDOW_MS,
        };
    }

    existing.count += 1;
    const allowed = existing.count <= MAX_REQUESTS_PER_WINDOW;
    return {
        allowed,
        remaining: Math.max(0, MAX_REQUESTS_PER_WINDOW - existing.count),
        limit: MAX_REQUESTS_PER_WINDOW,
        resetAt: existing.windowStart + WINDOW_MS,
    };
}

export function getClientIp(request: Request): string {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) return forwardedFor.split(",")[0].trim();
    return request.headers.get("x-real-ip") ?? "unknown";
}
