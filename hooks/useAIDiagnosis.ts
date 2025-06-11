import { useRef, useState } from 'react';
import { getImageDiagnosis } from '../services/geminiService';

interface StatusMap {
  [id: string]: boolean;
}

export interface DiagnoseFunction {
  (id: string, base64: string, prompt?: string): Promise<ReturnType<typeof getImageDiagnosis>>;
}

export default function useAIDiagnosis() {
  const queueRef = useRef(Promise.resolve());
  const [status, setStatus] = useState<StatusMap>({});

  const diagnose: DiagnoseFunction = (id, base64, prompt) => {
    setStatus(prev => ({ ...prev, [id]: true }));
    const task = queueRef.current
      .catch(() => {})
      .then(() => getImageDiagnosis(base64, prompt))
      .finally(() => {
        setStatus(prev => ({ ...prev, [id]: false }));
      });

    queueRef.current = task;
    return task;
  };

  const isDiagnosing = (id: string) => !!status[id];
  const isAnyDiagnosing = Object.values(status).some(Boolean);

  return { diagnose, isDiagnosing, isAnyDiagnosing };
}
