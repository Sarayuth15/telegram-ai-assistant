import { env } from "@/lib/env";
import { sendTelegramMessage } from "@/services/telegram/telegram.service";

export const SCHEDULE_TIME_ZONE = "Asia/Phnom_Penh";
export const MORNING_GREETING = "Good morning Sarayuth, have a nice day!";

/** True when `date` falls on a Monday in Cambodia time (UTC+7, no DST). */
export function isMondayInPhnomPenh(date: Date): boolean {
    const weekday = new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        timeZone: SCHEDULE_TIME_ZONE,
    }).format(date);

    return weekday === "Monday";
}

export type GreetingResult =
    | { status: "sent" }
    | { status: "skipped"; reason: string };

export class GreetingConfigError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "GreetingConfigError";
    }
}

/**
 * Sends the Monday morning greeting. Throws on configuration or delivery
 * failure so the caller can log it and return a non-2xx status.
 *
 * The weekday check stops a stray or mis-scheduled invocation from
 * messaging on the wrong day; `force` bypasses it for manual testing.
 */
export async function sendMorningGreeting(
    options: { now?: Date; force?: boolean } = {},
): Promise<GreetingResult> {
    const { now = new Date(), force = false } = options;

    if (!force && !isMondayInPhnomPenh(now)) {
        return {
            status: "skipped",
            reason: `Not Monday in ${SCHEDULE_TIME_ZONE}.`,
        };
    }

    const chatId = env.TELEGRAM_OWNER_CHAT_ID;

    if (!chatId) {
        throw new GreetingConfigError(
            "TELEGRAM_OWNER_CHAT_ID is not configured.",
        );
    }

    await sendTelegramMessage(Number(chatId), MORNING_GREETING);

    return { status: "sent" };
}
