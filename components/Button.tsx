import React from 'react';
import MuiButton, { ButtonProps as MuiButtonProps } from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useTranslation } from 'react-i18next';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color'> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Botão baseado no Material UI com suporte a ícones e estado de loading.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled,
  ...props
}) => {
  const { t } = useTranslation();

  const colorMap: Record<string, 'primary' | 'inherit' | 'error'> = {
    primary: 'primary',
    secondary: 'inherit',
    danger: 'error',
    ghost: 'inherit',
  };

  const sizeMap: Record<string, MuiButtonProps['size']> = {
    sm: 'small',
    md: 'medium',
    lg: 'large',
    icon: 'medium',
  };

  return (
    <MuiButton
      {...props}
      color={colorMap[variant]}
      size={sizeMap[size]}
      disabled={disabled || loading}
      variant={variant === 'ghost' ? 'text' : 'contained'}
      sx={{ textTransform: 'none' }}
      fullWidth={fullWidth}
      startIcon={iconLeft}
      endIcon={iconRight}
    >
      {loading ? (
        <>
          <CircularProgress size={16} sx={{ mr: 1 }} />
          {typeof children === 'string' ? t('loading') : children}
        </>
      ) : (
        children
      )}
    </MuiButton>
  );
};

export default Button;
