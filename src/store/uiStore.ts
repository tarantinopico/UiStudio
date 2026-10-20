import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../lib/i18n';
import type {
  MobileEditorLayout,
  ProjectTheme,
  WidgetGroupTemplate,
} from '../types/models';
import {
  BUILT_IN_THEMES,
  BUILT_IN_WIDGET_GROUPS,
} from '../lib/palette/themeAndGroupCatalog';

export type AppView = 'home' | 'editor';
export type ThemePreference = 'light' | 'dark' | 'system';
export type MobileSheetTab = 'none' | 'palette' | 'layers' | 'inspector' | 'overlays' | 'screens';

export interface ToastMessage {
  id: string;
  title: string;
  type?: 'info' | 'success' | 'error';
}

export interface UIState {
  activeView: AppView;
  theme: ThemePreference;
  accentColor: string;
  mobileEditorLayout: MobileEditorLayout;
  defaultGridSizeDp: number;
  defaultGutterDp: number;
  unitDisplay: 'dp' | 'px';
  hapticFeedback: boolean;
  helperLines: boolean;
  autosaveIntervalMs: number;
  language: 'en' | 'cs';
  onboardingDismissed: boolean;
  activeMobileSheet: MobileSheetTab;
  showExportModal: boolean;
  showSettingsModal: boolean;
  showNewProjectModal: boolean;
  showThemeStudioModal: boolean;
  toasts: ToastMessage[];

  // Global Reusable Studio Themes (CRUD)
  customThemes: ProjectTheme[];
  // Global Reusable Widget Groups (CRUD)
  customWidgetGroups: WidgetGroupTemplate[];

