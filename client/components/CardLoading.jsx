import React from 'react';

const CardLoading = () => {
  return (
    <div className="w-full max-w-xs sm:max-w-sm border p-3 lg:p-4 grid gap-1 md:gap-2 lg:gap-2 rounded animate-pulse overflow-hidden">
      
      {/* Delivery time */}
      <div className="h-4 w-16 sm:w-24 bg-blue-50 rounded" />

      {/* Image placeholder */}
      <div className="w-full h-24 sm:h-28 bg-blue-50 rounded" />

      {/* Price and Unit Row */}
      <div className="flex items-center justify-between gap-3">
        <div className="h-4 w-16 sm:w-20 bg-blue-50 rounded" />
        <div className="h-4 w-16 sm:w-20 bg-blue-50 rounded" />
      </div>

      {/* Title placeholder */}
      <div className="h-4 w-full bg-blue-50 rounded" />

      {/* Unit placeholder */}
      <div className="h-4 w-full bg-blue-50 rounded" />
    </div>
  );
};

export default CardLoading;
