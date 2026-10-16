import { env } from "@/lib/env";
import type { AIProvider } from "./ai-provider";

/**
 * Placeholder until a real AI provider is connected. It never fabricates
 * an AI answer; it only tells the user what is and isn't available.
 */
class UnconfiguredAIProvider implements AIProvider {
    async ask(): Promise<string> {
        if (!env.AI_API_KEY) {
            return [
                "🤖 AI integration is not configured yet.",
                "",
                "You can still use the weather feature.",
                "Example: What is the weather today in Phnom Penh?",
            ].join("\n");
        }

        return "AI provider integration is not implemented yet.";
    }
}

export const aiService: AIProvider = new UnconfiguredAIProvider();
