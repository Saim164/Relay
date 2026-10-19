"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api.js";

export default function ConversationChat({ conversationId, otherUsername, currentUserId, onMessageSent }) {
  const router = useRouter();
  const scrollBoxRef = useRef(null);
  // After loading older messages we keep the view where it was (measured from the bottom).
  // Otherwise (first load, sending) we scroll to the newest message.
  const keepDistanceFromBottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "not-found" | "error"
  const [loadError, setLoadError] = useState("");
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState("");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesPath = `/conversations/${conversationId}/messages`;

  useEffect(() => {
    const controller = new AbortController();

    apiRequest(messagesPath, { signal: controller.signal })
      .then((result) => {
        setMessages(result.messages);
        setHasMore(result.hasMore);
        setStatus("ready");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401) {
          router.replace("/login");
        } else if (error.status === 404) {
          setStatus("not-found");
        } else {
          setLoadError(error.message);
          setStatus("error");
        }
      });

    return () => controller.abort();
  }, [messagesPath, router]);

  // Runs after the DOM updates but before the browser paints, so there's no visible jump.
  useLayoutEffect(() => {
    const box = scrollBoxRef.current;
    if (!box) return;

    if (keepDistanceFromBottomRef.current !== null) {
      box.scrollTop = box.scrollHeight - keepDistanceFromBottomRef.current;
      keepDistanceFromBottomRef.current = null;
    } else {
      box.scrollTop = box.scrollHeight;
    }
  }, [messages]);

  async function loadOlder() {
    setIsLoadingOlder(true);
    setOlderError("");
    try {
      const before = encodeURIComponent(messages[0].createdAt);
      const result = await apiRequest(`${messagesPath}?before=${before}`);
      const box = scrollBoxRef.current;
      keepDistanceFromBottomRef.current = box.scrollHeight - box.scrollTop;
      setMessages((current) => [...result.messages, ...current]);
      setHasMore(result.hasMore);
    } catch (error) {
      if (error.status === 401) router.replace("/login");
      else setOlderError(error.message);
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const messageText = text.trim();
    if (!messageText || isSending) return;

    setIsSending(true);
    setSendError("");
    try {
      const { message } = await apiRequest(messagesPath, {
        method: "POST",
        body: { text: messageText },
      });
      setMessages((current) => [...current, message]);
      setText("");
      onMessageSent(message);
    } catch (error) {
      if (error.status === 401) router.replace("/login");
      else setSendError(error.message);
    } finally {
      setIsSending(false);
    }
  }

  if (status === "not-found") {
    return (
      <section className="flex h-full flex-col items-center justify-center bg-white px-5 text-center text-neutral-900">
        <h1 className="text-xl font-semibold tracking-tight">Chat not found</h1>
        <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">
          This chat doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-neutral-700"
        >
          Back to your chats
        </Link>
      </section>
    );
  }

  return (
    <section className="flex h-full flex-col bg-white text-neutral-900">
      <header className="flex min-h-16 items-center gap-3 border-b border-neutral-200 px-5 sm:px-7">
        <Link
          href="/dashboard"
          className="rounded-md px-2 py-1 text-sm text-neutral-600 hover:bg-neutral-100 lg:hidden"
        >
          Back
        </Link>
        <div>
          <h1 className="font-semibold">{otherUsername || "Chat"}</h1>
          <p className="text-xs text-neutral-500">Conversation</p>
        </div>
      </header>

      <div ref={scrollBoxRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
        {status === "loading" ? (
          <p className="py-8 text-center text-sm text-neutral-500">Loading messages...</p>
        ) : status === "error" ? (
          <p role="alert" className="py-8 text-center text-sm text-red-700">{loadError}</p>
        ) : messages.length ? (
          <>
            {hasMore && (
              <div className="mb-4 text-center">
                <button
                  type="button"
                  onClick={loadOlder}
                  disabled={isLoadingOlder}
                  className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-60"
                >
                  {isLoadingOlder ? "Loading..." : "Load older"}
                </button>
                {olderError && <p role="alert" className="mt-2 text-sm text-red-700">{olderError}</p>}
              </div>
            )}
            <ul className="space-y-3">
              {messages.map((message) => {
                const isMine = message.senderId === String(currentUserId);
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
            </ul>
          </>
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
            disabled={isSending || !text.trim() || status !== "ready"}
            className="h-11 rounded-xl bg-neutral-900 px-5 text-sm font-medium text-white transition-colors hover:bg-neutral-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSending ? "Sending..." : "Send"}
          </button>
        </div>
      </form>
    </section>
  );
}
