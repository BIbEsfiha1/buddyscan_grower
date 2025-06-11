import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import PlantaForm from './PlantaForm';
import { usePlantContext } from '../contexts/PlantContext';
import { PlantStage, PlantHealthStatus, PlantOperationalStatus, NewPlantData, Plant } from '../types';

interface AddPlantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (plant: Plant) => void;
}

/**
 * Modal utilizado para adicionar rapidamente uma nova planta no Dashboard.
 * Envolve o componente `PlantaForm` e lida com a validação e a submissão.
 */
const AddPlantModal: React.FC<AddPlantModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const { addPlant } = usePlantContext();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (values: { name: string; strain: string; birthDate: string; substrate: string }) => {
    setError(null);
    setSaving(true);
    const newPlant: NewPlantData = {
      ...values,
      currentStage: PlantStage.SEEDLING,
      healthStatus: PlantHealthStatus.HEALTHY,
      operationalStatus: PlantOperationalStatus.ACTIVE,
    };
    try {
      const added = await addPlant(newPlant);
      if (added) {
        onSubmit(added);
        onClose();
      } else {
        setError(t('dashboard.error_loading_plants'));
      }
    } catch (e: any) {
      setError(e?.message || 'Erro inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('dashboard.add_modal_title')} maxWidth="sm">
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <PlantaForm onSubmit={handleFormSubmit} loading={saving} />
    </Modal>
  );
};

export default AddPlantModal;
