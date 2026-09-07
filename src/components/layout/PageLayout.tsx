import { type ReactNode } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface PageLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

export default function PageLayout({ children, showSidebar = true }: PageLayoutProps) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-neutral-50)' }}>
      <Header fullWidth={showSidebar} />
      <div style={{ flex: 1, display: 'flex', width: '100%', minWidth: 0 }}>
        {showSidebar && <Sidebar />}
        <main style={{ flex: 1, padding: '1.75rem 2rem', minWidth: 0, paddingBottom: showSidebar ? '5rem' : '2rem' }}>
          <div style={{ maxWidth: '82rem', width: '100%' }}>
            {children}
          </div>
        </main>
      </div>
      {!showSidebar && <Footer />}
    </div>
  );
}

