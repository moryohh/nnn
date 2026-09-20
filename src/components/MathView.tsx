import React, { useEffect, useRef } from 'react';
import katex from 'katex';

interface MathViewProps {
  formula: string;
  displayMode?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({
  formula,
  displayMode = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: displayMode,
          output: 'htmlAndMathml',
        });
      } catch (err) {
        if (containerRef.current) {
          containerRef.current.innerText = formula;
        }
      }
    }
  }, [formula, displayMode]);

  return <span ref={containerRef} className={`inline-block dir-ltr ${className}`} />;
};
