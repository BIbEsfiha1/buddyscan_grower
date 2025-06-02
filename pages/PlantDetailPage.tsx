import React, { useState, useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plant, PlantStage, DiaryEntry, PlantHealthStatus, NewDiaryEntryData } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import DiaryEntryItem from '../components/DiaryEntryItem';
import DailyChecklist from '../components/DailyChecklist';
import Modal from '../components/Modal';
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

  const [plant, setPlant] = useState<Plant | null | undefined>(null);
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showRemoveByDiseaseModal, setShowRemoveByDiseaseModal] = useState(false);
  const [removeByDiseaseNote, setRemoveByDiseaseNote] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [cultivos, setCultivos] = useState<{ id: string; name: string }[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<string | undefined>(undefined);
  const [movingCultivo, setMovingCultivo] = useState(false);
  const [activeTab, setActiveTab] = useState<'actions' | 'diary' | 'checklist'>('actions');
  const [toast, setToast] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newDiaryNote, setNewDiaryNote] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);

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
    // Prefixed for Safari, Chrome/Edge support window.SpeechRecognition
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      console.warn('Web Speech API is not supported in this browser.');
      // Optionally set a state here to disable the button if API is not found
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true; // Keep listening
    recognition.interimResults = true; // Get results as they come
    recognition.lang = 'pt-BR'; // Set to Brazilian Portuguese

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      // Append final transcript to the existing note.
      // User can speak multiple times.
      if (finalTranscript) {
        setNewDiaryNote(prevNote => prevNote + finalTranscript + ' ');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      let errorMessage = 'Erro na transcrição de áudio.';
      if (event.error === 'no-speech') {
        errorMessage = 'Nenhuma fala detectada. Tente novamente.';
      } else if (event.error === 'audio-capture') {
        errorMessage = 'Falha ao capturar áudio. Verifique seu microfone.';
      } else if (event.error === 'not-allowed') {
        errorMessage = 'Permissão para microfone negada.';
      }
      setToast({ message: errorMessage, type: 'error' });
      setIsRecording(false);
    };

    recognition.onend = () => {
      // Only set isRecording to false if it wasn't intentionally stopped
      // This might need more robust state handling if user stops it manually vs. it auto-ends
      // For now, let's assume it means it stopped processing the last utterance or was manually stopped.
       if (isRecording) { // Check if it was actually recording - THIS STATE MIGHT BE STALE
          setIsRecording(false); // This might cause issues if isRecording was changed by user stop
       }
    };

    setSpeechRecognition(recognition);

    return () => {
      if (recognition) {
        recognition.abort(); // Stop recognition if component unmounts
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount to setup.


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
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (res.status === 204) {
        setShowRemoveByDiseaseModal(false);
        setRemoveByDiseaseNote('');
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

  const [checklistState, setChecklistState] = useState<Partial<Plant>>({});

  useEffect(() => {
    if (plant) {
      const today = new Date().toISOString().split('T')[0];
      const isToday = plant.lastDailyCheckDate === today;
      setChecklistState({
        lastDailyCheckDate: plant.lastDailyCheckDate,
        dailyWatered: isToday ? plant.dailyWatered : false,
        dailyNutrients: isToday ? plant.dailyNutrients : false,
        dailyLightAdjustment: isToday ? plant.dailyLightAdjustment : false,
        dailyPestCheck: isToday ? plant.dailyPestCheck : false,
        dailyRotation: isToday ? plant.dailyRotation : false,
      });
    }
  }, [plant]);

  useEffect(() => {
    return () => {
      if (plantId && plant) {
        const currentChecklistSnapshot = checklistState;

        const payload: Partial<Plant> = {
          lastDailyCheckDate: currentChecklistSnapshot.lastDailyCheckDate,
          dailyWatered: currentChecklistSnapshot.dailyWatered,
          dailyNutrients: currentChecklistSnapshot.dailyNutrients,
          dailyLightAdjustment: currentChecklistSnapshot.dailyLightAdjustment,
          dailyPestCheck: currentChecklistSnapshot.dailyPestCheck,
          dailyRotation: currentChecklistSnapshot.dailyRotation,
        };

        // IMPORTANT: Strip undefined keys from THIS payload first
        Object.keys(payload).forEach(keyStr => {
          const key = keyStr as keyof typeof payload;
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });

        // THEN check if there's anything left to send
        if (Object.keys(payload).length > 0) {
          // updatePlantDetails(plantId, payload); // <-- THIS LINE IS REMOVED/COMMENTED OUT
          console.log('[PlantDetailPage] useEffect cleanup: Would have updated with payload:', payload, 'Snapshot was:', currentChecklistSnapshot);
        } else {
          // This log should now correctly trigger if the snapshot leads to an empty payload
          console.log('[PlantDetailPage] useEffect cleanup: Payload effectively empty after stripping undefineds. Snapshot was:', currentChecklistSnapshot);
        }
      } else {
        // Log if plantId or plant is missing
        console.log('[PlantDetailPage] useEffect cleanup: plantId or plant missing. plantId:', plantId, 'plant:', plant);
      }
    };
  }, [plantId, plant, checklistState, updatePlantDetails]); // Added updatePlantDetails to dependencies

  const handleToggleRecording = () => {
    if (!speechRecognition) {
      setToast({ message: 'Reconhecimento de voz não é suportado neste navegador.', type: 'error' });
      return;
    }

    if (isRecording) {
      speechRecognition.stop();
      setIsRecording(false);
    } else {
      // Request microphone permission if not already granted.
      // This happens implicitly when .start() is called if not granted.
      try {
        speechRecognition.start();
        setIsRecording(true);
        setToast({ message: 'Ouvindo... Fale agora.', type: 'info' });
      } catch (e) {
        console.error("Error starting speech recognition:", e);
        setToast({ message: 'Não foi possível iniciar o reconhecimento de voz.', type: 'error' });
        setIsRecording(false);
      }
    }
  };

  const handleSaveNewDiaryEntry = async () => {
    if (!plantId || !plant || !newDiaryNote.trim()) {
      setToast({ message: 'Por favor, escreva uma nota para salvar.', type: 'error' });
      return;
    }

    const entryData: NewDiaryEntryData = {
      notes: newDiaryNote.trim(),
      stage: plant.currentStage, // Use current plant's stage
      photos: [], // No photo upload in this step
      // Other optional fields like ph, ec, temp can be added later
    };

    try {
      const newEntry = await addNewDiaryEntry(plantId, entryData);
      if (newEntry) {
        setNewDiaryNote(''); // Clear textarea
        setToast({ message: 'Entrada do diário salva!', type: 'success' });
        // The diaryEntries list should update automatically if PlantContext handles state correctly
        // Or explicitly call loadPlantData() if diaryEntries are not updating automatically from context.
        // For now, assume context updates will trigger re-render of diaryEntries.
        // To be safe and ensure list updates:
        const entries = await getDiaryEntries(plantId);
        setDiaryEntries(entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));

      } else {
        setToast({ message: 'Erro ao salvar entrada no diário.', type: 'error' });
      }
    } catch (error: any) {
      setToast({ message: `Erro: ${error.message || 'Falha ao salvar entrada.'}`, type: 'error' });
    }
  };

  const handleTaskToggle = async (taskId: keyof Plant, checked: boolean) => {
    if (!plant) return;
    const today = new Date().toISOString().split('T')[0];
    let updated = { ...checklistState };
    if (plant.lastDailyCheckDate !== today) {
      updated = {
        lastDailyCheckDate: today,
        dailyWatered: false,
        dailyNutrients: false,
        dailyLightAdjustment: false,
        dailyPestCheck: false,
        dailyRotation: false,
        [taskId]: checked,
      };
    } else {
      updated = { ...updated, [taskId]: checked, lastDailyCheckDate: today };
    }
    setChecklistState(updated);

    // Só persiste se houver mudanças reais e não for payload vazio
    const payload: Partial<Plant> = {
      lastDailyCheckDate: updated.lastDailyCheckDate,
      dailyWatered: updated.dailyWatered,
      dailyNutrients: updated.dailyNutrients,
      dailyLightAdjustment: updated.dailyLightAdjustment,
      dailyPestCheck: updated.dailyPestCheck,
      dailyRotation: updated.dailyRotation,
    };
    // Remove campos undefined
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });
    // Só chama update se houver pelo menos 1 campo além do id
    if (Object.keys(payload).length > 0 && plantId) {
      try {
        await updatePlantDetails(plantId, payload);
      } catch (err: any) {
        setToast({ message: 'Erro ao atualizar checklist: ' + (err.message || err), type: 'error' });
      }
    }
  };

  const handleDownloadQrCode = () => {
    if (!plant || !plant.qrCodeValue) return;
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

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!plant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
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
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header global do app */}
        <Header
          title="Detalhes da Planta"
          onOpenSidebar={() => setSidebarOpen(true)}
          onOpenAddModal={() => {}}
          onOpenScannerModal={() => {}}
        />
        {/* Toast notification */}
        {toast && <Toast message={toast.message} type={toast.type} />}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
            {/* Hidden QR Code for download generation */}
            {plant && plant.qrCodeValue && (
              <div style={{ display: 'none' }}>
                <QRCodeSVG id="qr-code-svg-for-download" value={plant.qrCodeValue} size={256} includeMargin={true} />
              </div>
            )}
            {/* Header com imagem e infos principais */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              {/* 1. Layout Principal: flex-col md:flex-row e space-y-4 md:space-y-0 */}
              <div className="flex flex-col md:flex-row p-6 space-y-4 md:space-y-0 md:space-x-6">
                {/* 2. Bloco da Imagem: w-full sm:w-1/2 md:w-1/4 mx-auto */}
                <div className="w-full sm:w-1/2 md:w-1/4 mb-6 md:mb-0 flex flex-col items-center mx-auto">
                  {plant && plant.imageUrl ? (
                    <img
                      src={plant.imageUrl}
                      alt={plant.name}
                      // Ajuste da imagem: w-full h-auto, max-w-[220px] em telas pequenas, sm:w-48 sm:h-48
                      className="w-full max-w-[220px] h-auto object-cover rounded-lg shadow-md sm:max-w-none sm:w-48 sm:h-48"
                    />
                  ) : (
                    <div className="w-full max-w-[220px] h-48 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center sm:w-48 sm:h-48">
                      <LeafIcon className="w-16 h-16 text-gray-400 dark:text-gray-500" />
                    </div>
                  )}
                </div>
                {/* 3. Bloco de Informações: w-full md:w-2/4 */}
                <div className="w-full md:w-2/4 md:px-0"> {/* Removido md:px-6 pois o parent já tem padding e space-x */}
                  {/* Nome da planta responsivo */}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2 text-center md:text-left">{plant.name}</h1>
                  {/* Status/ID da planta - text-xs e text-sm já são adequados */}
                  <div className="flex items-center justify-center md:justify-start space-x-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${healthColor}-100 text-${healthColor}-800 dark:bg-${healthColor}-900 dark:text-${healthColor}-200`}>
                      {plant ? plant.healthStatus || 'Status desconhecido' : 'Status desconhecido'}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID: {plant ? plant.id : ''}</span>
                  </div>
                  {/* Grid de detalhes responsiva: 1 coluna em extra small, 2 colunas em small+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    {/* Itens da grid com flex para layout interno */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-500 dark:text-gray-400">Strain</span>
                      <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{plant.strain || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-500 dark:text-gray-400">Estágio</span>
                      <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{plant.currentStage || 'N/A'}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-500 dark:text-gray-400">Nascimento</span>
                      <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{formatDate(plant.birthDate)}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                      <span className="text-gray-500 dark:text-gray-400">Colheita Estimada</span>
                      <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{formatDate(plant.estimatedHarvestDate)}</span>
                    </div>
                    {plant.substrate && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <span className="text-gray-500 dark:text-gray-400">Substrato</span>
                        <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{plant.substrate}</span>
                      </div>
                    )}
                    {plant.cultivationType && (
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                        <span className="text-gray-500 dark:text-gray-400">Tipo de Cultivo</span>
                        <span className="font-medium text-gray-900 dark:text-white text-left sm:text-right">{plant.cultivationType}</span>
                      </div>
                    )}
                  </div>
                </div>
                {/* 4. Bloco do QR Code: w-full sm:w-1/2 md:w-1/4 mx-auto */}
                <div className="w-full sm:w-1/2 md:w-1/4 flex flex-col items-center justify-center border-t pt-4 md:pt-0 md:border-t-0 md:border-l md:border-gray-200 md:dark:border-gray-700 md:pl-6 mx-auto">
                  {plant.qrCodeValue && (
                    <div className="flex flex-col items-center w-full">
                      {/* QR Code responsivo e menor */}
                      <QRCodeSVG value={plant.qrCodeValue} size={128} includeMargin={true} className="mb-2 w-full max-w-[96px] h-auto" />
                      <button
                        onClick={handleDownloadQrCode}
                        // Botão responsivo, centralizado e com largura baseada no conteúdo em mobile
                        className="mt-2 mx-auto sm:max-w-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Download
                      </button>
                    </div>
                  )}
                </div>
              </div>
              {plant.notes && (
                <div className="px-6 pb-6">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Notas</h3>
                  {/* 6. Seção de Notas da Planta: max-h-32, p-2, overflow-y-auto */}
                  <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded-md max-h-32 overflow-y-auto">
                    <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{plant.notes}</p>
                  </div>
                </div>
              )}
            </div>
            {/* Tabs e conteúdo */}
            <div className="px-6 pt-4 border-b border-gray-200 dark:border-gray-700">
              {/* 5. Abas de Navegação: overflow-x-auto, space-x-4 */}
              <nav className="flex -mb-px space-x-4 overflow-x-auto" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('actions')}
                  className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm ${activeTab === 'actions' ? 'text-green-600 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
                >
                  Ações
                </button>
                <button
                  onClick={() => setActiveTab('checklist')}
                  className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm ${activeTab === 'checklist' ? 'text-green-600 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
                >
                  Checklist Diário
                </button>
                <button
                  onClick={() => setActiveTab('diary')}
                  className={`whitespace-nowrap py-4 px-3 border-b-2 font-medium text-sm ${activeTab === 'diary' ? 'text-green-600 border-green-500' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300 dark:hover:border-gray-600'}`}
                >
                  Diário da Planta
                </button>
              </nav>
            </div>
            <div className="p-6">
              {activeTab === 'actions' && (
                <>
                  {/* Botões de Ação empilhados em mobile */}
                  <div className="flex flex-col gap-3 mb-6">
                    {plant.qrCodeValue && (
                      <button
                        onClick={() => setShowQrModal(true)}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5z" /></svg>
                        Ver QR Code
                      </button>
                    )}
                    <button
                      onClick={() => setShowRemoveByDiseaseModal(true)}
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors flex items-center justify-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c1.153 0 2.243.096 3.222.261m3.222.261L8.84 3.727M11.09 15.85l-.002-.003-.002-.002A.754.754 0 0011.082 15H11a.752.752 0 00-.698.443L9.5 18.75h5l-.802-3.307A.752.752 0 0013 15h-.082a.754.754 0 00-.006.002l-.002.003-.002.002a23.038 23.038 0 00-1.908.845z" /></svg>
                      Remover por Doença
                    </button>
                  </div>
                  {/* Seção Cultivo empilhada em mobile */}
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">Cultivo</h2>
                    <div className="flex flex-col items-start gap-3">
                      <select
                        className="w-full border rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
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
                        className="w-full bg-green-500 text-white rounded px-3 py-1 disabled:opacity-60 hover:bg-green-600 transition-colors"
                        disabled={movingCultivo || (selectedCultivo === plant.cultivoId || !selectedCultivo)}
                        onClick={async () => {
                          if (!plantId || !selectedCultivo || selectedCultivo === plant.cultivoId) return;
                          setMovingCultivo(true);
                          try {
                            await updatePlantDetails(plantId, { cultivoId: selectedCultivo });
                            await loadPlantData();
                            setToast({ message: 'Planta movida para o cultivo selecionado!', type: 'success' });
                            setSelectedCultivo(undefined);
                          } catch (err: any) {
                            setToast({ message: 'Erro ao mover planta: ' + (err.message || err), type: 'error' });
                          }
                          setMovingCultivo(false);
                        }}
                      >
                        Mover para este cultivo
                      </button>
                    </div>
                  </div>
                </>
              )}
              {activeTab === 'checklist' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Checklist Diário</h2>
                  <DailyChecklist plant={plant} onTaskToggle={handleTaskToggle} />
                </div>
              )}
              {activeTab === 'diary' && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-3">Diário da Planta</h2>

                  <div className="mb-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Nova Entrada no Diário</h3>
                    <textarea
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md min-h-[80px] bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Escreva suas observações, ações tomadas, etc..."
                      value={newDiaryNote}
                      onChange={(e) => setNewDiaryNote(e.target.value)}
                    ></textarea>
                    {/* Botões do formulário de diário responsivos */}
                    <div className="mt-3 flex flex-col sm:flex-row sm:justify-end items-center gap-3">
                      <button
                        type="button" // Important: type="button" to prevent form submission if inside a form
                        onClick={handleToggleRecording}
                        className={`w-full sm:w-auto px-4 py-2 font-semibold rounded-lg hover:bg-opacity-80 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors
                          ${isRecording ? 'bg-red-500 text-white focus:ring-red-500' : 'bg-blue-500 text-white focus:ring-blue-500'}`}
                      >
                        {isRecording ? 'Parar Gravação' : 'Ditar Nota (PT-BR)'}
                      </button>
                      <button
                        onClick={handleSaveNewDiaryEntry}
                        className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-colors"
                        disabled={!newDiaryNote.trim()}
                      >
                        Salvar Entrada
                      </button>
                    </div>
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
              )}
            </div>
          </div>
        </main>
        {/* Modals */}
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
                onClick={() => { setShowRemoveByDiseaseModal(false); }}
                className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                ← Voltar
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRemoveByDiseaseModal(false)}
                  className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleRemoveByDisease}
                  className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
                >
                  Confirmar Remoção
                </button>
              </div>
            </div>
          </div>
        </Modal>
        {plant.qrCodeValue && (
          <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="QR Code da Planta">
            <div className="flex flex-col items-center justify-center p-4">
              <QRCodeSVG value={plant.qrCodeValue} size={256} includeMargin={true} />
              <p className="mt-4 text-lg font-semibold text-gray-800 dark:text-white">{plant.name}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">ID: {plant.id}</p>
              <button
                onClick={handleDownloadQrCode}
                className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg shadow transition-colors flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                Download QR Code
              </button>
            </div>
          </Modal>
        )}
      </div> {/* Fecha div className="flex-1 flex flex-col min-h-screen" */}
    </div> {/* Fecha div className="flex min-h-screen bg-gray-50 dark:bg-gray-900" */}
  </>
  ); // Fecha o return statement
}; // Fecha a arrow function PlantDetailPage

export default PlantDetailPage;