'use client';

import { useState, useCallback, createContext, useContext, useRef } from 'react';

interface ToastMessage {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

interface ToastContextType {
  toast: (type: ToastMessage['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counterRef = useRef(0);

  const toast = useCallback((type: ToastMessage['type'], message: string) => {
    const id = ++counterRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const colors: Record<ToastMessage['type'], string> = {
    success: 'bg-green-800 border-green-600 text-green-100',
    error: 'bg-red-900 border-red-600 text-red-100',
    info: 'bg-blue-900 border-blue-600 text-blue-100',
    warning: 'bg-yellow-900 border-yellow-600 text-yellow-100',
  };

  const icons: Record<ToastMessage['type'], string> = {
    success: '\u2713',
    error: '\u2717',
    info: '\u2139',
    warning: '\u26A0',
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`px-4 py-3 rounded-lg border shadow-lg text-sm flex items-center gap-2 animate-in slide-in-from-right ${colors[t.type]}`}
          >
            <span className="text-base">{icons[t.type]}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
