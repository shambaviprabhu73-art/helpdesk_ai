import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Headset, Mail, Lock, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';

export function SignInPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/dashboard';

  useEffect(() => {
    if (user) navigate(from, { replace: true });
  }, [user, navigate, from]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await signIn(form.email, form.password);
    setLoading(false);
    if (error) {
      setError(error === 'Invalid login credentials' ? 'Invalid email or password. Please try again.' : error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 py-12">
        <div className="max-w-md w-full mx-auto">
          <Link to="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-md">
              <Headset className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-slate-900">
              HelpDesk<span className="gradient-text">AI</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-600 mb-6">Sign in to your account to continue.</p>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              icon={<Mail className="w-4 h-4" />}
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                icon={<Lock className="w-4 h-4" />}
                placeholder="Enter your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 font-medium hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full">
              Sign In
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Do not have an account?{' '}
            <Link to="/signup" className="text-primary-600 font-semibold hover:underline">
              Sign up free
            </Link>
          </p>

          <div className="mt-6 pt-6 border-t border-slate-200">
            <Link to="/admin/login" className="flex items-center justify-center gap-2 text-sm text-slate-500 hover:text-slate-700">
              <AlertCircle className="w-4 h-4" />
              Admin? Sign in here
            </Link>
          </div>
        </div>
      </div>

      {/* Right side - visual */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -left-20 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative flex flex-col justify-center px-20 text-white">
          <h2 className="text-3xl font-bold mb-4">Your IT support, supercharged</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-md">
            Sign in to access the AI assistant, track your tickets, and get instant IT help — anytime, anywhere.
          </p>

          <div className="space-y-4">
            {[
              { icon: '24/7', title: 'AI Assistant', desc: 'Instant troubleshooting' },
              { icon: '<2s', title: 'Avg Response', desc: 'Lightning fast' },
              { icon: '85%', title: 'Auto-Resolved', desc: 'No human needed' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-lg">
                  {stat.icon}
                </div>
                <div>
                  <div className="font-semibold">{stat.title}</div>
                  <div className="text-sm text-primary-200">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
