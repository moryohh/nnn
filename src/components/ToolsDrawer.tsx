import React from 'react';
import {
  Brain,
  Lightbulb,
  Wand2,
  Calculator,
  PenTool,
  Code,
  Sparkles,
  RotateCcw,
  ChevronLeft,
  FolderUp,
  ScanSearch,
  FileText,
} from 'lucide-react';

interface ToolsDrawerProps {
  onOpenThink: () => void;
  onOpenHint: () => void;
  onUseHelp: () => void;
  onOpenCalculator: () => void;
  onOpenScratchpad: () => void;
  onOpenJson: () => void;
  onOpenJsonUpload: () => void;
  onOpenConverter: () => void;
  onOpenVisionStudio: () => void;
  onOpenPdfBatch: () => void;
  onReset: () => void;
  isAllCompleted: boolean;
  apples: number;
}

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({
  onOpenThink,
  onOpenHint,
  onUseHelp,
  onOpenCalculator,
  onOpenScratchpad,
  onOpenJson,
  onOpenJsonUpload,
  onOpenConverter,
  onOpenVisionStudio,
  onOpenPdfBatch,
  onReset,
  isAllCompleted,
  apples,
}) => {
  return (
    <aside
      id="tools-drawer"
      className="w-full md:w-64 bg-white rounded-2xl border border-slate-200 p-4 flex flex-col gap-2.5 shadow-sm shrink-0 md:sticky md:top-28 h-fit z-20"
    >
      <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-slate-500 font-black text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-600" />
          <span>أدوات المساعدة والتوجيه</span>
        </div>
        <button
          onClick={onReset}
          className="text-slate-400 hover:text-slate-700 p-1 rounded-md hover:bg-slate-100 transition"
          title="إعادة المحاولة من البداية"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tool 1: Think (فكر) */}
      <button
        id="tool-think-btn"
        onClick={onOpenThink}
        className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-950 text-xs font-bold border border-amber-200/90 flex items-center justify-between transition group active:scale-95 shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center text-xs shadow-xs">
            <Brain className="w-4 h-4" />
          </span>
          <span className="font-black text-sm">فِكْر</span>
        </div>
        <ChevronLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Tool 2: Hint (تلميح) - Costs 2 Apples */}
      <button
        id="tool-hint-btn"
        onClick={onOpenHint}
        disabled={isAllCompleted || apples < 2}
        className="relative w-full py-2.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100/90 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-950 text-xs font-bold border border-indigo-200/90 flex items-center justify-between transition group active:scale-95 shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs shadow-xs">
            <Lightbulb className="w-4 h-4" />
          </span>
          <span className="font-black text-sm">تَلْمِيح</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-indigo-100 shadow-2xs text-indigo-700 font-mono font-bold">
          <span>-2</span>
          <span className="text-[11px]">🍏</span>
        </div>
      </button>

      {/* Tool 3: Help (مساعدة) - Costs 4 Apples */}
      <button
        id="tool-help-btn"
        onClick={onUseHelp}
        disabled={isAllCompleted || apples < 4}
        className="relative w-full py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100/90 disabled:opacity-50 disabled:cursor-not-allowed text-rose-950 text-xs font-bold border border-rose-200/90 flex items-center justify-between transition group active:scale-95 shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs shadow-xs">
            <Wand2 className="w-4 h-4" />
          </span>
          <span className="font-black text-sm">مُسَاعَدَة</span>
        </div>
        <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-md border border-rose-100 shadow-2xs text-rose-700 font-mono font-bold">
          <span>-4</span>
          <span className="text-[11px]">🍏</span>
        </div>
      </button>

      {/* Tool 4: Calculator (حاسبة) */}
      <button
        id="tool-calc-btn"
        onClick={onOpenCalculator}
        className="w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/90 text-emerald-950 text-xs font-bold border border-emerald-200/90 flex items-center justify-between transition group active:scale-95 shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs shadow-xs">
            <Calculator className="w-4 h-4" />
          </span>
          <span className="font-black text-sm">حَاسِبَة</span>
        </div>
        <ChevronLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
      </button>

      {/* Tool 5: Scratchpad (مسودة) */}
      <button
        id="tool-scratchpad-btn"
        onClick={onOpenScratchpad}
        className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 flex items-center justify-between transition group active:scale-95 shadow-2xs"
      >
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center text-xs shadow-xs">
            <PenTool className="w-4 h-4" />
          </span>
          <span className="font-black text-sm">مَسْوَدَة</span>
        </div>
        <ChevronLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-1 transition-transform" />
      </button>

      <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
        {/* Tool: PDF Batch Processor (تحويل ملف PDF صفحة صفحة + Supabase) */}
        <button
          id="tool-pdf-batch-btn"
          onClick={onOpenPdfBatch}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-black flex items-center justify-between transition group active:scale-95 shadow-xs"
          title="رفع ملف PDF وتحويله صفحة صفحة مع كشف الرسوم وتخزينها في Supabase"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center text-xs shadow-xs">
              <FileText className="w-4 h-4 text-white" />
            </span>
            <div className="text-right">
              <span className="font-black text-xs block">رفع PDF صفحة صفحة</span>
              <span className="text-[10px] text-rose-100 font-bold block">كشف الرسوم + خزن Supabase</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-white group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Tool: Vision & Diagram Studio (مختبر تحويل الصور والرسوم) */}
        <button
          id="tool-vision-studio-btn"
          onClick={onOpenVisionStudio}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-black flex items-center justify-between transition group active:scale-95 shadow-xs"
          title="تحويل صور أوراق الأسئلة وقص الرسوم البيانية واستخراج JSON عبر 4 مسارات API"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-950/20 text-slate-950 flex items-center justify-center text-xs shadow-xs">
              <ScanSearch className="w-4 h-4 text-slate-950" />
            </span>
            <div className="text-right">
              <span className="font-black text-xs block">مختبر الصور والرسوم</span>
              <span className="text-[10px] text-slate-900 font-bold block">4 مسارات API + قص الرسم</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-slate-950 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Upload Ready-made JSON File / Folder */}
        <button
          id="tool-upload-json-btn"
          onClick={onOpenJsonUpload}
          className="w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100/90 text-amber-950 text-xs font-bold border border-amber-200/90 flex items-center justify-between transition group active:scale-95 shadow-2xs"
          title="إضافة أو استيراد ملف أو مجلد JSON كامل من جهازك"
        >
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center text-xs shadow-xs">
              <FolderUp className="w-4 h-4" />
            </span>
            <div className="text-right">
              <span className="font-black text-xs block">إضافة ملف أو مجلد JSON</span>
              <span className="text-[10px] text-amber-700 font-bold block">يدعم حزم المسائل والمجلدات</span>
            </div>
          </div>
          <ChevronLeft className="w-4 h-4 text-amber-600 group-hover:-translate-x-1 transition-transform" />
        </button>

        {/* Converter / Question Selector */}
        <button
          id="tool-converter-btn"
          onClick={onOpenConverter}
          className="w-full py-2.5 px-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black flex items-center justify-center gap-2 transition active:scale-95 shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>تحويل مسألة جديدة (AI)</span>
        </button>

        {/* JSON File Sync Viewer */}
        <button
          id="tool-json-btn"
          onClick={onOpenJson}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold flex items-center justify-center gap-2 transition active:scale-95 shadow-xs"
        >
          <Code className="w-4 h-4 text-amber-400" />
          <span>ملف الـ JSON المتزامن</span>
        </button>
      </div>
    </aside>
  );
};
