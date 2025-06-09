import React, { useState, useEffect, useRef } from 'react';
import Loader from "./Loader";

interface Strain {
  id: string;
  name: string;
  race?: string;
  effects?: string[];
  flavors?: string[];
}

interface StrainAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  required?: boolean;
}

const inputStyle = "w-full px-3 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";
const labelStyle = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

const fetchStrains = async (query: string): Promise<Strain[]> => {
  if (!query || query.length < 2) return [];
  const res = await fetch(`/.netlify/functions/getStrains?query=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  return await res.json();
};

const addStrain = async (name: string): Promise<Strain | null> => {
  const res = await fetch('/.netlify/functions/addStrain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) return null;
  return await res.json();
};

const StrainAutocomplete: React.FC<StrainAutocompleteProps> = ({ value, onChange, label = 'Strain', placeholder = 'Ex: Blue Dream', required }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [options, setOptions] = useState<Strain[]>([]);
  const [showOptions, setShowOptions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      setNotFound(false);
      return;
    }
    setLoading(true);
    setNotFound(false);
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const strains = await fetchStrains(inputValue);
      setOptions(strains);
      setNotFound(strains.length === 0);
      setLoading(false);
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [inputValue]);

  const handleSelect = (option: Strain) => {
    setInputValue(option.name);
    onChange(option.name);
    setShowOptions(false);
  };

  const handleAdd = async () => {
    setLoading(true);
    const newStrain = await addStrain(inputValue);
    setLoading(false);
    if (newStrain) {
      setOptions([newStrain]);
      setInputValue(newStrain.name);
      onChange(newStrain.name);
      setShowOptions(false);
      setNotFound(false);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label htmlFor="strain-autocomplete" className={labelStyle}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        id="strain-autocomplete"
        type="text"
        className={inputStyle}
        placeholder={placeholder}
        value={inputValue}
        autoComplete="off"
        required={required}
        onChange={e => {
          setInputValue(e.target.value);
          onChange(e.target.value);
          setShowOptions(true);
        }}
        onFocus={() => setShowOptions(true)}
        onBlur={() => setTimeout(() => setShowOptions(false), 150)}
      />
      {showOptions && (inputValue.length >= 2) && (
        <div className="absolute z-20 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded shadow max-h-56 overflow-auto">
          {loading && (
            <div className="p-2 text-center"><Loader size="sm" /></div>
          )}
          {!loading && options.map(option => (
            <div
              key={option.id}
              className="p-2 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900"
              onMouseDown={() => handleSelect(option)}
            >
              {option.name} {option.race && <span className="text-xs text-gray-500 ml-2">({option.race})</span>}
            </div>
          ))}
          {!loading && notFound && (
            <div className="p-2 text-gray-700 dark:text-gray-300 flex flex-col gap-2">
              <span>Nenhuma strain encontrada.</span>
              <button
                type="button"
                className="bg-green-500 hover:bg-green-600 text-white rounded px-3 py-1 mt-1"
                onMouseDown={handleAdd}
              >
                Adicionar "{inputValue}"
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StrainAutocomplete;
