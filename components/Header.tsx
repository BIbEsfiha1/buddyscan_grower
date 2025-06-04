import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <IconButton onClick={onOpenScannerModal} color="inherit" aria-label={t('header.scan_qr')}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            </svg>
          </IconButton>
          <IconButton onClick={onOpenAddModal} color="inherit" aria-label={t('header.add_plant')}>
            <PlusIcon className="w-5 h-5" />
          </IconButton>
          <IconButton color="inherit" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
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
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>
    </>
  );
};

export default Header;
