"use client";

import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { SOCKET_EVENTS, socket } from "../lib/socket.js";

export function useChats(isEnabled) {
  const [chats, setChats] = useState({ items: [], loading: true, error: "" });

  useEffect(() => {
    if (!isEnabled) return;

    const controller = new AbortController();
    const { signal } = controller;

    async function fetchChats() {
      const { conversations } = await apiRequest("/conversations", { signal });
      setChats({ items: conversations, loading: false, error: "" });
    }

    async function loadChats() {
      try {
        await fetchChats();
      } catch (error) {
        if (!signal.aborted) setChats({ items: [], loading: false, error: error.message });
      }
    }

    async function reloadChats() {
      try {
        await fetchChats();
      } catch {
        // Keep showing the current list if the refresh fails.
      }
    }

    function handleNewMessage({ message, conversation }) {
      setChats((current) => ({
        ...current,
        items: withLastMessage(withChat(current.items, conversation), conversation.id, message),
      }));
    }

    socket.on(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
    socket.io.on("reconnect", reloadChats);
    socket.connect();
    loadChats();

    return () => {
      socket.off(SOCKET_EVENTS.NEW_MESSAGE, handleNewMessage);
      socket.io.off("reconnect", reloadChats);
      socket.disconnect();
      controller.abort();
    };
  }, [isEnabled]);

  function addChat(chat) {
    setChats((current) => ({ ...current, items: withChat(current.items, chat) }));
  }

  function updateLastMessage(conversationId, message) {
    setChats((current) => ({
      ...current,
      items: withLastMessage(current.items, conversationId, message),
    }));
  }

  return { chats, addChat, updateLastMessage };
}

function withChat(items, chat) {
  if (items.some((item) => item.id === chat.id)) return items;
  return [chat, ...items];
}

function withLastMessage(items, conversationId, message) {
  const chat = items.find((item) => item.id === conversationId);
  if (!chat) return items;

  const updatedChat = {
    ...chat,
    lastMessage: { text: message.text, sender: message.senderId, createdAt: message.createdAt },
    updatedAt: message.createdAt,
  };
  const otherChats = items.filter((item) => item.id !== conversationId);
  return [updatedChat, ...otherChats];
}
