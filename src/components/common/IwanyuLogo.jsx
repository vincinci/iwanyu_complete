import React from 'react';
import logoImage from '../../assets/iwanyu-logo.png';

const IwanyuLogo = ({ className = "w-10 h-10", textClassName = "text-xl", showText = false }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Iwanyu Logo Image */}
      <img 
        src={logoImage} 
        alt="Iwanyu Logo" 
        className={`${className} object-contain`}
      />
      {showText && (
        <span className={`font-bold text-gray-900 ${textClassName}`}>
          IWANYU
        </span>
      )}
    </div>
  );
};

export default IwanyuLogo;
