"use client";

import { useState } from "react";
import { ChatInput } from "@/components/ui/chat-input";
import { MessageBubble } from "./message-bubble";
import type { ChatMessage } from "@/types/chat";

export function ChatWindow() {
    const [messages, setMessages] = useState<ChatMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hello! 👋 I'm your assistant.\n\nTry asking: What is the weather today in Phnom Penh?",
        },
    ]);

    const [loading, setLoading] = useState(false);

    async function sendMessage(message: string) {
        const userMessage: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: message,
        };

        setMessages((previous) => [...previous, userMessage]);
        setLoading(true);

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message }),
            });

            const data = (await response.json().catch(() => ({}))) as {
                reply?: string;
                error?: string;
            };

            if (!response.ok) {
                throw new Error(data.error ?? "Request failed.");
            }

            setMessages((previous) => [
                ...previous,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: data.reply ?? "No response received.",
                },
            ]);
        } catch (error) {
            setMessages((previous) => [
                ...previous,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content:
                        error instanceof Error
                            ? error.message
                            : "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex h-[75vh] min-h-[480px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
            <div className="border-b bg-white px-5 py-4">
                <h2 className="font-semibold text-gray-900">
                    Telegram AI Assistant
                </h2>
                <p className="text-xs text-gray-500">
                    Weather works without an AI API key
                </p>
            </div>

            <div
                className="flex-1 space-y-4 overflow-y-auto p-4"
                aria-live="polite"
            >
                {messages.map((message) => (
                    <MessageBubble key={message.id} message={message} />
                ))}
                {loading && (
                    <p className="text-sm text-gray-500">Assistant is thinking...</p>
                )}
            </div>

            <div className="border-t bg-white p-4">
                <ChatInput loading={loading} onSend={sendMessage} />
            </div>
        </div>
    );
}