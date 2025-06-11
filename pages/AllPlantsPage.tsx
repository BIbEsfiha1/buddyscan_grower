import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { usePlantContext } from '../contexts/PlantContext';
import { useTranslation } from 'react-i18next';
import PlantCard from '../components/PlantCard';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Sidebar from '../components/Sidebar';
import Button from '../components/Button';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import { Cultivo } from '../types';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

const AllPlantsPage: React.FC = () => {
  const { plants, isLoading, error, updatePlantDetails, refreshPlants } = usePlantContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectionMode, setSelectionMode] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [cultivos, setCultivos] = React.useState<Cultivo[]>([]);
  const [selectedCultivo, setSelectedCultivo] = React.useState('');
  const [moving, setMoving] = React.useState(false);
  const [toast, showToast] = useToast();

  React.useEffect(() => {
    if (selectionMode) {
      import('../services/cultivoService').then(m => m.getCultivos().then(setCultivos).catch(() => setCultivos([])));
    }
  }, [selectionMode]);

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
      showToast({ message: t('allPlantsPage.move_success'), type: 'success' });
      setSelectionMode(false);
      setSelectedIds(new Set());
      setSelectedCultivo('');
    } catch (err: any) {
      showToast({ message: t('allPlantsPage.move_error') + (err.message || err), type: 'error' });
    } finally {
      setMoving(false);
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <Box component="main" sx={{ flexGrow: 1 }}>
          <Header
            title={t('allPlantsPage.title')}
            onOpenSidebar={() => setIsSidebarOpen(true)}
            onOpenAddModal={() => navigate('/nova-planta')}
            onOpenScannerModal={() => navigate('/scanner')}
            showBack
            onBack={() => navigate(-1)}
          />
          <Container sx={{ py: 4 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Breadcrumbs
                items={[
                  { label: t('sidebar.dashboard'), to: '/' },
                  { label: t('allPlantsPage.title') },
                ]}
              />
              <Box sx={{ flexGrow: 1 }} />
              {!selectionMode && plants.length > 0 && (
                <Button variant="secondary" onClick={() => setSelectionMode(true)}>
                  {t('allPlantsPage.move_plants')}
                </Button>
              )}
            </Box>
            {selectionMode && (
              <Typography variant="body2" color="text.secondary" mb={2}>
                {t('allPlantsPage.selection', { count: selectedIds.size })}
              </Typography>
            )}
            {isLoading ? (
              <Box display="flex" justifyContent="center" py={8}>
                <Loader size="lg" />
              </Box>
            ) : error ? (
              <Paper sx={{ p: 3, bgcolor: 'error.main', color: 'error.contrastText' }}>
                <Typography>Erro ao carregar plantas: {error}</Typography>
              </Paper>
            ) : plants.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography>{t('allPlantsPage.no_plants')}</Typography>
                <Button
                  variant="primary"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/nova-planta')}
                >
                  {t('allPlantsPage.add_new_plant')}
                </Button>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {plants.map(plant => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={plant.id}>
                    <PlantCard
                      plant={plant}
                      onClick={selectionMode ? undefined : () => navigate(`/plant/${plant.id}`)}
                      selectable={selectionMode}
                      selected={selectedIds.has(plant.id)}
                      onSelectToggle={() => toggleSelect(plant.id)}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Container>
        </Box>
      </Box>
      {selectionMode && (
        <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, p: 2, display: 'flex', gap: 2 }} elevation={3}>
          <FormControl fullWidth size="small">
            <InputLabel id="cultivo-select-label">{t('allPlantsPage.choose_cultivo')}</InputLabel>
            <Select
              labelId="cultivo-select-label"
              value={selectedCultivo}
              label={t('allPlantsPage.choose_cultivo')}
              onChange={e => setSelectedCultivo(e.target.value)}
            >
              <MenuItem value="">{t('allPlantsPage.choose_cultivo')}</MenuItem>
              {cultivos.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="primary"
            size="sm"
            onClick={handleMove}
            disabled={moving || selectedIds.size === 0 || !selectedCultivo}
            loading={moving}
          >
            {t('allPlantsPage.move')}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setSelectionMode(false); setSelectedIds(new Set()); }}>{t('allPlantsPage.cancel')}</Button>
        </Paper>
      )}
      {toast && <Toast toast={toast} />}
    </>
  );
};

export default AllPlantsPage;