import React, { useState } from 'react';
import {
  Check,
  Globe,
  Grid,
  Moon,
  Palette,
  RotateCcw,
  Settings,
  Smartphone,
  Sun,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUIStore, type ThemePreference } from '../../store/uiStore';
import { useProjectStore } from '../../store/projectStore';
import { PWAInstallButton } from '../../components/ui/PWAInstallButton';

const ACCENT_PRESETS = [
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Sky', hex: '#0EA5E9' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Amber', hex: '#F59E0B' },
  { name: 'Rose', hex: '#F43F5E' },
];

export const SettingsModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    showSettingsModal,
    setShowSettingsModal,
    setShowThemeStudioModal,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    mobileEditorLayout,
    setMobileEditorLayout,
    defaultGridSizeDp,
    setDefaultGridSizeDp,
    defaultGutterDp,
    setDefaultGutterDp,
    unitDisplay,
    setUnitDisplay,
    hapticFeedback,
    setHapticFeedback,
    helperLines,
    setHelperLines,
    autosaveIntervalMs,
    setAutosaveIntervalMs,
    language,
    setLanguage,
    customThemes,
    customWidgetGroups,
    resetUISettings,
    addToast,
  } = useUIStore();

  const { resetAllProjects } = useProjectStore();
  const [confirmingReset, setConfirmingReset] = useState(false);

  if (!showSettingsModal) return null;

  const handleConfirmReset = async () => {
    resetUISettings();
    await resetAllProjects();
    setConfirmingReset(false);
    setShowSettingsModal(false);
    addToast('All studio data and sample projects restored', 'info');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('settings.title')}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white">{t('settings.title')}</h2>
          </div>
          <button
            type="button"
            onClick={() => setShowSettingsModal(false)}
            aria-label="Close Settings Modal"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* PWA Install CTA */}
          <PWAInstallButton />

          {/* Phone Display & Control Mode Selector */}
          <div className="space-y-2.5 p-3.5 rounded-2xl bg-indigo-950/25 border border-indigo-500/30">
            <label className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-indigo-400" />
              <span>Phone Editor Display &amp; Control Layout</span>
            </label>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Choose how the editor operates on phone screens: either the classic bottom sheets or the ergonomic one-handed Thumb Cockpit.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  setMobileEditorLayout('thumb-cockpit');
                  addToast('Phone UI set to Ergonomic Thumb Cockpit', 'success');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mobileEditorLayout === 'thumb-cockpit'
                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Thumb Cockpit (Recommended)</span>
                  {mobileEditorLayout === 'thumb-cockpit' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <div className="text-[10px] opacity-80 mt-1 leading-snug">
                  1-tap quick-insert widget bar + floating pill dock + half-screen split drawer so canvas stays visible.
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMobileEditorLayout('classic-sheets');
                  addToast('Phone UI set to Classic Bottom Sheets', 'success');
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  mobileEditorLayout === 'classic-sheets'
                    ? 'bg-indigo-600/25 border-indigo-500 text-white shadow'
                    : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-xs font-bold flex items-center justify-between">
                  <span>Classic Bottom Sheets</span>
                  {mobileEditorLayout === 'classic-sheets' && (
                    <Check className="w-3.5 h-3.5 text-indigo-400" />
                  )}
                </div>
                <div className="text-[10px] opacity-80 mt-1 leading-snug">
                  Standard 4-tab bottom navigation bar with full-height slide-up sheets.
                </div>
              </button>
            </div>
          </div>

          {/* Global Studio Themes CRUD Shortcut */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
            <div>
              <div className="text-xs font-semibold text-white">
                Global Studio Themes &amp; Widget Groups
              </div>
              <div className="text-[11px] text-slate-400">
                {customThemes.length} custom theme(s) · {customWidgetGroups.length} custom group(s)
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setShowSettingsModal(false);
                setShowThemeStudioModal(true);
              }}
              className="min-h-[38px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Manage Themes</span>
            </button>
          </div>

          {/* Language (i18n EN / CZ) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('settings.language')}</span>
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                  language === 'en'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                English (EN)
              </button>
              <button
                type="button"
                onClick={() => setLanguage('cs')}
                className={`min-h-[40px] rounded-lg text-xs font-semibold transition-colors ${
                  language === 'cs'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Čeština (CZ)
              </button>
            </div>
          </div>

          {/* Theme (Light / Dark / System) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {t('settings.theme')}
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              {(
                [
                  { id: 'light', label: t('settings.themeLight'), icon: Sun },
                  { id: 'dark', label: t('settings.themeDark'), icon: Moon },
                  { id: 'system', label: t('settings.themeSystem'), icon: Smartphone },
                ] as { id: ThemePreference; label: string; icon: React.FC<{ className?: string }> }[]
              ).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTheme(item.id)}
                    className={`min-h-[40px] rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                      theme === item.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Studio Accent Color */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 block">
              {t('settings.accentColor')}
            </label>
            <div className="flex items-center gap-2.5">
              {ACCENT_PRESETS.map((preset) => (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setAccentColor(preset.hex)}
                  aria-label={`Select accent color ${preset.name}`}
                  style={{ backgroundColor: preset.hex }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow transition-transform active:scale-95"
                >
                  {accentColor === preset.hex && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Grid & Coordinate Defaults */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t('settings.gridDefaults')}</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('settings.gridSize')}
                </label>
                <select
                  aria-label="Default Grid Step in dp"
                  value={defaultGridSizeDp}
                  onChange={(e) => setDefaultGridSizeDp(Number(e.target.value))}
                  className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <option value={4}>4 dp</option>
                  <option value={8}>8 dp</option>
                  <option value={16}>16 dp</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('settings.gutterSize')}
                </label>
                <select
                  aria-label="Default Gutter Size in dp"
                  value={defaultGutterDp}
                  onChange={(e) => setDefaultGutterDp(Number(e.target.value))}
                  className="w-full min-h-[40px] px-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
                >
                  <option value={8}>8 dp</option>
                  <option value={12}>12 dp</option>
                  <option value={16}>16 dp</option>
                  <option value={24}>24 dp</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  {t('settings.unitDisplay')}
                </label>
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
                  {(['dp', 'px'] as const).map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUnitDisplay(u)}
                      className={`min-h-[30px] rounded-lg text-xs font-mono font-semibold ${
                        unitDisplay === u
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400'
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Haptics, Helper Lines, Autosave */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                {t('settings.haptics')}
              </span>
              <button
                type="button"
                onClick={() => setHapticFeedback(!hapticFeedback)}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold ${
                  hapticFeedback
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hapticFeedback ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                {t('settings.helperLines')}
              </span>
              <button
                type="button"
                onClick={() => setHelperLines(!helperLines)}
                className={`min-h-[36px] px-3.5 rounded-xl text-xs font-semibold ${
                  helperLines
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {helperLines ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-300">
                {t('settings.autosave')}
              </span>
              <select
                aria-label="Autosave Interval"
                value={autosaveIntervalMs}
                onChange={(e) => setAutosaveIntervalMs(Number(e.target.value))}
                className="min-h-[38px] px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono"
              >
                <option value={800}>0.8s (Instant)</option>
                <option value={1500}>1.5s (Default)</option>
                <option value={3000}>3.0s</option>
                <option value={5000}>5.0s</option>
              </select>
            </div>
          </div>

          {/* Destructive Data Reset */}
          <div className="pt-3 border-t border-slate-800">
            {!confirmingReset ? (
              <button
                type="button"
                onClick={() => setConfirmingReset(true)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{t('settings.resetData')}</span>
              </button>
            ) : (
              <div className="p-3.5 rounded-xl bg-rose-950/50 border border-rose-500/40 space-y-3">
                <p className="text-xs text-rose-200 leading-relaxed">
                  {t('settings.resetConfirm')}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="flex-1 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmingReset(false)}
                    className="flex-1 min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
