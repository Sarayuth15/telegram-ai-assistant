import { z } from "zod";

const envSchema = z.object({
    TELEGRAM_BOT_TOKEN: z.string().optional(),
    TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
    AI_API_KEY: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    throw new Error("Invalid environment configuration");
}

export const env = parsed.data;