import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

type Toast = {
  id: string;
  variant: ToastVariant;
  title: string;
  message?: string;
};

type ToastContextValue = {
  toast: (variant: ToastVariant, title: string, message?: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((variant: ToastVariant, title: string, message?: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { id, variant, title, message }]);
    setTimeout(() => remove(id), 5000);
  }, [remove]);

  const icons: Record<ToastVariant, ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-success-500" />,
    error: <AlertCircle className="w-5 h-5 text-error-500" />,
    info: <Info className="w-5 h-5 text-primary-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-warning-500" />,
  };

  const borders: Record<ToastVariant, string> = {
    success: 'border-l-success-500',
    error: 'border-l-error-500',
    info: 'border-l-primary-500',
    warning: 'border-l-warning-500',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 bg-white rounded-xl shadow-lg border border-slate-200 border-l-4 ${borders[t.variant]} animate-slide-in-right`}
          >
            <div className="flex-shrink-0 mt-0.5">{icons[t.variant]}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900">{t.title}</p>
              {t.message && <p className="text-xs text-slate-600 mt-0.5">{t.message}</p>}
            </div>
            <button onClick={() => remove(t.id)} className="flex-shrink-0 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx.toast;
}
