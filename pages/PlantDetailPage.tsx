import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Plant,
  PlantStage,
  DiaryEntry,
  PlantHealthStatus,
  NewDiaryEntryData,
} from '../types';
import { QRCodeSVG } from 'qrcode.react';
import DiaryEntryItem from '../components/DiaryEntryItem';
import DiaryEntryForm from '../components/DiaryEntryForm';
import DailyChecklist from '../components/DailyChecklist';
import Modal from '../components/Modal';
import QrCodeDisplay from '../components/QrCodeDisplay';
import { usePlantContext } from '../contexts/PlantContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import LeafIcon from '../components/icons/LeafIcon';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';

const PlantDetailPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const {
    getPlantById,
    fetchPlantById,
    updatePlantDetails,
    addNewDiaryEntry,
    getDiaryEntries,
  } = usePlantContext();

  const STATIC_CHECKLIST_FIELDS = [
    'dailyWatered',
    'dailyNutrients',
    'dailyLightAdjustment',
    'dailyPestCheck',
    'dailyRotation',
  ] as const;

  const [plant, setPlant] = useState<Plant | null | undefined>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showRemoveByDiseaseModal, setShowRemoveByDiseaseModal] = useState(false);
  const [removeByDiseaseNote, setRemoveByDiseaseNote] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [cultivos, setCultivos] = useState<{ id: string; name: string }[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<string | undefined>(undefined);
  const [movingCultivo, setMovingCultivo] = useState(false);
  const [toast, showToast] = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDiaryEntryModal, setShowDiaryEntryModal] = useState(false);
  const [isSavingDiaryEntry, setIsSavingDiaryEntry] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const loadPlantData = useCallback(async () => {
    if (!plantId) return;
    let current = getPlantById(plantId);
    if (!current) {
      current = await fetchPlantById(plantId);
    }
    setPlant(current);
    if (current) {
      const entries = await getDiaryEntries(plantId);
      setDiaryEntries(
        entries.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )
      );
    }
  }, [plantId, getPlantById, fetchPlantById, getDiaryEntries]);

  useEffect(() => {
    loadPlantData();
  }, [loadPlantData]);

  useEffect(() => {
    if (plantId && plant && window.localStorage) {
      try {
        localStorage.setItem('lastPlantId', plantId);
        if (plant.name) localStorage.setItem('lastPlantName', plant.name);
      } catch {}
    }
  }, [plantId, plant]);

  useEffect(() => {
    import('../services/cultivoService')
      .then(({ getCultivos }) => getCultivos())
      .then(data => setCultivos(data))
      .catch(() => setCultivos([]));
  }, []);

  const handleRemoveByDisease = async () => {
    if (!plantId || !plant) return;
    await addNewDiaryEntry(plantId, {
      notes: `Planta removida do cultivo.${
        removeByDiseaseNote ? '\nMotivo: ' + removeByDiseaseNote : ''
      }`.trim(),
      stage: plant.currentStage ?? PlantStage.SEEDLING,
      photos: [],
    });
    try {
      const res = await fetch(
        `/.netlify/functions/deletePlant?id=${plantId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (res.status === 204) {
        setShowRemoveByDiseaseModal(false);
        setRemoveByDiseaseNote('');
        try {
          if (window.localStorage) {
            const last = localStorage.getItem('lastPlantId');
            if (last === plantId) {
              localStorage.removeItem('lastPlantId');
              localStorage.removeItem('lastPlantName');
            }
          }
        } catch {}
        window.location.href = '/';
      } else {
        const err = await res.json();
        showToast({
          message: 'Erro ao excluir planta: ' + (err.error || res.status),
          type: 'error',
        });
      }
    } catch (e: any) {
      showToast({
        message: 'Erro inesperado ao excluir planta: ' + (e.message || e),
        type: 'error',
      });
    }
  };

  useEffect(() => {
    if (!plant || !plantId) return;
    const today = new Date().toISOString().split('T')[0];
    let stored: Record<string, boolean> = {};
    try {
      const s = localStorage.getItem(`checklist_${plantId}_${today}`);
      if (s) stored = JSON.parse(s);
    } catch {}
    if (plant.lastDailyCheckDate === today) {
      STATIC_CHECKLIST_FIELDS.forEach(f => {
        stored[f] = !!(plant as any)[f];
      });
    }
    setChecklistState(stored);
  }, [plant, plantId]);

  const handleTaskToggle = async (taskId: string, checked: boolean) => {
    if (!plantId) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...checklistState, [taskId]: checked };
    setChecklistState(updated);
    try {
      localStorage.setItem(
        `checklist_${plantId}_${today}`,
        JSON.stringify(updated)
      );
    } catch {}
    if (STATIC_CHECKLIST_FIELDS.includes(taskId as any)) {
      const payload: Partial<Plant> = { lastDailyCheckDate: today };
      STATIC_CHECKLIST_FIELDS.forEach(f => {
        // @ts-ignore
        payload[f] = updated[f] || false;
      });
      try {
        await updatePlantDetails(plantId, payload);
      } catch (err: any) {
        showToast({
          message: 'Erro ao atualizar checklist: ' + (err.message || err),
          type: 'error',
        });
      }
    }
  };

  const handleDownloadQrCode = () => {
    if (!plant) return;
    /* ... same canvas + SVG download logic ... */
  };

  const handleDiaryEntrySubmit = async (data: NewDiaryEntryData) => {
    if (!plantId) return;
    setIsSavingDiaryEntry(true);
    try {
      const newEntry = await addNewDiaryEntry(plantId, data);
      if (newEntry) {
        const entries = await getDiaryEntries(plantId);
        setDiaryEntries(
          entries.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
        );
        setShowDiaryEntryModal(false);
        showToast({ message: 'Entrada do diário salva!', type: 'success' });
      } else {
        showToast({
          message: 'Erro ao salvar entrada no diário.',
          type: 'error',
        });
      }
    } catch (err: any) {
      showToast({
        message: `Erro: ${err.message || 'Falha ao salvar entrada.'}`,
        type: 'error',
      });
    } finally {
      setIsSavingDiaryEntry(false);
    }
  };

  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-green-200 dark:bg-green-700 rounded-full mb-4" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status?: string) => {
    if (!status) return 'gray';
    switch (status) {
      case PlantHealthStatus.HEALTHY:
        return 'green';
      case PlantHealthStatus.OBSERVATION:
      case PlantHealthStatus.PEST_ALERT:
      case PlantHealthStatus.NUTRIENT_DEFICIENCY:
      case PlantHealthStatus.RECOVERING:
        return 'yellow';
      case PlantHealthStatus.DISEASE_SUSPECTED:
        return 'red';
      default:
        return 'gray';
    }
  };

  const formatDate = (d?: string) =>
    d
      ? new Date(d).toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : 'N/A';

  const healthColor = getHealthStatusColor(plant.healthStatus);

  return (
    <>
      <div className="flex min-h-full bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-full">
          <Header
            title="Detalhes da Planta"
            onOpenSidebar={() => setSidebarOpen(true)}
            showBack
            onBack={() => navigate(-1)}
          />
          {toast && <Toast message={toast.message} type={toast.type} />}
          <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 pt-6">
            {/* ... rest of the render as before ... */}
          </main>
          {/* Modals for diary entry, remove-by-disease, QR code */}
          <Modal
            isOpen={showDiaryEntryModal}
            onClose={() => setShowDiaryEntryModal(false)}
            title="Nova Entrada no Diário"
            maxWidth="md"
          >
            {plant && (
              <DiaryEntryForm
                plantCurrentStage={plant.currentStage}
                onSubmit={handleDiaryEntrySubmit}
                isLoading={isSavingDiaryEntry}
              />
            )}
          </Modal>

          <Modal
            isOpen={showRemoveByDiseaseModal}
            onClose={() => setShowRemoveByDiseaseModal(false)}
            title="Remover Planta por Doença"
          >
            {/* ... remove-by-disease UI ... */}
          </Modal>

          {plant && (
            <Modal
              isOpen={showQrModal}
              onClose={() => setShowQrModal(false)}
              title="QR Code da Planta"
            >
              {/* ... QR code display + download button ... */}
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default PlantDetailPage;
