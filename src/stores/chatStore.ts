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
  isPartnerTyping: boolean;
  partnerTypingName: string;
  _pollInterval: ReturnType<typeof setInterval> | null;
  /** Set of optimistic message IDs that haven't been confirmed by the server yet */
  _pendingMessageIds: Set<string>;
  fetchChats: (userId: string) => Promise<void>;
  setActiveChat: (chatId: string, userId?: string) => Promise<void>;
  sendMessage: (
    chatId: string,
    senderId: string,
    content: string,
    type?: 'text' | 'image' | 'file',
    fileUrl?: string,
    fileName?: string,
    replyToMessageId?: string,
  ) => Promise<void>;
  reactToMessage: (
    chatId: string,
    messageId: string,
    userId: string,
    reaction: string
  ) => Promise<void>;
  unsendMessage: (
    chatId: string,
    messageId: string,
    userId: string
  ) => Promise<void>;
  editMessage: (
    chatId: string,
    messageId: string,
    userId: string,
    newContent: string
  ) => Promise<void>;
  markMessagesAsRead: (chatId: string, userId?: string) => Promise<void>;
  sendTypingStatus: (chatId: string, userId: string, isTyping: boolean) => Promise<void>;
  sendPresencePing: (userId: string) => Promise<void>;
  createChat: (participantIds: string[]) => Promise<Chat>;
  getOtherParticipant: (chat: Chat, currentUserId: string) => User | undefined;
  addChat: (chat: Chat) => void;
  startPolling: (chatId: string, userId: string) => void;
  stopPolling: () => void;
}

const createFallbackUser = (
  id: string,
  fullName: string,
  username = 'neighbor',
  email?: string,
  avatar = '',
  lastActive?: string,
  isOnline?: boolean
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
  lastActive: lastActive || new Date().toISOString(),
  ...(isOnline !== undefined ? { isOnline } : {}),
});

