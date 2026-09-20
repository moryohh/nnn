import { ProblemJSON } from '../types';
import { initialChemistryProblem, sampleProblems } from './problems';

export interface ProblemFolder {
  id: string;
  name: string;
  category: 'كيمياء' | 'فيزياء' | 'رياضيات' | 'مخصص';
  description: string;
  icon: string;
  isCustom?: boolean;
  problems: ProblemJSON[];
}

export const defaultChemistryProblems: ProblemJSON[] = [
  initialChemistryProblem,
  sampleProblems[1], // CHEM_BUFFER_PH
  {
    problem_id: "CHEM_ACETIC_DISSOCIATION",
    category: "الكيمياء - الاتزان الأيوني",
    title: "س/ احسب تركيز [H+] ودرجة التفكك لمحلول حامض الخليك (0.1M) علماً أن Ka = 1.8 × 10⁻⁵ وجذر 1.8 = 1.34",
    atomic_weights: "K_a = 1.8 \\times 10^{-5}, \\sqrt{1.8} = 1.34",
    latex_formula: "K_a = \\frac{[\\text{H}^+]^2}{[\\text{CH}_3\\text{COOH}]}",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: قانون ثابت التفكك للحامض الضعيف",
        explanation: "نطبق قانون ثابت الاتزان Ka = النواتج / المتفاعلات مع إهمال المتأين في المقام لصغر قيمة Ka.",
        elements: [
          { type: "static", "content": "Ka = [H+]² / " },
          {
            type: "box",
            box_id: "box_acid_conc",
            box_title: "تركيز الحامض الابتدائي في المقام",
            correct_value: "[CH3COOH]",
            options: ["[CH3COOH]", "[H+]", "[CH3COO-]", "Ka²"],
            hint: "المقام يمثل التركيز الابتدائي لحامض الخليك غير المتأين."
          }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: التعويض وحساب [H+]²",
        explanation: "نعوض قيمة Ka وتركيز الحامض (0.1 M = 10⁻¹) لنحصل على حاصل الضرب.",
        elements: [
          { type: "static", "content": "x² = (1.8 × 10⁻⁵) × " },
          {
            type: "box",
            box_id: "box_conc_value",
            box_title: "تركيز الحامض",
            correct_value: "0.1",
            options: ["1.0", "0.1", "0.01", "10"],
            hint: "انتبه لتركيز الحامض المعطى في السؤال (0.1 مولاري)."
          },
          { type: "static", "content": " = " },
          {
            type: "box",
            box_id: "box_x_squared",
            box_title: "ناتج الضرب للأسس",
            correct_value: "1.8 × 10⁻⁶",
            options: ["1.8 × 10⁻⁵", "1.8 × 10⁻⁶", "18 × 10⁻⁵", "1.8 × 10⁻⁴"],
            hint: "ضرب 10⁻⁵ في 0.1 (10⁻¹) يجمع الأسس ليصبح 10⁻⁶."
          }
        ]
      },
      {
        step_id: 3,
        title: "الخطوة الثالثة: أخذ الجذر التربيعي لإيجاد [H+]",
        explanation: "نجذر طرفي المعادلة مستعينين بجذر 1.8 المعطى في السؤال وقسمة الأس على 2.",
        elements: [
          { type: "static", "content": "[H+] = " },
          {
            type: "box",
            box_id: "box_h_result",
            box_title: "تركيز أيون الهيدروجين النهائي",
            correct_value: "1.34 × 10⁻³",
            options: ["1.34 × 10⁻⁶", "1.8 × 10⁻³", "1.34 × 10⁻³", "1.34 × 10⁻²"],
            hint: "جذر 1.8 معطى (1.34)، وجذر الأس 10⁻⁶ يقسم على 2 ليصبح 10⁻³."
          },
          { type: "static", "content": " M" }
        ]
      },
      {
        step_id: 4,
        title: "الخطوة الرابعة: حساب درجة التأين",
        explanation: "درجة التأين = المتأين [H+] مقسوماً على التركيز الابتدائي للحامض.",
        elements: [
          { type: "static", "content": "درجة التأين = " },
          {
            type: "box",
            box_id: "box_degree_num",
            box_title: "البسط (تركيز H+)",
            correct_value: "1.34 × 10⁻³",
            options: ["1.34 × 10⁻⁴", "0.1", "1.34 × 10⁻³", "1.8 × 10⁻⁵"],
            hint: "البسط يمثل الجزء المتأين [H+] المحسوب في الخطوة السابقة."
          },
          { type: "static", "content": " / 0.1 = " },
          {
            type: "box",
            box_id: "box_degree_final",
            box_title: "درجة التأين النهائية",
            correct_value: "1.34 × 10⁻²",
            options: ["1.34 × 10⁻⁴", "1.34 × 10⁻²", "1.34 × 10⁻³", "13.4 × 10⁻²"],
            hint: "القسمة على 0.1 (10⁻¹) ترفع الأس بمقدار +1 ليصبح 10⁻²."
          }
        ]
      }
    ]
  }
];

