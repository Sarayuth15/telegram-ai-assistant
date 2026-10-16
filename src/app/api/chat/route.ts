import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, getClientKey } from "@/lib/rate-limit";
import {
    getAssistantReply,
    MAX_MESSAGE_LENGTH,
} from "@/services/assistant.service";

const requestSchema = z.object({
    message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
});

const isAllowed = createRateLimiter(20, 60_000);

export async function POST(request: Request) {
    if (!isAllowed(getClientKey(request))) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429, headers: { "Retry-After": "60" } },
        );
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Request body must be valid JSON." },
            { status: 400 },
        );
    }

    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Please provide a valid message." },
            { status: 400 },
        );
    }

    try {
        const reply = await getAssistantReply(parsed.data.message);

        return NextResponse.json({ reply });
    } catch (error) {
        console.error("Chat request failed:", error);
        return NextResponse.json(
            { error: "Unable to process your message. Please try again." },
            { status: 500 },
        );
    }
}
