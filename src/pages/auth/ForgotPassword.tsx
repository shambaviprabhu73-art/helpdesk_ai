import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Headset, Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Input, Button, Alert } from '../../components/ui';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/signin`,
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 via-primary-50/30 to-accent-50/30">
      <div className="max-w-md w-full">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-600 to-accent-500 flex items-center justify-center shadow-md">
            <Headset className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-slate-900">
            HelpDesk<span className="gradient-text">AI</span>
          </span>
        </Link>

        <div className="card p-8">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 mb-4">
                  <Mail className="w-7 h-7" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
                <p className="text-sm text-slate-600">No worries — we will email you a secure reset link.</p>
              </div>

              {error && <Alert variant="error" className="mb-4">{error}</Alert>}

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  icon={<Mail className="w-4 h-4" />}
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Button type="submit" loading={loading} className="w-full">
                  Send Reset Link
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success-100 text-success-600 mb-4 animate-scale-in">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Check your email</h1>
              <p className="text-sm text-slate-600 mb-6">
                We have sent a password reset link to <span className="font-semibold text-slate-900">{email}</span>. The link expires in 60 minutes.
              </p>
              <Alert variant="info" className="mb-6 text-left">
                <p className="text-sm">Did not receive the email? Check your spam folder, or <button onClick={() => setSent(false)} className="underline font-medium">try a different email</button>.</p>
              </Alert>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/signin" className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-primary-600">
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5" />
          For demo purposes, password reset emails are sent by Supabase.
        </p>
      </div>
    </div>
  );
}
