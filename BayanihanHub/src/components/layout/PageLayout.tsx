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
      <Header />
      <div style={{ flex: 1, display: 'flex', maxWidth: '80rem', width: '100%', margin: '0 auto' }}>
        {showSidebar && <Sidebar />}
        <main style={{ flex: 1, padding: '1.5rem', minWidth: 0, paddingBottom: showSidebar ? '5rem' : '1.5rem' }}>
          {children}
        </main>
      </div>
      {!showSidebar && <Footer />}
    </div>
  );
}

