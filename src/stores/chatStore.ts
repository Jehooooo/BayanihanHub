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
  fetchChats: (userId: string) => void;
  setActiveChat: (chatId: string) => void;
  sendMessage: (chatId: string, senderId: string, content: string, type?: 'text' | 'image') => void;
  markMessagesAsRead: (chatId: string, userId: string) => void;
  createChat: (participantIds: string[]) => Chat;
  getOtherParticipant: (chat: Chat, currentUserId: string) => User | undefined;
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  isTyping: false,

  fetchChats: (userId: string) => {
    set({ isLoading: true });

    setTimeout(() => {
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

      set({ chats: userChats, isLoading: false });
    }, 300);
  },

  setActiveChat: (chatId: string) => {
    const chat = get().chats.find((c) => c.id === chatId) ?? null;
    const chatMessages = mockMessages
      .filter((m) => m.chatId === chatId)
      .map((msg) => ({
        ...msg,
        sender: getUserById(msg.senderId),
      }))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    set({ activeChat: chat, messages: chatMessages });
  },

  sendMessage: (chatId: string, senderId: string, content: string, type = 'text') => {
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

    mockMessages.push(newMessage);

    const { messages, chats } = get();
    set({
      messages: [...messages, newMessage],
      chats: chats.map((c) =>
        c.id === chatId
          ? { ...c, lastMessage: newMessage, updatedAt: new Date().toISOString() }
          : c
      ),
    });

    // Simulate "typing" and auto-reply after a delay for demo
    set({ isTyping: true });
    setTimeout(() => {
      set({ isTyping: false });
    }, 2000);
  },

  markMessagesAsRead: (chatId: string, userId: string) => {
    const { messages, chats } = get();
    const updatedMessages = messages.map((m) =>
      m.chatId === chatId && m.senderId !== userId ? { ...m, isRead: true } : m
    );
    const updatedChats = chats.map((c) =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    );
    set({ messages: updatedMessages, chats: updatedChats });
  },

  createChat: (participantIds: string[]) => {
    // Check if chat already exists
    const existingChat = get().chats.find((c) =>
      participantIds.every((pid) => c.participants.includes(pid))
    );
    if (existingChat) return existingChat;

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
