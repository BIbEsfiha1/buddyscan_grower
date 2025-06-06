import React, { useState, useEffect } from 'react';
import { PlantStage, PlantHealthStatus, PlantOperationalStatus } from '../types';
import StrainAutocomplete from './StrainAutocomplete';

import { SUBSTRATE_OPTIONS } from '../constants';

interface PlantaFormProps {
  initialValues?: {
    name: string;
    strain: string;
    birthDate: string;
    substrate?: string; // Adicionado
  };
  onSubmit: (values: { name: string; strain: string; birthDate: string; substrate: string }) => void; // Modificado
  loading?: boolean;
}

const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

export default function PlantaForm({ initialValues, onSubmit, loading }: PlantaFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [strain, setStrain] = useState(initialValues?.strain || '');
  const [birthDate, setBirthDate] = useState(initialValues?.birthDate || '');
  const [substrate, setSubstrate] = useState(''); // Para o valor do select
  const [otherSubstrate, setOtherSubstrate] = useState(''); // Para o input 'Outro'

  useEffect(() => {
    if (initialValues?.substrate) {
      const isPredefined = SUBSTRATE_OPTIONS.some(option => option.value === initialValues.substrate);
      if (isPredefined && initialValues.substrate !== 'Outro') {
        setSubstrate(initialValues.substrate);
        setOtherSubstrate(''); // Limpa caso estivesse preenchido antes
      } else {
        // Se for 'Outro' ou um valor customizado não listado (exceto string vazia)
        setSubstrate('Outro');
        setOtherSubstrate(initialValues.substrate === 'Outro' ? '' : initialValues.substrate || '');
      }
    } else {
      // Se não há initialValues.substrate, reseta para o padrão (vazio ou primeira opção)
       setSubstrate('');
       setOtherSubstrate('');
    }
  }, [initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let finalSubstrate = substrate;
    if (substrate === 'Outro') {
      finalSubstrate = otherSubstrate;
    }
    onSubmit({ name, strain, birthDate, substrate: finalSubstrate });
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
        <div>
          <label htmlFor="substrate" className={labelStyle}>
            Substrato / Solo
          </label>
          <select
            id="substrate"
            className={inputStyle}
            value={substrate}
            onChange={(e) => {
              setSubstrate(e.target.value);
              // Se mudar de 'Outro' para algo diferente, limpe otherSubstrate
              if (e.target.value !== 'Outro') {
                setOtherSubstrate('');
              }
            }}
            data-testid="substrate-select" // Adicionado
          >
            {SUBSTRATE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {substrate === 'Outro' && (
          <div>
            <label htmlFor="otherSubstrate" className={labelStyle}>
              Especifique o Substrato <span className="text-red-500">*</span>
            </label>
            <input
              id="otherSubstrate"
              type="text"
              className={inputStyle}
              placeholder="Ex: Terra vegetal com húmus"
              value={otherSubstrate}
              onChange={(e) => setOtherSubstrate(e.target.value)}
              required={substrate === 'Outro'} // Torna obrigatório se 'Outro' for selecionado
              data-testid="other-substrate-input" // Adicionado
            />
          </div>
        )}
      </div>
      <div className="mt-8 flex justify-center">
        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition"
          disabled={!name || !strain || !birthDate || (substrate === 'Outro' ? !otherSubstrate : substrate === '') || loading}
        >
          Salvar Planta
        </button>
      </div>
    </form>
  );
}
