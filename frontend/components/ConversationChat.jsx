"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ROOT_URL, apiRequest } from "../lib/api.js";

export default function ConversationChat({ conversation, currentUserId, onBack, onMessageSent }) {
  const router = useRouter();
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");

  useEffect(() => {
    if (!API_ROOT_URL) return;

    let active = true;
    const controller = new AbortController();

    async function loadMessages() {
      try {
        const result = await apiRequest(
          `/conversations/${conversation.id}/messages`,
          { base: API_ROOT_URL, signal: controller.signal }
        );
        if (active) setMessages(result.messages || []);
      } catch (error) {
        if (error.status === 401) {
          router.replace("/login");
        } else if (active && error.name !== "AbortError") {
          setError(error.message);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadMessages();
    return () => {
      active = false;
      controller.abort();
    };
  }, [conversation.id, router]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(event) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || isSending) return;

    setIsSending(true);
    setSendError("");
    try {
      const result = await apiRequest(`/conversations/${conversation.id}/messages`, {
        base: API_ROOT_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: messageText }),
      });
      setMessages((current) => [...current, result.message]);
      setText("");
      onMessageSent(result.message);
    } catch (error) {
      if (error.status === 401) {
        router.replace("/login");
      } else {
        setSendError(error.message || "Could not send message.");
      }
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="flex h-[calc(100svh-4rem)] min-h-[calc(100svh-4rem)] flex-col bg-white text-neutral-900">
      <header className="flex min-h-16 items-center gap-3 border-b border-neutral-200 px-5 sm:px-7">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 lg:hidden"
          >
            Back
          </button>
        )}
        <div>
          <h1 className="font-semibold">{conversation.otherUser.username}</h1>
          <p className="text-xs text-neutral-500">Conversation</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        {!API_ROOT_URL ? (
          <p className="py-8 text-center text-sm text-red-700">API URL is not configured.</p>
        ) : isLoading ? (
          <p className="py-8 text-center text-sm text-neutral-500">Loading messages...</p>
        ) : error ? (
          <p role="alert" className="py-8 text-center text-sm text-red-700">{error}</p>
        ) : messages.length ? (
          <ul className="space-y-3">
            {messages.map((message) => {
              const isMine = String(message.senderId) === String(currentUserId);
              return (
                <li key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <p
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                      isMine
                        ? "rounded-br-md bg-neutral-900 text-white"
                        : "rounded-bl-md bg-neutral-100 text-neutral-900"
                    }`}
                  >
                    {message.text}
                  </p>
                </li>
              );
            })}
            <li ref={bottomRef} aria-hidden="true" />
          </ul>
        ) : (
          <p className="py-10 text-center text-sm text-neutral-500">
            No messages yet. Send a message to start the conversation.
          </p>
        )}
        {sendError && <p role="alert" className="mt-3 text-right text-sm text-red-700">{sendError}</p>}
      </div>

      <form onSubmit={sendMessage} className="border-t border-neutral-200 p-4 sm:px-7 sm:py-5">
        <div className="flex items-end gap-3">
          <label htmlFor="message-text" className="sr-only">Write a message</label>
          <textarea
            id="message-text"
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={2000}
            rows={1}
            placeholder="Write a message..."
            className="max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15"
          />
          <button
            type="submit"
            disabled={isSending || !text.trim()}
            className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
