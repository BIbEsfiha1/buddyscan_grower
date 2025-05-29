import React, { useState } from 'react';
import { DiaryEntry, Photo } from '../types';
import { PLANT_STAGES_OPTIONS } from '../constants';
import { CameraIcon } from './icons/CameraIcon'; 
import ChevronDownIcon from './icons/ChevronDownIcon';
import ChevronUpIcon from './icons/ChevronUpIcon';
import XMarkIcon from './icons/XMarkIcon'; 


interface DiaryEntryItemProps {
  entry: DiaryEntry;
}

const PhotoThumbnail: React.FC<{ photo: Photo, onOpenModal: (photo: Photo) => void }> = ({ photo, onOpenModal }) => (
    <div 
        className="relative group cursor-pointer overflow-hidden rounded-lg"
        onClick={() => onOpenModal(photo)}
    >
        <img 
            src={photo.urlThumb || photo.urlOriginal} 
            alt={photo.caption || "Foto da planta"} 
            className="w-full h-36 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-110"
        />
        {photo.aiSummary && photo.aiSummary !== "Analisando..." && photo.aiSummary !== "Erro na análise" && (
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 dark:bg-opacity-70 text-white text-xs p-2 rounded-b-lg">
                <p className="truncate" title={photo.aiSummary}>IA: {photo.aiSummary}</p>
            </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 flex items-center justify-center transition-opacity duration-300">
            <CameraIcon className="w-10 h-10 text-white opacity-0 group-hover:opacity-90 transition-opacity duration-300" />
        </div>
    </div>
);

const DiaryEntryItem: React.FC<DiaryEntryItemProps> = ({ entry }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const stageLabel = PLANT_STAGES_OPTIONS.find(s => s.value === entry.stage)?.label || entry.stage;
  const entryDate = new Date(entry.timestamp);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const DetailItem: React.FC<{ label: string; value?: string | number | null; unit?: string; isNote?: boolean }> = ({ label, value, unit, isNote }) => {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    return (
      <div className={isNote ? "col-span-full" : ""}>
        <p className={`text-sm ${isNote ? 'text-slate-300 dark:text-slate-300' : 'text-slate-400 dark:text-slate-400'}`}>
          <strong className="font-medium text-slate-100 dark:text-slate-100">{label}:</strong>{' '}
          {isNote ? (
            <span className="block whitespace-pre-wrap bg-slate-700/50 dark:bg-slate-700/50 p-2.5 rounded-md mt-1 border border-slate-600 dark:border-slate-600">{value}{unit && ` ${unit}`}</span>
          ) : (
            <span>{value}{unit && ` ${unit}`}</span>
          )}
        </p>
      </div>
    );
  };

  return (
    <article className="bg-slate-800 dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-lg border border-slate-700 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-green-500/10 transition-shadow duration-200">
      <div className="flex justify-between items-start cursor-pointer" onClick={toggleExpand} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && toggleExpand()} aria-expanded={isExpanded}>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-400">
            {entryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })} às {entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          <h4 className="text-md font-semibold text-[#7AC943] mt-1">
            Registro no estágio: <span className="font-bold">{stageLabel}</span>
          </h4>
        </div>
        <button className="text-[#7AC943] hover:text-green-500 p-1" aria-label={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}>
          {isExpanded ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 pt-4 border-t border-slate-700 dark:border-slate-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
            <DetailItem label="Notas" value={entry.notes} isNote />
            <DetailItem label="Sintomas" value={entry.symptoms} isNote />
            <DetailItem label="Ações Realizadas" value={entry.actionsTaken} isNote />
          
            <DetailItem label="Altura" value={entry.heightCm} unit="cm" />
            <DetailItem label="EC" value={entry.ec} />
            <DetailItem label="pH" value={entry.ph} />
            <DetailItem label="Temp." value={entry.temperature} unit="°C" />
            <DetailItem label="Umidade" value={entry.humidity} unit="%" />
          </div>

          {entry.aiOverallDiagnosis && (
            <div className="mt-3 p-3 bg-sky-800/50 dark:bg-sky-800/50 border border-sky-700 dark:border-sky-700 rounded-lg">
                <p className="text-sm font-semibold text-sky-300 dark:text-sky-300">Diagnóstico Geral da IA (Registro):</p>
                <p className="text-xs text-sky-400 dark:text-sky-400 mt-0.5">{entry.aiOverallDiagnosis}</p>
            </div>
          )}

          {entry.photos && entry.photos.length > 0 && (
            <div className="mt-3">
              <h5 className="text-sm font-medium text-slate-100 dark:text-slate-100 mb-2">Fotos do Registro:</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {entry.photos.map(photo => (
                  <PhotoThumbnail key={photo.id} photo={photo} onOpenModal={setSelectedPhoto} />
                ))}
              </div>
            </div>
          )}
          <p className="text-xs text-slate-400 dark:text-slate-400 mt-3 pt-3 border-t border-slate-700 dark:border-slate-700">Autor: {entry.author}</p>
        </div>
      )}
      
      {selectedPhoto && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-80 backdrop-blur-md flex justify-center items-center z-[150] p-4 transition-opacity duration-300 ease-in-out" 
            onClick={() => setSelectedPhoto(null)}
        >
            <div 
                className="bg-slate-800 dark:bg-slate-800 p-4 sm:p-5 rounded-xl shadow-2xl max-w-xl w-full relative max-h-[90vh] flex flex-col transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow"
                onClick={(e) => e.stopPropagation()}
                style={{ animation: 'modalShow 0.3s ease-out forwards' }}
            >
                <img src={selectedPhoto.urlOriginal} alt={selectedPhoto.caption || "Foto da planta"} className="w-full h-auto max-h-[70vh] object-contain rounded-lg mb-3 shadow-md"/>
                {selectedPhoto.caption && <p className="text-sm text-slate-200 dark:text-slate-200 mb-1.5">{selectedPhoto.caption}</p>}
                {selectedPhoto.aiSummary && (
                    <div className="p-3 bg-indigo-800/50 dark:bg-indigo-800/50 border border-indigo-700 dark:border-indigo-700 rounded-lg text-xs text-indigo-300 dark:text-indigo-300">
                        <p className="font-semibold mb-0.5">Análise IA:</p>
                        <p>{selectedPhoto.aiSummary}</p>
                    </div>
                )}
                 <button
                    onClick={() => setSelectedPhoto(null)}
                    className="absolute top-3 right-3 bg-slate-700 dark:bg-slate-700 text-slate-300 dark:text-gray-300 p-2 rounded-full shadow-lg hover:bg-slate-600 dark:hover:bg-slate-600 hover:text-slate-100 dark:hover:text-gray-100 transition-all"
                    aria-label="Fechar imagem"
                >
                    <XMarkIcon className="w-5 h-5" />
                </button>
            </div>
             <style>{`
                @keyframes modalShow {
                  to {
                    opacity: 1;
                    transform: scale(1);
                  }
                }
                .animate-modalShow {
                  animation: modalShow 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards;
                }
            `}</style>
        </div>
      )}
    </article>
  );
};

export default DiaryEntryItem;
