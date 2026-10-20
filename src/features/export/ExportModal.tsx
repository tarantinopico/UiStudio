import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Check,
  Code2,
  Copy,
  Download,
  FileJson,
  Image as ImageIcon,
  Share2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { generateComposeCode, toPascalCase } from '../../lib/codegen/composeGenerator';
import { serializeProjectToJson } from '../../lib/persistence/db';

type ExportTab = 'kotlin' | 'png' | 'json';

export const ExportModal: React.FC = () => {
  const { t } = useTranslation();
  const { project } = useEditorStore();
  const { showExportModal, setShowExportModal, addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<ExportTab>('kotlin');
  const [includePreview, setIncludePreview] = useState(true);
  const [includeThemeWrapper, setIncludeThemeWrapper] = useState(true);
  const [generateInteractiveState, setGenerateInteractiveState] = useState(true);
  const [pngScale, setPngScale] = useState<1 | 2 | 3>(2);
  const [copied, setCopied] = useState(false);

  const canvasPreviewRef = useRef<HTMLCanvasElement | null>(null);

  const activeScreen = useMemo(() => {
    if (!project) return undefined;
    return (
      project.screens.find((s) => s.id === project.activeScreenId) ??
      project.screens[0]
    );
  }, [project]);

  const kotlinCode = useMemo(() => {
    if (!project || !activeScreen) return '';
    return generateComposeCode(project, activeScreen, {
      includePreview,
      includeThemeWrapper,
      generateInteractiveState,
    });
  }, [
    project,
    activeScreen,
    includePreview,
    includeThemeWrapper,
    generateInteractiveState,
  ]);

  const jsonContent = useMemo(() => {
    if (!project) return '';
    return serializeProjectToJson(project);
  }, [project]);

  // Render high-DPI PNG preview onto HTML5 Canvas when PNG tab is active
  useEffect(() => {
    if (!showExportModal || activeTab !== 'png' || !project || !activeScreen) return;
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;

    const w = project.widthDp * pngScale;
    const h = project.heightDp * pngScale;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.save();
    ctx.scale(pngScale, pngScale);

    // Background
    ctx.fillStyle = activeScreen.backgroundColor || '#0F172A';
    ctx.fillRect(0, 0, project.widthDp, project.heightDp);

    // Draw elements sorted by zIndex
    const sorted = [...activeScreen.elements]
      .filter((el) => !el.hidden)
      .sort((a, b) => a.zIndex - b.zIndex);

    for (const el of sorted) {
      const r = Math.min(
        el.width / 2,
        el.height / 2,
        el.props.cornerRadius ?? 12
      );
      const bg =
        el.props.backgroundColor && el.props.backgroundColor !== 'transparent'
          ? el.props.backgroundColor
          : el.type === 'Button' || el.type === 'FAB'
            ? '#6366F1'
            : el.type === 'Card' || el.type === 'BottomNavigationBar' || el.type === 'TopAppBar'
              ? '#1E293B'
              : null;

      if (bg) {
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.fill();
      }

      if (el.props.borderWidth && el.props.borderWidth > 0) {
        ctx.strokeStyle = el.props.borderColor || '#475569';
        ctx.lineWidth = el.props.borderWidth;
        ctx.beginPath();
        ctx.roundRect(el.x, el.y, el.width, el.height, r);
        ctx.stroke();
      }

      // Draw primary text label
      const label = el.props.text || (el.type === 'LazyColumn' ? (el.props.itemsList?.[0] ?? 'LazyColumn') : '');
      if (label) {
        ctx.fillStyle = el.props.contentColor || '#F8FAFC';
        const fSize = el.props.fontSize ?? 15;
        ctx.font = `600 ${fSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.textBaseline = 'middle';
        const padX = el.props.padding ?? 16;
        const textY = el.props.secondaryText ? el.y + el.height * 0.38 : el.y + el.height / 2;
        ctx.fillText(label, el.x + padX, textY, Math.max(20, el.width - padX * 2));

        if (el.props.secondaryText) {
          ctx.fillStyle = '#94A3B8';
          ctx.font = `400 12px "Plus Jakarta Sans", sans-serif`;
          ctx.fillText(
            el.props.secondaryText,
            el.x + padX,
            el.y + el.height * 0.66,
            Math.max(20, el.width - padX * 2)
          );
        }
      }
    }

    ctx.restore();
  }, [showExportModal, activeTab, project, activeScreen, pngScale]);

  if (!showExportModal || !project || !activeScreen) return null;

  const handleCopyText = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      addToast(t('export.copied'), 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addToast('Copy completed', 'info');
    }
  };

  const handleDownloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast(`Downloaded ${filename}`, 'success');
  };

  const handleDownloadPng = () => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `${toPascalCase(project.name)}_${pngScale}x.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    addToast(`Exported ${pngScale}x PNG (${canvas.width}×${canvas.height}px)`, 'success');
  };

  const handleSharePng = async () => {
    const canvas = canvasPreviewRef.current;
    if (!canvas) return;
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `${toPascalCase(project.name)}.png`, {
        type: 'image/png',
      });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            title: project.name,
            files: [file],
          });
          return;
        } catch {
          // Fallback to download
        }
      }
      handleDownloadPng();
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('export.title')}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-4"
    >
      <div className="w-full max-w-3xl max-h-[90vh] rounded-t-3xl sm:rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white">{t('export.title')}</h2>
            <p className="text-xs text-slate-400">
              {project.name} · {project.widthDp}×{project.heightDp}dp ·{' '}
              {project.materialVersion.toUpperCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowExportModal(false)}
            aria-label="Close Export Modal"
            className="min-w-[40px] min-h-[40px] rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Export Mode Tabs */}
        <div className="px-5 pt-3 border-b border-slate-800 flex items-center gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('kotlin')}
            className={`min-h-[42px] px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'kotlin'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>{t('export.kotlinTab')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('png')}
            className={`min-h-[42px] px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'png'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>{t('export.pngTab')}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`min-h-[42px] px-4 py-2 rounded-t-xl text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'json'
                ? 'border-indigo-500 text-indigo-300 bg-slate-950/50'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileJson className="w-4 h-4" />
            <span>{t('export.jsonTab')}</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'kotlin' && (
            <>
              {/* Codegen Options */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includePreview}
                    onChange={(e) => setIncludePreview(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>{t('export.includePreview')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeThemeWrapper}
                    onChange={(e) => setIncludeThemeWrapper(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>{t('export.includeTheme')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={generateInteractiveState}
                    onChange={(e) => setGenerateInteractiveState(e.target.checked)}
                    className="rounded border-slate-700 text-indigo-600"
                  />
                  <span>{t('export.includeState')}</span>
                </label>
              </div>

              {/* Code Preview */}
              <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <pre
                  data-testid="kotlin-code-output"
                  className="p-4 text-xs font-mono text-indigo-100 overflow-x-auto max-h-[360px] leading-relaxed"
                >
                  <code>{kotlinCode}</code>
                </pre>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleCopyText(kotlinCode)}
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? t('export.copied') : t('export.copyCode')}</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(
                      kotlinCode,
                      `${toPascalCase(project.name)}Screen.kt`,
                      'text/x-kotlin'
                    )
                  }
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('export.downloadKt')}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'png' && (
            <>
              <div className="flex items-center justify-between bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-medium text-slate-300">
                  Raster Export Density Scale
                </span>
                <div className="flex items-center gap-1.5">
                  {([1, 2, 3] as const).map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => setPngScale(scale)}
                      className={`min-h-[36px] px-3 rounded-lg text-xs font-mono font-semibold ${
                        pngScale === scale
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {scale}x ({project.widthDp * scale}×{project.heightDp * scale}px)
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center p-4 rounded-xl bg-slate-950 border border-slate-800 max-h-[340px] overflow-auto">
                <canvas
                  ref={canvasPreviewRef}
                  className="max-h-[300px] w-auto rounded-2xl shadow-xl border border-slate-800"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>
                    {t('export.downloadPng')} ({pngScale}x)
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSharePng}
                  className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{t('export.sharePng')}</span>
                </button>
              </div>
            </>
          )}

          {activeTab === 'json' && (
            <>
              <div className="rounded-xl bg-slate-950 border border-slate-800 overflow-hidden">
                <pre className="p-4 text-xs font-mono text-emerald-200 overflow-x-auto max-h-[340px]">
                  <code>{jsonContent}</code>
                </pre>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleCopyText(jsonContent)}
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    handleDownloadFile(
                      jsonContent,
                      `${toPascalCase(project.name)}.composestudio.json`,
                      'application/json'
                    )
                  }
                  className="flex-1 min-h-[46px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('export.downloadJson')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
