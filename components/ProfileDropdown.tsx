import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User } from 'netlify-identity-widget'; // Assuming User type is available from this import

interface ProfileDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  user: User | null; // user prop can be used for displaying user info or for dynamic links if needed
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ isOpen, onClose, onLogout, user }) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, i18n } = useTranslation();

  // Effect to handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if the dropdown is open and the click is outside the dropdown
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // Add event listener when the component mounts (and isOpen is true)
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up the event listener when the component unmounts
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]); // Dependencies: re-run effect if isOpen or onClose changes

  // If the dropdown is not open, render nothing
  if (!isOpen) {
    return null;
  }

  // Render the dropdown
  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-700"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="user-menu-button" // This assumes the button triggering dropdown has id="user-menu-button"
    >
      <Link
        to="/profile"
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white w-full text-left"
        role="menuitem"
        onClick={onClose} // Also close dropdown when a link is clicked
      >
        {t('profile.my_profile')}
      </Link>
      <button
        onClick={() => {
          onLogout(); // Perform logout action
          onClose();  // Close the dropdown
        }}
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white w-full text-left"
        role="menuitem"
      >
        {t('profile.logout')}
      </button>
      <div className="border-t border-gray-700 my-1"></div>
      <div className="px-4 py-1 text-xs text-gray-400">{t('profile.language')}</div>
      <button
        onClick={() => i18n.changeLanguage('en')}
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white w-full text-left"
      >
        {t('language.english')}
      </button>
      <button
        onClick={() => i18n.changeLanguage('pt')}
        className="block px-4 py-2 text-sm text-gray-200 hover:bg-gray-700 hover:text-white w-full text-left"
      >
        {t('language.portuguese')}
      </button>
    </div>
  );
};

export default ProfileDropdown;
