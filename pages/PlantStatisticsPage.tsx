import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Plant } from '../types';
import { usePlantContext } from '../contexts/PlantContext';
import Loader from '../components/Loader';
import PlantInfoSection from '../components/PlantInfoSection';
import PlantExtraDetails from '../components/PlantExtraDetails';

const PlantStatisticsPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const { getPlantById, fetchPlantById, isLoading: contextIsLoading, error: contextError } = usePlantContext();
  const [plant, setPlant] = useState<Plant | null | undefined>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);

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


  return (
    <div className="p-4 bg-slate-900 min-h-full text-slate-100 space-y-8 w-full">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-green-400">Estatísticas de {plant.name}</h1>
        <Link 
          to={`/plant/${plantId}`}
          className="bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow transition-colors"
        >
          Voltar aos Detalhes
        </Link>
      </div>
      
      <PlantInfoSection plant={plant} />

      <PlantExtraDetails plant={plant} />

    </div>
  );
};

export default PlantStatisticsPage;
