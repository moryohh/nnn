import React, { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import {
  X,
  FolderUp,
  FileUp,
  Folder,
  FolderOpen,
  FileJson,
  Download,
  Play,
  Copy,
  Check,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Eye,
  Code2,
  Plus,
  RefreshCw,
  FolderDown,
  Sparkles,
  HelpCircle,
  ChevronLeft,
  BookOpen,
  FileText
} from 'lucide-react';
import { ProblemJSON } from '../types';
import { initialFolders, ProblemFolder } from '../data/folders';

interface JsonUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (problem: ProblemJSON) => void;
  onOpenPdfProcessor?: () => void;
}

const STORAGE_KEY = 'iraq_curriculum_custom_folders_v1';

export const JsonUploadModal: React.FC<JsonUploadModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  onOpenPdfProcessor,
}) => {
  // Folder & Problem State
  const [folders, setFolders] = useState<ProblemFolder[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return [...initialFolders, ...parsed];
        }
      }
    } catch (e) {
      console.error('Error loading saved custom folders', e);
    }
    return initialFolders;
  });

  const [activeFolderId, setActiveFolderId] = useState<string>(initialFolders[0].id);
  const [selectedProblemId, setSelectedProblemId] = useState<string>(
    initialFolders[0].problems[0]?.problem_id || ''
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'json'>('preview');
  const [copied, setCopied] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Drag & drop upload state
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Save custom folders to localStorage whenever folders change
  const saveCustomFolders = (updatedFolders: ProblemFolder[]) => {
    try {
      const customOnly = updatedFolders.filter((f) => f.isCustom);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
    } catch (e) {
      console.error('Failed to persist custom folders to localStorage', e);
    }
  };

  const activeFolder = folders.find((f) => f.id === activeFolderId) || folders[0];
  
  // Filter problems within active folder
  const filteredProblems = (activeFolder?.problems || []).filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title?.toLowerCase().includes(q) ||
      p.problem_id.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    );
  });

  // Current selected problem
  const selectedProblem: ProblemJSON | undefined =
    activeFolder?.problems.find((p) => p.problem_id === selectedProblemId) ||
    filteredProblems[0] ||
    activeFolder?.problems[0];

  useEffect(() => {
    if (activeFolder && activeFolder.problems.length > 0) {
      if (!activeFolder.problems.some((p) => p.problem_id === selectedProblemId)) {
        setSelectedProblemId(activeFolder.problems[0].problem_id);
      }
    }
  }, [activeFolderId, activeFolder, selectedProblemId]);

  if (!isOpen) return null;

  // Validation helper
  const validateProblemJson = (data: any, fileName: string): ProblemJSON => {
    if (!data.problem_id || typeof data.problem_id !== 'string') {
      data.problem_id = `P_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    }
    if (!data.title || typeof data.title !== 'string') {
      data.title = `مسألة: ${fileName.replace(/\.json$/i, '')}`;
    }
    if (!Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error(`الملف ${fileName} يجب أن يحتوي على مصفوفة خطوات (steps) غير فارغة.`);
    }

    for (let i = 0; i < data.steps.length; i++) {
      const step = data.steps[i];
      if (!step.title) {
        step.title = `الخطوة ${i + 1}`;
      }
      const hasElements = Array.isArray(step.elements) && step.elements.length > 0;
      const hasEquationRows = Array.isArray(step.equation_rows) && step.equation_rows.length > 0;
      const hasInputs = Array.isArray(step.inputs) && step.inputs.length > 0;

      if (!hasElements && !hasEquationRows && !hasInputs) {
        throw new Error(
          `الملف ${fileName} - الخطوة رقم ${i + 1} (${step.title}) لا تحتوي على عناصر (elements) أو معادلات.`
        );
      }
    }

    return data as ProblemJSON;
  };

  const countBoxesInProblem = (p: ProblemJSON): number => {
    return p.steps.reduce((acc, step) => {
      if (step.elements) {
        return acc + step.elements.filter((el) => el.type === 'box').length;
      }
      if (step.equation_rows) {
        return (
          acc +
          step.equation_rows.reduce((rAcc, r) => {
            const fromElements = r.elements ? r.elements.filter((el) => el.type === 'box').length : 0;
            const fromInputs = r.inputs ? r.inputs.length : 0;
            return rAcc + fromElements + fromInputs;
          }, 0)
        );
      }
      return acc + (step.inputs?.length || 0);
    }, 0);
  };

  // Helper for processing files list
  const processUploadedFiles = async (files: FileList | File[], suggestedFolderName?: string) => {
    setIsUploading(true);
    setFeedbackMessage(null);

    const jsonFiles: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (f.name.endsWith('.json') || f.type === 'application/json') {
        jsonFiles.push(f);
      }
    }

    if (jsonFiles.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: 'لم يتم العثور على أي ملفات بصيغة JSON داخل المجلد أو الملفات المحددة.',
      });
      setIsUploading(false);
      return;
    }

    const newProblems: ProblemJSON[] = [];
    const errors: string[] = [];

    for (const file of jsonFiles) {
      try {
        const text = await file.text();
        const parsed = JSON.parse(text);

        // Check if file is a package/folder export (array of problems or object with problems array)
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            const v = validateProblemJson(item, file.name);
            newProblems.push(v);
          }
        } else if (Array.isArray(parsed.problems)) {
          for (const item of parsed.problems) {
            const v = validateProblemJson(item, file.name);
            newProblems.push(v);
          }
        } else {
          const valid = validateProblemJson(parsed, file.name);
          newProblems.push(valid);
        }
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message || 'تنسيق غير صالح'}`);
      }
    }

    if (newProblems.length === 0) {
      setFeedbackMessage({
        type: 'error',
        text: errors.join(' | ') || 'تعذر قراءة ملفات الـ JSON.',
      });
      setIsUploading(false);
      return;
    }

    // Determine folder name
    const folderTitle =
      suggestedFolderName && suggestedFolderName !== '.'
        ? suggestedFolderName
        : `مجلد مستورد (${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })})`;

    const newFolderId = `folder_custom_${Date.now()}`;
    const newFolder: ProblemFolder = {
      id: newFolderId,
      name: folderTitle,
      category: 'مخصص',
      description: `يحتوي على ${newProblems.length} مسألة تم استيرادها محلياً`,
      icon: '📁',
      isCustom: true,
      problems: newProblems,
    };

    const updated = [...folders, newFolder];
    setFolders(updated);
    saveCustomFolders(updated);
    setActiveFolderId(newFolderId);
    setSelectedProblemId(newProblems[0].problem_id);

    setFeedbackMessage({
      type: 'success',
      text: `تم استيراد المجلد بنجاح وإضافة ${newProblems.length} مسألة! ${
        errors.length > 0 ? `(تم تجاهل ${errors.length} ملف بها أخطاء)` : ''
      }`,
    });

    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (folderInputRef.current) folderInputRef.current.value = '';
  };

  // Traversal for directory drops
  const traverseEntry = async (entry: any): Promise<File[]> => {
    const list: File[] = [];
    if (entry.isFile) {
      const file: File = await new Promise((res) => entry.file(res));
      if (file.name.endsWith('.json')) list.push(file);
    } else if (entry.isDirectory) {
      const reader = entry.createReader();
      const entries: any[] = await new Promise((res) => reader.readEntries(res));
      for (const child of entries) {
        const childFiles = await traverseEntry(child);
        list.push(...childFiles);
      }
    }
    return list;
  };

  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      let folderNameDetected: string | null = null;
      const files: File[] = [];

      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.webkitGetAsEntry) {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if (entry.isDirectory && !folderNameDetected) {
              folderNameDetected = entry.name;
            }
            const found = await traverseEntry(entry);
            files.push(...found);
          }
        }
      }

      if (files.length > 0) {
        await processUploadedFiles(files, folderNameDetected || 'مجلد مسحوب');
        return;
      }
    }

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processUploadedFiles(e.dataTransfer.files);
    }
  };

  // Action: Launch problem on board
  const handleLaunch = (problemToRun?: ProblemJSON) => {
    const target = problemToRun || selectedProblem;
    if (target) {
      onImportSuccess(target);
      onClose();
    }
  };

  // Action: Download single problem JSON
  const handleDownloadProblem = (problemToDownload?: ProblemJSON) => {
    const p = problemToDownload || selectedProblem;
    if (!p) return;

    const dataStr = JSON.stringify(p, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${p.problem_id || 'problem'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Action: Download entire folder as JSON package
  const handleDownloadFolderPackage = () => {
    if (!activeFolder || activeFolder.problems.length === 0) return;

    const packageData = {
      folder_name: activeFolder.name,
      category: activeFolder.category,
      exported_at: new Date().toISOString(),
      problems_count: activeFolder.problems.length,
      problems: activeFolder.problems,
    };

    const dataStr = JSON.stringify(packageData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeFolder.id}_package.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Action: Copy JSON code
  const handleCopyJson = () => {
    if (!selectedProblem) return;
    navigator.clipboard.writeText(JSON.stringify(selectedProblem, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Action: Delete custom folder
  const handleDeleteCustomFolder = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('هل أنت متأكد من رغبتك في حذف هذا المجلد من مكتبتك؟')) return;

    const updated = folders.filter((f) => f.id !== folderId);
    setFolders(updated);
    saveCustomFolders(updated);
    if (activeFolderId === folderId) {
      setActiveFolderId(initialFolders[0].id);
    }
  };

  // Total problems across all folders
  const totalProblemsCount = folders.reduce((sum, f) => sum + f.problems.length, 0);

  return (
    <div
      id="json-folders-hub-modal"
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 dir-rtl animate-in fade-in duration-200"
    >
      <div
        id="json-folders-card"
        className="bg-white rounded-3xl max-w-6xl w-full h-[94vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xs">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white">
                  مستكشف وحزم مجلدات JSON للمسائل
                </h2>
                <span className="text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {folders.length} مجلدات • {totalProblemsCount} مسألة
                </span>
              </div>
              <p className="text-xs text-slate-400 font-bold">
                استعرض حزم المسائل، عاين الخطوات والخانات، نزل الملفات، أو ارفع مجلداتك الخاصة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Launch PDF Processor */}
            {onOpenPdfProcessor && (
              <button
                id="hub-header-open-pdf-processor-btn"
                onClick={() => {
                  onClose();
                  onOpenPdfProcessor();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-xs transition active:scale-95 shadow-xs"
                title="معالج ملفات PDF وصفحة بصفحة مع حفظ الصور في Supabase"
              >
                <FileText className="w-4 h-4 text-white" />
                <span>تحويل PDF صفحة بصفحة + Supabase</span>
              </button>
            )}

            {/* Quick Upload Action in Header */}
            <button
              id="hub-header-upload-folder-btn"
              onClick={() => folderInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition active:scale-95 shadow-xs"
            >
              <FolderUp className="w-4 h-4 text-slate-950" />
              <span>رفع مجلد جديد</span>
            </button>

            <button
              id="hub-header-upload-files-btn"
              onClick={() => fileInputRef.current?.click()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
            >
              <FileUp className="w-4 h-4 text-amber-400" />
              <span>رفع ملفات JSON</span>
            </button>

            <button
              id="close-json-hub-btn"
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              title="إغلاق النافذة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Hidden File / Folder Inputs */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          multiple
          onChange={(e) => {
            if (e.target.files) processUploadedFiles(e.target.files);
          }}
          className="hidden"
          id="hub-hidden-file-input"
        />
        <input
          ref={folderInputRef}
          type="file"
          // @ts-ignore
          webkitdirectory="true"
          directory=""
          multiple
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const first = e.target.files[0];
              let dirName = 'مجلد مستورد';
              if ((first as any).webkitRelativePath) {
                const parts = (first as any).webkitRelativePath.split('/');
                if (parts.length > 1) dirName = parts[0];
              }
              processUploadedFiles(e.target.files, dirName);
            }
          }}
          className="hidden"
          id="hub-hidden-folder-input"
        />

        {/* Notification / Feedback Banner */}
        {feedbackMessage && (
          <div
            className={`px-5 py-2.5 flex items-center justify-between text-xs font-black border-b shrink-0 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                : 'bg-rose-50 text-rose-900 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
            <button
              onClick={() => setFeedbackMessage(null)}
              className="text-slate-400 hover:text-slate-700 text-xs px-2 py-0.5"
            >
              إخفاء
            </button>
          </div>
        )}

        {/* Main Hub Body (3-Tier responsive layout) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-slate-50/50">
          
          {/* ===================== COLUMN 1: Folders & Problems Directory ===================== */}
          <div className="w-full md:w-80 lg:w-96 bg-white border-l border-slate-200 flex flex-col shrink-0 h-full overflow-hidden">
            {/* Folders Selector Bar */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  المجلدات المتاحة
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full">
                  {folders.length} مجلد
                </span>
              </div>

              {/* Folder Pills Horizontal Scroll */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {folders.map((folder) => {
                  const isActive = folder.id === activeFolderId;
                  return (
                    <button
                      key={folder.id}
                      onClick={() => {
                        setActiveFolderId(folder.id);
                        if (folder.problems.length > 0) {
                          setSelectedProblemId(folder.problems[0].problem_id);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition flex items-center gap-1.5 border ${
                        isActive
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <span>{folder.icon || '📁'}</span>
                      <span className="truncate max-w-[120px]">{folder.name}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-amber-700 text-amber-100' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {folder.problems.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Folder Header Details */}
            <div className="px-3.5 py-2.5 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between">
              <div className="truncate pr-1">
                <h3 className="text-xs font-black text-slate-900 truncate">
                  {activeFolder.name}
                </h3>
                <p className="text-[11px] text-slate-500 truncate font-bold">
                  {activeFolder.description}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Download Folder Package Button */}
                <button
                  onClick={handleDownloadFolderPackage}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 transition"
                  title="تنزيل حزمة هذا المجلد بالكامل (.json)"
                >
                  <FolderDown className="w-4 h-4" />
                </button>

                {activeFolder.isCustom && (
                  <button
                    onClick={(e) => handleDeleteCustomFolder(activeFolder.id, e)}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition"
                    title="حذف هذا المجلد المخصص"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Search Input */}
            <div className="p-2.5 border-b border-slate-100">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن مسألة في هذا المجلد..."
                  className="w-full pr-9 pl-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition"
                />
              </div>
            </div>

            {/* Problems List in Selected Folder */}
            <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
              {filteredProblems.length === 0 ? (
                <div className="text-center py-10 px-4 text-slate-400">
                  <FileJson className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-black">لا توجد مسائل مطابقة</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    جرب البحث بكلمات أخرى أو ارفع مسائل جديدة لهذا المجلد
                  </p>
                </div>
              ) : (
                filteredProblems.map((prob) => {
                  const isSelected = prob.problem_id === selectedProblem?.problem_id;
                  const boxesCount = countBoxesInProblem(prob);
                  return (
                    <div
                      key={prob.problem_id}
                      onClick={() => setSelectedProblemId(prob.problem_id)}
                      className={`p-3 rounded-2xl border text-right cursor-pointer transition flex flex-col justify-between gap-2 relative group ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/80 shadow-xs ring-2 ring-amber-400/20'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md truncate max-w-[150px]">
                          {prob.problem_id}
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {prob.steps.length} خطوات
                          </span>
                          <span className="text-[10px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            {boxesCount} خانات
                          </span>
                        </div>
                      </div>

                      <h4 className="text-xs font-black text-slate-900 line-clamp-2 leading-relaxed">
                        {prob.title || 'مسألة تفاعلية'}
                      </h4>

                      {/* Quick Hover Action to Run */}
                      <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px]">
                        <span className="text-slate-400 font-bold text-[10px]">
                          {prob.category || activeFolder.category}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLaunch(prob);
                          }}
                          className="flex items-center gap-1 text-amber-700 hover:text-amber-900 font-black text-[11px] group-hover:underline"
                        >
                          <span>تشغيل</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Drop / Import Area at Bottom of Left Column */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={`p-3 border-t border-slate-200 transition text-center shrink-0 ${
                isDragOver
                  ? 'bg-amber-100/80 border-amber-500'
                  : 'bg-slate-100/50 hover:bg-amber-50/40'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-xs font-black text-slate-700">
                <FolderUp className="w-4 h-4 text-amber-600" />
                <span>اسحب مجلداً أو ملفات JSON هنا</span>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold shadow-2xs transition"
                >
                  رفع مجلد
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold shadow-2xs transition"
                >
                  رفع ملف
                </button>
              </div>
            </div>
          </div>

          {/* ===================== COLUMN 2: Live Preview & Inspection ===================== */}
          <div className="flex-1 flex flex-col h-full overflow-hidden bg-white">
            {selectedProblem ? (
              <>
                {/* Problem Inspector Header */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[11px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
                        {selectedProblem.category || activeFolder.category}
                      </span>
                      <span className="text-[11px] font-mono text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                        {selectedProblem.problem_id}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        {selectedProblem.steps.length} خطوات • {countBoxesInProblem(selectedProblem)} خانة تفاعلية
                      </span>
                    </div>
                    <h3 className="text-sm md:text-base font-black text-slate-900 leading-snug">
                      {selectedProblem.title}
                    </h3>
                  </div>

                  {/* Primary Actions (Run on Board & Download) */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      id="launch-selected-problem-btn"
                      onClick={() => handleLaunch()}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-black text-xs flex items-center gap-2 shadow-md transition active:scale-95"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>تشغيل على السبورة</span>
                    </button>

                    <button
                      onClick={() => handleDownloadProblem()}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                      title="تنزيل ملف JSON لهذه المسألة"
                    >
                      <Download className="w-4 h-4 text-slate-600" />
                      <span className="hidden sm:inline">تنزيل JSON</span>
                    </button>
                  </div>
                </div>

                {/* Switcher Tab: Visual Preview vs Raw JSON */}
                <div className="px-4 py-2 border-b border-slate-200 bg-white flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveTab('preview')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                        activeTab === 'preview'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>معاينة الخطوات والخانات</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('json')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition ${
                        activeTab === 'json'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>كود JSON الصافي</span>
                    </button>
                  </div>

                  {activeTab === 'json' && (
                    <button
                      onClick={handleCopyJson}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-lg transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>نسخ الكود</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Content Container */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
                  {activeTab === 'preview' ? (
                    <div className="space-y-4 max-w-4xl mx-auto">
                      {/* Formula & Atomic weights banner if present */}
                      {(selectedProblem.latex_formula || selectedProblem.atomic_weights) && (
                        <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                          {selectedProblem.latex_formula && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-950">القانون الرياضي:</span>
                              <span className="font-mono dir-ltr font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                                {selectedProblem.latex_formula}
                              </span>
                            </div>
                          )}
                          {selectedProblem.atomic_weights && (
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-amber-950">المعطيات:</span>
                              <span className="font-mono dir-ltr text-slate-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                                {selectedProblem.atomic_weights}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Steps Breakdown */}
                      {selectedProblem.steps.map((step, idx) => (
                        <div
                          key={step.step_id || idx}
                          className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <span className="text-xs font-black text-slate-900 flex items-center gap-2">
                              <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[11px]">
                                {idx + 1}
                              </span>
                              <span>{step.title}</span>
                            </span>
                            {step.explanation && (
                              <span className="text-[11px] text-slate-500 font-bold hidden sm:inline">
                                {step.explanation}
                              </span>
                            )}
                          </div>

                          {/* 1. Element-based step preview (Static + Box) */}
                          {step.elements && step.elements.length > 0 && (
                            <div className="space-y-3">
                              <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-base dir-ltr flex flex-wrap items-center gap-2">
                                {step.elements.map((el, elIdx) => {
                                  if (el.type === 'static') {
                                    return (
                                      <span key={elIdx} className="text-amber-400 font-bold tracking-wide">
                                        {el.content}
                                      </span>
                                    );
                                  }
                                  if (el.type === 'box') {
                                    return (
                                      <span
                                        key={elIdx}
                                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black border border-amber-300 shadow-xs flex items-center gap-1"
                                      >
                                        <span>[ {el.correct_value} ]</span>
                                      </span>
                                    );
                                  }
                                  return null;
                                })}
                              </div>

                              {/* Boxes Details & Options Inspection */}
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                {step.elements
                                  .filter((el): el is Extract<typeof el, { type: 'box' }> => el.type === 'box')
                                  .map((box, bIdx) => (
                                    <div
                                      key={box.box_id || bIdx}
                                      className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="font-black text-slate-800 flex items-center gap-1">
                                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                                          <span>{box.box_title || `خانة (${box.box_id})`}</span>
                                        </span>
                                        <span className="font-mono text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                          الصحيح: {box.correct_value}
                                        </span>
                                      </div>

                                      {/* Options 4 Pills */}
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-[10px] text-slate-400 font-bold">الخيارات الـ 4:</span>
                                        {box.options?.map((opt, optIdx) => {
                                          const isCorrect = opt === box.correct_value;
                                          return (
                                            <span
                                              key={optIdx}
                                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                                                isCorrect
                                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                                  : 'bg-white text-slate-600 border border-slate-200'
                                              }`}
                                            >
                                              {opt} {isCorrect ? '✓' : ''}
                                            </span>
                                          );
                                        })}
                                      </div>

                                      {box.hint && (
                                        <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1 pt-1 border-t border-slate-200/60">
                                          <HelpCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                          <span>التلميح: {box.hint}</span>
                                        </p>
                                      )}
                                    </div>
                                  ))}
                              </div>
                            </div>
                          )}

                          {/* 2. Equation rows preview (legacy / fraction formats / inline elements) */}
                          {step.equation_rows && step.equation_rows.length > 0 && (
                            <div className="space-y-3">
                              {step.equation_rows.map((row) => (
                                <div key={row.row_id} className="space-y-2">
                                  {row.elements ? (
                                    <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-base dir-ltr flex flex-wrap items-center gap-2">
                                      {row.elements.map((el, elIdx) => {
                                        if (el.type === 'static') {
                                          return (
                                            <span key={elIdx} className="text-amber-400 font-bold tracking-wide">
                                              {el.content}
                                            </span>
                                          );
                                        }
                                        if (el.type === 'box') {
                                          return (
                                            <span
                                              key={elIdx}
                                              className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black border border-amber-300 shadow-xs flex items-center gap-1"
                                            >
                                              <span>[ {el.correct_value} ]</span>
                                            </span>
                                          );
                                        }
                                        return null;
                                      })}
                                    </div>
                                  ) : (
                                    <div className="p-3 bg-slate-900 rounded-xl text-white font-mono text-sm dir-ltr flex flex-wrap items-center gap-2">
                                      <span className="text-amber-300 font-bold">{row.equation_format}</span>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 3. Inputs list if legacy */}
                          {step.inputs && step.inputs.length > 0 && !step.elements && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {step.inputs.map((inp) => (
                                <div
                                  key={inp.id}
                                  className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-slate-800">{inp.label}</span>
                                    <span className="font-mono text-emerald-800 font-black bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                                      {inp.correct_value}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 flex-wrap">
                                    {inp.allowed_keys.map((k, kidx) => (
                                      <span
                                        key={kidx}
                                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                          k === inp.correct_value
                                            ? 'bg-emerald-100 text-emerald-800 font-black'
                                            : 'bg-white text-slate-600 border'
                                        }`}
                                      >
                                        {k}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Raw JSON View */
                    <div className="h-full bg-slate-900 rounded-2xl p-4 overflow-auto text-xs font-mono text-amber-300 dir-ltr">
                      <pre>{JSON.stringify(selectedProblem, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
                <FolderOpen className="w-12 h-12 mb-3 text-slate-300" />
                <h3 className="text-sm font-black text-slate-700">لم يتم اختيار أي مسألة</h3>
                <p className="text-xs text-slate-500 mt-1">
                  اختر مسألة من القائمة في اليمين لمعاينتها أو تشغيلها
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Summary & Template Download */}
        <div className="px-5 py-3 bg-white border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3 text-slate-500 font-bold">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>المجلد الحالي: {activeFolder.name}</span>
            </span>
            <span>•</span>
            <span>{activeFolder.problems.length} مسألة جاهزة للتنفيذ</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadFolderPackage}
              className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <FolderDown className="w-4 h-4 text-amber-600" />
              <span>تنزيل كامل المجلد ({activeFolder.problems.length} مسائل)</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition"
            >
              إغلاق
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
