import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import type { User } from 'netlify-identity-widget';
import { loadNetlifyIdentity } from '../utils/loadNetlifyIdentity';

let netlifyIdentity: awaited<ReturnType<typeof loadNetlifyIdentity>>;
loadNetlifyIdentity().then((mod) => {
  netlifyIdentity = mod;
});

// Inicialize sempre, fora do React, para garantir funcionamento em mobile
// Inicialize o widget de forma assíncrona
loadNetlifyIdentity();


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
  const [user, setUser] = useState<User | null>(null);
  const isLoggedIn = !!user;

  useEffect(() => {
    let cleanup: (() => void) | undefined;
    loadNetlifyIdentity().then((ni) => {
      const handleLogin = (userOrError?: User | Error) => {
        if (userOrError && !(userOrError instanceof Error)) {
          setUser(userOrError as User);
          ni.close();
        } else if (userOrError instanceof Error) {
          console.error('Login error:', userOrError);
        }
      };

      const handleLogout = () => {
        setUser(null);
      };

      ni.on('login', handleLogin);
      ni.on('logout', handleLogout);

      setUser(ni.currentUser());

      cleanup = () => {
        ni.off('login', handleLogin);
        ni.off('logout', handleLogout);
      };
    });

    return () => {
      cleanup?.();
    };
  }, []);

  const login = () => {
    loadNetlifyIdentity().then((ni) => ni.open('login'));
  };



  const logout = () => {
    loadNetlifyIdentity().then((ni) => ni.logout());
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
