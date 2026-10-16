import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env", () => ({ env: {} }));
vi.mock("@/services/weather/weather.service", async (importOriginal) => ({
    ...(await importOriginal<
        typeof import("@/services/weather/weather.service")
    >()),
    getWeather: vi.fn(),
}));

import { getAssistantReply } from "./assistant.service";
import {
    getWeather,
    WeatherServiceError,
} from "@/services/weather/weather.service";

describe("getAssistantReply", () => {
    it("rejects empty and oversized input", async () => {
        expect(await getAssistantReply("   ")).toBe("Please enter a message.");
        expect(await getAssistantReply("x".repeat(4001))).toContain("too long");
    });

    it("routes weather questions to the weather service", async () => {
        vi.mocked(getWeather).mockResolvedValueOnce("sunny");

        expect(await getAssistantReply("weather in Rome?")).toBe("sunny");
        expect(getWeather).toHaveBeenCalledWith("Rome");
    });

    it("returns a friendly message when the weather service fails", async () => {
        vi.mocked(getWeather).mockRejectedValueOnce(
            new WeatherServiceError("Weather location lookup failed."),
        );

        expect(await getAssistantReply("weather in Rome")).toContain(
            "couldn't get the weather",
        );
    });

    it("greets the user", async () => {
        expect(await getAssistantReply("Hello there")).toContain("Hello!");
    });

    it("does not fabricate AI answers when no provider is configured", async () => {
        const reply = await getAssistantReply("Explain quantum physics");

        expect(reply).toContain("not configured");
    });
});
