import React, { createContext, useState, useEffect, useCallback, ReactNode, useContext } from 'react';
import { Plant, DiaryEntry, NewPlantData, NewDiaryEntryData } from '../types';
import {
  getPlants as apiGetPlants,
  getPlantById as apiGetPlantById,
  addPlant as apiAddPlant,
  updatePlant as apiUpdatePlant,
  deletePlant as apiDeletePlant,
  addDiaryEntry as apiAddDiaryEntry,
  getDiaryEntries as apiGetDiaryEntriesByPlantId, 
} from '../services/plantService'; // Mock service

// Re-export NewDiaryEntryData so it can be imported from this module
export type { NewDiaryEntryData };

interface PlantContextType {
  plants: Plant[];
  isLoading: boolean;
  error: string | null;
  getPlantById: (id: string) => Plant | undefined;
  fetchPlantById: (id: string) => Promise<Plant | undefined>;
  addPlant: (plantData: NewPlantData) => Promise<Plant | undefined>;
  updatePlantDetails: (plantId: string, updates: Partial<Plant>) => Promise<Plant | undefined>;
  deletePlant: (plantId: string) => Promise<boolean>;
  getDiaryEntries: (plantId: string) => DiaryEntry[];
  fetchDiaryEntries: (plantId: string) => Promise<DiaryEntry[]>;
  addNewDiaryEntry: (plantId: string, entryData: NewDiaryEntryData) => Promise<DiaryEntry | undefined>;
  refreshPlants: () => Promise<void>;
}

const PlantContext = createContext<PlantContextType | undefined>(undefined);

