import React, { useState, useRef } from 'react';
import { X, Copy, Check, Download, Edit3, Eye, AlertCircle, FileUp } from 'lucide-react';
import { ProblemJSON } from '../types';

interface JsonModalProps {
  isOpen: boolean;
  problem: ProblemJSON;
  onClose: () => void;
  onApplyJson: (newProblem: ProblemJSON) => void;
}

export const JsonModal: React.FC<JsonModalProps> = ({
  isOpen,
  problem,
  onClose,
  onApplyJson,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'view' | 'edit'>('view');
  const [editText, setEditText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const jsonString = JSON.stringify(problem, null, 2);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!parsed.problem_id || !Array.isArray(parsed.steps)) {
          setJsonError('الملف غير مكتمل، يجب أن يحتوي على problem_id ومصفوفة steps.');
          setActiveTab('edit');
          setEditText(content);
          return;
        }
        if (!parsed.title) {
          parsed.title = `مسألة تفاعلية (${parsed.problem_id})`;
        }
        onApplyJson(parsed);
        onClose();
      } catch (err: any) {
        setJsonError(`خطأ في قراءة ملف الـ JSON: ${err.message}`);
        setActiveTab('edit');
      }
    };
    reader.readAsText(file);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${problem.problem_id || 'problem'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSwitchToEdit = () => {
    setEditText(jsonString);
    setJsonError(null);
    setActiveTab('edit');
  };

  const handleApplyCustomJson = () => {
    try {
      const parsed = JSON.parse(editText);
      if (!parsed.problem_id || !parsed.title || !Array.isArray(parsed.steps)) {
        setJsonError('ملف الـ JSON غير مكتمل، يجب أن يحتوي على problem_id و title ومصفوفة steps.');
        return;
      }
      onApplyJson(parsed);
      setActiveTab('view');
      onClose();
    } catch (e: any) {
      setJsonError(`خطأ في صياغة الـ JSON: ${e.message}`);
    }
  };

  return (
    <div
      id="json-modal-backdrop"
      className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 dir-rtl"
    >
      <div
        id="json-modal-card"
        className="bg-white rounded-2xl max-w-3xl w-full p-5 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] animate-in fade-in zoom-in duration-150"
      >
        <div className="flex items-center justify-between mb-3 border-b border-slate-200 pb-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center text-sm font-bold shadow-xs">
              {'{ }'}
            </span>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                ملف الـ JSON الدقيق للمسألة (Schema)
              </h3>
              <p className="text-xs text-slate-500 font-bold">
                متزامن خطوة بخطوة مع ورقة الحل والمنصة التفاعلية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('view')}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'view' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
              >
                <Eye className="w-3.5 h-3.5" />
                معاينة
              </button>
              <button
                onClick={handleSwitchToEdit}
                className={`px-3 py-1 rounded-lg flex items-center gap-1.5 transition ${activeTab === 'edit' ? 'bg-white shadow-xs text-slate-900 font-black' : 'text-slate-500'}`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                تعديل / لصق JSON
              </button>
            </div>

            <button
              id="close-json-modal-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'view' ? (
          <div className="flex-1 flex flex-col min-h-0">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2 rounded-t-xl text-xs font-mono text-slate-400 border-b border-slate-800">
              <span className="text-amber-400 font-bold">{problem.problem_id}.json</span>
              <div className="flex items-center gap-2">
                <button
                  id="upload-json-inner-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded text-xs flex items-center gap-1.5 transition active:scale-95"
                  title="رفع ملف JSON من جهازك"
                >
                  <FileUp className="w-3 h-3 text-amber-400" />
                  <span>رفع ملف</span>
                </button>
                <button
                  id="copy-json-btn"
                  onClick={handleCopy}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>نسخ الـ JSON</span>
                    </>
                  )}
                </button>
                <button
                  id="download-json-btn"
                  onClick={handleDownload}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs flex items-center gap-1.5 transition active:scale-95"
                >
                  <Download className="w-3 h-3" />
                  <span>تنزيل الملف</span>
                </button>
              </div>
            </div>

            <pre className="flex-1 bg-slate-950 text-emerald-400 p-4 rounded-b-xl overflow-auto text-xs font-mono dir-ltr select-text leading-relaxed border border-slate-800">
              <code>{jsonString}</code>
            </pre>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-h-0">
            <p className="text-xs text-slate-500 font-bold mb-2">
              يمكنك لصق أو تعديل كود الـ JSON هنا لاختباره فوراً على السبورة التفاعلية:
            </p>
            {jsonError && (
              <div className="p-2.5 mb-2 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{jsonError}</span>
              </div>
            )}
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="flex-1 w-full p-3.5 bg-slate-950 text-emerald-300 font-mono text-xs rounded-xl border border-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500 dir-ltr resize-none min-h-[250px]"
              placeholder="الصق كائن JSON هنا..."
              dir="ltr"
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                onClick={() => setActiveTab('view')}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleApplyCustomJson}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm transition active:scale-95"
              >
                تطبيق وتشغيل المسألة
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
          <span className="text-[11px] text-slate-400 font-bold">
            مطابق تماماً لمواصفات الهيكل الهندسي لمنصة التعلم المصغر Microlearning
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
