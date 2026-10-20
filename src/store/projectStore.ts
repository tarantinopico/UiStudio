import { create } from 'zustand';
import { db, getStarterProjects } from '../lib/persistence/db';
import type { Project, ProjectTheme, Screen } from '../types/models';
import { DEVICE_PRESETS } from '../lib/palette/widgetCatalog';
import {
  applyThemeToElements,
  BUILT_IN_THEMES,
} from '../lib/palette/themeAndGroupCatalog';

export type ProjectSortBy = 'updatedAt' | 'name' | 'createdAt';
export type ProjectFilterCategory = 'all' | 'pinned' | 'phone' | 'tablet';

export interface CreateProjectInput {
  name: string;
  description?: string;
  devicePresetId: string;
  widthDp: number;
  heightDp: number;
  theme?: ProjectTheme;
  initialScreenNames?: string[];
  defaultGridSizeDp?: number;
  defaultGutterDp?: number;
}

export interface ProjectStoreState {
  projects: Project[];
  isHydrated: boolean;
  searchQuery: string;
  sortBy: ProjectSortBy;
  filterCategory: ProjectFilterCategory;
  viewLayout: 'grid' | 'list';
  saveStatus: 'saved' | 'saving';

  // Actions
  hydrateProjects: () => Promise<void>;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: ProjectSortBy) => void;
  setFilterCategory: (filter: ProjectFilterCategory) => void;
  setViewLayout: (layout: 'grid' | 'list') => void;
  createProject: (input: CreateProjectInput) => Promise<Project>;
  upsertProject: (project: Project) => Promise<void>;
  duplicateProject: (projectId: string) => Promise<Project | null>;
  renameProject: (projectId: string, newName: string) => Promise<void>;
  togglePinProject: (projectId: string) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  importProjectObject: (project: Project) => Promise<Project>;
  resetAllProjects: () => Promise<void>;
}

