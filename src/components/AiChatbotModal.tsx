import { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RotateCcw,
  TrendingUp,
  HandHeart,
  Repeat,
  ShieldCheck,
  Package,
  MessageSquare,
} from 'lucide-react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  stats?: any;
}

const quickPrompts = [
  { label: 'System Statistics', query: 'Show me the live Bayanihan Hub community statistics', icon: TrendingUp },
  { label: 'How to Barter', query: 'How does item exchange and barter work on Bayanihan Hub?', icon: Repeat },
  { label: 'How to Donate', query: 'How do I post a donation for neighbors?', icon: Package },
  { label: 'ID Verification', query: 'What Philippine IDs are accepted for verification?', icon: ShieldCheck },
  { label: 'Request Assistance', query: 'How do I submit a community help request?', icon: HandHeart },
];

export default function AiChatbotModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: "Kumusta! I am your **Bayanihan Hub Community Assistant**. I can answer questions about local donations, barter proposals, Philippine ID verifications, and provide live statistics directly from our MySQL database.\n\nHow can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: query }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: Message = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || "I'm sorry, I could not retrieve an answer at this moment.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          stats: data.stats,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error('API response failed');
      }
    } catch {
      // Fallback response with live system overview
      const assistantMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: "I am currently running in local mode. Bayanihan Hub is a community mutual aid and barter system connecting neighbors for donations, exchanges, and essential assistance. All users are verified via Philippine Government IDs to ensure a safe environment.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'msg-welcome-reset',
        sender: 'assistant',
        text: "Kumusta! The conversation has been cleared. What community question can I assist you with?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '5.5rem',
            right: '1.5rem',
            zIndex: 45,
            display: 'flex',
            alignItems: 'center',
            gap: '0.625rem',
            padding: '0.75rem 1.125rem',
            backgroundColor: 'var(--color-primary-700)',
            color: '#ffffff',
            borderRadius: '9999px',
            boxShadow: '0 4px 16px rgba(46, 125, 50, 0.35)',
            border: '2px solid rgba(255, 255, 255, 0.25)',
            cursor: 'pointer',
            transition: 'all 200ms ease-in-out',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(46, 125, 50, 0.45)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(46, 125, 50, 0.35)';
          }}
          aria-label="Open Bayanihan AI Assistant"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '1.75rem',
              height: '1.75rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }}
          >
            <Bot style={{ width: '1.125rem', height: '1.125rem' }} />
          </div>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '-0.01em' }}>
            AI Assistant
          </span>
          <Sparkles style={{ width: '0.875rem', height: '0.875rem', color: '#bbf7d0' }} />
        </button>
      )}

      {/* Chat Window Modal */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '1.5rem',
            right: '1.5rem',
            width: '24rem',
            maxWidth: 'calc(100vw - 2rem)',
            height: '34rem',
            maxHeight: 'calc(100vh - 3rem)',
            backgroundColor: '#ffffff',
            borderRadius: '1rem',
            boxShadow: '0 10px 35px rgba(0, 0, 0, 0.18), 0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid var(--color-neutral-200)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            animation: 'fadeIn 180ms ease-out',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--color-primary-700)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div
                style={{
                  width: '2.25rem',
                  height: '2.25rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Bot style={{ width: '1.25rem', height: '1.25rem' }} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: '0.9375rem', fontWeight: 800, letterSpacing: '-0.01em' }}>
                  Bayanihan AI Assistant
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                  <span
                    style={{
                      width: '0.45rem',
                      height: '0.45rem',
                      borderRadius: '9999px',
                      backgroundColor: '#4ade80',
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: '0.6875rem', color: '#dcfce7', fontWeight: 500 }}>
                    MySQL Database Connected
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <button
                type="button"
                onClick={clearChat}
                title="Clear Conversation"
                style={{
                  padding: '0.375rem',
                  background: 'none',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.8)',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                }}
              >
                <RotateCcw style={{ width: '1rem', height: '1rem' }} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Assistant"
                style={{
                  padding: '0.375rem',
                  background: 'none',
                  border: 'none',
                  color: '#ffffff',
                  cursor: 'pointer',
                  borderRadius: '0.375rem',
                }}
              >
                <X style={{ width: '1.125rem', height: '1.125rem' }} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              backgroundColor: '#f8faf9',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '100%',
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 0.875rem',
                    borderRadius: m.sender === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                    backgroundColor: m.sender === 'user' ? 'var(--color-primary-600)' : '#ffffff',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--color-neutral-900)',
                    boxShadow: m.sender === 'user' ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--color-neutral-200)',
                    fontSize: '0.8125rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {m.text}
                </div>
                <span
                  style={{
                    fontSize: '0.625rem',
                    color: 'var(--color-neutral-400)',
                    marginTop: '0.25rem',
                    padding: '0 0.25rem',
                  }}
                >
                  {m.timestamp}
                </span>
              </div>
            ))}

            {isLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem' }}>
                <div
                  style={{
                    width: '1.75rem',
                    height: '1.75rem',
                    borderRadius: '9999px',
                    backgroundColor: 'var(--color-primary-100)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-primary-700)',
                  }}
                >
                  <Bot style={{ width: '1rem', height: '1rem' }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-neutral-500)', fontStyle: 'italic' }}>
                  Querying database statistics...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: '#ffffff',
              borderTop: '1px solid var(--color-neutral-100)',
              display: 'flex',
              gap: '0.375rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
            }}
          >
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.query)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-700)',
                  backgroundColor: 'var(--color-neutral-50)',
                  border: '1px solid var(--color-neutral-200)',
                  borderRadius: '9999px',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'background-color 150ms',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-50)')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)')}
              >
                <qp.icon style={{ width: '0.75rem', height: '0.75rem', color: 'var(--color-primary-600)' }} />
                <span>{qp.label}</span>
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '0.75rem',
              borderTop: '1px solid var(--color-neutral-200)',
              backgroundColor: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about donations, exchanges, stats..."
              style={{
                flex: 1,
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--color-neutral-300)',
                outline: 'none',
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '2.25rem',
                height: '2.25rem',
                borderRadius: '0.5rem',
                backgroundColor: input.trim() && !isLoading ? 'var(--color-primary-600)' : 'var(--color-neutral-200)',
                color: '#ffffff',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'default',
              }}
              title="Send Message"
            >
              <Send style={{ width: '1rem', height: '1rem' }} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
