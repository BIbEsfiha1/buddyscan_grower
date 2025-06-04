import React, { useState, ReactNode } from 'react';
import HamburgerMenu from './HamburgerMenu';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { APP_NAME } from '../constants';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  // Mantém o hook para não quebrar contexto de tema, mas não desestrutura nada
  useTheme();
  useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 transition-colors duration-300">

      {/* Componente do Menu Hamburger */}
      <HamburgerMenu isOpen={isMenuOpen} onClose={toggleMenu} />

      <main className="flex-grow px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-slate-950">
        <div className="max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-slate-800 text-slate-400 text-center py-6 text-sm border-t border-slate-700 transition-colors duration-300">
        <p>&copy; {new Date().getFullYear()} {APP_NAME}. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Layout;