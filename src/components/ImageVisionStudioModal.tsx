import React, { useState, useRef, useEffect } from 'react';
import {
  ScanSearch,
  UploadCloud,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  Copy,
  Download,
  Eye,
  Crop,
  Layers,
  ArrowRight,
  Code2,
  HelpCircle,
  Cpu,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { ProblemJSON } from '../types';

interface ImageVisionStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProblem: (problem: ProblemJSON) => void;
}

export type ApiRouteOption = {
  id: string;
  name: string;
  endpoint: string;
  subject: string;
  description: string;
  badge: string;
  badgeColor: string;
};

const API_ROUTES: ApiRouteOption[] = [
  {
    id: 'physics',
    name: 'مسار فيزياء السادس',
    endpoint: 'https://hhh-two-black.vercel.app/api/ocr',
    subject: 'الفيزياء',
    description: 'مخصص لدوائر التيار المتناوب RLC، المحثات، المتسعات، والرسومات الهندسية الحثية والمغناطيسية.',
    badge: 'RLC & Induction',
    badgeColor: 'bg-blue-600 text-white',
  },
  {
    id: 'chemistry',
    name: 'مسار كيمياء السادس',
    endpoint: 'https://hhh-main-wheat.vercel.app/api/ocr',
    subject: 'الكيمياء',
    description: 'مخصص لمخططات طاقة التفاعلات، الخلايا الكلفانية والإلكتروليتية، ومسائل الاتزان وبفر.',
    badge: 'Electro & Buffer',
    badgeColor: 'bg-emerald-600 text-white',
  },
  {
    id: 'math',
    name: 'مسار رياضيات السادس',
    endpoint: 'https://superb-centaur-deea8c.netlify.app/api/friend-ocr',
    subject: 'الرياضيات',
    description: 'مخصص لمنحنيات الدوال، نقاط الانقلاب، والتكامل المحدد وحساب المساحات المظللة.',
    badge: 'Curves & Calculus',
    badgeColor: 'bg-purple-600 text-white',
  },
  {
    id: 'general',
    name: 'المسار الشامل الذاتي',
    endpoint: 'https://starlit-duckanoo-496fde.netlify.app/api/mmm-friend-ocr',
    subject: 'عام',
    description: 'كشف وتحليل وتصنيف تلقائي للمسألة والرسم لأي مادة علمية وفق معايير الامتحان الوزاري.',
    badge: 'Universal AI',
    badgeColor: 'bg-amber-500 text-slate-950',
  },
];

// Rotate endpoints between requests to distribute traffic evenly.
let currentApiIndex = 0;

