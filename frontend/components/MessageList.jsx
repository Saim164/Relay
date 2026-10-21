import ErrorText from "./ErrorText.jsx";
import { formatFileSize, isImage } from "../lib/attachments.js";

export default function MessageList({ scrollBoxRef, chat, currentUserId }) {
  return (
    <div ref={scrollBoxRef} className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
      <MessageListContent chat={chat} currentUserId={currentUserId} />
      {chat.sendError && <ErrorText className="mt-3 text-right">{chat.sendError}</ErrorText>}
    </div>
  );
}

function MessageListContent({ chat, currentUserId }) {
  if (chat.status === "loading") {
    return <p className="py-8 text-center text-sm text-neutral-500">Loading messages...</p>;
  }
  if (chat.status === "error") {
    return <ErrorText className="py-8 text-center">{chat.loadError}</ErrorText>;
  }
  if (!chat.messages.length) {
    return (
      <p className="py-10 text-center text-sm text-neutral-500">
        No messages yet. Send a message to start the conversation.
      </p>
    );
  }

  return (
    <>
      {chat.hasMore && (
        <div className="mb-4 text-center">
          <button
            type="button"
            onClick={chat.loadOlder}
            disabled={chat.isLoadingOlder}
            className="rounded-full border border-neutral-200 px-4 py-1.5 text-xs font-medium text-neutral-600 transition-colors hover:bg-neutral-50 disabled:opacity-60"
          >
            {chat.isLoadingOlder ? "Loading..." : "Load older"}
          </button>
          {chat.olderError && <ErrorText className="mt-2">{chat.olderError}</ErrorText>}
        </div>
      )}
      <ul className="space-y-3">
        {chat.messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isMine={message.senderId === String(currentUserId)}
          />
        ))}
      </ul>
    </>
  );
}

function MessageBubble({ message, isMine }) {
  return (
    <li className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
          isMine
            ? "rounded-br-md bg-neutral-900 text-white"
            : "rounded-bl-md bg-neutral-100 text-neutral-900"
        }`}
      >
        {message.attachment && <Attachment attachment={message.attachment} />}
        {message.text && (
          <p className={`whitespace-pre-wrap break-words ${message.attachment ? "mt-2" : ""}`}>
            {message.text}
          </p>
        )}
      </div>
    </li>
  );
}

function Attachment({ attachment }) {
  if (isImage(attachment.type)) {
    return (
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        {/* eslint-disable-next-line @next/next/no-img-element -- Cloudinary already serves the image */}
        <img src={attachment.url} alt={attachment.name} className="max-h-64 max-w-full rounded-lg" />
      </a>
    );
  }

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 underline-offset-4 hover:underline"
    >
      <span aria-hidden="true">📄</span>
      <span className="min-w-0 truncate">{attachment.name}</span>
      <span className="shrink-0 text-xs opacity-70">{formatFileSize(attachment.size)}</span>
    </a>
  );
}
