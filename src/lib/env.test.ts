import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
});

describe("env", () => {
    it("treats blank values as unset", async () => {
        vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "");
        vi.stubEnv("CRON_SECRET", "");

        const { env } = await import("./env");

        expect(env.TELEGRAM_OWNER_CHAT_ID).toBeUndefined();
        expect(env.CRON_SECRET).toBeUndefined();
    });

    it("accepts a numeric chat ID and rejects a malformed one", async () => {
        vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "-100123");
        expect((await import("./env")).env.TELEGRAM_OWNER_CHAT_ID).toBe("-100123");

        vi.resetModules();
        vi.stubEnv("TELEGRAM_OWNER_CHAT_ID", "abc");
        await expect(import("./env")).rejects.toThrow("Invalid environment");
    });
});
