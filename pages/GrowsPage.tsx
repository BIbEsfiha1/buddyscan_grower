import React, { useState, useEffect } from 'react';
import { Grow } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import Loader from "../components/Loader";

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <Loader message="Carregando estufas..." size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full min-h-full flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
      {toast && <Toast message={toast.message} type={toast.type} />}
      <Header
        title="Grows"
        onOpenSidebar={() => {}}
        onOpenAddModal={() => navigate('/novo-grow')}
        onOpenScannerModal={() => {}}
        showBack
        onBack={() => navigate(-1)}
      />
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Grows' },
        ]}
        className="px-1 sm:px-0 mb-2"
      />

      <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 mt-4 mb-2">Meus Grows</h1>

      <div className="mt-6">
        {grows.length ? (
          <ul className="space-y-2">
            {grows.map(g => (
              <li key={g.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <Link to={`/grow/${g.id}`} className="block">
                  <div className="font-semibold text-gray-800 dark:text-gray-100">{g.name}</div>
                  {g.location && <div className="text-sm text-gray-500 dark:text-gray-400">{g.location}</div>}
                  {g.capacity && <div className="text-sm text-gray-500 dark:text-gray-400">Capacidade: {g.capacity}</div>}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-center py-8">
            Nenhum grow cadastrado ainda.<br />
            <Link to="/novo-grow" className="underline text-green-700 dark:text-green-300">Crie sua primeira estufa</Link>
          </div>
        )}
      </div>
    </div>
  );
}
