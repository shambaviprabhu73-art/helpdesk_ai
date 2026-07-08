import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Headset, Menu, X, LogIn, UserPlus, LayoutDashboard, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/services', label: 'Services' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${scrolled ? 'bg-white/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Headset className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              HelpDesk<span className="gradient-text">AI</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(link.to) ? 'text-primary-700 bg-primary-50' : 'text-slate-600 hover:text-primary-700 hover:bg-slate-50'}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link to="/dashboard" className="btn-secondary">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                {profile?.role === 'admin' || profile?.role === 'technician' ? (
                  <Link to="/admin" className="btn-primary">
                    <ChevronDown className="w-4 h-4" />
                    Admin
                  </Link>
                ) : null}
              </>
            ) : (
              <>
                <button onClick={() => navigate('/signin')} className="btn-ghost">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
                <button onClick={() => navigate('/signup')} className="btn-primary">
                  <UserPlus className="w-4 h-4" />
                  Get Started
                </button>
              </>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 animate-fade-in-down">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium ${isActive(link.to) ? 'text-primary-700 bg-primary-50' : 'text-slate-600 hover:bg-slate-50'}`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-slate-200 mt-2 pt-2 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to="/dashboard" className="btn-secondary justify-center">Dashboard</Link>
                    {(profile?.role === 'admin' || profile?.role === 'technician') && (
                      <Link to="/admin" className="btn-primary justify-center">Admin Panel</Link>
                    )}
                  </>
                ) : (
                  <>
                    <Link to="/signin" className="btn-secondary justify-center">Sign In</Link>
                    <Link to="/signup" className="btn-primary justify-center">Get Started</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
