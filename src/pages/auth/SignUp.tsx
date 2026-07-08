import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headset, Mail, Lock, User, ArrowRight, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';

export function SignUpPage() {
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const passwordChecks = {
    length: form.password.length >= 8,
    uppercase: /[A-Z]/.test(form.password),
    lowercase: /[a-z]/.test(form.password),
    number: /\d/.test(form.password),
    match: form.password === form.confirmPassword && form.password.length > 0,
  };

  const allValid = Object.values(passwordChecks).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }

    setLoading(true);
    const { error } = await signUp(form.email, form.password, form.fullName);
    setLoading(false);

    if (error) {
      setError(error);
    } else {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex">
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

          <h1 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-600 mb-6">Get instant IT support with AI — free forever.</p>

          {error && <Alert variant="error" className="mb-4">{error}</Alert>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              required
              icon={<User className="w-4 h-4" />}
              placeholder="Jane Doe"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />

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
                placeholder="Create a strong password"
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

            {form.password && (
              <div className="grid grid-cols-2 gap-2 text-xs animate-fade-in">
                {[
                  { ok: passwordChecks.length, label: '8+ characters' },
                  { ok: passwordChecks.uppercase, label: 'Uppercase letter' },
                  { ok: passwordChecks.lowercase, label: 'Lowercase letter' },
                  { ok: passwordChecks.number, label: 'Number' },
                ].map((c, i) => (
                  <div key={i} className={`flex items-center gap-1.5 ${c.ok ? 'text-success-600' : 'text-slate-400'}`}>
                    <CheckCircle2 className={`w-3.5 h-3.5 ${c.ok ? 'text-success-500' : 'text-slate-300'}`} />
                    {c.label}
                  </div>
                ))}
              </div>
            )}

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              required
              icon={<Lock className="w-4 h-4" />}
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
              error={form.confirmPassword && !passwordChecks.match ? 'Passwords do not match' : undefined}
            />

            <label className="flex items-start gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" required className="mt-1 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
              <span>I agree to the <a href="#" className="text-primary-600 hover:underline">Terms of Service</a> and <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>.</span>
            </label>

            <Button type="submit" loading={loading} className="w-full">
              Create Account
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/signin" className="text-primary-600 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-accent-600 via-primary-700 to-primary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        <div className="absolute top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 -right-20 w-96 h-96 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

        <div className="relative flex flex-col justify-center px-20 text-white">
          <h2 className="text-3xl font-bold mb-4">Start resolving IT issues in seconds</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-md">
            Join thousands of users who get instant IT help with AI-powered troubleshooting and seamless human escalation.
          </p>

          <div className="space-y-3">
            {[
              'Unlimited AI chat sessions',
              'Up to 10 tickets per month',
              'Real-time ticket tracking',
              '24/7 availability',
              'No credit card required',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
