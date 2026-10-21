"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { SOCKET_EVENTS, socket } from "../lib/socket.js";
import { useRedirectIfUnauthorized } from "./useRedirectIfUnauthorized.js";

export function useConversationMessages(conversationId) {
  const redirectIfUnauthorized = useRedirectIfUnauthorized();
  const scrollBoxRef = useRef(null);
  const keepDistanceFromBottomRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [hasMore, setHasMore] = useState(false);
  const [status, setStatus] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [olderError, setOlderError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const messagesPath = `/conversations/${conversationId}/messages`;

  useEffect(() => {
    const controller = new AbortController();

    async function loadMessages() {
      try {
        const result = await apiRequest(messagesPath, { signal: controller.signal });
        setMessages(result.messages);
        setHasMore(result.hasMore);
        setStatus("ready");
      } catch (error) {
        if (controller.signal.aborted || redirectIfUnauthorized(error)) return;
        if (error.status === 404) {
          setStatus("not-found");
          return;
        }
        setLoadError(error.message);
        setStatus("error");
      }
    }

    loadMessages();
    return () => controller.abort();
  }, [messagesPath, redirectIfUnauthorized]);

  useEffect(() => {
    function handleNewMessage({ message }) {
      if (message.conversationId !== conversationId) return;
      setMessages((current) => mergeMessages(current, [message]));
    }

    async function catchUp() {
      try {
        const result = await apiRequest(messagesPath);
        setMessages((current) => mergeMessages(current, result.messages));
      } catch {
        // Keep showing the messages already loaded if the refresh fails.
      }
    }

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.io.on("reconnect", catchUp);

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.io.off("reconnect", catchUp);
    };
  }, [conversationId, messagesPath]);

  useLayoutEffect(() => {
    const box = scrollBoxRef.current;
    if (!box) return;

    if (keepDistanceFromBottomRef.current === null) {
      box.scrollTop = box.scrollHeight;
      return;
    }
    box.scrollTop = box.scrollHeight - keepDistanceFromBottomRef.current;
    keepDistanceFromBottomRef.current = null;
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
      if (!redirectIfUnauthorized(error)) setOlderError(error.message);
    } finally {
      setIsLoadingOlder(false);
    }
  }

  async function sendMessage(text) {
    if (!text || isSending) return null;

    setIsSending(true);
    setSendError("");
    try {
      const { message } = await apiRequest(messagesPath, { method: "POST", body: { text } });
      setMessages((current) => mergeMessages(current, [message]));
      return message;
    } catch (error) {
      if (!redirectIfUnauthorized(error)) setSendError(error.message);
      return null;
    } finally {
      setIsSending(false);
    }
  }

  return {
    scrollBoxRef,
    messages,
    hasMore,
    status,
    loadError,
    loadOlder,
    isLoadingOlder,
    olderError,
    sendMessage,
    isSending,
    sendError,
  };
}

function mergeMessages(current, incoming) {
  const byId = new Map([...current, ...incoming].map((message) => [message.id, message]));
  return [...byId.values()].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}
