import React from 'react';
import Modal from '../Modal';
import Button from '../Button';

interface MassActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  massNotes: string;
  setMassNotes: (v: string) => void;
  massWateringVolume: string;
  setMassWateringVolume: (v: string) => void;
  massWateringType: string;
  setMassWateringType: (v: string) => void;
  massFertilizationType: string;
  setMassFertilizationType: (v: string) => void;
  massFertilizationConcentration: string;
  setMassFertilizationConcentration: (v: string) => void;
  massPhotoperiod: string;
  setMassPhotoperiod: (v: string) => void;
  massSprayProduct: string;
  setMassSprayProduct: (v: string) => void;
  massSprayAmount: string;
  setMassSprayAmount: (v: string) => void;
}

const MassActionModal: React.FC<MassActionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  massNotes,
  setMassNotes,
  massWateringVolume,
  setMassWateringVolume,
  massWateringType,
  setMassWateringType,
  massFertilizationType,
  setMassFertilizationType,
  massFertilizationConcentration,
  setMassFertilizationConcentration,
  massPhotoperiod,
  setMassPhotoperiod,
  massSprayProduct,
  setMassSprayProduct,
  massSprayAmount,
  setMassSprayAmount,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Registro em Massa" maxWidth="sm">
    <div className="flex flex-col gap-3 p-2">
      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Volume de Rega (L)"
        value={massWateringVolume}
        onChange={e => setMassWateringVolume(e.target.value)}
      />
      <input
        type="text"
        className="p-2 border rounded"
        placeholder="Tipo de Água/Solução"
        value={massWateringType}
        onChange={e => setMassWateringType(e.target.value)}
      />
      <input
        type="text"
        className="p-2 border rounded"
        placeholder="Tipo de Fertilizante"
        value={massFertilizationType}
        onChange={e => setMassFertilizationType(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Concentração do Fertilizante"
        value={massFertilizationConcentration}
        onChange={e => setMassFertilizationConcentration(e.target.value)}
      />
      <input
        type="text"
        className="p-2 border rounded"
        placeholder="Fotoperíodo (ex: 12/12)"
        value={massPhotoperiod}
        onChange={e => setMassPhotoperiod(e.target.value)}
      />
      <input
        type="text"
        className="p-2 border rounded"
        placeholder="Produto de Pulverização"
        value={massSprayProduct}
        onChange={e => setMassSprayProduct(e.target.value)}
      />
      <input
        type="number"
        className="p-2 border rounded"
        placeholder="Quantidade Pulverizada"
        value={massSprayAmount}
        onChange={e => setMassSprayAmount(e.target.value)}
      />
      <textarea
        className="p-2 border rounded"
        placeholder="Notas"
        value={massNotes}
        onChange={e => setMassNotes(e.target.value)}
      />
      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!massNotes && !massWateringVolume && !massFertilizationType && !massPhotoperiod && !massSprayProduct}
        >
          Salvar
        </Button>
      </div>
    </div>
  </Modal>
);

export default MassActionModal;