// Sample pre-generated exam test papers with diagrams
const SAMPLE_TEST_PAPERS = [
  {
    id: 'sample_physics_rlc',
    title: 'فيزياء: دائرة تيار متناوب RLC متوالية الربط (وزاري)',
    subject: 'الفيزياء',
    routeId: 'physics',
    generateCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      // Paper background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Header rule
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(30, 40);
      ctx.lineTo(width - 30, 40);
      ctx.stroke();

      // Exam text
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('جمهورية العراق - وزارة التربية / الامتحان الوزاري للفيزياء', width - 40, 28);
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('س3/ دائرة تيار متناوب متوالية الربط موضحة بالشكل أدناه:', width - 40, 68);
      ctx.font = '13px sans-serif';
      ctx.fillText('تحتوي مقاومة R = 40 Ω ومحث صرف معامل حثه L = 1.6/π H ومتسعة ومصدر V=100V.', width - 40, 92);
      ctx.fillText('إذا كانت الممانعة الكلية Z = 50 Ω وللدائرة خواص حثية، احسب رادة الحث وسعة المتسعة.', width - 40, 115);

      // Draw diagram inside a bordered diagram box (approx ymin=140, xmin=80, ymax=340, xmax=420)
      const dx = 60;
      const dy = 135;
      const dw = 380;
      const dh = 180;

      // Diagram frame
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(dx, dy, dw, dh);
      ctx.fillRect(dx, dy, dw, dh);

      ctx.direction = 'ltr';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText('Circuit Diagram: R-L-C Series Connection', dx + 15, dy + 22);

      // Draw R, L, C circuit in loop
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // AC Source
      const cx = dx + 60;
      const cy = dy + 100;
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('~', cx - 6, cy + 5);
      ctx.font = '11px sans-serif';
      ctx.fillText('V=100V', cx - 20, cy + 38);

      // Wires to Top
      ctx.beginPath();
      ctx.moveTo(cx, cy - 22);
      ctx.lineTo(cx, dy + 50);
      ctx.lineTo(dx + 130, dy + 50);
      ctx.stroke();

      // Resistor R
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(dx + 130, dy + 42, 45, 16);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('R=40Ω', dx + 133, dy + 54);

      // Wire to Inductor L
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(dx + 175, dy + 50);
      ctx.lineTo(dx + 210, dy + 50);
      ctx.stroke();

      // Inductor coils
      ctx.strokeStyle = '#d97706';
      ctx.beginPath();
      ctx.arc(dx + 220, dy + 50, 10, Math.PI, 0);
      ctx.arc(dx + 240, dy + 50, 10, Math.PI, 0);
      ctx.arc(dx + 260, dy + 50, 10, Math.PI, 0);
      ctx.stroke();
      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('L=1.6/π H', dx + 218, dy + 32);

      // Wire to Capacitor C
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(dx + 270, dy + 50);
      ctx.lineTo(dx + 305, dy + 50);
      ctx.stroke();

      // Capacitor parallel plates
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(dx + 305, dy + 38);
      ctx.lineTo(dx + 305, dy + 62);
      ctx.moveTo(dx + 315, dy + 38);
      ctx.lineTo(dx + 315, dy + 62);
      ctx.stroke();
      ctx.fillStyle = '#14532d';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('C = ?', dx + 305, dy + 30);

      // Return wire
      ctx.strokeStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(dx + 315, dy + 50);
      ctx.lineTo(dx + 350, dy + 50);
      ctx.lineTo(dx + 350, dy + 150);
      ctx.lineTo(cx, dy + 150);
      ctx.lineTo(cx, cy + 22);
      ctx.stroke();

      // Ground / Note
      ctx.direction = 'rtl';
      ctx.font = '11px sans-serif';
      ctx.fillStyle = '#334155';
      ctx.fillText('الشكل (3-1): ربط توالي لمجموعة متسعة ومحث ومقاومة.', dx + 260, dy + 170);
    },
    defaultBox: [330, 120, 780, 880], // [ymin, xmin, ymax, xmax] in 0-1000 range
  },
  {
    id: 'sample_math_curve',
    title: 'رياضيات: رسم بياني لمنحنى دالة ونقطة انقلاب (وزاري)',
    subject: 'الرياضيات',
    routeId: 'math',
    generateCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('وزارة التربية - الرياضيات / السادس العلمي - التفاضل', width - 40, 30);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('س1/ باستخدام معلوماتك في التفاضل والمخطط البياني المرفق:', width - 40, 65);
      ctx.font = '12px sans-serif';
      ctx.fillText('أثبت أن النقطة (1,0) تمثل نقطة انقلاب للدالة f(x) = x³ - 3x² + 2 وجد ميل المماس عندها.', width - 40, 88);

      // Graph box
      const gx = 90;
      const gy = 120;
      const gw = 320;
      const gh = 210;

      ctx.fillStyle = '#f1f5f9';
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(gx, gy, gw, gh);
      ctx.fillRect(gx, gy, gw, gh);

      // Grid lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 20; i < gw; i += 30) {
        ctx.beginPath();
        ctx.moveTo(gx + i, gy);
        ctx.lineTo(gx + i, gy + gh);
        ctx.stroke();
      }
      for (let j = 20; j < gh; j += 30) {
        ctx.beginPath();
        ctx.moveTo(gx, gy + j);
        ctx.lineTo(gx + gw, gy + j);
        ctx.stroke();
      }

      // X and Y Axes
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      // X-axis
      ctx.beginPath();
      ctx.moveTo(gx + 10, gy + gh / 2);
      ctx.lineTo(gx + gw - 10, gy + gh / 2);
      ctx.stroke();
      // Y-axis
      ctx.beginPath();
      ctx.moveTo(gx + gw / 2, gy + 10);
      ctx.lineTo(gx + gw / 2, gy + gh - 10);
      ctx.stroke();

      // Curve
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const midX = gx + gw / 2;
      const midY = gy + gh / 2;
      for (let x = -100; x <= 100; x += 4) {
        const nx = x / 35;
        const ny = nx * nx * nx - 2 * nx; // cubic curve
        const px = midX + x;
        const py = midY - ny * 35;
        if (x === -100) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Inflection Point Highlight
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(midX + 25, midY - 5, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.direction = 'ltr';
      ctx.fillStyle = '#b91c1c';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('Inflection Point (1, 0)', midX + 35, midY - 5);
      ctx.fillStyle = '#6d28d9';
      ctx.fillText('y = f(x)', gx + 20, gy + 30);
    },
    defaultBox: [290, 180, 840, 820],
  },
  {
    id: 'sample_chem_galvanic',
    title: 'كيمياء: خلية كلفانية دانيال وأقطاب التفاعل (وزاري)',
    subject: 'الكيمياء',
    routeId: 'chemistry',
    generateCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('الكيمياء - الفصل الرابع (الكيمياء الكهربائية) / الامتحان الوزاري', width - 40, 30);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('س2/ في الخلية الكلفانية الموضحة في الرسم أدناه:', width - 40, 65);
      ctx.font = '12px sans-serif';
      ctx.fillText('إذا علمت أن جهود الاختزال القياسية E°(Zn) = -0.76 V و E°(Cu) = +0.34 V، احسب جهد الخلية القياسي.', width - 40, 88);

      // Beakers & Salt Bridge
      const bx = 80;
      const by = 130;
      const bw = 340;
      const bh = 190;

      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(bx, by, bw, bh);
      ctx.fillRect(bx, by, bw, bh);

      // Beaker 1 (ZnSO4)
      ctx.fillStyle = '#e0f2fe';
      ctx.fillRect(bx + 40, by + 70, 80, 90);
      ctx.strokeStyle = '#0284c7';
      ctx.strokeRect(bx + 40, by + 70, 80, 90);

      // Zn Electrode
      ctx.fillStyle = '#64748b';
      ctx.fillRect(bx + 65, by + 40, 30, 90);

      // Beaker 2 (CuSO4)
      ctx.fillStyle = '#dbeafe';
      ctx.fillRect(bx + 220, by + 70, 80, 90);
      ctx.strokeStyle = '#1d4ed8';
      ctx.strokeRect(bx + 220, by + 70, 80, 90);

      // Cu Electrode
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(bx + 245, by + 40, 30, 90);

      // Salt Bridge (U-tube inverted)
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(bx + 95, by + 120);
      ctx.lineTo(bx + 95, by + 50);
      ctx.lineTo(bx + 245, by + 50);
      ctx.lineTo(bx + 245, by + 120);
      ctx.stroke();

      // Voltmeter on top wire
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx + 80, by + 40);
      ctx.lineTo(bx + 80, by + 20);
      ctx.lineTo(bx + 170, by + 20);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + 260, by + 40);
      ctx.lineTo(bx + 260, by + 20);
      ctx.lineTo(bx + 170, by + 20);
      ctx.stroke();

      // Voltmeter circle
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#ca8a04';
      ctx.beginPath();
      ctx.arc(bx + 170, by + 20, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#854d0e';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText('V', bx + 165, by + 24);

      ctx.direction = 'rtl';
      ctx.fillStyle = '#334155';
      ctx.font = '11px sans-serif';
      ctx.fillText('خلية دانيال القياسية (Danial Cell)', bx + 220, by + 180);
    },
    defaultBox: [310, 160, 820, 860],
  },
  {
    id: 'sample_phys_faraday',
    title: 'فيزياء: ساق موصلة تنزلق على سكة وسلك في مجال مغناطيسي (وزاري)',
    subject: 'الفيزياء',
    routeId: 'physics',
    generateCanvas: (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 15px sans-serif';
      ctx.direction = 'rtl';
      ctx.fillText('الفيزياء - الفصل الثاني (الحث الكهرومغناطيسي) / وزاري', width - 40, 30);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('س4/ ساق موصلة طولها l = 0.1 m تنزلق بسرعة v = 2.5 m/s عمودياً على سكة:', width - 40, 65);
      ctx.font = '12px sans-serif';
      ctx.fillText('داخل مجال مغناطيسي منتظم كثافة فيضه B = 0.6 T ومقاومة الدائرة R = 0.03 Ω. احسب القوة الدافعة الحركية ε_mot.', width - 40, 88);

      const sx = 80;
      const sy = 120;
      const sw = 340;
      const sh = 190;

      ctx.fillStyle = '#fdf4ff';
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(sx, sy, sw, sh);
      ctx.fillRect(sx, sy, sw, sh);

      // Magnetic field crosses (into page)
      ctx.fillStyle = '#9333ea';
      ctx.font = '14px sans-serif';
      for (let r = 20; r < sw; r += 45) {
        for (let c = 20; c < sh; c += 40) {
          ctx.fillText('×', sx + r, sy + c);
        }
      }

      // U-shaped Rails
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(sx + sw - 30, sy + 45);
      ctx.lineTo(sx + 40, sy + 45);
      ctx.lineTo(sx + 40, sy + sh - 45);
      ctx.lineTo(sx + sw - 30, sy + sh - 45);
      ctx.stroke();

      // Light Bulb on rail
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(sx + 40, sy + sh / 2, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#a16207';
      ctx.font = 'bold 10px sans-serif';
      ctx.fillText('R', sx + 36, sy + sh / 2 + 4);

      // Sliding Rod
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(sx + 180, sy + 35);
      ctx.lineTo(sx + 180, sy + sh - 35);
      ctx.stroke();

      // Velocity vector v ->
      ctx.strokeStyle = '#2563eb';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx + 180, sy + sh / 2);
      ctx.lineTo(sx + 240, sy + sh / 2);
      ctx.lineTo(sx + 230, sy + sh / 2 - 5);
      ctx.moveTo(sx + 240, sy + sh / 2);
      ctx.lineTo(sx + 230, sy + sh / 2 + 5);
      ctx.stroke();
      ctx.fillStyle = '#1d4ed8';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText('v = 2.5 m/s', sx + 195, sy + sh / 2 - 10);
      ctx.fillStyle = '#9333ea';
      ctx.fillText('B (عمودي نحو الداخل)', sx + 200, sy + sh - 20);
    },
    defaultBox: [300, 160, 830, 860],
  },
];

