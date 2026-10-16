import { getAssistantReply } from "@/services/assistant.service";

const START_REPLY =
    "Hello! 👋 Welcome to your assistant.\n\n" +
    "Ask me about the weather or use /help.";

const HELP_REPLY =
    "Available commands:\n" +
    "/start - Start the bot\n" +
    "/help - Show help\n\n" +
    "Example: What is the weather today in Phnom Penh?";

/** Returns the lowercase command name (without "/" or "@bot"), if any. */
export function parseCommand(text: string): string | undefined {
    const match = text.match(/^\/([a-z0-9_]+)(?:@\w+)?(?:\s|$)/i);
    return match?.[1]?.toLowerCase();
}

export async function getTelegramReply(text: string): Promise<string> {
    const command = parseCommand(text);

    if (command === "start") return START_REPLY;
    if (command === "help") return HELP_REPLY;
    if (command) return "Unknown command. Use /help to see what I can do.";

    return getAssistantReply(text);
}
