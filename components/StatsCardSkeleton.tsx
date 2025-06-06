import React from 'react';

const StatsCardSkeleton: React.FC = () => {
  return (
    <div className="p-4 rounded-xl border border-gray-700 bg-gray-800 shadow-lg animate-pulse">
      <div className="h-4 bg-gray-700 rounded w-1/3 mb-3" />
      <div className="h-8 bg-gray-700 rounded w-2/3" />
    </div>
  );
};

export default StatsCardSkeleton;
