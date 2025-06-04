import React, { useState, ChangeEvent, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plant, PlantStage, PlantHealthStatus, PlantOperationalStatus, NewPlantData } from '../types';
import { 
  PLANT_STAGES_OPTIONS, 
  PLANT_HEALTH_STATUS_OPTIONS, 
  PLANT_OPERATIONAL_STATUS_OPTIONS,
  CULTIVATION_TYPE_OPTIONS
} from '../constants';
import PlantCard from '../components/PlantCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import PlusIcon from '../components/icons/PlusIcon';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import { usePlantContext } from '../contexts/PlantContext';
import { useAuth } from '../contexts/AuthContext';
import { getUserLocation } from '../getUserLocation';
import { fetchCurrentTemperature, getTemperatureAlert } from '../weather';
import QrCodeScanner from '../components/QrCodeScanner';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import QuickActions from '../components/QuickActions';
import LeafIcon from '../components/icons/LeafIcon';

const DashboardPage: React.FC = () => {
  const { plants, isLoading, error, addPlant } = usePlantContext();
  const navigate = useNavigate();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalPlants: 0,
    activeZones: 0,
    avgTemperature: 0
  });
  const [lastTempUpdate, setLastTempUpdate] = useState<number>(0);
  const [tempAlert, setTempAlert] = useState<string | null>(null);

  const initialFormState: NewPlantData = {
    name: '',
    strain: '',
    birthDate: new Date().toISOString().split('T')[0],
    currentStage: PlantStage.SEEDLING,
    healthStatus: PlantHealthStatus.HEALTHY,
    operationalStatus: PlantOperationalStatus.ACTIVE,
    cultivationType: CULTIVATION_TYPE_OPTIONS[0].value as Plant['cultivationType'],
    substrate: '',
    estimatedHarvestDate: '',
    notes: '',
    imageUrl: undefined, // Explicitly undefined as per NewPlantData
  };
  const [newPlantForm, setNewPlantForm] = useState<NewPlantData>(initialFormState);

  const [, setNewPlantImageFile] = useState<File | null>(null);
  const [newPlantImageBase64, setNewPlantImageBase64] = useState<string | null>(null);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [addPlantError, setAddPlantError] = useState<string | null>(null);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewPlantForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUploaded = (file: File, base64: string) => {
    setNewPlantImageFile(file);
    setNewPlantImageBase64(base64);
  };
  
  const handleImageRemoved = () => {
    setNewPlantImageFile(null);
    setNewPlantImageBase64(null);
  };

  const handleAddPlant = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddPlantError(null);
    if (!newPlantForm.name || !newPlantForm.strain || !newPlantForm.birthDate || !newPlantForm.currentStage || !newPlantForm.healthStatus || !newPlantForm.operationalStatus) {
      setAddPlantError("Campos marcados com * são obrigatórios.");
      return;
    }
    setIsAddingPlant(true);
    const plantDataToSave: NewPlantData = {
      ...newPlantForm,
      imageUrl: newPlantImageBase64 || undefined,
      // Ensure optional fields are correctly passed or remain undefined if empty
      substrate: newPlantForm.substrate || undefined,
      estimatedHarvestDate: newPlantForm.estimatedHarvestDate || undefined,
      notes: newPlantForm.notes || undefined,
      cultivationType: newPlantForm.cultivationType || undefined,
    };

    try {
      const addedPlant = await addPlant(plantDataToSave);
      if (addedPlant) {
        setIsAddModalOpen(false);
        setNewPlantForm(initialFormState);
        setNewPlantImageFile(null);
        setNewPlantImageBase64(null);
        setAddPlantError(null);
        // Wait a tick to ensure context/state update
        setTimeout(() => navigate(`/plant/${addedPlant.id}`), 100);
      } else {
        setAddPlantError("Erro ao adicionar planta. Nenhum detalhe retornado.");
      }
    } catch (err: any) {
      // Mostra todos os detalhes possíveis do erro
      let msg = "Erro inesperado ao adicionar planta.";
      if (err?.message) msg = err.message;
      if (err?.error) msg = err.error;
      if (err?.details) msg += " Detalhes: " + err.details;
      setAddPlantError(msg);
      console.error("Erro ao adicionar planta:", err);
    }
    setIsAddingPlant(false);
  };

  const handleScanSuccess = (plant: Plant): void => {
    navigate(`/plant/${plant.id}`);
  };

  const handleScanError = (errorMessage: string): void => {
    setScannerError(errorMessage);
  };

  // Calculate stats based on plants
  const { user, isLoggedIn } = useAuth();

  // Atualiza a cada 1h enquanto logado
  useEffect(() => {
    let tempInterval: NodeJS.Timeout | null = null;
    async function fetchStatsAndTemp() {
      if (plants.length > 0 && isLoggedIn) {
        // Count total plants
        const totalPlants = plants.length;
        // Count unique zones (cultivos)
        const activeZones = new Set(plants.map(p => p.cultivoId).filter(id => id)).size;
        // Buscar localização e temperatura
        let avgTemperature = 0;
        try {
          let location = await getUserLocation(user);
          let temp = null;
          if (location) {
            temp = await fetchCurrentTemperature(location);
          } else if (user?.user_metadata?.city) {
            temp = await fetchCurrentTemperature({ city: user.user_metadata.city });
          } else {
            temp = await fetchCurrentTemperature({ city: undefined }); // cai no DEFAULT_CITY
          }
          avgTemperature = temp ?? 0;
          setTempAlert(getTemperatureAlert(avgTemperature));
          setLastTempUpdate(Date.now());
        } catch (e) {
          avgTemperature = 0;
          setTempAlert(null);
        }
        setStats({
          totalPlants,
          activeZones,
          avgTemperature
        });
      }
    }
    if (isLoggedIn) {
      fetchStatsAndTemp();
      tempInterval = setInterval(fetchStatsAndTemp, 60 * 60 * 1000); // 1 hora
    }
    return () => {
      if (tempInterval) clearInterval(tempInterval);
    };
  }, [plants, user, isLoggedIn]);

  const inputStyle = "mt-1 block w-full px-3 py-2.5 bg-[#EAEAEA] dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-[#3E3E3E] dark:text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7AC943] focus:border-[#7AC943] sm:text-sm transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-400";
  const selectStyle = "mt-1 block w-full px-3 py-2.5 bg-[#EAEAEA] dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-[#3E3E3E] dark:text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7AC943] focus:border-[#7AC943] sm:text-sm transition-colors";

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Dashboard" 
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenScannerModal={() => setIsScannerModalOpen(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
           {/* Stats Cards */}
          {tempAlert && (
            <div className="mb-3 p-3 rounded-lg bg-yellow-200 text-yellow-900 font-semibold border border-yellow-400 flex items-center gap-2">
              <svg className="w-6 h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {tempAlert}
            </div>
          )}
          <section className="grid gap-6 md:grid-cols-2">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatsCard
                title="Total de Plantas"
                value={stats.totalPlants}
                change="+2 esta semana"
                trend="up"
                icon={<LeafIcon className="w-5 h-5" />}
                color="green"
              />
              <StatsCard
                title="Zonas Ativas"
                value={stats.activeZones}
                color="blue"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
                  </svg>
                }
              />
              <StatsCard
                title="Temperatura Média"
                value={`${Math.round(stats.avgTemperature)}°C`}
                change="Dentro do ideal"
                trend="neutral"
                color="yellow"
                icon={
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                  </svg>
                }
              />
            </div>

            <div className="bg-gray-800/50 p-4 rounded-xl">
              <h2 className="text-xl font-bold mb-4 text-white">Ações Rápidas</h2>
              <QuickActions
                onAddPlant={() => setIsAddModalOpen(true)}
                onScanQR={() => setIsScannerModalOpen(true)}
                onOpenCultivos={() => navigate('/cultivos')}
                onOpenStats={() => navigate('/garden-statistics')}
              />
            </div>
          </section>
          
          {/* Plants List */}
          <section className="bg-gray-800/50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Minhas Plantas</h2>
              <Link to="/plants" className="text-emerald-400 hover:text-emerald-300 text-sm font-medium">
                Ver Todas
              </Link>
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
              <div className="bg-blue-900/30 text-blue-300 p-4 rounded-lg">
                <p>Você ainda não tem plantas cadastradas. Clique no botão + para adicionar sua primeira planta.</p>
              </div>
            ) : (
              <div className="overflow-x-auto pb-2 -mx-4 sm:mx-0">
                <div className="flex space-x-4 snap-x snap-mandatory sm:grid sm:grid-cols-2 md:grid-cols-3 sm:space-x-0 sm:gap-4">
                  {plants.slice(0, 6).map(plant => (
                    <div key={plant.id} className="min-w-[16rem] flex-shrink-0 snap-start sm:min-w-0">
                      <PlantCard
                        plant={plant}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          
          {/* Recent Activity */}
          <section className="bg-gray-800/50 p-4 rounded-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Atividades Recentes</h2>
            <div className="space-y-3">
              {plants.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="p-2 bg-blue-500/20 text-blue-500 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Planta regada</h3>
                      <p className="text-sm text-gray-400">2 horas atrás</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="p-2 bg-emerald-500/20 text-emerald-500 rounded-lg">
                      <LeafIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">Nova planta adicionada</h3>
                      <p className="text-sm text-gray-400">5 horas atrás</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                    <div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5Z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-white">QR Code escaneado</h3>
                      <p className="text-sm text-gray-400">1 dia atrás</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-800 p-3 rounded-lg text-gray-400 text-center">
                  Adicione plantas para ver o histórico de atividades
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Adicionar Nova Planta" size="xl">
        <form onSubmit={handleAddPlant} className="space-y-4">
          {isAddingPlant ? (
            <div className="flex justify-center items-center py-2">
              <LoadingSpinner size="md" />
              <span className="ml-2 text-gray-600 dark:text-slate-300 text-sm">Adicionando planta...</span>
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200">Nome da Planta *</label>
                <input type="text" name="name" id="name" value={newPlantForm.name} onChange={handleInputChange} required className={inputStyle} />
              </div>
              <div>
                <label htmlFor="strain" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Strain *</label>
                <input type="text" name="strain" id="strain" value={newPlantForm.strain} onChange={handleInputChange} required className={inputStyle} />
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Data de Nascimento *</label>
                <input type="date" name="birthDate" id="birthDate" value={newPlantForm.birthDate} onChange={handleInputChange} required className={`${inputStyle} dark:[color-scheme:dark]`} />
              </div>
              <div>
                <label htmlFor="currentStage" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Estágio Atual *</label>
                <select name="currentStage" id="currentStage" value={newPlantForm.currentStage} onChange={handleInputChange} required className={selectStyle}>
                  {PLANT_STAGES_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="healthStatus" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Status de Saúde *</label>
                <select name="healthStatus" id="healthStatus" value={newPlantForm.healthStatus} onChange={handleInputChange} required className={selectStyle}>
                  {PLANT_HEALTH_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="operationalStatus" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Status Operacional *</label>
                <select name="operationalStatus" id="operationalStatus" value={newPlantForm.operationalStatus} onChange={handleInputChange} required className={selectStyle}>
                  {PLANT_OPERATIONAL_STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="cultivationType" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Tipo de Cultivo</label>
                <select name="cultivationType" id="cultivationType" value={newPlantForm.cultivationType || ''} onChange={handleInputChange} className={selectStyle}>
                  <option value="">Selecione...</option>
                  {CULTIVATION_TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="substrate" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Substrato</label>
                <input type="text" name="substrate" id="substrate" value={newPlantForm.substrate || ''} onChange={handleInputChange} className={inputStyle} placeholder="Ex: Coco, Perlita, Mix próprio"/>
              </div>
              <div>
                <label htmlFor="estimatedHarvestDate" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Data Estimada de Colheita</label>
                <input type="date" name="estimatedHarvestDate" id="estimatedHarvestDate" value={newPlantForm.estimatedHarvestDate || ''} onChange={handleInputChange} className={`${inputStyle} dark:[color-scheme:dark]`} />
              </div>
              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-[#3E3E3E] dark:text-slate-200 mb-0.5">Notas Gerais</label>
                <textarea name="notes" id="notes" value={newPlantForm.notes || ''} onChange={handleInputChange} rows={3} className={`${inputStyle} min-h-[60px]`} />
              </div>
              <ImageUpload onImageUploaded={handleImageUploaded} onImageRemoved={handleImageRemoved} label="Foto Principal da Planta"/>
            </>
          )}
          {addPlantError && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
              {addPlantError}
            </div>
          )}
          <div className="flex justify-end space-x-3 pt-5 border-t border-gray-200 dark:border-slate-700">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isAddingPlant}
              className="ml-2"
            >
              Salvar
            </Button>
          </div>
        </form>
      </Modal>

      {/* QR Code Scanner Modal */}
      <Modal 
        isOpen={isScannerModalOpen} 
        onClose={() => setIsScannerModalOpen(false)} 
        title="Escanear QR Code da Planta"
        size="sm"
      >
        {scannerError && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
            {scannerError}
          </div>
        )}
        <QrCodeScanner 
          onScanSuccess={handleScanSuccess} 
          onScanError={handleScanError} 
        />
      </Modal>
    </div>
  );
};

export default DashboardPage;