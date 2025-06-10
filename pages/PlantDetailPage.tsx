import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plant, PlantStage, DiaryEntry, PlantHealthStatus, NewDiaryEntryData } from '../types';
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

const PlantDetailPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDiaryEntryModal, setShowDiaryEntryModal] = useState(false);
  const [isSavingDiaryEntry, setIsSavingDiaryEntry] = useState(false);
  const [checklistState, setChecklistState] = useState<Record<string, boolean>>({});

  const loadPlantData = useCallback(async () => {
    if (!plantId) return;
    let currentPlant = getPlantById(plantId);
    if (!currentPlant) {
      currentPlant = await fetchPlantById(plantId);
    }
    setPlant(currentPlant);
    if (currentPlant) {
      const entries = await getDiaryEntries(plantId);
      setDiaryEntries(entries.sort((a: DiaryEntry, b: DiaryEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  }, [plantId, getPlantById, fetchPlantById, getDiaryEntries]);

  useEffect(() => {
    loadPlantData();
  }, [loadPlantData]);

  useEffect(() => {
    if (plantId && typeof window !== 'undefined') {
      try {
        localStorage.setItem('lastPlantId', plantId);
        if (plant && plant.name) {
          localStorage.setItem('lastPlantName', plant.name);
        }
      } catch {
        // ignore write errors
      }
    }
  }, [plantId, plant]);


  useEffect(() => {
    import('../services/cultivoService').then(({ getCultivos }) => {
      getCultivos().then(data => setCultivos(data)).catch(() => setCultivos([]));
    });
  }, []);

  const handleRemoveByDisease = async () => {
    if (!plantId || !plant) return;
    await addNewDiaryEntry(plantId, {
      notes: `Planta removida do cultivo. ${removeByDiseaseNote ? '\nMotivo: ' + removeByDiseaseNote : ''}`.trim(),
      stage: plant.currentStage ?? PlantStage.SEEDLING,
      photos: [],
    });
    try {
      const res = await fetch(`/.netlify/functions/deletePlant?id=${plantId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.status === 204) {
        setShowRemoveByDiseaseModal(false);
        setRemoveByDiseaseNote('');
        try {
          if (typeof window !== 'undefined') {
            const lastId = localStorage.getItem('lastPlantId');
            if (lastId === plantId) {
              localStorage.removeItem('lastPlantId');
              localStorage.removeItem('lastPlantName');
            }
          }
        } catch {}
        window.location.href = '/';
        return;
      } else {
        const err = await res.json();
        alert('Erro ao excluir planta: ' + (err.error || res.status));
      }
    } catch (e: any) {
      alert('Erro inesperado ao excluir planta: ' + (e.message || e));
    }
  };

  useEffect(() => {
    if (!plant || !plantId) return;
    const today = new Date().toISOString().split('T')[0];
    let stored: Record<string, boolean> = {};
    try {
      const str = localStorage.getItem(`checklist_${plantId}_${today}`);
      if (str) stored = JSON.parse(str);
    } catch {}
    if (plant.lastDailyCheckDate === today) {
      STATIC_CHECKLIST_FIELDS.forEach(field => {
        stored[field] = !!(plant as any)[field];
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
      localStorage.setItem(`checklist_${plantId}_${today}`, JSON.stringify(updated));
    } catch {}

    if (STATIC_CHECKLIST_FIELDS.includes(taskId as any)) {
      const payload: Partial<Plant> = { lastDailyCheckDate: today };
      STATIC_CHECKLIST_FIELDS.forEach(field => {
        payload[field] = updated[field] || false;
      });
      try {
        await updatePlantDetails(plantId, payload);
      } catch (err: any) {
        setToast({ message: 'Erro ao atualizar checklist: ' + (err.message || err), type: 'error' });
      }
    }
  };

  const handleDownloadQrCode = () => {
    if (!plant) return;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const qrCodeSize = 256;
    const padding = 20;
    const textLineHeight = 20;
    const textMarginTop = 10;
    const titleFontSize = 20;
    const detailFontSize = 14;

    const lines = [
      `Nome: ${plant.name}`,
      `Strain: ${plant.strain || 'N/A'}`,
      `ID: ${plant.id}`,
      `Nascimento: ${plant.birthDate ? new Date(plant.birthDate).toLocaleDateString() : 'N/A'}`,
      `Colheita Estimada: ${plant.estimatedHarvestDate ? new Date(plant.estimatedHarvestDate).toLocaleDateString() : 'N/A'}`,
    ];

    canvas.width = qrCodeSize + 2 * padding;
    canvas.height = qrCodeSize + 2 * padding + (lines.length + 1) * textLineHeight + textMarginTop * 2;

    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgString = new XMLSerializer().serializeToString(document.querySelector('#qr-code-svg-for-download') as Node);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, padding, padding, qrCodeSize, qrCodeSize);
      ctx.fillStyle = 'black';
      let currentY = qrCodeSize + padding + textMarginTop;
      ctx.font = `bold ${titleFontSize}px Inter`;
      ctx.textAlign = 'center';
      ctx.fillText(plant.name, canvas.width / 2, currentY);
      currentY += textLineHeight * 1.5;
      ctx.font = `${detailFontSize}px Inter`;
      ctx.textAlign = 'center';
      lines.forEach(line => {
        if (line.startsWith('Nome:')) return;
        ctx.fillText(line, canvas.width / 2, currentY);
        currentY += textLineHeight;
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${plant.name.replace(/\s+/g, '_')}_QRCode.png`;
      link.href = dataUrl;
      link.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(svgString);
  };

  const handleDiaryEntrySubmit = async (data: NewDiaryEntryData) => {
    if (!plantId) return;
    setIsSavingDiaryEntry(true);
    try {
      const newEntry = await addNewDiaryEntry(plantId, data);
      if (newEntry) {
        const entries = await getDiaryEntries(plantId);
        setDiaryEntries(entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        setShowDiaryEntryModal(false);
        setToast({ message: 'Entrada do diário salva!', type: 'success' });
      } else {
        setToast({ message: 'Erro ao salvar entrada no diário.', type: 'error' });
      }
    } catch (err: any) {
      setToast({ message: `Erro: ${err.message || 'Falha ao salvar entrada.'}`, type: 'error' });
    } finally {
      setIsSavingDiaryEntry(false);
    }
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);


  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-full bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-green-200 dark:bg-green-700 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3"></div>
          <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const getHealthStatusColor = (status: string | undefined) => {
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

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const healthColor = getHealthStatusColor(plant.healthStatus);

  return (
    <>
      <div className="flex min-h-full bg-gray-50 dark:bg-gray-900">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-h-full">
          <Header
            title="Detalhes da Planta"
            onOpenSidebar={() => setSidebarOpen(true)}
            onOpenAddModal={() => {}}
            onOpenScannerModal={() => {}}
          />
          {toast && <Toast message={toast.message} type={toast.type} />}
          <main className="flex-1 max-w-7xl mx-auto w-full px-2 sm:px-6 lg:px-8 pt-6">
            {plant && (
              <div style={{ display: 'none' }}>
                <QRCodeSVG id="qr-code-svg-for-download" value={plant.qrCodeValue || plant.id} size={256} includeMargin={true} />
              </div>
            )}
            <div className="grid gap-6 lg:grid-cols-3">
              <section className="lg:col-span-1 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex flex-col items-center text-center gap-4">
                    {plant.imageUrl ? (
                      <img src={plant.imageUrl} alt={plant.name} className="w-full max-w-xs rounded-lg object-cover" />
                    ) : (
                      <div className="w-full max-w-xs h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <LeafIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{plant.name}</h1>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full font-medium bg-${healthColor}-100 text-${healthColor}-800 dark:bg-${healthColor}-900 dark:text-${healthColor}-200`}>{plant.healthStatus || 'Status desconhecido'}</span>
                      <span className="text-gray-500 dark:text-gray-400">ID: {plant.id}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm w-full">
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Strain</span>
                        <span className="font-medium text-gray-900 dark:text-white">{plant.strain || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Estágio</span>
                        <span className="font-medium text-gray-900 dark:text-white">{plant.currentStage || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Nascimento</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(plant.birthDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Colheita Estimada</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatDate(plant.estimatedHarvestDate)}</span>
                      </div>
                    </div>
                    {plant.notes && (
                      <div className="w-full bg-gray-100 dark:bg-gray-700 p-3 rounded-md mt-4 max-h-40 overflow-y-auto text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                        {plant.notes}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow flex flex-col gap-4">
                  {plant && (
                    <button
                      onClick={() => setShowQrModal(true)}
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    >
                      Ver QR Code
                    </button>
                  )}
                  <button
                    onClick={() => setShowRemoveByDiseaseModal(true)}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                  >
                    Remover por Doença
                  </button>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">Cultivo</h2>
                    <div className="flex items-center gap-2">
                      <select
                        className="flex-1 border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                        value={selectedCultivo ?? plant.cultivoId ?? ''}
                        onChange={e => setSelectedCultivo(e.target.value)}
                        disabled={movingCultivo}
                      >
                        <option value="">Sem cultivo</option>
                        {cultivos.map(cultivo => (
                          <option key={cultivo.id} value={cultivo.id}>{cultivo.name}</option>
                        ))}
                      </select>
                      <button
                        className="bg-green-500 text-white rounded px-3 py-1 disabled:opacity-60 hover:bg-green-600 transition-colors"
                        disabled={movingCultivo || (selectedCultivo === plant.cultivoId || !selectedCultivo)}
                        onClick={async () => {
                          if (!plantId || !selectedCultivo || selectedCultivo === plant.cultivoId) return;
                          setMovingCultivo(true);
                          try {
                            await updatePlantDetails(plantId, { cultivoId: selectedCultivo });
                            await loadPlantData();
                            setToast({ message: 'Planta movida!', type: 'success' });
                            setSelectedCultivo(undefined);
                          } catch (err: any) {
                            setToast({ message: 'Erro ao mover planta: ' + (err.message || err), type: 'error' });
                          }
                          setMovingCultivo(false);
                        }}
                      >
                        Mover
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              <section className="lg:col-span-2 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Checklist Diário</h2>
                  <DailyChecklist
                    stage={plant.currentStage}
                    checklistState={checklistState}
                    onTaskToggle={handleTaskToggle}
                  />
                </div>
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Diário da Planta</h2>
                    <button
                      onClick={() => setShowDiaryEntryModal(true)}
                      className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Nova Entrada
                    </button>
                  </div>
                  {diaryEntries.length > 0 ? (
                    <div className="space-y-4">
                      {diaryEntries.map(entry => (
                        <DiaryEntryItem key={entry.id} entry={entry} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma entrada no diário ainda.</p>
                  )}
                </div>
              </section>
            </div>
          </main>
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
            <div className="p-1">
              <p className="mb-3 text-gray-700 dark:text-gray-300">Tem certeza que deseja remover esta planta por doença?</p>
              <textarea
                placeholder="Motivo ou observação (opcional)"
                value={removeByDiseaseNote}
                onChange={e => setRemoveByDiseaseNote(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[60px] mb-4 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              />
              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setShowRemoveByDiseaseModal(false)}
                  className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRemoveByDisease}
                  className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
                >
                  Confirmar Remoção
                </button>
              </div>
            </div>
          </Modal>
          {plant && (
            <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="QR Code da Planta">
              <div className="flex flex-col items-center justify-center p-4 gap-4">
                <QrCodeDisplay plant={plant} />
                <button
                  onClick={handleDownloadQrCode}
                  className="w-full max-w-[180px] bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Baixar QR Code
                </button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default PlantDetailPage;
