import React from 'react';
import { Plant, PlantStage } from '../types'; 
import { CheckCircleIcon, SunIcon, WaterDropIcon, BugAntIcon, AdjustmentsHorizontalIcon, RefreshIcon, ThermometerIcon, WindIcon, BeakerIcon, EyeIcon, ScissorsIcon, ClockIcon, DropletsIcon, JarIcon } from './icons/ChecklistIcons';

interface DailyChecklistProps {
  plant: Plant | Partial<Plant>; 
  onTaskToggle: (taskName: keyof Plant, isChecked: boolean) => void;
  title?: string;
  className?: string;
}

// Checklist dinâmico por estágio
// Make sure all these icons are imported from './icons/ChecklistIcons'
// CheckCircleIcon, SunIcon, WaterDropIcon, BugAntIcon, AdjustmentsHorizontalIcon, RefreshIcon,
// ThermometerIcon, WindIcon, BeakerIcon, EyeIcon, ScissorsIcon, ClockIcon, DropletsIcon, JarIcon

const getChecklistItemsForStage = (stage: PlantStage | undefined) => {
  switch (stage) {
    case PlantStage.SEEDLING: // "Germinação / Clones"
      return [
        { id: 'germinacaoVerificarSementes', label: 'Verificar germinação (sementes abrindo)', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'germinacaoUmidadeTemperatura', label: 'Umidade e temperatura ambiente (70-80% RH, 22-27°C)', icon: <ThermometerIcon className="w-6 h-6" /> },
        { id: 'germinacaoIrrigacaoAguaPura', label: 'Irrigação com água pura (sem nutrientes)', icon: <WaterDropIcon className="w-6 h-6" /> },
        { id: 'germinacaoEstadoClones', label: 'Estado visual dos clones (raízes, stress)', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'germinacaoIluminacaoLeve', label: 'Condições de iluminação leve (18-24h luz suave)', icon: <SunIcon className="w-6 h-6" /> },
      ];
    case PlantStage.VEGETATIVE: // "Fase Vegetativa"
    case PlantStage.MOTHER: // Assuming Mother plants follow vegetative care mostly
      return [
        { id: 'vegetativaAlturaPlantas', label: 'Altura das plantas (crescimento semanal)', icon: <RefreshIcon className="w-6 h-6" /> }, // Placeholder for height/growth
        { id: 'vegetativaEcSolucao', label: 'EC da solução nutritiva (0.8 - 1.6 mS/cm)', icon: <BeakerIcon className="w-6 h-6" /> },
        { id: 'vegetativaPhSolucao', label: 'pH da solução nutritiva (5.8 - 6.3)', icon: <BeakerIcon className="w-6 h-6" /> },
        { id: 'vegetativaInspecaoVisualDiaria', label: 'Inspeção visual diária (pragas, deficiências)', icon: <BugAntIcon className="w-6 h-6" /> },
        { id: 'vegetativaCondicoesAmbientais', label: 'Condições ambientais (temp: 21-27°C, umidade: 55-70%)', icon: <ThermometerIcon className="w-6 h-6" /> },
        { id: 'vegetativaFotoperiodo', label: 'Fotoperíodo (18h luz / 6h escuro)', icon: <ClockIcon className="w-6 h-6" /> },
        { id: 'vegetativaPodasTreinamento', label: 'Podas e treinamento (LST, topping, FIM)', icon: <ScissorsIcon className="w-6 h-6" /> },
        { id: 'vegetativaRotacaoPlantas', label: 'Rotação das plantas para luz uniforme', icon: <RefreshIcon className="w-6 h-6" /> },
      ];
    // NOTE: User provided "Transição (Pré-Flora)". This stage isn't explicitly in PlantStage enum.
    // I will map it to the beginning of FLOWERING or assume it's part of late VEGETATIVE.
    // For now, I'll create a separate section in FLOWERING or add specific items.
    // Let's assume "Transição" items are added to the start of FLOWERING.

    case PlantStage.FLOWERING: // Includes "Transição", "Floração Inicial", "Floração Avançada", "Finalização e Flush"
      // For simplicity in this auto-generation, I'll group them. A more complex system could have sub-stages.
      return [
        // Transição (Pré-Flora)
        { id: 'transicaoFotoperiodo1212', label: 'Alteração do fotoperíodo (12h luz / 12h escuro)', icon: <ClockIcon className="w-6 h-6" /> },
        { id: 'transicaoSinaisFloracao', label: 'Monitoramento dos primeiros sinais de floração', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'transicaoAjusteEc', label: 'Ajuste gradual da EC (1.2 - 1.8 mS/cm)', icon: <BeakerIcon className="w-6 h-6" /> },
        { id: 'transicaoPhEstavel', label: 'pH mantido estável (5.8 - 6.2)', icon: <BeakerIcon className="w-6 h-6" /> },
        { id: 'transicaoVerificacaoPragas', label: 'Verificação minuciosa de pragas', icon: <BugAntIcon className="w-6 h-6" /> },
        { id: 'transicaoReducaoUmidade', label: 'Redução gradual da umidade (45-60%)', icon: <DropletsIcon className="w-6 h-6" /> },
        // Floração Inicial (1ª-3ª Semana)
        { id: 'floracaoInicialDesenvolvimentoBuds', label: 'Desenvolvimento dos buds (pontos florais)', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'floracaoInicialEcAjustado', label: 'EC ajustado para floração (1.6 - 2.0 mS/cm)', icon: <BeakerIcon className="w-6 h-6" /> },
        // pH stable is covered by transicaoPhEstavel, can be repeated or assumed.
        { id: 'floracaoInicialMonitoramentoPragas', label: 'Monitoramento intenso de pragas (ácaros, etc.)', icon: <BugAntIcon className="w-6 h-6" /> },
        { id: 'floracaoInicialTemperaturaEstavel', label: 'Temperatura estável (20-26°C)', icon: <ThermometerIcon className="w-6 h-6" /> },
        { id: 'floracaoInicialUmidadeControlada', label: 'Umidade controlada (40-55%)', icon: <DropletsIcon className="w-6 h-6" /> },
        // Floração Avançada (4ª-7ª Semana)
        { id: 'floracaoAvancadaCrescimentoBuds', label: 'Crescimento e densidade dos buds', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaEcMaximo', label: 'EC máximo (até 2.4 mS/cm, cuidado)', icon: <BeakerIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaMonitorarDeficiencias', label: 'Monitorar deficiências nutricionais (N, P, K, Ca, Mg)', icon: <AdjustmentsHorizontalIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaInspecaoPragasDoencas', label: 'Inspeção rigorosa de pragas e doenças (mofos)', icon: <BugAntIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaTemperatura', label: 'Temperatura (20-25°C)', icon: <ThermometerIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaUmidadeReduzida', label: 'Umidade reduzida (< 50%)', icon: <DropletsIcon className="w-6 h-6" /> },
        { id: 'floracaoAvancadaCirculacaoAr', label: 'Circulação de ar (ventilação constante)', icon: <WindIcon className="w-6 h-6" /> },
        // Finalização e Flush (Última Semana)
        { id: 'finalizacaoEcFlush', label: 'EC baixíssima ou água pura para flush (<0.6 mS/cm)', icon: <WaterDropIcon className="w-6 h-6" /> },
        { id: 'finalizacaoObservacaoTricomas', label: 'Observação visual dos tricomas (cor, transparência)', icon: <EyeIcon className="w-6 h-6" /> }, // Consider a specific trichome icon later
        { id: 'finalizacaoInterrupcaoNutrientes', label: 'Interrupção gradual/completa de nutrientes', icon: <AdjustmentsHorizontalIcon className="w-6 h-6" /> },
        { id: 'finalizacaoReducaoMaiorUmidade', label: 'Redução ainda maior da umidade (35-45%)', icon: <DropletsIcon className="w-6 h-6" /> },
        { id: 'finalizacaoMonitoramentoMofo', label: 'Monitoramento intenso de sinais de mofo (bud rot)', icon: <BugAntIcon className="w-6 h-6" /> },
      ];
    // NOTE: User provided "Colheita". This is an event, not typically a daily checklist stage.
    // These items might be better suited for a "Harvest Day Guide" or a one-time checklist.
    // For now, I'll add them to a new "HARVEST_DAY" stage if we create one, or omit from daily.
    // Let's assume they are for the day of harvest, perhaps a special checklist shown when stage is set to Flowering and harvest date is near.
    // Or, integrate into a new "HARVESTING" stage if added to PlantStage enum.
    // For now, I'll map "Colheita" to PlantStage.DRYING as it's the phase after cutting.
    // This is an imperfect mapping.
    case PlantStage.DRYING: // Combines "Colheita" and "Secagem" from user's list
      return [
        // Colheita items (as one-time tasks for the day of, or leading up to)
        { id: 'colheitaAvaliacaoFinalTricomas', label: 'Avaliação final dos tricomas (âmbar / leitosa)', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'colheitaRegistroData', label: 'Registro da data exata da colheita', icon: <ClockIcon className="w-6 h-6" /> },
        { id: 'colheitaPesagemUmida', label: 'Pesagem inicial úmida', icon: <RefreshIcon className="w-6 h-6" /> }, // Placeholder for scale
        { id: 'colheitaCorteSeparacaoBuds', label: 'Corte das plantas e separação dos buds', icon: <ScissorsIcon className="w-6 h-6" /> },
        { id: 'colheitaPreparacaoSecagem', label: 'Preparação para secagem (18-22°C, 45-55% RH)', icon: <ThermometerIcon className="w-6 h-6" /> },
        // Secagem items
        { id: 'secagemMonitoramentoDiario', label: 'Monitoramento diário da secagem (7-14 dias)', icon: <EyeIcon className="w-6 h-6" /> },
        { id: 'secagemUmidadeIdeal', label: 'Umidade ideal mantida (50-55%)', icon: <DropletsIcon className="w-6 h-6" /> },
        { id: 'secagemTemperaturaControlada', label: 'Temperatura controlada (18-22°C)', icon: <ThermometerIcon className="w-6 h-6" /> },
        { id: 'secagemAvaliacaoPonto', label: 'Avaliação do ponto correto de secagem (galhos quebradiços)', icon: <RefreshIcon className="w-6 h-6" /> }, // Placeholder
      ];
    case PlantStage.CURING: // "Cura"
      return [
        { id: 'curaRegistroPesagemSeca', label: 'Registro final da pesagem seca', icon: <RefreshIcon className="w-6 h-6" /> }, // Placeholder for scale
        { id: 'curaInicioFrascosHermeticos', label: 'Início da cura em frascos herméticos', icon: <JarIcon className="w-6 h-6" /> },
        { id: 'curaMonitoramentoSemanalBurping', label: 'Monitoramento semanal (burping, umidade)', icon: <JarIcon className="w-6 h-6" /> },
      ];
    default:
      return [];
  }
};

const DailyChecklist: React.FC<DailyChecklistProps> = ({ 
  plant, 
  onTaskToggle, 
  title = "Checklist Diário",
  className = ""
}) => {
  const getCurrentDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isChecklistForToday = plant.lastDailyCheckDate === getCurrentDateString();
  const stage = plant.currentStage as PlantStage | undefined;
  const checklistItems = getChecklistItemsForStage(stage);
  const total = checklistItems.length;
  const checkedCount = checklistItems.filter(item => isChecklistForToday && !!plant[item.id as keyof Plant]).length;

  return (
    <div className={`p-6 border rounded-2xl shadow-lg bg-white dark:bg-slate-800 dark:border-slate-700 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${checkedCount === total ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'} font-semibold`}>
          {checkedCount} de {total} tarefas
        </span>
      </div>
      {!isChecklistForToday && (
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
          Checklist do dia anterior. Marcar qualquer item iniciará o checklist de hoje.
        </p>
      )}
      <ul className="space-y-3 mt-2">
        {checklistItems.map((item) => {
          const isChecked = isChecklistForToday ? !!plant[item.id as keyof Plant] : false;
          return (
            <li
              key={item.id}
              className={`flex items-start sm:items-center gap-3 p-3 rounded-xl border transition-all duration-300 shadow-sm relative overflow-hidden
                ${isChecked ? 'bg-green-50 border-green-400 dark:bg-green-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/40 dark:border-slate-600'}
                ${isChecked ? '' : ''}
              `}
              style={{ minHeight: 56 }}
            >
              <button
                type="button"
                aria-label={item.label}
                className={`rounded-full p-2 transition-all duration-300 ease-in-out flex items-center justify-center
                  ${isChecked ? 'bg-green-500 text-white scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'}
                `}
                onClick={() => onTaskToggle(item.id as keyof Plant, !isChecked)}
                title={item.label}
              >
                <span className="transition-transform duration-300">
                  {isChecked ? <CheckCircleIcon className="w-6 h-6" /> : item.icon}
                </span>
              </button>
              <span className={`flex-1 text-base font-medium transition-colors duration-300 ${isChecked ? 'text-green-700 dark:text-green-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{item.label}</span>
              {isChecked && (
                <span className="absolute right-4 top-4 text-green-400 animate-fade-in text-xs font-semibold">Concluído!</span>
              )}
            </li>
          );
        })}
      </ul>
      {checkedCount === total && total > 0 && (
        <div className="flex items-center gap-2 mt-4 text-green-700 dark:text-green-300 font-semibold text-sm">
          <CheckCircleIcon className="w-5 h-5" />
          Parabéns! Todos os cuidados de hoje foram concluídos.
        </div>
      )}
    </div>
  );
};

export default DailyChecklist;