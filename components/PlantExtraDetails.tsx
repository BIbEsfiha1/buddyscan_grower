import React, { useState } from 'react';
import { Plant } from '../types';
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';

interface PlantExtraDetailsProps {
  plant: Plant;
}

const PlantExtraDetails: React.FC<PlantExtraDetailsProps> = ({ plant }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl transition-colors duration-300">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex justify-between items-center p-4 sm:p-5 text-left text-lg font-semibold text-[#7AC943] hover:bg-green-50 dark:hover:bg-slate-700/50 transition-colors duration-150 rounded-t-xl focus:outline-none"
      >
        Mais Detalhes da Planta
        {open ? (
          <ChevronUpIcon className="w-6 h-6 text-[#7AC943]" />
        ) : (
          <ChevronDownIcon className="w-6 h-6 text-[#7AC943]" />
        )}
      </button>
      {open && (
        <div className="p-4 sm:p-5 border-t border-gray-200 dark:border-slate-700 space-y-2.5 text-sm">
          <p>
            <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">ID Interno:</strong>{' '}
            <span className="text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">
              {plant.id}
            </span>
          </p>
          {plant.qrCodeValue && (
            <p>
              <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">ID QR Code:</strong>{' '}
              <span className="text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-xs">
                {plant.qrCodeValue}
              </span>
            </p>
          )}
          {plant.growRoomId && (
            <p>
              <strong className="font-medium text-[#3E3E3E] dark:text-slate-200">Sala de Cultivo:</strong>{' '}
              <span className="text-gray-600 dark:text-slate-300">{plant.growRoomId}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PlantExtraDetails;
