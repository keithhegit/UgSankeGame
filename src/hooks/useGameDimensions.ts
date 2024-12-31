import { useState, useEffect } from 'react';
import { calculateGameDimensions } from '../config/constants';

export const useGameDimensions = () => {
  const [dimensions, setDimensions] = useState(calculateGameDimensions());

  useEffect(() => {
    const handleResize = () => {
      setDimensions(calculateGameDimensions());
    };

    handleResize(); // Initial calculation
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return dimensions;
};