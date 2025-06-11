import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
} from '@mui/material';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Button from '../components/Button';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from 'react-i18next';

export default function NovoGrowPage() {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState<number | ''>('');
  const [saving, setSaving] = useState(false);
  const [toast, showToast] = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
      showToast({ message: t('novoGrowPage.success'), type: 'success' });
      setTimeout(() => navigate(`/novo-cultivo?growId=${newGrow.id}`), 1500);
    } catch (err: any) {
      showToast({ message: t('novoGrowPage.error', { error: err.message || err }), type: 'error' });
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
        <IconButton onClick={() => navigate(-1)} aria-label={t('novoGrowPage.back')} color="primary">
          <ArrowLeftIcon />
        </IconButton>
        <Breadcrumbs
          items={[
            { label: t('sidebar.dashboard'), to: '/' },
            { label: t('sidebar.grows'), to: '/grows' },
            { label: t('novoGrowPage.title') },
          ]}
        />
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, flex: 1 }} variant="outlined">
        <Typography variant="h5" textAlign="center" mb={3}>
          {t('novoGrowPage.title')}
        </Typography>
        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            id="growName"
            label={t('novoGrowPage.name')}
            value={name}
            onChange={e => setName(e.target.value)}
            required
            fullWidth
          />
          <TextField
            id="growLocation"
            label={t('novoGrowPage.location')}
            value={location}
            onChange={e => setLocation(e.target.value)}
            fullWidth
          />
          <TextField
            id="growCapacity"
            label={t('novoGrowPage.capacity')}
            type="number"
            value={capacity}
            onChange={e => setCapacity(e.target.value === '' ? '' : parseInt(e.target.value))}
            inputProps={{ min: 0 }}
            fullWidth
          />
          <Box mt={3} textAlign="center">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={saving}
              disabled={!name}
            >
              {t('novoGrowPage.save')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
