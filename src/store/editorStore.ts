import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  ComposeElement,
  EditorMode,
  ElementProps,
  GridSettings,
  GuideLine,
  HistoryEntry,
  LayoutMode,
  MaterialVersion,
  Project,
  ProjectTheme,
  Screen,
  SnapLine,
  WidgetGroupTemplate,
  WidgetType,
} from '../types/models';
import { getWidgetDefinition } from '../lib/palette/widgetCatalog';
import {
  alignElements,
  applyAutoLayoutStructure,
  distributeElements,
  type AlignmentOperation,
  type DistributionOperation,
} from '../lib/grid/gridMath';
import {
  applyThemeToElements,
  BUILT_IN_THEMES,
} from '../lib/palette/themeAndGroupCatalog';

export interface EditorState {
  project: Project | null;
  selectedIds: string[];
  multiSelectMode: boolean;
  /** IDs of a newly inserted Widget Group that move together once and then auto-ungroup */
  pendingGroupMoveIds: string[];
  clipboard: ComposeElement[];
  historyPast: HistoryEntry[];
  historyFuture: HistoryEntry[];

  // Viewport & Overlays
  zoom: number;
  panX: number;
  panY: number;
  showStatusBar: boolean;
  showNavBar: boolean;
  showSafeArea: boolean;
  showRulers: boolean;
  activeSnapLines: SnapLine[];

  // Actions
  loadProject: (project: Project) => void;
  updateProjectName: (name: string) => void;
  setEditorMode: (mode: EditorMode) => void;
  setLayoutMode: (mode: LayoutMode) => void;
  setMaterialVersion: (version: MaterialVersion) => void;
  updateGridSettings: (partial: Partial<GridSettings>) => void;
  setScreenBackground: (
    color: string,
    isDarkPreview?: boolean,
    gradientOpts?: { useGradientBg?: boolean; gradientEndColor?: string; gradientAngle?: number }
  ) => void;
  applyProjectTheme: (theme: ProjectTheme, restyleWidgets?: boolean) => void;

  // Multi-Screen Management
  setActiveScreen: (screenId: string) => void;
  addScreen: (name?: string, duplicateCurrent?: boolean) => Screen | null;
  renameScreen: (screenId: string, name: string) => void;
  deleteScreen: (screenId: string) => void;

  // Selection
  selectElement: (id: string | null, additive?: boolean) => void;
  setSelectedIds: (ids: string[]) => void;
  toggleMultiSelectMode: (enabled?: boolean) => void;
  selectAll: () => void;

  // Element & Group CRUD
  addWidget: (type: WidgetType, position?: { x: number; y: number }) => ComposeElement | null;
  insertWidgetGroup: (
    group: WidgetGroupTemplate,
    colorMode: 'theme' | 'keep'
  ) => ComposeElement[];
  moveElementsByDelta: (ids: string[], deltaX: number, deltaY: number) => void;
  completePendingGroupMove: () => void;
  createGroupTemplateFromSelection: (
    name: string,
    category?: string
  ) => WidgetGroupTemplate | null;
  updateElementGeometry: (
    id: string,
    rect: Partial<{ x: number; y: number; width: number; height: number }>,
    recordHistory?: boolean
  ) => void;
  updateElementProps: (id: string, props: Partial<ElementProps>, recordHistory?: boolean) => void;
  renameElement: (id: string, name: string) => void;
  toggleLockElement: (id: string) => void;
  toggleHideElement: (id: string) => void;
  reorderElement: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
  nestElementInContainer: (childId: string, containerId: string | null) => void;
  groupSelectedInBox: () => void;
  deleteSelected: () => void;

  // Clipboard
  copySelected: () => void;
  pasteClipboard: () => void;
  duplicateSelected: () => void;

  // Alignment, Distribution, Auto-Layout
  alignSelected: (op: AlignmentOperation) => void;
  distributeSelected: (op: DistributionOperation) => void;
  runAutoLayout: () => void;

  // Guides
  addGuide: (axis: 'horizontal' | 'vertical', positionDp: number) => void;
  removeGuide: (id: string) => void;
  clearGuides: () => void;

