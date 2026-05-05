// Onglets génériques
import React, { createContext, useContext } from 'react';

interface TabsContextValue {
  active: string;
  setActive: (id: string) => void;
}

const TabsContext = createContext<TabsContextValue | null>(null);

function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tab used outside Tabs');
  return ctx;
}

interface TabsProps {
  value: string;
  onChange: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function Tabs({ value, onChange, children, className = '' }: TabsProps) {
  return (
    <TabsContext.Provider value={{ active: value, setActive: onChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabList({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div role="tablist" className={`flex border-b border-rule ${className}`}>
      {children}
    </div>
  );
}

interface TabProps {
  id: string;
  label: string;
  shortcut?: string;
}

export function Tab({ id, label, shortcut }: TabProps) {
  const { active, setActive } = useTabs();
  const isActive = active === id;

  return (
    <button
      role="tab"
      aria-selected={isActive}
      aria-controls={`tabpanel-${id}`}
      onClick={() => setActive(id)}
      className={
        'relative px-3 h-8 font-mono text-xs uppercase tracking-widest transition-colors ' +
        (isActive
          ? 'text-ink after:absolute after:bottom-0 after:inset-x-0 after:h-px after:bg-ink'
          : 'text-ink-3 hover:text-ink-2')
      }
    >
      {label}
      {shortcut && (
        <span className="ml-1 text-ink-4 text-[10px]">[{shortcut}]</span>
      )}
    </button>
  );
}

interface TabPanelProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TabPanel({ id, children, className = '' }: TabPanelProps) {
  const { active } = useTabs();
  if (active !== id) return null;
  return (
    <div role="tabpanel" id={`tabpanel-${id}`} className={className}>
      {children}
    </div>
  );
}