export const useProjectStore = create<ProjectStoreState>((set, get) => ({
  projects: getStarterProjects(),
  isHydrated: false,
  searchQuery: '',
  sortBy: 'updatedAt',
  filterCategory: 'all',
  viewLayout: 'grid',
  saveStatus: 'saved',

  hydrateProjects: async () => {
    try {
      const stored = await db.projects.toArray();
      if (stored.length > 0) {
        set({ projects: stored, isHydrated: true });
      } else {
        const starters = getStarterProjects();
        await db.projects.bulkPut(starters);
        set({ projects: starters, isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSortBy: (sortBy) => set({ sortBy }),
  setFilterCategory: (filterCategory) => set({ filterCategory }),
  setViewLayout: (viewLayout) => set({ viewLayout }),

  createProject: async (input) => {
    const now = Date.now();
    const preset =
      DEVICE_PRESETS.find((d) => d.id === input.devicePresetId) ?? DEVICE_PRESETS[0];
    const widthDp = input.widthDp || preset.widthDp;
    const heightDp = input.heightDp || preset.heightDp;
    const chosenTheme = input.theme ?? BUILT_IN_THEMES[0];
    const screenNames =
      input.initialScreenNames && input.initialScreenNames.length > 0
        ? input.initialScreenNames
        : ['HomeScreen'];

    const screens: Screen[] = screenNames.map((scrName, idx) => {
      const sId = `screen-${now}-${idx}`;
      const baseElements =
        idx === 0
          ? applyThemeToElements(
              [
                {
                  id: `el-top-${now}-${idx}`,
                  type: 'TopAppBar' as const,
                  name: 'MainTopBar',
                  parentId: null,
                  x: 0,
                  y: 0,
                  width: widthDp,
                  height: 64,
                  zIndex: 1,
                  locked: false,
                  hidden: false,
                  props: {
                    text: input.name.trim() || scrName,
                    iconName: 'Sparkles',
                    backgroundColor: chosenTheme.surfaceColor,
                    contentColor: chosenTheme.textColor,
                  },
                },
                {
                  id: `el-card-${now}-${idx}`,
                  type: 'Card' as const,
                  name: 'HeroThemeCard',
                  parentId: null,
                  x: 20,
                  y: 88,
                  width: widthDp - 40,
                  height: 148,
                  zIndex: 2,
                  locked: false,
                  hidden: false,
                  props: {
                    text: input.name.trim() || 'Modern Compose UI',
                    secondaryText: `${chosenTheme.name} · ${chosenTheme.fontFamily}`,
                    backgroundColor: chosenTheme.surfaceColor,
                    contentColor: chosenTheme.textColor,
                    cornerRadius: chosenTheme.defaultCornerRadiusDp,
                    padding: 20,
                  },
                },
                {
                  id: `el-btn-${now}-${idx}`,
                  type: 'Button' as const,
                  name: 'PrimaryActionBtn',
                  parentId: null,
                  x: 20,
                  y: 256,
                  width: widthDp - 40,
                  height: 52,
                  zIndex: 3,
                  locked: false,
                  hidden: false,
                  props: {
                    text: 'Get Started',
                    iconName: 'ArrowRight',
                    backgroundColor: chosenTheme.primaryColor,
                    contentColor: '#FFFFFF',
                    cornerRadius: Math.max(12, chosenTheme.defaultCornerRadiusDp),
                    fontWeight: 'SemiBold' as const,
                  },
                },
              ],
              chosenTheme
            )
          : applyThemeToElements(
              [
                {
                  id: `el-top-${now}-${idx}`,
                  type: 'TopAppBar' as const,
                  name: `${scrName}TopBar`,
                  parentId: null,
                  x: 0,
                  y: 0,
                  width: widthDp,
                  height: 64,
                  zIndex: 1,
                  locked: false,
                  hidden: false,
                  props: {
                    text: scrName,
                    iconName: 'ArrowLeft',
                    backgroundColor: chosenTheme.surfaceColor,
                    contentColor: chosenTheme.textColor,
                  },
                },
              ],
              chosenTheme
            );

      return {
        id: sId,
        name: scrName,
        backgroundColor: chosenTheme.useGradient
          ? chosenTheme.gradientStart
          : chosenTheme.backgroundColor,
        useGradientBg: chosenTheme.useGradient,
        gradientEndColor: chosenTheme.gradientEnd,
        gradientAngle: chosenTheme.gradientAngle,
        isDarkPreview: chosenTheme.isDark,
        guides: [],
        elements: baseElements,
      };
    });

    const newProject: Project = {
      id: `proj-${now}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim() || 'Untitled Compose UI',
      description:
        input.description?.trim() ||
        `${chosenTheme.name} · ${screens.length} screen(s) · ${widthDp}×${heightDp}dp`,
      createdAt: now,
      updatedAt: now,
      pinned: false,
      devicePresetId: input.devicePresetId || 'pixel-8-pro',
      widthDp,
      heightDp,
      editorMode: 'simple',
      layoutMode: 'free',
      materialVersion: 'm3',
      theme: chosenTheme,
      gridSettings: {
        enabled: true,
        sizeDp: input.defaultGridSizeDp ?? 8,
        columns: widthDp >= 600 ? 8 : 4,
        gutterDp: input.defaultGutterDp ?? 16,
        marginDp: 16,
        snapToGrid: true,
        snapToElements: true,
        snapToGuides: true,
      },
      activeScreenId: screens[0].id,
      screens,
    };

    set((state) => ({
      projects: [newProject, ...state.projects],
      saveStatus: 'saved',
    }));

    try {
      await db.projects.put(newProject);
    } catch {
      // Ignore IndexedDB error in restricted contexts
    }

    return newProject;
  },

  upsertProject: async (project) => {
    const updated: Project = { ...project, updatedAt: Date.now() };
    set((state) => ({
      projects: state.projects.some((p) => p.id === updated.id)
        ? state.projects.map((p) => (p.id === updated.id ? updated : p))
        : [updated, ...state.projects],
      saveStatus: 'saving',
    }));

    try {
      await db.projects.put(updated);
    } catch {
      // Ignore
    }

    setTimeout(() => {
      set({ saveStatus: 'saved' });
    }, 350);
  },

  duplicateProject: async (projectId) => {
    const source = get().projects.find((p) => p.id === projectId);
    if (!source) return null;
    const now = Date.now();
    const copy: Project = JSON.parse(JSON.stringify(source));
    copy.id = `proj-${now}-${Math.random().toString(36).slice(2, 6)}`;
    copy.name = `${source.name} (Copy)`;
    copy.createdAt = now;
    copy.updatedAt = now;

    set((state) => ({
      projects: [copy, ...state.projects],
    }));

    try {
      await db.projects.put(copy);
    } catch {
      // Ignore
    }
    return copy;
  },

  renameProject: async (projectId, newName) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    const target = get().projects.find((p) => p.id === projectId);
    if (!target) return;
    const updated = { ...target, name: trimmed, updatedAt: Date.now() };
    await get().upsertProject(updated);
  },

  togglePinProject: async (projectId) => {
    const target = get().projects.find((p) => p.id === projectId);
    if (!target) return;
    const updated = { ...target, pinned: !target.pinned, updatedAt: Date.now() };
    await get().upsertProject(updated);
  },

  deleteProject: async (projectId) => {
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    }));
    try {
      await db.projects.delete(projectId);
    } catch {
      // Ignore
    }
  },

  importProjectObject: async (project) => {
    set((state) => ({
      projects: [project, ...state.projects],
    }));
    try {
      await db.projects.put(project);
    } catch {
      // Ignore
    }
    return project;
  },

  resetAllProjects: async () => {
    const starters = getStarterProjects();
    set({ projects: starters, searchQuery: '', filterCategory: 'all' });
    try {
      await db.projects.clear();
      await db.projects.bulkPut(starters);
    } catch {
      // Ignore
    }
  },
}));
