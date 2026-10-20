import { createHash, timingSafeEqual } from "node:crypto";

/** Constant-time string comparison (hashes first so lengths are equal). */
export function safeEqual(a: string, b: string): boolean {
    const hashA = createHash("sha256").update(a).digest();
    const hashB = createHash("sha256").update(b).digest();

    return timingSafeEqual(hashA, hashB);
}

/** Checks an "Authorization: Bearer <secret>" header against `secret`. */
export function hasValidBearerToken(
    request: Request,
    secret: string,
): boolean {
    const header = request.headers.get("authorization");

    if (!header?.startsWith("Bearer ")) return false;

    return safeEqual(header.slice("Bearer ".length), secret);
}
