import React from 'react';
import { Plant, PlantStage } from '../types';
import {
  CheckCircleIcon,
  SunIcon,
  WaterDropIcon,
  BugAntIcon,
  AdjustmentsHorizontalIcon,
  RefreshIcon,
} from './icons/ChecklistIcons';

interface DailyChecklistProps {
  plant: Plant | Partial<Plant>;
  onTaskToggle: (taskName: keyof Plant, isChecked: boolean) => void;
  title?: string;
  className?: string;
}

const getChecklistItemsForStage = (stage: PlantStage | undefined) => {
  switch (stage) {
    case PlantStage.SEEDLING:
      return [
        { id: 'dailyWatered', label: 'Rega', icon: <WaterDropIcon className="w-6 h-6" /> },
        { id: 'dailyLightAdjustment', label: 'Ajuste de Luz', icon: <SunIcon className="w-6 h-6" /> },
        { id: 'dailyPestCheck', label: 'Verificação de Pragas', icon: <BugAntIcon className="w-6 h-6" /> },
      ];
    case PlantStage.VEGETATIVE:
    case PlantStage.MOTHER:
      return [
        { id: 'dailyWatered', label: 'Rega', icon: <WaterDropIcon className="w-6 h-6" /> },
        { id: 'dailyNutrients', label: 'Nutrientes', icon: <AdjustmentsHorizontalIcon className="w-6 h-6" /> },
        { id: 'dailyLightAdjustment', label: 'Ajuste de Luz', icon: <SunIcon className="w-6 h-6" /> },
        { id: 'dailyPestCheck', label: 'Verificação de Pragas', icon: <BugAntIcon className="w-6 h-6" /> },
        { id: 'dailyRotation', label: 'Rotação', icon: <RefreshIcon className="w-6 h-6" /> },
      ];
    case PlantStage.FLOWERING:
      return [
        { id: 'dailyWatered', label: 'Rega', icon: <WaterDropIcon className="w-6 h-6" /> },
        { id: 'dailyNutrients', label: 'Nutrientes', icon: <AdjustmentsHorizontalIcon className="w-6 h-6" /> },
        { id: 'dailyPestCheck', label: 'Verificação de Pragas', icon: <BugAntIcon className="w-6 h-6" /> },
      ];
    default:
      return [];
  }
};

const DailyChecklist: React.FC<DailyChecklistProps> = ({ plant, onTaskToggle, title = 'Checklist Diário', className = '' }) => {
  const today = new Date().toISOString().split('T')[0];
  const isChecklistForToday = plant.lastDailyCheckDate === today;
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
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 shadow-sm relative overflow-hidden
                ${isChecked ? 'bg-green-50 border-green-400 dark:bg-green-900/30' : 'bg-slate-50 border-slate-200 dark:bg-slate-700/40 dark:border-slate-600'}
              `}
              style={{ minHeight: 56 }}
            >
              <button
                type="button"
                aria-label={item.label}
                className={`rounded-full p-2 transition-all duration-300 flex items-center justify-center
                  ${isChecked ? 'bg-green-500 text-white scale-110 shadow-lg' : 'bg-slate-200 dark:bg-slate-600 text-slate-500'}
                `}
                onClick={() => onTaskToggle(item.id as keyof Plant, !isChecked)}
                title={item.label}
              >
                <span className="transition-transform duration-300">
                  {isChecked ? <CheckCircleIcon className="w-6 h-6" /> : item.icon}
                </span>
              </button>
              <span className={`text-base font-medium transition-colors duration-300 ${isChecked ? 'text-green-700 dark:text-green-300 line-through' : 'text-slate-700 dark:text-slate-200'}`}>{item.label}</span>
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