export const ImageVisionStudioModal: React.FC<ImageVisionStudioModalProps> = ({
  isOpen,
  onClose,
  onApplyProblem,
}) => {
  const [selectedRoute, setSelectedRoute] = useState<string>('physics');
  const [customEndpointUrl, setCustomEndpointUrl] = useState<string>('');
  const [useCustomEndpoint, setUseCustomEndpoint] = useState<boolean>(false);

  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [croppedDiagramUrl, setCroppedDiagramUrl] = useState<string | null>(null);
  const [diagramBox, setDiagramBox] = useState<[number, number, number, number] | null>(null);

  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'json' | 'crop'>('preview');
  const [extractedProblem, setExtractedProblem] = useState<ProblemJSON | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize with the first sample on mount if no image
  useEffect(() => {
    if (isOpen && !imagePreviewUrl) {
      loadSample(SAMPLE_TEST_PAPERS[0]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Load sample paper into Canvas and extract as base64 image
  const loadSample = (sample: typeof SAMPLE_TEST_PAPERS[0]) => {
    const canvas = document.createElement('canvas');
    canvas.width = 500;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      sample.generateCanvas(ctx, 500, 400);
      const dataUrl = canvas.toDataURL('image/png');
      setImagePreviewUrl(dataUrl);
      setSelectedRoute(sample.routeId);
      setExtractedProblem(null);
      setCroppedDiagramUrl(null);
      setDiagramBox(sample.defaultBox as [number, number, number, number]);
      setStatusMessage(`تم تحميل العينة الوزارية: "${sample.title}". اضغط "تحليل واستخراج الـ JSON والرسم" لتجربة المسار.`);
    }
  };

  // Handle custom file upload from user
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImagePreviewUrl(dataUrl);
      setExtractedProblem(null);
      setCroppedDiagramUrl(null);
      setDiagramBox(null);
      setStatusMessage('تم تحميل الصورة بنجاح. يمكنك الآن اختيار مسار الـ API والضغط على زر التحليل.');
    };
    reader.readAsDataURL(file);
  };

  // Crop diagram from image using [ymin, xmin, ymax, xmax] (0 to 1000 percentage) with safety padding
  const cropDiagramFromImage = (
    imageUrl: string,
    box: [number, number, number, number],
    paddingPx: number = 20
  ): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const [ymin, xmin, ymax, xmax] = box;

        // Apply safety padding around the diagram box
        const xminPx = Math.max(0, ((xmin / 1000) * w) - paddingPx);
        const yminPx = Math.max(0, ((ymin / 1000) * h) - paddingPx);
        const xmaxPx = Math.min(w, ((xmax / 1000) * w) + paddingPx);
        const ymaxPx = Math.min(h, ((ymax / 1000) * h) + paddingPx);

        const cropW = xmaxPx - xminPx;
        const cropH = ymaxPx - yminPx;

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(cropW, 50);
        canvas.height = Math.max(cropH, 50);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, xminPx, yminPx, cropW, cropH, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png', 0.95));
        } else {
          resolve(imageUrl);
        }
      };
      img.onerror = () => resolve(imageUrl);
      img.src = imageUrl;
    });
  };

  // Trigger conversion through a rotating queue of OCR endpoints with fallback retries.
  const handleRunConversion = async () => {
    if (!imagePreviewUrl) {
      alert('يرجى اختيار أو رفع صورة أولاً.');
      return;
    }

    setLoading(true);
    setStatusMessage('جاري إرسال الصورة إلى مسارات OCR بالتتابع واستخراج خطوات المسألة وصندوق الرسم...');

    try {
      const currentRoute = API_ROUTES.find((r) => r.id === selectedRoute) || API_ROUTES[0];
      const endpointQueue = useCustomEndpoint && customEndpointUrl.trim()
        ? [customEndpointUrl.trim()]
        : Array.from({ length: API_ROUTES.length }, (_, offset) => (
            API_ROUTES[(currentApiIndex + offset) % API_ROUTES.length].endpoint
          ));
      if (!useCustomEndpoint) {
        currentApiIndex = (currentApiIndex + 1) % API_ROUTES.length;
      }
      const promptText = `حلّل صورة المسألة التعليمية المرفقة باللغة العربية. استخرج نص السؤال وخطوات الحل، وأعد JSON متوافقاً مع بنية ProblemJSON في هذا التطبيق. طبّق قواعد الرسم التالية بحزم شديدة:

1. يُحظر منعاً باتاً تضمين أي كلمات أو أحرف أو أرقام عربية أو إنجليزية تقع فوق الرسم أو تحته داخل diagram_box.
2. يجب أن يبدأ diagram_box من الحافة الخارجية للخط الهندسي الأول للرسم، مثل رأس المثلث أو زاوية المربع، وينتهي عند آخر خط هندسي للرسم.
3. إذا وُجد رسمان بجانب بعضهما، مثل مثلث ومربع، فاجعل لكل شكل diagram_box منفصلاً ودقيقاً إن كانت بنية JSON تسمح بذلك، أو اختر الرسم الهندسي الأساسي فقط دون النصوص المحيطة.
4. ركّز بصرياً على الخطوط والأشكال الهندسية فقط، وتجاهل عناوين الرسم والشرح والأرقام والوحدات.
5. أعد diagram_box بإحداثيات [ymin, xmin, ymax, xmax] من 0 إلى 1000، واحرص على ألا يتضمن مساحة النص أعلى الرسم أو أسفله.

لا تضف Markdown أو شروحات خارج JSON.`;
      const imageResponse = await fetch(imagePreviewUrl);
      const imageBlob = await imageResponse.blob();
      let responseJson: any = null;
      let lastError = 'فشلت جميع مسارات OCR';

      for (const endpoint of endpointQueue) {
        try {
          const formData = new FormData();
          formData.append('image', imageBlob, 'problem.png');
          formData.append('prompt', promptText);

          const response = await fetch(endpoint, {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            responseJson = await response.json();
            break;
          }
          lastError = `${endpoint} أعاد رمز الحالة ${response.status}`;
        } catch (endpointError: any) {
          lastError = `${endpoint}: ${endpointError?.message || endpointError}`;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      if (!responseJson) {
        throw new Error(`${lastError}. فشلت جميع مسارات OCR الأربعة.`);
      }
      
      // Support both { problems: [...] } array and single ProblemJSON
      let problemData: ProblemJSON;
      if (Array.isArray(responseJson.problems) && responseJson.problems.length > 0) {
        problemData = responseJson.problems[0];
      } else {
        problemData = responseJson;
      }

      // If diagram box exists or sample box fallback
      const box = problemData.diagram_box || diagramBox || [150, 100, 480, 450];
      setDiagramBox(box as [number, number, number, number]);

      // Crop the diagram directly in client canvas with 20px padding
      const cropped = await cropDiagramFromImage(imagePreviewUrl, box as [number, number, number, number], 20);
      setCroppedDiagramUrl(cropped);

      // Attach cropped image_url into the problem json
      const finalProblem: ProblemJSON = {
        ...problemData,
        has_diagram: true,
        diagram_box: box as [number, number, number, number],
        image_url: cropped,
      };

      setExtractedProblem(finalProblem);
      setStatusMessage('تم استخراج ملف JSON وقص الرسم بنجاح عبر مسار OCR متاح! يمكنك مراجعة النتيجة وتطبيقها فوراً على السبورة.');
    } catch (err: any) {
      console.error('Conversion failed:', err);
      setStatusMessage(`حدث خطأ أثناء الاتصال بالـ API: ${err.message || err}.`);
    } finally {
      setLoading(false);
    }
  };

  // Copy JSON
  const handleCopyJson = () => {
    if (!extractedProblem) return;
    navigator.clipboard.writeText(JSON.stringify(extractedProblem, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Download JSON
  const handleDownloadJson = () => {
    if (!extractedProblem) return;
    const blob = new Blob([JSON.stringify(extractedProblem, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${extractedProblem.problem_id || 'problem'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      id="image-vision-studio-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner">
              <ScanSearch className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-white font-black text-base md:text-lg">
                  مختبر تحويل الصور واستخراج الرسوم (OCR & Diagram Studio)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono text-[10px] border border-amber-500/40">
                  4 API Routes
                </span>
              </div>
              <p className="text-slate-400 text-xs">
                ارفع صورة المسألة، اختر أحد مسارات الـ API الـ 4، وشاهد استخراج الصندوق المحيط وقص الرسم وتوليد الـ JSON فورياً
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Section 1: Choose from the 4 API Routes */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-amber-400 flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span>اختر مسار الـ API المخصص للمعالجة:</span>
              </label>
              <div className="flex items-center gap-2">
                <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useCustomEndpoint}
                    onChange={(e) => setUseCustomEndpoint(e.target.checked)}
                    className="rounded text-amber-500 focus:ring-amber-500"
                  />
                  <span>استخدام مسار API مخصص (Custom URL)</span>
                </label>
              </div>
            </div>

            {useCustomEndpoint ? (
              <div className="p-3 bg-slate-950 rounded-2xl border border-amber-500/40 space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customEndpointUrl}
                    onChange={(e) => setCustomEndpointUrl(e.target.value)}
                    placeholder="https://your-api.com/api/process-image أو /api/vision/custom"
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs font-mono focus:border-amber-400 outline-hidden"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  يمكنك وضع رابط أي خادم خارجي أو مسار داخلي لإرسال كائن الصورة إليه.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {API_ROUTES.map((route) => {
                  const isSelected = selectedRoute === route.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRoute(route.id)}
                      className={`text-right p-3.5 rounded-2xl border transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 text-white shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${route.badgeColor}`}>
                          {route.badge}
                        </span>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="font-black text-xs md:text-sm text-white mb-1">{route.name}</div>
                      <div className="font-mono text-[10px] text-amber-300/80 mb-1.5 dir-ltr text-right truncate">
                        {route.endpoint}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                        {route.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Choose sample paper or upload user image */}
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-black text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span>اختر عينة امتحان وزاري جاهزة (تحتوي رسماً) أو ارفع صورتك الخاصة:</span>
              </label>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black border border-slate-700 transition"
              >
                <UploadCloud className="w-4 h-4 text-amber-400" />
                <span>رفع صورة من جهازك (PNG / JPG)</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Samples carousel */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {SAMPLE_TEST_PAPERS.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => loadSample(sample)}
                  className="text-right p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40 text-xs transition group"
                >
                  <div className="font-bold text-white group-hover:text-amber-300 transition line-clamp-1 mb-1">
                    {sample.title}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    عينة مع رسم بياني متكامل
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Dual Workspace (Original with Bounding Box VS Extracted Cropped Diagram) */}
          {imagePreviewUrl && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 bg-slate-950 rounded-2xl border border-slate-800">
              {/* Left Column: Original Image & Bounding Box Overlay */}
              <div className="lg:col-span-6 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-black">
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-amber-400" />
                    <span>الصورة الأصلية مع إطار تحديد الرسم (Bounding Box):</span>
                  </span>
                  {diagramBox && (
                    <span className="font-mono text-[10px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                      [{diagramBox.join(', ')}]
                    </span>
                  )}
                </div>

                <div className="relative rounded-xl overflow-hidden border border-slate-700 bg-slate-900 flex items-center justify-center p-2 min-h-[220px]">
                  <img
                    src={imagePreviewUrl}
                    alt="ورقة المسألة الأصلية"
                    className="max-h-[280px] w-auto object-contain rounded-lg shadow-md"
                  />

                  {/* Bounding box visual overlay */}
                  {diagramBox && (
                    <div
                      className="absolute border-2 border-amber-400 bg-amber-400/20 rounded-md pointer-events-none transition-all shadow-[0_0_12px_rgba(251,191,36,0.5)] flex items-start justify-end p-1"
                      style={{
                        top: `${diagramBox[0] / 10}%`,
                        left: `${diagramBox[1] / 10}%`,
                        height: `${(diagramBox[2] - diagramBox[0]) / 10}%`,
                        width: `${(diagramBox[3] - diagramBox[1]) / 10}%`,
                      }}
                    >
                      <span className="text-[9px] font-black bg-amber-500 text-slate-950 px-1 rounded-sm shadow-xs">
                        منطقة الرسم المقصوص
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Cropped Diagram Preview & Actions */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 font-black">
                    <span className="flex items-center gap-1.5">
                      <Crop className="w-3.5 h-3.5 text-emerald-400" />
                      <span>معاينة الرسم المقصوص (Cropped Diagram):</span>
                    </span>
                    {croppedDiagramUrl && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>تم القص بنجاح</span>
                      </span>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 min-h-[200px] flex flex-col items-center justify-center relative">
                    {croppedDiagramUrl ? (
                      <div className="flex flex-col items-center gap-2">
                        <img
                          src={croppedDiagramUrl}
                          alt="الرسم المقصوص"
                          className="max-h-[170px] rounded-lg border border-slate-600 bg-white p-1 shadow-lg object-contain"
                        />
                        <span className="text-[11px] text-slate-400 font-bold">
                          هذا الرسم سيظهر أعلى المسألة تلقائياً داخل السبورة التفاعلية
                        </span>
                      </div>
                    ) : (
                      <div className="text-center p-4 text-slate-500 space-y-2">
                        <Crop className="w-8 h-8 mx-auto text-slate-600 opacity-60" />
                        <p className="text-xs">
                          اضغط على زر التحليل أدناه ليقوم الـ API باكتشاف حدود الرسم وقصه وعرضه هنا فوراً.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Action Button */}
                <button
                  onClick={handleRunConversion}
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>جاري إرسال الصورة ومعالجة الـ API...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>تحليل واستخراج الـ JSON والرسم عبر المسار المختار</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Status Alert Banner */}
          {statusMessage && (
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
              <span>{statusMessage}</span>
            </div>
          )}

          {/* Section 4: Result Preview & JSON Viewer */}
          {extractedProblem && (
            <div className="space-y-4 pt-2 border-t border-slate-800">
              {/* Tab navigation */}
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('preview')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition ${
                      activeTab === 'preview'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    معاينة خطوات المسألة
                  </button>
                  <button
                    onClick={() => setActiveTab('json')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                      activeTab === 'json'
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>كود JSON النهائي</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                  >
                    <Copy className="w-3.5 h-3.5 text-amber-400" />
                    <span>{copied ? 'تم النسخ!' : 'نسخ JSON'}</span>
                  </button>
                  <button
                    onClick={handleDownloadJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-amber-400" />
                    <span>تنزيل الملف</span>
                  </button>
                  <button
                    onClick={() => {
                      onApplyProblem(extractedProblem);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md transition active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>تشغيل على السبورة التفاعلية فوراً</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: Problem Preview */}
              {activeTab === 'preview' && (
                <div className="bg-slate-950 rounded-2xl border border-slate-800 p-5 space-y-4">
                  <div className="border-b border-slate-800 pb-3">
                    <span className="text-xs font-bold text-amber-400 mb-1 inline-block">
                      {extractedProblem.category}
                    </span>
                    <h3 className="text-base font-black text-white leading-relaxed">
                      {extractedProblem.title}
                    </h3>
                  </div>

                  {/* Cropped Diagram display inside problem preview */}
                  {extractedProblem.image_url && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 flex flex-col items-center justify-center">
                      <span className="text-[11px] font-bold text-slate-400 mb-2 self-start">
                        الرسم التوضيحي المرفق مع المسألة:
                      </span>
                      <img
                        src={extractedProblem.image_url}
                        alt="رسم المسألة"
                        className="max-h-48 rounded-lg bg-white p-1 border border-slate-700"
                      />
                    </div>
                  )}

                  {/* Steps breakdown */}
                  <div className="space-y-3">
                    {extractedProblem.steps.map((step) => (
                      <div
                        key={step.step_id}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2"
                      >
                        <div className="font-black text-xs text-amber-300">{step.title}</div>
                        <p className="text-[11px] text-slate-400">{step.explanation}</p>

                        {step.equation_rows?.map((row) => (
                          <div
                            key={row.row_id}
                            className="p-2.5 bg-slate-950 rounded-lg text-white font-mono text-sm dir-ltr flex flex-wrap items-center gap-2 border border-slate-800/80"
                          >
                            {row.elements ? (
                              row.elements.map((el, i) => {
                                if (el.type === 'static') {
                                  return (
                                    <span key={i} className="text-amber-400 font-bold">
                                      {el.content}
                                    </span>
                                  );
                                }
                                if (el.type === 'box') {
                                  return (
                                    <span
                                      key={i}
                                      className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-black text-xs shadow-xs"
                                    >
                                      [ {el.correct_value} ]
                                    </span>
                                  );
                                }
                                return null;
                              })
                            ) : (
                              <span className="text-amber-300">{row.equation_format}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 2: Raw JSON Viewer */}
              {activeTab === 'json' && (
                <div className="relative">
                  <pre className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-amber-300 font-mono text-xs overflow-x-auto max-h-[350px] dir-ltr text-left">
                    {JSON.stringify(extractedProblem, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>يدعم جميع المسارات الأربعة: الفيزياء، الكيمياء، الرياضيات، والمسار الشامل.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
