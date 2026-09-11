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
    <div className="min-h-screen flex flex-col bg-[var(--color-neutral-50)] w-full overflow-x-hidden">
      <Header fullWidth={showSidebar} />
      <div className="flex-1 flex w-full min-w-0 relative">
        {showSidebar && <Sidebar />}
        <main
          className={`flex-1 min-w-0 px-3 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-7 ${
            showSidebar ? 'pb-24 lg:pb-10' : 'pb-8'
          }`}
        >
          <div className="max-w-[82rem] w-full min-w-0 mx-auto">
            {children}
          </div>
        </main>
      </div>
      {!showSidebar && <Footer />}
    </div>
  );
}

