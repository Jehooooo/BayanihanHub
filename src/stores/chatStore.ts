// ============================================================
// Bayanihan Hub — Chat Store (Zustand)
// ============================================================

import { create } from 'zustand';
import type { Chat, Message, User } from '../types';
import { generateId } from '../utils/id';
import { isSameUserId, cleanUserId, dedupeMessages } from '../utils/userId';

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
  fullName = 'Neighbor',
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
  phone: '',
  address: '',
  barangay: '',
  municipality: '',
  province: '',
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
  totalRatings: 0,
  totalExchanges: 0,
  totalDonations: 0,
  badges: [],
  joinedAt: '2026-01-01T00:00:00Z',
  lastActive: lastActive || new Date().toISOString(),
  ...(isOnline !== undefined ? { isOnline } : {}),
});

const getChatAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const raw = localStorage.getItem('bayanihan-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.user?.token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
};

const getChatHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  try {
    const raw = localStorage.getItem('bayanihan-auth');
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.user?.token;
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
  } catch {}
  return headers;
};

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
    if (!userId) {
      set({ chats: [], isLoading: false });
      return;
    }
    set({ isLoading: true });

    try {
      const res = await fetch(
        `/api/conversations?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`,
        { headers: getChatHeaders() }
      );
      if (res.ok) {
        const data = await res.json();
        const apiChats: Chat[] = data.chats || data.conversations || [];

        const currentActive = get().activeChat;
        const chatsWithActiveRead = currentActive
          ? apiChats.map((c) => (c.id === currentActive.id ? { ...c, unreadCount: 0 } : c))
          : apiChats;
        const updatedActive = currentActive
          ? chatsWithActiveRead.find((c) => c.id === currentActive.id) || currentActive
          : null;

        set({ chats: chatsWithActiveRead, activeChat: updatedActive, isLoading: false });
        return;
      }
    } catch (err) {
      console.error('[ChatStore] Error fetching chats:', err);
    }

    set({ chats: [], isLoading: false });
  },

  setActiveChat: async (chatId: string, userId?: string) => {
    const chat = get().chats.find((c) => c.id === chatId) ?? null;
    if (chat) {
      set({
        activeChat: { ...chat, unreadCount: 0 },
        chats: get().chats.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)),
        isLoadingMessages: true,
      });
    } else {
      set({ isLoadingMessages: true });
    }

    if (userId) {
      get().markMessagesAsRead(chatId, userId);
    }

    try {
      const param = userId ? `?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}` : '';
      const res = await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages${param}`, {
        headers: getChatHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.messages && Array.isArray(data.messages)) {
          const count = data.messages.length;
          const currentChat = (chat || get().chats.find((c) => c.id === chatId)) ?? null;
          const updatedChat = currentChat ? { ...currentChat, messageCount: count, totalMessages: count, unreadCount: 0 } : null;
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
    } catch (err) {
      console.error(`[ChatStore] Error fetching messages for chat ${chatId}:`, err);
    }

    set({
      messages: [],
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
      content,
      type,
      fileUrl,
      fileName,
      replyToMessageId,
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    // Optimistic UI update
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
        headers: getChatAuthHeaders(),
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
        const confirmedMsg: Message = data.message
          ? { ...newMessage, ...data.message }
          : newMessage;

        const updatedPending = new Set(get()._pendingMessageIds);
        updatedPending.delete(tempId);

        // Check if the confirmed message was already ingested by background polling
        const alreadyInList = get().messages.some((m) => m.id === confirmedMsg.id);
        const nextMessages = alreadyInList
          ? get().messages.filter((m) => m.id !== tempId)
          : get().messages.map((m) => (m.id === tempId ? confirmedMsg : m));

        set({
          _pendingMessageIds: updatedPending,
          messages: dedupeMessages(nextMessages),
        });
      } else {
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
      const updatedPending = new Set(get()._pendingMessageIds);
      updatedPending.delete(tempId);
      set({
        _pendingMessageIds: updatedPending,
        messages: get().messages.map((m) =>
          m.id === tempId ? { ...m, sendFailed: true } : m
        ),
      });
    }
  },

  reactToMessage: async (chatId: string, messageId: string, userId: string, reaction: string) => {
    const { messages } = get();
    const currentMessages = [...messages];

    set({
      messages: messages.map((m) => {
        if (m.id !== messageId) return m;
        const currentRxns = m.reactions ? [...m.reactions] : [];
        const existingIdx = currentRxns.findIndex((r) => r.userId === userId && r.reaction === reaction);

        if (existingIdx !== -1) {
          currentRxns.splice(existingIdx, 1);
        } else {
          currentRxns.push({ userId, reaction });
        }
        return { ...m, reactions: currentRxns };
      }),
    });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/react`, {
        method: 'POST',
        headers: getChatAuthHeaders(),
        body: JSON.stringify({ userId, reaction }),
      });
    } catch {
      set({ messages: currentMessages });
    }
  },

  unsendMessage: async (chatId: string, messageId: string, userId: string) => {
    const { messages } = get();
    const currentMessages = [...messages];

    set({
      messages: messages.map((m) =>
        m.id === messageId ? { ...m, isUnsent: true, content: 'This message was unsent.' } : m
      ),
    });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/unsend`, {
        method: 'POST',
        headers: getChatAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
    } catch {
      set({ messages: currentMessages });
    }
  },

  editMessage: async (chatId: string, messageId: string, userId: string, newContent: string) => {
    const { messages } = get();
    const currentMessages = [...messages];

    set({
      messages: messages.map((m) =>
        m.id === messageId ? { ...m, content: newContent, isEdited: true, editedAt: new Date().toISOString() } : m
      ),
    });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/messages/${encodeURIComponent(messageId)}/edit`, {
        method: 'PATCH',
        headers: getChatAuthHeaders(),
        body: JSON.stringify({ userId, content: newContent }),
      });
    } catch {
      set({ messages: currentMessages });
    }
  },

  sendTypingStatus: async (chatId: string, userId: string, isTyping: boolean) => {
    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/typing`, {
        method: 'POST',
        headers: getChatAuthHeaders(),
        body: JSON.stringify({ userId, isTyping }),
      });
    } catch {
      // Ephemeral event
    }
  },

  sendPresencePing: async (userId: string) => {
    try {
      await fetch('/api/conversations/presence', {
        method: 'POST',
        headers: getChatAuthHeaders(),
        body: JSON.stringify({ userId }),
      });
    } catch {
      // Ephemeral heartbeat
    }
  },

  startPolling: (chatId: string, userId: string) => {
    const existing = get()._pollInterval;
    if (existing) clearInterval(existing);

    const interval = setInterval(async () => {
      if (get().activeChat?.id !== chatId) return;
      try {
        const res = await fetch(
          `/api/conversations/${encodeURIComponent(chatId)}/messages?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`,
          { headers: getChatHeaders() }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.messages && Array.isArray(data.messages)) {
            const current = get().messages;
            const pending = get()._pendingMessageIds;

            const serverMsgs: Message[] = data.messages;
            const serverIds = new Set(serverMsgs.map((m) => m.id));

            // Exclude pending messages that already have a corresponding server message (by sender, content, and recent timestamp)
            const isPendingMatchingServer = (pendingMsg: Message, serverMsg: Message) => {
              if (!isSameUserId(pendingMsg.senderId, serverMsg.senderId)) return false;
              if (pendingMsg.content !== serverMsg.content) return false;
              const pTime = new Date(pendingMsg.createdAt).getTime();
              const sTime = new Date(serverMsg.createdAt).getTime();
              return !isNaN(pTime) && !isNaN(sTime) && Math.abs(pTime - sTime) < 15000;
            };

            const pendingMsgs = current.filter(
              (m) => pending.has(m.id) && !serverIds.has(m.id) && !serverMsgs.some((sm) => isPendingMatchingServer(m, sm))
            );

            const merged = dedupeMessages([...serverMsgs, ...pendingMsgs]);
            const serverChanged =
              merged.length !== current.length ||
              merged.some((m: Message, idx: number) => {
                const cur = current[idx];
                if (!cur || cur.id !== m.id) return true;
                if (cur.content !== m.content) return true;
                if (cur.isUnsent !== m.isUnsent || cur.isEdited !== m.isEdited) return true;
                if (cur.isRead !== m.isRead || (cur as any).seen !== (m as any).seen) return true;
                if ((cur.reactions?.length ?? 0) !== (m.reactions?.length ?? 0)) return true;
                return false;
              });

            if (serverChanged) {
              set({ messages: merged });
            }
          }
        }

        const typingRes = await fetch(
          `/api/conversations/${encodeURIComponent(chatId)}/typing?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`,
          { headers: getChatHeaders() }
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
        // Best effort
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
    if (!userId) return;
    const { messages, chats } = get();
    const updatedMessages = messages.map((m) =>
      m.chatId === chatId && m.senderId !== userId ? { ...m, isRead: true } : m
    );
    const updatedChats = chats.map((c) =>
      c.id === chatId ? { ...c, unreadCount: 0 } : c
    );
    const updatedActive =
      get().activeChat?.id === chatId
        ? { ...get().activeChat!, unreadCount: 0 }
        : get().activeChat;

    set({ messages: updatedMessages, chats: updatedChats, activeChat: updatedActive });

    try {
      await fetch(`/api/conversations/${encodeURIComponent(chatId)}/read?userId=${encodeURIComponent(userId)}&user_id=${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: getChatAuthHeaders(),
      });
    } catch {
      // Best effort
    }
  },

  createChat: async (participantIds: string[]) => {
    // 1. Prevent self-conversation
    if (participantIds.length >= 2 && isSameUserId(participantIds[0], participantIds[1])) {
      throw new Error("You can't send a message to yourself.");
    }

    const cleanReqIds = participantIds.map((pid) => cleanUserId(pid)).filter(Boolean);
    const existingChat = get().chats.find((c) => {
      const cClean = c.participants.map((pid) => cleanUserId(pid)).filter(Boolean);
      return (
        cleanReqIds.length === cClean.length &&
        cleanReqIds.every((pid) => cClean.includes(pid))
      );
    });
    if (existingChat) return existingChat;

    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: getChatAuthHeaders(),
      body: JSON.stringify({ participantIds }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.conversation) {
        set({ chats: [data.conversation, ...get().chats] });
        return data.conversation;
      }
    }

    const errData = await res.json().catch(() => ({}));
    const errorMsg =
      errData.detail?.message ||
      errData.detail ||
      errData.message ||
      'Failed to start conversation.';
    throw new Error(errorMsg);
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
    if ((chat as any).otherParticipant) {
      const op = (chat as any).otherParticipant;
      const opId = op.id || op.userId;
      if (opId && !isSameUserId(opId, currentUserId)) {
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
    }

    if (chat.participantUsers && chat.participantUsers.length > 0) {
      const pUser = chat.participantUsers.find((u) => !isSameUserId(u.id, currentUserId));
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

    const otherId = chat.participants.find((pid) => !isSameUserId(pid, currentUserId));
    if (otherId) {
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
