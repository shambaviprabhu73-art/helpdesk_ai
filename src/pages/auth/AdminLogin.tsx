import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle, LockKeyhole } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

export function AdminLoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/admin';

  useEffect(() => {
    if (user && profile) {
      if (profile.role === 'admin' || profile.role === 'technician') {
        navigate(from, { replace: true });
      } else if (profile.role === 'user') {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, profile, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Invalid admin credentials.' : error);
      setLoading(false);
    } else {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .maybeSingle();

      if (data && data.role !== 'admin' && data.role !== 'technician') {
        setError('This account does not have admin privileges.');
        await supabase.auth.signOut();
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-0 -right-40 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-0 -left-40 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative max-w-md w-full">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500 to-primary-500 flex items-center justify-center shadow-md">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-white">
            HelpDesk<span className="text-accent-400">AI</span>
          </span>
        </Link>

        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-8 shadow-2xl">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-500 to-primary-500 mb-4 shadow-lg">
              <LockKeyhole className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Admin Console</h1>
            <p className="text-sm text-slate-400">Secure access for administrators and technicians.</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-error-500/10 border border-error-500/30 text-error-400 text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="admin@helpdeskai.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-primary-500 text-white font-medium hover:from-accent-600 hover:to-primary-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Access Console
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-700 text-center">
            <Link to="/signin" className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 rotate-180" />
              Back to user sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500">
          Authorized personnel only. All access is logged and monitored.
        </p>
      </div>
    </div>
  );
}
