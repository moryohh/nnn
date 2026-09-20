import React from 'react';
import { ProblemJSON, ProblemStep, ProblemInput, EquationRow, BoxInput } from '../types';
import { InteractiveBox } from './InteractiveBox';
import { MapPin, Sparkles, HelpCircle } from 'lucide-react';

interface InteractiveBoardProps {
  problem: ProblemJSON;
  userAnswers: Record<string, string>;
  activeInputId: string;
  onBoxClick: (inputId: string) => void;
  onReset: () => void;
}

export const InteractiveBoard: React.FC<InteractiveBoardProps> = ({
  problem,
  userAnswers,
  activeInputId,
  onBoxClick,
}) => {
  // Helper to render an interactive box
  const renderBox = (id: string, label?: string) => (
    <InteractiveBox
      key={id}
      id={id}
      value={userAnswers[id]}
      isActive={activeInputId === id}
      isSolved={Boolean(userAnswers[id])}
      label={label}
      onClick={() => onBoxClick(id)}
    />
  );

  // Helper to render text with {{box_X}} or {{inp_X}} tokens replaced with InteractiveBox
  const renderTokens = (text: string, boxMap: Map<string, { id: string; label: string }>) => {
    // Split by {{...}}
    const parts = text.split(/(\{\{[^}]+\}\})/g);

    return parts.map((part, idx) => {
      const match = part.match(/^\{\{\s*([^}]+)\s*\}\}$/);
      if (match) {
        const boxId = match[1].trim();
        const boxInfo = boxMap.get(boxId);
        return renderBox(boxId, boxInfo?.label);
      }

      if (!part.trim()) return null;

      // Replace standard math symbols with clean visual characters
      const displaySymbol = part
        .replace(/\*/g, ' × ')
        .replace(/\+/g, ' + ')
        .replace(/-/g, ' - ')
        .replace(/=/g, ' = ');

      return (
        <span key={idx} className="font-bold text-slate-800 tracking-wide px-0.5">
          {displaySymbol}
        </span>
      );
    });
  };

  // Render a specific EquationRow
  const renderEquationRow = (row: EquationRow) => {
    // If equation row has direct elements (static + box)
    if (row.elements && row.elements.length > 0) {
      return (
        <div
          key={row.row_id}
          className="math-line-container text-lg md:text-2xl font-black text-slate-900 dir-ltr flex items-center justify-start flex-wrap gap-2.5 py-2.5"
        >
          {row.elements.map((el, index) => {
            if (el.type === 'static') {
              const displaySymbol = el.content
                .replace(/\*/g, ' × ')
                .replace(/\+/g, ' + ')
                .replace(/-/g, ' - ')
                .replace(/=/g, ' = ');
              return (
                <span key={`static-${index}`} className="font-bold text-slate-800 tracking-wide px-1">
                  {displaySymbol}
                </span>
              );
            }
            if (el.type === 'box') {
              return renderBox(el.box_id, el.box_title || el.hint);
            }
            return null;
          })}
        </div>
      );
    }

    const boxMap = new Map<string, { id: string; label: string }>();
    (row.inputs || []).forEach((inp) => {
      boxMap.set(inp.box_id, { id: inp.box_id, label: inp.box_title });
    });

    const equationFormat = row.equation_format || '';
    const isFraction = row.layout_type === 'fraction' || equationFormat.includes(' / ');

    if (isFraction) {
      // Look for format like: ( numerator ) / denominator * rest OR num / den
      const fractionRegex = /^(.*?)\s*\/\s*(\{\{[^}]+\}\}|[a-zA-Z0-9_.]+|\([^)]+\))\s*(.*)$/;
      const match = equationFormat.match(fractionRegex);

      if (match) {
        let numerator = match[1].trim();
        let denominator = match[2].trim();
        const rest = match[3]?.trim();

        // Strip outer parentheses if enclosing whole numerator
        if (numerator.startsWith('(') && numerator.endsWith(')')) {
          numerator = numerator.slice(1, -1).trim();
        }
        if (denominator.startsWith('(') && denominator.endsWith(')')) {
          denominator = denominator.slice(1, -1).trim();
        }

        return (
          <div
            key={row.row_id}
            className="math-line-container text-lg md:text-2xl font-black text-slate-900 dir-ltr flex items-center justify-start flex-wrap gap-2.5 py-3"
          >
            <div className="inline-flex flex-col items-center mx-1.5 align-middle">
              <div className="flex items-center justify-center gap-1.5 pb-2 border-b-[3px] border-slate-800 w-full px-2">
                {renderTokens(numerator, boxMap)}
              </div>
              <div className="pt-2 flex justify-center w-full">
                {renderTokens(denominator, boxMap)}
              </div>
            </div>

            {rest && (
              <div className="flex items-center gap-2">
                {renderTokens(rest, boxMap)}
              </div>
            )}
          </div>
        );
      }
    }

    // Default inline layout
    return (
      <div
        key={row.row_id}
        className="math-line-container text-lg md:text-2xl font-black text-slate-900 dir-ltr flex items-center justify-start flex-wrap gap-2.5 py-2"
      >
        {renderTokens(equationFormat, boxMap)}
      </div>
    );
  };

  // Render step contents (supports elements, equation_rows, legacy template_type, or inputs fallback)
  const renderStepContent = (step: ProblemStep) => {
    // 1. If step has elements (new static + box schema)
    if (step.elements && step.elements.length > 0) {
      return (
        <div className="math-line-container text-lg md:text-2xl font-black text-slate-900 dir-ltr flex items-center justify-start flex-wrap gap-2.5 py-3">
          {step.elements.map((el, index) => {
            if (el.type === 'static') {
              const displaySymbol = el.content
                .replace(/\*/g, ' × ')
                .replace(/\+/g, ' + ')
                .replace(/-/g, ' - ')
                .replace(/=/g, ' = ');
              return (
                <span key={`static-${index}`} className="font-bold text-slate-800 tracking-wide px-1">
                  {displaySymbol}
                </span>
              );
            }
            if (el.type === 'box') {
              return renderBox(el.box_id, el.box_title || el.hint);
            }
            return null;
          })}
        </div>
      );
    }

    // 2. If step has equation_rows
    if (step.equation_rows && step.equation_rows.length > 0) {
      return (
        <div className="space-y-4 w-full">
          {step.equation_rows.map((row) => renderEquationRow(row))}
        </div>
      );
    }

    // 2. Legacy template_type fallback
    const inputMap = new Map<string, ProblemInput>();
    (step.inputs || []).forEach((inp) => inputMap.set(inp.id, inp));

    if (step.template_type === 'molar_mass_breakdown' && inputMap.has('inp_1')) {
      return (
        <div className="math-line-container text-xl md:text-2xl font-extrabold text-slate-900 dir-ltr flex items-center justify-start flex-wrap gap-2 w-full pt-2">
          <span className="text-red-700 font-serif">M =</span>
          <span>(</span>
          {renderBox('inp_1', inputMap.get('inp_1')?.label)}
          <span className="text-slate-400">&times;</span>
          {renderBox('inp_2', inputMap.get('inp_2')?.label)}
          <span>)</span>
          <span className="text-red-500 font-black">+</span>
          <span>(</span>
          {renderBox('inp_3', inputMap.get('inp_3')?.label)}
          <span className="text-slate-400">&times;</span>
          {renderBox('inp_4', inputMap.get('inp_4')?.label)}
          <span>)</span>
          <span className="text-red-500 font-black">+</span>
          <span>(</span>
          {renderBox('inp_5', inputMap.get('inp_5')?.label)}
          <span className="text-slate-400">&times;</span>
          <span className="text-slate-700 font-bold px-1.5">16</span>
          <span>)</span>
        </div>
      );
    }

    if (step.template_type === 'molar_mass_sum' && inputMap.has('inp_6')) {
      return (
        <div className="space-y-4 dir-ltr w-full pt-2">
          <div className="math-line-container text-xl md:text-2xl font-extrabold text-slate-900 flex justify-start items-center flex-wrap gap-2.5">
            <span className="text-red-700 font-serif">M =</span>
            {renderBox('inp_6', inputMap.get('inp_6')?.label)}
            <span className="text-red-500 font-black">+</span>
            {renderBox('inp_7', inputMap.get('inp_7')?.label)}
            <span className="text-red-500 font-black">+</span>
            {renderBox('inp_8', inputMap.get('inp_8')?.label)}
          </div>
          <div className="math-line-container text-xl md:text-2xl font-extrabold text-slate-900 flex justify-start items-center gap-2.5">
            <span className="text-red-700 font-serif">M =</span>
            {renderBox('inp_9', inputMap.get('inp_9')?.label)}
            <span className="text-base md:text-lg text-slate-500 font-bold ml-1">g/mol</span>
          </div>
        </div>
      );
    }

    if (step.template_type === 'percentage_formula' && inputMap.has('inp_10')) {
      return (
        <div className="space-y-6 dir-ltr w-full pt-2">
          <div className="math-line-container text-xl md:text-2xl font-extrabold text-slate-900 flex justify-start items-center flex-wrap gap-3">
            <span className="text-slate-800 font-serif">%C =</span>
            <div className="inline-flex flex-col items-center mx-2">
              <div className="flex items-center justify-center gap-1.5 pb-2 border-b-[3px] border-slate-800 w-full px-2">
                {renderBox('inp_10', inputMap.get('inp_10')?.label)}
                <span className="text-slate-400">&times;</span>
                {renderBox('inp_11', inputMap.get('inp_11')?.label)}
              </div>
              <div className="pt-2 flex justify-center w-full">
                {renderBox('inp_12', inputMap.get('inp_12')?.label)}
              </div>
            </div>
            <span className="text-red-600 text-2xl font-black">&times;</span>
            <span className="text-slate-800 font-bold">100%</span>
          </div>

          <div className="math-line-container text-xl md:text-2xl font-extrabold text-slate-900 flex justify-start items-center flex-wrap gap-2.5 pt-4 border-t border-slate-100">
            <span>%C =</span>
            {renderBox('inp_13', inputMap.get('inp_13')?.label)}
            <span className="text-red-500 font-black">&times;</span>
            <span>100% =</span>
            {renderBox('inp_14', inputMap.get('inp_14')?.label)}
            <span className="text-red-700 font-black">%</span>
          </div>
        </div>
      );
    }

    // 3. General card fallback for simple inputs list
    return (
      <div className="pt-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 dir-rtl">
          {(step.inputs || []).map((inp) => {
            const isSolved = Boolean(userAnswers[inp.id]);
            const isActive = activeInputId === inp.id;

            return (
              <div
                key={inp.id}
                onClick={() => onBoxClick(inp.id)}
                className={`p-3.5 rounded-xl border-2 transition cursor-pointer flex items-center justify-between gap-2 ${isActive ? 'bg-red-50/80 border-red-500 ring-2 ring-red-200' : isSolved ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
              >
                <div className="text-right flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-500 mb-1 flex items-center gap-1">
                    <HelpCircle className="w-3 h-3 text-red-500 shrink-0" />
                    <span className="truncate">{inp.label}</span>
                  </div>
                  <div className="text-xs font-extrabold text-slate-800">
                    {isSolved ? (
                      <span className="text-emerald-700 font-mono text-base">{userAnswers[inp.id]}</span>
                    ) : (
                      <span className="text-slate-400">انقر للاختيار</span>
                    )}
                  </div>
                </div>

                <div className="shrink-0">
                  {renderBox(inp.id, inp.label)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div id="interactive-board" className="space-y-6">
      {problem.steps.map((step) => {
        // Collect all input IDs in this step
        const stepInputIds: string[] = [];
        if (step.elements) {
          step.elements.forEach((el) => {
            if (el.type === 'box') stepInputIds.push(el.box_id);
          });
        } else if (step.equation_rows) {
          step.equation_rows.forEach((row) => {
            if (row.elements) {
              row.elements.forEach((el) => {
                if (el.type === 'box') stepInputIds.push(el.box_id);
              });
            }
            if (row.inputs) {
              row.inputs.forEach((inp) => stepInputIds.push(inp.box_id));
            }
          });
        } else if (step.inputs) {
          step.inputs.forEach((inp) => stepInputIds.push(inp.id));
        }

        const stepTotal = stepInputIds.length;
        const stepSolved = stepInputIds.filter((id) => userAnswers[id]).length;
        const isStepComplete = stepTotal > 0 && stepSolved === stepTotal;

        return (
          <section
            key={step.step_id}
            id={`step_card_${step.step_id}`}
            className={`p-5 md:p-6 rounded-2xl bg-white border-2 shadow-xs transition-all ${isStepComplete ? 'border-emerald-200 bg-emerald-50/10' : 'border-slate-200'}`}
          >
            {/* Step Header */}
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2.5">
                <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${isStepComplete ? 'bg-emerald-500' : 'bg-red-600 animate-pulse'}`} />
                <h3 className="text-base md:text-lg font-black text-slate-900">
                  {step.title}
                </h3>
              </div>

              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${isStepComplete ? 'bg-emerald-100 text-emerald-800 border-emerald-300 font-black' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {stepSolved} / {stepTotal} خانة
              </span>
            </div>

            {/* Mind-Map Explanation (الخارطة الذهنية) */}
            {step.explanation && (
              <div className="mb-5 bg-blue-50/70 border-r-4 border-blue-500 p-4 rounded-l-xl text-sm font-bold text-blue-950 leading-relaxed dir-rtl relative shadow-2xs">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 bg-blue-100 text-blue-700 rounded-lg shrink-0 mt-0.5">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-black text-blue-800 block mb-0.5">
                      الخارطة الذهنية والهدف من هذه الخطوة:
                    </span>
                    <span>{step.explanation}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive Math / Boxes Area */}
            <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100">
              {renderStepContent(step)}
            </div>
          </section>
        );
      })}
    </div>
  );
};

