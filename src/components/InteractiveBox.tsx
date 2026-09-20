import React from 'react';
import { MousePointer, Check } from 'lucide-react';

interface InteractiveBoxProps {
  id: string;
  value: string | undefined;
  isActive: boolean;
  isSolved: boolean;
  label?: string;
  onClick: () => void;
  className?: string;
}

export const InteractiveBox: React.FC<InteractiveBoxProps> = ({
  id,
  value,
  isActive,
  isSolved,
  onClick,
  className = '',
}) => {
  let statusClasses = 'border-2 border-red-500 bg-red-50/80 text-red-900 hover:bg-red-100 hover:border-red-600 hover:scale-105';

  if (isSolved) {
    statusClasses = 'border-2 border-emerald-500 bg-emerald-50 text-emerald-800 shadow-2xs';
  } else if (isActive) {
    statusClasses = 'border-3 border-red-600 bg-red-200 text-red-950 animate-pulse-red scale-105';
  }

  return (
    <button
      id={`box_${id}`}
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center min-w-[54px] h-[44px] px-2.5 mx-1 font-black text-lg md:text-xl rounded-xl transition-all select-none vertical-middle shadow-xs ${statusClasses} ${className}`}
      title={isSolved ? `مكتمل: ${value}` : 'انقر لإدخال الإجابة'}
      aria-label={`خانة إدخال ${id}`}
    >
      {isSolved ? (
        <span className="flex items-center gap-1">
          {value}
          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
        </span>
      ) : isActive ? (
        <span className="text-red-700 animate-bounce">
          <MousePointer className="w-4 h-4" />
        </span>
      ) : (
        <span className="opacity-0">00</span>
      )}
    </button>
  );
};
