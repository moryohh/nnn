import { ProblemJSON } from "../types";

export const initialChemistryProblem: ProblemJSON = {
  problem_id: "CHEM_PERCENTAGE_CARBON",
  category: "الكيمياء - النسبة المئوية للعناصر",
  title: "س/ احسب النسبة المئوية للكربون (C) في حامض الخليك CH₃COOH (الكتل الذرية: C=12, H=1, O=16)",
  atomic_weights: "C=12, H=1, O=16",
  latex_formula: "\\text{CH}_3\\text{COOH} \\longrightarrow \\text{C}_2\\text{H}_4\\text{O}_2",
  steps: [
    {
      step_id: 1,
      title: "الخطوة الأولى: تفكيك الصيغة الجزيئية وحساب الكتلة المولية (M)",
      explanation: "الخارطة الذهنية: نبدأ بضرب عدد ذرات كل عنصر في كتلته الذرية المعطاة في السؤال، ثم نجمعها لمعرفة الكتلة المولية الكلية للمركب.",
      equation_rows: [
        {
          row_id: "1_a",
          layout_type: "inline",
          equation_format: "M = ( {{box_1}} * {{box_2}} ) + ( {{box_3}} * {{box_4}} ) + ( {{box_5}} * 16 )",
          inputs: [
            {
              box_id: "box_1",
              box_title: "عدد ذرات الكاربون (C)",
              correct_value: "2",
              options: ["1", "2", "3", "4"],
              hint: "انظر إلى الصيغة C₂H₄O₂، كم ذرة كاربون (C) موجودة في المركب؟"
            },
            {
              box_id: "box_2",
              box_title: "الكتلة الذرية للكاربون (C)",
              correct_value: "12",
              options: ["1", "12", "14", "16"],
              hint: "الكتلة الذرية للكاربون معطاة في رأس المسألة وتساوي 12."
            },
            {
              box_id: "box_3",
              box_title: "عدد ذرات الهيدروجين (H)",
              correct_value: "4",
              options: ["1", "3", "4", "5"],
              hint: "اجمع ذرات الهيدروجين في CH₃COOH (3 في البداية + 1 في النهاية = 4)."
            },
            {
              box_id: "box_4",
              box_title: "الكتلة الذرية للهيدروجين (H)",
              correct_value: "1",
              options: ["1", "2", "12", "16"],
              hint: "الهيدروجين هو أخف عنصر، كتلته الذرية في المعطيات تساوي 1."
            },
            {
              box_id: "box_5",
              box_title: "عدد ذرات الأكسجين (O)",
              correct_value: "2",
              options: ["1", "2", "3", "4"],
              hint: "في صيغة حامض الخليك CH₃COOH يوجد حرفا O، أي ذرتان."
            }
          ]
        },
        {
          row_id: "1_b",
          layout_type: "inline",
          equation_format: "M = {{box_6}} + {{box_7}} + {{box_8}} = {{box_9}} g/mol",
          inputs: [
            {
              box_id: "box_6",
              box_title: "كتلة الكاربون (2 × 12)",
              correct_value: "24",
              options: ["14", "24", "32", "48"],
              hint: "ناتج ضرب 2 في 12 هو 24."
            },
            {
              box_id: "box_7",
              box_title: "كتلة الهيدروجين (4 × 1)",
              correct_value: "4",
              options: ["1", "4", "5", "8"],
              hint: "ناتج ضرب 4 في 1 هو 4."
            },
            {
              box_id: "box_8",
              box_title: "كتلة الأكسجين (2 × 16)",
              correct_value: "32",
              options: ["18", "32", "36", "64"],
              hint: "ناتج ضرب 2 في 16 هو 32."
            },
            {
              box_id: "box_9",
              box_title: "الكتلة المولية الكلية (M)",
              correct_value: "60",
              options: ["50", "60", "70", "100"],
              hint: "اجمع نواتج الكتل الثلاث: 24 + 4 + 32 = 60."
            }
          ]
        }
      ]
    },
    {
      step_id: 2,
      title: "الخطوة الثانية: تطبيق قانون النسبة المئوية للكربون %C",
      explanation: "الخارطة الذهنية: نطبق قانون النسبة المئوية بقسمة كتلة الكربون الكلية على الكتلة المولية للمركب ثم نضرب في 100%.",
      equation_rows: [
        {
          row_id: "2_a",
          layout_type: "fraction",
          equation_format: "( {{box_10}} * {{box_11}} ) / {{box_12}} * 100% = %C",
          inputs: [
            {
              box_id: "box_10",
              box_title: "الكتلة الذرية للكاربون في البسط",
              correct_value: "12",
              options: ["1", "2", "12", "16"],
              hint: "في البسط نضرب الكتلة الذرية للكاربون (12) في عدد ذراته."
            },
            {
              box_id: "box_11",
              box_title: "عدد ذرات الكاربون في البسط",
              correct_value: "2",
              options: ["1", "2", "3", "4"],
              hint: "عدد ذرات الكربون في المركب هو 2."
            },
            {
              box_id: "box_12",
              box_title: "الكتلة المولية الكلية (M) في المقام",
              correct_value: "60",
              options: ["24", "48", "60", "100"],
              hint: "في المقام نضع الكتلة المولية الكلية التي حسبناها سابقاً (60 g/mol)."
            }
          ]
        },
        {
          row_id: "2_b",
          layout_type: "inline",
          equation_format: "%C = {{box_13}} * 100% = {{box_14}} %",
          inputs: [
            {
              box_id: "box_13",
              box_title: "ناتج قسمة (24 ÷ 60)",
              correct_value: "0.4",
              options: ["0.2", "0.4", "2.5", "4"],
              hint: "قسمة 24 على 60 تعطي 2/5 أي 0.4."
            },
            {
              box_id: "box_14",
              box_title: "النسبة المئوية النهائية %C",
              correct_value: "40",
              options: ["20", "40", "60", "80"],
              hint: "اضرب 0.4 في 100 لتحصل على 40%."
            }
          ]
        }
      ]
    }
  ]
};

