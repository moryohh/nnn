import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  Upload,
  Sparkles,
  Database,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Play,
  Copy,
  Download,
  Check,
  RefreshCw,
  FolderPlus,
  ArrowRight,
  Layers,
  Settings,
  ChevronRight,
  ChevronLeft,
  Crop,
  HelpCircle,
  Loader2,
  ExternalLink,
  Code2
} from 'lucide-react';
import { ProblemJSON } from '../types';
import { renderPdfPagesToImages, ExtractedPage } from '../utils/pdfRenderer';
import {
  getSavedSupabaseConfig,
  saveSupabaseConfig,
  uploadBase64ToSupabase,
  cropImageBoundingBox,
  SupabaseConfig,
} from '../utils/supabaseStorage';

interface PdfBatchProcessorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportProblemsToFolder: (problems: ProblemJSON[], folderName: string) => void;
  onApplySingleProblem: (problem: ProblemJSON) => void;
}

export interface DetectedDiagramItem {
  id: string;
  box: [number, number, number, number];
  previewDataUrl: string;
  supabaseUrl?: string;
  label?: string;
  status: 'idle' | 'uploading' | 'uploaded' | 'failed';
}

export interface PageProcessItem {
  pageNumber: number;
  dataUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  detectedImages: DetectedDiagramItem[];
  generatedProblem?: ProblemJSON;
  generatedProblems?: ProblemJSON[];
  errorMessage?: string;
}

