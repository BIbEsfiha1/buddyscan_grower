import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';

export default function NovoGrowPage() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const { addGrow } = await import('../services/growService');
      const newGrow = await addGrow({ name, location: location || undefined, capacity: capacity === '' ? undefined : capacity });
      setToast({ message: 'Grow criado com sucesso! Cadastre seu primeiro cultivo.', type: 'success' });
      setTimeout(() => navigate(`/novo-cultivo?growId=${newGrow.id}`), 1500);
    } catch (err: any) {
      setToast({ message: 'Erro ao criar grow: ' + (err.message || err), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-lg mx-auto w-full min-h-full flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 flex items-center gap-2 py-2 px-1 sm:px-0 -mx-2 sm:mx-0 backdrop-blur-md mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="w-7 h-7 text-green-700" />
        </button>
        <nav className="text-xs text-gray-500 dark:text-gray-400 flex gap-1">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <span>&gt;</span>
          <Link to="/grows" className="hover:underline">Grows</Link>
          <span>&gt;</span>
          <span className="font-bold text-green-700 dark:text-green-300">Novo Grow</span>
        </nav>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 flex-1 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300 mb-6 text-center">Novo Grow</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="growName" className={labelStyle}>Nome do Grow</label>
            <input id="growName" type="text" className={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label htmlFor="growLocation" className={labelStyle}>Localização (opcional)</label>
            <input id="growLocation" type="text" className={inputStyle} value={location} onChange={e => setLocation(e.target.value)} />
          </div>
          <div>
            <label htmlFor="growCapacity" className={labelStyle}>Capacidade (opcional)</label>
            <input
              id="growCapacity"
              type="number"
              className={inputStyle}
              value={capacity}
              onChange={e => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
              min="0"
            />
          </div>
          <div className="mt-6 flex justify-center">
            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!name}>Salvar Grow</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
