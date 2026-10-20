import { beforeEach, describe, expect, it, vi } from "vitest";

const envMock = vi.hoisted(() => ({}) as { TELEGRAM_OWNER_CHAT_ID?: string });

vi.mock("@/lib/env", () => ({ env: envMock }));
vi.mock("@/services/telegram/telegram.service", () => ({
    sendTelegramMessage: vi.fn(async () => undefined),
}));

import { sendTelegramMessage } from "@/services/telegram/telegram.service";
import {
    GreetingConfigError,
    isMondayInPhnomPenh,
    MORNING_GREETING,
    sendMorningGreeting,
} from "./morning-greeting.service";

// Sunday 2026-10-18 23:18 UTC == Monday 2026-10-19 06:18 in Phnom Penh.
const MONDAY_0618_PP = new Date("2026-10-18T23:18:00Z");
const TUESDAY_0618_PP = new Date("2026-10-19T23:18:00Z");

beforeEach(() => {
    vi.mocked(sendTelegramMessage).mockClear();
    envMock.TELEGRAM_OWNER_CHAT_ID = "12345";
});

describe("isMondayInPhnomPenh", () => {
    it("uses Cambodia time, not UTC", () => {
        expect(isMondayInPhnomPenh(MONDAY_0618_PP)).toBe(true);
        // Still Sunday in UTC, but already Monday 00:00 in Phnom Penh.
        expect(isMondayInPhnomPenh(new Date("2026-10-18T17:00:00Z"))).toBe(true);
        expect(isMondayInPhnomPenh(new Date("2026-10-18T16:59:00Z"))).toBe(false);
        expect(isMondayInPhnomPenh(TUESDAY_0618_PP)).toBe(false);
    });
});

describe("sendMorningGreeting", () => {
    it("sends the exact greeting to the configured chat on Monday", async () => {
        const result = await sendMorningGreeting({ now: MONDAY_0618_PP });

        expect(result).toEqual({ status: "sent" });
        expect(sendTelegramMessage).toHaveBeenCalledWith(
            12345,
            "Good morning Sarayuth, have a nice day!",
        );
        expect(MORNING_GREETING).toBe(
            "Good morning Sarayuth, have a nice day!",
        );
    });

    it("skips on other days unless forced", async () => {
        expect(
            (await sendMorningGreeting({ now: TUESDAY_0618_PP })).status,
        ).toBe("skipped");
        expect(sendTelegramMessage).not.toHaveBeenCalled();

        await sendMorningGreeting({ now: TUESDAY_0618_PP, force: true });
        expect(sendTelegramMessage).toHaveBeenCalledTimes(1);
    });

    it("fails clearly when the chat ID is not configured", async () => {
        delete envMock.TELEGRAM_OWNER_CHAT_ID;

        await expect(
            sendMorningGreeting({ now: MONDAY_0618_PP }),
        ).rejects.toBeInstanceOf(GreetingConfigError);
    });

    it("propagates delivery failures", async () => {
        vi.mocked(sendTelegramMessage).mockRejectedValueOnce(
            new Error("Failed to reach the Telegram API."),
        );

        await expect(
            sendMorningGreeting({ now: MONDAY_0618_PP }),
        ).rejects.toThrow("Telegram API");
    });
});
