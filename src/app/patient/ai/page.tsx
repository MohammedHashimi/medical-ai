"use client";

import { FormEvent, useState } from "react";
import PatientBottomNav from "../../../components/BottomNavigation";
import AIMessage from "../../../components/AIMessage";
type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

export default function PatientAIPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      content:
        "Hello. I’m PTalk AI. How can I help you today?",
    },
  ]);

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const question = input.trim();

    if (!question || isLoading) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: question,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "/api/patient/ai",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Failed to contact PTalk AI"
        );
      }

      /*
       * Expected API response:
       *
       * {
       *   success: true,
       *   data: ...
       * }
       *
       * We support the most common response
       * property names from n8n.
       */

      const assistantText =
        data?.data?.response ??
        data?.data?.answer ??
        data?.data?.message ??
        data?.data?.output ??
        (typeof data?.data === "string"
          ? data.data
          : null) ??
        "I received your question, but no response was returned.";

      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: String(assistantText),
      };

      setMessages((current) => [
        ...current,
        assistantMessage,
      ]);
    } catch (error) {
      console.error(
        "PTalk AI chat error:",
        error
      );

      const errorMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          "Sorry, I could not connect to PTalk AI right now. Please try again.",
      };

      setMessages((current) => [
        ...current,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-32">

      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-5">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                PTalk
              </p>

              <h1 className="mt-1 text-2xl font-bold text-slate-900">
                AI Assistant
              </h1>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-white">
              AI
            </div>

          </div>

        </div>
      </header>

      {/* Chat */}
      <section className="mx-auto max-w-3xl px-5">

        <div className="py-6">
          <p className="text-sm leading-6 text-slate-500">
            Tell PTalk AI what you are experiencing.
            You can describe your symptoms or ask a
            health-related question.
          </p>
        </div>

        <div className="space-y-4 pb-32">

          {messages.map((message) => {
            const isUser =
              message.role === "user";

            return (
              <div
                key={message.id}
                className={`flex ${
                  isUser
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={
                    isUser
                      ? "max-w-[85%] rounded-2xl rounded-br-md bg-slate-800 px-4 py-3 text-sm leading-6 text-white"
                      : "max-w-[85%] rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                  }
                >
                  {isUser ? (
  message.content
) : (
  <AIMessage content={message.content} />
)}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
                PTalk AI is thinking...
              </div>
            </div>
          )}

        </div>

      </section>

      {/* Input */}
      <div className="fixed bottom-[76px] left-0 right-0 border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-5 py-3">

          <form
            onSubmit={handleSubmit}
            className="flex items-end gap-2"
          >

            <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-slate-400 focus-within:bg-white">

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    !event.shiftKey
                  ) {
                    event.preventDefault();

                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                placeholder="Ask PTalk AI..."
                rows={1}
                disabled={isLoading}
                className="min-h-[32px] w-full resize-none border-0 bg-transparent p-0 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400"
              />

            </div>

            <button
              type="submit"
              disabled={
                !input.trim() ||
                isLoading
              }
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              aria-label="Send message"
            >
              →
            </button>

          </form>

          <p className="mt-2 text-center text-[11px] text-slate-400">
            PTalk AI provides information and does not replace a medical professional.
          </p>

        </div>
      </div>

      {/* Navigation */}
      <PatientBottomNav />

    </main>
  );
}