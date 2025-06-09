import React, { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, user } = useAuth();

  // Aguarda a inicialização do user para evitar piscar conteúdo protegido
  // O widget do Netlify Identity pode levar um momento para determinar o usuário atual
  if (user === undefined) { // Checa se o estado inicial do usuário ainda não foi definido
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader size="md" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col justify-center items-center h-screen px-4 text-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Acesso Restrito</h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Você precisa estar logado para acessar esta página.
        </p>
        <p className="text-md text-gray-500 dark:text-gray-400">
          Por favor, clique no botão "Login" no canto superior direito para continuar.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
