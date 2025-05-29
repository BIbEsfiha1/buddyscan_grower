import React from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
}

const typeStyles = {
  success: 'bg-green-500 text-white',
  error: 'bg-red-500 text-white',
  info: 'bg-blue-500 text-white',
};

const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose }) => (
  <div
    className={`fixed bottom-6 left-1/2 z-[9999] -translate-x-1/2 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 ${typeStyles[type]} animate-toast-in`}
    role="alert"
    style={{ minWidth: 200 }}
  >
    {type === 'success' && (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
    )}
    {type === 'error' && (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    )}
    {type === 'info' && (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01" /></svg>
    )}
    <span className="font-medium flex-1">{message}</span>
    {onClose && (
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white focus:outline-none">×</button>
    )}
    <style>{`
      @keyframes toast-in { from { opacity: 0; transform: translateY(30px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .animate-toast-in { animation: toast-in 0.3s cubic-bezier(.4,0,.2,1); }
    `}</style>
  </div>
);

export default Toast;
