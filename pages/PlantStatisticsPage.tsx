import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Plant } from '../types';
import { usePlantContext } from '../contexts/PlantContext';
import Loader from '../components/Loader';
import PlantInfoSection from '../components/PlantInfoSection';
import PlantExtraDetails from '../components/PlantExtraDetails';
import ChevronDownIcon from '../components/icons/ChevronDownIcon';
import ChevronUpIcon from '../components/icons/ChevronUpIcon';
import { 
  PLANT_STAGES_OPTIONS, 
  PLANT_HEALTH_STATUS_LABELS,
  PLANT_OPERATIONAL_STATUS_LABELS
} from '../constants';
import { useTranslation } from 'react-i18next';

const PlantStatisticsPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    getPlantById,
    fetchPlantById,
    isLoading: contextIsLoading,
    error: contextError,
  } = usePlantContext();

  const [plant, setPlant] = useState<Plant | null>(null);
  const [isLoadingLocal, setIsLoadingLocal] = useState(false);
  const [showExtraDetails, setShowExtraDetails] = useState(false);

  const loadPlant = useCallback(async () => {
    if (!plantId) return;
    setIsLoadingLocal(true);
    let current = getPlantById(plantId);
    if (!current) current = await fetchPlantById(plantId);
    setPlant(current || null);
    setIsLoadingLocal(false);
  }, [plantId, getPlantById, fetchPlantById]);

  useEffect(() => { loadPlant(); }, [loadPlant]);

  if (isLoadingLocal || contextIsLoading) {
    return <Loader message={t('plantStatisticsPage.loading')} />;
  }
  if (contextError) {
    return <div className="text-red-500 p-4">{t('plantStatisticsPage.error')}: {contextError}</div>;
  }
  if (!plant) {
    return <div className="p-4 text-center">{t('plantStatisticsPage.notFound')}</div>;
  }

  const operationalLabel = PLANT_OPERATIONAL_STATUS_LABELS[plant.operationalStatus] || plant.operationalStatus;
  const healthLabel = PLANT_HEALTH_STATUS_LABELS[plant.healthStatus] || plant.healthStatus;
  const stageLabel = PLANT_STAGES_OPTIONS.find(o => o.value === plant.currentStage)?.label || plant.currentStage;

  return (
    <div className="p-4 bg-slate-900 min-h-full text-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-green-400">
          {t('plantStatisticsPage.title', { name: plant.name })}
        </h1>
        <button
          onClick={() => navigate(`/plant/${plantId}`)}
          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded shadow"
        >
          {t('plantStatisticsPage.back')}
        </button>
      </div>

      <PlantInfoSection plant={plant} />

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 my-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-green-400">
            {t('plantStatisticsPage.moreDetails')}
          </h2>
          <button
            onClick={() => setShowExtraDetails(!showExtraDetails)}
            aria-expanded={showExtraDetails}
          >
            {showExtraDetails ? <ChevronUpIcon /> : <ChevronDownIcon />}
          </button>
        </div>
        {showExtraDetails && <PlantExtraDetails plant={plant} />}
      </div>
    </div>
  );
};

export default PlantStatisticsPage;