  // Viewport & Snap
  setViewport: (partial: Partial<{ zoom: number; panX: number; panY: number }>) => void;
  resetViewport: () => void;
  toggleOverlay: (overlay: 'statusBar' | 'navBar' | 'safeArea' | 'rulers') => void;
  setActiveSnapLines: (lines: SnapLine[]) => void;

  // History
  pushHistory: (label: string) => void;
  undo: () => void;
  redo: () => void;
}

function cloneScreens(screens: Screen[]): Screen[] {
  return JSON.parse(JSON.stringify(screens));
}

function getActiveScreen(project: Project): Screen {
  return (
    project.screens.find((s) => s.id === project.activeScreenId) ??
    project.screens[0]
  );
}

export const useEditorStore = create<EditorState>()(
  immer((set, get) => ({
    project: null,
    selectedIds: [],
    multiSelectMode: false,
    pendingGroupMoveIds: [],
    clipboard: [],
    historyPast: [],
    historyFuture: [],

    zoom: 0.74,
    panX: 0,
    panY: 0,
    showStatusBar: true,
    showNavBar: true,
    showSafeArea: false,
    showRulers: true,
    activeSnapLines: [],

    loadProject: (project) => {
      const cloned: Project = JSON.parse(JSON.stringify(project));
      const isNarrowViewport =
        typeof window !== 'undefined' && window.innerWidth < 640;
      const defaultZoom =
        cloned.widthDp > 500
          ? isNarrowViewport
            ? 0.46
            : 0.62
          : isNarrowViewport
            ? 0.64
            : 0.74;
      set({
        project: cloned,
        selectedIds: [],
        multiSelectMode: false,
        pendingGroupMoveIds: [],
        historyPast: [],
        historyFuture: [],
        zoom: defaultZoom,
        panX: 0,
        panY: 0,
        activeSnapLines: [],
      });
    },

    updateProjectName: (name) => {
      set((state) => {
        if (!state.project) return;
        state.project.name = name;
        state.project.updatedAt = Date.now();
      });
    },

    setEditorMode: (mode) => {
      set((state) => {
        if (!state.project) return;
        state.project.editorMode = mode;
        state.project.updatedAt = Date.now();
      });
    },

    setLayoutMode: (mode) => {
      get().pushHistory(`Switch to ${mode} mode`);
      set((state) => {
        if (!state.project) return;
        state.project.layoutMode = mode;
        state.project.updatedAt = Date.now();
      });
    },

    setMaterialVersion: (version) => {
      set((state) => {
        if (!state.project) return;
        state.project.materialVersion = version;
        state.project.updatedAt = Date.now();
      });
    },

    updateGridSettings: (partial) => {
      set((state) => {
        if (!state.project) return;
        state.project.gridSettings = {
          ...state.project.gridSettings,
          ...partial,
        };
        state.project.updatedAt = Date.now();
      });
    },

    setScreenBackground: (color, isDarkPreview, gradientOpts) => {
      get().pushHistory('Change screen background');
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.backgroundColor = color;
        if (typeof isDarkPreview === 'boolean') {
          screen.isDarkPreview = isDarkPreview;
        }
        if (gradientOpts) {
          if (typeof gradientOpts.useGradientBg === 'boolean') {
            screen.useGradientBg = gradientOpts.useGradientBg;
          }
          if (gradientOpts.gradientEndColor) {
            screen.gradientEndColor = gradientOpts.gradientEndColor;
          }
          if (typeof gradientOpts.gradientAngle === 'number') {
            screen.gradientAngle = gradientOpts.gradientAngle;
          }
        }
        state.project.updatedAt = Date.now();
      });
    },

    applyProjectTheme: (theme, restyleWidgets = true) => {
      get().pushHistory(`Apply theme ${theme.name}`);
      set((state) => {
        if (!state.project) return;
        state.project.theme = JSON.parse(JSON.stringify(theme));
        const screen = getActiveScreen(state.project);
        screen.backgroundColor = theme.useGradient
          ? theme.gradientStart
          : theme.backgroundColor;
        screen.useGradientBg = theme.useGradient;
        screen.gradientEndColor = theme.gradientEnd;
        screen.gradientAngle = theme.gradientAngle;
        screen.isDarkPreview = theme.isDark;

        if (restyleWidgets) {
          screen.elements = applyThemeToElements(screen.elements, theme);
        }
        state.project.updatedAt = Date.now();
      });
    },

    setActiveScreen: (screenId) => {
      set((state) => {
        if (!state.project) return;
        if (state.project.screens.some((s) => s.id === screenId)) {
          state.project.activeScreenId = screenId;
          state.selectedIds = [];
          state.pendingGroupMoveIds = [];
        }
      });
    },

    addScreen: (name, duplicateCurrent = false) => {
      const current = get().project;
      if (!current) return null;
      get().pushHistory('Add new screen');

      const now = Date.now();
      const active = getActiveScreen(current);
      const activeTheme = current.theme ?? BUILT_IN_THEMES[0];
      const newScreenName =
        name?.trim() || `Screen${current.screens.length + 1}`;

      const newScreen: Screen = duplicateCurrent
        ? {
            ...JSON.parse(JSON.stringify(active)),
            id: `screen-${now}`,
            name: `${active.name}Copy`,
          }
        : {
            id: `screen-${now}`,
            name: newScreenName,
            backgroundColor: activeTheme.useGradient
              ? activeTheme.gradientStart
              : activeTheme.backgroundColor,
            useGradientBg: activeTheme.useGradient,
            gradientEndColor: activeTheme.gradientEnd,
            gradientAngle: activeTheme.gradientAngle,
            isDarkPreview: activeTheme.isDark,
            guides: [],
            elements: applyThemeToElements(
              [
                {
                  id: `el-top-${now}`,
                  type: 'TopAppBar',
                  name: `${newScreenName}TopBar`,
                  parentId: null,
                  x: 0,
                  y: 0,
                  width: current.widthDp,
                  height: 64,
                  zIndex: 1,
                  locked: false,
                  hidden: false,
                  props: {
                    text: newScreenName,
                    iconName: 'ArrowLeft',
                    backgroundColor: activeTheme.surfaceColor,
                    contentColor: activeTheme.textColor,
                  },
                },
              ],
              activeTheme
            ),
          };

      set((state) => {
        if (!state.project) return;
        state.project.screens.push(newScreen);
        state.project.activeScreenId = newScreen.id;
        state.selectedIds = [];
        state.project.updatedAt = Date.now();
      });

      return newScreen;
    },

    renameScreen: (screenId, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      get().pushHistory('Rename screen');
      set((state) => {
        if (!state.project) return;
        const scr = state.project.screens.find((s) => s.id === screenId);
        if (scr) {
          scr.name = trimmed;
          state.project.updatedAt = Date.now();
        }
      });
    },

    deleteScreen: (screenId) => {
      const current = get().project;
      if (!current || current.screens.length <= 1) return;
      get().pushHistory('Delete screen');

      set((state) => {
        if (!state.project || state.project.screens.length <= 1) return;
        state.project.screens = state.project.screens.filter(
          (s) => s.id !== screenId
        );
        if (state.project.activeScreenId === screenId) {
          state.project.activeScreenId = state.project.screens[0].id;
        }
        state.selectedIds = [];
        state.project.updatedAt = Date.now();
      });
    },

    selectElement: (id, additive = false) => {
      set((state) => {
        if (!id) {
          state.selectedIds = [];
          state.pendingGroupMoveIds = [];
          return;
        }
        // If user taps outside the pending group, clear pendingGroupMoveIds
        if (
          state.pendingGroupMoveIds.length > 0 &&
          !state.pendingGroupMoveIds.includes(id)
        ) {
          state.pendingGroupMoveIds = [];
        }
        const useMulti = additive || state.multiSelectMode;
        if (useMulti) {
          if (state.selectedIds.includes(id)) {
            state.selectedIds = state.selectedIds.filter((item) => item !== id);
          } else {
            state.selectedIds.push(id);
          }
        } else {
          // If clicking an element that belongs to a pending group move, keep the whole group selected for its first move
          if (state.pendingGroupMoveIds.includes(id)) {
            state.selectedIds = [...state.pendingGroupMoveIds];
          } else {
            state.selectedIds = [id];
          }
        }
      });
    },

    setSelectedIds: (ids) => set({ selectedIds: ids }),

    toggleMultiSelectMode: (enabled) =>
      set((state) => ({
        multiSelectMode: typeof enabled === 'boolean' ? enabled : !state.multiSelectMode,
      })),

    selectAll: () => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        state.selectedIds = screen.elements
          .filter((el) => !el.locked && !el.hidden)
          .map((el) => el.id);
      });
    },

    addWidget: (type, position) => {
      const current = get().project;
      if (!current) return null;
      get().pushHistory(`Add ${type}`);

      const def = getWidgetDefinition(type);
      const screen = getActiveScreen(current);
      const count = screen.elements.filter((e) => e.type === type).length + 1;
      const maxZ = screen.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);

      const width = Math.min(def.defaultWidth, current.widthDp);
      const defaultX =
        type === 'TopAppBar' || type === 'BottomNavigationBar' || type === 'TabRow'
          ? 0
          : Math.max(16, Math.round((current.widthDp - width) / 2));

      const lastElement = screen.elements[screen.elements.length - 1];
      const defaultY =
        type === 'TopAppBar'
          ? 0
          : type === 'BottomNavigationBar'
            ? current.heightDp - def.defaultHeight
            : lastElement
              ? Math.min(current.heightDp - def.defaultHeight - 24, lastElement.y + lastElement.height + 16)
              : 88;

      let initialElement: ComposeElement = {
        id: `el-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        type,
        name: `${def.label}${count}`,
        parentId: null,
        x: position ? Math.round(position.x) : defaultX,
        y: position ? Math.round(position.y) : defaultY,
        width:
          type === 'TopAppBar' || type === 'BottomNavigationBar' || type === 'TabRow'
            ? current.widthDp
            : width,
        height: def.defaultHeight,
        zIndex: maxZ + 1,
        locked: false,
        hidden: false,
        expanded: true,
        props: JSON.parse(JSON.stringify(def.defaultProps)),
      };

      if (current.theme) {
        initialElement = applyThemeToElements([initialElement], current.theme)[0];
      }

      set((state) => {
        if (!state.project) return;
        const active = getActiveScreen(state.project);
        active.elements.push(initialElement);
        state.selectedIds = [initialElement.id];
        state.pendingGroupMoveIds = [];
        state.project.updatedAt = Date.now();
      });

      return initialElement;
    },

    insertWidgetGroup: (group, colorMode) => {
      const current = get().project;
      if (!current) return [];
      get().pushHistory(`Insert group ${group.name}`);

      const screen = getActiveScreen(current);
      const maxZ = screen.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
      const now = Date.now();

      // Calculate group bounding box to center horizontally on canvas
      const groupMaxRight = Math.max(...group.elements.map((e) => e.x + e.width), 200);
      const offsetX =
        groupMaxRight >= current.widthDp
          ? 0
          : Math.max(16, Math.round((current.widthDp - groupMaxRight) / 2));
      const offsetY = 120;

      let instantiated: ComposeElement[] = group.elements.map((tmpl, idx) => ({
        ...JSON.parse(JSON.stringify(tmpl)),
        id: `el-grp-${now}-${idx}-${Math.random().toString(36).slice(2, 5)}`,
        parentId: null,
        x: Math.min(current.widthDp - 32, tmpl.x + offsetX),
        y: Math.min(current.heightDp - 48, tmpl.y + offsetY),
        width:
          tmpl.type === 'BottomNavigationBar' || tmpl.type === 'TopAppBar'
            ? current.widthDp
            : Math.min(current.widthDp - 24, tmpl.width),
        zIndex: maxZ + idx + 1,
      }));

      if (colorMode === 'theme' && current.theme) {
        instantiated = applyThemeToElements(instantiated, current.theme);
      }

      const newIds = instantiated.map((e) => e.id);

      set((state) => {
        if (!state.project) return;
        const active = getActiveScreen(state.project);
        active.elements.push(...instantiated);
        state.selectedIds = newIds;
        // Mark these IDs so the user can move the whole group together once, then auto-ungroup!
        state.pendingGroupMoveIds = newIds;
        state.project.updatedAt = Date.now();
      });

      return instantiated;
    },

    moveElementsByDelta: (ids, deltaX, deltaY) => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const idSet = new Set(ids);
        for (const el of screen.elements) {
          if (idSet.has(el.id) && !el.locked) {
            el.x = Math.round(el.x + deltaX);
            el.y = Math.round(el.y + deltaY);
          }
        }
        state.project.updatedAt = Date.now();
      });
    },

    completePendingGroupMove: () => {
      set((state) => {
        if (state.pendingGroupMoveIds.length > 0) {
          // Auto-ungroup after first collective placement so widgets are independent
          const firstId = state.pendingGroupMoveIds[0];
          state.pendingGroupMoveIds = [];
          state.selectedIds = firstId ? [firstId] : [];
          state.multiSelectMode = false;
        }
      });
    },

    createGroupTemplateFromSelection: (name, category = 'Custom') => {
      const { project, selectedIds } = get();
      if (!project || selectedIds.length === 0) return null;
      const screen = getActiveScreen(project);
      const selected = screen.elements.filter((el) => selectedIds.includes(el.id));
      if (selected.length === 0) return null;

      const minX = Math.min(...selected.map((e) => e.x));
      const minY = Math.min(...selected.map((e) => e.y));

      const normalized = selected.map((el) => {
        const clone: ComposeElement = JSON.parse(JSON.stringify(el));
        return {
          type: clone.type,
          name: clone.name,
          x: clone.x - minX,
          y: clone.y - minY,
          width: clone.width,
          height: clone.height,
          locked: false,
          hidden: false,
          props: clone.props,
        };
      });

      return {
        id: `custom-grp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        name: name.trim() || `Custom Group (${selected.length})`,
        description: `${selected.length} composables (${selected.map((s) => s.type).slice(0, 3).join(', ')})`,
        category,
        isBuiltIn: false,
        createdAt: Date.now(),
        elements: normalized,
      };
    },

    updateElementGeometry: (id, rect, recordHistory = false) => {
      if (recordHistory) {
        get().pushHistory('Transform widget');
      }
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const el = screen.elements.find((item) => item.id === id);
        if (!el || el.locked) return;

        if (typeof rect.x === 'number') el.x = Math.round(rect.x);
        if (typeof rect.y === 'number') el.y = Math.round(rect.y);
        if (typeof rect.width === 'number') el.width = Math.max(24, Math.round(rect.width));
        if (typeof rect.height === 'number') el.height = Math.max(16, Math.round(rect.height));
        state.project.updatedAt = Date.now();
      });
    },

    updateElementProps: (id, props, recordHistory = true) => {
      if (recordHistory) {
        get().pushHistory('Update widget properties');
      }
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const el = screen.elements.find((item) => item.id === id);
        if (!el) return;
        el.props = {
          ...el.props,
          ...props,
        };
        state.project.updatedAt = Date.now();
      });
    },

    renameElement: (id, name) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      get().pushHistory('Rename layer');
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const el = screen.elements.find((item) => item.id === id);
        if (el) {
          el.name = trimmed;
          state.project.updatedAt = Date.now();
        }
      });
    },

    toggleLockElement: (id) => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const el = screen.elements.find((item) => item.id === id);
        if (el) {
          el.locked = !el.locked;
          state.project.updatedAt = Date.now();
        }
      });
    },

    toggleHideElement: (id) => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const el = screen.elements.find((item) => item.id === id);
        if (el) {
          el.hidden = !el.hidden;
          state.project.updatedAt = Date.now();
        }
      });
    },

    reorderElement: (id, direction) => {
      get().pushHistory('Reorder layer');
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const idx = screen.elements.findIndex((e) => e.id === id);
        if (idx === -1) return;

        const [item] = screen.elements.splice(idx, 1);
        if (direction === 'up') {
          screen.elements.splice(Math.min(screen.elements.length, idx + 1), 0, item);
        } else if (direction === 'down') {
          screen.elements.splice(Math.max(0, idx - 1), 0, item);
        } else if (direction === 'top') {
          screen.elements.push(item);
        } else if (direction === 'bottom') {
          screen.elements.unshift(item);
        }

        screen.elements.forEach((el, i) => {
          el.zIndex = i + 1;
        });
        state.project.updatedAt = Date.now();
      });
    },

    nestElementInContainer: (childId, containerId) => {
      if (childId === containerId) return;
      get().pushHistory('Nest layer');
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const child = screen.elements.find((e) => e.id === childId);
        if (!child) return;
        child.parentId = containerId;
        state.project.updatedAt = Date.now();
      });
    },

    groupSelectedInBox: () => {
      const state = get();
      if (!state.project || state.selectedIds.length === 0) return;
      get().pushHistory('Group in Box');

      set((draft) => {
        if (!draft.project) return;
        const screen = getActiveScreen(draft.project);
        const selected = screen.elements.filter((el) => draft.selectedIds.includes(el.id));
        if (selected.length === 0) return;

        const minX = Math.min(...selected.map((e) => e.x));
        const minY = Math.min(...selected.map((e) => e.y));
        const maxX = Math.max(...selected.map((e) => e.x + e.width));
        const maxY = Math.max(...selected.map((e) => e.y + e.height));
        const maxZ = screen.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);

        const groupBoxId = `el-group-${Date.now()}`;
        const groupBox: ComposeElement = {
          id: groupBoxId,
          type: 'Box',
          name: `GroupBox_${selected.length}`,
          parentId: null,
          x: Math.max(0, minX - 8),
          y: Math.max(0, minY - 8),
          width: maxX - minX + 16,
          height: maxY - minY + 16,
          zIndex: maxZ + 1,
          locked: false,
          hidden: false,
          expanded: true,
          props: {
            backgroundColor: '#1E293B',
            borderColor: '#475569',
            borderWidth: 1,
            cornerRadius: 16,
            padding: 8,
          },
        };

        screen.elements.push(groupBox);
        selected.forEach((child) => {
          child.parentId = groupBoxId;
        });
        draft.selectedIds = [groupBoxId];
        draft.pendingGroupMoveIds = [];
        draft.project.updatedAt = Date.now();
      });
    },

    deleteSelected: () => {
      const { selectedIds, project } = get();
      if (!project || selectedIds.length === 0) return;
      get().pushHistory('Delete widget(s)');

      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const toDelete = new Set(state.selectedIds);
        screen.elements = screen.elements.filter(
          (el) => !toDelete.has(el.id) && (!el.parentId || !toDelete.has(el.parentId))
        );
        state.selectedIds = [];
        state.pendingGroupMoveIds = [];
        state.project.updatedAt = Date.now();
      });
    },

    copySelected: () => {
      const { project, selectedIds } = get();
      if (!project || selectedIds.length === 0) return;
      const screen = getActiveScreen(project);
      const copied = screen.elements
        .filter((el) => selectedIds.includes(el.id))
        .map((el) => JSON.parse(JSON.stringify(el)));
      set({ clipboard: copied });
    },

    pasteClipboard: () => {
      const { project, clipboard } = get();
      if (!project || clipboard.length === 0) return;
      get().pushHistory('Paste widget(s)');

      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const maxZ = screen.elements.reduce((m, e) => Math.max(m, e.zIndex), 0);
        const newIds: string[] = [];

        clipboard.forEach((item, index) => {
          const clone: ComposeElement = JSON.parse(JSON.stringify(item));
          clone.id = `el-${Date.now()}-${index}-${Math.random().toString(36).slice(2, 5)}`;
          clone.name = `${item.name}_Copy`;
          clone.x = Math.min(state.project!.widthDp - clone.width, item.x + 16);
          clone.y = Math.min(state.project!.heightDp - clone.height, item.y + 16);
          clone.zIndex = maxZ + index + 1;
          screen.elements.push(clone);
          newIds.push(clone.id);
        });

        state.selectedIds = newIds;
        state.pendingGroupMoveIds = newIds;
        state.project.updatedAt = Date.now();
      });
    },

    duplicateSelected: () => {
      get().copySelected();
      get().pasteClipboard();
    },

    alignSelected: (op) => {
      const { project, selectedIds } = get();
      if (!project || selectedIds.length === 0) return;
      get().pushHistory(`Align ${op}`);

      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.elements = alignElements(
          screen.elements,
          state.selectedIds,
          op,
          state.project.widthDp,
          state.project.heightDp
        );
        state.project.updatedAt = Date.now();
      });
    },

    distributeSelected: (op) => {
      const { project, selectedIds } = get();
      if (!project || selectedIds.length < 3) return;
      get().pushHistory(`Distribute ${op}`);

      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.elements = distributeElements(screen.elements, state.selectedIds, op);
        state.project.updatedAt = Date.now();
      });
    },

    runAutoLayout: () => {
      const { project } = get();
      if (!project) return;
      get().pushHistory('Auto-Layout to Column/Row');

      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.elements = applyAutoLayoutStructure(screen.elements, state.project.widthDp);
        state.project.layoutMode = 'grid';
        state.project.updatedAt = Date.now();
      });
    },

    addGuide: (axis, positionDp) => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        const guide: GuideLine = {
          id: `guide-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          axis,
          positionDp: Math.round(positionDp),
        };
        screen.guides.push(guide);
        state.project.updatedAt = Date.now();
      });
    },

    removeGuide: (id) => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.guides = screen.guides.filter((g) => g.id !== id);
        state.project.updatedAt = Date.now();
      });
    },

    clearGuides: () => {
      set((state) => {
        if (!state.project) return;
        const screen = getActiveScreen(state.project);
        screen.guides = [];
        state.project.updatedAt = Date.now();
      });
    },

    setViewport: (partial) => {
      set((state) => {
        if (typeof partial.zoom === 'number') {
          state.zoom = Math.max(0.3, Math.min(2.5, Number(partial.zoom.toFixed(2))));
        }
        if (typeof partial.panX === 'number') state.panX = Math.round(partial.panX);
        if (typeof partial.panY === 'number') state.panY = Math.round(partial.panY);
      });
    },

    resetViewport: () => {
      const current = get().project;
      const isNarrowViewport =
        typeof window !== 'undefined' && window.innerWidth < 640;
      const defaultZoom =
        current && current.widthDp > 500
          ? isNarrowViewport
            ? 0.46
            : 0.62
          : isNarrowViewport
            ? 0.64
            : 0.74;
      set({
        zoom: defaultZoom,
        panX: 0,
        panY: 0,
      });
    },

    toggleOverlay: (overlay) => {
      set((state) => {
        if (overlay === 'statusBar') state.showStatusBar = !state.showStatusBar;
        if (overlay === 'navBar') state.showNavBar = !state.showNavBar;
        if (overlay === 'safeArea') state.showSafeArea = !state.showSafeArea;
        if (overlay === 'rulers') state.showRulers = !state.showRulers;
      });
    },

    setActiveSnapLines: (lines) => set({ activeSnapLines: lines }),

    pushHistory: (label) => {
      const { project } = get();
      if (!project) return;
      const entry: HistoryEntry = {
        timestamp: Date.now(),
        label,
        screens: cloneScreens(project.screens),
        activeScreenId: project.activeScreenId,
        layoutMode: project.layoutMode,
      };
      set((state) => {
        state.historyPast = [...state.historyPast.slice(-39), entry];
        state.historyFuture = [];
      });
    },

    undo: () => {
      const { project, historyPast, historyFuture } = get();
      if (!project || historyPast.length === 0) return;

      const previous = historyPast[historyPast.length - 1];
      const currentSnapshot: HistoryEntry = {
        timestamp: Date.now(),
        label: 'Current',
        screens: cloneScreens(project.screens),
        activeScreenId: project.activeScreenId,
        layoutMode: project.layoutMode,
      };

      set((state) => {
        if (!state.project) return;
        state.historyPast = state.historyPast.slice(0, -1);
        state.historyFuture = [currentSnapshot, ...historyFuture.slice(0, 39)];
        state.project.screens = cloneScreens(previous.screens);
        state.project.activeScreenId = previous.activeScreenId;
        state.project.layoutMode = previous.layoutMode;
        state.project.updatedAt = Date.now();
      });
    },

    redo: () => {
      const { project, historyFuture } = get();
      if (!project || historyFuture.length === 0) return;

      const next = historyFuture[0];
      const currentSnapshot: HistoryEntry = {
        timestamp: Date.now(),
        label: 'Redo snapshot',
        screens: cloneScreens(project.screens),
        activeScreenId: project.activeScreenId,
        layoutMode: project.layoutMode,
      };

      set((state) => {
        if (!state.project) return;
        state.historyFuture = state.historyFuture.slice(1);
        state.historyPast = [...state.historyPast.slice(-39), currentSnapshot];
        state.project.screens = cloneScreens(next.screens);
        state.project.activeScreenId = next.activeScreenId;
        state.project.layoutMode = next.layoutMode;
        state.project.updatedAt = Date.now();
      });
    },
  }))
);
