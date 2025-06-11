import { useState, useEffect, useCallback } from 'react';
import Toast from '../components/Toast';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

export default function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const ToastElement = toast ? <Toast message={toast.message} type={toast.type} /> : null;

  return { showToast, ToastElement };
}
