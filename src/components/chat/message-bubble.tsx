import type { ChatMessage } from "@/types/chat";

interface Props {
    message: ChatMessage;
}

export function MessageBubble({ message }: Props) {
    const isUser = message.role === "user";

    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={[
                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6",
                    "whitespace-pre-wrap break-words",
                    isUser
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 bg-white text-gray-800",
                ].join(" ")}
            >
                {message.content}
            </div>
        </div>
    );
}