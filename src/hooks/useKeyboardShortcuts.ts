// Raccourcis clavier globaux
import { useEffect } from 'react';
import { useUIStore } from '../store/uiStore';
import { useSimulation } from './useSimulation';

export function useKeyboardShortcuts() {
  const { setActiveView, toggleSectionCut, toggleExploded, toggleDimensions } = useUIStore();
  const { runDynamic } = useSimulation();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (['input', 'select', 'textarea'].includes(tag)) return;

      switch (e.key) {
        case '1': setActiveView('configure'); break;
        case '2': setActiveView('facade'); break;
        case '3': setActiveView('coupe'); break;
        case '4': setActiveView('plan'); break;
        case '5': setActiveView('analyse'); break;
        case '6': setActiveView('charts'); break;
        case 'x': case 'X': toggleSectionCut(); break;
        case 'e': case 'E': toggleExploded(); break;
        case 'd': case 'D': toggleDimensions(); break;
        case 'Enter':
          if (e.ctrlKey || e.metaKey) { void runDynamic(); }
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveView, toggleSectionCut, toggleExploded, toggleDimensions, runDynamic]);
}
