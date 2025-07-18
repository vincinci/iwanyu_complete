import React from 'react';

const IwanyuLogo = ({ className = "w-10 h-10", textClassName = "text-xl", showText = true }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Orange shopping bag logo */}
      <div className={`${className} flex items-center justify-center`}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          fill="none"
        >
          {/* Shopping bag outline */}
          <path 
            d="M20 35 H80 L75 85 Q75 90 70 90 H30 Q25 90 25 85 L20 35 Z" 
            fill="#F97316" 
            stroke="#F97316" 
            strokeWidth="2"
          />
          {/* Handle left */}
          <path 
            d="M35 35 Q35 25 35 20 Q35 15 40 15 Q45 15 45 20 Q45 25 45 35" 
            fill="none" 
            stroke="#F97316" 
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Handle right */}
          <path 
            d="M55 35 Q55 25 55 20 Q55 15 60 15 Q65 15 65 20 Q65 25 65 35" 
            fill="none" 
            stroke="#F97316" 
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Bag bottom accent */}
          <rect x="25" y="45" width="50" height="2" fill="#EA580C" rx="1"/>
        </svg>
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textClassName}`}>
          IWANYU
        </span>
      )}
    </div>
  );
};

export default IwanyuLogo;
