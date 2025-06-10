import React from 'react';
import { Card, CardContent, Typography, Box, useTheme } from '@mui/material';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  trend,
  icon,
  color,
}) => {
  const theme = useTheme();
  const paletteMap = {
    green: theme.palette.success.main,
    blue: theme.palette.primary.main,
    yellow: theme.palette.warning.main,
    red: theme.palette.error.main,
    purple: theme.palette.secondary.main,
  } as const;

  const trendColor =
    trend === 'up'
      ? theme.palette.success.main
      : trend === 'down'
      ? theme.palette.error.main
      : theme.palette.text.secondary;

  return (
    <Card sx={{ p: 2, height: '100%' }} elevation={3}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" component="div">
            {value}
          </Typography>
          {change && (
            <Typography variant="caption" sx={{ color: trendColor }}>
              {trend === 'up' && '▲ '}
              {trend === 'down' && '▼ '}
              {change}
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            p: 1,
            backgroundColor: paletteMap[color],
            color: theme.palette.getContrastText(paletteMap[color]),
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatsCard;

