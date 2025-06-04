import React from 'react';
import { Plant } from '../types';
import { Link } from 'react-router-dom';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
}

// import { usePlantContext } from '../contexts/PlantContext'; // Removed as updatePlantDetails is no longer used
// import { PlantOperationalStatus } from '../types'; // Removed as it's no longer used

const PlantCard: React.FC<PlantCardProps> = ({ plant, onClick }) => {

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

  return (
    <div className="relative group">
      <Link
        to={`/plant/${plant.id}`}
        onClick={onClick}
        aria-label={`Ver detalhes da planta ${plant.name}`}
        className="block relative rounded-3xl shadow-xl hover:shadow-green-300/40 dark:hover:shadow-green-500/30 transition-all duration-300 overflow-hidden group hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-40 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 min-h-72"
      >
        {/* Elemento decorativo de folha */}
        <div className="absolute -top-5 -left-5 w-20 h-20 opacity-10 dark:opacity-5 pointer-events-none" style={{
          background: 'radial-gradient(circle at top left, #7AC943 0%, transparent 70%)',
          borderRadius: '50% 0 50% 50%',
          transform: 'rotate(-30deg)'
        }} />
        {/* Imagem da planta */}
        <div className="h-48 w-full overflow-hidden rounded-t-3xl">
          <img
            src={plant.imageUrl || `https://picsum.photos/seed/${plant.id}/300/200`}
            alt={plant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        {/* Conteúdo de texto do card */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 truncate" title={plant.name}>{plant.name}</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 truncate" title={plant.strain}>{plant.strain || 'N/A'}</p>
        </div>
        {/* Sombra decorativa inferior */}
        <div className="absolute bottom-0 left-0 w-full h-10 bg-gradient-to-t from-green-100/60 to-transparent dark:from-slate-800/60 pointer-events-none" />
      </Link>

      {/* Botão de ação rápida para remover por doença - REMOVED */}
      {/* {plant.operationalStatus !== PlantOperationalStatus.LOST && (
        <div className="absolute top-2 right-2 z-10">
          <button
            className={`px-2 py-1 rounded text-xs font-bold shadow transition-colors duration-200 ${isMarkingLost ? 'bg-red-400 text-white' : 'bg-red-100 text-red-700 hover:bg-red-500 hover:text-white'} ${markLostSuccess ? 'bg-green-500 text-white' : ''}`}
            title="Marcar como removida por doença"
            onClick={handleMarkAsLost}
            disabled={isMarkingLost}
          >
            {isMarkingLost ? 'Removendo...' : markLostSuccess ? 'Removida!' : 'Remover por doença'}
          </button>
          {markLostError && (
            <span className="block text-xs text-red-600 mt-1">{markLostError}</span>
          )}
        </div>
      )} */}
    </div>
  );
};

export default PlantCard;
