import React, { useState, useCallback, ChangeEvent, useEffect } from 'react';
import CameraIcon from './icons/CameraIcon'; 
import XMarkIcon from './icons/XMarkIcon'; 
import { MAX_IMAGE_SIZE_MB, ACCEPTED_IMAGE_TYPES } from '../constants';

interface ImageUploadProps {
  onImageUploaded: (file: File, base64: string) => void;
  label?: string;
  currentImageUrl?: string | null; 
  onImageRemoved?: () => void; 
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onImageUploaded, label = "Adicionar Foto", currentImageUrl, onImageRemoved }) => {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setError(`Tipo de arquivo inválido. Aceitos: ${ACCEPTED_IMAGE_TYPES.join(', ')}`);
        setPreview(null);
        if(onImageRemoved) onImageRemoved();
        return;
      }
      if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
        setError(`Arquivo muito grande. Máximo: ${MAX_IMAGE_SIZE_MB}MB`);
        setPreview(null);
        if(onImageRemoved) onImageRemoved();
        return;
      }

      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        onImageUploaded(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUploaded, onImageRemoved]);

  const handleRemoveImage = useCallback(() => {
    setPreview(null);
    setError(null);
    const input = document.getElementById('image-upload-input') as HTMLInputElement;
    if (input) input.value = ''; 
    if(onImageRemoved) onImageRemoved();
  }, [onImageRemoved]);

  useEffect(() => {
    if (currentImageUrl !== preview) {
      setPreview(currentImageUrl || null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentImageUrl]);


  return (
    <div className="space-y-2 w-full">
      {preview ? (
        <div className="relative group w-full aspect-video sm:aspect-square max-w-sm mx-auto bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden shadow-md">
          <img src={preview} alt="Preview da planta" className="w-full h-full object-cover" />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2.5 right-2.5 bg-black bg-opacity-60 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-opacity-80 focus:opacity-100"
            aria-label="Remover imagem"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="image-upload-input"
          className="flex flex-col items-center justify-center w-full h-48 sm:h-64 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl cursor-pointer bg-gray-50 dark:bg-slate-700/50 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors duration-150"
        >
          <CameraIcon className="w-12 h-12 text-gray-400 dark:text-slate-500 mb-2.5" />
          <span className="text-sm text-[#3E3E3E] dark:text-slate-300 font-medium">{label}</span>
          <span className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">Max {MAX_IMAGE_SIZE_MB}MB. JPG, PNG, WEBP</span>
          <input
            id="image-upload-input"
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUpload;