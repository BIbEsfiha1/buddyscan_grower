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
    green: 'bg-gradient-to-br from-emerald-500 to-green-700 text-white',
    blue: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
    yellow: 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white',
    red: 'bg-gradient-to-br from-red-500 to-rose-600 text-white',
    purple: 'bg-gradient-to-br from-purple-500 to-violet-700 text-white'
  };

  const trendMap = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-gray-400'
  };

  const iconBgColorMap = {
    green: 'bg-emerald-600/90 text-white',
    blue: 'bg-blue-600/90 text-white',
    yellow: 'bg-yellow-500/90 text-white',
    red: 'bg-red-600/90 text-white',
    purple: 'bg-purple-600/90 text-white'
  };

  const [displayValue, setDisplayValue] = React.useState(
    typeof value === 'number' ? 0 : value
  );

  React.useEffect(() => {
    if (typeof value === 'number') {
      const start = performance.now();
      const duration = 600;
      const animate = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        setDisplayValue(Math.round(progress * value));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  return (
    <div
      className={`p-5 rounded-3xl ${colorMap[color]} shadow-md hover:shadow-xl transition-all hover:-translate-y-1`}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-gray-100 text-sm font-medium mb-1">{title}</h3>
          <p className="text-3xl font-semibold text-white leading-tight">{displayValue}</p>
          {change && (
            <div className={`text-xs mt-1 ${trend ? trendMap[trend] : ''}`}>
              {trend === 'up' && '▲ '}
              {trend === 'down' && '▼ '}
              {change}
            </div>
          )}
        </div>
        <div className={`p-2 rounded-full ${iconBgColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
