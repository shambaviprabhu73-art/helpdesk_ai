import { useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  Headset, LayoutDashboard, MessageSquare, PlusCircle, ListChecks,
  User, Bell, LogOut, Menu, X, ChevronDown, ShieldCheck, Home
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/dashboard/chat', label: 'AI Assistant', icon: MessageSquare },
  { to: '/dashboard/new-ticket', label: 'Submit Ticket', icon: PlusCircle },
  { to: '/dashboard/tickets', label: 'My Tickets', icon: ListChecks },
  { to: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-slate-200">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-md">
              <Headset className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              HelpDesk<span className="gradient-text">AI</span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          {(profile?.role === 'admin' || profile?.role === 'technician') && (
            <Link
              to="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-accent-700 hover:bg-accent-50 transition-colors mb-1"
            >
              <ShieldCheck className="w-5 h-5" />
              Admin Panel
            </Link>
          )}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Home className="w-5 h-5" />
            Back to Site
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="hidden lg:block">
            <p className="text-sm text-slate-500">
              Welcome back, <span className="font-semibold text-slate-900">{profile?.full_name?.split(' ')[0] || 'User'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/dashboard/notifications" className="relative p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors">
              <Bell className="w-5 h-5" />
            </Link>

            <div className="relative">
              <button
                onClick={() => setUserMenu(!userMenu)}
                className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <Avatar name={profile?.full_name || 'User'} src={profile?.avatar_url} size="sm" />
                <span className="hidden sm:block text-sm font-medium text-slate-700">{profile?.full_name?.split(' ')[0]}</span>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {userMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-fade-in-down">
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name}</p>
                      <p className="text-xs text-slate-500 truncate capitalize">{profile?.role}</p>
                    </div>
                    <Link to="/dashboard/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function DashboardPageHeader({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
      {action}
    </div>
  );
}
