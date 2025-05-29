import React, { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { APP_NAME } from '../constants';
import SunIcon from './icons/SunIcon';
import MoonIcon from './icons/MoonIcon';
import MenuIcon from './icons/MenuIcon';
import HamburgerMenu from './HamburgerMenu';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { theme, toggleTheme } = useTheme();
  const auth = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    auth.logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 transition-colors duration-300">

      <header className="bg-slate-900 text-slate-200 shadow-md sticky top-0 z-50 border-b border-slate-800 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-xl sm:text-2xl font-bold text-[#7AC943] hover:text-green-400 transition-colors">
            <img
              src="/logo.png"
              alt="Logo BuddyScan"
              className="h-24 w-24 sm:h-30 sm:w-30 object-contain"
              style={{ display: 'block' }}
              draggable="false"
            />
            <span className="hidden sm:inline">{APP_NAME}</span>
          </Link>

          {/* Navegação para telas maiores */}
          <nav className="hidden md:flex items-center space-x-4 sm:space-x-6">
            {auth.user && (
              <Link 
                to="/dashboard" 
                className="text-sm sm:text-base font-medium text-gray-600 hover:text-[#7AC943] dark:text-slate-300 dark:hover:text-[#7AC943] transition-colors"
              >
                Dashboard
              </Link>
            )}
            {/* Outros links para telas maiores podem ser adicionados aqui */}
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <MoonIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
            {auth.user ? (
              <button
                onClick={handleLogout}
                className="text-sm sm:text-base font-medium text-gray-600 hover:text-red-500 dark:text-slate-300 dark:hover:text-red-400 transition-colors"
              >
                Logout
              </button>
            ) : (
              <button
                onClick={() => auth.login()} // Simplificado para abrir o widget de login
                className="text-sm sm:text-base font-medium bg-[#7AC943] text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-green-500 transition-colors shadow-sm"
                style={{ pointerEvents: 'auto', zIndex: 1000 }} // zIndex pode não ser mais necessário aqui
              >
                Login
              </button>
            )}
          </nav>

          {/* Botão do Menu Hamburger para telas menores */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={toggleTheme} 
              className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-slate-400 transition-colors"
              aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            >
              {theme === 'dark' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>
            <button 
              onClick={toggleMenu}
              className="p-2 rounded-md text-gray-500 hover:bg-gray-100 dark:text-slate-400 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7AC943] transition-colors"
              aria-label="Abrir menu"
            >
              <MenuIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Componente do Menu Hamburger */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={toggleMenu} />

      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-slate-950">
        {children}
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-6 text-sm border-t border-slate-700 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;