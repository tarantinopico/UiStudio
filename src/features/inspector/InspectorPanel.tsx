import React, { useMemo, useState } from 'react';
import {
  BookmarkPlus,
  Copy,
  Palette,
  Search,
  Sliders,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import {
  VECTOR_ICON_LIBRARY,
  renderVectorIcon,
  renderWidgetTypeIcon,
  type IconCategory,
} from '../../lib/icons/iconLibrary';
import type {
  FontWeightOption,
  HorizontalAlignment,
  ProjectFontFamily,
} from '../../types/models';

const M3_COLOR_SWATCHES = [
  '#6366F1', // Indigo Primary
  '#312E81', // Indigo Container
  '#0EA5E9', // Sky Accent
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Rose Error
  '#EC4899', // Pink
  '#1E293B', // Slate Surface
  '#0F172A', // Deep Slate
  '#FFFFFF', // Pure White
];

const ICON_CATEGORIES: { id: 'all' | IconCategory; label: string }[] = [
  { id: 'all', label: 'All (56)' },
  { id: 'navigation', label: 'Nav' },
  { id: 'actions', label: 'Actions' },
  { id: 'commerce', label: 'Finance' },
  { id: 'media', label: 'Media' },
  { id: 'communication', label: 'Social' },
  { id: 'device', label: 'Tech' },
  { id: 'status', label: 'Status' },
];

const FONT_FAMILIES: ProjectFontFamily[] = [
  'Plus Jakarta Sans',
  'System Sans',
  'Geometric Rounded',
  'JetBrains Mono',
  'Editorial Serif',
];

export const InspectorPanel: React.FC = () => {
  const { t } = useTranslation();
  const {
    project,
    selectedIds,
    updateElementGeometry,
    updateElementProps,
    renameElement,
    duplicateSelected,
    deleteSelected,
    setScreenBackground,
    setMaterialVersion,
    updateGridSettings,
    runAutoLayout,
    applyProjectTheme,
    createGroupTemplateFromSelection,
  } = useEditorStore();

  const {
    addToast,
    triggerHaptic,
    customThemes,
    getAllThemes,
    saveCustomWidgetGroup,
    setShowThemeStudioModal,
  } = useUIStore();

  const [iconSearch, setIconSearch] = useState('');
  const [iconCat, setIconCat] = useState<'all' | IconCategory>('all');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [multiGroupName, setMultiGroupName] = useState('');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allThemes = useMemo(() => getAllThemes(), [customThemes]);

  const filteredIcons = useMemo(() => {
    return VECTOR_ICON_LIBRARY.filter((ic) => {
      if (iconCat !== 'all' && ic.category !== iconCat) return false;
      if (iconSearch.trim()) {
        const q = iconSearch.toLowerCase();
        return (
          ic.name.toLowerCase().includes(q) ||
          ic.label.toLowerCase().includes(q) ||
          ic.composeName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [iconCat, iconSearch]);

  if (!project) return null;

  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) ?? project.screens[0];
  const isPro = project.editorMode === 'pro';

  const selectedElement =
    selectedIds.length === 1
      ? activeScreen.elements.find((e) => e.id === selectedIds[0]) ?? null
      : null;

  const handleSaveSelectedAsGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const name =
      multiGroupName.trim() || `Saved Group (${selectedIds.length} widgets)`;
    const tpl = createGroupTemplateFromSelection(name, 'Custom');
    if (tpl) {
      saveCustomWidgetGroup(tpl);
      setMultiGroupName('');
      triggerHaptic(12);
      addToast(`Saved "${tpl.name}" to Widget Groups!`, 'success');
    }
  };

  // When nothing (or multiple widgets) is selected, show Screen & Theme Inspector
  if (!selectedElement) {
    return (
      <div className="flex flex-col h-full bg-slate-900 text-slate-100 p-4 space-y-5 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-semibold text-slate-200">
              Screen &amp; Studio Theme
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setShowThemeStudioModal(true)}
            className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-[11px] font-semibold text-indigo-200 flex items-center gap-1"
          >
            <Palette className="w-3 h-3" />
            <span>Theme Studio</span>
          </button>
        </div>

        {selectedIds.length > 1 ? (
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 space-y-3">
            <div className="text-xs font-semibold text-indigo-200">
              {selectedIds.length} Widgets Multi-Selected
            </div>
            <p className="text-xs text-slate-400">
              Drag any selected widget on the canvas to move all {selectedIds.length} together, or save them as a reusable Widget Group.
            </p>

            {/* Save Multi-Selection as Reusable Group */}
            <form onSubmit={handleSaveSelectedAsGroup} className="space-y-2 pt-1">
              <input
                type="text"
                value={multiGroupName}
                onChange={(e) => setMultiGroupName(e.target.value)}
                placeholder="Name this widget group..."
                className="w-full min-h-[38px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <button
                type="submit"
                className="w-full min-h-[38px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save as Reusable Widget Group</span>
              </button>
            </form>

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={duplicateSelected}
                className="flex-1 min-h-[38px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Duplicate All</span>
              </button>
              <button
                type="button"
                onClick={deleteSelected}
                className="flex-1 min-h-[38px] rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 leading-relaxed">
            {t('editor.noSelection')}
          </p>
        )}

        {/* Active Project Theme Quick Switcher */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-300">
              Apply Studio Theme ({allThemes.length})
            </label>
            <button
              type="button"
              onClick={() => setShowThemeStudioModal(true)}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
            >
              + Create / Edit Themes
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto pr-1">
            {allThemes.map((th) => {
              const isCurrent = project.theme?.id === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    applyProjectTheme(th, true);
                    triggerHaptic(10);
                    addToast(`Applied theme "${th.name}"`, 'success');
                  }}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-2 transition-all ${
                    isCurrent
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold truncate">{th.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {th.fontFamily} · {th.useGradient ? 'Gradient' : 'Solid'} ·{' '}
                      {th.glassBlurPx > 0 ? `Glass ${th.glassBlurPx}px` : 'Lightweight'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className="w-4 h-4 rounded-full border border-white/20"
                      style={{ backgroundColor: th.primaryColor }}
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
        </div>

        {/* Material Design Version Toggle (M3 vs M2) */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <label className="text-xs font-medium text-slate-300 block">
            Design System Preview
          </label>
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setMaterialVersion('m3')}
              className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors ${
                project.materialVersion === 'm3'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Material 3 (You)
            </button>
            <button
              type="button"
              onClick={() => setMaterialVersion('m2')}
              className={`min-h-[38px] rounded-lg text-xs font-medium transition-colors ${
                project.materialVersion === 'm2'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Material 2 Classic
            </button>
          </div>
        </div>

        {/* Screen Canvas Surface Color & Gradient */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <label className="text-xs font-medium text-slate-300 block">
            Screen Background ({activeScreen.name})
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setScreenBackground('#0F172A', true, { useGradientBg: false })
              }
              className={`flex-1 min-h-[38px] rounded-xl border text-xs font-medium ${
                activeScreen.backgroundColor === '#0F172A' && !activeScreen.useGradientBg
                  ? 'border-indigo-500 bg-slate-950 text-white'
                  : 'border-slate-800 bg-slate-950/50 text-slate-400'
              }`}
            >
              Dark (#0F172A)
            </button>
            <button
              type="button"
              onClick={() =>
                setScreenBackground('#F8FAFC', false, { useGradientBg: false })
              }
              className={`flex-1 min-h-[38px] rounded-xl border text-xs font-medium ${
                activeScreen.backgroundColor === '#F8FAFC' && !activeScreen.useGradientBg
                  ? 'border-indigo-500 bg-white text-slate-900'
                  : 'border-slate-800 bg-slate-100 text-slate-700'
              }`}
            >
              Light (#F8FAFC)
            </button>
          </div>

          <label className="flex items-center justify-between text-xs text-slate-300 pt-1 cursor-pointer">
            <span>Use Linear Gradient Background</span>
            <input
              type="checkbox"
              checked={Boolean(activeScreen.useGradientBg)}
              onChange={(e) =>
                setScreenBackground(
                  activeScreen.backgroundColor,
                  activeScreen.isDarkPreview,
                  {
                    useGradientBg: e.target.checked,
                    gradientEndColor: activeScreen.gradientEndColor || '#1E1B4B',
                    gradientAngle: activeScreen.gradientAngle ?? 145,
                  }
                )
              }
              className="rounded border-slate-700 text-indigo-600"
            />
          </label>

          {activeScreen.useGradientBg && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Start Hex
                </label>
                <input
                  type="color"
                  value={activeScreen.backgroundColor || '#0F172A'}
                  onChange={(e) =>
                    setScreenBackground(e.target.value, activeScreen.isDarkPreview, {
                      useGradientBg: true,
                    })
                  }
                  className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  End Hex
                </label>
                <input
                  type="color"
                  value={activeScreen.gradientEndColor || '#1E1B4B'}
                  onChange={(e) =>
                    setScreenBackground(
                      activeScreen.backgroundColor,
                      activeScreen.isDarkPreview,
                      {
                        useGradientBg: true,
                        gradientEndColor: e.target.value,
                      }
                    )
                  }
                  className="w-full h-9 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Grid Step & Columns */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <div className="text-xs font-medium text-slate-300">
            Canvas Grid &amp; Snap Settings
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Grid Step (dp)
              </label>
              <select
                aria-label="Grid Step in dp"
                value={project.gridSettings.sizeDp}
                onChange={(e) =>
                  updateGridSettings({ sizeDp: Number(e.target.value) })
                }
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              >
                <option value={4}>4 dp (Fine)</option>
                <option value={8}>8 dp (Material Default)</option>
                <option value={16}>16 dp (Coarse)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Gutter (dp)
              </label>
              <input
                type="number"
                aria-label="Grid Gutter in dp"
                value={project.gridSettings.gutterDp}
                onChange={(e) =>
                  updateGridSettings({ gutterDp: Math.max(0, Number(e.target.value)) })
                }
                className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* One-Tap Auto-Layout Action */}
        <div className="pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              runAutoLayout();
              addToast(t('editor.autoLayoutToast'), 'success');
            }}
            className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Convert Screen to Auto-Layout Column</span>
          </button>
        </div>
      </div>
    );
  }

  const { props } = selectedElement;

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 overflow-y-auto p-4 space-y-5">
      {/* Header & Layer Name */}
      <div className="space-y-2 border-b border-slate-800 pb-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono text-indigo-400 inline-flex items-center gap-1.5">
            {renderWidgetTypeIcon(selectedElement.type, 'w-3.5 h-3.5')}
            <span>@Composable {selectedElement.type}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={duplicateSelected}
              aria-label="Duplicate Widget"
              className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={deleteSelected}
              aria-label="Delete Widget"
              className="w-8 h-8 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 flex items-center justify-center text-rose-400"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <input
          type="text"
          aria-label="Composable Identifier Name"
          value={selectedElement.name}
          onChange={(e) => renameElement(selectedElement.id, e.target.value)}
          className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Position & Size (dp) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Geometry &amp; Bounds (dp)
          </span>
          <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
            <input
              type="checkbox"
              checked={Boolean(props.fillMaxWidth)}
              onChange={(e) => {
                const fill = e.target.checked;
                updateElementProps(selectedElement.id, { fillMaxWidth: fill });
                if (fill) {
                  updateElementGeometry(
                    selectedElement.id,
                    { x: 16, width: project.widthDp - 32 },
                    true
                  );
                }
              }}
              className="rounded border-slate-700 text-indigo-600"
            />
            <span>fillMaxWidth()</span>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {isPro && (
            <>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  X Offset (dp)
                </label>
                <input
                  type="number"
                  aria-label="X Offset in dp"
                  value={selectedElement.x}
                  onChange={(e) =>
                    updateElementGeometry(
                      selectedElement.id,
                      { x: Number(e.target.value) },
                      true
                    )
                  }
                  className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Y Offset (dp)
                </label>
                <input
                  type="number"
                  aria-label="Y Offset in dp"
                  value={selectedElement.y}
                  onChange={(e) =>
                    updateElementGeometry(
                      selectedElement.id,
                      { y: Number(e.target.value) },
                      true
                    )
                  }
                  className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                />
              </div>
            </>
          )}
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Width (dp)
            </label>
            <input
              type="number"
              aria-label="Width in dp"
              value={selectedElement.width}
              onChange={(e) =>
                updateElementGeometry(
                  selectedElement.id,
                  { width: Number(e.target.value) },
                  true
                )
              }
              className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Height (dp)
            </label>
            <input
              type="number"
              aria-label="Height in dp"
              value={selectedElement.height}
              onChange={(e) =>
                updateElementGeometry(
                  selectedElement.id,
                  { height: Number(e.target.value) },
                  true
                )
              }
              className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Text / Label Content */}
      {!['Spacer', 'Divider', 'LinearProgressIndicator', 'CircularProgressIndicator'].includes(
        selectedElement.type
      ) && (
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">
              Primary Text / Label
            </label>
            <input
              type="text"
              aria-label="Primary Text or Label"
              value={props.text ?? ''}
              onChange={(e) =>
                updateElementProps(selectedElement.id, { text: e.target.value })
              }
              placeholder="Text parameter..."
              className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {['Card', 'Image', 'TextField', 'CustomPlaceholder'].includes(
            selectedElement.type
          ) && (
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                Subtitle / Supporting Text
              </label>
              <input
                type="text"
                aria-label="Subtitle or Supporting Text"
                value={props.secondaryText ?? ''}
                onChange={(e) =>
                  updateElementProps(selectedElement.id, {
                    secondaryText: e.target.value,
                  })
                }
                placeholder="Supporting text..."
                className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      )}

      {/* 56-Vector Icon Library Picker & Tint Mode */}
      <div className="pt-2 border-t border-slate-800 space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">
            Vector Icon (ImageVector)
          </span>
          <button
            type="button"
            onClick={() => setShowIconPicker(!showIconPicker)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-indigo-300 flex items-center gap-1.5"
          >
            {props.iconName ? (
              <>
                {renderVectorIcon(props.iconName, 'w-3.5 h-3.5')}
                <span>{props.iconName}</span>
              </>
            ) : (
              <span>+ Choose Icon (56)</span>
            )}
          </button>
        </div>

        {/* Icon Color Mode selector when an icon is active */}
        {props.iconName && (
          <div className="space-y-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Icon Tint Mode:</span>
              <button
                type="button"
                onClick={() => updateElementProps(selectedElement.id, { iconName: undefined })}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-0.5 text-[10px]"
              >
                <X className="w-3 h-3" />
                <span>Remove Icon</span>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { id: 'theme', label: 'Theme' },
                  { id: 'vibrant', label: 'Vibrant' },
                  { id: 'custom', label: 'Custom' },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() =>
                    updateElementProps(selectedElement.id, { iconColorMode: m.id })
                  }
                  className={`py-1 rounded-lg text-[11px] font-medium border ${
                    (props.iconColorMode ?? 'theme') === m.id
                      ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
            {props.iconColorMode === 'custom' && (
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="color"
                  value={props.iconTint || '#6366F1'}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, { iconTint: e.target.value })
                  }
                  className="w-8 h-8 rounded bg-slate-900 border border-slate-700 cursor-pointer"
                />
                <input
                  type="text"
                  value={props.iconTint || '#6366F1'}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, { iconTint: e.target.value })
                  }
                  className="flex-1 h-8 px-2 rounded bg-slate-900 border border-slate-800 text-xs font-mono"
                />
              </div>
            )}
          </div>
        )}

        {showIconPicker && (
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={iconSearch}
                onChange={(e) => setIconSearch(e.target.value)}
                placeholder="Search 56 vector icons..."
                className="w-full h-8 pl-8 pr-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
              {ICON_CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setIconCat(c.id)}
                  className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap ${
                    iconCat === c.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-6 gap-1.5 max-h-44 overflow-y-auto p-0.5">
              {filteredIcons.map((ic) => {
                const selected = props.iconName === ic.name;
                const IconComp = ic.Component;
                return (
                  <button
                    key={ic.name}
                    type="button"
                    onClick={() => {
                      updateElementProps(selectedElement.id, { iconName: ic.name });
                      triggerHaptic(6);
                    }}
                    title={`${ic.label} (${ic.composeName})`}
                    className={`h-9 rounded-lg flex items-center justify-center border transition-all ${
                      selected
                        ? 'bg-indigo-600/30 border-indigo-400 scale-105'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                    }`}
                    style={{ color: ic.vibrantHex }}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Interactive State Controls (Switch, Checkbox, Slider, Progress, Tabs) */}
      {['Switch', 'Checkbox', 'RadioButton', 'Chip'].includes(selectedElement.type) && (
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-300">
            Default Checked / Selected
          </span>
          <button
            type="button"
            onClick={() =>
              updateElementProps(selectedElement.id, { checked: !props.checked })
            }
            className={`min-h-[38px] px-3.5 rounded-xl text-xs font-semibold ${
              props.checked
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {props.checked ? 'true' : 'false'}
          </button>
        </div>
      )}

      {['Slider', 'LinearProgressIndicator', 'CircularProgressIndicator'].includes(
        selectedElement.type
      ) && (
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-slate-300">Progress Value</span>
            <span className="font-mono text-indigo-300">
              {Math.round((props.progress ?? 0.65) * 100)}%
            </span>
          </div>
          <input
            type="range"
            aria-label="Progress Value"
            min={0}
            max={1}
            step={0.02}
            value={props.progress ?? 0.65}
            onChange={(e) =>
              updateElementProps(selectedElement.id, {
                progress: Number(e.target.value),
              })
            }
            className="w-full accent-indigo-500"
          />
        </div>
      )}

      {['TabRow', 'BottomNavigationBar', 'NavigationRail', 'LazyColumn', 'LazyRow'].includes(
        selectedElement.type
      ) && (
        <div className="pt-2 border-t border-slate-800 space-y-2">
          <label className="text-xs font-medium text-slate-300 block">
            Items List (comma-separated)
          </label>
          <input
            type="text"
            aria-label="Items List"
            value={(props.itemsList ?? []).join(', ')}
            onChange={(e) =>
              updateElementProps(selectedElement.id, {
                itemsList: e.target.value
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
        </div>
      )}

      {/* Styling: Colors, Gradient & Glassmorphism */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-300">
          Colors, Gradients &amp; Glass Effect
        </div>

        {/* Swatches */}
        <div className="flex flex-wrap items-center gap-2">
          {M3_COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() =>
                updateElementProps(selectedElement.id, {
                  backgroundColor: hex,
                })
              }
              aria-label={`Set background color ${hex}`}
              style={{ backgroundColor: hex }}
              className={`w-7 h-7 rounded-lg border ${
                props.backgroundColor === hex
                  ? 'ring-2 ring-white border-transparent scale-110'
                  : 'border-white/20'
              } transition-transform`}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Container Hex
            </label>
            <input
              type="text"
              aria-label="Container Background Hex"
              value={props.backgroundColor ?? '#1E293B'}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  backgroundColor: e.target.value,
                })
              }
              className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Content / Text Hex
            </label>
            <input
              type="text"
              aria-label="Content Foreground Hex"
              value={props.contentColor ?? '#FFFFFF'}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  contentColor: e.target.value,
                })
              }
              className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
        </div>

        {/* Linear Gradient Toggle */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Linear Gradient Brush</span>
            <input
              type="checkbox"
              checked={Boolean(props.useGradientBg)}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  useGradientBg: e.target.checked,
                  gradientEndColor: props.gradientEndColor || '#EC4899',
                  gradientAngle: props.gradientAngle ?? 135,
                })
              }
              className="rounded border-slate-700 text-indigo-600"
            />
          </label>
          {props.useGradientBg && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Gradient End Hex
                </label>
                <input
                  type="text"
                  value={props.gradientEndColor || '#EC4899'}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, {
                      gradientEndColor: e.target.value,
                    })
                  }
                  className="w-full h-8 px-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Angle ({props.gradientAngle ?? 135}°)
                </label>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={15}
                  value={props.gradientAngle ?? 135}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, {
                      gradientAngle: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-500 mt-1.5"
                />
              </div>
            </div>
          )}
        </div>

        {/* Glassmorphism Frosted Blur Toggle */}
        <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
          <label className="flex items-center justify-between text-xs text-slate-300 cursor-pointer">
            <span>Glassmorphism Blur Effect</span>
            <input
              type="checkbox"
              checked={Boolean(props.glassEffect)}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  glassEffect: e.target.checked,
                  glassBlur: props.glassBlur ?? 16,
                  glassOpacity: props.glassOpacity ?? 0.72,
                })
              }
              className="rounded border-slate-700 text-indigo-600"
            />
          </label>
          {props.glassEffect && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Blur ({props.glassBlur ?? 16}px)
                </label>
                <input
                  type="range"
                  min={4}
                  max={32}
                  value={props.glassBlur ?? 16}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, {
                      glassBlur: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-slate-400 block mb-1">
                  Surface Alpha ({Math.round((props.glassOpacity ?? 0.72) * 100)}%)
                </label>
                <input
                  type="range"
                  min={0.35}
                  max={0.95}
                  step={0.05}
                  value={props.glassOpacity ?? 0.72}
                  onChange={(e) =>
                    updateElementProps(selectedElement.id, {
                      glassOpacity: Number(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Shape, Padding & Elevation */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <div className="text-xs font-semibold text-slate-300">
          Shape &amp; Modifiers
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Radius (dp)
            </label>
            <input
              type="number"
              aria-label="Corner Radius in dp"
              value={props.cornerRadius ?? 12}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  cornerRadius: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full min-h-[38px] px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Padding (dp)
            </label>
            <input
              type="number"
              aria-label="Padding in dp"
              value={props.padding ?? 0}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  padding: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full min-h-[38px] px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Elevation (dp)
            </label>
            <input
              type="number"
              aria-label="Elevation in dp"
              value={props.elevation ?? 0}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  elevation: Math.max(0, Number(e.target.value)),
                })
              }
              className="w-full min-h-[38px] px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
            />
          </div>
        </div>
      </div>

      {/* Typography Scale & Font Family */}
      {(isPro || ['Text', 'Button', 'Card', 'TopAppBar', 'Chip'].includes(selectedElement.type)) && (
        <div className="pt-2 border-t border-slate-800 space-y-2.5">
          <div className="text-xs font-semibold text-slate-300">
            Typography (sp, Font &amp; Weight)
          </div>
          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Font Family
            </label>
            <select
              aria-label="Font Family"
              value={props.fontFamily ?? project.theme?.fontFamily ?? 'Plus Jakarta Sans'}
              onChange={(e) =>
                updateElementProps(selectedElement.id, {
                  fontFamily: e.target.value as ProjectFontFamily,
                })
              }
              className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs"
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                Font Size (sp)
              </label>
              <input
                type="number"
                aria-label="Font Size in sp"
                value={props.fontSize ?? 16}
                onChange={(e) =>
                  updateElementProps(selectedElement.id, {
                    fontSize: Math.max(10, Number(e.target.value)),
                  })
                }
                className="w-full min-h-[38px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">
                FontWeight
              </label>
              <select
                aria-label="Font Weight"
                value={props.fontWeight ?? 'Normal'}
                onChange={(e) =>
                  updateElementProps(selectedElement.id, {
                    fontWeight: e.target.value as FontWeightOption,
                  })
                }
                className="w-full min-h-[38px] px-2 rounded-xl bg-slate-950 border border-slate-800 text-xs"
              >
                <option value="Normal">Normal (W400)</option>
                <option value="Medium">Medium (W500)</option>
                <option value="SemiBold">SemiBold (W600)</option>
                <option value="Bold">Bold (W700)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[10px] font-mono text-slate-400 block mb-1">
              Horizontal Alignment
            </label>
            <div className="grid grid-cols-3 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(
                [
                  { id: 'Start', label: 'Start' },
                  { id: 'CenterHorizontally', label: 'Center' },
                  { id: 'End', label: 'End' },
                ] as { id: HorizontalAlignment; label: string }[]
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    updateElementProps(selectedElement.id, {
                      horizontalAlignment: item.id,
                    })
                  }
                  className={`min-h-[34px] rounded-lg text-xs font-medium ${
                    (props.horizontalAlignment ?? 'Start') === item.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
