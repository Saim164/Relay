"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiRequest } from "../lib/api.js";

const MIN_SEARCH_LENGTH = 3;

export default function DashboardSidebar({ chats, activeConversationId, onChatStarted }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [search, setSearch] = useState({ term: "", users: [], loading: false, error: "" });
  const [openingUserId, setOpeningUserId] = useState("");
  const [openError, setOpenError] = useState("");
  const searchTerm = username.trim();

  useEffect(() => {
    if (searchTerm.length < MIN_SEARCH_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearch({ term: searchTerm, users: [], loading: true, error: "" });

      try {
        const { users } = await apiRequest(
          `/users/search?username=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );
        if (!controller.signal.aborted) {
          setSearch({ term: searchTerm, users: users || [], loading: false, error: "" });
        }
      } catch (error) {
        if (error.status === 401) router.replace("/login");
        else if (!controller.signal.aborted) {
          setSearch({ term: searchTerm, users: [], loading: false, error: error.message });
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, router]);

  async function openConversation(user) {
    setOpeningUserId(user.id);
    setOpenError("");

    try {
      const { conversation } = await apiRequest("/conversations", {
        method: "POST",
        body: { userId: user.id },
      });
      onChatStarted(conversation);
      setUsername("");
      router.push(`/dashboard/${conversation.id}`);
    } catch (error) {
      if (error.status === 401) router.replace("/login");
      else setOpenError(error.message);
    } finally {
      setOpeningUserId("");
    }
  }

  return (
    <aside className="h-full overflow-y-auto border-neutral-200 bg-white px-5 py-6 lg:border-l lg:px-6">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Messages</h2>
      <label htmlFor="user-search" className="sr-only">Search users by username</label>
      <input
        id="user-search"
        type="search"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Search by username"
        className="mt-4 h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm outline-none transition placeholder:text-neutral-500 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/15"
      />

      <PeopleSearch
        term={searchTerm}
        search={search}
        openingUserId={openingUserId}
        error={openError}
        onOpen={openConversation}
      />
      <ChatList chats={chats} activeConversationId={activeConversationId} />
    </aside>
  );
}

function PeopleSearch({ term, search, openingUserId, error, onOpen }) {
  if (!term) return null;

  let content;
  if (term.length < MIN_SEARCH_LENGTH) {
    content = <p className="py-2 text-sm text-neutral-500">Type at least 3 characters.</p>;
  } else if (search.term !== term || search.loading) {
    content = <p className="py-2 text-sm text-neutral-500">Searching...</p>;
  } else if (search.error) {
    content = <p role="alert" className="py-2 text-sm text-red-700">{search.error}</p>;
  } else if (!search.users.length) {
    content = <p className="py-2 text-sm text-neutral-500">No users found.</p>;
  } else {
    content = (
      <ul className="space-y-1">
        {search.users.map((user) => (
          <li key={user.id}>
            <button
              type="button"
              onClick={() => onOpen(user)}
              disabled={Boolean(openingUserId)}
              aria-label={`Open conversation with ${user.username}`}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-neutral-800 hover:bg-neutral-50 disabled:opacity-60"
            >
              <span>{openingUserId === user.id ? "Opening..." : user.username}</span>
              <MessageIcon />
            </button>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="mt-4" aria-live="polite">
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-500">People</h3>
      {content}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </section>
  );
}

function ChatList({ chats, activeConversationId }) {
  let content;
  if (chats.loading) {
    content = <p className="py-2 text-sm text-neutral-500">Loading chats...</p>;
  } else if (chats.error) {
    content = <p role="alert" className="py-2 text-sm text-red-700">{chats.error}</p>;
  } else if (!chats.items.length) {
    content = <p className="py-2 text-sm text-neutral-500">No chats right now.</p>;
  } else {
    content = (
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

  return (
    <section className="mt-8">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-neutral-500">Your chats</h3>
      {content}
    </section>
  );
}

function MessageIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-5 w-5 shrink-0 text-indigo-600">
      <path
        d="M3.25 4.75h13.5v9.5H9l-4.5 2v-2H3.25v-9.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M6.5 8h7m-7 3h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </svg>
  );
}
