import React from 'react';
import { Plant } from '../types';
import {
  PLANT_STAGES_OPTIONS,
  PLANT_HEALTH_STATUS_OPTIONS,
  PLANT_OPERATIONAL_STATUS_OPTIONS,
  CULTIVATION_TYPE_OPTIONS,
  getHealthStatusColor,
  getOperationalStatusColor,
} from '../constants';

interface PlantInfoSectionProps {
  plant: Plant;
}

const PlantInfoSection: React.FC<PlantInfoSectionProps> = ({ plant }) => {
  const healthStatusLabel =
    PLANT_HEALTH_STATUS_OPTIONS.find((s) => s.value === plant.healthStatus)?.label ||
    plant.healthStatus;
  const operationalStatusLabel =
    PLANT_OPERATIONAL_STATUS_OPTIONS.find((s) => s.value === plant.operationalStatus)?.label ||
    plant.operationalStatus;

  return (
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
          <h2 className="text-2xl sm:text-3xl font-bold text-green-400 break-words leading-tight">
            {plant.name}
          </h2>
          <p className="text-lg text-gray-700 dark:text-slate-300">
            <strong className="font-medium text-[#3E3E3E] dark:text-slate-100">Strain:</strong>{' '}
            {plant.strain}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-2 items-center">
            <p className="text-md text-gray-600 dark:text-slate-400">
              <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Nasc.:</strong>{' '}
              {new Date(plant.birthDate).toLocaleDateString('pt-BR')}
            </p>
            {plant.estimatedHarvestDate && (
              <p className="text-md text-gray-600 dark:text-slate-400">
                <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Colheita Est.:</strong>{' '}
                {new Date(plant.estimatedHarvestDate).toLocaleDateString('pt-BR')}
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getOperationalStatusColor(
                plant.operationalStatus
              )}`}
            >
              {operationalStatusLabel}
            </span>
            <span
              className={`px-3 py-1 text-xs font-semibold rounded-full ${getHealthStatusColor(
                plant.healthStatus
              )}`}
            >
              {healthStatusLabel}
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100 text-xs font-semibold rounded-full">
              {PLANT_STAGES_OPTIONS.find((s) => s.value === plant.currentStage)?.label || plant.currentStage}
            </span>
          </div>
          {plant.cultivationType && (
            <p className="text-md text-gray-600 dark:text-slate-400">
              <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Tipo Cultivo:</strong>{' '}
              {CULTIVATION_TYPE_OPTIONS.find((c) => c.value === plant.cultivationType)?.label || plant.cultivationType}
            </p>
          )}
          {plant.substrate && (
            <p className="text-md text-gray-600 dark:text-slate-400">
              <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Substrato:</strong> {plant.substrate}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {plant.heightCm && (
              <p className="text-md text-gray-600 dark:text-slate-400">
                <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Altura:</strong> {plant.heightCm} cm
              </p>
            )}
            {typeof plant.latestEc === 'number' && (
              <p className="text-md text-gray-600 dark:text-slate-400">
                <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Último EC:</strong> {plant.latestEc}
              </p>
            )}
            {typeof plant.latestPh === 'number' && (
              <p className="text-md text-gray-600 dark:text-slate-400">
                <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Último pH:</strong> {plant.latestPh}
              </p>
            )}
          </div>
          {plant.notes && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700">
              <h3 className="text-sm font-semibold text-[#3E3E3E] dark:text-slate-100 mb-1.5">Notas Gerais:</h3>
              <p className="text-sm text-gray-600 dark:text-slate-300 whitespace-pre-wrap bg-gray-50 dark:bg-slate-700/50 p-3.5 rounded-md border border-gray-200 dark:border-slate-600">
                {plant.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlantInfoSection;
