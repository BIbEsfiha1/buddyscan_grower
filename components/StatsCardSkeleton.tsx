import React from 'react';
import { Card, CardContent, Skeleton } from '@mui/material';

const StatsCardSkeleton: React.FC = () => (
  <Card sx={{ p: 2 }} elevation={3}>
    <CardContent>
      <Skeleton variant="text" width="40%" sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={32} />
    </CardContent>
  </Card>
);

export default StatsCardSkeleton;

