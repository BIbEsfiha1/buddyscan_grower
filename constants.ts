import { PlantStage, ChecklistItem, PlantHealthStatus, PlantOperationalStatus } from './types';

export const APP_NAME = "BuddyScan";
export const DEFAULT_AI_PROMPT = "Você é um especialista em cultivo de cannabis. Analise esta imagem da planta e forneça um diagnóstico conciso e prático, destacando quaisquer problemas potenciais (deficiências, pragas, doenças) ou sinais de saúde. Seja específico sobre as observações e sugira possíveis causas ou ações corretivas se um problema for identificado. Se a planta parecer saudável, mencione isso. Limite a resposta a 2-3 frases.";

export const PLANT_STAGES_OPTIONS = [
  { value: PlantStage.SEEDLING, label: 'Muda' },
  { value: PlantStage.VEGETATIVE, label: 'Vegetativo' },
  { value: PlantStage.FLOWERING, label: 'Floração' },
  { value: PlantStage.DRYING, label: 'Secagem' },
  { value: PlantStage.CURING, label: 'Cura' },
  { value: PlantStage.MOTHER, label: 'Planta Mãe' },
];

export const PLANT_HEALTH_STATUS_OPTIONS = [
  { value: PlantHealthStatus.HEALTHY, label: 'Saudável' },
  { value: PlantHealthStatus.PEST_ALERT, label: 'Alerta de Praga' },
  { value: PlantHealthStatus.NUTRIENT_DEFICIENCY, label: 'Deficiência Nutricional' },
  { value: PlantHealthStatus.DISEASE_SUSPECTED, label: 'Suspeita de Doença' },
  { value: PlantHealthStatus.RECOVERING, label: 'Em Recuperação' },
  { value: PlantHealthStatus.OBSERVATION, label: 'Em Observação' },
];

export const PLANT_OPERATIONAL_STATUS_OPTIONS = [
  { value: PlantOperationalStatus.ACTIVE, label: 'Ativa' },
  { value: PlantOperationalStatus.PAUSED, label: 'Pausada' },
  { value: PlantOperationalStatus.HARVESTED, label: 'Colhida' },
  { value: PlantOperationalStatus.LOST, label: 'Perdida' },
  { value: PlantOperationalStatus.ARCHIVED, label: 'Arquivada' },
];

export const PLANT_HEALTH_STATUS_LABELS: Record<PlantHealthStatus, string> =
  PLANT_HEALTH_STATUS_OPTIONS.reduce((acc, { value, label }) => {
    acc[value as PlantHealthStatus] = label;
    return acc;
  }, {} as Record<PlantHealthStatus, string>);

export const PLANT_OPERATIONAL_STATUS_LABELS: Record<PlantOperationalStatus, string> =
  PLANT_OPERATIONAL_STATUS_OPTIONS.reduce((acc, { value, label }) => {
    acc[value as PlantOperationalStatus] = label;
    return acc;
  }, {} as Record<PlantOperationalStatus, string>);

export const CULTIVATION_TYPE_OPTIONS = [
  { value: 'Indoor', label: 'Indoor' },
  { value: 'Outdoor', label: 'Outdoor' },
  { value: 'Hydroponics', label: 'Hidroponia' },
  { value: 'Aeroponics', label: 'Aeroponia' },
  { value: 'Aquaponics', label: 'Aquaponia' },
  { value: 'Soil', label: 'Solo' },
];

export const SUBSTRATE_OPTIONS = [
  { value: 'Terra Composta (Solo Org\u00e2nico)', label: 'Terra Composta (Solo Org\u00e2nico)' },
  { value: 'Fibra de Coco', label: 'Fibra de Coco' },
  { value: 'Perlita', label: 'Perlita' },
  { value: 'Vermiculita', label: 'Vermiculita' },
  { value: 'Turfa (Peat Moss)', label: 'Turfa (Peat Moss)' },
  { value: 'L\u00e3 de Rocha (Rockwool)', label: 'L\u00e3 de Rocha (Rockwool)' },
  { value: 'Argila Expandida', label: 'Argila Expandida' },
  { value: 'Solo Inerte', label: 'Solo Inerte' },
  { value: 'Carolina Soil', label: 'Carolina Soil' },
  { value: 'Outro', label: 'Outro (Especificar)' },
];


export const GENERIC_ERROR_MESSAGE = "Ocorreu um erro. Por favor, tente novamente.";
export const MOCK_USER_ID = "user_default_01";
export const MOCK_AUTHOR_NAME = "Cultivador";

export const INITIAL_PLANT_DATA_COUNT = 0; 
export const INITIAL_DIARY_ENTRIES_PER_PLANT = 0; 

export const QR_CODE_DEFAULT_SIZE = 128;

