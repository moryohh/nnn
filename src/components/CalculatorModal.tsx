import React, { useState } from 'react';
import { Calculator, X } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');

  if (!isOpen) return null;

  const handlePress = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      return;
    }
    if (display === '0' && val !== '.') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const handleEval = () => {
    try {
      // Safe sanitized arithmetic calculation
      const sanitized = display.replace(/[^0-9+\-*/().]/g, '');
      // eslint-disable-next-line no-new-func
      const result = Function(`'use strict'; return (${sanitized})`)();
      const formatted = typeof result === 'number' && !isNaN(result) ? String(Number(result.toFixed(6))) : 'خطأ';
      setDisplay(formatted);
    } catch {
      setDisplay('خطأ');
    }
  };

  return (
    <div
      id="calculator-modal"
      className="fixed bottom-6 left-6 z-50 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 w-72 dir-rtl select-none"
    >
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
          <Calculator className="w-4 h-4" />
          الآلة الحاسبة المساعدة
        </span>
        <button
          id="close-calculator-btn"
          onClick={onClose}
          className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
          aria-label="إغلاق الآلة الحاسبة"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono font-black text-right px-3 py-2 rounded-xl mb-3 text-lg overflow-x-auto dir-ltr">
        {display}
      </div>

      <div className="grid grid-cols-4 gap-1.5 text-xs font-black dir-ltr">
        <button
          onClick={() => handlePress('C')}
          className="py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition active:scale-95"
        >
          C
        </button>
        <button
          onClick={() => handlePress('(')}
          className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition active:scale-95"
        >
          (
        </button>
        <button
          onClick={() => handlePress(')')}
          className="py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition active:scale-95"
        >
          )
        </button>
        <button
          onClick={() => handlePress('/')}
          className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95 font-bold text-sm"
        >
          ÷
        </button>

        <button
          onClick={() => handlePress('7')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          7
        </button>
        <button
          onClick={() => handlePress('8')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          8
        </button>
        <button
          onClick={() => handlePress('9')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          9
        </button>
        <button
          onClick={() => handlePress('*')}
          className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95 font-bold text-sm"
        >
          ×
        </button>

        <button
          onClick={() => handlePress('4')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          4
        </button>
        <button
          onClick={() => handlePress('5')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          5
        </button>
        <button
          onClick={() => handlePress('6')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          6
        </button>
        <button
          onClick={() => handlePress('-')}
          className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95 font-bold text-sm"
        >
          -
        </button>

        <button
          onClick={() => handlePress('1')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          1
        </button>
        <button
          onClick={() => handlePress('2')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          2
        </button>
        <button
          onClick={() => handlePress('3')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          3
        </button>
        <button
          onClick={() => handlePress('+')}
          className="py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg transition active:scale-95 font-bold text-sm"
        >
          +
        </button>

        <button
          onClick={() => handlePress('0')}
          className="col-span-2 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95"
        >
          0
        </button>
        <button
          onClick={() => handlePress('.')}
          className="py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg transition active:scale-95 font-bold"
        >
          .
        </button>
        <button
          onClick={handleEval}
          className="py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition active:scale-95 font-bold text-sm"
        >
          =
        </button>
      </div>
    </div>
  );
};
