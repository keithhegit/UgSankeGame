import React from 'react';
import snakeLogo from '../assets/snake-logo.png';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 200 }) => {
  return (
    <img
      src={snakeLogo}
      alt="Ug Snake Game Logo"
      className={`w-auto h-auto ${className}`}
      style={{ 
        width: size,
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
}; 