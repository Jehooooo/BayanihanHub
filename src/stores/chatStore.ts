// ============================================================
// Bayanihan Hub — Chat Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Chat, Message, User } from '../types';
import { mockChats, mockMessages, mockUsers, generateId, getUserById } from '../data/mockData';

interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  isLoadingMessages: boolean;
  isTyping: boolean;
  fetchChats: (userId: string) => Promise<void>;
  setActiveChat: (chatId: string, userId?: string) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, content: string, type?: 'text' | 'image') => Promise<void>;
  markMessagesAsRead: (chatId: string, userId?: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<Chat>;
  getOtherParticipant: (chat: Chat, currentUserId: string) => User | undefined;
  addChat: (chat: Chat) => void;
}

const createFallbackUser = (
  id: string,
  fullName: string,
  username = 'neighbor',
  email?: string,
  avatar = ''
): User => ({
  id,
  fullName,
  username,
  email: email || `${username}@example.com`,
  phone: '+63 900 000 0000',
  address: 'Barangay Center',
  barangay: 'Poblacion',
  municipality: 'San Fernando',
  province: 'La Union',
  avatar,
  role: 'user',
  isVerified: true,
  account_status: 'APPROVED',
  facial_verification_status: 'PASSED',
  id_verification_status: 'VERIFIED',
  verificationStatus: 'APPROVED',
  isTrusted: true,
  isSuspended: false,
  rating: 5.0,
  totalRatings: 1,
  totalExchanges: 0,
  totalDonations: 1,
  badges: [],
  joinedAt: '2025-06-15T08:00:00Z',
  lastActive: new Date().toISOString(),
});

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  isTyping: false,

  fetchChats: async (userId: string) => {
    set({ isLoading: true });

    try {
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        const apiChats: Chat[] = data.chats || data.conversations || [];
        const apiChatIds = new Set(apiChats.map((c) => c.id));

        const userMockChats = mockChats
          .filter((c) => c.participants.includes(userId) && !apiChatIds.has(c.id))
          .map((chat) => {
            const chatMessages = mockMessages.filter((m) => m.chatId === chat.id);
            const lastMessage = chatMessages.length > 0
              ? chatMessages.sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )[0]
              : undefined;

            return {
              ...chat,
              lastMessage,
              messageCount: chatMessages.length,
              totalMessages: chatMessages.length,
              participantUsers: chat.participants
                .map((pid) => getUserById(pid))
                .filter(Boolean) as User[],
            };
          });

        const combined = [...apiChats, ...userMockChats].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        const currentActive = get().activeChat;
        const chatsWithActiveRead = currentActive
          ? combined.map((c) => (c.id === currentActive.id ? { ...c, unreadCount: 0 } : c))
          : combined;
        const updatedActive = currentActive
          ? chatsWithActiveRead.find((c) => c.id === currentActive.id) || currentActive
          : null;

        set({ chats: chatsWithActiveRead, activeChat: updatedActive, isLoading: false });
        return;
      }
    } catch {
      // Fallback to mock data
    }

    const userChats = mockChats
      .filter((c) => c.participants.includes(userId))
      .map((chat) => {
        const chatMessages = mockMessages.filter((m) => m.chatId === chat.id);
        const lastMessage = chatMessages.length > 0
          ? chatMessages.sort(
              (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )[0]
          : undefined;

        return {
          ...chat,
          lastMessage,
          messageCount: chatMessages.length,
          totalMessages: chatMessages.length,
          participantUsers: chat.participants
            .map((pid) => getUserById(pid))
            .filter(Boolean) as User[],
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const currentActive = get().activeChat;
    const chatsWithActiveRead = currentActive
      ? userChats.map((c) => (c.id === currentActive.id ? { ...c, unreadCount: 0 } : c))
      : userChats;
    const updatedActive = currentActive
      ? chatsWithActiveRead.find((c) => c.id === currentActive.id) || currentActive
      : null;

    set({ chats: chatsWithActiveRead, activeChat: updatedActive, isLoading: false });
  },

  setActiveChat: async (chatId: string, userId?: string) => {
    let chat = get().chats.find((c) => c.id === chatId) ?? null;
    if (!chat) {
      const mockC = mockChats.find((c) => c.id === chatId);
      if (mockC) chat = mockC;
    }
    if (chat) {
      set({
        activeChat: { ...chat, unreadCount: 0 },
        chats: get().chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
        isLoadingMessages: true,
      });
    } else {
      set({ isLoadingMessages: true });
    }

    const effectiveUserId = userId || 'user-1';
    get().markMessagesAsRead(chatId, effectiveUserId);

    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const count = data.messages.length;
          if (!chat) {
            chat = get().chats.find((c) => c.id === chatId) ?? null;
          }
          const updatedChat = chat ? { ...chat, messageCount: count, totalMessages: count, unreadCount: 0 } : null;
          set({
            activeChat: updatedChat || get().activeChat,
            messages: data.messages,
            chats: get().chats.map((c) =>
              c.id === chatId ? { ...c, messageCount: count, totalMessages: count, unreadCount: 0 } : c
            ),
            isLoadingMessages: false,
          });
          return;
        }
      }
    } catch {
      // Fallback
    }

    const chatMessages = mockMessages
      .filter((m) => m.chatId === chatId)
      .map((msg) => ({
        ...msg,
        sender: getUserById(msg.senderId),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const count = chatMessages.length;
    const updatedChat = chat ? { ...chat, messageCount: count, totalMessages: count, unreadCount: 0 } : null;

    set({
      activeChat: updatedChat || get().activeChat,
      messages: chatMessages,
      chats: get().chats.map((c) =>
        c.id === chatId ? { ...c, messageCount: count, totalMessages: count, unreadCount: 0 } : c
      ),
      isLoadingMessages: false,
    });
  },

  sendMessage: async (chatId: string, senderId: string, content: string, type = 'text') => {
    const newMessage: Message = {
      id: generateId(),
      chatId,
      senderId,
      sender: getUserById(senderId),
      content,
      type,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
    const { messages, chats } = get();
    set({
      messages: [...messages, newMessage],
      chats: chats.map((c) =>
        c.id === chatId
          ? {
              ...c,
              lastMessage: newMessage,
              messageCount: (c.messageCount ?? 0) + 1,
              totalMessages: (c.totalMessages ?? 0) + 1,
              updatedAt: new Date().toISOString(),
            }
          : c
      ),
    });

    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          content,
          type,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          set({
            messages: get().messages.map((m) =>
              m.id === newMessage.id ? { ...m, ...data.message } : m
            ),
          });
        }
      }
    } catch {
      // Fallback
    }

    mockMessages.push(newMessage);

    // Simulate "typing" indicator feedback
    set({ isTyping: true });
    setTimeout(() => {
      set({ isTyping: false });
    }, 1500);
  },

  markMessagesAsRead: async (chatId: string, userId?: string) => {
    const effectiveUserId = userId || 'user-1';
    const { messages, chats } = get();
    const updatedMessages = messages.map((m) =>
      m.chatId === chatId && m.senderId !== effectiveUserId ? { ...m, isRead: true } : m
    );
    const updatedChats = chats.map((c) =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    );
    const updatedActive =
      get().activeChat?.id === chatId
        ? { ...get().activeChat!, unreadCount: 0 }
        : get().activeChat;

    set({ messages: updatedMessages, chats: updatedChats, activeChat: updatedActive });

    const mockC = mockChats.find((c) => c.id === chatId);
    if (mockC) mockC.unreadCount = 0;

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/read?userId=${encodeURIComponent(effectiveUserId)}`, {
        method: 'PATCH',
      });
    } catch {
      // Fallback
    }
  },

  createChat: async (participantIds: string[]) => {
    const existingChat = get().chats.find((c) =>
      participantIds.every((pid) => c.participants.includes(pid))
    );
    if (existingChat) return existingChat;

    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantIds }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          set({ chats: [data.conversation, ...get().chats] });
          return data.conversation;
        }
      }
    } catch {
      // Fallback
    }

    const newChat: Chat = {
      id: generateId(),
      participants: participantIds,
      participantUsers: participantIds
        .map((pid) => mockUsers.find((u) => u.id === pid))
        .filter(Boolean) as User[],
      unreadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockChats.push(newChat);
    set({ chats: [newChat, ...get().chats] });
    return newChat;
  },

  addChat: (chat: Chat) => {
    const existing = get().chats.find((c) => c.id === chat.id);
    if (!existing) {
      set({ chats: [chat, ...get().chats], activeChat: chat });
    } else {
      set({ activeChat: existing });
    }
  },

  getOtherParticipant: (chat: Chat, currentUserId: string): User | undefined => {
    // 1. Check if backend provided otherParticipant
    if ((chat as any).otherParticipant) {
      const op = (chat as any).otherParticipant;
      return createFallbackUser(
        op.id || `user-${op.userId || 1}`,
        op.fullName || op.name || 'Neighbor',
        op.username || 'neighbor',
        op.email,
        op.avatar
      );
    }

    // 2. Check chat.participantUsers
    if (chat.participantUsers && chat.participantUsers.length > 0) {
      const pUser = chat.participantUsers.find(
        (u) =>
          u.id !== currentUserId &&
          String(u.id).replace('user-', '') !== String(currentUserId).replace('user-', '')
      );
      if (pUser) {
        return createFallbackUser(
          pUser.id,
          pUser.fullName || 'Neighbor',
          pUser.username || 'neighbor',
          pUser.email,
          pUser.avatar
        );
      }
    }

    // 3. Check mockUsers / getUserById
    const otherId = chat.participants.find(
      (pid) =>
        pid !== currentUserId &&
        String(pid).replace('user-', '') !== String(currentUserId).replace('user-', '')
    );
    if (otherId) {
      const mock =
        getUserById(otherId) ||
        mockUsers.find((u) => u.id === otherId || `user-${u.id}` === otherId);
      if (mock) return mock;

      // 4. Synthesize a valid fallback User so UI always renders cleanly
      return createFallbackUser(
        otherId,
        (chat as any).title || (chat as any).recipientName || 'Neighbor',
        'neighbor',
        `${otherId}@example.com`
      );
    }

    return undefined;
  },
}));
