import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MdMenu, MdQrCodeScanner, MdNotifications, MdAdd, MdArrowBack } from 'react-icons/md';
import SearchIcon from '@mui/icons-material/Search';
import ThemeToggle from './ThemeToggle';
import ProfileDropdown from './ProfileDropdown';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onOpenSidebar,
  onOpenAddModal,
  onOpenScannerModal,
  showBack = false,
  onBack,
}) => {
  const { user, logout } = useAuth(); // Ensure logout is extracted
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { t } = useTranslation();


  let initials = 'U';
  if (user?.user_metadata?.full_name) {
    initials = user.user_metadata.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  } else if (user?.email) {
    initials = user.email.substring(0, 2).toUpperCase();
  }

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0} sx={{ px: 2, py: 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          {showBack ? (
            <IconButton edge="start" onClick={onBack} aria-label={t('header.go_back')}>
              <MdArrowBack size={24} />
            </IconButton>
          ) : (
            <IconButton edge="start" onClick={onOpenSidebar} aria-label={t('header.open_menu')} sx={{ display: { md: 'none' } }}>
              <MdMenu size={24} />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit">
            {title}
          </Typography>
          <TextField
            variant="outlined"
            size="small"
            placeholder={t('header.search')}
            sx={{
              display: { xs: 'none', md: 'block' },
              mr: 3,
              width: 200,
              transition: 'width 0.3s',
              '&.Mui-focused': { width: 250 }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <IconButton onClick={onOpenScannerModal} color="inherit" aria-label={t('header.scan_qr')}>
            <MdQrCodeScanner size={20} />
          </IconButton>
          <IconButton onClick={onOpenAddModal} color="inherit" aria-label={t('header.add_plant')}>
            <MdAdd size={20} />
          </IconButton>
          <IconButton color="inherit" className="relative">
            <MdNotifications size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900 dark:ring-gray-200"></span>
          </IconButton>
          <ThemeToggle className="ml-2" />
          <div className="relative">
            <IconButton onClick={() => setIsProfileDropdownOpen(prev => !prev)} size="small" aria-controls="user-menu" aria-haspopup="true">
              <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32, fontSize: 14 }}>{initials}</Avatar>
            </IconButton>
            <ProfileDropdown
              isOpen={isProfileDropdownOpen}
              onClose={() => setIsProfileDropdownOpen(false)}
              onLogout={logout}
              user={user}
            />
          </div>
        </Toolbar>
      </AppBar>
      <Box sx={{ mt: 3, px: 2, display: { xs: 'block', md: 'none' } }}>
        <TextField
          variant="outlined"
          size="small"
          placeholder={t('header.search')}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </>
  );
};

export default Header;
