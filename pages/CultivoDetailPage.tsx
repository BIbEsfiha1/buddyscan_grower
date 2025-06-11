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
import MassActionModal from '../components/cultivo/MassActionModal';
import MoveCultivoModal from '../components/cultivo/MoveCultivoModal';
import FinishCultivoModal from '../components/cultivo/FinishCultivoModal';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import LeafIcon from '../components/icons/LeafIcon';
import PlusIcon from '../components/icons/PlusIcon';
import { getPlantsByCultivo, updateCultivo } from '../services/cultivoService';
import { getGrows } from '../services/growService';
import { updatePlant } from '../services/plantService';
import logger from '../utils/logger';

const CultivoDetailPage: React.FC = () => {
  const { cultivoId } = useParams<{ cultivoId: string }>();
  const navigate = useNavigate();
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [grows, setGrows] = useState<Grow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, showToast] = useToast();

  const [showMassModal, setShowMassModal] = useState(false);
  const [massNotes, setMassNotes] = useState('');
  const [massWateringVolume, setMassWateringVolume] = useState('');
  const [massWateringType, setMassWateringType] = useState('');
  const [massFertilizationType, setMassFertilizationType] = useState('');
  const [massFertilizationConcentration, setMassFertilizationConcentration] = useState('');
  const [massPhotoperiod, setMassPhotoperiod] = useState('');
  const [massSprayProduct, setMassSprayProduct] = useState('');
  const [massSprayAmount, setMassSprayAmount] = useState('');

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
        setError('Erro ao carregar dados do cultivo.');
      } finally {
        setLoading(false);
      }
    })();
  }, [cultivoId]);

  // Fetch plants under this cultivo
  const fetchPlants = async () => {
    if (!cultivoId) return;
    setLoading(true);
    try {
      setPlants(await getPlantsByCultivo(cultivoId));
    } catch {
      setError('Erro ao carregar plantas do cultivo.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { fetchPlants(); }, [cultivoId]);

  const handlePrintQRCodes = async () => {
    if (!cultivo || plants.length === 0) {
      showToast({ message: 'Nenhuma planta neste cultivo para imprimir QR codes.', type: 'info' });
      return;
    }
    setIsGeneratingPDF(true);
    showToast({ message: 'Gerando PDF com QR codes...', type: 'info' });
    try {
      const { generateQRCodesPDF } = await import('../utils/pdfUtils');
      await generateQRCodesPDF(plants, cultivo.name);
    } catch (err: any) {
      console.error('Error generating PDF:', err);
      showToast({ message: `Erro ao gerar PDF: ${err.message || 'falha desconhecida'}`, type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleMassRegister = async () => {
    if (!cultivoId) return;
    try {
      const { addMassDiaryEntry } = await import('../services/plantService');
      await addMassDiaryEntry(cultivoId, {
        notes: massNotes,
        stage: plants[0]?.currentStage || PlantStage.SEEDLING,
        wateringVolume: massWateringVolume ? parseFloat(massWateringVolume) : undefined,
        wateringType: massWateringType || undefined,
        fertilizationType: massFertilizationType || undefined,
        fertilizationConcentration: massFertilizationConcentration
          ? parseFloat(massFertilizationConcentration)
          : undefined,
        photoperiod: massPhotoperiod || undefined,
        sprayProduct: massSprayProduct || undefined,
        sprayAmount: massSprayAmount ? parseFloat(massSprayAmount) : undefined,
      });
      showToast({ message: 'Registro aplicado a todas as plantas', type: 'success' });
      setShowMassModal(false);
      setMassNotes('');
      setMassWateringVolume('');
      setMassWateringType('');
      setMassFertilizationType('');
      setMassFertilizationConcentration('');
      setMassPhotoperiod('');
      setMassSprayProduct('');
      setMassSprayAmount('');
    } catch {
      showToast({ message: 'Erro ao registrar em massa', type: 'error' });
    }
  };

  const handleMoveCultivo = async () => {
    if (!cultivoId || !selectedGrow) return;
    try {
      await updateCultivo(cultivoId, { growId: selectedGrow });
      setCultivo(c => c ? { ...c, growId: selectedGrow } : c);
      setShowMoveModal(false);
      showToast({ message: 'Plantio movido com sucesso!', type: 'success' });
    } catch {
      showToast({ message: 'Erro ao mover plantio.', type: 'error' });
    }
  };

  const handleFinishCultivo = async () => {
    if (!cultivoId) {
      setError('ID do cultivo não encontrado');
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
      showToast({ message: 'Cultivo finalizado e plantas colhidas!', type: 'success' });
      setTimeout(() => navigate('/cultivos'), 1200);
    } catch (err: any) {
      console.error(err);
      setError('Erro ao finalizar cultivo: ' + (err.message || err));
      showToast({ message: 'Erro ao finalizar cultivo.', type: 'error' });
    } finally {
      setFinishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-full p-6">
        <Loader message="Carregando cultivo..." size="md" />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <LeafIcon className="w-12 h-12 text-red-400 mb-3" />
        <span className="text-red-600 font-semibold mb-2">{error}</span>
        <Button variant="secondary" onClick={() => window.location.reload()}>
          Tentar novamente
        </Button>
      </div>
    );
  }
  if (!cultivo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <LeafIcon className="w-12 h-12 text-gray-400 mb-3" />
        <span className="text-gray-500 font-semibold">Cultivo não encontrado.</span>
        <Button variant="secondary" onClick={() => navigate('/cultivos')}>
          Voltar para cultivos
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
          { label: 'Dashboard', to: '/' },
          { label: 'Cultivos', to: '/cultivos' },
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
              title="Nova Planta"
              onClick={() => navigate(`/nova-planta?cultivoId=${cultivo.id}`)}
            >
              <PlusIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              title="Mover Cultivo"
              onClick={() => setShowMoveModal(true)}
            >
              <ArrowLeftIcon className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400">
        Início: {new Date(cultivo.startDate).toLocaleDateString()}
        {cultivo.finalizadoEm && (
          <span className="ml-2 px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
            Finalizado em {new Date(cultivo.finalizadoEm).toLocaleDateString()}
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

      <MassActionModal
        isOpen={showMassModal}
        onClose={() => setShowMassModal(false)}
        onSave={handleMassRegister}
        massNotes={massNotes}
        setMassNotes={setMassNotes}
        massWateringVolume={massWateringVolume}
        setMassWateringVolume={setMassWateringVolume}
        massWateringType={massWateringType}
        setMassWateringType={setMassWateringType}
        massFertilizationType={massFertilizationType}
        setMassFertilizationType={setMassFertilizationType}
        massFertilizationConcentration={massFertilizationConcentration}
        setMassFertilizationConcentration={setMassFertilizationConcentration}
        massPhotoperiod={massPhotoperiod}
        setMassPhotoperiod={setMassPhotoperiod}
        massSprayProduct={massSprayProduct}
        setMassSprayProduct={setMassSprayProduct}
        massSprayAmount={massSprayAmount}
        setMassSprayAmount={setMassSprayAmount}
      />

      <Button
        variant="primary"
        size="lg"
        disabled={!hasActive || !!cultivo.finalizadoEm}
        onClick={() => setShowFinishModal(true)}
        className="w-full mt-2"
      >
        <CheckCircleIcon className="w-5 h-5 mr-2" />
        Finalizar Cultivo
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
