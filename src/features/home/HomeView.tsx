import React, { useMemo, useRef, useState } from 'react';
import {
  Copy,
  Download,
  Edit3,
  FolderOpen,
  LayoutGrid,
  List,
  Palette,
  Pin,
  Plus,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Tablet,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  useProjectStore,
  type ProjectFilterCategory,
  type ProjectSortBy,
} from '../../store/projectStore';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { DEVICE_PRESETS } from '../../lib/palette/widgetCatalog';
import { BUILT_IN_THEMES } from '../../lib/palette/themeAndGroupCatalog';
import { parseProjectFromJson, serializeProjectToJson } from '../../lib/persistence/db';
import type {
  Project,
  ProjectFontFamily,
  ProjectTheme,
} from '../../types/models';

const FONT_FAMILIES: ProjectFontFamily[] = [
  'Plus Jakarta Sans',
  'System Sans',
  'Geometric Rounded',
  'JetBrains Mono',
  'Editorial Serif',
];

export const HomeView: React.FC = () => {
  const { t } = useTranslation();
  const {
    projects,
    searchQuery,
    sortBy,
    filterCategory,
    viewLayout,
    setSearchQuery,
    setSortBy,
    setFilterCategory,
    setViewLayout,
    createProject,
    duplicateProject,
    renameProject,
    togglePinProject,
    deleteProject,
    importProjectObject,
  } = useProjectStore();

  const { loadProject } = useEditorStore();
  const {
    setActiveView,
    onboardingDismissed,
    dismissOnboarding,
    showNewProjectModal,
    setShowNewProjectModal,
    setShowSettingsModal,
    setShowThemeStudioModal,
    customThemes,
    getAllThemes,
    saveCustomTheme,
    defaultGridSizeDp,
    defaultGutterDp,
    addToast,
  } = useUIStore();

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allThemes = useMemo(() => getAllThemes(), [customThemes]);

  // New project modal state
  const [newProjName, setNewProjName] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState('pixel-8-pro');
  const [customWidthDp, setCustomWidthDp] = useState(412);
  const [customHeightDp, setCustomHeightDp] = useState(892);
  const [initialScreensText, setInitialScreensText] = useState('HomeScreen, DetailsScreen');
  const [draftTheme, setDraftTheme] = useState<ProjectTheme>(() => BUILT_IN_THEMES[0]);
  const [showAdvancedThemeSetup, setShowAdvancedThemeSetup] = useState(false);

  // Rename & Delete dialog states
  const [renamingProject, setRenamingProject] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);

  const filteredProjects = useMemo(() => {
    const list = projects.filter((p) => {
      if (filterCategory === 'pinned' && !p.pinned) return false;
      if (filterCategory === 'phone' && p.widthDp >= 600) return false;
      if (filterCategory === 'tablet' && p.widthDp < 600) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          (p.description ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });

    return list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'createdAt') return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });
  }, [projects, filterCategory, searchQuery, sortBy]);

  const handleOpenProject = (project: Project) => {
    loadProject(project);
    setActiveView('editor');
  };

  const handleCreateNewProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedScreens = initialScreensText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const created = await createProject({
      name: newProjName.trim() || 'Compose Android Screen',
      devicePresetId: selectedPresetId,
      widthDp: customWidthDp,
      heightDp: customHeightDp,
      theme: draftTheme,
      initialScreenNames: parsedScreens.length > 0 ? parsedScreens : ['HomeScreen'],
      defaultGridSizeDp,
      defaultGutterDp,
    });
    setNewProjName('');
    setShowNewProjectModal(false);
    loadProject(created);
    setActiveView('editor');
    addToast(
      `Created "${created.name}" (${created.screens.length} screens · ${draftTheme.name})`,
      'success'
    );
  };

  const handleExportProjectJson = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    const json = serializeProjectToJson(project);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '-')}.composestudio.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Exported ${project.name}.json`, 'success');
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = parseProjectFromJson(text);
      const saved = await importProjectObject(parsed);
      addToast(`Imported "${saved.name}"`, 'success');
    } catch {
      addToast('Invalid .json project file', 'error');
    } finally {
      e.target.value = '';
    }
  };

  const formatTimestamp = (ms: number) => {
    const diffMins = Math.round((Date.now() - ms) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.round(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return new Date(ms).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar Contract: Zone 1 (Single Brand Title) — Zone 2 (4 Nav Links) — Zone 3 (1 Primary Action) */}
      <header className="flex items-center justify-between gap-8 px-4 sm:px-8 py-4 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#projects"
          onClick={(e) => {
            e.preventDefault();
            setFilterCategory('all');
          }}
          className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          ComposeStudio
        </a>

        {/* Zone 2: 4 concise single-line text navigation links */}
        <nav
          aria-label="Primary Workspace Navigation"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400"
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              setFilterCategory('all');
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.projects')}
          </a>
          <a
            href="#open-editor"
            onClick={(e) => {
              e.preventDefault();
              if (projects[0]) handleOpenProject(projects[0]);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.editor')}
          </a>
          <a
            href="#themes"
            onClick={(e) => {
              e.preventDefault();
              setShowThemeStudioModal(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            Themes
          </a>
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              setShowSettingsModal(true);
            }}
            className="hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.settings')}
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => setShowNewProjectModal(true)}
            className="min-h-[42px] px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-500 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{t('nav.newProject')}</span>
          </button>
        </div>
      </header>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportJsonFile}
        className="hidden"
      />

      {/* Main Content Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Hero & Studio Overview */}
        <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-800/80 pb-8">
          <div className="space-y-3 max-w-2xl">
            <div className="text-xs font-medium text-indigo-400">
              Jetpack Compose Visual Studio · Multi-Screen · Themes &amp; Groups · Offline PWA
            </div>
            <h1
              style={{ textWrap: 'balance' }}
              className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight"
            >
              {t('home.heroTitle')}
            </h1>
            <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Secondary Utility Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setShowThemeStudioModal(true)}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/35 text-xs font-semibold text-indigo-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Palette className="w-4 h-4 text-indigo-400" />
              <span>Theme Studio ({allThemes.length})</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4 text-indigo-400" />
              <span>{t('home.importJson')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              aria-label={t('nav.settings')}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>{t('nav.settings')}</span>
            </button>
          </div>
        </section>

        {/* First-Open Onboarding Quick Start Card */}
        {!onboardingDismissed && (
          <section
            aria-label={t('home.onboardingTitle')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300">
                <Sparkles className="w-4 h-4" />
                <span>{t('home.onboardingTitle')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
                <div>
                  <strong className="text-white block mb-0.5">01. Touch Canvas &amp; Groups</strong>
                  {t('home.onboardingStep1')}
                </div>
                <div>
                  <strong className="text-white block mb-0.5">02. Themes, Gradients &amp; Glass</strong>
                  {t('home.onboardingStep2')}
                </div>
                <div>
                  <strong className="text-white block mb-0.5">03. Multi-Screen Kotlin Export</strong>
                  {t('home.onboardingStep3')}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={dismissOnboarding}
              className="min-h-[40px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 shrink-0"
            >
              {t('home.dismissHint')}
            </button>
          </section>
        )}

        {/* Filter, Search, Sort & Layout Controls */}
        <section
          id="projects"
          className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4"
        >
          {/* Interactive Category Filter Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
            {(
              [
                { id: 'all', label: t('home.filterAll') },
                { id: 'pinned', label: t('home.filterPinned') },
                { id: 'phone', label: t('home.filterPhone') },
                { id: 'tablet', label: t('home.filterTablet') },
              ] as { id: ProjectFilterCategory; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterCategory(tab.id)}
                className={`min-h-[38px] px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  filterCategory === tab.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search, Sort & Grid/List View */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('home.searchPlaceholder')}
                aria-label={t('home.searchPlaceholder')}
                className="w-full min-h-[42px] pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <select
              aria-label="Sort projects by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ProjectSortBy)}
              className="min-h-[42px] px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="updatedAt">{t('home.sortUpdated')}</option>
              <option value="name">{t('home.sortName')}</option>
              <option value="createdAt">{t('home.sortCreated')}</option>
            </select>

            <div className="flex items-center p-1 bg-slate-900 border border-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setViewLayout('grid')}
                aria-label="Grid View"
                className={`w-9 h-8 rounded-lg flex items-center justify-center ${
                  viewLayout === 'grid'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewLayout('list')}
                aria-label="List View"
                className={`w-9 h-8 rounded-lg flex items-center justify-center ${
                  viewLayout === 'list'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Project Cards Grid / List */}
        {filteredProjects.length === 0 ? (
          <section className="py-16 px-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FolderOpen className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h2 className="text-base font-bold text-white">{t('home.emptyTitle')}</h2>
              <p className="text-xs text-slate-400 leading-relaxed">{t('home.emptyDesc')}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowNewProjectModal(true)}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{t('home.createFirst')}</span>
            </button>
          </section>
        ) : (
          <section
            className={
              viewLayout === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-3'
            }
          >
            {filteredProjects.map((proj) => {
              const screen = proj.screens[0];
              const elements = screen?.elements ?? [];
              const isTablet = proj.widthDp >= 600;

              return (
                <article
                  key={proj.id}
                  onClick={() => handleOpenProject(proj)}
                  className={`group rounded-2xl bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/60 transition-all cursor-pointer overflow-hidden flex ${
                    viewLayout === 'grid'
                      ? 'flex-col justify-between'
                      : 'flex-col sm:flex-row sm:items-center justify-between p-4 gap-4'
                  }`}
                >
                  {/* Live Miniature Device Wireframe Preview (Grid Mode) */}
                  {viewLayout === 'grid' && (
                    <div className="h-48 bg-slate-950/90 border-b border-slate-800/80 p-4 flex items-center justify-center relative overflow-hidden">
                      <div
                        style={{
                          width: isTablet ? '180px' : '110px',
                          height: '156px',
                          backgroundColor: screen?.backgroundColor || '#0F172A',
                          backgroundImage:
                            screen?.useGradientBg && screen?.gradientEndColor
                              ? `linear-gradient(${screen.gradientAngle ?? 145}deg, ${screen.backgroundColor}, ${screen.gradientEndColor})`
                              : undefined,
                        }}
                        className="rounded-xl border-2 border-slate-700 shadow-lg relative overflow-hidden p-1.5 flex flex-col gap-1"
                      >
                        {elements.slice(0, 6).map((el) => (
                          <div
                            key={el.id}
                            style={{
                              backgroundColor:
                                el.props.backgroundColor &&
                                el.props.backgroundColor !== 'transparent'
                                  ? el.props.backgroundColor
                                  : '#334155',
                              height: `${Math.max(8, Math.min(28, Math.round(el.height / 5)))}px`,
                            }}
                            className="w-full rounded opacity-85 px-1.5 flex items-center overflow-hidden"
                          >
                            <span className="text-[7px] text-white truncate font-medium">
                              {el.props.text || el.type}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Pin Action Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinProject(proj.id);
                        }}
                        aria-label={proj.pinned ? `Unpin ${proj.name}` : `Pin ${proj.name}`}
                        className={`absolute top-3 right-3 min-w-[38px] min-h-[38px] rounded-xl flex items-center justify-center transition-colors ${
                          proj.pinned
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* Card Body & Unboxed Metadata (Zero-Pill Discipline) */}
                  <div
                    className={
                      viewLayout === 'grid'
                        ? 'p-5 space-y-3 flex-1 flex flex-col justify-between'
                        : 'flex-1 min-w-0 space-y-1'
                    }
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {proj.name}
                        </h2>
                        {isTablet ? (
                          <Tablet className="w-4 h-4 text-slate-400 shrink-0" />
                        ) : (
                          <Smartphone className="w-4 h-4 text-slate-400 shrink-0" />
                        )}
                      </div>

                      {proj.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {proj.description}
                        </p>
                      )}

                      {/* Unboxed Metadata with Typographic Separators */}
                      <div className="flex flex-wrap items-center gap-1.5 text-xs text-slate-400 font-mono pt-1 tabular-nums">
                        <span>
                          {proj.widthDp}×{proj.heightDp}dp
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{proj.screens.length} screens</span>
                        <span aria-hidden="true">·</span>
                        <span>{elements.length} widgets</span>
                        <span aria-hidden="true">·</span>
                        <span>{formatTimestamp(proj.updatedAt)}</span>
                      </div>
                    </div>

                    {/* Card Action Bar */}
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1"
                    >
                      <button
                        type="button"
                        onClick={() => handleOpenProject(proj)}
                        className="min-h-[38px] px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-semibold transition-colors"
                      >
                        {t('home.openEditor')}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleExportProjectJson(proj, e)}
                          aria-label={`Export ${proj.name} as JSON`}
                          title={t('home.exportJson')}
                          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={async () => {
                            const copy = await duplicateProject(proj.id);
                            if (copy) addToast(`Duplicated "${copy.name}"`, 'success');
                          }}
                          aria-label={`Duplicate ${proj.name}`}
                          title={t('home.duplicate')}
                          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRenamingProject(proj);
                            setRenameValue(proj.name);
                          }}
                          aria-label={`Rename ${proj.name}`}
                          title={t('home.rename')}
                          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProject(proj)}
                          aria-label={`Delete ${proj.name}`}
                          title={t('home.delete')}
                          className="min-w-[36px] min-h-[36px] rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      {/* Upgraded New Project Modal with Full Theme, Gradients, Glassmorphism, Fonts & Multi-Screen Setup */}
      {showNewProjectModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Create New Project"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
        >
          <form
            onSubmit={handleCreateNewProject}
            className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 p-5 sm:p-6 shadow-2xl space-y-5 text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">{t('nav.newProject')}</h2>
                <p className="text-xs text-slate-400">
                  Configure device dimensions, initial screens, color theme, gradient, typography &amp; glass effects
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                aria-label="Close New Project Modal"
                className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Project Name & Initial Screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Project Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newProjName}
                  onChange={(e) => setNewProjName(e.target.value)}
                  placeholder="e.g. NeoBank Glass App"
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Initial Screens (comma-separated)
                </label>
                <input
                  type="text"
                  value={initialScreensText}
                  onChange={(e) => setInitialScreensText(e.target.value)}
                  placeholder="HomeScreen, DetailsScreen, ProfileScreen"
                  className="w-full min-h-[42px] px-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Device Presets & Custom dp */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 block">
                Android Device Preset &amp; Dimensions (dp)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DEVICE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      setSelectedPresetId(preset.id);
                      setCustomWidthDp(preset.widthDp);
                      setCustomHeightDp(preset.heightDp);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-colors ${
                      selectedPresetId === preset.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold truncate">{preset.name}</div>
                    <div className="text-[10px] font-mono opacity-75 mt-0.5">
                      {preset.widthDp}×{preset.heightDp} dp
                    </div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Width (dp)
                  </label>
                  <input
                    type="number"
                    min={280}
                    max={1600}
                    value={customWidthDp}
                    onChange={(e) => setCustomWidthDp(Number(e.target.value))}
                    className="w-full min-h-[38px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">
                    Height (dp)
                  </label>
                  <input
                    type="number"
                    min={400}
                    max={2400}
                    value={customHeightDp}
                    onChange={(e) => setCustomHeightDp(Number(e.target.value))}
                    className="w-full min-h-[38px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Project Color Theme, Gradient, Typography & Glassmorphism */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-indigo-400" />
                  <span>Project Color Theme &amp; Visual Style</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowAdvancedThemeSetup(!showAdvancedThemeSetup)}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
                >
                  {showAdvancedThemeSetup
                    ? 'Hide Fine Color & Glass Controls'
                    : 'Customize Colors, Gradient, Font & Glass →'}
                </button>
              </div>

              {/* Theme Preset Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {allThemes.map((th) => {
                  const active = draftTheme.id === th.id;
                  return (
                    <button
                      key={th.id}
                      type="button"
                      onClick={() => setDraftTheme({ ...th })}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between gap-2 ${
                        active
                          ? 'bg-indigo-600/20 border-indigo-500 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold truncate">{th.name}</div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {th.fontFamily} ·{' '}
                          {th.glassBlurPx > 0
                            ? `Glass ${th.glassBlurPx}px`
                            : 'Lightweight'}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.primaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.secondaryColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.accentColor }}
                        />
                        <span
                          className="w-4 h-4 rounded-full border border-white/20"
                          style={{ backgroundColor: th.backgroundColor }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Expandable Fine Customization for All Colors, Gradients, Fonts & Glass */}
              {showAdvancedThemeSetup && (
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(
                      [
                        { key: 'primaryColor', label: 'Primary' },
                        { key: 'secondaryColor', label: 'Secondary' },
                        { key: 'accentColor', label: 'Accent' },
                        { key: 'backgroundColor', label: 'Background' },
                        { key: 'surfaceColor', label: 'Surface' },
                        { key: 'textColor', label: 'Text' },
                      ] as const
                    ).map((c) => (
                      <div key={c.key} className="flex flex-col items-center gap-1">
                        <input
                          type="color"
                          value={draftTheme[c.key]}
                          onChange={(e) =>
                            setDraftTheme({
                              ...draftTheme,
                              id: `theme-custom-${Date.now()}`,
                              isBuiltIn: false,
                              [c.key]: e.target.value,
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer bg-transparent"
                        />
                        <span className="text-[10px] text-slate-300">{c.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Typography Font
                      </label>
                      <select
                        value={draftTheme.fontFamily}
                        onChange={(e) =>
                          setDraftTheme({
                            ...draftTheme,
                            fontFamily: e.target.value as ProjectFontFamily,
                          })
                        }
                        className="w-full h-9 px-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                      >
                        {FONT_FAMILIES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="flex items-center justify-between text-[11px] text-slate-300 mb-1 cursor-pointer">
                        <span>Linear Gradient</span>
                        <input
                          type="checkbox"
                          checked={draftTheme.useGradient}
                          onChange={(e) =>
                            setDraftTheme({
                              ...draftTheme,
                              useGradient: e.target.checked,
                            })
                          }
                          className="rounded border-slate-700 text-indigo-600"
                        />
                      </label>
                      {draftTheme.useGradient && (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="color"
                            value={draftTheme.gradientStart}
                            onChange={(e) =>
                              setDraftTheme({
                                ...draftTheme,
                                gradientStart: e.target.value,
                              })
                            }
                            className="flex-1 h-7 rounded cursor-pointer bg-transparent"
                          />
                          <input
                            type="color"
                            value={draftTheme.gradientEnd}
                            onChange={(e) =>
                              setDraftTheme({
                                ...draftTheme,
                                gradientEnd: e.target.value,
                              })
                            }
                            className="flex-1 h-7 rounded cursor-pointer bg-transparent"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-300 mb-1">
                        <span>Glass Blur</span>
                        <span className="font-mono text-[10px] text-indigo-300">
                          {draftTheme.glassBlurPx > 0
                            ? `${draftTheme.glassBlurPx}px`
                            : 'Off (Lightweight)'}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={24}
                        step={2}
                        value={draftTheme.glassBlurPx}
                        onChange={(e) =>
                          setDraftTheme({
                            ...draftTheme,
                            glassBlurPx: Number(e.target.value),
                          })
                        }
                        className="w-full accent-indigo-500 mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        const saved: ProjectTheme = {
                          ...draftTheme,
                          id: `theme-custom-${Date.now()}`,
                          name: `${newProjName.trim() || 'Custom'} Theme`,
                          isBuiltIn: false,
                        };
                        saveCustomTheme(saved);
                        setDraftTheme(saved);
                        addToast(`Saved "${saved.name}" for reuse across projects!`, 'success');
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600/25 hover:bg-indigo-600/35 border border-indigo-500/40 text-indigo-200 text-xs font-semibold"
                    >
                      + Save as Reusable Studio Theme
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowNewProjectModal(false)}
                className="flex-1 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
              >
                Launch Studio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Rename Project Modal */}
      {renamingProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Rename Project"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">Rename Project</h3>
            <input
              type="text"
              autoFocus
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setRenamingProject(null)}
                className="flex-1 min-h-[40px] rounded-xl bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await renameProject(renamingProject.id, renameValue);
                  setRenamingProject(null);
                  addToast('Project renamed', 'success');
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Project Confirmation Modal */}
      {deletingProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Delete Project"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-4">
            <h3 className="text-sm font-bold text-white">
              Delete &ldquo;{deletingProject.name}&rdquo;?
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              This will permanently remove the project and its screens from IndexedDB storage.
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDeletingProject(null)}
                className="flex-1 min-h-[40px] rounded-xl bg-slate-800 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteProject(deletingProject.id);
                  setDeletingProject(null);
                  addToast('Project deleted', 'info');
                }}
                className="flex-1 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