export const defaultPhysicsProblems: ProblemJSON[] = [
  sampleProblems[2], // PHYS_RLC_SERIES
  {
    problem_id: "PHYS_SELF_INDUCTANCE",
    category: "الفيزياء - الحث الكهرومغناطيسي",
    title: "س/ ملف معامل حثه الذاتي L = 0.5 H ينساب فيه تيار مستمر I = 4 A. احسب الطاقة المغناطيسية المختزنة في المجال المغناطيسي للملف ومعدل القوة الدافعة الكهربائية إذا انعكس التيار خلال 0.2s.",
    atomic_weights: "L = 0.5\\text{ H}, I = 4\\text{ A}, \\Delta t = 0.2\\text{ s}",
    latex_formula: "PE = \\frac{1}{2} L I^2",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: قانون الطاقة المغناطيسية المختزنة في الملف",
        explanation: "نطبق قانون الطاقة المختزنة PE = 1/2 * L * I² بالتعويض عن معامل الحث الذاتي والتيار.",
        elements: [
          { type: "static", "content": "PE = 0.5 × 0.5 × " },
          {
            type: "box",
            box_id: "box_current_squared",
            box_title: "مربع التيار (I²)",
            correct_value: "16",
            options: ["4", "8", "16", "32"],
            hint: "التيار المعطى هو 4A، ومربعه هو 4² = 16."
          },
          { type: "static", "content": " = " },
          {
            type: "box",
            box_id: "box_pe_result",
            box_title: "مقدار الطاقة بالجول (J)",
            correct_value: "4",
            options: ["2", "4", "8", "16"],
            hint: "0.25 × 16 = 4 جول."
          },
          { type: "static", "content": " Joule" }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: حساب تغير التيار عند انعكاسه",
        explanation: "عند انعكاس التيار، يكون ΔI = -2 * I = -2 * 4 = -8 A.",
        elements: [
          { type: "static", "content": "ΔI = -2 × 4 = " },
          {
            type: "box",
            box_id: "box_delta_i",
            box_title: "مقدار التغير في التيار (ΔI)",
            correct_value: "-8",
            options: ["-8", "8", "-4", "0"],
            hint: "انعكاس التيار يعني تغيره من +4A إلى -4A، أي ΔI = -4 - 4 = -8A."
          },
          { type: "static", "content": " A" }
        ]
      },
      {
        step_id: 3,
        title: "الخطوة الثالثة: حساب القوة الدافعة الكهربائية المحتثة",
        explanation: "ε_ind = -L * (ΔI / Δt)، السالب من قانون لنز يلغي سالب التغير في التيار.",
        elements: [
          { type: "static", "content": "ε_ind = -0.5 × (" },
          {
            type: "box",
            box_id: "box_delta_i_val",
            box_title: "قيمة ΔI في البسط",
            correct_value: "-8",
            options: ["-8", "8", "4", "-4"],
            hint: "قيمة تغير التيار الناتجة من الانعكاس (-8 A)."
          },
          { type: "static", "content": " / 0.2) = " },
          {
            type: "box",
            box_id: "box_emf_res",
            box_title: "القوة الدافعة بالفولت (V)",
            correct_value: "20",
            options: ["-20", "20", "40", "10"],
            hint: "-0.5 × (-40) = +20 فولت."
          },
          { type: "static", "content": " Volt" }
        ]
      }
    ]
  }
];

