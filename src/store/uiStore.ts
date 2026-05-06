// Store UI — navigation, panneaux, onglets
import { create } from 'zustand';

export type ViewMode = 'configure' | 'facade' | 'analyse' | 'charts';
export type ActivePanel = 'geometry' | 'wall' | 'windows' | 'roof' | 'ventilation' | 'hvac' | 'climate' | 'scenarios';
export type SelectedMesh = 'wall' | 'window_south' | 'window_north' | 'window_east' | 'window_west' | 'roof' | 'floor' | 'geometry' | null;

interface UIStore {
  /* App gate */
  appUnlocked: boolean;
  setAppUnlocked: (v: boolean) => void;

  /* Project */
  projectName: string;
  setProjectName: (v: string) => void;

  /* Config drawer */
  configDrawerOpen: boolean;
  setConfigDrawerOpen: (v: boolean) => void;
  toggleConfigDrawer: () => void;

  /* 3D selection */
  selectedMesh: SelectedMesh;
  setSelectedMesh: (v: SelectedMesh) => void;
  hoveredMesh: string | null;
  setHoveredMesh: (v: string | null) => void;

  /* Views & panels */
  activeView: ViewMode;
  activePanel: ActivePanel;
  isSimRunning: boolean;
  showSectionCut: boolean;
  sectionCutY: number;
  showExploded: boolean;
  showDimensions: boolean;
  showHatch: boolean;
  tooltipVisible: boolean;
  tooltipContent: string;

  setActiveView: (v: ViewMode) => void;
  setActivePanel: (p: ActivePanel) => void;
  setIsSimRunning: (v: boolean) => void;
  toggleSectionCut: () => void;
  setSectionCutY: (y: number) => void;
  toggleExploded: () => void;
  toggleDimensions: () => void;
  toggleHatch: () => void;
  showTooltip: (content: string) => void;
  hideTooltip: () => void;
  aptSizeM2: number;
  setAptSizeM2: (v: number) => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  appUnlocked: false,
  setAppUnlocked: (v) => set({ appUnlocked: v }),

  projectName: 'Untitled project',
  setProjectName: (v) => set({ projectName: v }),

  configDrawerOpen: false,
  setConfigDrawerOpen: (v) => set({ configDrawerOpen: v }),
  toggleConfigDrawer: () => set((s) => ({ configDrawerOpen: !s.configDrawerOpen })),

  selectedMesh: null,
  setSelectedMesh: (v) => set({ selectedMesh: v }),
  hoveredMesh: null,
  setHoveredMesh: (v) => set({ hoveredMesh: v }),

  activeView: 'configure',
  activePanel: 'geometry',
  isSimRunning: false,
  showSectionCut: false,
  sectionCutY: 0.5,
  showExploded: false,
  showDimensions: true,
  showHatch: true,
  tooltipVisible: false,
  tooltipContent: '',

  setActiveView: (v) => set({ activeView: v }),
  setActivePanel: (p) => set({ activePanel: p }),
  setIsSimRunning: (v) => set({ isSimRunning: v }),
  toggleSectionCut: () => set((s) => ({ showSectionCut: !s.showSectionCut })),
  setSectionCutY: (y) => set({ sectionCutY: Math.max(0, Math.min(1, y)) }),
  toggleExploded: () => set((s) => ({ showExploded: !s.showExploded })),
  toggleDimensions: () => set((s) => ({ showDimensions: !s.showDimensions })),
  toggleHatch: () => set((s) => ({ showHatch: !s.showHatch })),
  showTooltip: (content) => set({ tooltipVisible: true, tooltipContent: content }),
  hideTooltip: () => set({ tooltipVisible: false }),
  aptSizeM2: 65,
  setAptSizeM2: (v) => set({ aptSizeM2: Math.max(10, v) }),
}));
