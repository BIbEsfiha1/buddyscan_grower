import { useCallback, useEffect, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';
export interface ToastData {
  message: string;
  type?: ToastType;
}

export default function useToast(delay = 2500): [ToastData | null, (toast: ToastData) => void] {
  const [toast, setToast] = useState<ToastData | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((t: ToastData) => {
    setToast(t);
  }, []);

  useEffect(() => {
    if (toast) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), delay);
    }
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast, delay]);

  return [toast, showToast];
}
