import React, { createContext, useContext, useState } from 'react';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 3000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-2xl border backdrop-blur-md animate-in slide-in-from-right-full duration-300 ${toast.type === 'success' ? 'bg-green-950/90 border-green-500 text-green-400' : toast.type === 'error' ? 'bg-red-950/90 border-red-500 text-red-400' : 'bg-zinc-900/90 border-white/10 text-white'}`}>
            {toast.type === 'success' && <CheckCircle size={20} />}
            {toast.type === 'error' && <AlertTriangle size={20} />}
            {toast.type === 'info' && <Info size={20} />}
            <span className="font-mono text-sm font-bold uppercase tracking-wide">{toast.message}</span>
            <button onClick={() => removeToast(toast.id)} className="ml-4 hover:text-white transition-colors"><X size={16} /></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};