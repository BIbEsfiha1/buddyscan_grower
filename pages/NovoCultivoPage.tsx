import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  MenuItem,
  IconButton,
} from '@mui/material';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Button from '../components/Button';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTranslation } from 'react-i18next';
import { SUBSTRATE_OPTIONS } from '../constants';
import {
  Grow,
  PlantStage,
  PlantHealthStatus,
  PlantOperationalStatus,
} from '../types';

export default function NovoCultivoPage() {
  const [searchParams] = useSearchParams();
  const initialGrowId = searchParams.get('growId') || '';

  const [cultivoNome, setCultivoNome] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [substrate, setSubstrate] = useState('');
  const [grows, setGrows] = useState<Grow[]>([]);
  const [growId, setGrowId] = useState(initialGrowId);
  const [plants, setPlants] = useState<{ name: string; strain: string }[]>([
    { name: '', strain: '' },
  ]);
  const [saving, setSaving] = useState(false);

  const { t } = useTranslation();
  const [toast, showToast] = useToast();
  const navigate = useNavigate();

  // Fetch available grows
  useEffect(() => {
    (async () => {
      try {
        const { getGrows } = await import('../services/growService');
        const data = await getGrows();
        setGrows(data);
      } catch (e) {
        console.error('Erro ao carregar grows', e);
      }
    })();
  }, []);

  const updatePlant = (
    index: number,
    field: 'name' | 'strain',
    value: string
  ) => {
    setPlants(prev =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  };

  const addPlantField = () =>
    setPlants(prev => [...prev, { name: '', strain: '' }]);

  const removePlantField = (index: number) => {
    setPlants(prev => prev.filter((_, i) => i !== index));
  };

  const handleSalvarCultivo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { addCultivo } = await import('../services/cultivoService');
      const plantsToSend = plants
        .filter(p => p.name && p.strain)
        .map(p => ({
          ...p,
          birthDate: startDate,
          currentStage: PlantStage.SEEDLING,
          healthStatus: PlantHealthStatus.HEALTHY,
          operationalStatus: PlantOperationalStatus.ACTIVE,
          substrate,
        }));

      await addCultivo({
        name: cultivoNome,
        startDate,
        notes,
        substrate,
        growId: growId || undefined,
        plants: plantsToSend,
      });

      showToast({ message: t('novoCultivo.success'), type: 'success' });
      setTimeout(() => navigate('/cultivos'), 1800);
    } catch (err: any) {
      showToast({ message: `${t('novoCultivo.error')}: ${err.message || err}`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Styles
  const inputStyle =
    'w-full px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 ' +
    'border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelStyle = 'block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1';

  return (
    <Box className="mx-auto w-full max-w-3xl p-4 flex flex-col gap-4 bg-white dark:bg-gray-900">
      {toast && <Toast toast={toast} />}

      <Box className="sticky top-0 z-20 bg-white dark:bg-gray-900 backdrop-blur p-2 flex items-center gap-2 mb-4">
        <IconButton onClick={() => navigate(-1)} color="primary">
          <ArrowLeftIcon />
        </IconButton>
        <Breadcrumbs
          items={[
            { label: t('sidebar.dashboard'), to: '/' },
            { label: t('sidebar.cultivos'), to: '/cultivos' },
            { label: t('novoCultivo.title') },
          ]}
        />
      </Box>

      <Paper className="p-6" variant="outlined">
        <Typography variant="h5" className="mb-4 text-center">
          {t('novoCultivo.title')}
        </Typography>
        <Box component="form" onSubmit={handleSalvarCultivo} className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Cultivo Info */}
          <fieldset className="space-y-4">
            <legend className="font-semibold">{t('novoCultivo.sectionInfo')}</legend>
            <div>
              <label htmlFor="cultivoNome" className={labelStyle}>
                {t('novoCultivo.fieldName')}
              </label>
              <input
                id="cultivoNome"
                className={inputStyle}
                value={cultivoNome}
                onChange={e => setCultivoNome(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="startDate" className={labelStyle}>
                {t('novoCultivo.fieldStartDate')}
              </label>
              <input
                id="startDate"
                type="date"
                className={inputStyle}
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="growId" className={labelStyle}>
                {t('novoCultivo.fieldGrow')}
              </label>
              <select
                id="growId"
                className={inputStyle}
                value={growId}
                onChange={e => setGrowId(e.target.value)}
              >
                <option value="">{t('novoCultivo.selectGrow')}</option>
                {grows.map(g => (
                  <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="substrate" className={labelStyle}>
                {t('novoCultivo.fieldSubstrate')}
              </label>
              <select
                id="substrate"
                className={inputStyle}
                value={substrate}
                onChange={e => setSubstrate(e.target.value)}
              >
                {SUBSTRATE_OPTIONS.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className={labelStyle}>
                {t('novoCultivo.fieldNotes')}
              </label>
              <textarea
                id="notes"
                className={inputStyle}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </fieldset>

          {/* Plants Section */}
          <fieldset className="space-y-4">
            <legend className="font-semibold">{t('novoCultivo.sectionPlants')}</legend>
            {plants.map((p, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  placeholder={t('novoCultivo.plantName')}
                  value={p.name}
                  onChange={e => updatePlant(i, 'name', e.target.value)}
                  className={inputStyle}
                />
                <input
                  placeholder={t('novoCultivo.plantStrain')}
                  value={p.strain}
                  onChange={e => updatePlant(i, 'strain', e.target.value)}
                  className={inputStyle}
                />
                {plants.length > 1 && (
                  <Button
                    variant="text"
                    onClick={() => removePlantField(i)}
                  >
                    {t('novoCultivo.removePlant')}
                  </Button>
                )}
              </div>
            ))}
            <Button variant="text" onClick={addPlantField}>
              + {t('novoCultivo.addPlant')}
            </Button>
          </fieldset>

          {/* Submit */}
          <Box className="lg:col-span-2 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              loading={saving}
            >
              {t('novoCultivo.save')}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}