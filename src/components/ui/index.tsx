import { type ReactNode, type ButtonHTMLAttributes, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle, Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ variant = 'primary', size = 'md', loading, icon, children, className = '', disabled, ...props }: ButtonProps) {
  const variants: Record<ButtonVariant, string> = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    ghost: 'btn-ghost',
    danger: 'btn-danger',
    success: 'btn-success',
  };
  const sizes: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      className={`${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
  icon?: ReactNode;
};

export function Input({ label, error, icon, className = '', id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{icon}</div>}
        <input
          id={inputId}
          className={`input ${icon ? 'pl-10' : ''} ${error ? 'input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <textarea
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className} resize-y min-h-[100px]`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
  children: ReactNode;
};

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="label">{label}</label>}
      <select
        id={inputId}
        className={`input ${error ? 'input-error' : ''} ${className} cursor-pointer`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="mt-1.5 text-xs text-error-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

export function Card({ children, className = '', hover = false }: { children: ReactNode; className?: string; hover?: boolean }) {
  return <div className={`${hover ? 'card-hover' : 'card'} ${className}`}>{children}</div>;
}

type BadgeColor = 'blue' | 'green' | 'yellow' | 'red' | 'gray' | 'purple';

export function Badge({ children, color = 'gray', className = '' }: { children: ReactNode; color?: BadgeColor; className?: string }) {
  const colors: Record<BadgeColor, string> = {
    blue: 'bg-primary-100 text-primary-700',
    green: 'bg-success-100 text-success-700',
    yellow: 'bg-warning-100 text-warning-700',
    red: 'bg-error-100 text-error-700',
    gray: 'bg-slate-100 text-slate-700',
    purple: 'bg-accent-100 text-accent-700',
  };
  return <span className={`badge ${colors[color]} ${className}`}>{children}</span>;
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`w-5 h-5 animate-spin text-primary-600 ${className}`} />;
}

export function Modal({ open, onClose, title, children, size = 'md' }: { open: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [open]);

  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] overflow-hidden flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto p-6">{children}</div>
      </div>
    </div>
  );
}

type AlertVariant = 'success' | 'error' | 'info' | 'warning';

export function Alert({ variant = 'info', title, children, className = '' }: { variant?: AlertVariant; title?: string; children: ReactNode; className?: string }) {
  const configs: Record<AlertVariant, { icon: ReactNode; bg: string; text: string; border: string }> = {
    success: { icon: <CheckCircle2 className="w-5 h-5" />, bg: 'bg-success-50', text: 'text-success-800', border: 'border-success-200' },
    error: { icon: <AlertCircle className="w-5 h-5" />, bg: 'bg-error-50', text: 'text-error-800', border: 'border-error-200' },
    info: { icon: <Info className="w-5 h-5" />, bg: 'bg-primary-50', text: 'text-primary-800', border: 'border-primary-200' },
    warning: { icon: <AlertTriangle className="w-5 h-5" />, bg: 'bg-warning-50', text: 'text-warning-800', border: 'border-warning-200' },
  };
  const c = configs[variant];
  return (
    <div className={`flex gap-3 p-4 rounded-lg border ${c.bg} ${c.border} ${c.text} ${className}`}>
      <div className="flex-shrink-0">{c.icon}</div>
      <div className="flex-1">
        {title && <p className="font-semibold mb-0.5">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon: ReactNode; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      {description && <p className="text-sm text-slate-500 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  const initials = name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  if (src) {
    return <img src={src} alt={name} className={`${sizes[size]} rounded-full object-cover`} />;
  }
  return (
    <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-white font-semibold flex items-center justify-center`}>
      {initials}
    </div>
  );
}
