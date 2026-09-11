import { useState, type ReactNode } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  Package,
  HandHeart,
  AlertOctagon,
  FolderTree,
  Star,
  Settings,
  ArrowLeft,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useProfilePictureStore } from '@/stores/profilePictureStore';
import { useIdentityVerificationStore } from '@/stores/identityVerificationStore';

interface AdminLayoutProps {
  children: ReactNode;
}

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/approvals', icon: ShieldCheck, label: 'Identity & Approvals', badgeKey: 'approvals' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/posts', icon: Package, label: 'Posts' },
  { to: '/admin/requests', icon: HandHeart, label: 'Requests' },
  { to: '/admin/reports', icon: AlertOctagon, label: 'Reports' },
  { to: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { to: '/rate', icon: Star, label: 'Ratings' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuthStore();
  const { getPendingCount: getPendingPhotoCount } = useProfilePictureStore();
  const { getPendingCount: getPendingVerifCount } = useIdentityVerificationStore();
  const pendingApprovalsCount = getPendingPhotoCount() + getPendingVerifCount();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f1f5f3] w-full overflow-x-hidden">
      {/* Mobile Admin Header (Visible on < lg) */}
      <div className="lg:hidden sticky top-0 z-40 bg-[#0f172a] text-white flex items-center justify-between px-4 h-14 border-b border-[#1e293b] shadow-sm">
        <Link to="/admin" className="flex items-center gap-2.5 text-decoration-none">
          <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" className="h-7 w-auto object-contain" />
          <div className="flex flex-col">
            <span className="font-bold text-xs text-white leading-tight">Bayanihan Hub</span>
            <span className="text-[9px] text-[var(--color-primary-400)] font-semibold tracking-wider uppercase">Admin Panel</span>
          </div>
        </Link>

        <button
          type="button"
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus:outline-none"
          aria-label="Toggle admin navigation"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileNavOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-xs transition-opacity"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {/* Mobile Slide-over Drawer */}
      <div
        className={`lg:hidden fixed top-14 bottom-0 left-0 w-72 bg-[#0f172a] text-white z-50 flex flex-col transform transition-transform duration-200 ease-in-out ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-decoration-none transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-600)] text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>

              {item.badgeKey === 'approvals' && pendingApprovalsCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-slate-800 flex flex-col gap-1.5 shrink-0 bg-slate-950/40">
          <Link
            to="/dashboard"
            onClick={() => setMobileNavOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 text-decoration-none font-medium hover:text-white hover:bg-slate-800/40"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main App
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-red-400 bg-transparent border-0 cursor-pointer text-left font-semibold hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            Logout ({user?.fullName?.split(' ')[0]})
          </button>
        </div>
      </div>

      {/* Desktop Sidebar (hidden on mobile) */}
      <aside
        className="hidden lg:flex flex-col w-64 shrink-0 sticky top-0 h-screen bg-[#0f172a] text-white border-r border-[#1e293b]"
      >
        <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-2.5 text-decoration-none">
            <img src="/Logo1Revise.png" alt="Bayanihan Hub Logo" className="h-8 w-auto object-contain" />
            <div>
              <span className="font-bold text-sm text-white block m-0">Bayanihan Hub</span>
              <span className="text-[10px] text-[var(--color-primary-400)] font-semibold tracking-wider uppercase block">Admin Panel</span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1 overflow-y-auto">
          {adminNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold text-decoration-none transition-all ${
                  isActive
                    ? 'bg-[var(--color-primary-600)] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>

              {item.badgeKey === 'approvals' && pendingApprovalsCount > 0 && (
                <span className="bg-amber-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {pendingApprovalsCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e293b] flex flex-col gap-1.5 shrink-0 bg-slate-950/40">
          <Link
            to="/dashboard"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-400 text-decoration-none font-medium hover:text-white hover:bg-slate-800/40"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Main App
          </Link>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-xs text-red-400 bg-transparent border-0 cursor-pointer text-left font-semibold hover:bg-red-950/30"
          >
            <LogOut className="w-4 h-4" />
            Logout ({user?.fullName?.split(' ')[0]})
          </button>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 min-w-0 p-3.5 sm:p-6 lg:p-8 overflow-y-auto w-full">
        <div className="max-w-[85rem] w-full mx-auto min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}

