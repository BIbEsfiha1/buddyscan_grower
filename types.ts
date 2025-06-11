export enum PlantStage {
  SEEDLING = 'Muda',
  VEGETATIVE = 'Vegetativo',
  FLOWERING = 'Floração',
  DRYING = 'Secagem',
  CURING = 'Cura',
  MOTHER = 'Planta Mãe',
}

export enum PlantHealthStatus {
  HEALTHY = 'Saudável',
  PEST_ALERT = 'Alerta de Praga',
  NUTRIENT_DEFICIENCY = 'Deficiência Nutricional',
  DISEASE_SUSPECTED = 'Suspeita de Doença',
  RECOVERING = 'Em Recuperação',
  OBSERVATION = 'Em Observação',
}

export enum PlantOperationalStatus {
  ACTIVE = 'Ativa',
  HARVESTED = 'Colhida',
  LOST = 'Perdida',
  PAUSED = 'Pausada', // e.g. mother plant being rested
  ARCHIVED = 'Arquivada', // For completed/lost plants that are no longer active but kept for records
}

export interface Grow {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  qrCodeValue: string;
  userId: string;
  createdAt: string;
}


export interface Cultivo {
  // ...outras propriedades
  plants?: any[]; // Array de plantas associado ao cultivo
  substrate?: string;
  growId?: string;
  id: string;
  name: string;
  startDate: string; // ISO
  notes?: string;
  createdAt: string;
  userId: string;
  finalizadoEm?: string | null; // Data/hora de finalização do cultivo
}

export interface Plant {
  id: string;
  qrCodeValue: string;
  name: string; 
  strain: string;
  birthDate: string; 
  currentStage: PlantStage;
  healthStatus: PlantHealthStatus; 
  operationalStatus: PlantOperationalStatus;
  cultivationType?: 'Indoor' | 'Outdoor' | 'Hydroponics' | 'Aeroponics' | 'Aquaponics' | 'Soil';
  substrate?: string; // e.g., Coco Coir, Rockwool, Soil Mix
  estimatedHarvestDate?: string; 
  growRoomId?: string;
  heightCm?: number;
  latestEc?: number;
  latestPh?: number;
  imageUrl?: string; 
  genetics?: string;
  medium?: string;
  notes?: string; 
  // Relacionamento com Cultivo
  cultivoId?: string;
  // Campos do Checklist Diário
  lastDailyCheckDate?: string; // YYYY-MM-DD
  dailyWatered?: boolean;
  dailyNutrients?: boolean;
  dailyPestCheck?: boolean;
  dailyLightAdjustment?: boolean;
  dailyRotation?: boolean;
}

export interface Photo {
  id: string;
  urlOriginal: string; 
  urlThumb?: string;
  aiSummary?: string;
  aiRawJson?: string;
  uploadedAt: string; 
  caption?: string;
}

export interface DiaryEntry {
  id: string;
  plantId: string;
  timestamp: string; 
  author: string; 
  notes?: string;
  stage: PlantStage; // Stage at the time of entry
  heightCm?: number;
  ec?: number; 
  ph?: number;
  temperature?: number; 
  humidity?: number;
  symptoms?: string;
  actionsTaken?: string;
  wateringVolume?: number;
  wateringType?: string;
  fertilizationType?: string;
  fertilizationConcentration?: number;
  photoperiod?: string;
  sprayProduct?: string;
  sprayAmount?: number;
  photos: Photo[];
  aiOverallDiagnosis?: string;
}

export interface SensorReading {
  id:string;
  type: 'temperature' | 'humidity' | 'co2' | 'light' | 'soil_moisture' | 'water_ph' | 'water_ec';
  value: number;
  unit: string; 
  timestamp: string; 
}

export interface ChecklistItem {
  id: string;
  text: string;
}

// Type for photos before they get ID and uploadedAt from the backend/service
export type NewPhoto = Omit<Photo, 'id' | 'uploadedAt'>;

// Type for diary entry data when creating a new one
export type NewDiaryEntryData = Omit<DiaryEntry, 'id' | 'plantId' | 'timestamp' | 'author' | 'photos'> & { photos: NewPhoto[] };

// Type for plant data when creating a new one, omitting generated fields and optional ones made required
export type NewPlantData = Omit<Plant, 'id' | 'qrCodeValue' | 'imageUrl' | 'latestEc' | 'latestPh' | 'heightCm' | 'growRoomId' | 'lastDailyCheckDate' | 'dailyWatered' | 'dailyNutrients' | 'dailyPestCheck' | 'dailyLightAdjustment' | 'dailyRotation'> & {
    name: string;
    strain: string;
    birthDate: string;
    currentStage: Plant['currentStage'];
    healthStatus: PlantHealthStatus;
    operationalStatus: PlantOperationalStatus;
    cultivationType?: Plant['cultivationType'];
    substrate?: string;
    estimatedHarvestDate?: string;
    notes?: string;
    imageUrl?: string; // imageUrl is optional during creation
    cultivoId?: string; // Relacionamento com cultivo
};
