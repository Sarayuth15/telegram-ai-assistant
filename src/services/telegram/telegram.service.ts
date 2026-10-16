import { env } from "@/lib/env";

export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

export function truncateForTelegram(text: string): string {
    if (text.length <= TELEGRAM_MAX_MESSAGE_LENGTH) return text;
    return `${text.slice(0, TELEGRAM_MAX_MESSAGE_LENGTH - 1)}…`;
}

export async function sendTelegramMessage(
    chatId: number,
    text: string,
): Promise<void> {
    const token = env.TELEGRAM_BOT_TOKEN;

    if (!token) {
        throw new Error("Telegram bot token is not configured.");
    }

    let response: Response;

    try {
        response = await fetch(
            `https://api.telegram.org/bot${token}/sendMessage`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: truncateForTelegram(text),
                }),
                signal: AbortSignal.timeout(10000),
            },
        );
    } catch {
        // Do not forward the original error: its message can contain the
        // request URL, which includes the bot token.
        throw new Error("Failed to reach the Telegram API.");
    }

    if (!response.ok) {
        throw new Error(
            `Failed to send Telegram message (HTTP ${response.status}).`,
        );
    }
}
