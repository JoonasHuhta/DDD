import { create } from 'zustand';

/**
 * usePanelState — Centralized UI panel state management
 *
 * All panel open/close booleans live here instead of scattered
 * useState calls in GameUI.tsx. This makes it easy to:
 *  - Open only one panel at a time
 *  - Close all panels from anywhere in the app
 *  - Add new panels without touching GameUI.tsx logic
 */

export type PanelId =
  | 'campaigns'
  | 'departments'
  | 'statistics'
  | 'automation'
  | 'synergies'
  | 'options'
  | 'shop'
  | 'legal'
  | 'suitcase'
  | 'mansion'
  | 'sinisterLab'
  | 'dataMarket'
  | 'espionage'
  | 'serverDefense';

type PanelStateStore = {
  openPanelId: PanelId | null;

  /** Open a specific panel (closes any currently open panel first) */
  openPanel: (id: PanelId) => void;

  /** Close the specified panel (no-op if it's not open) */
  closePanel: (id: PanelId) => void;

  /** Close whatever panel is currently open */
  closeAllPanels: () => void;

  /** Toggle a panel — opens it if closed, closes it if open */
  togglePanel: (id: PanelId) => void;

  /** True if any panel is currently open */
  isAnyPanelOpen: () => boolean;

  /** True if the specified panel is open */
  isPanelOpen: (id: PanelId) => boolean;
};

export const usePanelState = create<PanelStateStore>((set, get) => ({
  openPanelId: null,

  openPanel: (id) => set({ openPanelId: id }),

  closePanel: (id) =>
    set((state) => ({
      openPanelId: state.openPanelId === id ? null : state.openPanelId,
    })),

  closeAllPanels: () => set({ openPanelId: null }),

  togglePanel: (id) =>
    set((state) => ({
      openPanelId: state.openPanelId === id ? null : id,
    })),

  isAnyPanelOpen: () => get().openPanelId !== null,

  isPanelOpen: (id) => get().openPanelId === id,
}));
