import { aiService } from "@/services/ai/ai.service";
import { extractWeatherCity } from "@/services/weather/weather-query";
import {
    getWeather,
    WeatherServiceError,
} from "@/services/weather/weather.service";

export const MAX_MESSAGE_LENGTH = 4000;

export async function getAssistantReply(message: string): Promise<string> {
    const input = message.trim();

    if (!input) {
        return "Please enter a message.";
    }

    if (input.length > MAX_MESSAGE_LENGTH) {
        return `Your message is too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`;
    }

    const city = extractWeatherCity(input);

    if (city) {
        try {
            return await getWeather(city);
        } catch (error) {
            if (error instanceof WeatherServiceError) {
                return `Sorry, I couldn't get the weather right now. ${error.message} Please try again later.`;
            }
            throw error;
        }
    }

    if (/^(hi|hello|hey)\b/i.test(input)) {
        return "Hello! 👋 I'm your Telegram AI Assistant. Ask me about the weather or say /help in Telegram.";
    }

    return aiService.ask(input);
}
