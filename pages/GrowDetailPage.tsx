import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grow, Cultivo, PlantStage } from '../types';
import PlusIcon from '../components/icons/PlusIcon';
import Button from '../components/Button';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import GrowQrCodeDisplay from '../components/GrowQrCodeDisplay';
import { addMassDiaryEntry } from '../services/plantService';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  TextField,
} from '@mui/material';

export default function GrowDetailPage() {
  const { growId } = useParams<{ growId: string }>();
  const navigate = useNavigate();

  const [grow, setGrow] = useState<Grow | null>(null);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, showToast] = useToast();

  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);
  const [showMassModal, setShowMassModal] = useState(false);

  const [massNotes, setMassNotes] = useState('');
  const [massWateringVolume, setMassWateringVolume] = useState('');
  const [massWateringType, setMassWateringType] = useState('');
  const [massFertilizationType, setMassFertilizationType] = useState('');
  const [massFertilizationConcentration, setMassFertilizationConcentration] = useState('');
  const [massPhotoperiod, setMassPhotoperiod] = useState('');
  const [massSprayProduct, setMassSprayProduct] = useState('');
  const [massSprayAmount, setMassSprayAmount] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { getGrows } = await import('../services/growService');
        const { getCultivos } = await import('../services/cultivoService');
        const [growList, cultivosList] = await Promise.all([
          getGrows(),
          getCultivos(),
        ]);
        setGrow(growList.find(g => g.id === growId) || null);
        setCultivos(cultivosList.filter(c => c.growId === growId));
      } catch {
        showToast({ message: 'Erro ao carregar dados', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    if (growId) fetchData();
  }, [growId, showToast]);

  const openMassModal = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo);
    setShowMassModal(true);
    setMassNotes('');
    setMassWateringVolume('');
    setMassWateringType('');
    setMassFertilizationType('');
    setMassFertilizationConcentration('');
    setMassPhotoperiod('');
    setMassSprayProduct('');
    setMassSprayAmount('');
  };

  const handleMassRegister = async () => {
    if (!selectedCultivo) return;
    try {
      await addMassDiaryEntry(selectedCultivo.id, {
        notes: massNotes || undefined,
        wateringVolume: massWateringVolume
          ? Number(massWateringVolume)
          : undefined,
        wateringType: massWateringType || undefined,
        fertilizationType: massFertilizationType || undefined,
        fertilizationConcentration: massFertilizationConcentration
          ? Number(massFertilizationConcentration)
          : undefined,
        photoperiod: massPhotoperiod || undefined,
        sprayProduct: massSprayProduct || undefined,
        sprayAmount: massSprayAmount ? Number(massSprayAmount) : undefined,
        stage: PlantStage.VEGETATIVE,
      });
      showToast({ message: 'Ação registrada em massa com sucesso', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || 'Erro ao registrar ação em massa', type: 'error' });
    } finally {
      setShowMassModal(false);
    }
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
        <Loader message="Carregando espaço..." size="md" />
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
        Espaço não encontrado
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
      {toast && <Toast message={toast.message} type={toast.type} />}

      <Header
        title="Detalhes do Grow"
        onOpenSidebar={() => {}}
        onOpenAddModal={() => navigate(`/novo-cultivo?growId=${grow.id}`)}
        onOpenScannerModal={() => {}}
        showBack
        onBack={() => navigate(-1)}
      />

      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Grows', to: '/grows' },
          { label: grow.name },
        ]}
        className="px-1 sm:px-0 mb-2"
      />

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
          Capacidade: {grow.capacity}
        </Typography>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setShowQrModal(true)}
        sx={{ mt: 1, width: 'max-content' }}
      >
        Ver QR Code
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
                          Selecionar Plantio
                        </Button>
                      </Link>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => openMassModal(c)}
                      >
                        Registrar Ação em Massa
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography color="text.secondary">
            Nenhum plantio neste espaço.
          </Typography>
        )}
      </Box>

      <Modal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        title="QR Code do Espaço"
      >
        <GrowQrCodeDisplay grow={grow} />
      </Modal>

      {selectedCultivo && (
        <Modal
          isOpen={showMassModal}
          onClose={() => setShowMassModal(false)}
          title="Registro em Massa"
          maxWidth="sm"
        >
          <Box display="flex" flexDirection="column" gap={2} p={2}>
            <TextField
              type="number"
              label="Volume de Rega (L)"
              value={massWateringVolume}
              onChange={e => setMassWateringVolume(e.target.value)}
              fullWidth
            />
            <TextField
              label="Tipo de Água/Solução"
              value={massWateringType}
              onChange={e => setMassWateringType(e.target.value)}
              fullWidth
            />
            <TextField
              label="Tipo de Fertilizante"
              value={massFertilizationType}
              onChange={e => setMassFertilizationType(e.target.value)}
              fullWidth
            />
            <TextField
              type="number"
              label="Concentração do Fertilizante"
              value={massFertilizationConcentration}
              onChange={e => setMassFertilizationConcentration(e.target.value)}
              fullWidth
            />
            <TextField
              label="Fotoperíodo (ex: 12/12)"
              value={massPhotoperiod}
              onChange={e => setMassPhotoperiod(e.target.value)}
              fullWidth
            />
            <TextField
              label="Produto de Pulverização"
              value={massSprayProduct}
              onChange={e => setMassSprayProduct(e.target.value)}
              fullWidth
            />
            <TextField
              type="number"
              label="Quantidade Pulverizada"
              value={massSprayAmount}
              onChange={e => setMassSprayAmount(e.target.value)}
              fullWidth
            />
            <TextField
              label="Notas"
              multiline
              minRows={2}
              value={massNotes}
              onChange={e => setMassNotes(e.target.value)}
              fullWidth
            />
            <Box display="flex" gap={1} mt={1}>
              <Button
                variant="secondary"
                onClick={() => setShowMassModal(false)}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handleMassRegister}
                disabled={
                  !massNotes &&
                  !massWateringVolume &&
                  !massFertilizationType &&
                  !massPhotoperiod &&
                  !massSprayProduct
                }
              >
                Salvar
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
}
