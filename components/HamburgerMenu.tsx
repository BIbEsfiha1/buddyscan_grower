import React from 'react';
import { Link } from 'react-router-dom';
import XMarkIcon from './icons/XMarkIcon';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';
import LeafIcon from './icons/LeafIcon'; // Para o logo
import { useTranslation } from 'react-i18next';

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ isOpen, onClose }) => {
  const auth = useAuth();
  const { t } = useTranslation();
  const [lastPlantId, setLastPlantId] = React.useState<string | null>(null);
  const [lastPlantName, setLastPlantName] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        setLastPlantId(localStorage.getItem('lastPlantId'));
        setLastPlantName(localStorage.getItem('lastPlantName'));
      } catch {
        setLastPlantId(null);
        setLastPlantName(null);
      }
    }
  }, []);

  const handleLogout = () => {
    auth.logout();
    onClose(); // Fecha o menu após o logout
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[100] transition-opacity duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={onClose} // Fecha ao clicar fora
    >
      {/* Overlay escuro */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm"></div>

      {/* Conteúdo do Menu */}
      <div 
        className={`fixed top-0 right-0 h-full w-full max-w-xs bg-white dark:bg-slate-800 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro do menu
      >
        <div className="flex flex-col h-full">
          {/* Cabeçalho do Menu */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-[#7AC943] hover:text-green-500 transition-colors" onClick={onClose}>
              <LeafIcon className="w-7 h-7" />
              <span>{APP_NAME}</span>
            </Link>
            <button 
              onClick={onClose} 
              className="p-2 text-gray-500 rounded-md hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7AC943] transition-colors"
              aria-label="Fechar menu"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Links de Navegação */}
          <nav className="flex-grow p-5 space-y-3">
            <Link 
              to="/dashboard" 
              className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-gray-100 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              Dashboard
            </Link>
            <Link
              to="/cultivos"
              className="block px-4 py-3 text-base font-medium text-green-700 rounded-lg hover:bg-green-100 dark:text-green-300 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              Cultivos
            </Link>
            <Link
              to="/grows"
              className="block px-4 py-3 text-base font-medium text-green-700 rounded-lg hover:bg-green-100 dark:text-green-300 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              Grows
            </Link>
            {/* Estatísticas do Jardim */}
            <Link
              to="/estatisticas-jardim"
              className="block px-4 py-3 text-base font-medium text-green-700 rounded-lg hover:bg-green-100 dark:text-green-300 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              Estatísticas do Jardim
            </Link>
            {/* Estatísticas da Planta - linkado à última planta visitada, se disponível */}
            <Link
              to={lastPlantId ? `/plant/${lastPlantId}/statistics` : '/plants'}
              className="block px-4 py-3 text-base font-medium text-green-700 rounded-lg hover:bg-green-100 dark:text-green-300 dark:hover:bg-slate-700 transition-colors"
              onClick={onClose}
            >
              {lastPlantName ? `Estatísticas de ${lastPlantName}` : 'Estatísticas da Planta'}
            </Link>
            {/* Adicionar outros links conforme necessário */}
            {/* Exemplo: Adicionar Planta, Escanear QR Code - estes já estão no DashboardPage, mas podem ser adicionados aqui também se fizer sentido */}
          </nav>

          {/* Rodapé do Menu (Logout) */}
          <div className="p-5 mt-auto border-t border-gray-200 dark:border-slate-700">
            {auth.user ? (
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-base font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors"
              >
                Logout
              </button>
            ) : (
              <Link 
                to="/"
                onClick={() => { auth.login(); onClose(); }}
                className="block w-full px-4 py-3 text-base font-medium text-center text-white bg-[#7AC943] rounded-lg hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7AC943] dark:focus:ring-offset-slate-800 transition-colors"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HamburgerMenu;
