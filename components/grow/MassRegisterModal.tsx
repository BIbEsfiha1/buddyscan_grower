import React, { useState } from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { PlantStage } from '../../types';
import { addMassDiaryEntry } from '../../services/plantService';

interface MassRegisterModalProps {
  cultivoId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Stage applied to all diary entries */
  plantStage?: PlantStage;
  /** Called when registration succeeds */
  onSuccess?: () => void;
  /** Called with error message when registration fails */
  onError?: (message: string) => void;
}

const MassRegisterModal: React.FC<MassRegisterModalProps> = ({
  cultivoId,
  isOpen,
  onClose,
  plantStage = PlantStage.VEGETATIVE,
  onSuccess,
  onError,
}) => {
  const [notes, setNotes] = useState('');
  const [wateringVolume, setWateringVolume] = useState('');
  const [wateringType, setWateringType] = useState('');
  const [fertilizationType, setFertilizationType] = useState('');
  const [fertilizationConcentration, setFertilizationConcentration] = useState('');
  const [photoperiod, setPhotoperiod] = useState('');
  const [sprayProduct, setSprayProduct] = useState('');
  const [sprayAmount, setSprayAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const clearForm = () => {
    setNotes('');
    setWateringVolume('');
    setWateringType('');
    setFertilizationType('');
    setFertilizationConcentration('');
    setPhotoperiod('');
    setSprayProduct('');
    setSprayAmount('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await addMassDiaryEntry(cultivoId, {
        notes: notes || undefined,
        wateringVolume: wateringVolume ? Number(wateringVolume) : undefined,
        wateringType: wateringType || undefined,
        fertilizationType: fertilizationType || undefined,
        fertilizationConcentration: fertilizationConcentration ? Number(fertilizationConcentration) : undefined,
        photoperiod: photoperiod || undefined,
        sprayProduct: sprayProduct || undefined,
        sprayAmount: sprayAmount ? Number(sprayAmount) : undefined,
        stage: plantStage,
      });
      onSuccess?.();
      clearForm();
      onClose();
    } catch (e: any) {
      onError?.(e.message || 'Erro ao registrar ação em massa');
    } finally {
      setSaving(false);
    }
  };

  const isDisabled = !notes && !wateringVolume && !fertilizationType && !photoperiod && !sprayProduct;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registro em Massa" maxWidth="sm">
      <div className="flex flex-col gap-3 p-2">
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Volume de Rega (L)"
          value={wateringVolume}
          onChange={e => setWateringVolume(e.target.value)}
        />
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Tipo de Água/Solução"
          value={wateringType}
          onChange={e => setWateringType(e.target.value)}
        />
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Tipo de Fertilizante"
          value={fertilizationType}
          onChange={e => setFertilizationType(e.target.value)}
        />
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Concentração do Fertilizante"
          value={fertilizationConcentration}
          onChange={e => setFertilizationConcentration(e.target.value)}
        />
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Fotoperíodo (ex: 12/12)"
          value={photoperiod}
          onChange={e => setPhotoperiod(e.target.value)}
        />
        <input
          type="text"
          className="p-2 border rounded"
          placeholder="Produto de Pulverização"
          value={sprayProduct}
          onChange={e => setSprayProduct(e.target.value)}
        />
        <input
          type="number"
          className="p-2 border rounded"
          placeholder="Quantidade Pulverizada"
          value={sprayAmount}
          onChange={e => setSprayAmount(e.target.value)}
        />
        <textarea
          className="p-2 border rounded"
          placeholder="Notas"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
        <div className="flex gap-3 mt-2">
          <Button variant="secondary" onClick={() => { clearForm(); onClose(); }}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={isDisabled} loading={saving}>Salvar</Button>
        </div>
      </div>
    </Modal>
  );
};

export default MassRegisterModal;
