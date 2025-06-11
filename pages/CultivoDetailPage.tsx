import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Cultivo, Plant, PlantOperationalStatus, PlantStage, Grow } from '../types';
import Button from '../components/Button';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Loader from '../components/Loader';
import Header from '../components/Header';
import Breadcrumbs from '../components/Breadcrumbs';
import CultivoPlantList from '../components/cultivo/CultivoPlantList';
import MassRegisterModal from '../components/grow/MassRegisterModal';
import MoveCultivoModal from '../components/cultivo/MoveCultivoModal';
import FinishCultivoModal from '../components/cultivo/FinishCultivoModal';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import LeafIcon from '../components/icons/LeafIcon';
import PlusIcon from '../components/icons/PlusIcon';
import { useTranslation } from 'react-i18next';
import { getPlantsByCultivo, updateCultivo } from '../services/cultivoService';
import { getGrows } from '../services/growService';
import { updatePlant } from '../services/plantService';
import logger from '../utils/logger';

const CultivoDetailPage: React.FC = () => {
  const { cultivoId } = useParams<{ cultivoId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  const [showMassModal, setShowMassModal] = useState(false);
  const [selectedGrow, setSelectedGrow] = useState<string>('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Fetch cultivo details + list of grows
  useEffect(() => {
    if (!cultivoId) return;
    setLoading(true);
    (async () => {
      try {
        const { getCultivos } = await import('../services/cultivoService');
        const all = await getCultivos();
        setCultivo(all.find(c => c.id === cultivoId) || null);
        setGrows(await getGrows());
      } catch {
        setError(t('cultivoDetailPage.error_loading_data'));
      } finally {
        setLoading(false);
      }
    })();
  }, [cultivoId, t]);

  // Fetch plants under this cultivo
  const fetchPlants = async () => {
    if (!cultivoId) return;
    setLoading(true);
    try {
      setPlants(await getPlantsByCultivo(cultivoId));
    } catch {
      setError(t('cultivoDetailPage.error_loading_plants'));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchPlants(); }, [cultivoId]);

  const handlePrintQRCodes = async () => {
    if (!cultivo || plants.length === 0) {
      showToast({ message: t('cultivoDetailPage.no_plants_qr'), type: 'info' });
      return;
    }
    setIsGeneratingPDF(true);
    showToast({ message: t('cultivoDetailPage.generating_pdf'), type: 'info' });
    try {
      const { generateQRCodesPDF } = await import('../utils/pdfUtils');
      await generateQRCodesPDF(plants, cultivo.name);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      showToast({ message: t('cultivoDetailPage.error_generating_pdf', { error: err.message || t('cultivoDetailPage.unknown_error') }), type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleMassSuccess = () => {
    showToast({ message: t('cultivoDetailPage.mass_register_success'), type: 'success' });
    setShowMassModal(false);
    fetchPlants(); // Refresh plants after mass registration
  };

  const handleMassError = (errorMessage?: string) => {
    showToast({ 
      message: errorMessage || t('cultivoDetailPage.mass_register_error'), 
      type: 'error' 
    });
    setShowMassModal(false);
  };

  const handleMoveCultivo = async () => {
    if (!cultivoId || !selectedGrow) return;
    try {
      await updateCultivo(cultivoId, { growId: selectedGrow });
      setCultivo(c => c ? { ...c, growId: selectedGrow } : c);
      setShowMoveModal(false);
      showToast({ message: t('cultivoDetailPage.move_success'), type: 'success' });
    } catch {
      showToast({ message: t('cultivoDetailPage.move_error'), type: 'error' });
    }
  };

  const handleFinishCultivo = async () => {
    if (!cultivoId) {
      setError(t('cultivoDetailPage.cultivo_id_not_found'));
      return;
    }
    setFinishing(true);
    logger.log(`[Finalizando cultivo ${cultivoId}]`);
    try {
      await updateCultivo(cultivoId, { finalizadoEm: new Date().toISOString() });
      const active = plants.filter(p => p.operationalStatus === PlantOperationalStatus.ACTIVE);
      await Promise.all(active.map(p =>
        updatePlant(p.id, {
          operationalStatus: PlantOperationalStatus.HARVESTED,
          currentStage: PlantStage.DRYING
        })
      ));
      setCultivo(c => c ? { ...c, finalizadoEm: new Date().toISOString() } : c);
      setPlants(prev => prev.map(p =>
        p.operationalStatus === PlantOperationalStatus.ACTIVE
          ? { ...p, operationalStatus: PlantOperationalStatus.HARVESTED, currentStage: PlantStage.DRYING }
          : p
      ));
      setShowFinishModal(false);
      showToast({ message: t('cultivoDetailPage.finish_success'), type: 'success' });
      setTimeout(() => navigate('/cultivos'), 1200);
    } catch (err: any) {
      console.error(err);
      setError(t('cultivoDetailPage.finish_error', { error: err.message || err }));
      showToast({ message: t('cultivoDetailPage.finish_error_toast'), type: 'error' });
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <Loader message={t('cultivoDetailPage.loading')} size="md" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <LeafIcon className="w-12 h-12 text-red-400 mb-3" />
        <span className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">{error}</span>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          {t('cultivoDetailPage.try_again')}
        </Button>
      </div>
    );
  }
  
  if (!cultivo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <LeafIcon className="w-12 h-12 text-gray-400 mb-3" />
        <span className="text-gray-500 dark:text-gray-400 font-semibold text-lg">
          {t('cultivoDetailPage.not_found')}
        </span>
        <Button variant="secondary" onClick={() => navigate('/cultivos')}>
          {t('cultivoDetailPage.back_to_list')}
        </Button>
      </div>
    );
  }

  const hasActive = plants.some(p => p.operationalStatus === PlantOperationalStatus.ACTIVE);

  return (
    <div className="max-w-lg mx-auto p-4 flex flex-col gap-4 bg-white dark:bg-slate-900">
      {toast && <Toast toast={toast} />}

      <Header
        title={cultivo.name}
        showBack
        onBack={() => navigate(-1)}
        onOpenAddModal={() => navigate(`/nova-planta?cultivoId=${cultivo.id}`)}
      />

      <Breadcrumbs
        items={[
          { label: t('sidebar.dashboard'), to: '/' },
          { label: t('sidebar.cultivos'), to: '/cultivos' },
          { label: cultivo.name },
        ]}
      />

      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold flex-1">
          {cultivo.name}
          {cultivo.finalizadoEm
            ? <CheckCircleIcon className="w-6 h-6 text-green-500 ml-2" />
            : <LeafIcon className="w-6 h-6 text-yellow-500 ml-2 animate-pulse" />
          }
        </h1>
        {!cultivo.finalizadoEm && (
          <>
            <Button
              variant="primary"
              size="icon"
              title={t('cultivoDetailPage.new_plant')}
              onClick={() => navigate(`/nova-planta?cultivoId=${cultivo.id}`)}
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              title={t('cultivoDetailPage.move_cultivo')}
              onClick={() => setShowMoveModal(true)}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        {t('cultivoDetailPage.start_date')}: {new Date(cultivo.startDate).toLocaleDateString()}
        {cultivo.finalizadoEm && (
          <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
            {t('cultivoDetailPage.finished_on')} {new Date(cultivo.finalizadoEm).toLocaleDateString()}
          </span>
        )}
      </div>

      <CultivoPlantList
        plants={plants}
        onPrint={handlePrintQRCodes}
        onRefresh={fetchPlants}
        onMassAction={() => setShowMassModal(true)}
        isGeneratingPDF={isGeneratingPDF}
      />

      <MassRegisterModal
        cultivoId={cultivo.id}
        isOpen={showMassModal}
        onClose={() => setShowMassModal(false)}
        plantStage={plants[0]?.currentStage || PlantStage.SEEDLING}
        onSuccess={handleMassSuccess}
        onError={handleMassError}
      />

      <Button
        variant="primary"
        size="lg"
        disabled={!hasActive || !!cultivo.finalizadoEm}
        onClick={() => setShowFinishModal(true)}
        className="w-full mt-2"
      >
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        {t('cultivoDetailPage.finish_cultivo')}
      </Button>

      <MoveCultivoModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        grows={grows}
        currentGrowId={cultivo.growId}
        selectedGrow={selectedGrow}
        setSelectedGrow={setSelectedGrow}
        onMove={handleMoveCultivo}
      />

      <FinishCultivoModal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        onConfirm={handleFinishCultivo}
        finishing={finishing}
      />
    </div>
  );
};

export default CultivoDetailPage;