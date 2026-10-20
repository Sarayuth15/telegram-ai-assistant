import { describe, expect, it } from "vitest";
import { hasValidBearerToken, safeEqual } from "./auth";

function requestWith(authorization?: string): Request {
    return new Request("http://localhost", {
        headers: authorization ? { authorization } : {},
    });
}

describe("safeEqual", () => {
    it("compares strings of any length", () => {
        expect(safeEqual("abc", "abc")).toBe(true);
        expect(safeEqual("abc", "abd")).toBe(false);
        expect(safeEqual("abc", "abcd")).toBe(false);
    });
});

describe("hasValidBearerToken", () => {
    it("accepts only the matching bearer token", () => {
        expect(hasValidBearerToken(requestWith("Bearer s3cret"), "s3cret")).toBe(true);
        expect(hasValidBearerToken(requestWith("Bearer wrong"), "s3cret")).toBe(false);
        expect(hasValidBearerToken(requestWith("s3cret"), "s3cret")).toBe(false);
        expect(hasValidBearerToken(requestWith(), "s3cret")).toBe(false);
    });
});
