import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PlusIcon from './icons/PlusIcon';
import ProfileDropdown from './ProfileDropdown';

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
  let initials = 'U';
  if (user?.user_metadata?.full_name) {
    initials = user.user_metadata.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  } else if (user?.email) {
    initials = user.email.substring(0, 2).toUpperCase();
  }

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left: Menu + Title */}
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden text-gray-400 hover:text-white" 
            onClick={onOpenSidebar}
            aria-label="Abrir menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
        
        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Search */}
          <div className="hidden md:block relative">
            <input
              type="text"
              placeholder="Buscar plantas..."
              className="bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-48 focus:w-60 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          
          {/* QR Scanner Button */}
          <button
            onClick={onOpenScannerModal}
            className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
            aria-label="Escanear QR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z" />
            </svg>
          </button>
          
          {/* Add Plant Button */}
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors flex items-center space-x-1"
            aria-label="Adicionar planta"
          >
            <PlusIcon className="w-5 h-5" />
            <span className="hidden md:inline">Adicionar Planta</span>
          </button>
          
          {/* Notification */}
          <button className="relative text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
            </svg>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900"></span>
          </button>
          
          {/* Profile Trigger */}
          <div className="relative"> {/* Ensures ProfileDropdown is positioned relative to this */}
            <button
              onClick={() => setIsProfileDropdownOpen(prev => !prev)}
              className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-medium cursor-pointer focus:outline-none ring-2 ring-transparent focus:ring-emerald-500"
              id="user-menu-button"
              aria-expanded={isProfileDropdownOpen}
              aria-haspopup="true"
              type="button" // Good practice for buttons not submitting forms
            >
              {initials}
            </button>

            <ProfileDropdown
              isOpen={isProfileDropdownOpen}
              onClose={() => setIsProfileDropdownOpen(false)}
              onLogout={logout} // logout from useAuth
              user={user}     // user from useAuth
            />
          </div>
        </div>
      </div>
      
      {/* Mobile Search - Shown below header on small screens */}
      <div className="mt-3 md:hidden">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar plantas..."
            className="bg-gray-800 text-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" 
            className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
