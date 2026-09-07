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
  isTyping: boolean;
  fetchChats: (userId: string) => Promise<void>;
  setActiveChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, senderId: string, content: string, type?: 'text' | 'image') => Promise<void>;
  markMessagesAsRead: (chatId: string, userId: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<Chat>;
  getOtherParticipant: (chat: Chat, currentUserId: string) => User | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
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
              participantUsers: chat.participants
                .map((pid) => getUserById(pid))
                .filter(Boolean) as User[],
            };
          });

        const combined = [...apiChats, ...userMockChats].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        const currentActive = get().activeChat;
        const updatedActive = currentActive ? combined.find(c => c.id === currentActive.id) || currentActive : null;

        set({ chats: combined, activeChat: updatedActive, isLoading: false });
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
          participantUsers: chat.participants
            .map((pid) => getUserById(pid))
            .filter(Boolean) as User[],
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const currentActive = get().activeChat;
    const updatedActive = currentActive ? userChats.find(c => c.id === currentActive.id) || currentActive : null;

    set({ chats: userChats, activeChat: updatedActive, isLoading: false });
  },

  setActiveChat: async (chatId: string) => {
    let chat = get().chats.find((c) => c.id === chatId) ?? null;
    if (!chat) {
      const mockC = mockChats.find((c) => c.id === chatId);
      if (mockC) chat = mockC;
    }

    try {
      const res = await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages`);
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          if (!chat) {
            chat = get().chats.find((c) => c.id === chatId) ?? null;
          }
          set({ activeChat: chat, messages: data.messages });
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

    set({ activeChat: chat, messages: chatMessages });
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
          ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : c
      ),
    });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId,
          content,
          type,
        }),
      });
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

  markMessagesAsRead: async (chatId: string, userId: string) => {
    const { messages, chats } = get();
    const updatedMessages = messages.map((m) =>
      m.chatId === chatId && m.senderId !== userId ? { ...m, isRead: true } : m
    );
    const updatedChats = chats.map((c) =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    );
    set({ messages: updatedMessages, chats: updatedChats });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/read?userId=${encodeURIComponent(userId)}`, {
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

  getOtherParticipant: (chat: Chat, currentUserId: string) => {
    const otherId = chat.participants.find((pid) => pid !== currentUserId);
    return otherId ? getUserById(otherId) : undefined;
  },
}));
