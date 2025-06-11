import React from 'react';
import Modal from '../Modal';
import Button from '../Button';
import CheckCircleIcon from '../icons/CheckCircleIcon';

interface FinishCultivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  finishing: boolean;
}

const FinishCultivoModal: React.FC<FinishCultivoModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  finishing,
}) => (
  <Modal isOpen={isOpen} onClose={onClose} title="Finalizar Cultivo" maxWidth="md">
    <div className="flex flex-col items-center gap-4 p-2">
      <CheckCircleIcon className="w-16 h-16 text-green-500 mb-2" />
      <span className="text-lg font-bold text-green-800 dark:text-green-300 text-center">
        Tem certeza que deseja finalizar este cultivo?
      </span>
      <span className="text-gray-600 dark:text-gray-300 text-center">
        Todas as plantas ativas serão marcadas como colhidas e passarão para a fase de secagem.
      </span>
      <div className="flex w-full justify-between gap-3 mt-4">
        <Button variant="secondary" fullWidth onClick={onClose}>Cancelar</Button>
        <Button variant="primary" fullWidth loading={finishing} onClick={onConfirm}>
          Confirmar
        </Button>
      </div>
    </div>
  </Modal>
);

export default FinishCultivoModal;
