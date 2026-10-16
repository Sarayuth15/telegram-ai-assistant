import { describe, expect, it, vi } from "vitest";

vi.mock("@/services/assistant.service", () => ({
    getAssistantReply: vi.fn(async (text: string) => `assistant:${text}`),
}));

import { getTelegramReply, parseCommand } from "./commands";
import { truncateForTelegram } from "./telegram.service";

describe("parseCommand", () => {
    it("parses plain and bot-addressed commands", () => {
        expect(parseCommand("/start")).toBe("start");
        expect(parseCommand("/Help@MyBot")).toBe("help");
        expect(parseCommand("/start now")).toBe("start");
    });

    it("ignores non-commands", () => {
        expect(parseCommand("hello /start")).toBeUndefined();
    });
});

describe("getTelegramReply", () => {
    it("answers built-in commands", async () => {
        expect(await getTelegramReply("/start")).toContain("Welcome");
        expect(await getTelegramReply("/help@MyBot")).toContain("/help");
    });

    it("rejects unknown commands without calling the assistant", async () => {
        expect(await getTelegramReply("/nope")).toContain("Unknown command");
    });

    it("delegates other text to the assistant", async () => {
        expect(await getTelegramReply("hi")).toBe("assistant:hi");
    });
});

describe("truncateForTelegram", () => {
    it("keeps short text and truncates long text to 4096 chars", () => {
        expect(truncateForTelegram("ok")).toBe("ok");
        expect(truncateForTelegram("x".repeat(5000))).toHaveLength(4096);
    });
});