export const PdfBatchProcessorModal: React.FC<PdfBatchProcessorModalProps> = ({
  isOpen,
  onClose,
  onImportProblemsToFolder,
  onApplySingleProblem,
}) => {
  // File & Pages state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageProcessItem[]>([]);
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [isExtractingPdf, setIsExtractingPdf] = useState<boolean>(false);
  const [pdfExtractProgress, setPdfExtractProgress] = useState<{ current: number; total: number } | null>(null);

  // Processing state
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [batchCurrentIndex, setBatchCurrentIndex] = useState<number>(0);

  // Prompt configuration with strict rules for diagram completeness, all questions, and wide margins
  const [customPrompt, setCustomPrompt] = useState<string>(
    `أنت خبير مناهج السادس الإعدادي في العراق ومصمم محتوى تفاعلي.
استخرج المسألة العلمية الموجودة في هذه الصفحة بالكامل.

[قواعد صارمة لتحديد الرسومات والأشكال]
1. شمولية الشكل: إذا كان الفرع يحتوي على أكثر من رسم أو شكل مجاور (مثل: مربع ومثلث معاً، أو رسم وجدول، أو دائرة كهربائية ومخطط)، يجب أن يحيط الـ diagram_box بجميع الأشكال المترابطة التابعة للفرع كصورة واحدة متكاملة.
2. شمول كل الأسئلة: قم بفحص كل سؤال وفرع في الصفحة مستقلاً (مثل س2 ب، س5 ب)، واستخرج diagram_box خاص بكل فرع يحتوي على عنصر بصري داخل detected_images.
3. حدود واسعة: حدد Bounding Box بنظام [ymin, xmin, ymax, xmax] بنسبة من 0 إلى 1000 بحيث يشمل الشكل كاملاً مع مساحة فارغة بسيطة حوله لتجنب قطع أي طرف من الرسم.

فكك خطوات الحل إلى عناصر ثابتة ومربعات إدخال تفاعلية (box) لكل مربع 4 خيارات (1 صح + 3 مموهة محيرة) وتلميح ذكي.`
  );

  // Custom API Route Configuration (allows user to paste their own API route instead of Gemini)
  const [apiMode, setApiMode] = useState<'custom_endpoint' | 'gemini_vision'>('custom_endpoint');
  const [customEndpointUrl, setCustomEndpointUrl] = useState<string>(() => {
    return localStorage.getItem('iraq_custom_endpoint_url') || '';
  });
  const [customHeadersJson, setCustomHeadersJson] = useState<string>(() => {
    return localStorage.getItem('iraq_custom_endpoint_headers') || '{\n  "Authorization": "Bearer YOUR_CUSTOM_KEY"\n}';
  });

  // Supabase Configuration
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getSavedSupabaseConfig);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isTestingSupabase, setIsTestingSupabase] = useState<boolean>(false);
  const [supabaseTestStatus, setSupabaseTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [supabaseTestMsg, setSupabaseTestMsg] = useState<string>('');

  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto save endpoint preferences
  useEffect(() => {
    if (customEndpointUrl) {
      localStorage.setItem('iraq_custom_endpoint_url', customEndpointUrl);
    }
    if (customHeadersJson) {
      localStorage.setItem('iraq_custom_endpoint_headers', customHeadersJson);
    }
  }, [customEndpointUrl, customHeadersJson]);

  if (!isOpen) return null;

  // Handle PDF or Images upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setSelectedFile(file);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setIsExtractingPdf(true);
      setPdfExtractProgress({ current: 0, total: 0 });
      try {
        const extracted = await renderPdfPagesToImages(file, (current, total) => {
          setPdfExtractProgress({ current, total });
        });

        const items: PageProcessItem[] = extracted.map((p) => ({
          pageNumber: p.pageNumber,
          dataUrl: p.dataUrl,
          status: 'pending',
          detectedImages: [],
        }));

        setPages(items);
        setActivePageIndex(0);
      } catch (err: any) {
        console.error('Failed to parse PDF', err);
        alert('تعذر استخراج صفحات ملف الـ PDF: ' + (err.message || String(err)));
      } finally {
        setIsExtractingPdf(false);
        setPdfExtractProgress(null);
      }
    } else if (file.type.startsWith('image/')) {
      // Single Image upload
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPages([
          {
            pageNumber: 1,
            dataUrl,
            status: 'pending',
            detectedImages: [],
          },
        ]);
        setActivePageIndex(0);
      };
      reader.readAsDataURL(file);
    }
  };

  // Test Supabase credentials
  const handleTestSupabase = async () => {
    if (!supabaseConfig.supabaseUrl || !supabaseConfig.supabaseAnonKey) {
      setSupabaseTestStatus('error');
      setSupabaseTestMsg('يرجى إدخال رابط المشروع (URL) والمفتاح (Anon Key).');
      return;
    }
    setIsTestingSupabase(true);
    setSupabaseTestStatus('idle');
    setSupabaseTestMsg('');

    try {
      saveSupabaseConfig(supabaseConfig);
      // Create a tiny 1x1 test pixel
      const testCanvas = document.createElement('canvas');
      testCanvas.width = 2;
      testCanvas.height = 2;
      const ctx = testCanvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, 0, 2, 2);
      }
      const testDataUrl = testCanvas.toDataURL('image/png');
      const testPath = `test_ping_${Date.now()}.png`;

      const testUrl = await uploadBase64ToSupabase(testDataUrl, testPath, supabaseConfig);
      setSupabaseTestStatus('success');
      setSupabaseTestMsg(`تم الاتصال وتأكيد حوض التخزين بنجاح! الرابط التجريبي: ${testUrl.substring(0, 40)}...`);
    } catch (err: any) {
      setSupabaseTestStatus('error');
      setSupabaseTestMsg('فشل الرفع: ' + (err.message || String(err)));
    } finally {
      setIsTestingSupabase(false);
    }
  };

  // Process a single page
  const processPageItem = async (pageIdx: number): Promise<boolean> => {
    const currentPage = pages[pageIdx];
    if (!currentPage) return false;

    // Update status to processing
    setPages((prev) =>
      prev.map((p, i) => (i === pageIdx ? { ...p, status: 'processing', errorMessage: undefined } : p))
    );

    try {
      let rawJsonResult: any = null;

      // 1. Check which API route to call
      if (apiMode === 'custom_endpoint' && customEndpointUrl.trim()) {
        // User custom endpoint
        let parsedHeaders = {};
        try {
          if (customHeadersJson.trim()) {
            parsedHeaders = JSON.parse(customHeadersJson);
          }
        } catch {
          // ignore invalid header json
        }

        const res = await fetch('/api/custom-vision-proxy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customEndpointUrl: customEndpointUrl.trim(),
            customHeaders: parsedHeaders,
            payload: {
              image: currentPage.dataUrl,
              pageNumber: currentPage.pageNumber,
              prompt: customPrompt,
            },
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `خطأ من المسار المخصص (${res.status})`);
        }
        rawJsonResult = await res.json();
      } else {
        // Fallback / Built-in Vision route (with customPrompt)
        const res = await fetch('/api/vision/general', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: currentPage.dataUrl,
            customPrompt: customPrompt,
            subject: 'منهج السادس العلمي',
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `فشل الاستجابة (${res.status})`);
        }
        rawJsonResult = await res.json();
      }

      // 2. Detect, Parse Problems and Crop/Upload diagrams per question
      const rawProblemsList: any[] = Array.isArray(rawJsonResult.problems) && rawJsonResult.problems.length > 0
        ? rawJsonResult.problems
        : [rawJsonResult];

      const detectedImagesList: DetectedDiagramItem[] = [];
      const finalizedProblemsList: ProblemJSON[] = [];

      for (let pIdx = 0; pIdx < rawProblemsList.length; pIdx++) {
        const pItem = rawProblemsList[pIdx];
        const probId = pItem.problem_id || `prob_p${currentPage.pageNumber}_${pIdx + 1}_${Date.now()}`;
        let probImageUrl: string | null = null;
        let probBox: [number, number, number, number] | null = null;

        // Check diagram box
        if (pItem.has_diagram && pItem.diagram_box && Array.isArray(pItem.diagram_box)) {
          probBox = pItem.diagram_box as [number, number, number, number];
          const croppedDataUrl = await cropImageBoundingBox(currentPage.dataUrl, probBox, 20);

          let uploadedUrl: string | null = null;
          let uploadStatus: 'idle' | 'uploaded' | 'failed' = 'idle';

          // Upload to Supabase if configured
          if (supabaseConfig.supabaseUrl && supabaseConfig.supabaseAnonKey) {
            const fileName = `${probId}.png`;
            try {
              uploadedUrl = await uploadBase64ToSupabase(croppedDataUrl, fileName, supabaseConfig);
              uploadStatus = 'uploaded';
              probImageUrl = uploadedUrl;
            } catch (upErr) {
              console.warn(`Failed to upload ${fileName} to Supabase:`, upErr);
              uploadStatus = 'failed';
              probImageUrl = croppedDataUrl;
            }
          } else {
            probImageUrl = croppedDataUrl;
          }

          detectedImagesList.push({
            id: `diag_${probId}`,
            box: probBox,
            previewDataUrl: croppedDataUrl,
            supabaseUrl: uploadedUrl || undefined,
            status: uploadStatus,
            label: pItem.question_number || `رسم مسألة (${pIdx + 1})`,
          });
        }

        const structuredProblem: ProblemJSON = {
          ...pItem,
          problem_id: probId,
          question_number: pItem.question_number,
          page_number: currentPage.pageNumber,
          has_diagram: !!probBox,
          diagram_box: probBox,
          image_url: probImageUrl,
        };

        finalizedProblemsList.push(structuredProblem);
      }

      // Update state for this page
      setPages((prev) =>
        prev.map((p, i) =>
          i === pageIdx
            ? {
                ...p,
                status: 'completed',
                detectedImages: detectedImagesList,
                generatedProblem: finalizedProblemsList[0],
                generatedProblems: finalizedProblemsList,
              }
            : p
        )
      );

      return true;
    } catch (err: any) {
      console.error(`Error processing page ${currentPage.pageNumber}:`, err);
      setPages((prev) =>
        prev.map((p, i) =>
          i === pageIdx
            ? {
                ...p,
                status: 'error',
                errorMessage: err.message || String(err),
              }
            : p
        )
      );
      return false;
    }
  };

  // Run full batch processing through all pages sequentially
  const handleStartFullBatch = async () => {
    if (pages.length === 0) return;
    setIsBatchRunning(true);

    for (let i = 0; i < pages.length; i++) {
      setBatchCurrentIndex(i);
      setActivePageIndex(i);
      await processPageItem(i);
    }

    setIsBatchRunning(false);
  };

  // Export all converted problems into custom folder
  const handleExportAllToFolder = () => {
    const validProblems: ProblemJSON[] = [];
    pages.forEach((p) => {
      if (p.generatedProblems && p.generatedProblems.length > 0) {
        validProblems.push(...p.generatedProblems);
      } else if (p.generatedProblem) {
        validProblems.push(p.generatedProblem);
      }
    });

    if (validProblems.length === 0) {
      alert('لا توجد مسائل تم تحويلها بنجاح بعد.');
      return;
    }

    const folderTitle = selectedFile
      ? `حزمة: ${selectedFile.name.replace(/\.[^/.]+$/, '')}`
      : `حزمة مسائل PDF (${validProblems.length} مسألة)`;

    onImportProblemsToFolder(validProblems, folderTitle);
    onClose();
  };

  const activePage = pages[activePageIndex];

  return (
    <div
      id="pdf-batch-processor-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm"
      dir="rtl"
    >
      <div className="relative w-full max-w-6xl max-h-[94vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/95 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  معالج ملفات PDF وصفحة بصفحة (مخصص للمسارات وSupabase)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-bold border border-amber-500/30">
                  Batch & Multi-Image
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                تحويل أوراق الأسئلة صفحة صفحة، كشف 1 أو 2 أو 4 رسوم، وتخزينها في Supabase قبل استخراج JSON النهائي.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="supabase-settings-btn"
              onClick={() => setIsSupabaseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 hover:bg-emerald-900/60 text-xs font-black transition"
              title="إعدادات حوض تخزين Supabase"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>
                {supabaseConfig.supabaseUrl ? 'Supabase مُفعل' : 'ربط Supabase'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col gap-4">
          {/* Top Bar: Upload Button & API Mode & Prompt Controls */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
            {/* Upload Area */}
            <div className="lg:col-span-4 flex flex-col gap-2">
              <label className="text-xs font-black text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>اختر ملف PDF أو صورة:</span>
                </span>
                {selectedFile && (
                  <span className="text-[10px] text-amber-400 font-mono truncate max-w-[140px]">
                    {selectedFile.name}
                  </span>
                )}
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              <button
                id="select-pdf-file-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={isExtractingPdf || isBatchRunning}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {isExtractingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                    <span>
                      جاري فك صفحات الـ PDF ({pdfExtractProgress?.current} / {pdfExtractProgress?.total})...
                    </span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 text-amber-400" />
                    <span>رفع ملف PDF أو صورة امتحان</span>
                  </>
                )}
              </button>
            </div>

            {/* API Mode Selector & Endpoint URL */}
            <div className="lg:col-span-8 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-black text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Settings className="w-3.5 h-3.5 text-indigo-400" />
                  <span>مسار المعالجة (API Endpoint):</span>
                </span>

                <div className="flex items-center gap-2 text-[11px]">
                  <button
                    onClick={() => setApiMode('custom_endpoint')}
                    className={`px-2.5 py-0.5 rounded-lg transition ${
                      apiMode === 'custom_endpoint'
                        ? 'bg-indigo-600 text-white font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    مسارك المخصص (Custom API)
                  </button>
                  <button
                    onClick={() => setApiMode('gemini_vision')}
                    className={`px-2.5 py-0.5 rounded-lg transition ${
                      apiMode === 'gemini_vision'
                        ? 'bg-amber-600 text-white font-black'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    مسار Vision الداخلي
                  </button>
                </div>
              </div>

              {apiMode === 'custom_endpoint' ? (
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={customEndpointUrl}
                    onChange={(e) => setCustomEndpointUrl(e.target.value)}
                    placeholder="ضع رابط مسارك هنا، مثال: https://my-server.com/api/v1/extract-problem"
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-indigo-500/40 text-xs font-mono text-indigo-200 placeholder-slate-500 focus:outline-hidden focus:border-indigo-400"
                    dir="ltr"
                  />
                  <button
                    onClick={() => {
                      const sample = prompt(
                        'أدخل كائن الـ Headers بصيغة JSON:',
                        customHeadersJson
                      );
                      if (sample) setCustomHeadersJson(sample);
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold shrink-0 flex items-center gap-1"
                  >
                    <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>تعديل Headers</span>
                  </button>
                </div>
              ) : (
                <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                  <span>يستخدم محرك الرؤية التوليدي الداخلي لتنفيذ برومبت المناهج العراقية</span>
                  <span className="text-[10px] text-amber-400 font-mono">/api/vision/general</span>
                </div>
              )}
            </div>
          </div>

          {/* Prompt Editor (Collapsible) */}
          <details className="group bg-slate-950/40 rounded-2xl border border-slate-800 p-3">
            <summary className="text-xs font-bold text-slate-400 flex items-center justify-between cursor-pointer select-none">
              <span className="flex items-center gap-1.5 text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                <span>برومبت التوجيه والتقطيع (اضغط للتعديل)</span>
              </span>
              <span className="text-[11px] text-slate-500 group-open:rotate-180 transition-transform">▼</span>
            </summary>
            <div className="mt-2 pt-2 border-t border-slate-800/80">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200 font-sans leading-relaxed focus:outline-hidden focus:border-amber-500"
                placeholder="أدخل البرومبت المطلوب لمعالجة كل صفحة..."
              />
            </div>
          </details>

          {/* Main Work Area: Pages Navigator & Active Page Workspace */}
          {pages.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[420px]">
              {/* Left Column: Pages List Thumbnail Selector (4 cols) */}
              <div className="lg:col-span-4 bg-slate-950/70 rounded-2xl border border-slate-800 p-3 flex flex-col gap-2.5 max-h-[520px]">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-black text-slate-300">
                  <span>صفحات الملف ({pages.length} صفحة):</span>

                  {/* Run All Pages Button */}
                  <button
                    id="run-all-pages-batch-btn"
                    onClick={handleStartFullBatch}
                    disabled={isBatchRunning}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition active:scale-95 disabled:opacity-50"
                  >
                    {isBatchRunning ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>جاري المعالجة ({batchCurrentIndex + 1}/{pages.length})...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>تحويل كل الصفحات تلقائياً</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                  {pages.map((p, idx) => {
                    const isActive = idx === activePageIndex;
                    return (
                      <div
                        key={p.pageNumber}
                        onClick={() => setActivePageIndex(idx)}
                        className={`p-2 rounded-xl border flex items-center justify-between gap-2.5 cursor-pointer transition ${
                          isActive
                            ? 'bg-amber-500/15 border-amber-500/60 shadow-xs'
                            : 'bg-slate-900 hover:bg-slate-800/80 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <img
                            src={p.dataUrl}
                            alt={`ص ${p.pageNumber}`}
                            className="w-10 h-12 rounded-lg object-cover border border-slate-700 shrink-0 bg-white"
                          />
                          <div className="text-right">
                            <span className="text-xs font-black text-white block">
                              الصفحة {p.pageNumber}
                            </span>
                            <span className="text-[10px] block truncate max-w-[130px]">
                              {p.status === 'completed' ? (
                                <span className="text-emerald-400 font-bold">
                                  ✓ جاهزة {p.detectedImages.length > 0 ? `(${p.detectedImages.length} صور)` : ''}
                                </span>
                              ) : p.status === 'processing' ? (
                                <span className="text-amber-400 font-bold animate-pulse">جاري التحويل...</span>
                              ) : p.status === 'error' ? (
                                <span className="text-rose-400 font-bold">خطأ في التحويل</span>
                              ) : (
                                <span className="text-slate-500">بانتظار المعالجة</span>
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {p.status === 'completed' && (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          {p.status === 'processing' && (
                            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                          )}
                          {p.status === 'error' && (
                            <AlertCircle className="w-4 h-4 text-rose-400" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Action: Export All */}
                <button
                  id="export-batch-folder-btn"
                  onClick={handleExportAllToFolder}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md mt-1"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>تصدير المسائل الجاهزة لمجلد بالمنصة</span>
                </button>
              </div>

              {/* Right Column: Active Page Inspector & Image Detection Display (8 cols) */}
              <div className="lg:col-span-8 bg-slate-950/70 rounded-2xl border border-slate-800 p-3.5 flex flex-col gap-3 max-h-[520px] overflow-y-auto">
                {activePage && (
                  <>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-amber-400">
                          معاينة الصفحة {activePage.pageNumber}
                        </span>
                        {activePage.status === 'completed' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            تم التحويل بنجاح
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => processPageItem(activePageIndex)}
                          disabled={activePage.status === 'processing' || isBatchRunning}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition active:scale-95 disabled:opacity-50 shadow-xs"
                        >
                          {activePage.status === 'processing' ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>جاري التحويل...</span>
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>تحويل هذه الصفحة الآن</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content split: Page View vs Result View */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Original Page Canvas */}
                      <div className="md:col-span-5 flex flex-col gap-1.5">
                        <span className="text-xs font-bold text-slate-400">الصورة الأصلية للصفحة:</span>
                        <div className="relative rounded-xl border border-slate-700 overflow-hidden bg-slate-900 flex items-center justify-center max-h-[340px]">
                          <img
                            src={activePage.dataUrl}
                            alt={`صفحة ${activePage.pageNumber}`}
                            className="max-h-[330px] w-auto object-contain rounded-lg"
                          />
                        </div>
                      </div>

                      {/* Detected Images & Problems Result */}
                      <div className="md:col-span-7 flex flex-col gap-3">
                        {/* Section: Detected Images (1, 2, 4 images) */}
                        <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-xs font-black">
                            <span className="text-amber-300 flex items-center gap-1.5">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>
                                الرسوم والمخططات المكتشفة بالصفحة (
                                {activePage.detectedImages.length}):
                              </span>
                            </span>
                            {activePage.detectedImages.length > 0 ? (
                              <span className="text-[10px] text-emerald-400 font-bold">
                                لديك {activePage.detectedImages.length} صور تم رصدها وقصها
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-500">لا توجد رسوم مسجلة بعد</span>
                            )}
                          </div>

                          {activePage.detectedImages.length > 0 ? (
                            <div className="grid grid-cols-2 gap-2">
                              {activePage.detectedImages.map((imgItem, imgIdx) => (
                                <div
                                  key={imgItem.id}
                                  className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5"
                                >
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-300">
                                    <span>{imgItem.label || `رسم (${imgIdx + 1})`}</span>
                                    {imgItem.supabaseUrl ? (
                                      <span className="text-emerald-400 text-[9px] font-mono">
                                        ✓ في Supabase
                                      </span>
                                    ) : (
                                      <span className="text-slate-500 text-[9px]">محلي</span>
                                    )}
                                  </div>

                                  <div className="bg-white rounded-lg p-1 flex items-center justify-center max-h-24 overflow-hidden">
                                    <img
                                      src={imgItem.previewDataUrl}
                                      alt={`رسم ${imgIdx + 1}`}
                                      className="max-h-20 object-contain"
                                    />
                                  </div>

                                  {imgItem.supabaseUrl && (
                                    <span
                                      className="text-[9px] text-slate-400 font-mono truncate"
                                      title={imgItem.supabaseUrl}
                                    >
                                      {imgItem.supabaseUrl}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                              عند تشغيل التحويل، سيتم فحص الصفحة واستخراج كافة الرسوم (1 أو 2 أو 4 رسوم) وقصها وتخزينها تلقائياً.
                            </div>
                          )}
                        </div>

                        {/* Section: Generated Questions & Actions */}
                        {activePage.generatedProblems && activePage.generatedProblems.length > 0 ? (
                          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex flex-col gap-2.5">
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="text-amber-300 flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span>الأسئلة والمسائل المستخرجة ({activePage.generatedProblems.length}):</span>
                              </span>
                              <span className="text-[10px] text-emerald-400 font-bold">
                                جاهزة للحل والتصدير
                              </span>
                            </div>

                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                              {activePage.generatedProblems.map((prob, pIdx) => (
                                <div
                                  key={prob.problem_id || pIdx}
                                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-1.5 hover:border-slate-700 transition"
                                >
                                  <div className="flex items-center justify-between text-xs font-black">
                                    <div className="flex items-center gap-1.5 truncate max-w-[240px]">
                                      {prob.question_number && (
                                        <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px]">
                                          {prob.question_number}
                                        </span>
                                      )}
                                      <span className="text-white truncate">{prob.title || `مسألة ${pIdx + 1}`}</span>
                                    </div>
                                    <span className="text-slate-400 text-[10px] font-mono shrink-0">
                                      {prob.steps?.length || 0} خطوات
                                      {prob.has_diagram ? ' • رسم ✓' : ''}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80">
                                    <button
                                      onClick={() => onApplySingleProblem(prob)}
                                      className="flex-1 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[11px] flex items-center justify-center gap-1 transition active:scale-95"
                                    >
                                      <Play className="w-3 h-3 fill-slate-950" />
                                      <span>حل على اللوح</span>
                                    </button>

                                    <button
                                      onClick={() => {
                                        navigator.clipboard.writeText(JSON.stringify(prob, null, 2));
                                        setCopiedJson(true);
                                        setTimeout(() => setCopiedJson(false), 2000);
                                      }}
                                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold flex items-center gap-1"
                                      title="نسخ كود JSON"
                                    >
                                      {copiedJson ? (
                                        <Check className="w-3 h-3 text-emerald-400" />
                                      ) : (
                                        <Copy className="w-3 h-3" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : activePage.generatedProblem ? (
                          <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-3 flex flex-col gap-2">
                            <div className="flex items-center justify-between text-xs font-black">
                              <span className="text-white truncate max-w-[200px]">
                                {activePage.generatedProblem.title || 'المسألة المستخرجة'}
                              </span>
                              <span className="text-amber-400 text-[10px]">
                                {activePage.generatedProblem.steps.length} خطوات
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                              {activePage.generatedProblem.title}
                            </p>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
                              <button
                                onClick={() => onApplySingleProblem(activePage.generatedProblem!)}
                                className="flex-1 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
                              >
                                <Play className="w-3.5 h-3.5 fill-slate-950" />
                                <span>حل المسألة فوراً على اللوح</span>
                              </button>

                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    JSON.stringify(activePage.generatedProblem, null, 2)
                                  );
                                  setCopiedJson(true);
                                  setTimeout(() => setCopiedJson(false), 2000);
                                }}
                                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1"
                                title="نسخ كود JSON"
                              >
                                {copiedJson ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        ) : activePage.errorMessage ? (
                          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-300 text-xs flex flex-col gap-1">
                            <span className="font-bold flex items-center gap-1">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>فشل التحويل:</span>
                            </span>
                            <span className="text-[11px] font-mono">{activePage.errorMessage}</span>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            /* Empty state */
            <div className="flex-1 min-h-[300px] border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-6 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <FileText className="w-8 h-8" />
              </div>
              <div className="max-w-md">
                <h3 className="text-sm font-black text-white mb-1">
                  ارفع ملف PDF أو حزمة أوراق امتحانات لبدء التحويل التلقائي
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  يقوم النظام بفرز صفحات الملف صفحة صفحة، وإرسال كل صفحة حسب البرومبت لمسارك المخصص أو Vision API، ورصد وجود 1 أو 2 أو 4 رسوم، وتخزينها في حوض Supabase قبل اعتماد JSON النهائي.
                </p>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition active:scale-95 shadow-lg"
              >
                <Upload className="w-4 h-4" />
                <span>اختر ملف PDF من جهازك</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span>إجمالي الصفحات: {pages.length}</span>
            <span>•</span>
            <span>
              تم إنجاز:{' '}
              {pages.filter((p) => p.status === 'completed').length} مسألة
            </span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>

      {/* Supabase Settings Modal Sub-dialog */}
      {isSupabaseModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col gap-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm">
                <Database className="w-4 h-4" />
                <span>بيانات ربط حوض تخزين Supabase</span>
              </div>
              <button
                onClick={() => setIsSupabaseModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              عند إدخال هذه البيانات، سيقوم النظام تلقائياً برفع أي رسم مقصوص (1 أو 2 أو 4 رسوم) لحوض التخزين ووضع رابطه المباشر داخل JSON قبل الانتهاء.
            </p>

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  رابط المشروع (Supabase Project URL):
                </label>
                <input
                  type="text"
                  value={supabaseConfig.supabaseUrl}
                  onChange={(e) =>
                    setSupabaseConfig({ ...supabaseConfig, supabaseUrl: e.target.value })
                  }
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  المفتاح العام (Supabase Anon Key):
                </label>
                <input
                  type="password"
                  value={supabaseConfig.supabaseAnonKey}
                  onChange={(e) =>
                    setSupabaseConfig({ ...supabaseConfig, supabaseAnonKey: e.target.value })
                  }
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  اسم حوض التخزين (Bucket Name):
                </label>
                <input
                  type="text"
                  value={supabaseConfig.bucketName}
                  onChange={(e) =>
                    setSupabaseConfig({ ...supabaseConfig, bucketName: e.target.value })
                  }
                  placeholder="diagrams أو questions"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-emerald-300 placeholder-slate-600 focus:outline-hidden focus:border-emerald-500"
                  dir="ltr"
                />
              </div>
            </div>

            {supabaseTestStatus === 'success' && (
              <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="text-[11px]">{supabaseTestMsg}</span>
              </div>
            )}

            {supabaseTestStatus === 'error' && (
              <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-700 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="text-[11px]">{supabaseTestMsg}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={handleTestSupabase}
                disabled={isTestingSupabase}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {isTestingSupabase ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>فحص الاتصال والرفع</span>
              </button>

              <button
                onClick={() => {
                  saveSupabaseConfig(supabaseConfig);
                  setIsSupabaseModalOpen(false);
                }}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
