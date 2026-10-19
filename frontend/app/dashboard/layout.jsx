"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardSidebar from "../../components/DashboardSidebar.jsx";
import { DashboardContext } from "../../components/DashboardContext.js";
import { apiRequest } from "../../lib/api.js";

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { conversationId } = useParams();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [chats, setChats] = useState({ items: [], loading: true, error: "" });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    async function load() {
      try {
        const { user: currentUser } = await apiRequest("/users/me", { signal });
        setUser(currentUser);
        setStatus("ready");
      } catch (error) {
        if (signal.aborted) return;
        if (error.status === 401) router.replace("/login");
        else setStatus("error");
        return;
      }

      try {
        const { conversations } = await apiRequest("/conversations", { signal });
        setChats({ items: conversations, loading: false, error: "" });
      } catch (error) {
        if (!signal.aborted) setChats({ items: [], loading: false, error: error.message });
      }
    }

    load();
    return () => controller.abort();
  }, [router]);

  function addChat(chat) {
    setChats((current) => {
      if (current.items.some((item) => item.id === chat.id)) return current;
      return { ...current, items: [chat, ...current.items] };
    });
  }

  function updateLastMessage(conversationId, message) {
    setChats((current) => {
      const chat = current.items.find((item) => item.id === conversationId);
      if (!chat) return current;

      const updatedChat = {
        ...chat,
        lastMessage: { text: message.text, sender: message.senderId, createdAt: message.createdAt },
        updatedAt: message.createdAt,
      };
      const otherChats = current.items.filter((item) => item.id !== conversationId);
      return { ...current, items: [updatedChat, ...otherChats] };
    });
  }

  if (status === "loading") {
    return <StatusMessage>Checking your session...</StatusMessage>;
  }
  if (status === "error") {
    return <StatusMessage>Could not verify your session. Please try again.</StatusMessage>;
  }

  return (
    <DashboardContext value={{ user, chats: chats.items, updateLastMessage }}>
      <div className="flex h-[calc(100svh-4rem)]">
        <div className={`min-w-0 flex-1 ${conversationId ? "" : "hidden lg:block"}`}>
          {children}
        </div>
        <div className={`w-full lg:block lg:w-[30%] lg:min-w-[300px] ${conversationId ? "hidden" : ""}`}>
          <DashboardSidebar
            chats={chats}
            activeConversationId={conversationId}
            onChatStarted={addChat}
          />
        </div>
      </div>
    </DashboardContext>
  );
}

function StatusMessage({ children }) {
  return (
    <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-neutral-50 px-5 text-center text-sm text-neutral-600">
      {children}
    </div>
  );
}
