"use client";

import { useParams } from "next/navigation";
import DashboardSidebar from "../../components/DashboardSidebar.jsx";
import { DashboardContext } from "../../components/DashboardContext.js";
import { useChats } from "../../hooks/useChats.js";
import { useSession } from "../../hooks/useSession.js";

export default function DashboardLayout({ children }) {
  const { conversationId } = useParams();
  const { status, user } = useSession();
  const { chats, addChat, updateLastMessage } = useChats(status === "ready");

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
