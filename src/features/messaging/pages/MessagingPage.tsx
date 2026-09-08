import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import { useChatStore } from '@/stores/chatStore';
import { useAuthStore } from '@/stores/authStore';

export default function MessagingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const { user } = useAuthStore();
  const {
    chats,
    activeChat,
    messages,
    isTyping,
    isLoadingMessages,
    fetchChats,
    setActiveChat,
    sendMessage,
    getOtherParticipant,
  } = useChatStore();

  const currentUserId = user?.id ?? 'user-1';

  // Explicit target chat ONLY from intentional flows (route param /messages/:conversationId, query ?chatId, or nav state)
  const searchParams = new URLSearchParams(location.search);
  const explicitChatId =
    conversationId ||
    (location.state as { activeChatId?: string })?.activeChatId ||
    searchParams.get('chatId') ||
    undefined;

  useEffect(() => {
    const navState = location.state as { activeChatId?: string; initialChat?: any } | undefined;
    if (navState?.initialChat) {
      useChatStore.getState().addChat(navState.initialChat);
    }
  }, [location.state]);

  // When on general /messages route with no explicit conversation, ensure activeChat is null
  useEffect(() => {
    if (!explicitChatId && activeChat) {
      useChatStore.setState({ activeChat: null, messages: [] });
    }
  }, [explicitChatId, activeChat]);

  // Fetch conversations list on mount / user change
  useEffect(() => {
    fetchChats(currentUserId).then(() => {
      if (explicitChatId) {
        setActiveChat(explicitChatId, currentUserId);
      }
    });
  }, [currentUserId, fetchChats, explicitChatId, setActiveChat]);

  // Open explicit conversation when navigating with an ID
  useEffect(() => {
    if (explicitChatId && activeChat?.id !== explicitChatId) {
      setActiveChat(explicitChatId, currentUserId);
    }
  }, [explicitChatId, activeChat, currentUserId, setActiveChat]);

  const handleSelectChat = (chatId: string) => {
    navigate(`/messages/${encodeURIComponent(chatId)}`);
    setActiveChat(chatId, currentUserId);
  };

  const handleBack = () => {
    navigate('/messages');
    useChatStore.setState({ activeChat: null, messages: [] });
  };

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
            onSelectChat={handleSelectChat}
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
            isLoading={isLoadingMessages}
            onSendMessage={(text) => {
              if (activeChat) sendMessage(activeChat.id, currentUserId, text);
            }}
            onBack={handleBack}
          />
        </div>
      </div>
    </PageLayout>
  );
}
