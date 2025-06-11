import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';
import PlantaForm from '../components/PlantaForm';
import Breadcrumbs from '../components/Breadcrumbs';
import { usePlantContext } from '../contexts/PlantContext';
import { PlantStage, PlantHealthStatus, PlantOperationalStatus } from '../types';

export default function NovaPlantaPage() {
  const [searchParams] = useSearchParams();
  const cultivoId = searchParams.get('cultivoId');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();
  const { addPlant, error: plantContextError } = usePlantContext();

  // Verifica se há um cultivoId na URL
  useEffect(() => {
    if (!cultivoId) {
      setToast({ message: 'ID do cultivo não fornecido', type: 'error' });
      setTimeout(() => navigate('/cultivos'), 2000);
    }
  }, [cultivoId, navigate]);

  // Auto-hide para o toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handler para submissão do formulário usando o método principal
  const handlePlantaSubmit = async (values: { name: string; strain: string; birthDate: string; substrate: string }) => {
    if (!cultivoId) {
      setToast({ message: 'ID do cultivo não encontrado', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      // Monta o objeto NewPlantData incluindo cultivoId
      const { PlantStage, PlantHealthStatus, PlantOperationalStatus } = await import('../types');
      const newPlant = {
        ...values,
        currentStage: PlantStage.SEEDLING,
        healthStatus: PlantHealthStatus.HEALTHY,
        operationalStatus: PlantOperationalStatus.ACTIVE,
        cultivoId,
      };
      const addedPlant = await addPlant(newPlant);
      if (addedPlant) {
        setToast({ message: 'Planta adicionada com sucesso!', type: 'success' });
        setTimeout(() => navigate(`/cultivo/${cultivoId}`), 1400);
      } else {
        setToast({ message: `Erro ao adicionar planta: ${plantContextError || 'Nenhum detalhe retornado.'}`, type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: 'Erro ao adicionar planta: ' + (error.message || error), type: 'error' });
    } finally {
      setSaving(false);
    }
  };


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
        <Breadcrumbs
          items={[
            { label: 'Dashboard', to: '/' },
            { label: 'Cultivos', to: '/cultivos' },
            ...(cultivoId ? [{ label: 'Cultivo', to: `/cultivo/${cultivoId}` }] : []),
            { label: 'Nova Planta' },
          ]}
        />
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 flex-1 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300 mb-6 text-center">
          Adicionar Nova Planta
        </h1>
        <PlantaForm onSubmit={handlePlantaSubmit} loading={saving} />
      </div>
    </div>
  );
}