export const PlantProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<Record<string, DiaryEntry[]>>({}); // plantId -> DiaryEntry[]
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlants = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedPlants = await apiGetPlants();
      setPlants(fetchedPlants);
    } catch (e) {
      setError('Falha ao carregar plantas.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);
  
  const refreshPlants = useCallback(async () => {
    await fetchPlants();
  }, [fetchPlants]);

  const getPlantById = useCallback((id: string) => {
    return plants.find(p => p.id === id);
  }, [plants]);

  const fetchPlantById = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      const plant = await apiGetPlantById(id);
      if (plant && !plants.find(p => p.id === id)) {
        setPlants(prev => [...prev, plant]);
      } else if (plant) {
        setPlants(prev => prev.map(p => p.id === id ? plant : p));
      }
      setIsLoading(false);
      // apiGetPlantById pode retornar null; converta para undefined
      return plant === null ? undefined : plant;
    } catch (e) {
      setError(`Falha ao carregar planta ${id}.`);
      setIsLoading(false);
      return undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]); 

  const addPlant = useCallback(async (plantData: NewPlantData) => {
    setIsLoading(true);
    setError(null); // Clear previous errors
    try {
      // plantData does not have id or qrCodeValue yet.
      const newPlantFromBackend = await apiAddPlant(plantData); // Send only NewPlantData

      if (newPlantFromBackend && newPlantFromBackend.id) {
        // O backend agora retorna a planta com qrCodeValue já definido como o ID.
        // Não precisamos mais definir manualmente aqui.
        setPlants(prev => [...prev, newPlantFromBackend]);
        setIsLoading(false);
        return newPlantFromBackend;
      }
      // If newPlantFromBackend or newPlantFromBackend.id is missing,
      // it implies an issue with the backend response or data integrity.
      // The error thrown by apiAddPlant (and processed by fetchWithAuth) should be descriptive.
      // If apiAddPlant somehow didn't throw an error but returned an invalid plant,
      // we might still want a generic error here, but the goal is to rely on service errors.
      // For now, we assume apiAddPlant will throw if the response isn't as expected.
    } catch (e) {
      console.error("[PlantContext] Error in addPlant:", e);
      // Ensure the error message from the service layer (via fetchWithAuth) is used.
      setError(e instanceof Error ? e.message : 'Ocorreu uma falha desconhecida ao adicionar a planta.');
      setIsLoading(false);
      return undefined;
    }
  }, []);

  const updatePlantDetails = useCallback(async (plantId: string, updates: Partial<Plant>) => {
    setIsLoading(true);
    try {
      const updatedPlant = await apiUpdatePlant(plantId, updates);
      setPlants(prev => prev.map(p => p.id === plantId ? updatedPlant : p));
      setIsLoading(false);
      return updatedPlant;
    } catch (e) {
      setError(`Falha ao atualizar planta ${plantId}.`);
      setIsLoading(false);
      return undefined;
    }
  }, []);

  const getDiaryEntries = useCallback((plantId: string) => {
    return diaryEntries[plantId] || [];
  }, [diaryEntries]);

  const deletePlant = useCallback(async (plantId: string) => {
    setIsLoading(true);
    try {
      await apiDeletePlant(plantId);
      setPlants(prev => prev.filter(p => p.id !== plantId));
      setIsLoading(false);
      return true;
    } catch (e) {
      setError(`Falha ao excluir planta ${plantId}.`);
      setIsLoading(false);
      return false;
    }
  }, []);

  const fetchDiaryEntries = useCallback(async (plantId: string) => {
    setIsLoading(true);
    try {
      const entries = await apiGetDiaryEntriesByPlantId(plantId);
      setDiaryEntries(prev => ({ ...prev, [plantId]: entries }));
      setIsLoading(false);
      return entries;
    } catch (e) {
      setError(`Falha ao carregar entradas do diário para planta ${plantId}.`);
      setIsLoading(false);
      return [];
    }
  }, []);
  
  const addNewDiaryEntry = useCallback(async (plantId: string, entryData: NewDiaryEntryData) => {
    setIsLoading(true);
    try {
      // Adiciona os campos obrigatórios que o backend espera
      const author = (typeof window !== 'undefined' && window.localStorage) ? (localStorage.getItem('userName') || 'Usuário') : 'Usuário';
      // Converte NewPhoto[] para Photo[] com id e uploadedAt
      const photos = entryData.photos.map((photo) => ({
        ...photo,
        id: Date.now().toString() + Math.random().toString(36).substring(2, 8),
        uploadedAt: new Date().toISOString(),
      }));
      const entryToSend = { ...entryData, plantId, author, photos };
      const newEntry = await apiAddDiaryEntry(plantId, entryToSend);
      setDiaryEntries(prev => ({
        ...prev,
        [plantId]: [newEntry, ...(prev[plantId] || [])],
      }));
      
      const plantToUpdate = plants.find(p => p.id === plantId);
      if (plantToUpdate) {
        const updatedPlantFields: Partial<Plant> = {};
        if (typeof entryData.ph !== 'undefined') updatedPlantFields.latestPh = entryData.ph;
        if (typeof entryData.ec !== 'undefined') updatedPlantFields.latestEc = entryData.ec;
        if (typeof entryData.heightCm !== 'undefined') updatedPlantFields.heightCm = entryData.heightCm;
        if (entryData.stage) updatedPlantFields.currentStage = entryData.stage;
        
        if (Object.keys(updatedPlantFields).length > 0) {
           setPlants(prevPlants => prevPlants.map(p => p.id === plantId ? {...p, ...updatedPlantFields} : p));
        }
      }

      setIsLoading(false);
      return newEntry;
    } catch (e) {
      setError('Falha ao adicionar entrada no diário.');
      setIsLoading(false);
      return undefined;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plants]); 


  return (
    <PlantContext.Provider value={{
      plants, isLoading, error, getPlantById, addPlant, updatePlantDetails,
      deletePlant,
      getDiaryEntries, addNewDiaryEntry, fetchPlantById, fetchDiaryEntries, refreshPlants
    }}>
      {children}
    </PlantContext.Provider>
  );
};

export const usePlantContext = () => {
  const context = useContext(PlantContext);
  if (context === undefined) {
    throw new Error('usePlantContext must be used within a PlantProvider');
  }
  return context;
};