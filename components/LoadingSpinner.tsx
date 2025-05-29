import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', message }) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2', 
    md: 'w-10 h-10 border-[3px]', 
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} border-[#7AC943] border-t-transparent`}
      ></div>
      {message && <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;