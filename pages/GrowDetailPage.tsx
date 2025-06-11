import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Grow, Cultivo, PlantStage } from '../types';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import PlusIcon from '../components/icons/PlusIcon';
import Button from '../components/Button';
import Loader from '../components/Loader';
import Toast from '../components/Toast';
import useToast from '../hooks/useToast';
import Modal from '../components/Modal';
import GrowQrCodeDisplay from '../components/GrowQrCodeDisplay';
import { addMassDiaryEntry } from '../services/plantService';

export default function GrowDetailPage() {
  const { growId } = useParams<{ growId: string }>();
  const navigate = useNavigate();
  const [grow, setGrow] = useState<Grow | null>(null);
  const [cultivos, setCultivos] = useState<Cultivo[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, showToast] = useToast();
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedCultivo, setSelectedCultivo] = useState<Cultivo | null>(null);
  const [showMassModal, setShowMassModal] = useState(false);
  const [massNotes, setMassNotes] = useState('');
  const [massWateringVolume, setMassWateringVolume] = useState('');
  const [massWateringType, setMassWateringType] = useState('');
  const [massFertilizationType, setMassFertilizationType] = useState('');
  const [massFertilizationConcentration, setMassFertilizationConcentration] = useState('');
  const [massPhotoperiod, setMassPhotoperiod] = useState('');
  const [massSprayProduct, setMassSprayProduct] = useState('');
  const [massSprayAmount, setMassSprayAmount] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const { getGrows } = await import('../services/growService');
        const { getCultivos } = await import('../services/cultivoService');
        const [growList, cultivosList] = await Promise.all([getGrows(), getCultivos()]);
        setGrow(growList.find(g => g.id === growId) || null);
        setCultivos(cultivosList.filter(c => c.growId === growId));
      } catch (err) {
        showToast({ message: 'Erro ao carregar dados', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
    if (growId) fetchData();
  }, [growId]);

  const openMassModal = (cultivo: Cultivo) => {
    setSelectedCultivo(cultivo);
    setShowMassModal(true);
    setMassNotes('');
    setMassWateringVolume('');
    setMassWateringType('');
    setMassFertilizationType('');
    setMassFertilizationConcentration('');
    setMassPhotoperiod('');
    setMassSprayProduct('');
    setMassSprayAmount('');
  };

  const handleMassRegister = async () => {
    if (!selectedCultivo) return;
    try {
      await addMassDiaryEntry(selectedCultivo.id, {
        notes: massNotes || undefined,
        wateringVolume: massWateringVolume ? Number(massWateringVolume) : undefined,
        wateringType: massWateringType || undefined,
        fertilizationType: massFertilizationType || undefined,
        fertilizationConcentration: massFertilizationConcentration ? Number(massFertilizationConcentration) : undefined,
        photoperiod: massPhotoperiod || undefined,
        sprayProduct: massSprayProduct || undefined,
        sprayAmount: massSprayAmount ? Number(massSprayAmount) : undefined,
        stage: PlantStage.VEGETATIVE,
      });
      showToast({ message: 'Ação registrada em massa com sucesso', type: 'success' });
    } catch (e: any) {
      showToast({ message: e.message || 'Erro ao registrar ação em massa', type: 'error' });
    } finally {
      setShowMassModal(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        <Loader message="Carregando espaço..." size="md" />
      </div>
    );
  }

  if (!grow) {
    return (
      <div className="flex flex-col items-center justify-center min-h-full p-6">
        Espaço não encontrado
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto w-full min-h-full flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
      {toast && <Toast toast={toast} />}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 flex items-center gap-2 py-2 px-1 sm:px-0 -mx-2 sm:mx-0 backdrop-blur-md mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-green-100 dark:hover:bg-green-900 transition focus:outline-none focus:ring-2 focus:ring-green-400"
          aria-label="Voltar"
        >
          <ArrowLeftIcon className="w-7 h-7 text-green-700" />
        </button>
        <nav className="text-xs text-gray-500 dark:text-gray-400 flex gap-1">
          <Link to="/" className="hover:underline">Dashboard</Link>
          <span>&gt;</span>
          <Link to="/grows" className="hover:underline">Grows</Link>
          <span>&gt;</span>
          <span className="font-bold text-green-700 dark:text-green-300">{grow.name}</span>
        </nav>
        <div className="flex-1" />
        <Link to={`/novo-cultivo?growId=${grow.id}`}>
          <Button variant="primary" size="icon" className="shadow" title="Novo Plantio">
            <PlusIcon className="w-5 h-5" />
          </Button>
        </Link>
      </div>

      <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 mt-2 mb-2">{grow.name}</h1>
      {grow.location && <p className="text-sm text-gray-500 dark:text-gray-400">{grow.location}</p>}
      {grow.capacity && <p className="text-sm text-gray-500 dark:text-gray-400">Capacidade: {grow.capacity}</p>}
      <button
        onClick={() => setShowQrModal(true)}
        className="mt-2 text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition w-max"
      >
        Ver QR Code
      </button>

      <div className="mt-4">
        {cultivos.length ? (
          <ul className="space-y-2">
            {cultivos.map(c => (
              <li key={c.id} className="p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-gray-100">{c.name}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{new Date(c.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/cultivo/${c.id}`}>
                      <Button variant="primary" size="sm">Selecionar Plantio</Button>
                    </Link>
                    <Button variant="secondary" size="sm" onClick={() => openMassModal(c)}>Registrar Ação em Massa</Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400 dark:text-gray-500">Nenhum plantio neste espaço.</div>
        )}
      </div>
      {grow && (
        <Modal isOpen={showQrModal} onClose={() => setShowQrModal(false)} title="QR Code do Espaço">
          <GrowQrCodeDisplay grow={grow} />
        </Modal>
      )}
      {selectedCultivo && (
        <Modal isOpen={showMassModal} onClose={() => setShowMassModal(false)} title="Registro em Massa" maxWidth="sm">
          <div className="flex flex-col gap-3 p-2">
            <input
              type="number"
              className="p-2 border rounded"
              placeholder="Volume de Rega (L)"
              value={massWateringVolume}
              onChange={e => setMassWateringVolume(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Tipo de Água/Solução"
              value={massWateringType}
              onChange={e => setMassWateringType(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Tipo de Fertilizante"
              value={massFertilizationType}
              onChange={e => setMassFertilizationType(e.target.value)}
            />
            <input
              type="number"
              className="p-2 border rounded"
              placeholder="Concentração do Fertilizante"
              value={massFertilizationConcentration}
              onChange={e => setMassFertilizationConcentration(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Fotoperíodo (ex: 12/12)"
              value={massPhotoperiod}
              onChange={e => setMassPhotoperiod(e.target.value)}
            />
            <input
              type="text"
              className="p-2 border rounded"
              placeholder="Produto de Pulverização"
              value={massSprayProduct}
              onChange={e => setMassSprayProduct(e.target.value)}
            />
            <input
              type="number"
              className="p-2 border rounded"
              placeholder="Quantidade Pulverizada"
              value={massSprayAmount}
              onChange={e => setMassSprayAmount(e.target.value)}
            />
            <textarea
              className="p-2 border rounded"
              placeholder="Notas"
              value={massNotes}
              onChange={e => setMassNotes(e.target.value)}
            />
            <div className="flex gap-3 mt-2">
              <Button variant="secondary" onClick={() => setShowMassModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={handleMassRegister} disabled={!massNotes && !massWateringVolume && !massFertilizationType && !massPhotoperiod && !massSprayProduct}>Salvar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
