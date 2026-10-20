import { z } from "zod";

const envSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
    // Chat that receives scheduled messages (get it by sending /myid to the bot).
    TELEGRAM_OWNER_CHAT_ID: z
        .string()
        .regex(/^-?[0-9]+$/, "must be a numeric Telegram chat ID")
        .optional(),
    // Vercel sends this as "Authorization: Bearer <CRON_SECRET>" to cron routes.
    CRON_SECRET: z.string().min(16).optional(),
    AI_API_KEY: z.string().optional(),
});

// Treat blank values (e.g. "KEY=" copied from .env.example) as unset.
const rawEnv = Object.fromEntries(
    Object.entries(process.env).filter(([, value]) => value !== ""),
);

const parsed = envSchema.safeParse(rawEnv);

if (!parsed.success) {
    throw new Error("Invalid environment configuration");
}

export const env = parsed.data;