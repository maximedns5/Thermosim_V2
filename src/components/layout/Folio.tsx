// Folio — bande de bas de page, fond dark, nom de projet éditable
import { useState, useRef } from 'react';
import { useUIStore } from '../../store/uiStore';

export function Folio() {
  const { projectName, setProjectName } = useUIStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(projectName);
  const inputRef = useRef<HTMLInputElement>(null);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const version = import.meta.env.VITE_APP_VERSION ?? '2.0.0';

  const commitEdit = () => {
    const trimmed = draft.trim() || 'Untitled project';
    setProjectName(trimmed);
    setDraft(trimmed);
    setEditing(false);
  };

  const baseStyle: React.CSSProperties = {
    fontFamily: 'var(--font-mono)',
    fontSize: 9,
    letterSpacing: '0.06em',
    color: 'rgba(232,228,218,0.35)',
  };

  return (
    <footer
      className="flex items-center justify-between px-4 select-none"
      style={{
        height: 24,
        background: 'var(--color-surface-dark)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <span style={baseStyle}>
        THERMOSIM · {version} · RE2020
      </span>

      {/* Nom de projet éditable */}
      <div className="flex items-center gap-0">
        {editing ? (
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') { setDraft(projectName); setEditing(false); }
            }}
            autoFocus
            className="bg-transparent outline-none"
            style={{
              ...baseStyle,
              color: 'rgba(232,228,218,0.7)',
              borderBottom: '1px solid rgba(232,228,218,0.4)',
              minWidth: 120,
              maxWidth: 220,
            }}
          />
        ) : (
          <button
            onClick={() => { setDraft(projectName); setEditing(true); }}
            className="cursor-pointer bg-transparent border-none"
            style={{ ...baseStyle }}
            title="Cliquer pour renommer"
          >
            {projectName}
          </button>
        )}
        <span style={baseStyle}> · {dateStr}</span>
      </div>

      <span style={baseStyle}>Folio 1/1</span>
    </footer>
  );
}
