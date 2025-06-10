import React from 'react';
import { Plant, PlantHealthStatus } from '../types';
import { useTranslation } from 'react-i18next';
import PlantInsight from './PlantInsight';
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  Typography,
  Box,
  IconButton,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface PlantCardProps {
  plant: Plant;
  onClick?: () => void;
  selectable?: boolean;
  selected?: boolean;
  onSelectToggle?: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({
  plant,
  onClick,
  selectable,
  selected,
  onSelectToggle,
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (selectable) {
      onSelectToggle && onSelectToggle();
    } else if (onClick) {
      onClick();
    } else if (typeof window !== 'undefined') {
      window.location.href = `/plant/${plant.id}`;
    }
  };

  const ageDays = React.useMemo(() => {
    const birth = new Date(plant.birthDate).getTime();
    if (!birth) return null;
    return Math.floor((Date.now() - birth) / (1000 * 60 * 60 * 24));
  }, [plant.birthDate]);

  return (
    <Card
      onClick={handleClick}
      sx={{ position: 'relative', minHeight: 320, cursor: 'pointer' }}
      elevation={3}
    >
      <CardActionArea sx={{ height: '100%' }}>
        <CardMedia
          component="img"
          height="200"
          image={plant.imageUrl || `https://picsum.photos/seed/${plant.id}/300/200`}
          alt={plant.name}
        />
        <CardContent sx={{ position: 'relative', bgcolor: 'background.paper' }}>
          <Typography variant="h6" noWrap title={plant.name}>
            {plant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap title={plant.strain}>
            {plant.strain || 'N/A'}
          </Typography>
          {ageDays !== null && (
            <Typography variant="caption" color="text.secondary" display="block">
              {t(ageDays === 1 ? 'plant_card.age' : 'plant_card.age_plural', { count: ageDays })}
            </Typography>
          )}
          {plant.healthStatus && plant.healthStatus !== PlantHealthStatus.HEALTHY && (
            <Typography variant="caption" color="error" display="block">
              {t('plant_card.problem', { status: plant.healthStatus })}
            </Typography>
          )}
          <PlantInsight plant={plant} />
        </CardContent>
      </CardActionArea>
      {selectable && (
        <IconButton
          sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'background.paper' }}
          onClick={onSelectToggle}
        >
          <CheckCircleIcon color={selected ? 'success' : 'disabled'} />
        </IconButton>
      )}
    </Card>
  );
};

export default PlantCard;
