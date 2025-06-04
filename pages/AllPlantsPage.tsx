import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlantContext } from '../contexts/PlantContext';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header'; // Re-use header for consistent look
import Sidebar from '../components/Sidebar'; // Re-use sidebar
// ArrowLeftIcon is not used in the provided JSX, so commenting out for now.
// import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const AllPlantsPage: React.FC = () => {
  const { plants, isLoading, error } = usePlantContext();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredPlants = React.useMemo(() => {
    const term = searchTerm.toLowerCase();
    return plants.filter(
      p =>
        p.name.toLowerCase().includes(term) ||
        (p.strain && p.strain.toLowerCase().includes(term))
    );
  }, [plants, searchTerm]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Todas as Plantas"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => navigate('/nova-planta')} // Example action
          onOpenScannerModal={() => navigate('/scanner')} // Example action
        />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          <nav className="flex items-center text-sm text-gray-400 mb-4">
            <Link to="/" className="hover:underline">Dashboard</Link>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-200">Todas as Plantas</span>
          </nav>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Buscar planta..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              aria-label="Buscar planta"
              className="w-full sm:w-80 px-4 py-2 rounded-lg bg-slate-800 placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-900/30 text-red-300 p-4 rounded-lg">
              <p>Erro ao carregar plantas: {error}</p>
            </div>
          ) : plants.length === 0 ? (
            <div className="bg-blue-900/30 text-blue-300 p-4 rounded-lg text-center">
              <p>Nenhuma planta cadastrada ainda.</p>
              <button
                onClick={() => navigate('/nova-planta')}
                className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
              >
                Adicionar Nova Planta
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {filteredPlants.length === 0 ? (
                <p className="col-span-full text-center text-gray-400">Nenhuma planta encontrada.</p>
              ) : (
                filteredPlants.map(plant => (
                  <PlantCard
                    key={plant.id}
                    plant={plant}
                  />
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AllPlantsPage;
