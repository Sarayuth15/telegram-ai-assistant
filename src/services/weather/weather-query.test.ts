import { describe, expect, it } from "vitest";
import { extractWeatherCity } from "./weather-query";

describe("extractWeatherCity", () => {
    it.each([
        ["What is the weather today in Phnom Penh?", "Phnom Penh"],
        ["weather in Tokyo", "Tokyo"],
        ["Weather for London!", "London"],
        ["What's the weather in Paris today?", "Paris"],
        ["what is the weather in Berlin right now", "Berlin"],
        ["in Tokyo weather", "Tokyo"],
    ])("extracts the city from %j", (input, city) => {
        expect(extractWeatherCity(input)).toBe(city);
    });

    it.each(["hello", "tell me a joke", "what's the weather like?"])(
        "returns undefined for %j",
        (input) => {
            expect(extractWeatherCity(input)).toBeUndefined();
        },
    );
});