export const useChatStore = create<ChatState>((set, get) => ({
  chats: [],
  activeChat: null,
  messages: [],
  isLoading: false,
  isLoadingMessages: false,
  isTyping: false,
  isPartnerTyping: false,
  partnerTypingName: '',
  _pollInterval: null,
  _pendingMessageIds: new Set<string>(),

  fetchChats: async (userId: string) => {
    set({ isLoading: true });

    try {
      const res = await fetch(`/api/conversations?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`);
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
      const res = await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages?userId=${encodeURIComponent(effectiveUserId)}&user_id=${encodeURIComponent(effectiveUserId)}`);
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

  sendMessage: async (
    chatId: string,
    senderId: string,
    content: string,
    type: 'text' | 'image' | 'file' = 'text',
    fileUrl?: string,
    fileName?: string,
    replyToMessageId?: string,
  ) => {
    const tempId = generateId();
    const newMessage: Message = {
      id: tempId,
      chatId,
      senderId,
      sender: getUserById(senderId),
      content,
      type,
      fileUrl,
      fileName,
      replyToMessageId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // ─── Optimistic UI update ─────────────────────────────────────────────
    // Register tempId as pending so the polling loop will NOT overwrite it.
    const pendingIds = new Set(get()._pendingMessageIds);
    pendingIds.add(tempId);
    const { messages, chats } = get();
    set({
      messages: [...messages, newMessage],
      _pendingMessageIds: pendingIds,
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
          fileUrl,
          fileName,
          replyToMessageId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        // Replace the optimistic message with the server-confirmed version
        const confirmedMsg: Message = data.message
          ? { ...newMessage, ...data.message }
          : newMessage;

        // Remove tempId from pending set and swap the optimistic message
        const updatedPending = new Set(get()._pendingMessageIds);
        updatedPending.delete(tempId);
        set({
          _pendingMessageIds: updatedPending,
          messages: get().messages.map((m) =>
            m.id === tempId ? confirmedMsg : m
          ),
        });
      } else {
        // Mark the message as failed so the UI can show an error state
        const updatedPending = new Set(get()._pendingMessageIds);
        updatedPending.delete(tempId);
        set({
          _pendingMessageIds: updatedPending,
          messages: get().messages.map((m) =>
            m.id === tempId ? { ...m, sendFailed: true } : m
          ),
        });
      }
    } catch {
      // Network error — mark as failed
      const updatedPending = new Set(get()._pendingMessageIds);
      updatedPending.delete(tempId);
      set({
        _pendingMessageIds: updatedPending,
        messages: get().messages.map((m) =>
          m.id === tempId ? { ...m, sendFailed: true } : m
        ),
      });
    }

    mockMessages.push(newMessage);

    // Stop typing state on server after sending
    get().sendTypingStatus(chatId, senderId, false);
  },

  reactToMessage: async (
    chatId: string,
    messageId: string,
    userId: string,
    reaction: string
  ) => {
    const currentMessages = get().messages;
    const target = currentMessages.find((m) => m.id === messageId);
    if (!target || target.isUnsent) return;

    // Compute optimistic reaction state
    const currentReactions = target.reactions || [];
    const existingIndex = currentReactions.findIndex((r) => r.userId === userId);
    let optimisticReactions = [...currentReactions];

    if (existingIndex >= 0) {
      if (currentReactions[existingIndex].reaction === reaction) {
        // Same emoji -> toggle off
        optimisticReactions.splice(existingIndex, 1);
      } else {
        // Different emoji -> replace
        optimisticReactions[existingIndex] = { userId, reaction };
      }
    } else {
      // New reaction
      optimisticReactions.push({ userId, reaction });
    }

    // Apply optimistic update
    set({
      messages: currentMessages.map((m) =>
        m.id === messageId ? { ...m, reactions: optimisticReactions } : m
      ),
    });

    try {
      const res = await fetch(
        `/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/react`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, reaction }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.reactions) {
          set({
            messages: get().messages.map((m) =>
              m.id === messageId ? { ...m, reactions: data.reactions } : m
            ),
          });
        }
      } else {
        // Rollback on HTTP error
        set({ messages: currentMessages });
      }
    } catch {
      // Rollback on network error
      set({ messages: currentMessages });
    }
  },

  unsendMessage: async (chatId: string, messageId: string, userId: string) => {
    const currentMessages = get().messages;
    const target = currentMessages.find((m) => m.id === messageId);
    if (!target || target.isUnsent) return;

    // Optimistic unsend
    const optimisticMessages = currentMessages.map((m) =>
      m.id === messageId
        ? {
            ...m,
            isUnsent: true,
            content: 'This message was unsent.',
            fileUrl: undefined,
            fileName: undefined,
            reactions: [],
            unsentAt: new Date().toISOString(),
          }
        : m
    );

    set({ messages: optimisticMessages });

    try {
      const res = await fetch(
        `/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/unsend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to unsend message');
      }
    } catch (err: any) {
      // Rollback
      set({ messages: currentMessages });
      throw err;
    }
  },

  editMessage: async (chatId: string, messageId: string, userId: string, newContent: string) => {
    const currentMessages = get().messages;
    const target = currentMessages.find((m) => m.id === messageId);
    if (!target || target.isUnsent) return;

    // Optimistic edit
    const optimisticMessages = currentMessages.map((m) =>
      m.id === messageId
        ? {
            ...m,
            content: newContent,
            isEdited: true,
            editedAt: new Date().toISOString(),
          }
        : m
    );

    set({ messages: optimisticMessages });

    try {
      const res = await fetch(
        `/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/edit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, content: newContent }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to edit message');
      }
    } catch (err: any) {
      // Rollback
      set({ messages: currentMessages });
      throw err;
    }
  },

  sendTypingStatus: async (chatId: string, userId: string, isTyping: boolean) => {
    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isTyping }),
      });
    } catch {
      // Ephemeral event — swallow network errors
    }
  },

  sendPresencePing: async (userId: string) => {
    try {
      await fetch('/api/conversations/presence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Ephemeral heartbeat — swallow network errors
    }
  },

  startPolling: (chatId: string, userId: string) => {
    // Clear any existing interval before starting a new one
    const existing = get()._pollInterval;
    if (existing) clearInterval(existing);

    const interval = setInterval(async () => {
      // Only poll if this conversation is still active
      if (get().activeChat?.id !== chatId) return;
      try {
        // 1. Fetch latest messages (including read receipts)
        const res = await fetch(
          `/api/conversations/${encodeURIComponent(chatId)}/messages?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            const current = get().messages;
            const pending = get()._pendingMessageIds;

            // ─── Merge strategy ──────────────────────────────────────────
            // Keep any optimistic messages that the server doesn't know about yet.
            // These are messages whose tempId is still in _pendingMessageIds.
            const serverIds = new Set((data.messages as Message[]).map((m) => m.id));
            const pendingMsgs = current.filter(
              (m) => pending.has(m.id) && !serverIds.has(m.id)
            );

            // Detect actual changes in server messages (ignoring pending-only diffs)
            const serverChanged =
              data.messages.length !== current.filter((m) => !pending.has(m.id)).length ||
              data.messages.some((m: Message, idx: number) => {
                const nonPending = current.filter((cm) => !pending.has(cm.id));
                const cur = nonPending[idx];
                if (!cur) return true;
                if (cur.id !== m.id) return true;
                if (cur.content !== m.content) return true;
                if (cur.isUnsent !== m.isUnsent) return true;
                if (cur.isEdited !== m.isEdited) return true;
                if (cur.isRead !== m.isRead || (cur as any).seen !== (m as any).seen) return true;
                if ((cur.reactions?.length ?? 0) !== (m.reactions?.length ?? 0)) return true;
                const curRxns = (cur.reactions || []).map((r) => `${r.userId}:${r.reaction}`).sort().join(',');
                const mRxns = (m.reactions || []).map((r) => `${r.userId}:${r.reaction}`).sort().join(',');
                return curRxns !== mRxns;
              });

            if (serverChanged || pendingMsgs.length > 0) {
              // Merge: server messages first, then any still-pending optimistic ones appended
              const merged = [
                ...data.messages,
                ...pendingMsgs,
              ];
              set({ messages: merged });
            }
          }
        }

        // 2. Fetch partner typing status (ephemeral)
        const typingRes = await fetch(
          `/api/conversations/${encodeURIComponent(chatId)}/typing?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`
        );
        if (typingRes.ok) {
          const typingData = await typingRes.json();
          if (typingData.isTyping && typingData.typingUsers?.length > 0) {
            set({
              isPartnerTyping: true,
              partnerTypingName: typingData.typingUsers[0]?.name || '',
            });
          } else {
            set({ isPartnerTyping: false, partnerTypingName: '' });
          }
        }
      } catch {
        // Swallow — don't interrupt UX on network hiccup
      }
    }, 2500);

    set({ _pollInterval: interval });
  },

  stopPolling: () => {
    const interval = get()._pollInterval;
    if (interval) {
      clearInterval(interval);
      set({ _pollInterval: null, isPartnerTyping: false, partnerTypingName: '' });
    }
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
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/read?userId=${encodeURIComponent(effectiveUserId)}&user_id=${encodeURIComponent(effectiveUserId)}`, {
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
        op.avatar,
        op.lastActive,
        op.isOnline
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
