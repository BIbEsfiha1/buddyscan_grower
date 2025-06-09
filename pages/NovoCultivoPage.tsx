import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';
import { SUBSTRATE_OPTIONS } from '../constants';
import { Grow, PlantStage, PlantHealthStatus, PlantOperationalStatus } from '../types';

export default function NovoCultivoPage() {
  const [cultivoNome, setCultivoNome] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [substrate, setSubstrate] = useState('');
  const [grows, setGrows] = useState<Grow[]>([]);
  const [growId, setGrowId] = useState('');
  const [plants, setPlants] = useState<{ name: string; strain: string }[]>([{ name: '', strain: '' }]);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchGrows() {
      try {
        const { getGrows } = await import('../services/growService');
        const data = await getGrows();
        setGrows(data);
      } catch (e) {
        console.error('Erro ao carregar grows', e);
      }
    }
    fetchGrows();
  }, []);

  const updatePlant = (index: number, field: 'name' | 'strain', value: string) => {
    setPlants(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const addPlantField = () => setPlants(prev => [...prev, { name: '', strain: '' }]);

  const removePlantField = (index: number) => {
    setPlants(prev => prev.filter((_, i) => i !== index));
  };

  async function handleSalvarCultivo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { addCultivo } = await import('../services/cultivoService');
      const plantsToSend = plants
        .filter(p => p.name && p.strain)
        .map(p => ({
          ...p,
          birthDate: startDate,
          currentStage: PlantStage.SEEDLING,
          healthStatus: PlantHealthStatus.HEALTHY,
          operationalStatus: PlantOperationalStatus.ACTIVE,
          substrate,
        }));
      const cultivoData = {
        name: cultivoNome,
        startDate,
        notes,
        substrate,
        growId: growId || undefined,
        plants: plantsToSend,
      };
      await addCultivo(cultivoData);
      setSaving(false);
      setToast({ message: 'Cultivo criado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/cultivos'), 1800);
    } catch (err: any) {
      setSaving(false);
      setToast({ message: 'Erro ao salvar cultivo: ' + (err.message || err), type: 'error' });
    }
  }

  const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="mx-auto w-full max-w-3xl lg:max-w-5xl min-h-screen flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
      {/* Toast global */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Breadcrumbs e botão de voltar */}
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
          <Link to="/cultivos" className="hover:underline">Cultivos</Link>
          <span>&gt;</span>
          <span className="font-bold text-green-700 dark:text-green-300">Novo Cultivo</span>
        </nav>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 sm:p-6 flex-1 flex flex-col">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-green-700 dark:text-green-300 mb-6 text-center">Novo Cultivo</h1>
        <form onSubmit={handleSalvarCultivo} className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
          {/* Detalhes do Cultivo */}
          <fieldset className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md lg:flex-1">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-2">Informações do Cultivo</legend>
            <div>
              <label htmlFor="cultivoNome" className={labelStyle}>Nome do Cultivo</label>
              <input id="cultivoNome" type="text" className={inputStyle} value={cultivoNome} onChange={e => setCultivoNome(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="startDate" className={labelStyle}>Data de Início</label>
              <input id="startDate" type="date" className={inputStyle} value={startDate} onChange={e => setStartDate(e.target.value)} required />
            </div>
            <div>
              <label htmlFor="grow" className={labelStyle}>Grow / Estufa</label>
              <select id="grow" className={inputStyle} value={growId} onChange={e => setGrowId(e.target.value)}>
                <option value="">Selecione...</option>
                {grows.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="substrate" className={labelStyle}>Substrato</label>
              <select id="substrate" className={inputStyle} value={substrate} onChange={e => setSubstrate(e.target.value)}>
                {SUBSTRATE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="notes" className={labelStyle}>Notas (opcional)</label>
              <textarea id="notes" className={inputStyle} value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
          </fieldset>

          <fieldset className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md lg:flex-1">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-2">Plantas</legend>
            {plants.map((p, idx) => (
              <div key={idx} className="grid grid-cols-2 gap-2 items-center">
                <input
                  type="text"
                  className={inputStyle}
                  placeholder="Nome"
                  value={p.name}
                  onChange={e => updatePlant(idx, 'name', e.target.value)}
                />
                <input
                  type="text"
                  className={inputStyle}
                  placeholder="Strain"
                  value={p.strain}
                  onChange={e => updatePlant(idx, 'strain', e.target.value)}
                />
                {plants.length > 1 && (
                  <button type="button" onClick={() => removePlantField(idx)} className="text-red-500 text-sm">Remover</button>
                )}
              </div>
            ))}
            <button type="button" onClick={addPlantField} className="text-green-700 text-sm">+ Adicionar Planta</button>
          </fieldset>

          <div className="mt-8 flex justify-center lg:col-span-2">
            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={!cultivoNome || !startDate}>
              Salvar Cultivo
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
