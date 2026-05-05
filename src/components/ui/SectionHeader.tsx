// SectionHeader — en-tête de section dans les panneaux de configuration
import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#D9D7D2]">
      <div className="flex items-center gap-2">
        <span className="font-sans text-[9px] uppercase tracking-[0.15em] text-[#6B6560]">
          {title}
        </span>
        {subtitle && (
          <span className="font-mono text-[9px] text-[#6B6560]">
            — {subtitle}
          </span>
        )}
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  );
}
