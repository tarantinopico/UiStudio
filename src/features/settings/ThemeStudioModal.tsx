import React, { useMemo, useState } from 'react';
import {
  Check,
  Copy,
  Palette,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import { useEditorStore } from '../../store/editorStore';
import type {
  DesignStylePreset,
  ProjectFontFamily,
  ProjectTheme,
} from '../../types/models';

const STYLE_PRESETS: { id: DesignStylePreset; label: string; desc: string }[] = [
  { id: 'modern-glass', label: 'Modern Glass', desc: 'Frosted blur & vibrant gradients' },
  { id: 'material-you', label: 'Material You M3', desc: 'Expressive tonal surfaces' },
  { id: 'lightweight-minimal', label: 'Lightweight Minimal', desc: 'Zero-bloat crisp & fast' },
  { id: 'neo-brutalist', label: 'Neo-Brutalist', desc: 'High contrast & sharp borders' },
];

const FONT_FAMILIES: ProjectFontFamily[] = [
  'Plus Jakarta Sans',
  'System Sans',
  'Geometric Rounded',
  'JetBrains Mono',
  'Editorial Serif',
];

export const ThemeStudioModal: React.FC = () => {
  const {
    showThemeStudioModal,
    setShowThemeStudioModal,
    customThemes,
    getAllThemes,
    saveCustomTheme,
    deleteCustomTheme,
    addToast,
    triggerHaptic,
  } = useUIStore();

  const { project, applyProjectTheme } = useEditorStore();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allThemes = useMemo(() => getAllThemes(), [customThemes]);

  const [editingTheme, setEditingTheme] = useState<ProjectTheme>(() => {
    return (
      project?.theme ??
      allThemes[0] ?? {
        id: `theme-custom-${Date.now()}`,
        name: 'My Custom Studio Theme',
        stylePreset: 'modern-glass',
        isDark: true,
        primaryColor: '#6366F1',
        secondaryColor: '#312E81',
        accentColor: '#38BDF8',
        backgroundColor: '#090D16',
        surfaceColor: '#1E293B',
        textColor: '#F8FAFC',
        useGradient: true,
        gradientStart: '#0F172A',
        gradientEnd: '#1E1B4B',
        gradientAngle: 145,
        fontFamily: 'Plus Jakarta Sans',
        glassBlurPx: 16,
        glassOpacity: 0.75,
        defaultCornerRadiusDp: 20,
        borderStrokeWidthDp: 1,
      }
    );
  });

  if (!showThemeStudioModal) return null;

  const handleSelectThemeForEdit = (th: ProjectTheme) => {
    setEditingTheme({ ...th });
  };

  const handleCreateNewBlankTheme = () => {
    const newTheme: ProjectTheme = {
      id: `theme-custom-${Date.now()}`,
      name: `Custom Theme #${customThemes.length + 1}`,
      stylePreset: 'modern-glass',
      isDark: true,
      primaryColor: '#8B5CF6',
      secondaryColor: '#4C1D95',
      accentColor: '#EC4899',
      backgroundColor: '#0B0914',
      surfaceColor: '#1E1B2E',
      textColor: '#F8FAFC',
      useGradient: true,
      gradientStart: '#0B0914',
      gradientEnd: '#2E1065',
      gradientAngle: 135,
      fontFamily: 'Plus Jakarta Sans',
      glassBlurPx: 16,
      glassOpacity: 0.72,
      defaultCornerRadiusDp: 20,
      borderStrokeWidthDp: 1,
      isBuiltIn: false,
    };
    setEditingTheme(newTheme);
  };

  const handleSaveToStudio = () => {
    const toSave: ProjectTheme = {
      ...editingTheme,
      id: editingTheme.isBuiltIn
        ? `theme-custom-${Date.now()}`
        : editingTheme.id,
      name: editingTheme.isBuiltIn
        ? `${editingTheme.name} (Custom)`
        : editingTheme.name.trim() || 'Untitled Theme',
      isBuiltIn: false,
    };
    saveCustomTheme(toSave);
    setEditingTheme(toSave);
    triggerHaptic(12);
    addToast(`Saved "${toSave.name}" to global Studio Themes!`, 'success');
  };

  const handleApplyToCurrentProject = () => {
    if (!project) return;
    applyProjectTheme(editingTheme, true);
    triggerHaptic(14);
    addToast(`Applied "${editingTheme.name}" to ${project.name}`, 'success');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Studio Theme Manager"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
    >
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Studio Theme Manager (Reusable CRUD Themes)
              </h2>
              <p className="text-xs text-slate-400">
                Design reusable color palettes, gradients, typography &amp; glassmorphism for all your Compose projects
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowThemeStudioModal(false)}
            aria-label="Close Theme Studio"
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body: Left Theme List + Right Live Editor */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-slate-800">
          {/* Left Column: Saved & Built-in Themes */}
          <div className="md:col-span-5 p-4 space-y-3 bg-slate-950/40 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Available Themes ({allThemes.length})
              </span>
              <button
                type="button"
                onClick={handleCreateNewBlankTheme}
                className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Theme</span>
              </button>
            </div>

            <div className="space-y-2">
              {allThemes.map((th) => {
                const isSelected = editingTheme.id === th.id;
                return (
                  <div
                    key={th.id}
                    onClick={() => handleSelectThemeForEdit(th)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold truncate">
                            {th.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              th.isBuiltIn
                                ? 'bg-slate-800 text-slate-400'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {th.isBuiltIn ? 'Preset' : 'Custom'}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {th.fontFamily} · {th.defaultCornerRadiusDp}dp radius
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
                        {!th.isBuiltIn && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCustomTheme(th.id);
                              addToast(`Deleted theme "${th.name}"`, 'info');
                            }}
                            title="Delete custom theme"
                            className="ml-1 p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Theme Customizer */}
          <div className="md:col-span-7 p-4 sm:p-5 space-y-4 overflow-y-auto">
            {/* Live Preview Card */}
            <div
              style={{
                backgroundColor: editingTheme.useGradient
                  ? undefined
                  : editingTheme.backgroundColor,
                backgroundImage: editingTheme.useGradient
                  ? `linear-gradient(${editingTheme.gradientAngle}deg, ${editingTheme.gradientStart}, ${editingTheme.gradientEnd})`
                  : undefined,
                fontFamily: editingTheme.fontFamily,
              }}
              className="p-4 rounded-2xl border border-slate-700/80 shadow-inner flex items-center justify-between gap-4"
            >
              <div
                style={{
                  backgroundColor: editingTheme.surfaceColor,
                  color: editingTheme.textColor,
                  borderRadius: `${editingTheme.defaultCornerRadiusDp}px`,
                  backdropFilter:
                    editingTheme.glassBlurPx > 0
                      ? `blur(${editingTheme.glassBlurPx}px)`
                      : undefined,
                  opacity:
                    editingTheme.glassBlurPx > 0 ? editingTheme.glassOpacity : 1,
                }}
                className="flex-1 p-3.5 border border-white/15 shadow-lg"
              >
                <div className="text-xs font-bold">{editingTheme.name}</div>
                <div className="text-[11px] opacity-75 mt-0.5">
                  {editingTheme.fontFamily} ·{' '}
                  {editingTheme.glassBlurPx > 0
                    ? `Glass Blur ${editingTheme.glassBlurPx}px`
                    : 'Lightweight Solid'}
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: editingTheme.primaryColor,
                      borderRadius: `${Math.max(8, editingTheme.defaultCornerRadiusDp)}px`,
                    }}
                    className="px-3 py-1 text-[11px] font-semibold text-white"
                  >
                    Primary CTA
                  </span>
                  <span
                    style={{
                      color: editingTheme.accentColor,
                    }}
                    className="text-[11px] font-semibold"
                  >
                    Accent Link →
                  </span>
                </div>
              </div>
            </div>

            {/* Theme Name & Style Preset */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Theme Name
                </label>
                <input
                  type="text"
                  value={editingTheme.name}
                  onChange={(e) =>
                    setEditingTheme({ ...editingTheme, name: e.target.value })
                  }
                  className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">
                  Typography Font Family
                </label>
                <select
                  value={editingTheme.fontFamily}
                  onChange={(e) =>
                    setEditingTheme({
                      ...editingTheme,
                      fontFamily: e.target.value as ProjectFontFamily,
                    })
                  }
                  className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  {FONT_FAMILIES.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Style Architecture Presets */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Visual Style Architecture
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_PRESETS.map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => {
                      const isGlass = st.id === 'modern-glass';
                      const isLight = st.id === 'lightweight-minimal';
                      setEditingTheme({
                        ...editingTheme,
                        stylePreset: st.id,
                        glassBlurPx: isGlass ? 16 : 0,
                        glassOpacity: isGlass ? 0.72 : 1,
                        useGradient: isGlass,
                        defaultCornerRadiusDp: isLight
                          ? 12
                          : st.id === 'neo-brutalist'
                            ? 6
                            : 20,
                      });
                    }}
                    className={`p-2 rounded-xl border text-left transition-colors ${
                      editingTheme.stylePreset === st.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-semibold">{st.label}</div>
                    <div className="text-[10px] opacity-75">{st.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 6 Color Pickers */}
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1.5">
                Color Tokens (Primary, Secondary, Accent, Background, Surface, Text)
              </label>
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
                ).map((item) => (
                  <div
                    key={item.key}
                    className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center gap-1"
                  >
                    <input
                      type="color"
                      value={editingTheme[item.key]}
                      onChange={(e) =>
                        setEditingTheme({
                          ...editingTheme,
                          [item.key]: e.target.value,
                        })
                      }
                      className="w-8 h-8 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <span className="text-[10px] text-slate-300 font-medium">
                      {item.label}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500 uppercase">
                      {editingTheme[item.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Gradient & Glass Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <label className="flex items-center justify-between text-xs font-medium text-slate-200 cursor-pointer">
                  <span>Linear Gradient Background</span>
                  <input
                    type="checkbox"
                    checked={editingTheme.useGradient}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        useGradient: e.target.checked,
                      })
                    }
                    className="rounded border-slate-700 text-indigo-600"
                  />
                </label>
                {editingTheme.useGradient && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Start</span>
                      <input
                        type="color"
                        value={editingTheme.gradientStart}
                        onChange={(e) =>
                          setEditingTheme({
                            ...editingTheme,
                            gradientStart: e.target.value,
                          })
                        }
                        className="w-full h-7 rounded cursor-pointer bg-transparent"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">End</span>
                      <input
                        type="color"
                        value={editingTheme.gradientEnd}
                        onChange={(e) =>
                          setEditingTheme({
                            ...editingTheme,
                            gradientEnd: e.target.value,
                          })
                        }
                        className="w-full h-7 rounded cursor-pointer bg-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-200">
                  <span>Glass Blur &amp; Corner Radius</span>
                  <span className="font-mono text-[10px] text-indigo-300">
                    {editingTheme.glassBlurPx}px · {editingTheme.defaultCornerRadiusDp}dp
                  </span>
                </div>
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={28}
                    step={2}
                    value={editingTheme.glassBlurPx}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        glassBlurPx: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                  <input
                    type="range"
                    min={0}
                    max={32}
                    step={2}
                    value={editingTheme.defaultCornerRadiusDp}
                    onChange={(e) =>
                      setEditingTheme({
                        ...editingTheme,
                        defaultCornerRadiusDp: Number(e.target.value),
                      })
                    }
                    className="w-full accent-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={handleSaveToStudio}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>
                  {editingTheme.isBuiltIn
                    ? 'Save Copy as Custom Theme'
                    : 'Save Theme Changes'}
                </span>
              </button>

              {project && (
                <button
                  type="button"
                  onClick={handleApplyToCurrentProject}
                  className="min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-indigo-600/25"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Apply to Current Project</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowThemeStudioModal(false)}
                className="min-h-[42px] px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
