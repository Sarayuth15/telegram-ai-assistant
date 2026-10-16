import { ChatWindow } from "@/components/chat/chat-window";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-600">
            Personal assistant
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Ask me anything
          </h1>
          <p className="mt-2 text-gray-600">
            Start with a greeting or ask about current weather.
          </p>
        </header>

        <ChatWindow />

        <p className="mt-4 text-center text-xs text-gray-500">
          AI answers require a configured AI provider.
        </p>
      </div>
    </main>
  );
}