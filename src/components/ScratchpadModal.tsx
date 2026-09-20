import React, { useRef, useState, useEffect } from 'react';
import { PenTool, Trash2, X, RotateCcw } from 'lucide-react';

interface ScratchpadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScratchpadModal: React.FC<ScratchpadModalProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#dc2626'); // red by default matching theme
  const [penWidth, setPenWidth] = useState(3);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div
      id="scratchpad-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full p-4 shadow-2xl border border-slate-200 flex flex-col h-[75vh]">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shadow-xs">
              <PenTool className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-black text-slate-800">
              مسودة الحساب والخطوات اليدوية
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Color palette */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              {['#dc2626', '#2563eb', '#16a34a', '#1e293b'].map((c) => (
                <button
                  key={c}
                  onClick={() => setPenColor(c)}
                  className={`w-5 h-5 rounded-full border transition ${penColor === c ? 'scale-125 border-slate-800 ring-2 ring-offset-1 ring-slate-400' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`اختر لون القلم ${c}`}
                />
              ))}
            </div>

            <button
              id="clear-scratchpad-btn"
              onClick={handleClear}
              className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold border border-rose-200 flex items-center gap-1 transition active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              مسح المسودة
            </button>

            <button
              id="close-scratchpad-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl relative overflow-hidden">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            className="w-full h-full cursor-crosshair touch-none"
          />
        </div>
        <p className="text-[11px] text-slate-400 font-bold mt-2 text-center">
          استخدم المسودة لإجراء الحسابات الطويلة أو القسمة المطولة وتجربة الأرقام يدوياً.
        </p>
      </div>
    </div>
  );
};