  // Actions
  setActiveView: (view: AppView) => void;
  setTheme: (theme: ThemePreference) => void;
  setAccentColor: (color: string) => void;
  setMobileEditorLayout: (layout: MobileEditorLayout) => void;
  setDefaultGridSizeDp: (size: number) => void;
  setDefaultGutterDp: (gutter: number) => void;
  setUnitDisplay: (unit: 'dp' | 'px') => void;
  setHapticFeedback: (enabled: boolean) => void;
  setHelperLines: (enabled: boolean) => void;
  setAutosaveIntervalMs: (ms: number) => void;
  setLanguage: (lang: 'en' | 'cs') => void;
  dismissOnboarding: () => void;
  setActiveMobileSheet: (sheet: MobileSheetTab) => void;
  setShowExportModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;
  setShowNewProjectModal: (show: boolean) => void;
  setShowThemeStudioModal: (show: boolean) => void;
  addToast: (title: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
  triggerHaptic: (durationMs?: number) => void;
  resetUISettings: () => void;

  // Theme CRUD Actions
  getAllThemes: () => ProjectTheme[];
  saveCustomTheme: (theme: ProjectTheme) => void;
  deleteCustomTheme: (id: string) => void;

  // Widget Group CRUD Actions
  getAllWidgetGroups: () => WidgetGroupTemplate[];
  saveCustomWidgetGroup: (group: WidgetGroupTemplate) => void;
  renameCustomWidgetGroup: (id: string, name: string) => void;
  deleteCustomWidgetGroup: (id: string) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      activeView: 'home',
      theme: 'dark',
      accentColor: '#6366F1',
      mobileEditorLayout: 'thumb-cockpit',
      defaultGridSizeDp: 8,
      defaultGutterDp: 16,
      unitDisplay: 'dp',
      hapticFeedback: true,
      helperLines: true,
      autosaveIntervalMs: 1500,
      language: 'en',
      onboardingDismissed: false,
      activeMobileSheet: 'none',
      showExportModal: false,
      showSettingsModal: false,
      showNewProjectModal: false,
      showThemeStudioModal: false,
      toasts: [],
      customThemes: [],
      customWidgetGroups: [],

      setActiveView: (view) => set({ activeView: view, activeMobileSheet: 'none' }),
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          const isDark =
            theme === 'dark' ||
            (theme === 'system' &&
              window.matchMedia('(prefers-color-scheme: dark)').matches);
          document.documentElement.classList.toggle('dark', isDark);
        }
      },
      setAccentColor: (accentColor) => set({ accentColor }),
      setMobileEditorLayout: (mobileEditorLayout) => set({ mobileEditorLayout }),
      setDefaultGridSizeDp: (defaultGridSizeDp) => set({ defaultGridSizeDp }),
      setDefaultGutterDp: (defaultGutterDp) => set({ defaultGutterDp }),
      setUnitDisplay: (unitDisplay) => set({ unitDisplay }),
      setHapticFeedback: (hapticFeedback) => set({ hapticFeedback }),
      setHelperLines: (helperLines) => set({ helperLines }),
      setAutosaveIntervalMs: (autosaveIntervalMs) => set({ autosaveIntervalMs }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        set({ language });
      },
      dismissOnboarding: () => set({ onboardingDismissed: true }),
      setActiveMobileSheet: (activeMobileSheet) => set({ activeMobileSheet }),
      setShowExportModal: (showExportModal) => set({ showExportModal }),
      setShowSettingsModal: (showSettingsModal) => set({ showSettingsModal }),
      setShowNewProjectModal: (showNewProjectModal) => set({ showNewProjectModal }),
      setShowThemeStudioModal: (showThemeStudioModal) => set({ showThemeStudioModal }),

      addToast: (title, type = 'info') => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        set((state) => ({
          toasts: [...state.toasts.slice(-2), { id, title, type }],
        }));
        setTimeout(() => {
          get().removeToast(id);
        }, 2800);
      },

      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),

      triggerHaptic: (durationMs = 8) => {
        if (get().hapticFeedback && typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(durationMs);
          } catch {
            // Ignore on unsupported devices
          }
        }
      },

      getAllThemes: () => {
        return [...BUILT_IN_THEMES, ...get().customThemes];
      },

      saveCustomTheme: (theme) => {
        set((state) => {
          const exists = state.customThemes.some((t) => t.id === theme.id);
          return {
            customThemes: exists
              ? state.customThemes.map((t) => (t.id === theme.id ? theme : t))
              : [theme, ...state.customThemes],
          };
        });
      },

      deleteCustomTheme: (id) => {
        set((state) => ({
          customThemes: state.customThemes.filter((t) => t.id !== id),
        }));
      },

      getAllWidgetGroups: () => {
        return [...get().customWidgetGroups, ...BUILT_IN_WIDGET_GROUPS];
      },

      saveCustomWidgetGroup: (group) => {
        set((state) => ({
          customWidgetGroups: [group, ...state.customWidgetGroups],
        }));
      },

      renameCustomWidgetGroup: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          customWidgetGroups: state.customWidgetGroups.map((g) =>
            g.id === id ? { ...g, name: trimmed } : g
          ),
        }));
      },

      deleteCustomWidgetGroup: (id) => {
        set((state) => ({
          customWidgetGroups: state.customWidgetGroups.filter((g) => g.id !== id),
        }));
      },

      resetUISettings: () => {
        i18n.changeLanguage('en');
        set({
          theme: 'dark',
          accentColor: '#6366F1',
          mobileEditorLayout: 'thumb-cockpit',
          defaultGridSizeDp: 8,
          defaultGutterDp: 16,
          unitDisplay: 'dp',
          hapticFeedback: true,
          helperLines: true,
          autosaveIntervalMs: 1500,
          language: 'en',
          onboardingDismissed: false,
          customThemes: [],
          customWidgetGroups: [],
        });
      },
    }),
    {
      name: 'composestudio-ui-settings-v2',
      partialize: (state) => ({
        theme: state.theme,
        accentColor: state.accentColor,
        mobileEditorLayout: state.mobileEditorLayout,
        defaultGridSizeDp: state.defaultGridSizeDp,
        defaultGutterDp: state.defaultGutterDp,
        unitDisplay: state.unitDisplay,
        hapticFeedback: state.hapticFeedback,
        helperLines: state.helperLines,
        autosaveIntervalMs: state.autosaveIntervalMs,
        language: state.language,
        onboardingDismissed: state.onboardingDismissed,
        customThemes: state.customThemes,
        customWidgetGroups: state.customWidgetGroups,
      }),
    }
  )
);
