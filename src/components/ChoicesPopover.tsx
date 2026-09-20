import React, { useMemo } from 'react';
import { X, Calculator, HelpCircle } from 'lucide-react';
import { ProblemInput } from '../types';

interface ChoicesPopoverProps {
  isOpen: boolean;
  targetInput: ProblemInput | null;
  onClose: () => void;
  onSelect: (choice: string) => void;
  onOpenCalculator: () => void;
}

export const ChoicesPopover: React.FC<ChoicesPopoverProps> = ({
  isOpen,
  targetInput,
  onClose,
  onSelect,
  onOpenCalculator,
}) => {
  // Shuffle allowed keys consistently when targetInput changes
  const shuffledChoices = useMemo(() => {
    if (!targetInput?.allowed_keys) return [];
    return [...targetInput.allowed_keys].sort(() => 0.5 - Math.random());
  }, [targetInput?.id, targetInput?.allowed_keys]);

  if (!isOpen || !targetInput) return null;

  return (
    <div
      id="choices-popover-backdrop"
      className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl"
    >
      <div
        id="choices-card"
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-slate-100 transform transition-all relative animate-in fade-in zoom-in duration-150"
      >
        <button
          id="close-choices-btn"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition"
          aria-label="إغلاق قائمة الخيارات"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-6 pt-1">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center text-xl mx-auto mb-3 shadow-inner">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-800 mb-1">اختر الإجابة الصحيحة للخانة</h3>
          <p className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 py-1.5 px-3 rounded-lg inline-block">
            {targetInput.label}
          </p>
        </div>

        <div className="space-y-2.5 dir-ltr">
          {shuffledChoices.map((choice, index) => (
            <button
              key={`${targetInput.id}_choice_${index}`}
              id={`choice_btn_${index}`}
              onClick={() => onSelect(choice)}
              className="w-full py-3.5 px-4 bg-slate-50 hover:bg-red-50 hover:border-red-400 text-slate-800 hover:text-red-700 font-black rounded-xl text-lg border-2 border-slate-200 flex items-center justify-center transition active:scale-95 shadow-xs"
            >
              {choice}
            </button>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            id="choices-open-calc-btn"
            onClick={onOpenCalculator}
            className="text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 hover:bg-emerald-100 transition active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            افتح الحاسبة المساعدة
          </button>
          <span className="text-[11px] text-slate-400 font-bold">المحاولة الخاطئة تخصم قلباً</span>
        </div>
      </div>
    </div>
  );
};
