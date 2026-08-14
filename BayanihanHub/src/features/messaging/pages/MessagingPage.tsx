import { useEffect } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export default function MessagingPage() {
  const { user } = useAuthStore();
  const {
    chats,
    activeChat,
    messages,
    isTyping,
    fetchChats,
    setActiveChat,
    sendMessage,
    getOtherParticipant,
  } = useChatStore();

  const currentUserId = user?.id ?? 'user-1';

  useEffect(() => {
    fetchChats(currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    if (chats.length > 0 && !activeChat) {
      setActiveChat(chats[0].id);
    }
  }, [chats]);

  const partner = activeChat
    ? getOtherParticipant(activeChat, currentUserId)
    : undefined;

  return (
    <PageLayout showSidebar={true}>
      <div className="h-[calc(100vh-7rem)] bg-white rounded-[var(--radius-xl)] border border-neutral-200 shadow-card overflow-hidden flex">
        <div className="w-full md:w-80 shrink-0 h-full border-r border-neutral-200">
          <ConversationList
            chats={chats}
            activeChatId={activeChat?.id}
            onSelectChat={setActiveChat}
            currentUserId={currentUserId}
            getOtherParticipant={getOtherParticipant}
          />
        </div>

        <div className="hidden md:flex flex-1 h-full min-w-0">
          <ChatWindow
            chat={activeChat}
            messages={messages}
            currentUserId={currentUserId}
            partner={partner}
            isTyping={isTyping}
            onSendMessage={(text) => {
              if (activeChat) sendMessage(activeChat.id, currentUserId, text);
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
