export type ProblemElement =
  | { type: 'static'; content: string }
  | {
      type: 'box';
      box_id: string;
      box_title?: string;
      correct_value: string;
      options: string[];
      hint?: string;
    };

export interface BoxInput {
  box_id: string;
  box_title: string;
  correct_value: string;
  options: string[];
  hint: string;
}

export interface EquationRow {
  row_id: string;
  layout_type?: 'fraction' | 'inline' | 'standard';
  equation_format?: string;
  inputs?: BoxInput[];
  elements?: ProblemElement[];
}

// Support both new and legacy formats seamlessly
export interface ProblemInput {
  id: string;
  correct_value: string;
  label: string;
  allowed_keys: string[];
  specific_hint: string;
  related_topics?: string[];
}

export interface ProblemStep {
  step_id?: number;
  title?: string;
  explanation?: string;
  think?: string;
  template_type?: string;
  elements?: ProblemElement[];
  equation_rows?: EquationRow[];
  inputs?: ProblemInput[];
}

export interface ProblemJSON {
  problem_id: string;
  question_number?: string;
  category?: string;
  title?: string;
  atomic_weights?: string;
  latex_formula?: string;
  has_diagram?: boolean;
  diagram_box?: [number, number, number, number] | null;
  image_url?: string | null;
  page_number?: number;
  detected_images?: Array<{
    id: string;
    box: [number, number, number, number];
    image_url?: string;
    label?: string;
  }>;
  steps: ProblemStep[];
}

export type ActiveModalType = 'none' | 'think' | 'hint' | 'json' | 'scratchpad' | 'converter' | 'selector';

