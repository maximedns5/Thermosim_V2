// Tooltip avec délai — apparition après 400 ms
import React, { useState, useRef, useCallback } from 'react';

interface TooltipProps {
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  children: React.ReactElement;
}

export function Tooltip({
  content,
  placement = 'top',
  delay = 400,
  children,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  const PLACEMENT_CLASSES: Record<string, string> = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-1',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-1',
    left: 'right-full top-1/2 -translate-y-1/2 mr-1',
    right: 'left-full top-1/2 -translate-y-1/2 ml-1',
  };

  return (
    <span className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      {visible && content && (
        <span
          role="tooltip"
          className={
            `absolute z-50 whitespace-nowrap bg-ink text-paper font-mono text-[10px] px-2 py-1 rounded-sm pointer-events-none ` +
            (PLACEMENT_CLASSES[placement] ?? PLACEMENT_CLASSES.top)
          }
        >
          {content}
        </span>
      )}
    </span>
  );
}
