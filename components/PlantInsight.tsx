import React from 'react';
import { Plant } from '../types';
import { useTranslation } from 'react-i18next';

interface PlantInsightProps {
  plant: Plant;
}

const PlantInsight: React.FC<PlantInsightProps> = ({ plant }) => {
  if (!plant.estimatedHarvestDate) return null;
  const start = new Date(plant.birthDate).getTime();
  const end = new Date(plant.estimatedHarvestDate).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const now = Date.now();
  const progress = Math.min(Math.max((now - start) / (end - start), 0), 1);
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const { t } = useTranslation();
  return (
    <div className="mt-2">
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded overflow-hidden">
        <div
          className="bg-emerald-500 h-full transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        {daysLeft > 0
          ? t('plant_card.days_to_harvest', { count: daysLeft })
          : t('plant_card.ready_to_harvest')}
      </p>
    </div>
  );
};

export default PlantInsight;
