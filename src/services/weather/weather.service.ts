import { z } from "zod";

export class WeatherServiceError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = "WeatherServiceError";
    }
}

const geocodingSchema = z.object({
    results: z
        .array(
            z.object({
                name: z.string(),
                country: z.string().optional(),
                latitude: z.number(),
                longitude: z.number(),
            }),
        )
        .optional(),
});

const forecastSchema = z.object({
    current: z
        .object({
            temperature_2m: z.number(),
            relative_humidity_2m: z.number(),
            apparent_temperature: z.number(),
            wind_speed_10m: z.number(),
            weather_code: z.number(),
        })
        .optional(),
});

// WMO weather interpretation codes used by Open-Meteo.
const weatherDescriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
};

const MAX_ATTEMPTS = 2;

function isTransient(status: number): boolean {
    return status === 429 || status >= 500;
}

async function fetchJson(
    url: URL,
    failureMessage: string,
): Promise<unknown> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetch(url, {
                signal: AbortSignal.timeout(8000),
                cache: "no-store",
            });

            if (response.ok) {
                return await response.json();
            }

            lastError = new Error(`HTTP ${response.status}`);

            // Client errors will not succeed on retry.
            if (!isTransient(response.status)) break;
        } catch (error) {
            // Network failure, timeout, or invalid JSON.
            lastError = error;
        }
    }

    throw new WeatherServiceError(failureMessage, { cause: lastError });
}

export async function getWeather(city: string): Promise<string> {
    const name = city.trim();

    if (!name || name.length > 100) {
        throw new WeatherServiceError("Please provide a valid city name.");
    }

    const geoUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geoUrl.searchParams.set("name", name);
    geoUrl.searchParams.set("count", "1");
    geoUrl.searchParams.set("language", "en");
    geoUrl.searchParams.set("format", "json");

    const geo = geocodingSchema.safeParse(
        await fetchJson(geoUrl, "Weather location lookup failed."),
    );

    if (!geo.success) {
        throw new WeatherServiceError(
            "Weather location lookup returned unexpected data.",
        );
    }

    const location = geo.data.results?.[0];

    if (!location) {
        return `I couldn't find the city "${name}". Please try another city.`;
    }

    const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
    forecastUrl.searchParams.set("latitude", String(location.latitude));
    forecastUrl.searchParams.set("longitude", String(location.longitude));
    forecastUrl.searchParams.set(
        "current",
        [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "wind_speed_10m",
            "weather_code",
        ].join(","),
    );

    const forecast = forecastSchema.safeParse(
        await fetchJson(forecastUrl, "Could not retrieve current weather."),
    );

    if (!forecast.success || !forecast.data.current) {
        throw new WeatherServiceError("Current weather data is unavailable.");
    }

    const current = forecast.data.current;
    const description =
        weatherDescriptions[current.weather_code] ?? "Unknown conditions";

    return [
        `🌤️ Weather in ${location.name}${location.country ? `, ${location.country}` : ""}`,
        `Condition: ${description}`,
        `Temperature: ${current.temperature_2m}°C`,
        `Feels like: ${current.apparent_temperature}°C`,
        `Humidity: ${current.relative_humidity_2m}%`,
        `Wind: ${current.wind_speed_10m} km/h`,
    ].join("\n");
}
