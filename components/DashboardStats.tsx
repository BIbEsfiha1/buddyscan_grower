import React, { useMemo } from 'react';
import { usePlantContext } from '../contexts/PlantContext';
import { PlantStage, PlantHealthStatus } from '../types';
import LeafIcon from './icons/LeafIcon'; 
import CheckCircleIcon from './icons/CheckCircleIcon';
import XMarkIcon from './icons/XMarkIcon';

interface StatItemProps {
  title: string;
  value: string | number;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>; // Tipo mais específico para o ícone
  accentColor?: string;
  onClick?: () => void;
}

const StatItem: React.FC<StatItemProps> = ({ 
  title, 
  value, 
  icon, 
  accentColor = '#7AC943', // Cor verde padrão, mais orgânica
  onClick 
}) => (
  <div 
    className={`group relative flex items-center p-4 sm:p-5 transition-all duration-300 ease-in-out hover:translate-y-[-4px] ${onClick ? 'cursor-pointer' : ''}`}
    onClick={onClick}
    style={{ 
      // Sombra sutil para profundidade, com cor de acento
      boxShadow: `0 4px 15px -2px ${accentColor}30, 0 2px 8px -2px ${accentColor}20`,
      borderRadius: '1.25rem', // Bordas mais arredondadas
      background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%), hsl(var(--card-bg, 220 13% 18%))', // Fundo sutil para modo escuro/claro
      border: '1px solid rgba(255, 255, 255, 0.08)' // Borda sutil
    }}
  >
    {/* Elemento decorativo de 'folha' no canto */}
    <div 
      className="absolute -top-2 -left-2 w-10 h-10 opacity-30 group-hover:opacity-50 transition-opacity duration-300"
      style={{
        background: `radial-gradient(circle at top left, ${accentColor}99 0%, transparent 60%)`,
        borderRadius: '50% 0 50% 50%',
        transform: 'rotate(-45deg)'
      }}
    />
    
    {/* Ícone com fundo suave e borda de acento */}
    <div 
      className="relative z-10 flex-shrink-0 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 mr-3 sm:mr-4 rounded-full transition-all duration-300 group-hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}10 100%)`,
        border: `2px solid ${accentColor}50`,
      }}
    >
      <div style={{ color: accentColor }}>
        {React.cloneElement(icon, { className: 'w-6 h-6 sm:w-7 sm:h-7' })}{/* Cast removido e className aplicado diretamente */}
      </div>
    </div>
    
    {/* Conteúdo textual */}
    <div className="relative z-10 flex-1">
      <p className="text-xs sm:text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-0.5 font-medium group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors duration-300">{title}</p>
      <p className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white" style={{ color: accentColor }}>{value}</p>
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  const { plants } = usePlantContext();

  const stats = useMemo(() => {
    const totalPlants = plants.length;

    // Estatísticas por status de saúde
    const healthy = plants.filter(p => p.healthStatus === PlantHealthStatus.HEALTHY).length;
    const observation = plants.filter(p => p.healthStatus === PlantHealthStatus.OBSERVATION).length;
    const pestAlert = plants.filter(p => p.healthStatus === PlantHealthStatus.PEST_ALERT).length;
    const nutrientDeficiency = plants.filter(p => p.healthStatus === PlantHealthStatus.NUTRIENT_DEFICIENCY).length;
    const diseaseSuspected = plants.filter(p => p.healthStatus === PlantHealthStatus.DISEASE_SUSPECTED).length;
    const recovering = plants.filter(p => p.healthStatus === PlantHealthStatus.RECOVERING).length;

    // Estatísticas por status operacional
    const active = plants.filter(p => p.operationalStatus === 'Ativa').length;
    const harvested = plants.filter(p => p.operationalStatus === 'Colhida').length;
    const lost = plants.filter(p => p.operationalStatus === 'Perdida').length;
    const paused = plants.filter(p => p.operationalStatus === 'Pausada').length;
    const archived = plants.filter(p => p.operationalStatus === 'Arquivada').length;

    // Agrupamento para "Requerem Atenção"
    const attention = pestAlert + nutrientDeficiency + diseaseSuspected + recovering + observation;

    // Por estágio
    const plantsByStage = plants.reduce((acc, plant) => {
      acc[plant.currentStage] = (acc[plant.currentStage] || 0) + 1;
      return acc;
    }, {} as Record<PlantStage, number>);

    return {
      totalPlants,
      healthy,
      observation,
      pestAlert,
      nutrientDeficiency,
      diseaseSuspected,
      recovering,
      attention,
      active,
      harvested,
      lost,
      paused,
      archived,
      plantsByStage,
    };
  }, [plants]);

  const stageOrder: PlantStage[] = [
    PlantStage.SEEDLING,
    PlantStage.VEGETATIVE,
    PlantStage.FLOWERING,
    PlantStage.DRYING, 
    PlantStage.CURING,  
    PlantStage.MOTHER   
  ];
  
  const stageColors: Record<PlantStage, string> = {
    [PlantStage.SEEDLING]: '#86C166', // Verde claro e fresco
    [PlantStage.VEGETATIVE]: '#5A9C4C', // Verde mais robusto
    [PlantStage.FLOWERING]: '#C37AC9', // Lilás suave para flores
    [PlantStage.DRYING]: '#E6A553', // Laranja terroso para secagem
    [PlantStage.CURING]: '#A47B5E', // Marrom suave para cura
    [PlantStage.MOTHER]: '#5EBFB5', // Verde-água para planta mãe
  };

  return (
    <div className="mb-8 sm:mb-10">
      {/* Título da seção com um toque orgânico */}
      <div className="flex items-center mb-5 sm:mb-6">
        <div className="w-2 h-8 bg-green-500 rounded-r-md mr-3"></div>
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-slate-100">
          Visão Geral do Jardim
        </h2>
      </div>
      
      {/* Grid responsivo para os cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        <StatItem
          title="Total de Plantas"
          value={stats.totalPlants}
          icon={<LeafIcon />}
          accentColor="#7AC943"
        />
        <StatItem
          title="Saudáveis"
          value={stats.healthy}
          icon={<CheckCircleIcon />}
          accentColor="#4CAF50"
        />
        <StatItem
          title="Em Observação"
          value={stats.observation}
          icon={<XMarkIcon />}
          accentColor="#FFB300"
        />
        <StatItem
          title="Alerta de Praga"
          value={stats.pestAlert}
          icon={<XMarkIcon />}
          accentColor="#E76F51"
        />
        <StatItem
          title="Def. Nutricional"
          value={stats.nutrientDeficiency}
          icon={<XMarkIcon />}
          accentColor="#FFA726"
        />
        <StatItem
          title="Suspeita de Doença"
          value={stats.diseaseSuspected}
          icon={<XMarkIcon />}
          accentColor="#B71C1C"
        />
        <StatItem
          title="Recuperando"
          value={stats.recovering}
          icon={<CheckCircleIcon />}
          accentColor="#1976D2"
        />
        <StatItem
          title="Requerem Atenção"
          value={stats.attention}
          icon={<XMarkIcon />}
          accentColor={stats.attention > 0 ? "#E76F51" : "#57A773"}
        />
        <StatItem
          title="Colhidas"
          value={stats.harvested}
          icon={<CheckCircleIcon />}
          accentColor="#A47B5E"
        />
        <StatItem
          title="Arrancadas"
          value={stats.lost}
          icon={<XMarkIcon />}
          accentColor="#C62828"
        />
        <StatItem
          title="Ativas"
          value={stats.active}
          icon={<CheckCircleIcon />}
          accentColor="#5EBFB5"
        />
        <StatItem
          title="Pausadas"
          value={stats.paused}
          icon={<LeafIcon />}
          accentColor="#5A9C4C"
        />
        <StatItem
          title="Arquivadas"
          value={stats.archived}
          icon={<LeafIcon />}
          accentColor="#888888"
        />
        {/* Por estágio */}
        {stageOrder.map(stage => {
          const count = stats.plantsByStage[stage] || 0;
          if (count > 0) {
            return (
              <StatItem
                key={stage}
                title={`${stage.charAt(0).toUpperCase() + stage.slice(1).toLowerCase()}`}
                value={count}
                icon={<CheckCircleIcon />}
                accentColor={stageColors[stage]}
              />
            );
          }
          return null;
        })}
      </div>
    </div>
  );
};

export default DashboardStats;
