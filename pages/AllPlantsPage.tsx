import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlantContext } from '../contexts/PlantContext';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Header from '../components/Header'; // Re-use header for consistent look
import Sidebar from '../components/Sidebar'; // Re-use sidebar
import Modal from '../components/Modal';
import Button from '../components/Button';
import { Cultivo } from '../types';
// ArrowLeftIcon is not used in the provided JSX, so commenting out for now.
// import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const AllPlantsPage: React.FC = () => {
  const { plants, isLoading, error, updatePlantDetails, refreshPlants } = usePlantContext();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [targetCultivo, setTargetCultivo] = useState('');

  useEffect(() => {
    if (moveModalOpen && cultivos.length === 0) {
      import('../services/cultivoService').then(({ getCultivos }) => {
        getCultivos().then(setCultivos).catch(() => setCultivos([]));
      });
    }
  }, [moveModalOpen, cultivos.length]);

  const toggleSelection = () => {
    setSelectionMode((prev) => !prev);
    setSelectedIds([]);
  };

  const handleSelectChange = (plantId: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, plantId] : prev.filter((id) => id !== plantId)
    );
  };

  const handleMovePlants = async () => {
    if (!targetCultivo) return;
    for (const id of selectedIds) {
      await updatePlantDetails(id, { cultivoId: targetCultivo });
    }
    await refreshPlants();
    setMoveModalOpen(false);
    setSelectionMode(false);
    setSelectedIds([]);
    setTargetCultivo('');
  };

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
          <div className="flex items-center justify-between mb-4">
            <nav className="flex items-center text-sm text-gray-400">
              <Link to="/" className="hover:underline">Dashboard</Link>
              <span className="mx-2">&gt;</span>
              <span className="font-semibold text-gray-200">Todas as Plantas</span>
            </nav>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={toggleSelection}>
                {selectionMode ? 'Cancelar' : 'Selecionar'}
              </Button>
              {selectionMode && (
                <Button
                  variant="primary"
                  disabled={selectedIds.length === 0}
                  onClick={() => setMoveModalOpen(true)}
                >
                  Mover Selecionadas
                </Button>
              )}
            </div>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {plants.map(plant => (
                <PlantCard
                  key={plant.id}
                  plant={plant}
                  selectable={selectionMode}
                  isSelected={selectedIds.includes(plant.id)}
                  onSelectChange={(checked) => handleSelectChange(plant.id, checked)}
                  onClick={() => navigate(`/plant/${plant.id}`)}
                />
              ))}
            </div>
         )}
        </main>
      </div>
      <Modal isOpen={moveModalOpen} onClose={() => setMoveModalOpen(false)} title="Mover Plantas" size="sm">
        <div className="space-y-4">
          <select
            className="w-full border rounded px-2 py-2 bg-white text-gray-800"
            value={targetCultivo}
            onChange={(e) => setTargetCultivo(e.target.value)}
          >
            <option value="">Selecione o cultivo</option>
            {cultivos.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setMoveModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={handleMovePlants} disabled={!targetCultivo}>
              Mover
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AllPlantsPage;
