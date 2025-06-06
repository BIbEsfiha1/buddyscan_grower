import React from 'react';
import IconButton from '@mui/material/IconButton';
import { useTheme } from '../contexts/ThemeContext';
import { useTranslation } from 'react-i18next';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();

  const handleToggle = () => {
    toggleTheme();
  };

  return (
    <IconButton onClick={handleToggle} color="inherit" aria-label={t('header.toggle_theme')}>
      {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </IconButton>
  );
};

export default ThemeToggle;
