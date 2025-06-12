import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grow, Cultivo, PlantStage } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Button from '../components/Button';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import ErrorBanner from '../components/ErrorBanner';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import GrowQrCodeDisplay from '../components/GrowQrCodeDisplay';
import MassRegisterModal from '../components/grow/MassRegisterModal';
import { addMassDiaryEntry } from '../services/plantService';
import { getGrows } from '../services/growService';
import { getCultivos } from '../services/cultivoService';
import { Box, Typography, Paper, List, ListItem, IconButton } from '@mui/material';

export default function GrowDetailPage() {
  const { growId } = useParams<{ growId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const [grow, setGrow] = useState<Grow | null>(null);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);
  const [showMassModal, setShowMassModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [growList, cultivosList] = await Promise.all([
          getGrows(),
          getCultivos(),
        ]);
        setGrow(growList.find(g => g.id === growId) || null);
        setCultivos(cultivosList.filter(c => c.growId === growId));
      } catch {
        setError(t('growDetailPage.error_loading_data') || 'Erro ao carregar dados');
        showToast({ message: t('growDetailPage.error_loading_data') || 'Erro ao carregar dados', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    if (growId) fetchData();
  }, [growId, showToast, t]);

  const openMassModal = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo);
    setShowMassModal(true);
  };

  const handleMassSuccess = () => {
    showToast({ 
      message: t('growDetailPage.mass_action_success') || 'Ação registrada em massa com sucesso', 
      type: 'success' 
    });
    setShowMassModal(false);
    setSelectedCultivo(null);
  };

  const handleMassError = (message?: string) => {
    showToast({ 
      message: message || t('growDetailPage.mass_action_error') || 'Erro ao registrar ação em massa', 
      type: 'error' 
    });
    setShowMassModal(false);
    setSelectedCultivo(null);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100%"
        p={6}
      >
        <Loader message={t('growDetailPage.loading_space') || "Carregando espaço..."} size="md" />
      </Box>
    );
  }
  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100%" p={6}>
        <ErrorBanner message={error} />
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {t('growDetailPage.try_again') || 'Tentar novamente'}
        </Button>
      </Box>
    );
  }

  if (!grow) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100%"
        p={6}
      >
        <Typography color="text.secondary">
          {t('growDetailPage.not_found') || 'Espaço não encontrado'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      maxWidth="lg"
      mx="auto"
      width="100%"
      minHeight="100%"
      display="flex"
      flexDirection="column"
      gap={2}
      bgcolor="background.paper"
      p={{ xs: 2, sm: 4 }}
    >
      {toast && <Toast toast={toast} />}

      {/* Mobile-first header + breadcrumbs */}
      <Box
        className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 flex items-center gap-2 py-2 px-1 sm:px-0 -mx-2 sm:mx-0 backdrop-blur-md mb-2"
      >
        <IconButton onClick={() => navigate(-1)} aria-label={t('common.back') || "Voltar"} color="primary">
          <ArrowLeftIcon className="w-7 h-7 text-green-700" />
        </IconButton>
        <Breadcrumbs
          items={[
            { label: t('common.dashboard') || 'Dashboard', to: '/' },
            { label: t('common.grows') || 'Grows', to: '/grows' },
            { label: grow.name },
          ]}
        />
        <Box flexGrow={1} />
        <Link to={`/novo-cultivo?growId=${grow.id}`}>
          <Button 
            variant="primary" 
            size="icon" 
            className="shadow" 
            title={t('growDetailPage.new_planting') || "Novo Plantio"}
          >
            <PlusIcon className="w-5 h-5" />
          </Button>
        </Link>
      </Box>

      <Typography variant="h5" color="primary" fontWeight="bold">
        {grow.name}
      </Typography>
      {grow.location && (
        <Typography variant="body2" color="text.secondary">
          {grow.location}
        </Typography>
      )}
      {grow.capacity && (
        <Typography variant="body2" color="text.secondary">
          {t('growDetailPage.capacity') || 'Capacidade'}: {grow.capacity}
        </Typography>
      )}
      <Button 
        variant="secondary" 
        size="sm" 
        onClick={() => setShowQrModal(true)} 
        sx={{ mt: 1, width: 'max-content' }}
      >
        {t('growDetailPage.view_qr') || 'Ver QR Code'}
      </Button>

      <Box mt={3}>
        {cultivos.length ? (
          <List>
            {cultivos.map(c => (
              <ListItem key={c.id} sx={{ p: 0, mb: 1 }}>
                <Paper sx={{ p: 2, width: '100%' }} variant="outlined">
                  <Box
                    display="flex"
                    flexDirection={{ xs: 'column', sm: 'row' }}
                    alignItems={{ sm: 'center' }}
                    justifyContent="space-between"
                    gap={2}
                  >
                    <Box>
                      <Typography fontWeight="bold">{c.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(c.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Link to={`/cultivo/${c.id}`}>
                        <Button variant="primary" size="sm">
                          {t('growDetailPage.select_cultivo') || 'Selecionar Plantio'}
                        </Button>
                      </Link>
                      <Button variant="secondary" size="sm" onClick={() => openMassModal(c)}>
                        {t('growDetailPage.mass_action') || 'Registrar Ação em Massa'}
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            {t('growDetailPage.no_cultivos') || 'Nenhum plantio neste espaço.'}
          </Typography>
        )}
      </Box>

      <Modal 
        isOpen={showQrModal} 
        onClose={() => setShowQrModal(false)} 
        title={t('growDetailPage.qr_code_title') || "QR Code do Espaço"}
      >
        <GrowQrCodeDisplay grow={grow} />
      </Modal>

      {selectedCultivo && (
        <MassRegisterModal
          cultivoId={selectedCultivo.id}
          isOpen={showMassModal}
          onClose={() => setShowMassModal(false)}
          plantStage={PlantStage.VEGETATIVE}
          onSuccess={handleMassSuccess}
          onError={handleMassError}
        />
      )}
    </Box>
  );
}