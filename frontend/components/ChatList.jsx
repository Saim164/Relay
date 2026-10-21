import Link from "next/link";
import ErrorText from "./ErrorText.jsx";
import { hintClass, sectionHeadingClass } from "../lib/styles.js";

export default function ChatList({ chats, activeConversationId }) {
  return (
    <section className="mt-8">
      <h3 className={`mb-3 ${sectionHeadingClass}`}>Your chats</h3>
      <ChatListContent chats={chats} activeConversationId={activeConversationId} />
    </section>
  );
}

function ChatListContent({ chats, activeConversationId }) {
  if (chats.loading) return <p className={hintClass}>Loading chats...</p>;
  if (chats.error) return <ErrorText className="py-2">{chats.error}</ErrorText>;
  if (!chats.items.length) return <p className={hintClass}>No chats right now.</p>;

  return (
    <ul className="space-y-1">
      {chats.items.map((chat) => {
        const isActive = chat.id === activeConversationId;

        return (
          <li key={chat.id}>
            <Link
              href={`/dashboard/${chat.id}`}
              aria-current={isActive ? "page" : undefined}
              className={`block w-full rounded-lg px-3 py-3 text-left transition-colors ${
                isActive ? "bg-neutral-100" : "hover:bg-neutral-50"
              }`}
            >
              <p className="text-sm font-medium text-neutral-900">{chat.otherUser.username}</p>
              <p className="mt-1 truncate text-xs text-neutral-500">
                {chat.lastMessage?.text || "No messages yet"}
              </p>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
