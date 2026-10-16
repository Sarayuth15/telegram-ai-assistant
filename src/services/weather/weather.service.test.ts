import { afterEach, describe, expect, it, vi } from "vitest";
import { getWeather, WeatherServiceError } from "./weather.service";

function jsonResponse(body: unknown, status = 200): Response {
    return new Response(JSON.stringify(body), { status });
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("getWeather", () => {
    it("formats current weather for a found city", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(
                jsonResponse({
                    results: [
                        {
                            name: "Phnom Penh",
                            country: "Cambodia",
                            latitude: 11.5,
                            longitude: 104.9,
                        },
                    ],
                }),
            )
            .mockResolvedValueOnce(
                jsonResponse({
                    current: {
                        temperature_2m: 31,
                        relative_humidity_2m: 70,
                        apparent_temperature: 36,
                        wind_speed_10m: 8,
                        weather_code: 2,
                    },
                }),
            );
        vi.stubGlobal("fetch", fetchMock);

        const result = await getWeather("Phnom Penh");

        expect(result).toContain("Weather in Phnom Penh, Cambodia");
        expect(result).toContain("Partly cloudy");
        expect(result).toContain("31°C");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("reports an unknown city without throwing", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse({})));

        expect(await getWeather("Nowhereville")).toContain("couldn't find");
    });

    it("wraps network failures in WeatherServiceError", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("boom")));

        await expect(getWeather("Paris")).rejects.toBeInstanceOf(
            WeatherServiceError,
        );
    });

    it("rejects upstream HTTP errors and malformed payloads", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(jsonResponse({}, 500)),
        );
        await expect(getWeather("Paris")).rejects.toBeInstanceOf(
            WeatherServiceError,
        );

        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue(jsonResponse({ results: "bad" })),
        );
        await expect(getWeather("Paris")).rejects.toBeInstanceOf(
            WeatherServiceError,
        );
    });

    it("retries once after a transient upstream failure", async () => {
        const fetchMock = vi
            .fn()
            .mockResolvedValueOnce(jsonResponse({}, 503))
            .mockResolvedValueOnce(jsonResponse({}));
        vi.stubGlobal("fetch", fetchMock);

        expect(await getWeather("Paris")).toContain("couldn't find");
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not retry client errors", async () => {
        const fetchMock = vi.fn().mockResolvedValue(jsonResponse({}, 400));
        vi.stubGlobal("fetch", fetchMock);

        await expect(getWeather("Paris")).rejects.toBeInstanceOf(
            WeatherServiceError,
        );
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("rejects empty or oversized city names", async () => {
        await expect(getWeather("  ")).rejects.toBeInstanceOf(
            WeatherServiceError,
        );
        await expect(getWeather("x".repeat(101))).rejects.toBeInstanceOf(
            WeatherServiceError,
        );
    });
});
