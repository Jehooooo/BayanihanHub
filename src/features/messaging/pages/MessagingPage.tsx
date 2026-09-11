import { useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import type { SendMessagePayload } from '../components/MessageInput';
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
    isPartnerTyping,
    partnerTypingName,
    isLoadingMessages,
    fetchChats,
    setActiveChat,
    sendMessage,
    getOtherParticipant,
    startPolling,
    stopPolling,
    sendPresencePing,
  } = useChatStore();

  const currentUserId = user?.id;

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

  // Presence heartbeat every 45 seconds while viewing messages
  useEffect(() => {
    if (!currentUserId) return;
    sendPresencePing(currentUserId);
    const interval = setInterval(() => {
      sendPresencePing(currentUserId);
    }, 45000);
    return () => clearInterval(interval);
  }, [currentUserId, sendPresencePing]);

  // When on general /messages route with no explicit conversation, ensure activeChat is null + stop polling
  useEffect(() => {
    if (!explicitChatId && activeChat) {
      useChatStore.setState({ activeChat: null, messages: [] });
      stopPolling();
    }
  }, [explicitChatId, activeChat, stopPolling]);

  // Fetch conversations list on mount / user change
  useEffect(() => {
    if (!currentUserId) return;
    fetchChats(currentUserId).then(() => {
      if (explicitChatId) {
        setActiveChat(explicitChatId, currentUserId);
      }
    });
  }, [currentUserId, fetchChats, explicitChatId, setActiveChat]);

  // Open explicit conversation when navigating with an ID
  useEffect(() => {
    if (explicitChatId && activeChat?.id !== explicitChatId && currentUserId) {
      setActiveChat(explicitChatId, currentUserId);
    }
  }, [explicitChatId, activeChat, currentUserId, setActiveChat]);

  // Start / stop polling as the active chat changes
  useEffect(() => {
    if (activeChat && currentUserId) {
      startPolling(activeChat.id, currentUserId);
    } else {
      stopPolling();
    }
    return () => {
      stopPolling();
    };
  }, [activeChat?.id, currentUserId, startPolling, stopPolling]);

  const handleSelectChat = (chatId: string) => {
    navigate(`/messages/${encodeURIComponent(chatId)}`);
    if (currentUserId) {
      setActiveChat(chatId, currentUserId);
    }
  };

  const handleBack = () => {
    navigate('/messages');
    useChatStore.setState({ activeChat: null, messages: [] });
    stopPolling();
  };

  const handleSendMessage = (payload: SendMessagePayload) => {
    if (activeChat && currentUserId) {
      sendMessage(activeChat.id, currentUserId, payload.content, payload.type, payload.fileUrl, payload.fileName);
    }
  };

  const partner = activeChat
    ? getOtherParticipant(activeChat, currentUserId || '')
    : undefined;

  return (
    <PageLayout showSidebar={true}>
      {/*
        Negate the <main> padding (1.75rem top/bottom, 2rem left/right) so the
        messaging panel can fill the entire available viewport height without
        triggering page-level scroll.
      */}
      <div
        className="-mx-3.5 -my-4 sm:-mx-6 sm:-my-6 lg:-mx-8 lg:-my-7 h-[calc(100dvh-4rem-4.5rem)] lg:h-[calc(100vh-4rem)] flex overflow-hidden"
      >
        <div
          className="bg-white rounded-none border-0 shadow-none overflow-hidden flex w-full h-full"
          style={{ border: '1px solid var(--color-neutral-200)', borderRadius: 0 }}
        >
          {/* Conversation list panel */}
          <div className={`w-full md:w-80 shrink-0 h-full border-r border-neutral-200 ${activeChat ? 'hidden md:block' : 'block'}`}>
            <ConversationList
              chats={chats}
              activeChatId={activeChat?.id}
              onSelectChat={handleSelectChat}
              currentUserId={currentUserId || ''}
              getOtherParticipant={getOtherParticipant}
            />
          </div>

          {/* Chat window panel */}
          <div className={`flex-1 h-full min-w-0 ${activeChat ? 'flex' : 'hidden md:flex'}`}>
            <ChatWindow
              chat={activeChat}
              messages={messages}
              currentUserId={currentUserId || ''}
              partner={partner}
              isTyping={isTyping}
              isPartnerTyping={isPartnerTyping}
              partnerTypingName={partnerTypingName}
              isLoading={isLoadingMessages}
              onSendMessage={handleSendMessage}
              onBack={handleBack}
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
