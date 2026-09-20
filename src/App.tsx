import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  FlaskConical,
  Heart,
  Flame,
  CheckCircle2,
  Sparkles,
  BookOpen,
  RotateCcw,
  Share2,
  FolderUp,
  ScanSearch,
  FileText,
} from 'lucide-react';
import { ProblemJSON, ProblemInput, ProblemStep } from './types';
import { initialChemistryProblem, sampleProblems } from './data/problems';
import { MathView } from './components/MathView';
import { InteractiveBoard } from './components/InteractiveBoard';
import { ToolsDrawer } from './components/ToolsDrawer';
import { ChoicesPopover } from './components/ChoicesPopover';
import { ThinkHintModal } from './components/ThinkHintModal';
import { CalculatorModal } from './components/CalculatorModal';
import { ScratchpadModal } from './components/ScratchpadModal';
import { JsonModal } from './components/JsonModal';
import { ProblemConverterModal } from './components/ProblemConverterModal';
import { JsonUploadModal } from './components/JsonUploadModal';
import { ImageVisionStudioModal } from './components/ImageVisionStudioModal';
import { PdfBatchProcessorModal } from './components/PdfBatchProcessorModal';
import { sounds } from './utils/audio';

export default function App() {
  const [problem, setProblem] = useState<ProblemJSON>(initialChemistryProblem);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [activeInputId, setActiveInputId] = useState<string>('inp_1');

  // Gamification state
  const [hearts, setHearts] = useState<number>(10);
  const [apples, setApples] = useState<number>(100);
  const [streakDays] = useState<number>(3);

  // Modals state
  const [isChoicesOpen, setIsChoicesOpen] = useState<boolean>(false);
  const [isCalcOpen, setIsCalcOpen] = useState<boolean>(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState<boolean>(false);
  const [isJsonOpen, setIsJsonOpen] = useState<boolean>(false);
  const [isConverterOpen, setIsConverterOpen] = useState<boolean>(false);
  const [isJsonUploadOpen, setIsJsonUploadOpen] = useState<boolean>(false);
  const [isVisionStudioOpen, setIsVisionStudioOpen] = useState<boolean>(false);
  const [isPdfBatchOpen, setIsPdfBatchOpen] = useState<boolean>(false);
  const [thinkHintModalType, setThinkHintModalType] = useState<'think' | 'hint' | null>(null);

  // Helper to import a batch of problems from PDF into custom folders in localStorage
  const handleImportProblemsToFolder = (newProblems: ProblemJSON[], folderName: string) => {
    if (newProblems.length === 0) return;
    try {
      const STORAGE_KEY = 'iraq_curriculum_custom_folders_v1';
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing = raw ? JSON.parse(raw) : [];
      const newFolder = {
        id: `pdf_folder_${Date.now()}`,
        name: folderName,
        category: 'مخصص',
        description: `مجلد تم استخراجه آلياً من ملف PDF يحوي ${newProblems.length} مسألة مع رسومها`,
        icon: '📑',
        isCustom: true,
        problems: newProblems,
      };
      const updated = [newFolder, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      // Load first problem immediately
      handleSelectProblem(newProblems[0]);
      alert(`تم بنجاح حفظ ${newProblems.length} مسألة في المجلد الجديد "${folderName}" وتم تحميل أول مسألة على اللوح!`);
    } catch (e) {
      console.error('Failed to save batch folder', e);
      handleSelectProblem(newProblems[0]);
    }
  };

  // Flatten all inputs in order (supporting elements, equation_rows and legacy inputs)
  const allInputs = useMemo(() => {
    const list: ProblemInput[] = [];
    problem.steps.forEach((step) => {
      if (step.elements && step.elements.length > 0) {
        step.elements.forEach((el) => {
          if (el.type === 'box') {
            list.push({
              id: el.box_id,
              correct_value: el.correct_value,
              label: el.box_title || el.hint || `الخانة ${el.box_id}`,
              allowed_keys: el.options,
              specific_hint: el.hint || '',
              related_topics: [],
            });
          }
        });
      } else if (step.equation_rows && step.equation_rows.length > 0) {
        step.equation_rows.forEach((row) => {
          if (row.elements) {
            row.elements.forEach((el) => {
              if (el.type === 'box') {
                list.push({
                  id: el.box_id,
                  correct_value: el.correct_value,
                  label: el.box_title || el.hint || '',
                  allowed_keys: el.options,
                  specific_hint: el.hint || '',
                  related_topics: [],
                });
              }
            });
          }
          if (row.inputs) {
            row.inputs.forEach((inp) => {
              list.push({
                id: inp.box_id,
                correct_value: inp.correct_value,
                label: inp.box_title,
                allowed_keys: inp.options,
                specific_hint: inp.hint,
                related_topics: [],
              });
            });
          }
        });
      } else if (step.inputs) {
        step.inputs.forEach((input) => {
          list.push(input);
        });
      }
    });
    return list;
  }, [problem]);

  const totalInputsCount = allInputs.length;
  const solvedCount = Object.keys(userAnswers).length;
  const isAllCompleted = totalInputsCount > 0 && solvedCount === totalInputsCount;

  // Find active input and its parent step
  const activeInput = useMemo(() => {
    return allInputs.find((i) => i.id === activeInputId) || allInputs[0] || null;
  }, [allInputs, activeInputId]);

  const activeStep = useMemo(() => {
    return (
      problem.steps.find((s) => {
        if (s.elements) {
          return s.elements.some((el) => el.type === 'box' && el.box_id === activeInputId);
        }
        if (s.equation_rows) {
          return s.equation_rows.some(
            (row) =>
              row.elements?.some((el) => el.type === 'box' && el.box_id === activeInputId) ||
              row.inputs?.some((inp) => inp.box_id === activeInputId)
          );
        }
        return s.inputs?.some((i) => i.id === activeInputId);
      }) ||
      problem.steps[0] ||
      null
    );
  }, [problem, activeInputId]);

  // Handle problem change
  const handleSelectProblem = useCallback((newProblem: ProblemJSON) => {
    setProblem(newProblem);
    setUserAnswers({});
    const firstInputId =
      newProblem.steps[0]?.elements?.find((el) => el.type === 'box')?.box_id ||
      newProblem.steps[0]?.equation_rows?.[0]?.elements?.find((el) => el.type === 'box')?.box_id ||
      newProblem.steps[0]?.equation_rows?.[0]?.inputs?.[0]?.box_id ||
      newProblem.steps[0]?.inputs?.[0]?.id ||
      '';
    setActiveInputId(firstInputId);
    setIsChoicesOpen(false);
  }, []);

  // When active input changes or is clicked
  const handleBoxClick = useCallback(
    (inputId: string) => {
      if (userAnswers[inputId]) return; // already solved
      setActiveInputId(inputId);
      setIsChoicesOpen(true);
    },
    [userAnswers]
  );

  // On selecting a choice
  const handleChoiceSelect = (choice: string) => {
    if (!activeInput) return;

    if (choice.trim() === activeInput.correct_value.trim()) {
      // Correct!
      sounds.playCorrect();
      const updatedAnswers = { ...userAnswers, [activeInput.id]: choice };
      setUserAnswers(updatedAnswers);
      setIsChoicesOpen(false);

      // Find next unsolved box
      const nextUnsolved = allInputs.find(
        (inp) => inp.id !== activeInput.id && !updatedAnswers[inp.id]
      );

      if (nextUnsolved) {
        setActiveInputId(nextUnsolved.id);
      } else {
        // All completed! Trigger celebration & bonus apples
        sounds.playHint();
        setApples((prev) => prev + 25);
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#10b981', '#f59e0b', '#3b82f6'],
        });
      }
    } else {
      // Incorrect!
      sounds.playError();
      setHearts((prev) => {
        const remaining = prev - 1;
        if (remaining <= 0) {
          setTimeout(() => {
            alert('لقد نفدت قلوب المحاولات! سيبدأ التمرين من جديد لمراجعة الخطوات.');
            handleReset();
          }, 400);
          return 10;
        }
        return remaining;
      });

      // Shake animation on the active box
      const boxElem = document.getElementById(`box_${activeInput.id}`);
      if (boxElem) {
        boxElem.classList.add('shake-animation');
        setTimeout(() => boxElem.classList.remove('shake-animation'), 450);
      }
    }
  };

  // Use hint tool
  const handleOpenHint = () => {
    if (apples < 2) {
      alert('عذراً، تحتاج إلى تفاحتين (2) لاستخدام التلميح الذكي.');
      return;
    }
    setApples((prev) => prev - 2);
    sounds.playHint();
    setThinkHintModalType('hint');
  };

  // Use solve help tool
  const handleUseHelp = () => {
    if (!activeInput || userAnswers[activeInput.id]) return;
    if (apples < 4) {
      alert('عذراً، تحتاج إلى 4 تفاحات لاستخدام المساعدة المباشرة.');
      return;
    }
    setApples((prev) => prev - 4);
    sounds.playCorrect();
    handleChoiceSelect(activeInput.correct_value);
  };

  // Reset current problem
  const handleReset = () => {
    setUserAnswers({});
    const firstInputId =
      problem.steps[0]?.equation_rows?.[0]?.inputs?.[0]?.box_id ||
      problem.steps[0]?.inputs?.[0]?.id ||
      '';
    setActiveInputId(firstInputId);
    setHearts(10);
    setIsChoicesOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col justify-between selection:bg-red-100 selection:text-red-800">
      {/* 1. Gamification Bar (Apples & Hearts & Streak) */}
      <div className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-10 flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-3">
            {/* Hearts (Attempts) */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border transition ${
                hearts <= 3
                  ? 'text-red-400 bg-red-950/80 border-red-500 animate-pulse'
                  : 'text-rose-400 bg-rose-500/10 border-rose-500/20'
              }`}
              title="القلوب (المحاولات المتبقية)"
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span className="font-mono text-sm font-black">{hearts}</span>
            </div>

            {/* Apples (Currency) */}
            <div
              className="flex items-center gap-1.5 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20"
              title="رصيد التفاح (يُستخدم للتلميحات والمساعدات)"
            >
              <span className="text-sm">🍏</span>
              <span className="font-mono text-sm font-black">{apples}</span>
            </div>
          </div>

          {/* Quick Problem Category & Streak */}
          <div className="flex items-center gap-2 sm:gap-4 text-slate-300">
            <div className="hidden sm:flex items-center gap-1.5 text-orange-400 bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/20">
              <Flame className="w-3.5 h-3.5" />
              <span>{streakDays} أيام متتالية</span>
            </div>

            <button
              id="top-bar-upload-json-btn"
              onClick={() => setIsJsonUploadOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition text-[11px] font-black"
              title="إضافة أو استيراد ملف أو مجلد JSON كامل من جهازك"
            >
              <FolderUp className="w-3.5 h-3.5 text-amber-400" />
              <span>إضافة ملف / مجلد JSON</span>
            </button>

            <button
              onClick={() => setIsConverterOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 transition text-[11px] font-black"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>تبديل المسألة ({sampleProblems.length})</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Header Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-10 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-base shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </span>
            <div>
              <h1 className="font-black text-slate-900 text-sm md:text-base leading-tight">
                السبورة التفاعلية - ورقة الحل المتزامنة
              </h1>
              <p className="text-[11px] text-slate-500 font-bold hidden sm:block">
                مناهج السادس الإعدادي • التعلم المصغر (Microlearning)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Direct PDF Page-by-Page & Supabase Processor */}
            <button
              id="header-pdf-batch-btn"
              onClick={() => setIsPdfBatchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs transition active:scale-95 shadow-sm"
              title="رفع ملف PDF وتحويله صفحة صفحة مع كشف الرسوم وتخزينها في Supabase"
            >
              <FileText className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">رفع PDF صفحة صفحة</span>
              <span className="sm:hidden">رفع PDF</span>
            </button>

            <button
              id="header-vision-studio-btn"
              onClick={() => setIsVisionStudioOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs transition active:scale-95 shadow-sm"
              title="مختبر تحويل الصور وقص الرسوم البيانية واستخراج JSON عبر 4 مسارات API"
            >
              <ScanSearch className="w-4 h-4 text-slate-950" />
              <span className="hidden sm:inline">مختبر الصور والرسوم (OCR)</span>
              <span className="sm:hidden">الصور والرسوم</span>
            </button>

            <button
              id="header-upload-json-btn"
              onClick={() => setIsJsonUploadOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-black text-xs transition active:scale-95 shadow-2xs"
              title="إضافة ملف أو مجلد JSON كامل من جهازك"
            >
              <FolderUp className="w-4 h-4 text-amber-600" />
              <span className="hidden sm:inline">إضافة ملف / مجلد JSON</span>
              <span className="sm:hidden">ملف / مجلد</span>
            </button>

            <span
              id="stepProgressIndicator"
              className="text-xs font-black bg-slate-100 text-slate-700 px-3.5 py-1.5 rounded-full border border-slate-200 shadow-inner"
            >
              الخانات المكتملة {solvedCount} من {totalInputsCount}
            </span>
          </div>
        </div>
      </header>

      {/* 3. Main Workspace */}
      <div className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col md:flex-row gap-6 relative">
        {/* Right Tools Drawer */}
        <ToolsDrawer
          onOpenThink={() => setThinkHintModalType('think')}
          onOpenHint={handleOpenHint}
          onUseHelp={handleUseHelp}
          onOpenCalculator={() => setIsCalcOpen((prev) => !prev)}
          onOpenScratchpad={() => setIsScratchpadOpen(true)}
          onOpenJson={() => setIsJsonOpen(true)}
          onOpenJsonUpload={() => setIsJsonUploadOpen(true)}
          onOpenConverter={() => setIsConverterOpen(true)}
          onOpenVisionStudio={() => setIsVisionStudioOpen(true)}
          onOpenPdfBatch={() => setIsPdfBatchOpen(true)}
          onReset={handleReset}
          isAllCompleted={isAllCompleted}
          apples={apples}
        />

        {/* Main Clean White Paper Sheet (الورقة البيضاء الناصعة) */}
        <main
          id="main-paper-sheet"
          className="flex-1 paper-sheet rounded-2xl p-5 md:p-8 relative flex flex-col justify-between shadow-md"
        >
          <div>
            {/* Header with Category and Data */}
            <div className="border-b-2 border-slate-200 pb-5 mb-6">
              <div className="flex items-center justify-between text-slate-500 font-bold text-xs mb-2 flex-wrap gap-2">
                <span className="flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-lg border border-slate-200">
                  <span className="w-2 h-2 rounded-full bg-red-600" />
                  <span id="questionCategory">{problem.category}</span>
                </span>

                {problem.atomic_weights && (
                  <span className="bg-red-50 text-red-700 px-3 py-1 rounded-lg text-xs font-black border border-red-200">
                    المعطيات: {problem.atomic_weights}
                  </span>
                )}
              </div>

              {/* Question Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center my-3 shadow-2xs">
                <h2
                  id="questionTitle"
                  className="text-base md:text-lg font-black text-slate-900 mb-2 leading-relaxed"
                >
                  {problem.title}
                </h2>

                {problem.latex_formula && (
                  <div className="text-xl md:text-2xl font-black text-red-700 py-1 overflow-x-auto">
                    <MathView formula={problem.latex_formula} displayMode={true} />
                  </div>
                )}

                {/* Attached Cropped Diagram if present */}
                {problem.image_url && (
                  <div className="mt-4 p-3 bg-white rounded-2xl border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                    <div className="w-full flex items-center justify-between text-[11px] font-black text-slate-600 mb-2 px-1">
                      <span className="flex items-center gap-1.5 text-amber-700 font-black">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>الرسم والمخطط التوضيحي للمسألة:</span>
                      </span>
                      {problem.diagram_box && (
                        <span className="font-mono text-[10px] text-slate-400">
                          إحداثيات الصندوق: [{problem.diagram_box.join(', ')}]
                        </span>
                      )}
                    </div>
                    <img
                      src={problem.image_url}
                      alt="رسم المسألة التوضيحي"
                      className="max-h-60 rounded-xl border border-slate-200 bg-white object-contain shadow-xs hover:scale-[1.01] transition-transform"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Solution Canvas */}
            <InteractiveBoard
              problem={problem}
              userAnswers={userAnswers}
              activeInputId={activeInputId}
              onBoxClick={handleBoxClick}
              onReset={handleReset}
            />
          </div>

          {/* Completion Celebration Banner */}
          {isAllCompleted && (
            <div
              id="completionBanner"
              className="mt-8 p-6 rounded-2xl bg-emerald-600 text-white text-center shadow-xl animate-in fade-in zoom-in duration-300"
            >
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-white" />
              <h3 className="text-xl font-black mb-1">
                ممتاز جداً! أتممت حل المسألة العلمية بنجاح!
              </h3>
              <p className="text-xs font-bold opacity-95">
                حصلت على +25 تفاحة كمكافأة إتقان على منصة التعلم المصغر (Microlearning).
              </p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-5 py-2 bg-white text-emerald-800 font-black rounded-xl text-xs shadow-md hover:bg-slate-50 transition active:scale-95"
                >
                  إعادة حل المسألة
                </button>
                <button
                  onClick={() => setIsConverterOpen(true)}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-black rounded-xl text-xs shadow-md transition active:scale-95"
                >
                  اختيار مسألة وزارية أخرى
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-xs text-slate-500 font-bold">
        منصة التعلم المصغر التفاعلية لمناهج السادس الإعدادي في العراق • تصميم مهيكل وفق معايير JSON الدقيقة
      </footer>

      {/* Modals and Popovers */}
      <ChoicesPopover
        isOpen={isChoicesOpen}
        targetInput={activeInput}
        onClose={() => setIsChoicesOpen(false)}
        onSelect={handleChoiceSelect}
        onOpenCalculator={() => setIsCalcOpen(true)}
      />

      <ThinkHintModal
        type={thinkHintModalType}
        step={activeStep}
        activeInput={activeInput}
        onClose={() => setThinkHintModalType(null)}
      />

      <CalculatorModal isOpen={isCalcOpen} onClose={() => setIsCalcOpen(false)} />

      <ScratchpadModal
        isOpen={isScratchpadOpen}
        onClose={() => setIsScratchpadOpen(false)}
      />

      <JsonModal
        isOpen={isJsonOpen}
        problem={problem}
        onClose={() => setIsJsonOpen(false)}
        onApplyJson={handleSelectProblem}
      />

      <ProblemConverterModal
        isOpen={isConverterOpen}
        onClose={() => setIsConverterOpen(false)}
        onSelectProblem={handleSelectProblem}
        onOpenJsonUpload={() => setIsJsonUploadOpen(true)}
      />

      <JsonUploadModal
        isOpen={isJsonUploadOpen}
        onClose={() => setIsJsonUploadOpen(false)}
        onImportSuccess={handleSelectProblem}
        onOpenPdfProcessor={() => setIsPdfBatchOpen(true)}
      />

      <ImageVisionStudioModal
        isOpen={isVisionStudioOpen}
        onClose={() => setIsVisionStudioOpen(false)}
        onApplyProblem={handleSelectProblem}
      />

      <PdfBatchProcessorModal
        isOpen={isPdfBatchOpen}
        onClose={() => setIsPdfBatchOpen(false)}
        onImportProblemsToFolder={handleImportProblemsToFolder}
        onApplySingleProblem={handleSelectProblem}
      />
    </div>
  );
}
