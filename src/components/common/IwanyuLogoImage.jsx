import React from 'react';
import { ShoppingBag } from 'lucide-react';

const IwanyuLogoImage = ({ className = "w-10 h-10", textClassName = "text-xl", showText = true }) => {
  return (
    <div className="flex items-center space-x-3">
      {/* Clean Minimal Logo */}
      <div className={`${className} bg-orange-500 rounded-xl flex items-center justify-center shadow-sm`}>
        <ShoppingBag className="w-1/2 h-1/2 text-white" strokeWidth={2.5} />
      </div>
      {showText && (
        <span className={`font-bold text-gray-900 ${textClassName}`}>
          IWANYU
        </span>
      )}
    </div>
  );
};

export default IwanyuLogoImage;
