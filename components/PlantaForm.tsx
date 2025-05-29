import React, { useState } from 'react';
import { PlantStage, PlantHealthStatus, PlantOperationalStatus } from '../types';
import StrainAutocomplete from './StrainAutocomplete';

interface PlantaFormProps {
  initialValues?: {
    name: string;
    strain: string;
    birthDate: string;
  };
  onSubmit: (values: { name: string; strain: string; birthDate: string }) => void;
  loading?: boolean;
}

const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function PlantaForm({ initialValues, onSubmit, loading }: PlantaFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [strain, setStrain] = useState(initialValues?.strain || '');
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, strain, birthDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="plantName" className={labelStyle}>
            Nome da Planta <span className="text-red-500">*</span>
          </label>
          <input
            id="plantName"
            type="text"
            className={inputStyle}
            placeholder="Ex: Planta #1"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <StrainAutocomplete
            value={strain}
            onChange={setStrain}
            required
          />
        </div>
        <div>
          <label htmlFor="birthDate" className={labelStyle}>
            Data de Nascimento <span className="text-red-500">*</span>
          </label>
          <input
            id="birthDate"
            type="date"
            className={inputStyle}
            value={birthDate}
            onChange={e => setBirthDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            required
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
          disabled={!name || !strain || !birthDate || loading}
        >
          Salvar Planta
        </button>
      </div>
    </form>
  );
}
