import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlantContext } from '../contexts/PlantContext';
import PlantCard from '../components/PlantCard';
import Loader from '../components/Loader';
import Header from '../components/Header'; // Re-use header for consistent look
import Sidebar from '../components/Sidebar'; // Re-use sidebar
import Button from '../components/Button';
import Toast from '../components/Toast';
import { Cultivo } from '../types';
// ArrowLeftIcon is not used in the provided JSX, so commenting out for now.
// import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';

const AllPlantsPage: React.FC = () => {
  const { plants, isLoading, error, updatePlantDetails, refreshPlants } = usePlantContext();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [cultivos, setCultivos] = React.useState<Cultivo[]>([]);
  const [selectedCultivo, setSelectedCultivo] = React.useState('');
  const [moving, setMoving] = React.useState(false);
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  React.useEffect(() => {
    if (selectionMode) {
      import('../services/cultivoService').then(m => m.getCultivos().then(setCultivos).catch(() => setCultivos([])));
    }
  }, [selectionMode]);

  React.useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id); else newSet.add(id);
      return newSet;
    });
  };

  const handleMove = async () => {
    if (!selectedCultivo || selectedIds.size === 0) return;
    setMoving(true);
    try {
      await Promise.all(Array.from(selectedIds).map(id => updatePlantDetails(id, { cultivoId: selectedCultivo })));
      await refreshPlants();
      setToast({ message: 'Plantas movidas com sucesso!', type: 'success' });
      setSelectionMode(false);
      setSelectedIds(new Set());
      setSelectedCultivo('');
    } catch (err: any) {
      setToast({ message: 'Erro ao mover plantas: ' + (err.message || err), type: 'error' });
    } finally {
      setMoving(false);
    }
  };

  return (
    <>
    <div className="flex min-h-screen bg-gray-900 text-white overflow-y-auto">
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
          {!selectionMode && plants.length > 0 && (
            <div className="flex justify-end">
              <Button variant="secondary" onClick={() => setSelectionMode(true)}>Mover Plantas</Button>
            </div>
          )}
          {selectionMode && (
            <div className="text-sm text-gray-300">{selectedIds.size} selecionada(s). Toque nas plantas para selecionar.</div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader size="lg" />
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
                  onClick={selectionMode ? undefined : () => navigate(`/plant/${plant.id}`)}
                  selectable={selectionMode}
                  selected={selectedIds.has(plant.id)}
                  onSelectToggle={() => toggleSelect(plant.id)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
    {selectionMode && (
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/90 backdrop-blur p-3 flex items-center gap-2">
        <select
          className="flex-1 bg-gray-700 text-white rounded px-2 py-1"
          value={selectedCultivo}
          onChange={e => setSelectedCultivo(e.target.value)}
        >
          <option value="">Escolha o cultivo</option>
          {cultivos.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <Button
          variant="primary"
          size="sm"
          onClick={handleMove}
          disabled={moving || selectedIds.size === 0 || !selectedCultivo}
          loading={moving}
        >
          Mover
        </Button>
        <Button variant="ghost" size="sm" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>Cancelar</Button>
      </div>
    )}
    {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

export default AllPlantsPage;
