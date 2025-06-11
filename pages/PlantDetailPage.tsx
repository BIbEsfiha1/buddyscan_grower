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
import { useTranslation } from 'react-i18next';

const PlantDetailPage: React.FC = () => {
  const { plantId } = useParams<{ plantId: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  const [plant, setPlant] = useState<Plant | null>();
  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [showRemoveByDiseaseModal, setShowRemoveByDiseaseModal] = useState(false);
  const [removeByDiseaseNote, setRemoveByDiseaseNote] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);
  const [cultivos, setCultivos] = useState<{ id: string; name: string }[]>([]);
  const [selectedCultivo, setSelectedCultivo] = useState<string>();
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
    setPlant(current || null);
    if (current) {
      const entries = await getDiaryEntries(plantId);
      setDiaryEntries(entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    }
  }, [plantId, getPlantById, fetchPlantById, getDiaryEntries]);

  useEffect(() => {
    loadPlantData();
  }, [loadPlantData]);

  useEffect(() => {
    if (plantId && plant) {
      try {
        localStorage.setItem('lastPlantId', plantId);
        plant.name && localStorage.setItem('lastPlantName', plant.name);
      } catch {};
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
      notes: `Planta removida do cultivo.${removeByDiseaseNote ? '\nMotivo: ' + removeByDiseaseNote : ''}`.trim(),
      stage: plant.currentStage ?? PlantStage.SEEDLING,
      photos: [],
    });
    try {
      const res = await fetch(`/.netlify/functions/deletePlant?id=${plantId}`, { method: 'DELETE', credentials: 'include' });
      if (res.status === 204) {
        setShowRemoveByDiseaseModal(false);
        setRemoveByDiseaseNote('');
        try {
          const last = localStorage.getItem('lastPlantId');
          if (last === plantId) {
            localStorage.removeItem('lastPlantId');
            localStorage.removeItem('lastPlantName');
          }
        } catch {};
        window.location.href = '/';
      } else {
        const err = await res.json();
        showToast({ message: t('plantDetailPage.deleteError', { error: err.error || res.status }), type: 'error' });
      }
    } catch (e: any) {
      showToast({ message: t('plantDetailPage.deleteUnexpected', { error: e.message || e }), type: 'error' });
    }
  };

  useEffect(() => {
    if (!plant || !plantId) return;
    const today = new Date().toISOString().split('T')[0];
    let stored: Record<string, boolean> = {};
    try {
      const s = localStorage.getItem(`checklist_${plantId}_${today}`);
      s && (stored = JSON.parse(s));
    } catch {};
    if (plant.lastDailyCheckDate === today) {
      STATIC_CHECKLIST_FIELDS.forEach(f => stored[f] = !!(plant as any)[f]);
    }
    setChecklistState(stored);
  }, [plant, plantId]);

  const handleTaskToggle = async (taskId: string, checked: boolean) => {
    if (!plantId) return;
    const today = new Date().toISOString().split('T')[0];
    const updated = { ...checklistState, [taskId]: checked };
    setChecklistState(updated);
    try { localStorage.setItem(`checklist_${plantId}_${today}`, JSON.stringify(updated)); } catch {};
    if (STATIC_CHECKLIST_FIELDS.includes(taskId as any)) {
      const payload: Partial<Plant> = { lastDailyCheckDate: today };
      STATIC_CHECKLIST_FIELDS.forEach(f => payload[f] = updated[f] || false);
      try { await updatePlantDetails(plantId, payload); } catch (err: any) {
        showToast({ message: t('plantDetailPage.checklistError', { error: err.message || err }), type: 'error' });
      }
    }
  };

  const handleDownloadQrCode = () => { /* canvas logic */ };

  const handleDiaryEntrySubmit = async (data: NewDiaryEntryData) => {
    if (!plantId) return;
    setIsSavingDiaryEntry(true);
    try {
      const newEntry = await addNewDiaryEntry(plantId, data);
      if (newEntry) {
        const entries = await getDiaryEntries(plantId);
        setDiaryEntries(entries.sort((a,b)=>new Date(b.timestamp).getTime()-new Date(a.timestamp).getTime()));
        setShowDiaryEntryModal(false);
        showToast({ message: t('plantDetailPage.diarySaveSuccess'), type: 'success' });
      } else {
        showToast({ message: t('plantDetailPage.diarySaveError'), type: 'error' });
      }
    } catch (err: any) {
      showToast({ message: t('plantDetailPage.diarySaveException', { error: err.message || err }), type: 'error' });
    } finally { setIsSavingDiaryEntry(false); }
  };

  if (!plant) return (
    <div className="flex items-center justify-center min-h-full bg-gray-50 dark:bg-gray-900">
      <div className="animate-pulse flex flex-col items-center">
        <div className="h-12 w-12 bg-green-200 dark:bg-green-700 rounded-full mb-4" />
        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
        <div className="h-3 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    </div>
  );

  const getHealthStatusColor = (status?: string) => {
    if (!status) return 'gray';
    switch(status) {
      case PlantHealthStatus.HEALTHY: return 'green';
      case PlantHealthStatus.OBSERVATION:
      case PlantHealthStatus.PEST_ALERT:
      case PlantHealthStatus.NUTRIENT_DEFICIENCY:
      case PlantHealthStatus.RECOVERING: return 'yellow';
      case PlantHealthStatus.DISEASE_SUSPECTED: return 'red';
      default: return 'gray';
    }
  };

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR',{ day:'2-digit', month:'2-digit', year:'numeric'}) : 'N/A';
  const healthColor = getHealthStatusColor(plant.healthStatus);

  return (
    <div className="flex min-h-full bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={()=>setSidebarOpen(false)}/>
      <div className="flex-1 flex flex-col min-h-full">
        <Header
          title={t('plantDetailPage.title')}
          onOpenSidebar={()=>setSidebarOpen(true)}
          showBack
          onBack={()=>navigate(-1)}
        />
        {toast && <Toast message={toast.message} type={toast.type} />}
        <main className="flex-1 max-w-7xl mx-auto w-full p-4">
          {/* QRCode hidden for download*/}
          <div style={{ display:'none' }}>
            <QRCodeSVG id="qr" value={plant.qrCodeValue || plant.id} size={256} includeMargin />
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left panel */}
            <section className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow space-y-4">
              {/* image */}
              <div className="flex flex-col items-center text-center gap-4">
                { plant.imageUrl
                  ? <img src={plant.imageUrl} alt={plant.name} className="w-full max-w-xs rounded-lg object-cover" />
                  : <LeafIcon className="w-16 h-16 text-gray-400 dark:text-gray-500"/> }
                <Typography variant="h3">{plant.name}</Typography>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded-full bg-${healthColor}-100 text-${healthColor}-800`}>
                    {plant.healthStatus||t('plantDetailPage.statusUnknown')}
                  </span>
                  <Typography variant="body2" className="text-gray-500">ID: {plant.id}</Typography>
                </div>
                {/* stats */}
                <div className="grid grid-cols-1 gap-2 w-full text-sm">
                  <div className="flex justify-between"><span>{t('plantDetailPage.strain')}</span><span>{plant.strain||'N/A'}</span></div>
                  <div className="flex justify-between"><span>{t('plantDetailPage.stage')}</span><span>{plant.currentStage||'N/A'}</span></div>
                  <div className="flex justify-between"><span>{t('plantDetailPage.birth')}</span><span>{formatDate(plant.birthDate)}</span></div>
                  <div className="flex justify-between"><span>{t('plantDetailPage.estimated')}</span><span>{formatDate(plant.estimatedHarvestDate)}</span></div>
                </div>
                {plant.notes && <Typography variant="body2" className="whitespace-pre-wrap p-2 bg-gray-100 rounded">{plant.notes}</Typography>}
              </div>
              <Button variant="secondary" onClick={()=>setShowQrModal(true)}>{t('plantDetailPage.viewQr')}</Button>
              <Button variant="danger" onClick={()=>setShowRemoveByDiseaseModal(true)}>{t('plantDetailPage.removeDisease')}</Button>
              {/* Move cultivo */}
              <div>
                <Typography variant="subtitle1">{t('plantDetailPage.cultivo')}</Typography>
                <div className="flex gap-2">
                  <select value={selectedCultivo||plant.cultivoId||''} onChange={e=>setSelectedCultivo(e.target.value)} disabled={movingCultivo}>
                    <option value="">{t('plantDetailPage.none')}</option>
                    {cultivos.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <Button disabled={movingCultivo||!selectedCultivo||selectedCultivo==plant.cultivoId} onClick={handleMoveCultivo}>{t('plantDetailPage.move')}</Button>
                </div>
              </div>
            </section>

            {/* Right panel */}
            <section className="lg:col-span-2 space-y-6">
              <Paper className="p-4">
                <Typography variant="h6">{t('plantDetailPage.dailyChecklist')}</Typography>
                <DailyChecklist stage={plant.currentStage} checklistState={checklistState} onTaskToggle={handleTaskToggle}/>
              </Paper>
              <Paper className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <Typography variant="h6">{t('plantDetailPage.diary')}</Typography>
                  <Button onClick={()=>setShowDiaryEntryModal(true)}>{t('plantDetailPage.newEntry')}</Button>
                </div>
                {diaryEntries.length? diaryEntries.map(e=><DiaryEntryItem key={e.id} entry={e}/>) : <Typography>{t('plantDetailPage.noEntries')}</Typography>}
              </Paper>
            </section>
          </div>
        </main>

        {/* Modals */}
        <Modal isOpen={showDiaryEntryModal} onClose={()=>setShowDiaryEntryModal(false)} title={t('plantDetailPage.newEntry')}>
          {plant && <DiaryEntryForm plantCurrentStage={plant.currentStage} onSubmit={handleDiaryEntrySubmit} isLoading={isSavingDiaryEntry}/>} 
        </Modal>
        <Modal isOpen={showRemoveByDiseaseModal} onClose={()=>setShowRemoveByDiseaseModal(false)} title={t('plantDetailPage.confirmRemove')}>
          <div className="p-2 space-y-2">
            <Typography>{t('plantDetailPage.confirmRemove')}</Typography>
            <textarea value={removeByDiseaseNote} onChange={e=>setRemoveByDiseaseNote(e.target.value)} className="w-full p-2 border rounded" placeholder={t('plantDetailPage.reasonOptional')}/>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={()=>setShowRemoveByDiseaseModal(false)}>{t('cancel')}</Button>
              <Button variant="danger" onClick={handleRemoveByDisease}>{t('confirm')}</Button>
            </div>
          </div>
        </Modal>
        {plant && <Modal isOpen={showQrModal} onClose={()=>setShowQrModal(false)} title={t('plantDetailPage.qr')}><QrCodeDisplay plant={plant}/><Button onClick={handleDownloadQrCode}>{t('plantDetailPage.downloadQr')}</Button></Modal>}
      </div>
    </div>
  );
};

export default PlantDetailPage;
