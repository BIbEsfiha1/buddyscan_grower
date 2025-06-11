import React, { useState, useEffect } from 'react';
import { Grow } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Loader from "../components/Loader";

export default function GrowsPage() {
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, showToast] = useToast();
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


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <Loader message="Carregando estufas..." size="md" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full min-h-full flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
      {toast && <Toast toast={toast} />}
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
        <div className="flex-1" />
        <Link to="/novo-grow">
          <Button variant="primary" size="icon" className="shadow" title="Novo Grow">
            <PlusIcon className="w-5 h-5" />
          </Button>
        </Link>
      </div>

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
