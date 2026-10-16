"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_ROOT_URL, API_V1_URL, apiRequest } from "../lib/api.js";

const MIN_SEARCH_LENGTH = 3;

export default function DashboardSidebar({ selectedConversation, onOpenConversation }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [search, setSearch] = useState({ term: "", users: [], loading: false, error: "" });
  const [chats, setChats] = useState({ items: [], loading: true, error: "" });
  const [openingUserId, setOpeningUserId] = useState("");
  const [openError, setOpenError] = useState("");
  const searchTerm = username.trim();

  useEffect(() => {
    if (!API_ROOT_URL) return;

    const controller = new AbortController();
    apiRequest("/conversations", { base: API_ROOT_URL, signal: controller.signal })
      .then(({ conversations }) => {
        if (!controller.signal.aborted) {
          setChats({ items: conversations || [], loading: false, error: "" });
        }
      })
      .catch((error) => {
        if (error.status === 401) router.replace("/login");
        else if (!controller.signal.aborted) {
          setChats({ items: [], loading: false, error: error.message });
        }
      });

    return () => controller.abort();
  }, [router]);

  useEffect(() => {
    if (searchTerm.length < MIN_SEARCH_LENGTH || !API_V1_URL) return;

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
        base: API_ROOT_URL,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      setChats((current) => ({
        ...current,
        items: [conversation, ...current.items.filter((chat) => chat.id !== conversation.id)],
      }));
      onOpenConversation(conversation);
      setUsername("");
    } catch (error) {
      if (error.status === 401) router.replace("/login");
      else setOpenError(error.message);
    } finally {
      setOpeningUserId("");
    }
  }

  return (
    <aside className="w-full border-t border-neutral-200 bg-white px-5 py-6 lg:min-h-[calc(100svh-4rem)] lg:w-[30%] lg:min-w-[300px] lg:border-l lg:border-t-0 lg:px-6">
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
      <ChatList
        chats={chats}
        selectedConversation={selectedConversation}
        onSelect={onOpenConversation}
      />
    </aside>
  );
}

function PeopleSearch({ term, search, openingUserId, error, onOpen }) {
  if (!term) return null;

  let content;
  if (term.length < MIN_SEARCH_LENGTH) {
    content = <p className="py-2 text-sm text-neutral-500">Type at least 3 characters.</p>;
  } else if (!API_V1_URL) {
    content = <p className="py-2 text-sm text-red-700">API URL is not configured.</p>;
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

function ChatList({ chats, selectedConversation, onSelect }) {
  let content;
  if (!API_ROOT_URL) {
    content = <p className="py-2 text-sm text-red-700">API URL is not configured.</p>;
  } else if (chats.loading) {
    content = <p className="py-2 text-sm text-neutral-500">Loading chats...</p>;
  } else if (chats.error) {
    content = <p role="alert" className="py-2 text-sm text-red-700">{chats.error}</p>;
  } else if (!chats.items.length) {
    content = <p className="py-2 text-sm text-neutral-500">No chats right now.</p>;
  } else {
    content = (
      <ul className="space-y-1">
        {chats.items.map((chat) => {
          const lastMessage = selectedConversation?.id === chat.id
            ? selectedConversation.lastMessage
            : chat.lastMessage;

          return (
            <li key={chat.id}>
              <button
                type="button"
                onClick={() => onSelect(chat)}
                aria-current={selectedConversation?.id === chat.id ? "true" : undefined}
                className={`w-full rounded-lg px-3 py-3 text-left transition-colors ${
                  selectedConversation?.id === chat.id ? "bg-neutral-100" : "hover:bg-neutral-50"
                }`}
              >
                <p className="text-sm font-medium text-neutral-900">{chat.otherUser.username}</p>
                <p className="mt-1 truncate text-xs text-neutral-500">
                  {lastMessage?.text || "No messages yet"}
                </p>
              </button>
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
