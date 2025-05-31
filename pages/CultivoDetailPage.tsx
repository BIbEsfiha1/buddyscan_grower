import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Cultivo, Plant, PlantOperationalStatus, PlantStage } from '../types'; // Adicionado PlantStage
import { generateQRCodesPDF } from '../../utils/pdfUtils';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import PlantCard from '../components/PlantCard';
import ArrowLeftIcon from '../components/icons/ArrowLeftIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import LeafIcon from '../components/icons/LeafIcon';
import PlusIcon from '../components/icons/PlusIcon';
import { getPlantsByCultivo, updateCultivo } from '../services/cultivoService';
import { updatePlant } from '../services/plantService';

const CultivoDetailPage: React.FC = () => {
  const { cultivoId } = useParams<{ cultivoId: string }>();
  const navigate = useNavigate();
  const [cultivo, setCultivo] = useState<Cultivo | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Novo: função para buscar plantas separadamente
  const fetchPlants = async () => {
    if (!cultivoId) return;
    setLoading(true);
    try {
      const plantas = await getPlantsByCultivo(cultivoId!);
      setPlants(plantas);
    } catch (err: any) {
      setError('Erro ao carregar plantas do cultivo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const { getCultivos } = await import('../services/cultivoService');
        const data = await getCultivos();
        const found = data.find((c: Cultivo) => c.id === cultivoId);
        setCultivo(found || null);
      } catch (err: any) {
        setError('Erro ao carregar dados do cultivo.');
      } finally {
        setLoading(false);
      }
    }
    if (cultivoId) {
      fetchData();
      fetchPlants();
    }
  }, [cultivoId]);

  // Atualizar plantas após updateCultivo
  const handleUpdateCultivo = async (data: Partial<Cultivo>) => {
    if (!cultivoId) return;
    try {
      await updateCultivo(cultivoId, data);
      await fetchPlants();
    } catch (err) {
      setError('Erro ao atualizar cultivo.');
    }
  };

  // Toast auto-hide
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 2500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handlePrintQRCodes = async () => {
    if (!cultivo || plants.length === 0) {
      setToast({ message: 'Nenhuma planta neste cultivo para imprimir QR codes.', type: 'info' });
      return;
    }
    setIsGeneratingPDF(true);
    setToast({ message: 'Gerando PDF com QR codes...', type: 'info' });
    try {
      await generateQRCodesPDF(plants, cultivo.name);
      // Success is implicit if no error is thrown by generateQRCodesPDF, as it handles download.
      // setToast({ message: 'PDF gerado com sucesso!', type: 'success' }); // Optional success toast
    } catch (error: any) {
      console.error("Error generating QR Code PDF:", error);
      setToast({ message: `Erro ao gerar PDF: ${error.message || 'Falha desconhecida'}`, type: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleFinishCultivo = async () => {
    if (!cultivoId) {
      console.error('Nenhum ID de cultivo fornecido');
      setError('ID do cultivo não encontrado');
      return;
    }
    
    setFinishing(true);
    console.log(`[handleFinishCultivo] Iniciando finalização do cultivo ${cultivoId}`);
    
    try {
      // 1. Atualiza status do cultivo (finalizadoEm)
      console.log(`[handleFinishCultivo] Atualizando status do cultivo ${cultivoId} para finalizado`);
      await updateCultivo(cultivoId, { 
        finalizadoEm: new Date().toISOString() 
      });
      
      // 2. Atualiza todas as plantas ativas para "colhida"
      const activePlants = plants.filter(p => p.operationalStatus === PlantOperationalStatus.ACTIVE);
      console.log(`[handleFinishCultivo] ${activePlants.length} plantas ativas para marcar como colhidas`);
      
      if (activePlants.length > 0) {
        await Promise.all(
          activePlants.map(async (p) => {
            console.log(`[handleFinishCultivo] Atualizando planta ${p.id} para colhida`);
            try {
              await updatePlant(p.id, { 
                operationalStatus: PlantOperationalStatus.HARVESTED, 
                currentStage: 'Secagem' 
              });
              console.log(`[handleFinishCultivo] Planta ${p.id} atualizada com sucesso`);
            } catch (plantError) {
              console.error(`[handleFinishCultivo] Erro ao atualizar planta ${p.id}:`, plantError);
              // Não interrompe o fluxo se uma planta falhar
            }
          })
        );
      }
      
      // 3. Atualiza o estado local para refletir as mudanças
      setCultivo(prev => prev ? { ...prev, finalizadoEm: new Date().toISOString() } : null);
      setPlants(prevPlants => 
        prevPlants.map(p => 
          p.operationalStatus === PlantOperationalStatus.ACTIVE 
            ? { 
                ...p, 
                operationalStatus: PlantOperationalStatus.HARVESTED, 
                currentStage: PlantStage.DRYING // Usando o enum correto
              } 
            : p
        )
      );
      
      // Atualiza o estado local para refletir as mudanças no contexto
      // Se estiver usando um contexto global, você pode adicionar a lógica aqui
      // Por exemplo: updateCultivoInContext(cultivoId, { finalizadoEm: new Date().toISOString() });
      
      setShowFinishModal(false);
      setToast({ 
        message: 'Cultivo finalizado! Todas as plantas ativas foram marcadas como colhidas.', 
        type: 'success' 
      });
      
      // 4. Redireciona após um curto atraso para o usuário ver a mensagem
      setTimeout(() => navigate('/cultivos'), 1200);
      
    } catch (err: any) {
      console.error('[handleFinishCultivo] Erro ao finalizar cultivo:', err);
      const errorMessage = err.message || 'Erro desconhecido ao finalizar cultivo';
      setError('Erro ao finalizar cultivo: ' + errorMessage);
      setToast({ 
        message: `Erro ao finalizar cultivo: ${errorMessage}`, 
        type: 'error' 
      });
    } finally {
      setFinishing(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <span className="w-10 h-10 border-4 border-green-400 border-t-transparent rounded-full animate-spin mb-6" />
      <span className="text-green-700 dark:text-green-300 font-semibold text-lg">Carregando cultivo...</span>
    </div>
  );
  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <LeafIcon className="w-12 h-12 text-red-400 mb-3" />
      <span className="text-red-600 dark:text-red-400 font-semibold text-lg mb-2">{error}</span>
      <Button variant="secondary" onClick={() => window.location.reload()}>Tentar novamente</Button>
    </div>
  );
  if (!cultivo) return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6">
      <LeafIcon className="w-12 h-12 text-gray-400 mb-3" />
      <span className="text-gray-500 dark:text-gray-400 font-semibold text-lg">Cultivo não encontrado.</span>
      <Button variant="secondary" onClick={() => navigate('/cultivos')}>Voltar para cultivos</Button>
    </div>
  );

  const hasActivePlants = plants.some(p => p.operationalStatus === PlantOperationalStatus.ACTIVE);

  return (
    <div className="max-w-lg mx-auto w-full p-2 sm:p-4 min-h-screen flex flex-col gap-3 bg-white dark:bg-slate-900">
      {/* Toast global */}
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Breadcrumbs e botão de voltar mobile first */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 flex items-center gap-2 py-2 px-1 sm:px-0 -mx-2 sm:mx-0 backdrop-blur-md">
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
          <span className="font-bold text-green-700 dark:text-green-300">{cultivo.name}</span>
        </nav>
      </div>

      {/* Título e status */}
      <div className="flex items-center gap-2 mt-2 mb-1">
        <h1 className="text-2xl font-extrabold text-green-700 dark:text-green-300 flex items-center gap-2 flex-1 truncate">
          {cultivo.name}
          {cultivo.finalizadoEm ? (
            <CheckCircleIcon className="w-6 h-6 text-green-500" />
          ) : (
            <LeafIcon className="w-6 h-6 text-yellow-500 animate-pulse" />
          )}
        </h1>
        {!cultivo.finalizadoEm && (
          <Button 
          variant="primary" 
          size="icon" 
          className="shadow ml-2" 
          title="Adicionar nova planta"
          onClick={() => {
            // Navega para a página de nova planta com o ID do cultivo
            navigate(`/nova-planta?cultivoId=${cultivo.id}`);
          }}
        >
          <PlusIcon className="w-6 h-6" />
        </Button>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span>Início: {new Date(cultivo.startDate).toLocaleDateString()}</span>
        {cultivo.finalizadoEm && (
          <span className="ml-2 px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-xs font-bold">Finalizado em {new Date(cultivo.finalizadoEm).toLocaleDateString()}</span>
        )}
      </div>

      {/* Lista de plantas */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Plantas deste cultivo</h2>
          <div className="flex items-center gap-2"> {/* Added a div to group buttons */}
            <button
              onClick={handlePrintQRCodes}
              className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded hover:bg-blue-200 dark:hover:bg-blue-800 transition"
              title="Imprimir Etiquetas QR do Cultivo"
              disabled={isGeneratingPDF || plants.length === 0}
            >
              {/* Optional: <PrinterIcon className="w-4 h-4 mr-1 inline" /> */}
              {isGeneratingPDF ? 'Gerando PDF...' : 'Imprimir Etiquetas QR'}
            </button>
            <button
              onClick={fetchPlants} // Existing button
              className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900 rounded hover:bg-green-200 dark:hover:bg-green-800 transition"
              title="Atualizar lista de plantas"
            >
              Atualizar
            </button>
          </div>
        </div>
        {plants.length === 0 ? (
          <div className="text-gray-400 dark:text-gray-500 text-center py-6">Nenhuma planta cadastrada ainda.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plants.map(plant => (
              <PlantCard key={plant.id} plant={plant} />
            ))}
          </div>
        )}
      </div>

      {/* Botão de finalizar cultivo */}
      <Button
        variant="primary"
        size="lg"
        disabled={!hasActivePlants || !!cultivo.finalizadoEm}
        onClick={() => setShowFinishModal(true)}
        className="mt-2 w-full shadow-lg text-lg flex items-center justify-center gap-2 px-4 py-4"
        iconLeft={<CheckCircleIcon className="w-5 h-5" />}
      >
        Finalizar Cultivo
      </Button>

      {/* Modal de confirmação */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="Finalizar Cultivo" size="md">
        <div className="flex flex-col items-center gap-4 p-2">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-2" />
          <span className="text-lg font-bold text-green-800 dark:text-green-300 text-center">Tem certeza que deseja finalizar este cultivo?</span>
          <span className="text-gray-600 dark:text-gray-300 text-center">Todas as plantas ativas serão marcadas como colhidas e passarão para a fase de secagem.</span>
          <div className="flex w-full justify-between gap-3 mt-4">
            <Button variant="secondary" fullWidth onClick={() => setShowFinishModal(false)}>Cancelar</Button>
            <Button variant="primary" fullWidth loading={finishing} onClick={handleFinishCultivo}>Confirmar</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CultivoDetailPage;
