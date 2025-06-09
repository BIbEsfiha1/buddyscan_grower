import React from 'react';
import { Plant } from '../types';
import PlantInsight from './PlantInsight';
import TiltedCard from './TiltedCard';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
}

// import { usePlantContext } from '../contexts/PlantContext'; // Removed as updatePlantDetails is no longer used
// import { PlantOperationalStatus } from '../types'; // Removed as it's no longer used

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick, selectable, selected, onSelectToggle }) => {

  // const { updatePlantDetails } = usePlantContext(); // Removed
  // const [isMarkingLost, setIsMarkingLost] = React.useState(false); // Removed
  // const [markLostSuccess, setMarkLostSuccess] = React.useState(false); // Removed
  // const [markLostError, setMarkLostError] = React.useState<string | null>(null); // Removed

  // const handleMarkAsLost = async (e: React.MouseEvent) => { // Removed
  //   e.preventDefault();
  //   setIsMarkingLost(true);
  //   setMarkLostSuccess(false);
  //   setMarkLostError(null);
  //   try {
  //     await updatePlantDetails(plant.id, { operationalStatus: PlantOperationalStatus.LOST });
  //     setMarkLostSuccess(true);
  //     setTimeout(() => setMarkLostSuccess(false), 2000);
  //   } catch (error: any) {
  //     setMarkLostError('Erro ao marcar como removida.');
  //     setTimeout(() => setMarkLostError(null), 2500);
  //   } finally {
  //     setIsMarkingLost(false);
  //   }
  // };

  const handleClick = () => {
    if (selectable) {
      onSelectToggle && onSelectToggle();
    } else if (onClick) {
      onClick();
    } else {
      window.location.href = `/plant/${plant.id}`;
    }
  };

  return (
    <TiltedCard
      imageSrc={plant.imageUrl || `https://picsum.photos/seed/${plant.id}/300/200`}
      altText={plant.name}
      containerHeight="320px"
      containerWidth="100%"
      imageHeight="320px"
      imageWidth="100%"
      rotateAmplitude={12}
      scaleOnHover={1.05}
      showMobileWarning={false}
      showTooltip={false}
      displayOverlayContent
      overlayContent={
        <div
          onClick={handleClick}
          className={`cursor-pointer relative rounded-3xl shadow-xl hover:shadow-green-300/40 dark:hover:shadow-green-500/30 transition-all duration-300 overflow-hidden group hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 h-full w-full ${selectable && selected ? 'ring-4 ring-emerald-500/70' : ''}`}
        >
          {/* Elemento decorativo de folha */}
          <div
            className="absolute -top-5 -left-5 w-20 h-20 opacity-10 dark:opacity-5 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at top left, #7AC943 0%, transparent 70%)',
              borderRadius: '50% 0 50% 50%',
              transform: 'rotate(-30deg)'
            }}
          />

          {/* Conteúdo de texto do card */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-b-3xl">
            <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title={plant.name}>{plant.name}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 truncate" title={plant.strain}>{plant.strain || 'N/A'}</p>
            <PlantInsight plant={plant} />
          </div>

          {/* Sombra decorativa inferior */}
          <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-green-100/60 to-transparent dark:from-slate-800/60 pointer-events-none" />

          {selectable && (
            <div className="absolute top-2 right-2">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selected ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white/70 border-gray-300 text-transparent'}`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M9.53 16.28a.75.75 0 0 1-1.06 0l-3.25-3.25a.75.75 0 1 1 1.06-1.06l2.72 2.72 6.72-6.72a.75.75 0 0 1 1.06 1.06l-7.25 7.25z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
          )}
        </div>
      }
    />
  );
};

export default PlantCard;