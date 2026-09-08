import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  PlusCircle,
  HandHeart,
  MessageCircle,
  Bell,
  User,
  ArrowLeftRight,
  Bookmark,
} from 'lucide-react';
import { useNotificationStore } from '@/stores/notificationStore';
import { useChatStore } from '@/stores/chatStore';

const navItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/browse', icon: Search, label: 'Browse' },
  { to: '/post', icon: PlusCircle, label: 'Post Item' },
  { to: '/requests', icon: HandHeart, label: 'Requests' },
  { to: '/exchanges', icon: ArrowLeftRight, label: 'Exchanges' },
  { to: '/saved', icon: Bookmark, label: 'Saved Items' },
  { to: '/messages', icon: MessageCircle, label: 'Messages' },
  { to: '/notifications', icon: Bell, label: 'Notifications' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const location = useLocation();
  const { unreadCount } = useNotificationStore();
  const { chats } = useChatStore();
  const unreadMessagesCount = chats.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        style={{
          display: 'none',
          flexDirection: 'column',
          width: '16rem',
          flexShrink: 0,
          position: 'sticky',
          top: '4rem',
          height: 'calc(100vh - 4rem)',
          borderRight: '1px solid var(--color-neutral-200)',
          backgroundColor: '#fff',
          boxShadow: '1px 0 3px rgba(0,0,0,0.03)',
        }}
        className="lg:!flex"
      >
        <nav style={{ flex: 1, padding: '1.25rem 1rem', overflowY: 'auto' }}>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    onClick={() => {
                      if (item.to === '/messages') {
                        useChatStore.setState({ activeChat: null, messages: [] });
                      }
                    }}
                    className={`sidebar-nav-link ${isActive ? 'active' : ''}`}
                  >
                    <item.icon />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
                    {item.label === 'Notifications' && unreadCount > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '0.15rem 0.5rem',
                          backgroundColor: 'var(--color-danger)',
                          color: '#fff',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          borderRadius: '9999px',
                          lineHeight: 1.2,
                        }}
                      >
                        {unreadCount >= 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {item.label === 'Messages' && unreadMessagesCount > 0 && (
                      <span
                        style={{
                          marginLeft: 'auto',
                          padding: '0.15rem 0.5rem',
                          backgroundColor: 'var(--color-primary-600)',
                          color: '#fff',
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          borderRadius: '9999px',
                          lineHeight: 1.2,
                        }}
                      >
                        {unreadMessagesCount >= 9 ? '9+' : unreadMessagesCount}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Footer */}
        <div style={{
          padding: '1rem',
          borderTop: '1px solid var(--color-neutral-100)',
          backgroundColor: 'rgba(248,250,249,0.5)',
        }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-400)', textAlign: 'center', fontWeight: 500, margin: 0 }}>
            © 2026 Bayanihan Hub
          </p>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav
        className="lg:!hidden"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          backgroundColor: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--color-neutral-200)',
          boxShadow: 'var(--shadow-elevated)',
        }}
      >
        <ul style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', padding: '0.375rem 0.25rem', listStyle: 'none', margin: 0 }}>
          {navItems.slice(0, 5).map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.125rem',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    textDecoration: 'none',
                    color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  <item.icon style={{ width: '1rem', height: '1rem' }} />
                  <span style={{ fontSize: '0.625rem' }}>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

