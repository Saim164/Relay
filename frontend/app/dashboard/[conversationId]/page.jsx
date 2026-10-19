"use client";

import { useParams } from "next/navigation";
import ConversationChat from "../../../components/ConversationChat.jsx";
import { useDashboard } from "../../../components/DashboardContext.js";

export default function ConversationPage() {
  const { conversationId } = useParams();
  const { user, chats, updateLastMessage } = useDashboard();
  const chat = chats.find((item) => item.id === conversationId);

  return (
    <ConversationChat
      key={conversationId}
      conversationId={conversationId}
      otherUsername={chat?.otherUser.username}
      currentUserId={user.id}
      onMessageSent={(message) => updateLastMessage(conversationId, message)}
    />
  );
}
