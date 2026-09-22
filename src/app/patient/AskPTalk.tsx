"use client";

import { useState } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function AskPTalk() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function askPTalk() {
    const trimmedQuestion = question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    // Add user message immediately
    setMessages((current) => [
      ...current,
      {
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch("/api/patient/ask", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    question: trimmedQuestion,
  }),
});

      const text = await response.text();

      console.log("PTalk API status:", response.status);
      console.log("PTalk API response:", text);

      if (!response.ok) {
        throw new Error(
          `PTalk API error ${response.status}: ${text}`
        );
      }

      const data = JSON.parse(text);

      const answer =
        data.answer ||
        data.output ||
        data.response ||
        "No answer returned.";

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: answer,
        },
      ]);

    } catch (error) {
      console.error("Ask PTalk error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "PTalk could not answer your question.",
        },
      ]);

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5">

      {/* Chat messages */}
      {messages.length > 0 && (
        <div className="mb-4 max-h-96 space-y-3 overflow-y-auto rounded-2xl bg-slate-50 p-4">

          {messages.map((message, index) => (
            <div
              key={index}
              className={
                message.role === "user"
                  ? "flex justify-end"
                  : "flex justify-start"
              }
            >
              <div
                className={
                  message.role === "user"
                    ? "max-w-[85%] rounded-2xl rounded-br-md bg-slate-900 px-4 py-3 text-sm text-white"
                    : "max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
                }
              >
                {message.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-slate-400 shadow-sm">
                PTalk is thinking...
              </div>
            </div>
          )}

        </div>
      )}

      {/* Input */}
      <div className="rounded-2xl bg-white p-2">

        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              askPTalk();
            }
          }}
          placeholder="Ask about your health history..."
          disabled={loading}
          className="w-full px-3 py-3 text-sm text-slate-900 outline-none disabled:opacity-50"
        />

        <button
          onClick={askPTalk}
          disabled={loading || !question.trim()}
          className="mt-1 w-full rounded-xl bg-slate-900 py-3 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "PTalk is thinking..." : "Ask PTalk →"}
        </button>

      </div>

    </div>
  );
}