// FlipCounter — Solari split-flap style, supporte mode dark
import { AnimatePresence, m, LazyMotion, domAnimation } from 'framer-motion';
import { useMemo } from 'react';

interface FlipCounterProps {
  value: number;
  decimals?: number;
  unit?: string;
  critical?: boolean;
  dark?: boolean;
  className?: string;
}

function FlipDigit({ char, id, dark }: { char: string; id: string; dark?: boolean }) {
  const color = dark ? '#E8E4DA' : 'inherit';
  return (
    <span
      className="relative inline-block overflow-hidden"
      style={{
        width: char === '.' ? '0.35em' : '0.65em',
        height: '1.2em',
        verticalAlign: 'bottom',
        perspective: 400,
      }}
    >
      <LazyMotion features={domAnimation}>
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={id}
            initial={{ rotateX: 90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: -90, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 flex items-end justify-center"
            style={{ color, transformOrigin: 'center bottom' }}
          >
            {char}
          </m.span>
        </AnimatePresence>
      </LazyMotion>
    </span>
  );
}

export function FlipCounter({ value, decimals = 0, unit, critical = false, dark = false, className = '' }: FlipCounterProps) {
  const formatted = value.toFixed(decimals);
  const chars = useMemo(() => formatted.split(''), [formatted]);

  const valueColor = critical
    ? (dark ? '#FF6B35' : 'var(--color-accent)')
    : (dark ? '#E8E4DA' : 'inherit');

  const unitColor = dark ? 'rgba(232,228,218,0.4)' : 'var(--color-ink-4)';

  return (
    <span
      className={`font-mono tabular-nums inline-flex items-end ${className}`}
      style={{ color: valueColor, fontSize: dark ? 16 : undefined }}
    >
      {chars.map((ch, i) => (
        <FlipDigit key={i} char={ch} id={`${i}-${ch}`} dark={dark} />
      ))}
      {unit && (
        <span
          className="text-xs ml-0.5 leading-none"
          style={{ color: unitColor, fontSize: 9 }}
        >
          {unit}
        </span>
      )}
    </span>
  );
}
