import React from 'react';
import { X, Brain, Lightbulb, BookOpen, Link2 } from 'lucide-react';
import { ProblemStep, ProblemInput } from '../types';

interface ThinkHintModalProps {
  type: 'think' | 'hint' | null;
  step: ProblemStep | null;
  activeInput: ProblemInput | null;
  onClose: () => void;
}

export const ThinkHintModal: React.FC<ThinkHintModalProps> = ({
  type,
  step,
  activeInput,
  onClose,
}) => {
  if (!type) return null;

  return (
    <div
      id="think-hint-modal-backdrop"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl"
    >
      <div
        id="think-hint-card"
        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-150"
      >
        <button
          id="close-think-hint-btn"
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:text-slate-600 hover:bg-slate-200 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {type === 'think' && step && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                <Brain className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">فِكْر (الخارطة الذهنية للخطوة)</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">{step.title}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl text-sm font-bold text-amber-950 leading-relaxed">
                <div className="text-xs font-black text-amber-700 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  الهدف والخارطة الذهنية:
                </div>
                {step.explanation}
              </div>

              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl text-sm font-bold text-slate-800">
                <div className="text-xs font-black text-slate-500 mb-1 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-600" />
                  تذكير سريع بالقانون:
                </div>
                {step.think}
              </div>
            </div>
          </div>
        )}

        {type === 'hint' && activeInput && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
                <Lightbulb className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-black text-slate-900 text-base">تلميح ذكي للخانة الحالية</h3>
                <p className="text-xs text-slate-500 font-bold mt-0.5">يخص: {activeInput.label}</p>
              </div>
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200 p-4 rounded-xl text-sm font-bold text-indigo-950 leading-relaxed">
              {activeInput.specific_hint}
            </div>

            {activeInput.related_topics && activeInput.related_topics.length > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-black text-slate-500 mb-2 flex items-center gap-1.5">
                  <Link2 className="w-3.5 h-3.5 text-indigo-500" />
                  مواضيع تأسيسية ذات صلة للمراجعة:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {activeInput.related_topics.map((topic, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-indigo-800 border border-slate-200 shadow-2xs"
                    >
                      • {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 text-left">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
