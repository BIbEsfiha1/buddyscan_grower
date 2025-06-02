import React, { ReactNode, useState, useEffect } from 'react';
import XMarkIcon from './icons/XMarkIcon';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowContent(true); 
    } else {
      const timer = setTimeout(() => {
        setShowContent(false); 
      }, 300); 
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const [isModalVisible, setIsModalVisible] = useState(isOpen); 
  useEffect(() => {
    if(isOpen) {
      setIsModalVisible(true); 
    } else {
      const unmountTimer = setTimeout(() => setIsModalVisible(false), 350); 
      return () => clearTimeout(unmountTimer);
    }
  }, [isOpen]);


  if (!isModalVisible && !isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-3xl' 
  };
  
  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-60 dark:bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-[100] p-4 transition-opacity duration-300 ease-in-out ${isOpen && showContent ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-7 w-full ${sizeClasses[size]} transform transition-all duration-300 ease-in-out ${isOpen && showContent ? 'opacity-100 scale-100' : 'opacity-0 scale-95'} border border-gray-200 dark:border-slate-700`}
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex items-center mb-6 gap-3">
          {/* Barra verde decorativa */}
          <div className="w-2 h-8 bg-green-500 dark:bg-green-600 rounded-r-md" />
          {title && <h2 className="text-xl font-bold text-green-700 dark:text-green-400">{title}</h2>}
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Fechar modal"
            className="text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <XMarkIcon className="w-6 h-6" />
          </Button>
        </div>
        <div className="max-h-[90vh] overflow-y-auto pr-2 custom-scrollbar">
         {children}
        </div>
      </div>
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1; /* Light mode track */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c5c5c5; /* Light mode thumb */
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a5a5a5; /* Light mode thumb hover */
        }
        
        .dark .custom-scrollbar::-webkit-scrollbar-track {
          background: #2d3748; /* Dark mode track - slate-800 */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4a5568; /* Dark mode thumb - slate-600 */
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #718096; /* Dark mode thumb hover - slate-500 */
        }
      `}</style>
    </div>
  );
};

export default Modal;