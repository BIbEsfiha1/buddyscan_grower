import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import netlifyIdentity, { User } from 'netlify-identity-widget';

// Inicialize sempre, fora do React, para garantir funcionamento em mobile
if (!(window as any).__netlifyIdentityInitialized) {
  netlifyIdentity.init({
    APIUrl: "https://buddyscan-app.windsurf.build/.netlify/identity"
  });
  (window as any).__netlifyIdentityInitialized = true;
}


interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(netlifyIdentity.currentUser());
  const isLoggedIn = !!user;

  useEffect(() => {
    // Não inicialize novamente aqui, já foi feito globalmente
    const handleLogin = (userOrError?: User | Error) => {
      if (userOrError && !(userOrError instanceof Error)) {
        setUser(userOrError as User);
        netlifyIdentity.close(); // Close the modal on login
      } else if (userOrError instanceof Error) {
        console.error('Login error:', userOrError);
        // Optionally, set an error state here to display to the user
      }
    };

    const handleLogout = () => {
      setUser(null);
    };

    netlifyIdentity.on('login', handleLogin); 
    netlifyIdentity.on('logout', handleLogout);

    // Check current user on mount
    setUser(netlifyIdentity.currentUser());

    return () => {
      netlifyIdentity.off('login', handleLogin); 
      netlifyIdentity.off('logout', handleLogout);
    };
  }, []);

  const login = () => {
    netlifyIdentity.open('login');
  };



  const logout = () => {
    netlifyIdentity.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
