import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export default function MessagingPage() {
  const location = useLocation();
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

  // Read target chat from navigation state or URL query parameter
  const searchParams = new URLSearchParams(location.search);
  const targetChatId =
    (location.state as { activeChatId?: string })?.activeChatId ||
    searchParams.get('chatId');

  useEffect(() => {
    const navState = location.state as { activeChatId?: string; initialChat?: any } | undefined;
    if (navState?.initialChat) {
      useChatStore.getState().addChat(navState.initialChat);
    }
  }, [location.state]);

  useEffect(() => {
    if (targetChatId && activeChat?.id !== targetChatId) {
      setActiveChat(targetChatId, currentUserId);
    }
    fetchChats(currentUserId).then(() => {
      if (targetChatId) {
        setActiveChat(targetChatId, currentUserId);
      }
    });
  }, [currentUserId, fetchChats, targetChatId, setActiveChat]);

  useEffect(() => {
    if (targetChatId) {
      if (activeChat?.id !== targetChatId && chats.some((c) => c.id === targetChatId)) {
        setActiveChat(targetChatId, currentUserId);
      }
    }
  }, [chats, activeChat, targetChatId, currentUserId, setActiveChat]);

  const partner = activeChat
    ? getOtherParticipant(activeChat, currentUserId)
    : undefined;

  return (
    <PageLayout showSidebar={true}>
      <div
        style={{ height: 'calc(100vh - 7.5rem)', maxHeight: 'calc(100vh - 7.5rem)' }}
        className="bg-white rounded-[var(--radius-xl)] border border-neutral-200 shadow-card overflow-hidden flex"
      >
        <div className={`w-full md:w-80 shrink-0 h-full border-r border-neutral-200 ${activeChat ? 'hidden md:block' : 'block'}`}>
          <ConversationList
            chats={chats}
            activeChatId={activeChat?.id}
            onSelectChat={(chatId) => setActiveChat(chatId, currentUserId)}
            currentUserId={currentUserId}
            getOtherParticipant={getOtherParticipant}
          />
        </div>

        <div className={`flex-1 h-full min-w-0 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
          <ChatWindow
            chat={activeChat}
            messages={messages}
            currentUserId={currentUserId}
            partner={partner}
            isTyping={isTyping}
            onSendMessage={(text) => {
              if (activeChat) sendMessage(activeChat.id, currentUserId, text);
            }}
            onBack={() => {
              useChatStore.setState({ activeChat: null });
            }}
          />
        </div>
      </div>
    </PageLayout>
  );
}
