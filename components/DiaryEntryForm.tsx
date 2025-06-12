import React, { useState, ChangeEvent, FormEvent, useEffect, useRef } from 'react';
import { DiaryEntry, PlantStage, NewPhoto, NewDiaryEntryData } from '../types';
import { PLANT_STAGES_OPTIONS, DEFAULT_AI_PROMPT } from '../constants';
import ImageUpload from './ImageUpload';
import useAIDiagnosis from '../hooks/useAIDiagnosis';
import Loader from './Loader';
import Button from './Button';
import netlifyIdentity from 'netlify-identity-widget';
import { updateDiaryEntry, getDiaryEntries } from '../services/plantService';
import { useParams } from 'react-router-dom';
import mergeAIDiagnoses from '../utils/mergeAIDiagnoses';

interface DiaryEntryFormProps {
  plantCurrentStage: PlantStage;
  onSubmit: (data: NewDiaryEntryData) => Promise<DiaryEntry | undefined>;
  isLoading: boolean;
  initialData?: Partial<DiaryEntry>; // For editing
}

const DiaryEntryForm: React.FC<DiaryEntryFormProps> = ({ plantCurrentStage, onSubmit, isLoading, initialData }) => {
  const { plantId } = useParams<{ plantId: string }>();
  const { diagnose, isAnyDiagnosing } = useAIDiagnosis();
  const [formData, setFormData] = useState<Partial<Omit<DiaryEntry, 'id' | 'plantId' | 'timestamp' | 'author' | 'photos'>>>({
    stage: initialData?.stage || plantCurrentStage,
    notes: initialData?.notes || '',
    heightCm: initialData?.heightCm || undefined,
    ec: initialData?.ec || undefined,
    ph: initialData?.ph || undefined,
    temperature: initialData?.temperature || undefined,
    humidity: initialData?.humidity || undefined,
    wateringVolume: initialData?.wateringVolume || undefined,
    wateringType: initialData?.wateringType || '',
    fertilizationType: initialData?.fertilizationType || '',
    fertilizationConcentration: initialData?.fertilizationConcentration || undefined,
    photoperiod: initialData?.photoperiod || '',
    sprayProduct: initialData?.sprayProduct || '',
    sprayAmount: initialData?.sprayAmount || undefined,
    symptoms: initialData?.symptoms || '',
    actionsTaken: initialData?.actionsTaken || '',
    aiOverallDiagnosis: initialData?.aiOverallDiagnosis || '',
  });
  const [uploadedPhotos, setUploadedPhotos] = useState<NewPhoto[]>(
    initialData?.photos
      ? initialData.photos.map(p => ({
          urlOriginal: p.urlOriginal,
          urlThumb: p.urlThumb,
          caption: p.caption,
          aiSummary: p.aiSummary,
          aiRawJson: p.aiRawJson,
        }))
      : []
  );
  const [diagnosisError, setDiagnosisError] = useState<string | null>(null);
  const [aiPendingCount, setAiPendingCount] = useState(0);
  const [savedEntryId, setSavedEntryId] = useState<string | null>(initialData?.id || null);
  const uploadedPhotosRef = useRef<NewPhoto[]>(uploadedPhotos);

  useEffect(() => {
    uploadedPhotosRef.current = uploadedPhotos;
  }, [uploadedPhotos]);

  useEffect(() => {
    if (!savedEntryId || !plantId || aiPendingCount === 0) return;
    const interval = setInterval(async () => {
      try {
        const entries = await getDiaryEntries(plantId);
        const entry = entries.find(e => e.id === savedEntryId);
        if (entry) {
          const photos = entry.photos.map(p => ({
            urlOriginal: p.urlOriginal,
            urlThumb: p.urlThumb,
            caption: p.caption,
            aiSummary: p.aiSummary,
            aiRawJson: p.aiRawJson,
          }));
          setUploadedPhotos(photos);
          const overall = mergeAIDiagnoses(photos.map(p => p.aiSummary));
          setFormData(prev => ({ ...prev, aiOverallDiagnosis: overall }));
          const remaining = photos.filter(p => p.aiSummary === 'Analisando...' || !p.aiSummary).length;
          setAiPendingCount(remaining);
          if (remaining === 0) {
            clearInterval(interval);
          }
        }
      } catch (err) {
        console.error('Erro ao obter diagnóstico atualizado', err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [savedEntryId, plantId, aiPendingCount]);

  useEffect(() => {
    if (!initialData && !formData.notes && !formData.heightCm) { 
        setFormData(prev => ({...prev, stage: plantCurrentStage}));
    }
  }, [plantCurrentStage, initialData, formData.notes, formData.heightCm]);


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const uploadImage = async (file: File, base64: string) => {
    const user = netlifyIdentity.currentUser();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = user?.token?.access_token;
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch('/.netlify/functions/uploadPhoto', {
      method: 'POST',
      headers,
      body: JSON.stringify({ fileName: file.name, base64, contentType: file.type }),
    });
    if (!res.ok) {
      throw new Error('Upload failed');
    }
    return res.json();
  };

  const handleImageUploaded = async (file: File, base64: string) => {
    setDiagnosisError(null);
    try {
      const uploaded = await uploadImage(file, base64);
      const newPhoto: NewPhoto = {
        urlOriginal: uploaded.urlOriginal,
        urlThumb: uploaded.urlThumb,
        caption: file.name,
        aiSummary: 'Analisando...',
        aiRawJson: '{}',
      };
      setUploadedPhotos(prev => [...prev, newPhoto]);
      setAiPendingCount(prev => prev + 1);

      const diagnosis = await diagnose(uploaded.urlOriginal, base64, DEFAULT_AI_PROMPT);
      const updatedPhotos = uploadedPhotosRef.current.map(p =>
        p.urlOriginal === uploaded.urlOriginal
          ? { ...p, aiSummary: diagnosis.summary, aiRawJson: diagnosis.rawJson }
          : p
      );
      setUploadedPhotos(updatedPhotos);
      const overall = mergeAIDiagnoses(updatedPhotos.map(p => p.aiSummary));
      setFormData(prev => ({ ...prev, aiOverallDiagnosis: overall }));
      if (savedEntryId && plantId) {
        try {
          await updateDiaryEntry(plantId, savedEntryId, {
            photos: updatedPhotos,
            aiOverallDiagnosis: overall,
          });
        } catch (err) {
          console.error('Erro ao anexar diagnóstico', err);
        }
      }
      setAiPendingCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error processing image:', error);
      setDiagnosisError('Falha ao processar imagem.');
      setAiPendingCount(prev => Math.max(0, prev - 1));
    }
  };
  
  const handleImageRemoved = (urlToRemove: string) => {
    const updated = uploadedPhotosRef.current.filter(p => p.urlOriginal !== urlToRemove);
    setUploadedPhotos(updated);
    const overall = mergeAIDiagnoses(updated.map(p => p.aiSummary));
    setFormData(prev => ({ ...prev, aiOverallDiagnosis: overall }));
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if(!formData.stage) { 
        alert("Por favor, selecione o estágio da planta.");
        return;
    }
    const dataToSubmit: NewDiaryEntryData = {
      stage: formData.stage,
      notes: formData.notes,
      heightCm: formData.heightCm,
      ec: formData.ec,
      ph: formData.ph,
      temperature: formData.temperature,
      humidity: formData.humidity,
      wateringVolume: formData.wateringVolume,
      wateringType: formData.wateringType,
      fertilizationType: formData.fertilizationType,
      fertilizationConcentration: formData.fertilizationConcentration,
      photoperiod: formData.photoperiod,
      sprayProduct: formData.sprayProduct,
      sprayAmount: formData.sprayAmount,
      symptoms: formData.symptoms,
      actionsTaken: formData.actionsTaken,
      aiOverallDiagnosis: formData.aiOverallDiagnosis,
      photos: uploadedPhotos,
    };
    const saved = await onSubmit(dataToSubmit);
    if (saved && saved.id) {
      setSavedEntryId(saved.id);
    }
  };

  const formFieldClass = "mt-1 block w-full px-3 py-2.5 bg-[#EAEAEA] dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-[#3E3E3E] dark:text-slate-100 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#7AC943] focus:border-[#7AC943] sm:text-sm disabled:bg-gray-200 dark:disabled:bg-slate-800 transition-colors placeholder:text-gray-400 dark:placeholder:text-gray-400";
  const labelClass = "block text-sm font-medium text-[#3E3E3E] dark:text-slate-200";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
        <div>
          <label htmlFor="stage" className={labelClass}>Estágio da Planta *</label>
          <select name="stage" id="stage" value={formData.stage || plantCurrentStage} onChange={handleChange} required className={formFieldClass}>
            {PLANT_STAGES_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="heightCm" className={labelClass}>Altura (cm)</label>
          <input type="number" name="heightCm" id="heightCm" value={formData.heightCm || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="ec" className={labelClass}>EC (Nutrientes)</label>
          <input type="number" name="ec" id="ec" value={formData.ec || ''} onChange={handleChange} step="0.01" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="ph" className={labelClass}>pH</label>
          <input type="number" name="ph" id="ph" value={formData.ph || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="temperature" className={labelClass}>Temperatura Ambiente (°C)</label>
          <input type="number" name="temperature" id="temperature" value={formData.temperature || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="humidity" className={labelClass}>Umidade Ambiente (%)</label>
          <input type="number" name="humidity" id="humidity" value={formData.humidity || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="wateringVolume" className={labelClass}>Rega (L)</label>
          <input type="number" name="wateringVolume" id="wateringVolume" value={formData.wateringVolume || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="wateringType" className={labelClass}>Tipo de Água</label>
          <input type="text" name="wateringType" id="wateringType" value={formData.wateringType || ''} onChange={handleChange} className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="fertilizationType" className={labelClass}>Fertilizante</label>
          <input type="text" name="fertilizationType" id="fertilizationType" value={formData.fertilizationType || ''} onChange={handleChange} className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="fertilizationConcentration" className={labelClass}>Concentração</label>
          <input type="number" name="fertilizationConcentration" id="fertilizationConcentration" value={formData.fertilizationConcentration || ''} onChange={handleChange} step="0.01" className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="photoperiod" className={labelClass}>Fotoperíodo</label>
          <input type="text" name="photoperiod" id="photoperiod" value={formData.photoperiod || ''} onChange={handleChange} className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="sprayProduct" className={labelClass}>Produto de Pulverização</label>
          <input type="text" name="sprayProduct" id="sprayProduct" value={formData.sprayProduct || ''} onChange={handleChange} className={formFieldClass} />
        </div>
        <div>
          <label htmlFor="sprayAmount" className={labelClass}>Quantidade Pulverizada (mL)</label>
          <input type="number" name="sprayAmount" id="sprayAmount" value={formData.sprayAmount || ''} onChange={handleChange} step="0.1" className={formFieldClass} />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>Notas / Observações</label>
        <textarea name="notes" id="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className={`${formFieldClass} min-h-[70px]`} />
      </div>
      <div>
        <label htmlFor="symptoms" className={labelClass}>Sintomas Observados</label>
        <textarea name="symptoms" id="symptoms" value={formData.symptoms || ''} onChange={handleChange} rows={2} className={`${formFieldClass} min-h-[60px]`} placeholder="Ex: Folhas amareladas, pontas queimadas..." />
      </div>
      <div>
        <label htmlFor="actionsTaken" className={labelClass}>Ações Realizadas</label>
        <textarea name="actionsTaken" id="actionsTaken" value={formData.actionsTaken || ''} onChange={handleChange} rows={2} className={`${formFieldClass} min-h-[60px]`} placeholder="Ex: Rega com pH ajustado, aplicação de neem..." />
      </div>
      
      <div className="space-y-3">
          <h3 className={labelClass}>Fotos do Registro</h3>
          <ImageUpload 
            onImageUploaded={handleImageUploaded}
            label="Adicionar Foto ao Registro"
          />
          {uploadedPhotos.length > 0 && (
            <div className="mt-4 space-y-4">
              <h4 className="text-xs font-medium text-gray-500 dark:text-slate-400">Fotos Adicionadas:</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="relative group border p-1.5 rounded-lg shadow-sm bg-slate-800 dark:bg-slate-700/50 border-slate-700 dark:border-slate-600">
                    <img src={photo.urlOriginal} alt={photo.caption || `Foto ${index + 1}`} className="w-full h-28 object-cover rounded-md" />
                    {photo.caption && <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5 truncate" title={photo.caption}>{photo.caption}</p>}
                    {photo.aiSummary && (
                        <p className={`text-xs mt-1 p-1.5 rounded ${ // Ensure dark mode takes precedence for background and text
                            photo.aiSummary === "Analisando..." || photo.aiSummary === "Erro na análise" 
                            ? "bg-yellow-700 text-yellow-100 dark:bg-yellow-700 dark:text-yellow-100" 
                            : "bg-sky-700 text-sky-100 dark:bg-sky-700 dark:text-sky-100"
                        }`}>
                            IA: {photo.aiSummary}
                        </p>
                    )}
                    <button 
                        type="button" 
                        onClick={() => handleImageRemoved(photo.urlOriginal)} 
                        className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 text-xs leading-none flex items-center justify-center w-5 h-5 transition-opacity"
                        aria-label="Remover foto"
                    >
                        X
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {isAnyDiagnosing && <Loader size="sm" message="Analisando imagem com IA..." />}
          {diagnosisError && <p className="text-xs text-red-500 dark:text-red-400">{diagnosisError}</p>}
      </div>
      
      <div>
        <label htmlFor="aiOverallDiagnosis" className={labelClass}>Diagnóstico Geral da IA (sugestão)</label>
        <textarea name="aiOverallDiagnosis" id="aiOverallDiagnosis" value={formData.aiOverallDiagnosis || ''} onChange={handleChange} rows={2} className={`${formFieldClass} min-h-[60px]`} placeholder="Resumo do diagnóstico da IA para esta entrada..."/>
      </div>

      <div className="flex flex-col items-end gap-2 pt-5 border-t border-gray-200 dark:border-slate-700">
        {aiPendingCount > 0 && (
          <p className="text-xs text-yellow-600 dark:text-yellow-400">
            IA em processamento, resultado será anexado depois
          </p>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          loading={isLoading}
          disabled={isLoading}
          className="min-w-[180px]"
        >
          {initialData ? 'Atualizar Registro' : 'Adicionar Registro'}
        </Button>
      </div>
    </form>
  );
};

export default DiaryEntryForm;