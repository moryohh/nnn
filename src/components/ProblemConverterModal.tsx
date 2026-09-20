import React, { useState } from 'react';
import { X, Sparkles, BookOpen, Wand2, Loader2, AlertCircle, CheckCircle2, FolderUp } from 'lucide-react';
import { ProblemJSON } from '../types';
import { sampleProblems } from '../data/problems';

interface ProblemConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProblem: (problem: ProblemJSON) => void;
  onOpenJsonUpload?: () => void;
}

export const ProblemConverterModal: React.FC<ProblemConverterModalProps> = ({
  isOpen,
  onClose,
  onSelectProblem,
  onOpenJsonUpload,
}) => {
  const [problemText, setProblemText] = useState('');
  const [subject, setSubject] = useState<'كيمياء' | 'فيزياء' | 'رياضيات'>('كيمياء');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConvertWithAI = async () => {
    if (!problemText.trim()) {
      setErrorMsg('يرجى إدخال نص المسألة العلمية أولاً.');
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/convert-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemText: problemText.trim(),
          subject: subject,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل تحويل المسألة بواسطة الذكاء الاصطناعي.');
      }

      if (!data.steps || !Array.isArray(data.steps)) {
        throw new Error('الـ JSON الناتج غير متوافق مع الهيكل المطلوب.');
      }

      onSelectProblem(data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="converter-modal-backdrop"
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl"
    >
      <div
        id="converter-card"
        className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-150"
      >
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">
                تحويل المسائل لمنهج السادس الإعدادي إلى JSON
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                محرك التوليد الآلي والتعلم المصغر (Microlearning)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto pr-1 space-y-5">
          {/* Quick Select Preset Curriculum Problems */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-red-600" />
                نماذج وزارية معتمدة جاهزة للتشغيل الفوري:
              </h4>

              {onOpenJsonUpload && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenJsonUpload();
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[11px] font-black transition active:scale-95 shadow-2xs"
                >
                  <FolderUp className="w-3.5 h-3.5 text-amber-600" />
                  <span>إضافة ملف أو مجلد JSON</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sampleProblems.map((p) => (
                <button
                  key={p.problem_id}
                  onClick={() => {
                    onSelectProblem(p);
                    onClose();
                  }}
                  className="p-3 text-right bg-slate-50 hover:bg-red-50 hover:border-red-300 border border-slate-200 rounded-xl transition text-xs font-bold group shadow-2xs"
                >
                  <div className="text-[10px] text-red-700 font-black mb-1 flex items-center justify-between">
                    <span>{p.category}</span>
                    <CheckCircle2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-red-600 transition" />
                  </div>
                  <div className="text-slate-800 line-clamp-2 leading-relaxed">{p.title}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="relative border-t border-slate-200 pt-4">
            <h4 className="text-xs font-black text-slate-700 mb-2 flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-red-600" />
              أو أدخل أي مسألة لتحويلها تلقائياً [أدخل المسألة هنا]:
            </h4>

            {errorMsg && (
              <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold text-slate-600">المادة:</span>
              {(['كيمياء', 'فيزياء', 'رياضيات'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setSubject(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${subject === s ? 'bg-red-600 text-white font-black shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {s}
                </button>
              ))}
            </div>

            <textarea
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              placeholder="مثال: احسب كتلة هيدروكسيد الصوديوم اللازمة لتحضير محلول بتركيز 0.5 مولاري وبحجم 250 مل في حامض الكبريتيك..."
              className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 min-h-[110px] leading-relaxed resize-none"
            />

            <div className="flex items-center justify-between mt-3">
              <span className="text-[11px] text-slate-400 font-bold">
                يقوم الذكاء الاصطناعي ببناء الخارطة الذهنية، التلميحات، والخيارات المموهة الأربعة.
              </span>
              <button
                onClick={handleConvertWithAI}
                disabled={isLoading}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl text-xs font-black flex items-center gap-2 transition active:scale-95 shadow-sm"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحويل والهندسة...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>تحويل المسألة إلى JSON</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
