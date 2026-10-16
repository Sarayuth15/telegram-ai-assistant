import { NextResponse } from "next/server";
import { z } from "zod";
import { createRateLimiter, getClientKey } from "@/lib/rate-limit";
import { getWeather } from "@/services/weather/weather.service";

const schema = z.object({
    city: z.string().trim().min(1).max(100),
});

const isAllowed = createRateLimiter(30, 60_000);

export async function GET(request: Request) {
    if (!isAllowed(getClientKey(request))) {
        return NextResponse.json(
            { error: "Too many requests. Please slow down." },
            { status: 429, headers: { "Retry-After": "60" } },
        );
    }

    const url = new URL(request.url);
    const parsed = schema.safeParse({
        city: url.searchParams.get("city"),
    });

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Please provide a city query parameter." },
            { status: 400 },
        );
    }

    try {
        const weather = await getWeather(parsed.data.city);

        return NextResponse.json({ weather });
    } catch (error) {
        console.error("Weather request failed:", error);
        return NextResponse.json(
            { error: "Weather service is temporarily unavailable." },
            { status: 502 },
        );
    }
}
