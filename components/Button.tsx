import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
}

/**
 * Botão orgânico, fluido e reutilizável para ações principais do BuddyScan.
 * - Bordas arredondadas, gradiente verde, sombra suave, micro-interação.
 * - Suporte a ícone opcional à esquerda/direita, loading, variantes e tamanhos.
 */
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className = '',
  disabled,
  ...props
}) => {
  const { t } = useTranslation();
  const base =
    'inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm';
  const variants: Record<string, string> = {
    primary:
      'bg-gradient-to-r from-green-400 via-green-500 to-green-600 text-white hover:from-green-500 hover:to-green-700 hover:shadow-lg focus:ring-green-400 dark:focus:ring-offset-slate-900',
    secondary:
      'bg-white text-green-700 border border-green-300 hover:bg-green-50 hover:text-green-800 focus:ring-green-300 dark:bg-slate-700 dark:text-green-300 dark:border-green-600 dark:hover:bg-slate-600 dark:hover:text-green-200 dark:focus:ring-green-500 dark:focus:ring-offset-slate-800',
    danger:
      'bg-gradient-to-r from-red-400 via-red-500 to-red-600 text-white hover:from-red-500 hover:to-red-700 focus:ring-red-400 dark:focus:ring-offset-slate-900',
    ghost:
      'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-500 focus:ring-offset-0 dark:focus:ring-offset-0 shadow-none hover:shadow-none',
  };
  const sizes: Record<string, string> = {
    sm: 'text-sm px-4 py-2',
    md: 'text-base px-5 py-2.5',
    lg: 'text-lg px-7 py-3',
    icon: 'p-2',
  };

  const finalBase = variant === 'ghost' ? base.replace('focus:ring-offset-2', '') : base;

  return (
    <button
      className={[
        finalBase,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        loading ? 'opacity-70 cursor-not-allowed' : '',
        className,
      ].join(' ')}
      disabled={disabled || loading}
      {...props}
    >
      {iconLeft && <span className="mr-2 flex items-center">{iconLeft}</span>}
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
          <span>{typeof children === 'string' ? t('loading') : children}</span>
        </span>
      ) : (
        children
      )}
      {iconRight && <span className="ml-2 flex items-center">{iconRight}</span>}
    </button>
  );
};

export default Button;
