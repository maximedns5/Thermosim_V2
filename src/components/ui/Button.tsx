// Bouton réutilisable — trois variantes : primary, ghost, icon
import React from 'react';

type Variant = 'primary' | 'ghost' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  label?: string;
  children?: React.ReactNode;
}

const BASE =
  'inline-flex items-center justify-center gap-1 font-mono text-xs uppercase tracking-widest ' +
  'transition-colors duration-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-ink ' +
  'disabled:opacity-40 disabled:pointer-events-none select-none';

const VARIANTS: Record<Variant, string> = {
  primary:
    'h-7 px-3 bg-ink text-paper hover:bg-ink-2 active:bg-ink rounded-sm',
  ghost:
    'h-7 px-3 border border-rule text-ink hover:border-ink hover:bg-rule-soft active:bg-rule rounded-sm',
  icon:
    'h-7 w-7 border border-rule text-ink hover:border-ink hover:bg-rule-soft active:bg-rule rounded-sm',
};

export function Button({
  variant = 'ghost',
  children,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${BASE} ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
