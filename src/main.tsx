import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/tokens.css';
import './styles/base.css';
import App from './App.tsx';
import { useUIStore } from './store/uiStore.ts';

// Expose store in dev for preview testing
if (import.meta.env.DEV) {
  (window as any).__ui = useUIStore;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
