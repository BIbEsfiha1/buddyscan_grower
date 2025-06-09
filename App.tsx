import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import PlantDetailPage from './pages/PlantDetailPage';
import PlantStatisticsPage from './pages/PlantStatisticsPage';
import GardenStatisticsPage from './pages/GardenStatisticsPage';
import AllPlantsPage from './pages/AllPlantsPage'; // Import the new page
import CultivosPage from './pages/CultivosPage';
import NovoCultivoPage from './pages/NovoCultivoPage';
import NovaPlantaPage from './pages/NovaPlantaPage';
import CultivoEtiquetasPage from './pages/CultivoEtiquetasPage';
import CultivoDetailPage from './pages/CultivoDetailPage';
import GrowsPage from './pages/GrowsPage';
import SettingsPage from './pages/SettingsPage';
import { PlantProvider } from './contexts/PlantContext';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <PlantProvider>
      <Layout>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plant/:plantId" 
            element={
              <ProtectedRoute>
                <PlantDetailPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/plant/:plantId/statistics" 
            element={
              <ProtectedRoute>
                <PlantStatisticsPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/cultivos"
            element={
              <ProtectedRoute>
                <CultivosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grows"
            element={
              <ProtectedRoute>
                <GrowsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cultivo/:cultivoId"
            element={
              <ProtectedRoute>
                <CultivoDetailPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="/novo-cultivo" 
            element={
              <ProtectedRoute>
                <NovoCultivoPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/nova-planta" 
            element={
              <ProtectedRoute>
                <NovaPlantaPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cultivo/:cultivoId/etiquetas" 
            element={
              <ProtectedRoute>
                <CultivoEtiquetasPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/estatisticas-jardim" 
            element={
              <ProtectedRoute>
                <GardenStatisticsPage />
              </ProtectedRoute>
            } 
          />
          <Route
            path="/plants"
            element={
              <ProtectedRoute>
                <AllPlantsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </PlantProvider>
  );
};

export default App;
