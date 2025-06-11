import React, { useState, useEffect } from 'react';
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
import AddPlantModal from '../components/AddPlantModal';
import QrCodeScanner, { ScanResult } from '../components/QrCodeScanner';
import { usePlantContext } from '../contexts/PlantContext';
import { useAuth } from '../contexts/AuthContext';
import { Plant, DiaryEntry } from '../types';
import { fetchCurrentTemperature } from '../weather';
import { getUserLocation } from '../getUserLocation';

const DashboardPage: React.FC = () => {
  const { plants, isLoading, error, fetchDiaryEntries } = usePlantContext();
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

  const handlePlantAdded = (plant: Plant) => {
    setIsAddModalOpen(false);
    setTimeout(() => navigate(`/plant/${plant.id}`), 100);
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

      <AddPlantModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handlePlantAdded}
      />

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
