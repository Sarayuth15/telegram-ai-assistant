const TIME_WORDS = /\s+(?:today|now|right now|currently|tonight|tomorrow)$/i;

function clean(value: string | undefined): string | undefined {
    if (!value) return undefined;

    let city = value.replace(/[?.!,]+$/, "").trim();

    while (TIME_WORDS.test(city)) {
        city = city.replace(TIME_WORDS, "").trim();
    }

    return city.length > 0 ? city : undefined;
}

/**
 * Extracts a city from common weather questions, or returns undefined
 * when the message is not a weather question.
 */
export function extractWeatherCity(input: string): string | undefined {
    const forward = input.match(
        /\bweather\b.*?\b(?:in|at|for)\s+(.+?)\s*[?.!]*$/i,
    );
    const reverse = input.match(/\b(?:in|at|for)\s+(.+?)\s+weather\b/i);

    return clean(forward?.[1] ?? reverse?.[1]);
}
