import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import { Grow } from '../../types';

interface MoveCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  grows: Grow[];
  currentGrowId?: string;
  selectedGrow: string;
  setSelectedGrow: (v: string) => void;
  onMove: () => void;
}

const MoveCultivoModal: React.FC<MoveCultivoModalProps> = ({
  isOpen,
  onClose,
  grows,
  currentGrowId,
  selectedGrow,
  setSelectedGrow,
  onMove,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Mover Plantio" maxWidth="sm">
    <div className="flex flex-col gap-3 p-2">
      <select
        value={selectedGrow}
        onChange={e => setSelectedGrow(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="">Selecione o destino</option>
        {grows
          .filter(g => g.id !== currentGrowId)
          .map(g => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
      </select>
      <div className="flex gap-3 mt-2">
        <Button variant="secondary" onClick={onClose}>Cancelar</Button>
        <Button variant="primary" onClick={onMove} disabled={!selectedGrow}>Mover</Button>
      </div>
    </div>
  </Modal>
);

export default MoveCultivoModal;
