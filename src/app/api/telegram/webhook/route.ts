import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import { getTelegramReply } from "@/services/telegram/commands";
import { sendTelegramMessage } from "@/services/telegram/telegram.service";

const updateSchema = z.object({
    message: z
        .object({
            chat: z.object({ id: z.number() }),
            text: z.string().optional(),
        })
        .optional(),
});

function secretsMatch(provided: string | null, expected: string): boolean {
    if (provided === null) return false;

    // Hash first so both buffers have equal length for timingSafeEqual.
    const a = createHash("sha256").update(provided).digest();
    const b = createHash("sha256").update(expected).digest();

    return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
    const secret = env.TELEGRAM_WEBHOOK_SECRET;

    if (!secret) {
        return NextResponse.json(
            { error: "Webhook is not configured." },
            { status: 503 },
        );
    }

    if (
        !secretsMatch(
            request.headers.get("x-telegram-bot-api-secret-token"),
            secret,
        )
    ) {
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ ok: false }, { status: 400 });
    }

    const message = parsed.data.message;
    const text = message?.text?.trim();

    // Ignore updates we don't handle (edits, stickers, etc.).
    if (!message || !text) {
        return NextResponse.json({ ok: true });
    }

    try {
        const reply = await getTelegramReply(text);
        await sendTelegramMessage(message.chat.id, reply);
    } catch (error) {
        // Acknowledge with 200: Telegram retries non-2xx responses, which
        // would repeatedly re-process the same update. Log without details
        // that could include secrets.
        console.error(
            "Telegram update failed:",
            error instanceof Error ? error.message : "unknown error",
        );
    }

    return NextResponse.json({ ok: true });
}
