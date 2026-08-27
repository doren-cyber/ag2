import React from 'react';

interface ShijaLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'emblem' | 'full' | 'inline-header';
  alt?: string;
}

export const ShijaLogo: React.FC<ShijaLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  alt = 'Shija Hospitals & Research Institute Logo',
}) => {
  // Dimensions mapping based on size
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/shija-logo.svg"
          alt={alt}
          className={`${sizeClasses[size]} object-contain`}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  if (variant === 'inline-header') {
    return (
      <div className={`flex items-center space-x-3 shrink-0 ${className}`}>
        <img
          src="/shija-logo.svg"
          alt={alt}
          className="w-11 h-11 object-contain drop-shadow-2xs"
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Default emblem variant
  return (
    <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/shija-logo.svg"
        alt={alt}
        className={`${sizeClasses[size]} object-contain`}
        referrerPolicy="no-referrer"
      />
    </div>
  );
};
