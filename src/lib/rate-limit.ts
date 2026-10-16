/**
 * Fixed-window in-memory rate limiter.
 *
 * State is per server instance, so on serverless/multi-instance deployments
 * it is best-effort protection only. Use a shared store (e.g. Redis) if
 * strict limits are required.
 */
interface Window {
    count: number;
    resetAt: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
    const windows = new Map<string, Window>();

    return function isAllowed(key: string, now = Date.now()): boolean {
        if (windows.size > 10_000) {
            for (const [k, w] of windows) {
                if (w.resetAt <= now) windows.delete(k);
            }
        }

        const current = windows.get(key);

        if (!current || current.resetAt <= now) {
            windows.set(key, { count: 1, resetAt: now + windowMs });
            return true;
        }

        if (current.count >= limit) return false;

        current.count += 1;
        return true;
    };
}

export function getClientKey(request: Request): string {
    const forwarded = request.headers.get("x-forwarded-for");
    return forwarded?.split(",")[0]?.trim() || "unknown";
}
