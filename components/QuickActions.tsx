import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdQrCodeScanner, MdLocalFlorist, MdBarChart } from 'react-icons/md';

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onClick }) => {
  const colorMap = {
    green: 'bg-emerald-600 hover:bg-emerald-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    red: 'bg-red-600 hover:bg-red-700',
    purple: 'bg-purple-600 hover:bg-purple-700'
  };

  return (
    <button
      onClick={onClick}
      className={`${colorMap[color]} text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105 w-full h-full`}
    >
      <div className="text-3xl">{icon}</div>
      <span className="text-sm font-medium">{title}</span>
    </button>
  );
};

interface QuickActionsProps {
  onAddPlant: () => void;
  onScanQR: () => void;
  onOpenCultivos: () => void;
  onOpenStats: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddPlant,
  onScanQR,
  onOpenCultivos,
  onOpenStats
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <QuickAction
        title={t('header.add_plant')}
        icon={<MdAdd size={32} />}
        color="green"
        onClick={onAddPlant}
      />
      <QuickAction
        title={t('sidebar.scanner')}
        icon={<MdQrCodeScanner size={32} />}
        color="purple"
        onClick={onScanQR}
      />
      <QuickAction
        title={t('sidebar.cultivos')}
        icon={<MdLocalFlorist size={32} />}
        color="blue"
        onClick={onOpenCultivos}
      />
      <QuickAction
        title={t('sidebar.statistics')}
        icon={<MdBarChart size={32} />}
        color="yellow"
        onClick={onOpenStats}
      />
    </div>
  );
};

export default QuickActions;
