import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plant } from '../types';
import { usePlantContext } from '../contexts/PlantContext';
import Loader from '../components/Loader';
import { 
  PLANT_STAGES_OPTIONS, 
  PLANT_HEALTH_STATUS_OPTIONS,
  PLANT_OPERATIONAL_STATUS_OPTIONS,
  CULTIVATION_TYPE_OPTIONS,
  getHealthStatusColor,
  getOperationalStatusColor
} from '../constants';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import ChevronUpIcon from '../components/icons/ChevronUpIcon';

const PlantStatisticsPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const { getPlantById, fetchPlantById, isLoading: contextIsLoading, error: contextError } = usePlantContext();
  const [plant, setPlant] = useState<Plant | null | undefined>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const loadPlantData = useCallback(async () => {
    if (!plantId) return;
    setIsLoadingLocal(true);
    let currentPlant = getPlantById(plantId);
    if (!currentPlant) {
      currentPlant = await fetchPlantById(plantId);
    }
    setPlant(currentPlant);
    setIsLoadingLocal(false);
  }, [plantId, getPlantById, fetchPlantById]);

  useEffect(() => {
    loadPlantData();
  }, [loadPlantData]);

  if (isLoadingLocal || contextIsLoading) {
    return <Loader message="Carregando estatísticas da planta..." />;
  }

  if (contextError) {
    return <div className="text-red-500 p-4">Erro ao carregar dados: {contextError}</div>;
  }

  if (!plant) {
    return <div className="p-4 text-center">Planta não encontrada.</div>;
  }

  const healthStatusLabel = PLANT_HEALTH_STATUS_OPTIONS.find(s => s.value === plant.healthStatus)?.label || plant.healthStatus;
  const operationalStatusLabel = PLANT_OPERATIONAL_STATUS_OPTIONS.find(s => s.value === plant.operationalStatus)?.label || plant.operationalStatus;

  return (
    <div className="container mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-400">Estatísticas de {plant.name}</h1>
        <Link 
          to={`/plant/${plantId}`}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          Voltar aos Detalhes
        </Link>
      </div>
      
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-8 rounded-xl shadow-xl transition-colors duration-300">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-10">
          <div className="md:w-1/3 flex flex-col items-center space-y-5">
            <img
              src={plant.imageUrl || `https://picsum.photos/seed/${plant.id}/400/400`}
              alt={plant.name}
              className="w-full max-w-xs h-auto object-cover rounded-xl shadow-lg aspect-square"
            />
          </div>

          <div className="md:w-2/3 space-y-3.5">
            <h2 className="text-2xl sm:text-3xl font-bold text-green-400 break-words leading-tight">{plant.name}</h2>
            <p className="text-lg text-gray-700 dark:text-slate-300"><strong className="font-medium text-[#3E3E3E] dark:text-slate-100">Strain:</strong> {plant.strain}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
              <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Nasc.:</strong> {new Date(plant.birthDate).toLocaleDateString('pt-BR')}</p>
              {plant.estimatedHarvestDate && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Colheita Est.:</strong> {new Date(plant.estimatedHarvestDate).toLocaleDateString('pt-BR')}</p>}
            </div>
            <div className="flex flex-wrap gap-2 items-center">
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getOperationalStatusColor(plant.operationalStatus)}`}>{operationalStatusLabel}</span>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(plant.healthStatus)}`}>{healthStatusLabel}</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 text-xs font-semibold rounded-full">{PLANT_STAGES_OPTIONS.find(s => s.value === plant.currentStage)?.label || plant.currentStage}</span>
            </div>

            {plant.cultivationType && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Tipo Cultivo:</strong> {CULTIVATION_TYPE_OPTIONS.find(c => c.value === plant.cultivationType)?.label || plant.cultivationType}</p>}
            {plant.substrate && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Substrato:</strong> {plant.substrate}</p>}
            
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {plant.heightCm && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Altura:</strong> {plant.heightCm} cm</p>}
              {typeof plant.latestEc === 'number' && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Último EC:</strong> {plant.latestEc}</p>}
              {typeof plant.latestPh === 'number' && <p className="text-md text-gray-600 dark:text-slate-400"><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Último pH:</strong> {plant.latestPh}</p>}
            </div>
            
            {plant.notes && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
                    <h3 className="text-sm font-semibold text-[#3E3E3E] dark:text-slate-100 mb-1.5">Notas Gerais:</h3>
                    <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-wrap bg-gray-50 dark:bg-slate-700/50 p-3.5 rounded-md border border-gray-200 dark:border-slate-600">{plant.notes}</p>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl transition-colors duration-300">
        <button
          onClick={() => setShowExtraDetails(!showExtraDetails)}
          aria-expanded={showExtraDetails}
          className="w-full flex justify-between items-center p-4 sm:p-5 text-left text-lg font-semibold text-[#7AC943] hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors duration-150 rounded-t-xl focus:outline-none"
        >
          Mais Detalhes da Planta
          {showExtraDetails ? <ChevronUpIcon className="w-6 h-6 text-[#7AC943]" /> : <ChevronDownIcon className="w-6 h-6 text-[#7AC943]" />}
        </button>
        {showExtraDetails && (
          <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-slate-700 space-y-2.5 text-sm">
            <p><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">ID Interno:</strong> <span className="text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">{plant.id}</span></p>
            {plant.qrCodeValue && <p><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">ID QR Code:</strong> <span className="text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">{plant.qrCodeValue}</span></p>}
            {plant.growRoomId && <p><strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Sala de Cultivo:</strong> <span className="text-gray-600 dark:text-slate-300">{plant.growRoomId}</span></p>}
          </div>
        )}
      </div>

    </div>
  );
};

export default PlantStatisticsPage;
