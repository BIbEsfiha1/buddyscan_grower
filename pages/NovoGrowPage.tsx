import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import {
  Box,
  Typography,
  TextField,
  Breadcrumbs,
  IconButton,
  Paper,
} from '@mui/material';

export default function NovoGrowPage() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    try {
      const { addGrow } = await import('../services/growService');
      const newGrow = await addGrow({
        name,
        location: location || undefined,
        capacity: capacity === '' ? undefined : capacity,
      });
      showToast({
        message: 'Grow criado com sucesso! Cadastre seu primeiro cultivo.',
        type: 'success',
      });
      setTimeout(() => navigate(`/novo-cultivo?growId=${newGrow.id}`), 1500);
    } catch (err: any) {
      showToast({
        message: 'Erro ao criar grow: ' + (err.message || err),
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
      p={{ xs: 2, sm: 4 }}
      bgcolor="background.paper"
    >
      {toast && <Toast message={toast.message} type={toast.type} />}

      <Box
        position="sticky"
        top={0}
        zIndex={20}
        display="flex"
        alignItems="center"
        gap={1}
        py={1}
        px={{ xs: 1, sm: 0 }}
        mb={2}
        sx={{ backdropFilter: 'blur(4px)', bgcolor: 'background.paper' }}
      >
        <IconButton onClick={() => navigate(-1)} aria-label="Voltar" color="primary">
          <ArrowLeftIcon className="w-7 h-7" />
        </IconButton>
        <Breadcrumbs separator=">">
          <Link to="/">Dashboard</Link>
          <Link to="/grows">Grows</Link>
          <Typography color="text.primary">Novo Grow</Typography>
        </Breadcrumbs>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, flex: 1 }} variant="outlined">
        <Typography variant="h5" color="primary" fontWeight="bold" textAlign="center" mb={3}>
          Novo Grow
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            id="growName"
            label="Nome do Grow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            id="growLocation"
            label="Localização (opcional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
          />
          <TextField
            id="growCapacity"
            label="Capacidade (opcional)"
            type="number"
            value={capacity}
            onChange={(e) =>
              setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))
            }
            inputProps={{ min: 0 }}
            fullWidth
          />
          <Box mt={3} textAlign="center">
            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!name}>
              Salvar Grow
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
