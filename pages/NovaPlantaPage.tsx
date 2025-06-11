import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import PlantaForm from '../components/PlantaForm';
import { usePlantContext } from '../contexts/PlantContext';
import {
  PlantStage,
  PlantHealthStatus,
  PlantOperationalStatus,
} from '../types';
import { Box, Paper, Typography } from '@mui/material';

export default function NovaPlantaPage() {
  const [searchParams] = useSearchParams();
  const cultivoId = searchParams.get('cultivoId');
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  const { addPlant, error: plantContextError } = usePlantContext();

  useEffect(() => {
    if (!cultivoId) {
      showToast({ message: 'ID do cultivo não fornecido', type: 'error' });
      setTimeout(() => navigate('/cultivos'), 2000);
    }
  }, [cultivoId, navigate, showToast]);

  const handlePlantaSubmit = async (values: {
    name: string;
    strain: string;
    birthDate: string;
    substrate: string;
  }) => {
    if (!cultivoId) {
      showToast({ message: 'ID do cultivo não encontrado', type: 'error' });
      return;
    }
    setSaving(true);
    try {
      const newPlant = {
        ...values,
        currentStage: PlantStage.SEEDLING,
        healthStatus: PlantHealthStatus.HEALTHY,
        operationalStatus: PlantOperationalStatus.ACTIVE,
        cultivoId,
      };
      const addedPlant = await addPlant(newPlant);
      if (addedPlant) {
        showToast({
          message: 'Planta adicionada com sucesso!',
          type: 'success',
        });
        setTimeout(() => navigate(`/cultivo/${cultivoId}`), 1400);
      } else {
        showToast({
          message: `Erro ao adicionar planta: ${
            plantContextError || 'Nenhum detalhe retornado.'
          }`,
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({
        message: 'Erro ao adicionar planta: ' + (err.message || err),
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      maxWidth="sm"
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
        title="Nova Planta"
        onOpenSidebar={() => {}}
        onOpenAddModal={() => {}}
        onOpenScannerModal={() => {}}
        showBack
        onBack={() => navigate(-1)}
      />

      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Cultivos', to: '/cultivos' },
          ...(cultivoId
            ? [{ label: 'Cultivo', to: `/cultivo/${cultivoId}` }]
            : []),
          { label: 'Nova Planta' },
        ]}
        sx={{ px: { xs: 1, sm: 0 }, mb: 2 }}
      />

      <Paper sx={{ p: { xs: 2, sm: 3 }, flex: 1 }}>
        <Typography
          variant="h5"
          color="primary"
          fontWeight="bold"
          textAlign="center"
          mb={3}
        >
          Adicionar Nova Planta
        </Typography>
        <PlantaForm onSubmit={handlePlantaSubmit} loading={saving} />
      </Paper>
    </Box>
  );
}
