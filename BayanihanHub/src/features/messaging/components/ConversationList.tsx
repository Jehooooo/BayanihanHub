import Avatar from '@/components/ui/Avatar';
import SearchBar from '@/components/ui/SearchBar';
import type { Chat, User } from '@/types';
import { useState } from 'react';

interface ConversationListProps {
  chats: Chat[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
  currentUserId: string;
  getOtherParticipant: (chat: Chat, currentUserId: string) => User | undefined;
}

export default function ConversationList({
  chats,
  activeChatId,
  onSelectChat,
  currentUserId,
  getOtherParticipant,
}: ConversationListProps) {
  const [search, setSearch] = useState('');

  const filteredChats = chats.filter((chat) => {
    const partner = getOtherParticipant(chat, currentUserId);
    if (!partner) return true;
    return partner.fullName.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderRight: '1px solid var(--color-neutral-200)' }}>
      <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-neutral-100)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0 }}>Messages</h2>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search conversations..."
          size="sm"
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filteredChats.map((chat) => {
          const partner = getOtherParticipant(chat, currentUserId);
          const isActive = chat.id === activeChatId;

          return (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              style={{
                width: '100%',
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textAlign: 'left',
                border: 'none',
                borderBottom: '1px solid var(--color-neutral-100)',
                borderLeft: isActive ? '4px solid var(--color-primary-500)' : '4px solid transparent',
                backgroundColor: isActive ? 'var(--color-primary-50)' : 'transparent',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-in-out',
              }}
            >
              {partner && (
                <Avatar
                  src={partner.avatar}
                  name={partner.fullName}
                  size="md"
                  showStatus
                  isOnline
                />
              )}

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-neutral-900)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {partner?.fullName || 'User'}
                  </h4>
                  {chat.lastMessage && (
                    <span style={{ fontSize: '0.625rem', color: 'var(--color-neutral-400)' }}>
                      10:30 AM
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', margin: '0.125rem 0 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {chat.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