export const MAX_IMAGE_SIZE_MB = 5;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const DAILY_CHECKLISTS_BY_STAGE: Record<PlantStage, ChecklistItem[]> = {
  [PlantStage.SEEDLING]: [
    { id: 'seedling_1', text: 'Verificar umidade do substrato (manter úmido, não encharcado)' },
    { id: 'seedling_2', text: 'Observar sinais de estiolamento (esticamento excessivo)' },
    { id: 'seedling_3', text: 'Garantir luz suave e indireta (aprox. 18h/dia)' },
    { id: 'seedling_4', text: 'Verificar temperatura (ideal 20-25°C) e umidade (ideal 60-70%)' },
    { id: 'seedling_5', text: 'Inspecionar por Damping Off (tombamento)' },
  ],
  [PlantStage.VEGETATIVE]: [
    { id: 'veg_1', text: 'Verificar pH da água de rega/solução nutritiva (ideal 5.8-6.5)' },
    { id: 'veg_2', text: 'Verificar EC da solução nutritiva (conforme tabela de strain/semana)' },
    { id: 'veg_3', text: 'Inspecionar folhas (topo e verso) por pragas, fungos ou deficiências' },
    { id: 'veg_4', text: 'Observar o vigor geral, coloração e desenvolvimento de novos brotos' },
    { id: 'veg_5', text: 'Ajustar altura da iluminação (18-24h/dia) conforme crescimento' },
    { id: 'veg_6', text: 'Considerar LST (Low Stress Training) ou topping/FIM, se planejado' },
    { id: 'veg_7', text: 'Verificar fluxo de ar e ventilação na estufa/grow' },
  ],
  [PlantStage.FLOWERING]: [
    { id: 'flower_1', text: 'Verificar pH da água de rega/solução nutritiva (ajustar para floração)' },
    { id: 'flower_2', text: 'Verificar EC da solução nutritiva (ajustar para floração)' },
    { id: 'flower_3', text: 'Mudar fotoperíodo para 12h luz / 12h escuridão total' },
    { id: 'flower_4', text: 'Inspecionar por pragas e mofo, especialmente nos botões em formação' },
    { id: 'flower_5', text: 'Monitorar umidade (ideal 40-50% para evitar mofo)' },
    { id: 'flower_6', text: 'Observar desenvolvimento dos pistilos e tricomas (com lupa)' },
    { id: 'flower_7', text: 'Considerar desfoliação leve para melhorar penetração de luz e ar' },
    { id: 'flower_8', text: 'Verificar odores e sistema de exaustão/filtro de carvão' },
  ],
  [PlantStage.DRYING]: [
    { id: 'drying_1', text: 'Manter ambiente escuro, fresco (18-21°C) e com umidade controlada (50-60%)' },
    { id: 'drying_2', text: 'Garantir boa circulação de ar, mas sem vento direto nas plantas' },
    { id: 'drying_3', text: 'Verificar galhos (devem quebrar, não dobrar) para ponto de secagem' },
    { id: 'drying_4', text: 'Inspecionar diariamente por sinais de mofo' },
  ],
  [PlantStage.CURING]: [
    { id: 'curing_1', text: 'Abrir potes ("burpar") diariamente por 5-15 min nas primeiras semanas' },
    { id: 'curing_2', text: 'Monitorar umidade dentro dos potes (ideal 58-62% com higrômetro)' },
    { id: 'curing_3', text: 'Verificar aroma e aparência dos buds' },
    { id: 'curing_4', text: 'Após estabilização, "burpar" com menos frequência' },
  ],
  [PlantStage.MOTHER]: [
    { id: 'mother_1', text: 'Manter em fotoperíodo vegetativo (18h+ de luz)' },
    { id: 'mother_2', text: 'Realizar podas regulares para manter forma e saúde' },
    { id: 'mother_3', text: 'Fornecer nutrição balanceada para crescimento contínuo' },
    { id: 'mother_4', text: 'Inspecionar regularmente por pragas e doenças' },
    { id: 'mother_5', text: 'Coletar clones conforme necessário, de ramos saudáveis' },
  ],
};

export const NO_CHECKLIST_MESSAGE = "Nenhuma tarefa de checklist definida para este estágio da planta.";

export const getHealthStatusColor = (status: PlantHealthStatus): string => {
  switch (status) {
    case PlantHealthStatus.HEALTHY: return 'bg-green-100 text-green-700 dark:bg-green-700 dark:text-green-100';
    case PlantHealthStatus.RECOVERING: return 'bg-blue-100 text-blue-700 dark:bg-blue-700 dark:text-blue-100';
    case PlantHealthStatus.OBSERVATION: return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-600 dark:text-yellow-100';
    case PlantHealthStatus.PEST_ALERT:
    case PlantHealthStatus.NUTRIENT_DEFICIENCY:
    case PlantHealthStatus.DISEASE_SUSPECTED:
      return 'bg-red-100 text-red-700 dark:bg-red-700 dark:text-red-100';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }
};

export const getOperationalStatusColor = (status: PlantOperationalStatus): string => {
  switch (status) {
    case PlantOperationalStatus.ACTIVE: return 'bg-teal-100 text-teal-700 dark:bg-teal-700 dark:text-teal-100';
    case PlantOperationalStatus.PAUSED: return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-700 dark:text-indigo-100';
    case PlantOperationalStatus.HARVESTED: return 'bg-purple-100 text-purple-700 dark:bg-purple-700 dark:text-purple-100';
    case PlantOperationalStatus.LOST: return 'bg-pink-100 text-pink-700 dark:bg-pink-700 dark:text-pink-100';
    case PlantOperationalStatus.ARCHIVED: return 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-200';
    default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }
};