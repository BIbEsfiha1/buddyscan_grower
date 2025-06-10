import React from 'react';
import { Plant, PlantHealthStatus } from '../types';
import SpotlightCard from './SpotlightCard';

interface PlantSpotlightCardProps {
  plant: Plant;
}

const PlantSpotlightCard: React.FC<PlantSpotlightCardProps> = ({ plant }) => {
  const ageDays = React.useMemo(() => {
    const birth = new Date(plant.birthDate).getTime();
    if (!birth) return null;
    return Math.floor((Date.now() - birth) / (1000 * 60 * 60 * 24));
  }, [plant.birthDate]);

  return (
    <SpotlightCard className="py-4 max-w-sm">
      <div className="pb-0 pt-2 flex flex-col items-start">
        <h4 className="font-bold text-lg text-white">{plant.name}</h4>
        <p className="text-xs uppercase font-bold text-gray-400">
          {plant.currentStage}
          {ageDays !== null && ` • ${ageDays} dias`}
        </p>
        {plant.lastDailyCheckDate && (
          <small className="text-gray-400">Último check: {plant.lastDailyCheckDate}</small>
        )}
        <small className="text-gray-400">
          Saúde:{' '}
          {plant.healthStatus === PlantHealthStatus.HEALTHY
            ? 'Saudável'
            : plant.healthStatus}
        </small>
      </div>
      <div className="overflow-visible py-2">
        <img
          alt={plant.name}
          className="object-cover rounded-xl w-full h-40"
          src={
            plant.imageUrl || `https://picsum.photos/seed/${plant.id}/300/200`
          }
        />
      </div>
    </SpotlightCard>
  );
};

export default PlantSpotlightCard;