export const defaultMathProblems: ProblemJSON[] = [
  sampleProblems[3], // MATH_CONSTANTS_INFLECTION
  {
    problem_id: "MATH_DEFINITE_INTEGRAL",
    category: "الرياضيات - التكامل وتطبيقاته",
    title: "س/ احسب قيمة التكامل المحدد: ∫ (3x² - 4x + 1) dx من x = 1 إلى x = 2.",
    atomic_weights: "\\int_1^2 (3x^2 - 4x + 1)\\,dx",
    latex_formula: "\\left[ x^3 - 2x^2 + x \\right]_1^2",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: إيجاد الدالة المقابلة (التكامل غير المحدد)",
        explanation: "نكامل كل حد بإضافة 1 إلى الأس والقسمة على الأس الجديد.",
        elements: [
          { type: "static", "content": "F(x) = x³ - " },
          {
            type: "box",
            box_id: "box_mid_term",
            box_title: "الحد الأوسط (تكامل 4x)",
            correct_value: "2x²",
            options: ["4x²", "2x²", "2x", "x²"],
            hint: "تكامل 4x هو 4 × (x² / 2) = 2x²."
          },
          { type: "static", "content": " + x" }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: التعويض بالحد الأعلى والحد الأدنى",
        explanation: "نعوض الحد الأعلى x = 2، ثم نطرح منه ناتج تعويض الحد الأدنى x = 1.",
        elements: [
          { type: "static", "content": "F(2) = (2)³ - 2(2)² + 2 = 8 - 8 + 2 = " },
          {
            type: "box",
            box_id: "box_upper_val",
            box_title: "ناتج تعويض الحد الأعلى F(2)",
            correct_value: "2",
            options: ["0", "2", "4", "8"],
            hint: "8 - 8 + 2 = 2."
          },
          { type: "static", "content": " , F(1) = 1 - 2 + 1 = 0" }
        ]
      },
      {
        step_id: 3,
        title: "الخطوة الثالثة: الناتج النهائي للتكامل",
        explanation: "الناتج النهائي = F(2) - F(1) = 2 - 0.",
        elements: [
          { type: "static", "content": "∫ = 2 - 0 = " },
          {
            type: "box",
            box_id: "box_int_final",
            box_title: "الناتج النهائي للتكامل",
            correct_value: "2",
            options: ["0", "1", "2", "-2"],
            hint: "قيمة F(2) ناقص F(1) هي 2 - 0 = 2."
          }
        ]
      }
    ]
  }
];

export const initialFolders: ProblemFolder[] = [
  {
    id: "chem_folder",
    name: "مجلد الكيمياء الوزارية (السادس العلمي)",
    category: "كيمياء",
    description: "مسائل الكتل المولية، النسبة المئوية، محاليل بفر، وثابت التفكك Ka",
    icon: "🧪",
    problems: defaultChemistryProblems
  },
  {
    id: "phys_folder",
    name: "مجلد الفيزياء الوزارية (السادس العلمي)",
    category: "فيزياء",
    description: "مسائل دوائر التيار المتناوب RLC، الممانعة Z، والحث الذاتي والطاقة المختزنة",
    icon: "⚡",
    problems: defaultPhysicsProblems
  },
  {
    id: "math_folder",
    name: "مجلد الرياضيات الوزارية (السادس العلمي)",
    category: "رياضيات",
    description: "مسائل تطبيقات التفاضل، نقاط الانقلاب، إيجاد الثوابت، والتكامل المحدد",
    icon: "📐",
    problems: defaultMathProblems
  }
];
