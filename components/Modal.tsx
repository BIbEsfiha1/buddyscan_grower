import React, { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'sm' }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      scroll="paper"
    >
      {title && (
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', pr: 5 }}>
          {title}
          <IconButton
            onClick={onClose}
            sx={{ ml: 'auto' }}
            size="small"
            aria-label="Fechar modal"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
};

export default Modal;