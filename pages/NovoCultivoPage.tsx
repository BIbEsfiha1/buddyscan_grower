import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import Toast from '../components/Toast';

interface NovaPlantaForm {
  name: string;
  strain: string;
  birthDate: string;
}

export default function NovoCultivoPage() {
  const [cultivoNome, setCultivoNome] = useState('');
  const [startDate, setStartDate] = useState('');
  const [notes, setNotes] = useState('');
  const [plantas, setPlantas] = useState<NovaPlantaForm[]>([]);
  const [novaPlanta, setNovaPlanta] = useState<NovaPlantaForm>({ name: '', strain: '', birthDate: '' });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const navigate = useNavigate();

  function adicionarPlanta() {
    if (novaPlanta.name && novaPlanta.strain && novaPlanta.birthDate) {
      setPlantas([...plantas, novaPlanta]);
      setNovaPlanta({ name: '', strain: '', birthDate: '' }); // Reset form
    }
  }

  async function handleSalvarCultivo(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { addCultivo } = await import('../services/cultivoService');
      // Importar enums dinamicamente para evitar problemas de importação circular
      const { PlantStage, PlantHealthStatus, PlantOperationalStatus } = await import('../types');
      const cultivoData = {
        name: cultivoNome,
        startDate,
        notes,
        plants: plantas.map(p => ({
          ...p,
          currentStage: PlantStage.SEEDLING,
          healthStatus: PlantHealthStatus.HEALTHY,
          operationalStatus: PlantOperationalStatus.ACTIVE,
        })),
      };
      await addCultivo(cultivoData);
      setSaving(false);
      setToast({ message: 'Cultivo e plantas criados com sucesso!', type: 'success' });
      setTimeout(() => navigate('/cultivos'), 1800);
    } catch (err: any) {
      setSaving(false);
      setToast({ message: 'Erro ao salvar cultivo: ' + (err.message || err), type: 'error' });
    }
  }

  const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
  const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-lg mx-auto w-full min-h-screen flex flex-col gap-3 bg-white dark:bg-slate-900 p-2 sm:p-4">
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

        <form onSubmit={handleSalvarCultivo} className="space-y-6">
          {/* Detalhes do Cultivo */}
          <fieldset className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
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
              <label htmlFor="notes" className={labelStyle}>Notas (opcional)</label>
              <textarea id="notes" className={inputStyle} value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
            </div>
          </fieldset>

          {/* Adicionar Plantas */}
          <fieldset className="space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md">
            <legend className="text-lg font-semibold text-gray-700 dark:text-gray-300 px-2">Adicionar Plantas</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="plantaNome" className={labelStyle}>Nome da Planta</label>
                <input id="plantaNome" type="text" className={inputStyle} placeholder="Ex: Blueberry OG #1" value={novaPlanta.name} onChange={e => setNovaPlanta({ ...novaPlanta, name: e.target.value })} />
              </div>
              <div>
                <label htmlFor="plantaStrain" className={labelStyle}>Strain</label>
                <input id="plantaStrain" type="text" className={inputStyle} placeholder="Ex: Blueberry OG" value={novaPlanta.strain} onChange={e => setNovaPlanta({ ...novaPlanta, strain: e.target.value })} />
              </div>
              <div>
                <label htmlFor="plantaNascimento" className={labelStyle}>Nascimento</label>
                <input id="plantaNascimento" type="date" className={inputStyle} value={novaPlanta.birthDate} onChange={e => setNovaPlanta({ ...novaPlanta, birthDate: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button type="button" variant="secondary" onClick={adicionarPlanta} disabled={!novaPlanta.name || !novaPlanta.strain || !novaPlanta.birthDate}>
                Adicionar Planta à Lista
              </Button>
            </div>
          </fieldset>

          {/* Lista de Plantas Adicionadas */}
          {plantas.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Plantas a Serem Criadas:</h2>
              <ul className="space-y-2">
                {plantas.map((p, idx) => (
                  <li key={idx} className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md shadow-sm flex justify-between items-center">
                    <div>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{p.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-300"> ({p.strain}) - Nasc: {new Date(p.birthDate + 'T00:00:00').toLocaleDateString()}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-8 flex justify-center">
            <Button type="submit" variant="primary" size="lg" loading={saving} disabled={plantas.length === 0 || !cultivoNome || !startDate}>
              Salvar Cultivo e Plantas
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
