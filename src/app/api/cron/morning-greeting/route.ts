import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { hasValidBearerToken } from "@/lib/auth";
import {
    GreetingConfigError,
    sendMorningGreeting,
} from "@/services/scheduled/morning-greeting.service";

const LOG_TAG = "[cron:morning-greeting]";

/**
 * Invoked by Vercel Cron (see vercel.json). Vercel authenticates cron calls
 * with "Authorization: Bearer <CRON_SECRET>".
 *
 * `?force=true` (authenticated) skips the Monday check for manual testing.
 */
export async function GET(request: Request) {
    const secret = env.CRON_SECRET;

    if (!secret) {
        console.error(`${LOG_TAG} CRON_SECRET is not configured.`);
        return NextResponse.json(
            { error: "Cron is not configured." },
            { status: 503 },
        );
    }

    if (!hasValidBearerToken(request, secret)) {
        console.warn(`${LOG_TAG} Rejected unauthorized request.`);
        return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const force =
        new URL(request.url).searchParams.get("force") === "true";

    try {
        const result = await sendMorningGreeting({ force });

        console.info(
            `${LOG_TAG} ${result.status} at ${new Date().toISOString()}` +
                (result.status === "skipped" ? ` (${result.reason})` : ""),
        );

        return NextResponse.json({ ok: true, ...result });
    } catch (error) {
        // Log only the message: it never contains the token (the Telegram
        // service strips it) and avoids dumping request internals.
        console.error(
            `${LOG_TAG} failed at ${new Date().toISOString()}:`,
            error instanceof Error ? error.message : "unknown error",
        );

        return NextResponse.json(
            { ok: false, error: "Failed to send the scheduled message." },
            {
                status:
                    error instanceof GreetingConfigError ? 503 : 502,
            },
        );
    }
}
