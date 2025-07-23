import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

const SuspenseWrapper = ({ 
  children, 
  fallback = <LoadingSpinner message="Loading..." />,
  className = "" 
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};

export default SuspenseWrapper; 