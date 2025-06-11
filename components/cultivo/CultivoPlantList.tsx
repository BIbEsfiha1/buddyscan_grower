import React from 'react';
import { Plant } from '../../types';
import PlantCard from '../PlantCard';
import Loader from '../Loader';
import ErrorBanner from '../ErrorBanner';

interface CultivoPlantListProps {
  plants: Plant[];
  onPrint: () => void;
  onRefresh: () => void;
  onMassAction: () => void;
  isGeneratingPDF: boolean;
  isLoading?: boolean;
  error?: string | null;
}

const CultivoPlantList: React.FC<CultivoPlantListProps> = ({
  plants,
  onPrint,
  onRefresh,
  onMassAction,
  isGeneratingPDF,
  isLoading = false,
  error = null,
}) => (
  <div className="mb-2">
    <div className="flex items-center justify-between mb-1">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Plantas deste cultivo</h2>
      <div className="flex items-center gap-2">
        <button
          onClick={onPrint}
          className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          title="Imprimir Etiquetas QR do Cultivo"
          disabled={isGeneratingPDF || plants.length === 0}
        >
          {isGeneratingPDF ? 'Gerando PDF...' : 'Imprimir Etiquetas QR'}
        </button>
        <button
          onClick={onRefresh}
          className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
          title="Atualizar lista de plantas"
        >
          Atualizar
        </button>
        <button
          onClick={onMassAction}
          className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900 rounded hover:bg-purple-200 dark:hover:bg-purple-800 transition"
          title="Registrar em massa"
        >
          Ação em Massa
        </button>
      </div>
    </div>
    {isLoading ? (
      <div className="flex justify-center py-6">
        <Loader />
      </div>
    ) : error ? (
      <ErrorBanner message={error} />
    ) : plants.length === 0 ? (
      <div className="text-gray-400 dark:text-gray-500 text-center py-6">Nenhuma planta cadastrada ainda.</div>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {plants.map(plant => (
          <PlantCard key={plant.id} plant={plant} />
        ))}
      </div>
    )}
  </div>
);

export default CultivoPlantList;
