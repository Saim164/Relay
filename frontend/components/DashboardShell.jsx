"use client";

import { useState } from "react";
import ConversationChat from "./ConversationChat.jsx";
import DashboardSidebar from "./DashboardSidebar.jsx";

export default function DashboardShell({ children, user }) {
  const [conversation, setConversation] = useState(null);

  function handleMessageSent(message) {
    setConversation((current) => ({
      ...current,
      lastMessage: {
        text: message.text,
        sender: message.senderId,
        createdAt: message.createdAt,
      },
      updatedAt: message.createdAt,
    }));
  }

  return (
    <div className="flex min-h-[calc(100svh-4rem)] flex-col lg:flex-row">
      <div className="min-w-0 flex-1">
        {conversation ? (
          <ConversationChat
            key={conversation.id}
            conversation={conversation}
            currentUserId={user.id}
            onBack={() => setConversation(null)}
            onMessageSent={handleMessageSent}
          />
        ) : children}
      </div>
      <DashboardSidebar
        selectedConversation={conversation}
        onOpenConversation={setConversation}
      />
    </div>
  );
}
