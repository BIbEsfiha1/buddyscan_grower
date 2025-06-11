import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import QuickActions from '../components/QuickActions';
import PlantCard from '../components/PlantCard';
import PlantCardSkeleton from '../components/PlantCardSkeleton';
import Modal from '../components/Modal';
import Button from '../components/Button';
import ImageUpload from '../components/ImageUpload';
import QrCodeScanner, { ScanResult } from '../components/QrCodeScanner';
import { usePlantContext } from '../contexts/PlantContext';
import { useAuth } from '../contexts/AuthContext';
import { Plant, PlantStage, PlantHealthStatus, PlantOperationalStatus, NewPlantData, DiaryEntry } from '../types';
import {
  PLANT_STAGES_OPTIONS,
  PLANT_HEALTH_STATUS_OPTIONS,
  PLANT_OPERATIONAL_STATUS_OPTIONS,
  CULTIVATION_TYPE_OPTIONS,
  SUBSTRATE_OPTIONS,
} from '../constants';
import { fetchCurrentTemperature } from '../weather';
import { getUserLocation } from '../getUserLocation';

const DashboardPage: React.FC = () => {
  const { plants, isLoading, error, addPlant, fetchDiaryEntries } = usePlantContext();
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isScannerModalOpen, setIsScannerModalOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalPlants: 0, activeZones: 0, avgTemperature: 0 });
  const [recentEntries, setRecentEntries] = useState<DiaryEntry[]>([]);
  const [lastTempUpdate, setLastTempUpdate] = useState(0);

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
    imageUrl: undefined,
  };
  const [newPlantForm, setNewPlantForm] = useState<NewPlantData>(initialFormState);
  const [, setNewPlantImageFile] = useState<File | null>(null);
  const [newPlantImageBase64, setNewPlantImageBase64] = useState<string | null>(null);
  const [isAddingPlant, setIsAddingPlant] = useState(false);
  const [addPlantError, setAddPlantError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      const totalPlants = plants.length;
      const activeZones = new Set(plants.map(p => p.cultivoId).filter(Boolean)).size;
      let avgTemperature = stats.avgTemperature;
      if (isLoggedIn && Date.now() - lastTempUpdate > 60 * 60 * 1000) {
        try {
          const loc = await getUserLocation(user);
          const temp = await fetchCurrentTemperature(loc || { city: undefined });
          avgTemperature = temp ?? 0;
          setLastTempUpdate(Date.now());
        } catch {
          avgTemperature = 0;
        }
      }
      setStats({ totalPlants, activeZones, avgTemperature });

      try {
        const allEntries = (
          await Promise.all(plants.map(p => fetchDiaryEntries(p.id)))
        ).flat();
        setRecentEntries(
          allEntries
            .sort(
              (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
            )
            .slice(0, 5)
        );
      } catch {
        setRecentEntries([]);
      }
    }

    fetchStats();
  }, [plants, isLoggedIn, user]);

  const filteredPlants = plants.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.strain && p.strain.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
    if (!newPlantForm.name || !newPlantForm.strain || !newPlantForm.birthDate) {
      setAddPlantError("Campos marcados com * são obrigatórios.");
      return;
    }
    setIsAddingPlant(true);
    const plantDataToSave: NewPlantData = {
      ...newPlantForm,
      imageUrl: newPlantImageBase64 || undefined,
      substrate: newPlantForm.substrate || undefined,
      estimatedHarvestDate: newPlantForm.estimatedHarvestDate || undefined,
      notes: newPlantForm.notes || undefined,
      cultivationType: newPlantForm.cultivationType || undefined,
    };
    try {
      const added = await addPlant(plantDataToSave);
      if (added) {
        setIsAddModalOpen(false);
        setNewPlantForm(initialFormState);
        setNewPlantImageFile(null);
        setNewPlantImageBase64(null);
        setTimeout(() => navigate(`/plant/${added.id}`), 100);
      } else {
        setAddPlantError('Erro ao adicionar planta.');
      }
    } catch (err: any) {
      setAddPlantError(err?.message || 'Erro inesperado');
    }
    setIsAddingPlant(false);
  };

  const handleScanSuccess = (result: ScanResult) => {
    if (result.type === 'plant' && result.plant) {
      navigate(`/plant/${result.plant.id}`);
    } else if (result.type === 'grow' && result.grow) {
      navigate(`/grow/${result.grow.id}`);
    }
  };

  const handleScanError = (msg: string) => {
    setScannerError(msg);
  };

  return (
    <Box sx={{ display: 'flex', backgroundColor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Header
          title="Dashboard"
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenScannerModal={() => setIsScannerModalOpen(true)}
        />
        <Container sx={{ py: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <StatsCard
                title={t('dashboard.total_plants')}
                value={stats.totalPlants}
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2a4 4 0 00-4 4v5.528A6.002 6.002 0 006 18a6 6 0 0012 0 6.002 6.002 0 00-2-4.472V6a4 4 0 00-4-4z" clipRule="evenodd"/></svg>}
                color="green"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard
                title={t('dashboard.active_zones')}
                value={stats.activeZones}
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>}
                color="blue"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatsCard
                title={t('dashboard.avg_temperature')}
                value={`${Math.round(stats.avgTemperature)}°C`}
                icon={<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M6 2a2 2 0 012 2v7.268A4 4 0 118 20V4a2 2 0 012-2z" clipRule="evenodd"/></svg>}
                color="yellow"
              />
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('dashboard.quick_actions')}
                </Typography>
                <QuickActions
                  onAddPlant={() => setIsAddModalOpen(true)}
                  onScanQR={() => setIsScannerModalOpen(true)}
                  onOpenGrows={() => navigate('/grows')}
                  onOpenCultivos={() => navigate('/cultivos')}
                  onOpenStats={() => navigate('/garden-statistics')}
                  onRegisterDiary={() => navigate('/plants')}
                />
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6">
                    {t('dashboard.my_plants')}
                  </Typography>
                  <Link to="/plants" className="text-emerald-400 text-sm">
                    {t('dashboard.view_all')}
                  </Link>
                </Box>
                <input
                  type="text"
                  placeholder={t('dashboard.search_placeholder')}
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 mb-4 rounded-md border border-gray-300 dark:border-slate-700 bg-transparent"
                />
                {isLoading ? (
                  <Grid container spacing={2}>
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i}>
                        <PlantCardSkeleton />
                      </Grid>
                    ))}
                  </Grid>
                ) : error ? (
                  <Typography color="error">{t('dashboard.error_loading_plants')}: {error}</Typography>
                ) : plants.length === 0 ? (
                  <Typography color="text.secondary">{t('dashboard.no_plants')}</Typography>
                ) : filteredPlants.length === 0 ? (
                  <Typography color="text.secondary">{t('dashboard.no_results')}</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {filteredPlants.slice(0, 6).map(plant => (
                      <Grid item xs={12} sm={6} md={4} key={plant.id}>
                        <PlantCard plant={plant} onClick={() => navigate(`/plant/${plant.id}`)} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('dashboard.recent_activity')}
                </Typography>
                <Box>
                  {recentEntries.length ? (
                    recentEntries.map(entry => {
                      const plant = plants.find(p => p.id === entry.plantId);
                      const time = new Date(entry.timestamp);
                      return (
                        <Box key={entry.id} display="flex" alignItems="center" mb={1}>
                          <Box mr={2} p={1} bgcolor="primary.main" borderRadius={1} color="primary.contrastText">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M4 4h16v16H4z"/></svg>
                          </Box>
                          <div>
                            <Typography variant="subtitle2">{plant ? plant.name : entry.plantId}</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {time.toLocaleDateString()} {time.toLocaleTimeString()}
                            </Typography>
                          </div>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography color="text.secondary">{t('dashboard.no_activity')}</Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('dashboard.add_modal_title')} maxWidth="xl">
        <form onSubmit={handleAddPlant} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-0.5">{t('form.name')} *</label>
              <input type="text" id="name" name="name" value={newPlantForm.name} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="strain" className="block text-sm font-medium mb-0.5">{t('form.strain')} *</label>
              <input type="text" id="strain" name="strain" value={newPlantForm.strain} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium mb-0.5">{t('form.birth_date')} *</label>
              <input type="date" id="birthDate" name="birthDate" value={newPlantForm.birthDate} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label htmlFor="currentStage" className="block text-sm font-medium mb-0.5">{t('form.current_stage')} *</label>
              <select id="currentStage" name="currentStage" value={newPlantForm.currentStage} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md">
                {PLANT_STAGES_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="healthStatus" className="block text-sm font-medium mb-0.5">{t('form.health_status')} *</label>
              <select id="healthStatus" name="healthStatus" value={newPlantForm.healthStatus} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md">
                {PLANT_HEALTH_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="operationalStatus" className="block text-sm font-medium mb-0.5">{t('form.operational_status')} *</label>
              <select id="operationalStatus" name="operationalStatus" value={newPlantForm.operationalStatus} onChange={handleInputChange} required className="w-full px-3 py-2 border rounded-md">
                {PLANT_OPERATIONAL_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="cultivationType" className="block text-sm font-medium mb-0.5">{t('form.cultivation_type')}</label>
              <select id="cultivationType" name="cultivationType" value={newPlantForm.cultivationType || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                <option value="">{t('form.select_option')}</option>
                {CULTIVATION_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="substrate" className="block text-sm font-medium mb-0.5">{t('form.substrate')}</label>
              <select id="substrate" name="substrate" value={newPlantForm.substrate} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md">
                {SUBSTRATE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="estimatedHarvestDate" className="block text-sm font-medium mb-0.5">{t('form.estimated_harvest')}</label>
              <input type="date" id="estimatedHarvestDate" name="estimatedHarvestDate" value={newPlantForm.estimatedHarvestDate || ''} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium mb-0.5">{t('form.notes')}</label>
              <textarea id="notes" name="notes" value={newPlantForm.notes || ''} onChange={handleInputChange} rows={3} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div className="md:col-span-2">
              <ImageUpload onImageUploaded={handleImageUploaded} onImageRemoved={handleImageRemoved} label={t('form.main_photo')} />
            </div>
          </div>
          {addPlantError && (
            <Typography color="error">{addPlantError}</Typography>
          )}
          <div className="flex justify-end pt-4 space-x-3">
            <Button type="button" variant="secondary" size="md" onClick={() => setIsAddModalOpen(false)}>
              {t('actions.cancel')}
            </Button>
            <Button type="submit" variant="primary" size="md" loading={isAddingPlant}>
              {t('actions.save')}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isScannerModalOpen} onClose={() => setIsScannerModalOpen(false)} title={t('header.scan_qr')} maxWidth="sm">
        {scannerError && (
          <Typography color="error" sx={{ mb: 2 }}>{scannerError}</Typography>
        )}
        <QrCodeScanner onScanSuccess={handleScanSuccess} onScanError={handleScanError} scanType="auto" />
      </Modal>
    </Box>
  );
};

export default DashboardPage;
