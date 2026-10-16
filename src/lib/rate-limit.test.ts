import { describe, expect, it } from "vitest";
import { createRateLimiter, getClientKey } from "./rate-limit";

describe("createRateLimiter", () => {
    it("blocks requests over the limit and resets after the window", () => {
        const isAllowed = createRateLimiter(2, 1000);

        expect(isAllowed("a", 0)).toBe(true);
        expect(isAllowed("a", 10)).toBe(true);
        expect(isAllowed("a", 20)).toBe(false);
        expect(isAllowed("a", 1000)).toBe(true);
    });

    it("tracks keys independently", () => {
        const isAllowed = createRateLimiter(1, 1000);

        expect(isAllowed("a", 0)).toBe(true);
        expect(isAllowed("b", 0)).toBe(true);
        expect(isAllowed("a", 1)).toBe(false);
    });
});

describe("getClientKey", () => {
    it("uses the first x-forwarded-for address", () => {
        const request = new Request("http://localhost", {
            headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
        });

        expect(getClientKey(request)).toBe("1.2.3.4");
    });

    it("falls back to a shared key", () => {
        expect(getClientKey(new Request("http://localhost"))).toBe("unknown");
    });
});
