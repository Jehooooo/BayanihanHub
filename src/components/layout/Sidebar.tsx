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
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]"
      >
        <ul className="flex items-center justify-around px-1 py-1.5 list-none m-0 max-w-lg mx-auto">
          {[
            { to: '/dashboard', icon: Home, label: 'Home' },
            { to: '/browse', icon: Search, label: 'Browse' },
            { to: '/post', icon: PlusCircle, label: 'Post', isCta: true },
            { to: '/requests', icon: HandHeart, label: 'Requests' },
            { to: '/messages', icon: MessageCircle, label: 'Messages', badge: unreadMessagesCount },
          ].map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <li key={item.to} className="flex-1 text-center">
                <NavLink
                  to={item.to}
                  onClick={() => {
                    if (item.to === '/messages') {
                      useChatStore.setState({ activeChat: null, messages: [] });
                    }
                  }}
                  className="flex flex-col items-center justify-center min-h-[44px] py-1 px-1 rounded-md text-decoration-none transition-colors relative"
                  style={{
                    color: isActive ? 'var(--color-primary-600)' : 'var(--color-neutral-500)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  {item.isCta ? (
                    <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-md -mt-3 mb-0.5 transition-transform active:scale-95">
                      <item.icon className="w-5 h-5 text-white" />
                    </div>
                  ) : (
                    <div className="relative">
                      <item.icon className="w-5 h-5" />
                      {Boolean(item.badge && item.badge > 0) && (
                        <span className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 bg-primary-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center leading-none">
                          {item.badge! > 9 ? '9+' : item.badge}
                        </span>
                      )}
                    </div>
                  )}
                  <span className="text-[10px] tracking-tight">{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}

