import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  wide?: boolean;
}

export default function AuthLayout({ children, title, subtitle, wide }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-neutral-50)] px-3.5 py-6 sm:px-6 sm:py-10 w-full overflow-x-hidden">
      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} text-center`}>
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3 text-decoration-none">
          <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" className="h-9 w-auto object-contain" />
          <span className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
            Bayanihan Hub
          </span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1.5 text-xs sm:text-sm text-neutral-500 max-w-sm mx-auto">{subtitle}</p>}
      </div>

      <div className={`w-full ${wide ? 'max-w-xl' : 'max-w-md'} mt-5 sm:mt-6`}>
        <div className="bg-white px-4 py-5 sm:px-8 sm:py-8 rounded-2xl border border-neutral-200 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}