export const sampleProblems: ProblemJSON[] = [
  initialChemistryProblem,
  {
    problem_id: "CHEM_BUFFER_PH",
    category: "الكيمياء - الاتزان الأيوني (محاليل بفر)",
    title: "س/ احسب الأس الهيدروجيني pH لمحلول مائي يتكون من حامض الخليك 0.1 M وخلات الصوديوم 0.2 M (pKa = 4.74, log 2 = 0.30)",
    atomic_weights: "pKa = 4.74, \\log(2) = 0.30",
    latex_formula: "\\text{pH} = \\text{pK}_a + \\log\\left(\\frac{[\\text{Salt}]}{[\\text{Acid}]}\\right)",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: كتابة قانون هندرسون-هاسلبالخ والتعويض",
        explanation: "محلول البفر مكون من حامض ضعيف وملحه القاعدي. نطبق قانون بفر لحساب pH بالتعويض عن قيمة pKa وتركيز الملح وتركيز الحامض.",
        think: "قانون بفر للحامض الضعيف وملحه: pH = pKa + log([Salt] / [Acid])",
        template_type: "formula_substitution",
        inputs: [
          {
            id: "buf_1",
            correct_value: "4.74",
            label: "قيمة ثابت تفكك الحامض pKa",
            allowed_keys: ["4.74", "1.8", "7.00", "14"],
            specific_hint: "انظر إلى المعطيات المعطاة في السؤال لقيمة pKa لحامض الخليك.",
            related_topics: ["مفهوم الثابت pKa والأس الهيدروجيني"]
          },
          {
            id: "buf_2",
            correct_value: "0.2",
            label: "تركيز الملح خلات الصوديوم [Salt]",
            allowed_keys: ["0.2", "0.1", "0.3", "2.0"],
            specific_hint: "تركيز خلات الصوديوم المعطى في السؤال بالوحدة المولارية M.",
            related_topics: ["التركيز المولاري"]
          },
          {
            id: "buf_3",
            correct_value: "0.1",
            label: "تركيز الحامض الضعيف [Acid]",
            allowed_keys: ["0.1", "0.2", "1.0", "0.01"],
            specific_hint: "تركيز حامض الخليك المعطى في السؤال يوضع في المقام.",
            related_topics: ["محلول بفر الحامضي"]
          }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: اختصار الكسر واستخراج قيمة اللوغاريتم",
        explanation: "نقسم تركيز الملح (0.2) على تركيز الحامض (0.1) لنحصل على النسبة داخل اللوغاريتم، ثم نستخدم معطى اللوغاريتم في السؤال.",
        think: "0.2 ÷ 0.1 = 2 ، و log(2) معطى في السؤال.",
        template_type: "general_calculation",
        inputs: [
          {
            id: "buf_4",
            correct_value: "2",
            label: "ناتج قسمة (0.2 ÷ 0.1)",
            allowed_keys: ["2", "0.2", "0.5", "20"],
            specific_hint: "بحذف الفواصل: 2 ÷ 1 = 2.",
            related_topics: ["قسمة الكسور العشرية المتساوية المراتب"]
          },
          {
            id: "buf_5",
            correct_value: "0.30",
            label: "قيمة log(2) من المعطيات",
            allowed_keys: ["0.30", "0.47", "1.00", "0.69"],
            specific_hint: "استعن بالمعطيات المذكورة في نص المسألة لقيمة log(2).",
            related_topics: ["قوانين اللوغاريتمات العشرية"]
          }
        ]
      },
      {
        step_id: 3,
        title: "الخطوة الثالثة: حساب قيمة pH النهائية",
        explanation: "نقوم بجمع قيمة pKa (4.74) مع ناتج اللوغاريتم (0.30) لنحصل على الأس الهيدروجيني للمحلول المنظم.",
        think: "pH = 4.74 + 0.30",
        template_type: "general_calculation",
        inputs: [
          {
            id: "buf_6",
            correct_value: "5.04",
            label: "قيمة pH النهائية لمحلول البفر",
            allowed_keys: ["5.04", "4.44", "4.74", "5.40"],
            specific_hint: "اجمع 4.74 + 0.30 بمساواة المراتب العشرية.",
            related_topics: ["جمع الأعداد العشرية"]
          }
        ]
      }
    ]
  },
  {
    problem_id: "PHYS_RLC_SERIES",
    category: "الفيزياء - دوائر التيار المتناوب (RLC متوالية الربط)",
    title: "س/ دائرة تيار متناوب متوالية الربط تحوي مقاومة R = 40Ω ومحثاً رادته X_L = 100Ω ومتسعة رادتها X_C = 70Ω. احسب الممانعة الكلية Z وعامل القدرة pf.",
    atomic_weights: "R = 40\\Omega, X_L = 100\\Omega, X_C = 70\\Omega",
    latex_formula: "Z = \\sqrt{R^2 + (X_L - X_C)^2}",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: حساب رادة المحصلة (X = X_L - X_C)",
        explanation: "في دائرة RLC المتوالية، نطرح الرادة السعوية من الرادة الحثية لإيجاد الرادة المحصلة X وتحديد خصائص الدائرة (حثية لأن X_L > X_C).",
        think: "X = X_L - X_C",
        template_type: "general_calculation",
        inputs: [
          {
            id: "phys_1",
            correct_value: "100",
            label: "قيمة الرادة الحثية X_L (بالأوم)",
            allowed_keys: ["100", "70", "40", "170"],
            specific_hint: "الرادة الحثية للمحث معطاة بـ 100 أوم.",
            related_topics: ["قانون رادة الحث"]
          },
          {
            id: "phys_2",
            correct_value: "70",
            label: "قيمة الرادة السعوية X_C (بالأوم)",
            allowed_keys: ["70", "100", "30", "40"],
            specific_hint: "الرادة السعوية للمتسعة معطاة بـ 70 أوم وتطرح من الرادة الحثية.",
            related_topics: ["قانون رادة السعة"]
          },
          {
            id: "phys_3",
            correct_value: "30",
            label: "الرادة المحصلة X (بالأوم)",
            allowed_keys: ["30", "170", "-30", "40"],
            specific_hint: "اطرح: 100 - 70 = 30 أوم.",
            related_topics: ["طرح الأعداد الصحيحة"]
          }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: حساب الممانعة الكلية Z بنظرية فيثاغورس",
        explanation: "مخطط الممانعة هو مثلث قائم الزاوية ضلعي القائمة فيه هما R و X والوتر هو Z: Z² = R² + X².",
        think: "Z = √(R² + X²) = √(40² + 30²)",
        template_type: "general_calculation",
        inputs: [
          {
            id: "phys_4",
            correct_value: "1600",
            label: "مربع المقاومة R² (40 × 40)",
            allowed_keys: ["1600", "80", "160", "900"],
            specific_hint: "ارفع 40 للتربيع: 40 × 40 = 1600.",
            related_topics: ["مربعات الأعداد"]
          },
          {
            id: "phys_5",
            correct_value: "900",
            label: "مربع الرادة المحصلة X² (30 × 30)",
            allowed_keys: ["900", "60", "300", "1600"],
            specific_hint: "ارفع 30 للتربيع: 30 × 30 = 900.",
            related_topics: ["مربعات الأعداد"]
          },
          {
            id: "phys_6",
            correct_value: "2500",
            label: "مجموع المربعين داخل الجذر (1600 + 900)",
            allowed_keys: ["2500", "2000", "2700", "50"],
            specific_hint: "اجمع 1600 + 900.",
            related_topics: ["جمع الأعداد الكبيرة"]
          },
          {
            id: "phys_7",
            correct_value: "50",
            label: "الممانعة الكلية Z (جذر 2500)",
            allowed_keys: ["50", "25", "100", "500"],
            specific_hint: "الجذر التربيعي للعدد 2500 هو 50 أوم.",
            related_topics: ["الجذور التربيعية للأعداد التي تنتهي بأصفار"]
          }
        ]
      },
      {
        step_id: 3,
        title: "الخطوة الثالثة: حساب عامل القدرة pf",
        explanation: "عامل القدرة يساوي جيب تمام زاوية فرق الطور cos(φ) وهو النسبة بين المقاومة R والممانعة Z.",
        think: "pf = cos(φ) = R / Z",
        template_type: "general_calculation",
        inputs: [
          {
            id: "phys_8",
            correct_value: "40",
            label: "المقاومة R في البسط",
            allowed_keys: ["40", "50", "30", "70"],
            specific_hint: "قيمة المقاومة الأومية R = 40 أوم توضع في البسط.",
            related_topics: ["مخطط الممانعة الطوري"]
          },
          {
            id: "phys_9",
            correct_value: "50",
            label: "الممانعة Z في المقام",
            allowed_keys: ["50", "40", "30", "100"],
            specific_hint: "قيمة الممانعة الكلية Z التي استخرجناها (50 أوم) توضع في المقام.",
            related_topics: ["النسب المثلثية في التيار المتناوب"]
          },
          {
            id: "phys_10",
            correct_value: "0.8",
            label: "قيمة عامل القدرة pf النهائي (خالٍ من الوحدات)",
            allowed_keys: ["0.8", "1.25", "0.6", "0.75"],
            specific_hint: "اقسم 40 على 50: (4 ÷ 5 = 0.8).",
            related_topics: ["قسمة الكسور الاعتيادية"]
          }
        ]
      }
    ]
  },
  {
    problem_id: "MATH_CONSTANTS_INFLECTION",
    category: "الرياضيات - تطبيقات التفاضل (إيجاد قيم الثوابت)",
    title: "س/ لتكن الدالة f(x) = x³ + bx² + c، إذا كانت النقطة (1, 2) نقطة انقلاب للمنحني، جد قيمتي الثابتين b و c.",
    atomic_weights: "\\text{النقطة: } (1, 2) \\text{ نقطة انقلاب}",
    latex_formula: "f''(x) = 6x + 2b = 0 \\quad \\Longrightarrow \\quad f''(1) = 0",
    steps: [
      {
        step_id: 1,
        title: "الخطوة الأولى: إيجاد المشتقة الثانية والاستفادة من نقطة الانقلاب",
        explanation: "بما أن النقطة (1, 2) نقطة انقلاب، فإن المشتقة الثانية للدالة f''(x) عند x = 1 تساوي صفراً. نشتق مرتين ونسوي الناتج بالصفر عند x = 1 لإيجاد b.",
        think: "f'(x) = 3x² + 2bx ، f''(x) = 6x + 2b. وعند الانقلاب f''(1) = 0.",
        template_type: "general_calculation",
        inputs: [
          {
            id: "math_1",
            correct_value: "6",
            label: "معامل x في المشتقة الثانية (مشتقة 3x²)",
            allowed_keys: ["6", "3", "2", "12"],
            specific_hint: "مشتقة 3x² هي 3 × 2x = 6x.",
            related_topics: ["قواعد الاشتقاق الأساسية"]
          },
          {
            id: "math_2",
            correct_value: "2",
            label: "معامل b في المشتقة الثانية (مشتقة 2bx)",
            allowed_keys: ["2", "1", "b", "0"],
            specific_hint: "مشتقة 2bx بالنسبة إلى x هي 2b.",
            related_topics: ["اشتقاق الدوال الخطية بالنسبة للثوابت"]
          },
          {
            id: "math_3",
            correct_value: "-3",
            label: "قيمة الثابت b بعد حل المعادلة: 6(1) + 2b = 0",
            allowed_keys: ["-3", "3", "-6", "6"],
            specific_hint: "2b = -6 وبالتالي b = -6 ÷ 2 = -3.",
            related_topics: ["حل المعادلات الخطية من الدرجة الأولى"]
          }
        ]
      },
      {
        step_id: 2,
        title: "الخطوة الثانية: تعويض النقطة الكاملة (1, 2) في الدالة الأصلية لإيجاد c",
        explanation: "كل نقطة انقلاب تنتمي إلى منحني الدالة، وبالتالي تحقق معادلته: f(1) = 2. نعوض x = 1 و y = 2 وقيمة b = -3 في معادلة f(x) الأصلية لحساب c.",
        think: "f(1) = (1)³ + b(1)² + c = 2",
        template_type: "general_calculation",
        inputs: [
          {
            id: "math_4",
            correct_value: "2",
            label: "قيمة f(1) الناتجة من الإحداثي الصادي للنقطة",
            allowed_keys: ["2", "1", "0", "-3"],
            specific_hint: "النقطة هي (1, 2)، إذن f(1) = 2.",
            related_topics: ["مفهوم الدالة وتطابق النقاط مع المنحني"]
          },
          {
            id: "math_5",
            correct_value: "-2",
            label: "ناتج (1³ + (-3)(1)²) = 1 - 3",
            allowed_keys: ["-2", "2", "-4", "4"],
            specific_hint: "1 - 3 = -2.",
            related_topics: ["جمع وطرح الأعداد الصحيحة"]
          },
          {
            id: "math_6",
            correct_value: "4",
            label: "قيمة الثابت c بعد حل: -2 + c = 2",
            allowed_keys: ["4", "0", "-4", "2"],
            specific_hint: "بنقل -2 للطرف الآخر: c = 2 + 2 = 4.",
            related_topics: ["خواص التساوي ونقل الحدود"]
          }
        ]
      }
    ]
  }
];
