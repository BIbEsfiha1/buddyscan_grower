import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'yellow' | 'red' | 'purple';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, change, trend, icon, color }) => {
  const colorMap = {
    green: 'bg-emerald-900/30 text-emerald-400 border-emerald-500/50',
    blue: 'bg-blue-900/30 text-blue-400 border-blue-500/50',
    yellow: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/50',
    red: 'bg-red-900/30 text-red-400 border-red-500/50',
    purple: 'bg-purple-900/30 text-purple-400 border-purple-500/50'
  };

  const trendMap = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const iconBgColorMap = {
    green: 'bg-emerald-500/20 text-emerald-500',
    blue: 'bg-blue-500/20 text-blue-500',
    yellow: 'bg-yellow-500/20 text-yellow-500',
    red: 'bg-red-500/20 text-red-500',
    purple: 'bg-purple-500/20 text-purple-500'
  };

  return (
    <div className={`p-4 rounded-xl border ${colorMap[color]} bg-gray-800 shadow-lg transition-all hover:translate-y-[-2px]`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-400 text-sm font-medium mb-1">{title}</h3>
          <p className="text-2xl font-bold text-white">{value}</p>
          {change && (
            <div className={`text-xs mt-1 ${trend ? trendMap[trend] : ''}`}>
              {trend === 'up' && '▲ '}
              {trend === 'down' && '▼ '}
              {change}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-lg ${iconBgColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
