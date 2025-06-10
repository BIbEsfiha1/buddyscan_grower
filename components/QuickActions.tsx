import React from 'react';
import { useTranslation } from 'react-i18next';
import { MdAdd, MdQrCodeScanner, MdLocalFlorist, MdBarChart, MdEdit } from 'react-icons/md';

interface QuickActionProps {
  title: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
  onClick: () => void;
}

const QuickAction: React.FC<QuickActionProps> = ({ title, icon, color, onClick }) => {
  const colorMap = {
    green: 'from-emerald-500 to-green-600',
    blue: 'from-blue-500 to-blue-700',
    yellow: 'from-yellow-400 to-amber-500',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-violet-600'
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gradient-to-br ${colorMap[color]} text-white w-16 h-16 md:w-20 md:h-20 rounded-full flex flex-col items-center justify-center shadow-md hover:shadow-xl transition-transform hover:scale-110`}
    >
      <div className="text-xl md:text-2xl mb-1">{icon}</div>
      <span className="text-[10px] md:text-xs font-medium leading-none">{title}</span>
    </button>
  );
};

interface QuickActionsProps {
  onAddPlant: () => void;
  onScanQR: () => void;
  onOpenCultivos: () => void;
  onOpenStats: () => void;
  onRegisterDiary: () => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({
  onAddPlant,
  onScanQR,
  onOpenCultivos,
  onOpenStats,
  onRegisterDiary
}) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-6 justify-items-center max-w-md mx-auto">
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
      <QuickAction
        title={t('dashboard.register_diary')}
        icon={<MdEdit size={32} />}
        color="red"
        onClick={onRegisterDiary}
      />
    </div>
  );
};

export default QuickActions;
