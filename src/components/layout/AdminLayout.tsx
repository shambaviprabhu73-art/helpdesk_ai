import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  ShieldCheck, LayoutDashboard, Ticket, Users, BarChart3,
  LogOut, Menu, X, ChevronDown, Headset, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/tickets', label: 'All Tickets', icon: Ticket },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/reports', label: 'Reports', icon: BarChart3 },
];

export function AdminLayout() {
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
      <aside className={`fixed lg:sticky top-0 left-0 z-40 h-screen w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="h-16 flex items-center px-5 border-b border-slate-800">
          <Link to="/admin" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-md">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-display font-bold text-sm text-white">Admin Console</div>
              <div className="text-[10px] text-slate-400">HelpDesk AI</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.to)
                    ? 'bg-primary-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-800">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            User Dashboard
          </Link>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-slate-900/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-2">
              <Headset className="w-5 h-5 text-primary-600 lg:hidden" />
              <p className="text-sm text-slate-500 hidden sm:block">
                Signed in as <span className="font-semibold text-slate-900 capitalize">{profile?.role}</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setUserMenu(!userMenu)}
              className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Avatar name={profile?.full_name || 'Admin'} src={profile?.avatar_url} size="sm" />
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
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-error-600 hover:bg-error-50">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
