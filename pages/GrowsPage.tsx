import React, { useState, useEffect } from 'react';
import { Grow } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const { getGrows } = await import('../services/growService');
        const data = await getGrows();
        setGrows(data);
      } catch (e) {
        console.error('Erro ao buscar grows', e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const refresh = async () => {
    const { getGrows } = await import('../services/growService');
    const data = await getGrows();
    setGrows(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const { addGrow } = await import('../services/growService');
      await addGrow({ name, location: location || undefined });
      await refresh();
      setName('');
      setLocation('');
      setToast({ message: 'Grow criado com sucesso!', type: 'success' });
    } catch (err: any) {
      setToast({ message: 'Erro ao criar grow: ' + (err.message || err), type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <span className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-6" />
        <span className="text-green-700 dark:text-green-300 font-semibold text-lg">Carregando estufas...</span>
      </div>
    );
  }

  const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-lg mx-auto w-full min-h-screen flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
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
          <span className="font-bold text-green-700 dark:text-green-300">Grows</span>
        </nav>
      </div>

      <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 mb-4 text-center">Gerenciar Grows</h1>

      <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-md shadow">
        <div>
          <label htmlFor="growName" className={labelStyle}>Nome</label>
          <input id="growName" type="text" className={inputStyle} value={name} onChange={e => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="growLocation" className={labelStyle}>Localização (opcional)</label>
          <input id="growLocation" type="text" className={inputStyle} value={location} onChange={e => setLocation(e.target.value)} />
        </div>
        <Button type="submit" variant="primary" loading={saving} disabled={!name}>Salvar Grow</Button>
      </form>

      <div className="mt-6">
        {grows.length ? (
          <ul className="space-y-2">
            {grows.map(g => (
              <li key={g.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="font-semibold text-gray-800 dark:text-gray-100">{g.name}</div>
                {g.location && <div className="text-sm text-gray-500 dark:text-gray-400">{g.location}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 text-center">Nenhum grow cadastrado.</p>
        )}
      </div>
    </div>
  );
}
