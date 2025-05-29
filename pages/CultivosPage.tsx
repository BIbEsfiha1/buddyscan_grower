import React, { useState, useEffect } from 'react';
import { Cultivo } from '../types';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';
import LeafIcon from '../components/icons/LeafIcon';

const CultivosPage: React.FC = () => {
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    async function fetchCultivos() {
      try {
        const { getCultivos } = await import('../services/cultivoService');
        const data = await getCultivos();
        if (mounted) setCultivos(data);
      } catch {
// Erro tratado, variável não utilizada.
        setError('Erro ao buscar cultivos.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchCultivos();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <span className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-6" />
      <span className="text-green-700 dark:text-green-300 font-semibold text-lg">Carregando cultivos...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <LeafIcon className="w-12 h-12 text-red-400 mb-3" />
      <span className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">{error}</span>
      <Button variant="secondary" onClick={() => window.location.reload()}>Tentar novamente</Button>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto w-full p-2 sm:p-4 min-h-screen flex flex-col gap-3 bg-white dark:bg-slate-900">
      {/* Toast global */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Breadcrumbs e botão de novo cultivo */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 flex items-center gap-2 py-2 px-1 sm:px-0 -mx-2 sm:mx-0 backdrop-blur-md">
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
          <span className="font-bold text-green-700 dark:text-green-300">Cultivos</span>
        </nav>
        <div className="flex-1" />
        <Link to="/novo-cultivo">
          <Button variant="primary" size="icon" className="shadow" title="Novo Cultivo">
            <span className="text-xl font-bold">+</span>
          </Button>
        </Link>
      </div>

      {/* Lista de cultivos */}
      <div className="mt-2">
        {cultivos.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-8">Nenhum cultivo cadastrado ainda.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {cultivos.map((cultivo) => (
              <Link to={`/cultivo/${cultivo.id}`} key={cultivo.id} className="block group">
                <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl group-hover:shadow-green-300/40 dark:group-hover:shadow-green-500/30 transition-all duration-300 overflow-hidden hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-40 border border-gray-200 dark:border-slate-700 p-5 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-lg text-slate-900 dark:text-slate-100 truncate">{cultivo.name}</span>
                    {cultivo.finalizadoEm ? (
                      <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">Finalizado</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Início: {new Date(cultivo.startDate).toLocaleDateString()}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CultivosPage;
