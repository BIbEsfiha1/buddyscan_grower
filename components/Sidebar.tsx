import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Divider,
  Typography,
  useTheme,
} from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import CalendarViewMonthOutlinedIcon from '@mui/icons-material/CalendarViewMonthOutlined';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LeafIcon from './icons/LeafIcon';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();

  const displayName = user?.user_metadata?.full_name || user?.email || 'Usuário';
  let initials = 'U';
  if (user?.user_metadata?.full_name) {
    initials = user.user_metadata.full_name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  } else if (user?.email) {
    initials = user.email.substring(0, 2).toUpperCase();
  }

  const navItems = [
    { name: t('sidebar.dashboard'), path: '/', icon: <DashboardOutlinedIcon /> },
    { name: t('sidebar.plants'), path: '/plants', icon: <YardOutlinedIcon /> },
    { name: t('sidebar.cultivos'), path: '/cultivos', icon: <CalendarViewMonthOutlinedIcon /> },
    { name: t('sidebar.scanner'), path: '/scanner', icon: <QrCodeScannerIcon /> },
    { name: t('sidebar.statistics'), path: '/statistics', icon: <BarChartOutlinedIcon /> },
    { name: t('sidebar.settings'), path: '/settings', icon: <SettingsOutlinedIcon /> },
  ];

  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      variant="temporary"
      ModalProps={{ keepMounted: true }}
      sx={{
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <LeafIcon className="w-6 h-6 text-emerald-500" />
        <Typography variant="h6" color="primary">
          BuddyScan
        </Typography>
      </Box>
      <Divider />
      <List>
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem key={item.name} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                selected={isActive}
                onClick={onClose}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.name} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Box sx={{ mt: 'auto', p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40, fontSize: 16 }}>
            {initials}
          </Avatar>
          <Typography variant="body2">{displayName}</Typography>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
