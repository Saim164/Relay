"use client";

import Link from "next/link";
import MessageComposer from "./MessageComposer.jsx";
import MessageList from "./MessageList.jsx";
import { useConversationMessages } from "../hooks/useConversationMessages.js";
import { primaryButtonClass } from "../lib/styles.js";

export default function ConversationChat({ conversationId, otherUsername, currentUserId, onMessageSent }) {
  const { scrollBoxRef, ...chat } = useConversationMessages(conversationId);

  if (chat.status === "not-found") {
    return <ChatNotFound />;
  }

  async function handleSend(draft) {
    const message = await chat.sendMessage(draft);
    if (!message) return false;
    onMessageSent(message);
    return true;
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

      <MessageList scrollBoxRef={scrollBoxRef} chat={chat} currentUserId={currentUserId} />
      <MessageComposer
        onSend={handleSend}
        isSending={chat.isSending}
        uploadProgress={chat.uploadProgress}
        isDisabled={chat.status !== "ready"}
      />
    </section>
  );
}

function ChatNotFound() {
  return (
    <section className="flex h-full flex-col items-center justify-center bg-white px-5 text-center text-neutral-900">
      <h1 className="text-xl font-semibold tracking-tight">Chat not found</h1>
      <p className="mt-2 max-w-sm text-sm leading-6 text-neutral-600">
        This chat doesn&apos;t exist or you don&apos;t have access to it.
      </p>
      <Link href="/dashboard" className={`mt-6 ${primaryButtonClass}`}>
        Back to your chats
      </Link>
    </section>
  );
}
