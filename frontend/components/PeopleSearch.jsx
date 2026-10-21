"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ErrorText from "./ErrorText.jsx";
import { apiRequest } from "../lib/api.js";
import { hintClass, sectionHeadingClass } from "../lib/styles.js";
import { useRedirectIfUnauthorized } from "../hooks/useRedirectIfUnauthorized.js";

const MIN_SEARCH_LENGTH = 3;
const SEARCH_DELAY_MS = 250;

export default function PeopleSearch({ onChatStarted }) {
  const router = useRouter();
  const redirectIfUnauthorized = useRedirectIfUnauthorized();
  const [username, setUsername] = useState("");
  const [results, setResults] = useState({ term: "", users: [], error: "" });
  const [openingUserId, setOpeningUserId] = useState("");
  const [openError, setOpenError] = useState("");
  const searchTerm = username.trim();

  useEffect(() => {
    if (searchTerm.length < MIN_SEARCH_LENGTH) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { users } = await apiRequest(
          `/users/search?username=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal }
        );
        setResults({ term: searchTerm, users, error: "" });
      } catch (error) {
        if (controller.signal.aborted || redirectIfUnauthorized(error)) return;
        setResults({ term: searchTerm, users: [], error: error.message });
      }
    }, SEARCH_DELAY_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [searchTerm, redirectIfUnauthorized]);

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
      if (!redirectIfUnauthorized(error)) setOpenError(error.message);
    } finally {
      setOpeningUserId("");
    }
  }

  return (
    <>
      <label htmlFor="user-search" className="sr-only">Search users by username</label>
      <input
        id="user-search"
        type="search"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Search by username"
        className="mt-4 h-11 w-full rounded-lg border border-neutral-300 bg-neutral-50 px-3 text-sm outline-none transition placeholder:text-neutral-500 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-600/15"
      />

      {searchTerm && (
        <section className="mt-4" aria-live="polite">
          <h3 className={`mb-2 ${sectionHeadingClass}`}>People</h3>
          <SearchResults
            term={searchTerm}
            results={results}
            openingUserId={openingUserId}
            onOpen={openConversation}
          />
          {openError && <ErrorText className="mt-2">{openError}</ErrorText>}
        </section>
      )}
    </>
  );
}

function SearchResults({ term, results, openingUserId, onOpen }) {
  if (term.length < MIN_SEARCH_LENGTH) {
    return <p className={hintClass}>Type at least {MIN_SEARCH_LENGTH} characters.</p>;
  }
  if (results.term !== term) return <p className={hintClass}>Searching...</p>;
  if (results.error) return <ErrorText className="py-2">{results.error}</ErrorText>;
  if (!results.users.length) return <p className={hintClass}>No users found.</p>;

  return (
    <ul className="space-y-1">
      {results.users.map((user) => (
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
