"use client";

import { useState, type FormEvent } from "react";

interface Props {
    loading: boolean;
    onSend: (message: string) => Promise<void>;
}

export function ChatInput({ loading, onSend }: Props) {
    const [message, setMessage] = useState("");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();

        const value = message.trim();

        if (!value || loading) return;

        setMessage("");
        await onSend(value);
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Ask about the weather..."
                maxLength={4000}
                disabled={loading}
                aria-label="Your message"
                className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
            />

            <button
                type="submit"
                disabled={loading || !message.trim()}
                className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "..." : "Send"}
            </button>
        </form>
    );
}