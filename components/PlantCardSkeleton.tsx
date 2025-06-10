import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const PlantCardSkeleton: React.FC = () => (
  <Card sx={{ minHeight: 320 }}>
    <Skeleton variant="rectangular" height={200} animation="wave" />
    <CardContent>
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="40%" />
    </CardContent>
  </Card>
);

export default PlantCardSkeleton;
