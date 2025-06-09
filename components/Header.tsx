import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { MdMenu, MdSearch, MdQrCodeScanner, MdNotifications, MdAdd } from 'react-icons/md';
import PlusIcon from './icons/PlusIcon';
import ProfileDropdown from './ProfileDropdown';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';

interface HeaderProps {
  title: string;
  onOpenSidebar: () => void;
  onOpenAddModal: () => void;
  onOpenScannerModal: () => void;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onOpenSidebar,
  onOpenAddModal,
  onOpenScannerModal
}) => {
  const { user, logout } = useAuth(); // Ensure logout is extracted
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const { t } = useTranslation();

  console.log('[Header.tsx] Rendering. User:', user, 'isProfileDropdownOpen:', isProfileDropdownOpen);

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
          <IconButton edge="start" onClick={onOpenSidebar} aria-label={t('header.open_menu')} sx={{ display: { md: 'none' } }}>
            <MdMenu size={24} />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }} color="inherit">
            {title}
          </Typography>
          <div className="hidden md:block relative mr-3">
            <input
              type="text"
              placeholder={t('header.search')}
              className="bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-48 focus:w-60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <MdSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          </div>
          <IconButton onClick={onOpenScannerModal} color="inherit" aria-label={t('header.scan_qr')}>
            <MdQrCodeScanner size={20} />
          </IconButton>
          <IconButton onClick={onOpenAddModal} color="inherit" aria-label={t('header.add_plant')}>
            <MdAdd size={20} />
          </IconButton>
          <IconButton color="inherit" className="relative">
            <MdNotifications size={20} />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
          </IconButton>
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
      <div className="mt-3 md:hidden px-4">
      <div className="relative">
        <input
          type="text"
          placeholder={t('header.search')}
          className="bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <MdSearch className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
      </div>
      </div>
    </>
  );
};

export default Header;
