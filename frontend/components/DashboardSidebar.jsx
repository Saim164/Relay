import ChatList from "./ChatList.jsx";
import PeopleSearch from "./PeopleSearch.jsx";

export default function DashboardSidebar({ chats, activeConversationId, onChatStarted }) {
  return (
    <aside className="h-full overflow-y-auto border-neutral-200 bg-white px-5 py-6 lg:border-l lg:px-6">
      <h2 className="text-lg font-semibold tracking-tight text-neutral-900">Messages</h2>
      <PeopleSearch onChatStarted={onChatStarted} />
      <ChatList chats={chats} activeConversationId={activeConversationId} />
    </aside>
  );
}
