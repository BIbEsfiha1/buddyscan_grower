import React from 'react';

const PlantCardSkeleton: React.FC = () => {
  return (
    <div className="rounded-3xl shadow-xl bg-gray-800 border border-gray-700 animate-pulse overflow-hidden" style={{minHeight:320}}>
      <div className="h-48 w-full bg-gray-700" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-700 rounded w-1/3" />
      </div>
    </div>
  );
};

export default PlantCardSkeleton;
