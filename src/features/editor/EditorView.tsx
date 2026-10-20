import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Edit3,
  Eye,
  Grid,
  Layers,
  LayoutGrid,
  Palette,
  Plus,
  Redo2,
  Settings,
  Sliders,
  Smartphone,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store/editorStore';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore, type MobileSheetTab } from '../../store/uiStore';
import { CanvasWorkspace } from '../canvas/CanvasWorkspace';
import { PalettePanel } from '../palette/PalettePanel';
import { LayersPanel } from '../layers/LayersPanel';
import { InspectorPanel } from '../inspector/InspectorPanel';
import { renderWidgetTypeIcon } from '../../lib/icons/iconLibrary';
import type { WidgetType } from '../../types/models';

const QUICK_THUMB_WIDGETS: { type: WidgetType; label: string }[] = [
  { type: 'Text', label: 'Text' },
  { type: 'Button', label: 'Button' },
  { type: 'Card', label: 'Card' },
  { type: 'Icon', label: 'Icon' },
  { type: 'TextField', label: 'Input' },
  { type: 'Switch', label: 'Switch' },
  { type: 'BottomNavigationBar', label: 'BottomNav' },
  { type: 'FAB', label: 'FAB' },
];

export const EditorView: React.FC = () => {
  const { t } = useTranslation();
  const {
    project,
    selectedIds,
    historyPast,
    historyFuture,
    showStatusBar,
    showNavBar,
    showSafeArea,
    showRulers,
    setEditorMode,
    setLayoutMode,
    toggleOverlay,
    clearGuides,
    setActiveScreen,
    addScreen,
    renameScreen,
    deleteScreen,
    addWidget,
    undo,
    redo,
  } = useEditorStore();

  const { upsertProject, saveStatus } = useProjectStore();
  const {
    setActiveView,
    activeMobileSheet,
    setActiveMobileSheet,
    mobileEditorLayout,
    setMobileEditorLayout,
    setShowExportModal,
    setShowSettingsModal,
    setShowThemeStudioModal,
    autosaveIntervalMs,
    triggerHaptic,
    addToast,
  } = useUIStore();

  const [desktopLeftTab, setDesktopLeftTab] = useState<'palette' | 'layers'>('palette');
  const [renamingScreenId, setRenamingScreenId] = useState<string | null>(null);
  const [screenNameInput, setScreenNameInput] = useState('');

  // Debounced autosave whenever project changes in editorStore
  useEffect(() => {
    if (!project) return;
    const timer = window.setTimeout(() => {
      upsertProject(project);
    }, autosaveIntervalMs);
    return () => window.clearTimeout(timer);
  }, [project, autosaveIntervalMs, upsertProject]);

  if (!project) return null;

  const isPro = project.editorMode === 'pro';
  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) ?? project.screens[0];
  const isThumbCockpit = mobileEditorLayout === 'thumb-cockpit';

  const handleMobileTabToggle = (tab: MobileSheetTab) => {
    setActiveMobileSheet(activeMobileSheet === tab ? 'none' : tab);
  };

  const commitScreenRename = (screenId: string) => {
    if (screenNameInput.trim()) {
      renameScreen(screenId, screenNameInput.trim());
    }
    setRenamingScreenId(null);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Top Studio Header Bar */}
      <header className="h-14 px-2.5 sm:px-4 lg:px-5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-1.5 sm:gap-3 shrink-0 z-30">
        {/* Left: Back to Projects + Project Title + Saved Status */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => {
              upsertProject(project);
              setActiveView('home');
            }}
            aria-label="Back to Projects"
            className="min-w-[38px] min-h-[38px] rounded-xl bg-slate-800/80 hover:bg-slate-800 flex items-center justify-center text-slate-200 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                {project.name}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono shrink-0">
                <Check className="w-3 h-3 text-emerald-400" />
                {saveStatus === 'saving' ? t('app.saving') : t('app.saved')}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 truncate tabular-nums">
              {project.widthDp}×{project.heightDp}dp · {project.screens.length} screen(s) ·{' '}
              {project.theme?.name || project.materialVersion.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Center: Simple vs Pro Mode & Free vs Grid Layout Mode Toggles */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Simple / Pro Mode Switch */}
          <div
            role="group"
            aria-label="Editor Complexity Mode"
            className="flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800"
          >
            <button
              type="button"
              onClick={() => setEditorMode('simple')}
              className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                !isPro
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('editor.simpleMode')}
            </button>
            <button
              type="button"
              onClick={() => setEditorMode('pro')}
              className={`min-h-[32px] px-2 sm:px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                isPro
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('editor.proMode')}
            </button>
          </div>

          {/* Free / Grid Layout Mode Switch (visible on tablet/desktop) */}
          <div
            role="group"
            aria-label="Canvas Layout Mode"
            className="hidden md:flex items-center p-0.5 rounded-xl bg-slate-950 border border-slate-800"
          >
            <button
              type="button"
              onClick={() => setLayoutMode('free')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                project.layoutMode === 'free'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('editor.freeLayout')}
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('grid')}
              className={`min-h-[32px] px-2.5 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                project.layoutMode === 'grid'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('editor.gridLayout')}
            </button>
          </div>
        </div>

        {/* Right: Theme Studio, Undo, Redo, Settings, Export CTA */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setShowThemeStudioModal(true)}
            aria-label="Open Theme Studio"
            title="Studio Themes & Colors"
            className="min-w-[36px] min-h-[36px] px-2 rounded-xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/30 flex items-center justify-center gap-1.5 text-indigo-300 text-xs font-medium"
          >
            <Palette className="w-4 h-4" />
            <span className="hidden xl:inline">Theme</span>
          </button>

          <button
            type="button"
            onClick={undo}
            disabled={historyPast.length === 0}
            aria-label={t('editor.undo')}
            title={t('editor.undo')}
            className="min-w-[36px] min-h-[36px] rounded-xl bg-slate-800/70 hover:bg-slate-800 disabled:opacity-35 flex items-center justify-center text-slate-200"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={historyFuture.length === 0}
            aria-label={t('editor.redo')}
            title={t('editor.redo')}
            className="min-w-[36px] min-h-[36px] rounded-xl bg-slate-800/70 hover:bg-slate-800 disabled:opacity-35 flex items-center justify-center text-slate-200"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            aria-label={t('nav.settings')}
            className="hidden sm:flex min-w-[36px] min-h-[36px] rounded-xl bg-slate-800/70 hover:bg-slate-800 items-center justify-center text-slate-300"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setShowExportModal(true)}
            aria-label={t('nav.export')}
            className="min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
          >
            <Code2 className="w-4 h-4" />
            <span>{t('nav.export')}</span>
          </button>
        </div>
      </header>

      {/* Multi-Screen Navigation Bar (Add, Switch, Duplicate, Rename, Delete Screens) */}
      <div className="h-10 px-2.5 sm:px-4 bg-slate-900/70 border-b border-slate-800/90 flex items-center justify-between gap-2 shrink-0 z-20">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto no-scrollbar py-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mr-1 hidden sm:inline">
            Screens:
          </span>

          {project.screens.map((scr) => {
            const isCurrent = scr.id === activeScreen.id;
            const isRenaming = renamingScreenId === scr.id;

            return (
              <div
                key={scr.id}
                onClick={() => {
                  if (!isCurrent) {
                    setActiveScreen(scr.id);
                    triggerHaptic(8);
                  }
                }}
                className={`group h-7 px-2.5 rounded-lg border text-xs flex items-center gap-1.5 cursor-pointer transition-all shrink-0 ${
                  isCurrent
                    ? 'bg-indigo-600/25 border-indigo-500 text-white font-semibold'
                    : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isRenaming ? (
                  <input
                    type="text"
                    value={screenNameInput}
                    autoFocus
                    onChange={(e) => setScreenNameInput(e.target.value)}
                    onBlur={() => commitScreenRename(scr.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitScreenRename(scr.id);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-24 px-1 py-0.5 rounded bg-slate-950 border border-indigo-400 text-xs text-white focus:outline-none"
                  />
                ) : (
                  <>
                    <Smartphone className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate max-w-[110px]">{scr.name}</span>
                    <span className="text-[10px] font-mono opacity-60">
                      ({scr.elements.length})
                    </span>
                  </>
                )}

                {isCurrent && !isRenaming && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 ml-0.5"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setRenamingScreenId(scr.id);
                        setScreenNameInput(scr.name);
                      }}
                      title="Rename screen"
                      className="p-0.5 rounded hover:bg-slate-800 text-slate-300"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                    {project.screens.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          deleteScreen(scr.id);
                          addToast(`Deleted screen "${scr.name}"`, 'info');
                        }}
                        title="Delete screen"
                        className="p-0.5 rounded hover:bg-rose-500/20 text-rose-400"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="button"
            onClick={() => {
              const created = addScreen(undefined, false);
              if (created) {
                triggerHaptic(10);
                addToast(`Added screen "${created.name}"`, 'success');
              }
            }}
            className="h-7 px-2.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>New Screen</span>
          </button>

          <button
            type="button"
            onClick={() => {
              const dup = addScreen(`${activeScreen.name}Copy`, true);
              if (dup) {
                triggerHaptic(10);
                addToast(`Duplicated screen "${activeScreen.name}"`, 'success');
              }
            }}
            title="Duplicate current screen"
            className="h-7 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 text-[11px] font-medium flex items-center gap-1 shrink-0"
          >
            <Copy className="w-3 h-3" />
            <span className="hidden md:inline">Clone Screen</span>
          </button>
        </div>

        {/* Right on mobile: 1-tap toggle between Thumb Cockpit and Classic Sheets */}
        <div className="flex lg:hidden items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              const next =
                mobileEditorLayout === 'thumb-cockpit'
                  ? 'classic-sheets'
                  : 'thumb-cockpit';
              setMobileEditorLayout(next);
              triggerHaptic(10);
              addToast(
                next === 'thumb-cockpit'
                  ? 'Switched to One-Handed Thumb Cockpit'
                  : 'Switched to Classic Bottom Sheets',
                'info'
              );
            }}
            className="h-7 px-2 rounded-lg bg-slate-800/90 border border-slate-700 text-[10px] font-semibold text-indigo-300 whitespace-nowrap"
          >
            UI: {isThumbCockpit ? 'Thumb Cockpit' : 'Classic Sheets'}
          </button>
        </div>
      </div>

      {/* Main Responsive Workspace Area */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Desktop/Tablet Left Dock (Widgets + Groups + Layers) */}
        <aside className="hidden lg:flex w-80 border-r border-slate-800 bg-slate-900 flex-col shrink-0 z-20">
          <div className="grid grid-cols-2 p-2 gap-1 border-b border-slate-800 bg-slate-950/40">
            <button
              type="button"
              onClick={() => setDesktopLeftTab('palette')}
              className={`min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                desktopLeftTab === 'palette'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>{t('editor.palette')}</span>
            </button>
            <button
              type="button"
              onClick={() => setDesktopLeftTab('layers')}
              className={`min-h-[38px] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                desktopLeftTab === 'layers'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {t('editor.layers')} ({activeScreen.elements.length})
              </span>
            </button>
          </div>
          <div className="flex-1 min-h-0">
            {desktopLeftTab === 'palette' ? <PalettePanel /> : <LayersPanel />}
          </div>
        </aside>

        {/* Center Interactive Touch Canvas */}
        <main className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          <CanvasWorkspace />
        </main>

        {/* Desktop/Tablet Right Dock (Property Inspector) */}
        <aside className="hidden lg:flex w-80 border-l border-slate-800 bg-slate-900 flex-col shrink-0 z-20">
          <InspectorPanel />
        </aside>

        {/* Mobile Drawer (< 1024px) — adapts height & style to mobileEditorLayout */}
        {activeMobileSheet !== 'none' && (
          <div
            role="dialog"
            aria-label={`Studio ${activeMobileSheet} panel`}
            className={`lg:hidden fixed inset-x-0 z-40 flex flex-col bg-slate-900/98 backdrop-blur-xl border-t border-slate-700 shadow-[0_-20px_50px_rgba(0,0,0,0.75)] overflow-hidden ${
              isThumbCockpit
                ? 'bottom-28 mx-2 rounded-3xl border max-h-[48vh]'
                : 'bottom-16 rounded-t-3xl max-h-[64vh]'
            }`}
          >
            {/* Drag Handle & Close Header */}
            <div className="pt-2 pb-1.5 px-4 border-b border-slate-800 flex items-center justify-between bg-slate-900">
              <div className="w-10 h-1.5 bg-slate-700 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2" />
              <span className="text-xs font-bold text-indigo-300 mt-2">
                {activeMobileSheet === 'palette' && t('editor.palette')}
                {activeMobileSheet === 'layers' && t('editor.layers')}
                {activeMobileSheet === 'inspector' && t('editor.inspector')}
                {activeMobileSheet === 'overlays' && t('editor.overlays')}
              </span>
              <button
                type="button"
                onClick={() => setActiveMobileSheet('none')}
                aria-label="Close bottom sheet"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white mt-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-[240px]">
              {activeMobileSheet === 'palette' && (
                <PalettePanel onInserted={() => setActiveMobileSheet('none')} />
              )}
              {activeMobileSheet === 'layers' && <LayersPanel />}
              {activeMobileSheet === 'inspector' && <InspectorPanel />}
              {activeMobileSheet === 'overlays' && (
                <div className="p-4 space-y-4 text-xs">
                  {/* Mobile UI Layout Switcher right inside Overlays */}
                  <div className="space-y-1.5">
                    <div className="font-semibold text-slate-300">
                      Phone Display &amp; Control Layout
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setMobileEditorLayout('thumb-cockpit')}
                        className={`p-2.5 rounded-xl border text-left ${
                          isThumbCockpit
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div>Thumb Cockpit</div>
                        <div className="text-[10px] opacity-75">
                          Quick-add strip + split drawer
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMobileEditorLayout('classic-sheets')}
                        className={`p-2.5 rounded-xl border text-left ${
                          !isThumbCockpit
                            ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-semibold'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <div>Classic Sheets</div>
                        <div className="text-[10px] opacity-75">
                          Standard bottom bar + sheets
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setLayoutMode('free')}
                      className={`min-h-[42px] rounded-xl border font-semibold ${
                        project.layoutMode === 'free'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Free Position Mode
                    </button>
                    <button
                      type="button"
                      onClick={() => setLayoutMode('grid')}
                      className={`min-h-[42px] rounded-xl border font-semibold ${
                        project.layoutMode === 'grid'
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      Snap-to-Grid Mode
                    </button>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="font-semibold text-slate-300">
                      Device Frame Overlays
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleOverlay('statusBar')}
                        className={`min-h-[40px] px-3 rounded-xl border flex items-center justify-between ${
                          showStatusBar
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span>{t('editor.statusBar')}</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOverlay('navBar')}
                        className={`min-h-[40px] px-3 rounded-xl border flex items-center justify-between ${
                          showNavBar
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span>{t('editor.navBar')}</span>
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOverlay('safeArea')}
                        className={`min-h-[40px] px-3 rounded-xl border flex items-center justify-between ${
                          showSafeArea
                            ? 'border-amber-500/50 bg-amber-500/10 text-amber-200'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span>{t('editor.safeArea')}</span>
                        <Smartphone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOverlay('rulers')}
                        className={`min-h-[40px] px-3 rounded-xl border flex items-center justify-between ${
                          showRulers
                            ? 'border-indigo-500/50 bg-indigo-500/10 text-white'
                            : 'border-slate-800 bg-slate-950 text-slate-400'
                        }`}
                      >
                        <span>{t('editor.rulers')}</span>
                        <Grid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={clearGuides}
                      className="min-h-[40px] px-3 rounded-xl bg-slate-800 text-slate-300 font-medium"
                    >
                      {t('editor.clearGuides')}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMobileSheet('none');
                        setShowSettingsModal(true);
                      }}
                      className="min-h-[40px] px-3 rounded-xl bg-slate-800 text-indigo-300 font-medium flex items-center gap-1.5"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{t('nav.settings')}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MOBILE CONTROLS (< 1024px): Either "Ergonomic Thumb Cockpit" OR "Classic Bottom Sheets" */}
      {isThumbCockpit ? (
        <div
          aria-label="Mobile Thumb Cockpit Controls"
          className="lg:hidden px-2.5 pb-2 pt-1.5 bg-slate-950/95 border-t border-slate-800/80 space-y-1.5 shrink-0 z-40"
        >
          {/* 1-Tap Quick-Insert Widget Strip for Single-Thumb Speed */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <span className="text-[10px] font-mono text-indigo-400 uppercase px-1.5 shrink-0">
              +Quick:
            </span>
            {QUICK_THUMB_WIDGETS.map((qw) => (
              <button
                key={qw.type}
                type="button"
                onClick={() => {
                  addWidget(qw.type);
                  triggerHaptic(10);
                  addToast(`Added ${qw.label}`, 'success');
                }}
                className="h-8 px-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-[11px] font-medium flex items-center gap-1.5 shrink-0 active:scale-95 transition-transform"
              >
                <span className="text-indigo-400">
                  {renderWidgetTypeIcon(qw.type, 'w-3.5 h-3.5')}
                </span>
                <span>{qw.label}</span>
              </button>
            ))}
          </div>

          {/* Floating Ergonomic Pill Dock */}
          <nav
            aria-label="Mobile Studio Controls"
            className="h-14 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-xl grid grid-cols-5 items-center px-1"
          >
            <button
              type="button"
              onClick={() => handleMobileTabToggle('palette')}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 ${
                activeMobileSheet === 'palette'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Widgets</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileTabToggle('layers')}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 ${
                activeMobileSheet === 'layers'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span className="text-[10px] font-semibold">
                Layers ({activeScreen.elements.length})
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileTabToggle('inspector')}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 relative ${
                activeMobileSheet === 'inspector'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Props</span>
              {selectedIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-bold flex items-center justify-center absolute top-1 right-2">
                  {selectedIds.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowThemeStudioModal(true)}
              className="h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 text-indigo-300"
            >
              <Palette className="w-4 h-4" />
              <span className="text-[10px] font-semibold">Themes</span>
            </button>

            <button
              type="button"
              onClick={() => handleMobileTabToggle('overlays')}
              className={`h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 ${
                activeMobileSheet === 'overlays'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-300'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span className="text-[10px] font-semibold">View</span>
            </button>
          </nav>
        </div>
      ) : (
        /* Classic Full-Width Bottom Sheet Bar */
        <nav
          aria-label="Mobile Studio Controls"
          className="lg:hidden h-16 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 grid grid-cols-4 items-center shrink-0 z-40"
        >
          <button
            type="button"
            onClick={() => handleMobileTabToggle('palette')}
            className={`h-full flex flex-col items-center justify-center gap-1 ${
              activeMobileSheet === 'palette' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('editor.palette')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileTabToggle('layers')}
            className={`h-full flex flex-col items-center justify-center gap-1 ${
              activeMobileSheet === 'layers' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('editor.layers')}</span>
          </button>

          <button
            type="button"
            onClick={() => handleMobileTabToggle('inspector')}
            className={`h-full flex flex-col items-center justify-center gap-1 relative ${
              activeMobileSheet === 'inspector' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('editor.inspector')}</span>
            {selectedIds.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-mono flex items-center justify-center absolute top-1.5 right-6">
                {selectedIds.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleMobileTabToggle('overlays')}
            className={`h-full flex flex-col items-center justify-center gap-1 ${
              activeMobileSheet === 'overlays' ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <Smartphone className="w-5 h-5" />
            <span className="text-[10px] font-medium">{t('editor.overlays')}</span>
          </button>
        </nav>
      )}
    </div>
  );
};
