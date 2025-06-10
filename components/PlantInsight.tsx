import React from 'react';
import { Plant } from '../types';
import { useTranslation } from 'react-i18next';
import { Box, LinearProgress, Typography } from '@mui/material';

interface PlantInsightProps {
  plant: Plant;
}

const PlantInsight: React.FC<PlantInsightProps> = ({ plant }) => {
  if (!plant.estimatedHarvestDate) return null;
  const start = new Date(plant.birthDate).getTime();
  const end = new Date(plant.estimatedHarvestDate).getTime();
  if (isNaN(start) || isNaN(end) || end <= start) return null;
  const now = Date.now();
  const progress = Math.min(Math.max((now - start) / (end - start), 0), 1);
  const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  const { t } = useTranslation();
  return (
    <Box mt={2}>
      <LinearProgress variant="determinate" value={progress * 100} sx={{ height: 8, borderRadius: 1 }} />
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        {daysLeft > 0
          ? t('plant_card.days_to_harvest', { count: daysLeft })
          : t('plant_card.ready_to_harvest')}
      </Typography>
    </Box>
  );
};

export default PlantInsight;
