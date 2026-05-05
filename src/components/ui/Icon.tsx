// Icon — système d'icônes SVG monochromes 16×16
// Noms inspirés de la nomenclature technique (thermique, bâtiment, UI)
import React from 'react';

export type IconName =
  | 'sun'
  | 'thermometer'
  | 'building'
  | 'layers'
  | 'wind'
  | 'play'
  | 'stop'
  | 'refresh'
  | 'download'
  | 'upload'
  | 'settings'
  | 'info'
  | 'warning'
  | 'check'
  | 'close'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'arrow-right'
  | 'grid'
  | 'eye'
  | 'chart-bar'
  | 'chart-line';

interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
  'aria-label'?: string;
}

// Paths SVG 16×16, style "rotring" — traits fins, pas de fill
const PATHS: Record<IconName, React.ReactElement> = {
  sun: (
    <>
      <circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1" />
      {[0,45,90,135,180,225,270,315].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={8 + 4.5 * Math.cos(r)}
            y1={8 + 4.5 * Math.sin(r)}
            x2={8 + 6.5 * Math.cos(r)}
            y2={8 + 6.5 * Math.sin(r)}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </>
  ),
  thermometer: (
    <>
      <rect x="6.5" y="2" width="3" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="8" cy="12" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="6" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  building: (
    <>
      <rect x="3" y="4" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1" />
      <line x1="3" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="11" width="4" height="3" fill="none" stroke="currentColor" strokeWidth="1" />
      <polyline points="3,4 8,1 13,4" fill="none" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  layers: (
    <>
      <polyline points="2,8 8,5 14,8" fill="none" stroke="currentColor" strokeWidth="1" />
      <polyline points="2,11 8,8 14,11" fill="none" stroke="currentColor" strokeWidth="1" />
      <polyline points="2,5 8,2 14,5" fill="none" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  wind: (
    <>
      <path d="M2 8h9a2 2 0 0 0 0-4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M2 11h7a2 2 0 0 1 0 4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  play: (
    <polygon points="4,3 13,8 4,13" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
  ),
  stop: (
    <rect x="3" y="3" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1" />
  ),
  refresh: (
    <>
      <path d="M13 8A5 5 0 1 1 8 3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <polyline points="8,1 8,4 11,4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </>
  ),
  download: (
    <>
      <line x1="8" y1="2" x2="8" y2="10" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <polyline points="5,8 8,11 11,8" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <line x1="3" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  upload: (
    <>
      <line x1="8" y1="10" x2="8" y2="2" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <polyline points="5,4 8,1 11,4" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <line x1="3" y1="14" x2="13" y2="14" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  settings: (
    <>
      <circle cx="8" cy="8" r="2.5" fill="none" stroke="currentColor" strokeWidth="1" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <line
            key={a}
            x1={8 + 4 * Math.cos(r)}
            y1={8 + 4 * Math.sin(r)}
            x2={8 + 6 * Math.cos(r)}
            y2={8 + 6 * Math.sin(r)}
            stroke="currentColor"
            strokeWidth="1"
          />
        );
      })}
    </>
  ),
  info: (
    <>
      <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="8" y1="7" x2="8" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.8" fill="currentColor" />
    </>
  ),
  warning: (
    <>
      <polyline points="8,2 14,13 2,13" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
      <line x1="8" y1="7" x2="8" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="8" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  check: (
    <polyline points="2,8 6,12 14,4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  ),
  close: (
    <>
      <line x1="3" y1="3" x2="13" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <line x1="13" y1="3" x2="3" y2="13" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
    </>
  ),
  'chevron-right': (
    <polyline points="5,3 11,8 5,13" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'chevron-down': (
    <polyline points="3,5 8,11 13,5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'chevron-up': (
    <polyline points="3,11 8,5 13,11" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
  ),
  'arrow-right': (
    <>
      <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <polyline points="10,4 14,8 10,12" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  grid: (
    <>
      <line x1="5" y1="2" x2="5" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1="11" y1="2" x2="11" y2="14" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="5" x2="14" y2="5" stroke="currentColor" strokeWidth="1" />
      <line x1="2" y1="11" x2="14" y2="11" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  eye: (
    <>
      <path d="M2 8c2-4 10-4 12 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <path d="M2 8c2 4 10 4 12 0" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2" fill="none" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'chart-bar': (
    <>
      <rect x="2" y="10" width="3" height="4" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="6.5" y="6" width="3" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="11" y="3" width="3" height="11" fill="none" stroke="currentColor" strokeWidth="1" />
      <line x1="1" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1" />
    </>
  ),
  'chart-line': (
    <>
      <polyline points="2,12 5,7 8,9 11,5 14,3" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="1" y1="14" x2="15" y2="14" stroke="currentColor" strokeWidth="1" />
    </>
  ),
};

export function Icon({ name, size = 16, className = '', 'aria-label': ariaLabel }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      role={ariaLabel ? 'img' : 'presentation'}
    >
      {PATHS[name]}
    </svg>
  );
}
