import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdQrCodeScanner, MdLocalFlorist, MdBarChart, MdEdit } from 'react-icons/md';
import { Box, Button, Typography } from '@mui/material';

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  onClick: () => void;
}

const colorMap = {
  green: 'success',
  blue: 'primary',
  yellow: 'warning',
  red: 'error',
  purple: 'secondary'
} as const;

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onClick }) => (
  <Button
    variant="contained"
    color={colorMap[color] as any}
    onClick={onClick}
    sx={{
      width: 72,
      height: 72,
      borderRadius: '50%',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textTransform: 'none',
      whiteSpace: 'normal',
      lineHeight: 1,
      p: 1
    }}
  >
    {icon}
    <Typography variant="caption" sx={{ mt: 0.5 }}>
      {title}
    </Typography>
  </Button>
);

interface QuickActionsProps {
  onAddPlant: () => void;
  onScanQR: () => void;
  onOpenCultivos: () => void;
  onOpenStats: () => void;
  onRegisterDiary: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddPlant,
  onScanQR,
  onOpenCultivos,
  onOpenStats,
  onRegisterDiary
}) => {
  const { t } = useTranslation();
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(72px, 1fr))',
        gap: 2,
        justifyItems: 'center',
        width: '100%',
        maxWidth: 500,
        mx: 'auto'
      }}
    >
      <QuickAction
        title={t('header.add_plant')}
        icon={<MdAdd size={32} />}
        color="green"
        onClick={onAddPlant}
      />
      <QuickAction
        title={t('sidebar.scanner')}
        icon={<MdQrCodeScanner size={32} />}
        color="purple"
        onClick={onScanQR}
      />
      <QuickAction
        title={t('sidebar.cultivos')}
        icon={<MdLocalFlorist size={32} />}
        color="blue"
        onClick={onOpenCultivos}
      />
      <QuickAction
        title={t('sidebar.statistics')}
        icon={<MdBarChart size={32} />}
        color="yellow"
        onClick={onOpenStats}
      />
      <QuickAction
        title={t('dashboard.register_diary')}
        icon={<MdEdit size={32} />}
        color="red"
        onClick={onRegisterDiary}
      />
    </Box>
  );
};

export default QuickActions;

