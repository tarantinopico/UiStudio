import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignHorizontalSpaceAround,
  AlignStartHorizontal,
  AlignStartVertical,
  AlignVerticalSpaceAround,
  BatteryCharging,
  BookmarkPlus,
  CheckSquare,
  Copy,
  FolderPlus,
  Grid,
  Layers,
  Maximize2,
  Move,
  Ruler,
  Signal,
  Sparkles,
  Trash2,
  Wifi,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { calculatePositionSnap, snapValueToGrid } from '../../lib/grid/gridMath';
import { WidgetRenderer } from './WidgetRenderer';
import type { ComposeElement } from '../../types/models';

type ResizeHandle = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

interface DragSession {
  mode: 'move' | 'resize' | 'pan';
  elementId?: string;
  groupIds?: string[];
  handle?: ResizeHandle;
  startClientX: number;
  startClientY: number;
  initialX: number;
  initialY: number;
  initialW: number;
  initialH: number;
  appliedDeltaX: number;
  appliedDeltaY: number;
  hasMoved: boolean;
}

export const CanvasWorkspace: React.FC = () => {
  const { t } = useTranslation();
  const {
    project,
    selectedIds,
    multiSelectMode,
    pendingGroupMoveIds,
    zoom,
    panX,
    panY,
    showStatusBar,
    showNavBar,
    showSafeArea,
    showRulers,
    activeSnapLines,
    selectElement,
    toggleMultiSelectMode,
    updateElementGeometry,
    moveElementsByDelta,
    completePendingGroupMove,
    createGroupTemplateFromSelection,
    pushHistory,
    setViewport,
    resetViewport,
    toggleOverlay,
    setActiveSnapLines,
    alignSelected,
    distributeSelected,
    duplicateSelected,
    groupSelectedInBox,
    deleteSelected,
    runAutoLayout,
    addGuide,
    removeGuide,
  } = useEditorStore();

  const {
    helperLines,
    unitDisplay,
    triggerHaptic,
    addToast,
    saveCustomWidgetGroup,
  } = useUIStore();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragSessionRef = useRef<DragSession | null>(null);
  const longPressTimerRef = useRef<number | null>(null);
  const activePointersRef = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchMidpointRef = useRef<{ x: number; y: number } | null>(null);

  const [panToolActive, setPanToolActive] = useState(false);

  if (!project) return null;

  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) ?? project.screens[0];
  const isPro = project.editorMode === 'pro';
  const isGridMode = project.layoutMode === 'grid';

  const formatUnit = (dp: number) =>
    unitDisplay === 'px' ? `${Math.round(dp * 2.75)}px` : `${Math.round(dp)}dp`;

  // Start dragging or resizing a single element or a selected group
  const startElementPointerDown = (
    e: React.PointerEvent,
    element: ComposeElement,
    handle?: ResizeHandle
  ) => {
    e.stopPropagation();
    if (panToolActive || activePointersRef.current.size >= 2) return;

    // Long press detection for multi-select on touch
    if (!handle) {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = window.setTimeout(() => {
        triggerHaptic(20);
        toggleMultiSelectMode(true);
        selectElement(element.id, true);
        addToast('Multi-Select Mode Active', 'info');
      }, 520);
    }

    const isAdditive = e.shiftKey || e.metaKey || multiSelectMode;
    let activeGroupIds = selectedIds;

    if (!selectedIds.includes(element.id) || isAdditive) {
      selectElement(element.id, isAdditive);
      activeGroupIds = isAdditive
        ? selectedIds.includes(element.id)
          ? selectedIds
          : [...selectedIds, element.id]
        : [element.id];
    }

    if (element.locked) return;

    dragSessionRef.current = {
      mode: handle ? 'resize' : 'move',
      elementId: element.id,
      groupIds: !handle && activeGroupIds.length > 1 ? activeGroupIds : undefined,
      handle,
      startClientX: e.clientX,
      startClientY: e.clientY,
      initialX: element.x,
      initialY: element.y,
      initialW: element.width,
      initialH: element.height,
      appliedDeltaX: 0,
      appliedDeltaY: 0,
      hasMoved: false,
    };
  };

  // Multi-touch pinch-zoom & two-finger pan + pointer move handler
  const handleWorkspacePointerDown = (e: React.PointerEvent) => {
    activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointersRef.current.size === 2) {
      if (longPressTimerRef.current) window.clearTimeout(longPressTimerRef.current);
      dragSessionRef.current = null;
      setActiveSnapLines([]);

      const pts = Array.from(activePointersRef.current.values());
      const dx = pts[1].x - pts[0].x;
      const dy = pts[1].y - pts[0].y;
      pinchDistanceRef.current = Math.hypot(dx, dy);
      pinchMidpointRef.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
      };
      return;
    }

    if (panToolActive || e.button === 1) {
      dragSessionRef.current = {
        mode: 'pan',
        startClientX: e.clientX,
        startClientY: e.clientY,
        initialX: panX,
        initialY: panY,
        initialW: 0,
        initialH: 0,
        appliedDeltaX: 0,
        appliedDeltaY: 0,
        hasMoved: false,
      };
    } else if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).dataset.canvasBg === 'true'
    ) {
      selectElement(null);
    }
  };

  const handleWorkspacePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (activePointersRef.current.has(e.pointerId)) {
        activePointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }

      // Two-finger pinch zoom & pan
      if (activePointersRef.current.size === 2) {
        const pts = Array.from(activePointersRef.current.values());
        const dist = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y);
        const mid = {
          x: (pts[0].x + pts[1].x) / 2,
          y: (pts[0].y + pts[1].y) / 2,
        };

        if (pinchDistanceRef.current && pinchMidpointRef.current) {
          const scaleDelta = dist / pinchDistanceRef.current;
          const newZoom = Math.max(0.35, Math.min(2.2, zoom * scaleDelta));
          const dx = mid.x - pinchMidpointRef.current.x;
          const dy = mid.y - pinchMidpointRef.current.y;
          setViewport({
            zoom: newZoom,
            panX: panX + dx,
            panY: panY + dy,
          });
        }
        pinchDistanceRef.current = dist;
        pinchMidpointRef.current = mid;
        return;
      }

      const session = dragSessionRef.current;
      if (!session) return;

      const deltaScreenX = e.clientX - session.startClientX;
      const deltaScreenY = e.clientY - session.startClientY;

      if (Math.abs(deltaScreenX) > 4 || Math.abs(deltaScreenY) > 4) {
        if (longPressTimerRef.current) {
          window.clearTimeout(longPressTimerRef.current);
          longPressTimerRef.current = null;
        }
        if (!session.hasMoved) {
          session.hasMoved = true;
          if (session.mode !== 'pan') {
            pushHistory(
              session.mode === 'move'
                ? session.groupIds
                  ? 'Move widget group'
                  : 'Move widget'
                : 'Resize widget'
            );
          }
        }
      }

      if (!session.hasMoved) return;

      if (session.mode === 'pan') {
        setViewport({
          panX: session.initialX + deltaScreenX,
          panY: session.initialY + deltaScreenY,
        });
        return;
      }

      const deltaDpX = deltaScreenX / zoom;
      const deltaDpY = deltaScreenY / zoom;

      if (session.mode === 'move' && session.elementId) {
        const rawX = session.initialX + deltaDpX;
        const rawY = session.initialY + deltaDpY;

        const effectiveGridSettings = {
          ...project.gridSettings,
          snapToGrid: project.layoutMode === 'grid' || project.gridSettings.snapToGrid,
        };

        const snapResult = calculatePositionSnap(
          {
            id: session.elementId,
            x: rawX,
            y: rawY,
            width: session.initialW,
            height: session.initialH,
          },
          activeScreen.elements.filter(
            (el) => !(session.groupIds && session.groupIds.includes(el.id))
          ),
          activeScreen.guides,
          project.widthDp,
          project.heightDp,
          effectiveGridSettings
        );

        if (snapResult.snappedX || snapResult.snappedY) {
          triggerHaptic(6);
        }

        if (helperLines) {
          setActiveSnapLines(snapResult.snapLines);
        }

        if (session.groupIds && session.groupIds.length > 1) {
          const totalSnappedDeltaX = snapResult.x - session.initialX;
          const totalSnappedDeltaY = snapResult.y - session.initialY;
          const stepDx = totalSnappedDeltaX - session.appliedDeltaX;
          const stepDy = totalSnappedDeltaY - session.appliedDeltaY;
          if (stepDx !== 0 || stepDy !== 0) {
            moveElementsByDelta(session.groupIds, stepDx, stepDy);
            session.appliedDeltaX = totalSnappedDeltaX;
            session.appliedDeltaY = totalSnappedDeltaY;
          }
        } else {
          updateElementGeometry(session.elementId, {
            x: snapResult.x,
            y: snapResult.y,
          });
        }
      } else if (session.mode === 'resize' && session.elementId && session.handle) {
        const h = session.handle;
        let newX = session.initialX;
        let newY = session.initialY;
        let newW = session.initialW;
        let newH = session.initialH;

        if (h.includes('e')) newW = Math.max(24, session.initialW + deltaDpX);
        if (h.includes('s')) newH = Math.max(20, session.initialH + deltaDpY);
        if (h.includes('w')) {
          const proposedW = Math.max(24, session.initialW - deltaDpX);
          newX = session.initialX + (session.initialW - proposedW);
          newW = proposedW;
        }
        if (h.includes('n')) {
          const proposedH = Math.max(20, session.initialH - deltaDpY);
          newY = session.initialY + (session.initialH - proposedH);
          newH = proposedH;
        }

        const step = isGridMode ? project.gridSettings.sizeDp : 2;
        updateElementGeometry(session.elementId, {
          x: snapValueToGrid(newX, step),
          y: snapValueToGrid(newY, step),
          width: snapValueToGrid(newW, step),
          height: snapValueToGrid(newH, step),
        });
      }
    },
    [
      activeScreen.elements,
      activeScreen.guides,
      helperLines,
      isGridMode,
      moveElementsByDelta,
      panX,
      panY,
      project.gridSettings,
      project.heightDp,
      project.layoutMode,
      project.widthDp,
      pushHistory,
      setActiveSnapLines,
      setViewport,
      triggerHaptic,
      updateElementGeometry,
      zoom,
    ]
  );

  const handleWorkspacePointerUp = (e: React.PointerEvent) => {
    activePointersRef.current.delete(e.pointerId);
    if (activePointersRef.current.size < 2) {
      pinchDistanceRef.current = null;
      pinchMidpointRef.current = null;
    }
    if (longPressTimerRef.current) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    const session = dragSessionRef.current;
    if (session) {
      const movedPendingGroup =
        session.hasMoved &&
        session.mode === 'move' &&
        pendingGroupMoveIds.length > 0 &&
        session.elementId &&
        pendingGroupMoveIds.includes(session.elementId);

      dragSessionRef.current = null;
      setActiveSnapLines([]);

      if (movedPendingGroup) {
        completePendingGroupMove();
        triggerHaptic(14);
        addToast('Group positioned & ungrouped into individual widgets', 'info');
      }
    }
  };

  // Keyboard shortcuts for Undo/Redo/Delete/Copy/Paste on tablets/desktops
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          useEditorStore.getState().redo();
        } else {
          useEditorStore.getState().undo();
        }
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (useEditorStore.getState().selectedIds.length > 0) {
          e.preventDefault();
          useEditorStore.getState().deleteSelected();
        }
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        useEditorStore.getState().duplicateSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const visibleElements = activeScreen.elements.filter((el) => !el.hidden);

  const screenBgStyle: React.CSSProperties =
    activeScreen.useGradientBg && activeScreen.gradientEndColor
      ? {
          backgroundImage: `linear-gradient(${activeScreen.gradientAngle ?? 145}deg, ${
            activeScreen.backgroundColor || '#0F172A'
          }, ${activeScreen.gradientEndColor})`,
        }
      : {
          backgroundColor: activeScreen.backgroundColor || '#0F172A',
        };

  return (
    <div
      ref={containerRef}
      data-testid="compose-canvas-workspace"
      data-canvas-bg="true"
      onPointerDown={handleWorkspacePointerDown}
      onPointerMove={handleWorkspacePointerMove}
      onPointerUp={handleWorkspacePointerUp}
      onPointerCancel={handleWorkspacePointerUp}
      className="relative flex-1 w-full h-full bg-slate-950 overflow-hidden select-none touch-none flex items-center justify-center"
      style={{
        backgroundImage:
          'radial-gradient(rgba(148, 163, 184, 0.14) 1px, transparent 1px)',
        backgroundSize: '20px 20px',
      }}
    >
      {/* Top Floating Alignment & Multi-Select Contextual Bar */}
      <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Layout & Multi-select controls */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg pointer-events-auto">
          <button
            type="button"
            onClick={() => toggleMultiSelectMode()}
            aria-label={t('editor.multiSelect')}
            className={`min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              multiSelectMode
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('editor.multiSelect')}</span>
            {selectedIds.length > 0 && (
              <span className="font-mono text-[11px] opacity-90">({selectedIds.length})</span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              runAutoLayout();
              addToast(t('editor.autoLayoutToast'), 'success');
            }}
            aria-label={t('editor.autoLayout')}
            className="min-h-[38px] px-2.5 py-1 rounded-lg text-xs font-medium text-indigo-300 hover:bg-indigo-500/20 flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t('editor.autoLayout')}</span>
          </button>
        </div>

        {/* Pending Group Move Indicator Banner */}
        {pendingGroupMoveIds.length > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-medium shadow-lg pointer-events-auto">
            <Layers className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>
              Group Move Active ({pendingGroupMoveIds.length} widgets) — Drag once to position together, then auto-ungroups
            </span>
          </div>
        )}

        {/* Center/Right: Alignment & Distribution Toolbar (accessible when ≥1 selected) */}
        {selectedIds.length >= 1 && (
          <div className="flex items-center gap-1 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-xl pointer-events-auto overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => alignSelected('left')}
              aria-label="Align Left"
              title="Align Left"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignStartVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('centerH')}
              aria-label="Align Center Horizontally"
              title="Align Center Horizontally"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignCenterVertical className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('right')}
              aria-label="Align Right"
              title="Align Right"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignEndVertical className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => alignSelected('top')}
              aria-label="Align Top"
              title="Align Top"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignStartHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('centerV')}
              aria-label="Align Middle Vertically"
              title="Align Middle Vertically"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignCenterHorizontal className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => alignSelected('bottom')}
              aria-label="Align Bottom"
              title="Align Bottom"
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <AlignEndHorizontal className="w-4 h-4" />
            </button>

            {selectedIds.length >= 3 && (
              <>
                <div className="w-px h-4 bg-slate-800 mx-0.5" />
                <button
                  type="button"
                  onClick={() => distributeSelected('horizontal')}
                  aria-label="Distribute Horizontally"
                  title="Distribute Horizontally"
                  className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-indigo-300 hover:bg-slate-800"
                >
                  <AlignHorizontalSpaceAround className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => distributeSelected('vertical')}
                  aria-label="Distribute Vertically"
                  title="Distribute Vertically"
                  className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-indigo-300 hover:bg-slate-800"
                >
                  <AlignVerticalSpaceAround className="w-4 h-4" />
                </button>
              </>
            )}

            <div className="w-px h-4 bg-slate-800 mx-0.5" />
            <button
              type="button"
              onClick={() => duplicateSelected()}
              aria-label={t('editor.duplicate')}
              title={t('editor.duplicate')}
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
            >
              <Copy className="w-4 h-4" />
            </button>
            {selectedIds.length >= 2 && (
              <>
                <button
                  type="button"
                  onClick={() => {
                    groupSelectedInBox();
                    addToast('Grouped in Box composable', 'info');
                  }}
                  aria-label={t('editor.group')}
                  title="Wrap in Compose Box()"
                  className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-indigo-300 hover:bg-slate-800"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const tpl = createGroupTemplateFromSelection(
                      `Saved Group (${selectedIds.length})`,
                      'Custom'
                    );
                    if (tpl) {
                      saveCustomWidgetGroup(tpl);
                      triggerHaptic(12);
                      addToast(`Saved "${tpl.name}" to Widget Groups!`, 'success');
                    }
                  }}
                  aria-label="Save selection as reusable Widget Group"
                  title="Save selection as reusable Widget Group"
                  className="min-h-[36px] px-2 rounded-lg flex items-center gap-1 text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-semibold"
                >
                  <BookmarkPlus className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Save Group</span>
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => deleteSelected()}
              aria-label={t('editor.delete')}
              title={t('editor.delete')}
              className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-rose-400 hover:bg-rose-500/20"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Transformable Device Canvas Plane */}
      <div
        style={{
          transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
          transformOrigin: 'center center',
        }}
        className="relative transition-transform duration-75 ease-out"
      >
        {/* Pro Mode Horizontal Ruler (Top) */}
        {isPro && showRulers && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              const clickDp = Math.round((e.clientX - rect.left) / zoom);
              addGuide('vertical', clickDp);
            }}
            title="Click ruler to place vertical guide"
            style={{ width: `${project.widthDp}px` }}
            className="h-6 -mt-7 mb-1 bg-slate-900/95 border border-slate-800 rounded-t-lg flex items-end relative cursor-crosshair overflow-hidden"
          >
            {Array.from({ length: Math.ceil(project.widthDp / 50) + 1 }).map((_, idx) => {
              const dpVal = idx * 50;
              return (
                <div
                  key={dpVal}
                  style={{ left: `${dpVal}px` }}
                  className="absolute bottom-0 h-3 border-l border-slate-600 pl-1 text-[9px] font-mono text-slate-400 leading-none"
                >
                  {dpVal}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex items-start">
          {/* Pro Mode Vertical Ruler (Left) */}
          {isPro && showRulers && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                const rect = e.currentTarget.getBoundingClientRect();
                const clickDp = Math.round((e.clientY - rect.top) / zoom);
                addGuide('horizontal', clickDp);
              }}
              title="Click ruler to place horizontal guide"
              style={{ height: `${project.heightDp}px` }}
              className="w-6 -ml-7 mr-1 bg-slate-900/95 border border-slate-800 rounded-l-lg relative cursor-crosshair overflow-hidden shrink-0"
            >
              {Array.from({ length: Math.ceil(project.heightDp / 50) + 1 }).map((_, idx) => {
                const dpVal = idx * 50;
                return (
                  <div
                    key={dpVal}
                    style={{ top: `${dpVal}px` }}
                    className="absolute right-0 w-3 border-t border-slate-600 pt-0.5 text-[8px] font-mono text-slate-400 leading-none"
                  >
                    {dpVal}
                  </div>
                );
              })}
            </div>
          )}

          {/* Device Screen Frame */}
          <div
            data-canvas-bg="true"
            style={{
              width: `${project.widthDp}px`,
              height: `${project.heightDp}px`,
              ...screenBgStyle,
            }}
            className="relative rounded-[36px] shadow-[0_0_0_10px_#1e293b,0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden"
          >
            {/* Optional Grid & Column Overlay */}
            {(isGridMode || (isPro && project.gridSettings.enabled)) && (
              <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{
                  backgroundImage: `linear-gradient(to right, rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(99,102,241,0.08) 1px, transparent 1px)`,
                  backgroundSize: `${project.gridSettings.sizeDp}px ${project.gridSettings.sizeDp}px`,
                }}
              >
                {/* Column Guides */}
                {isPro && project.gridSettings.columns > 0 && (
                  <div
                    style={{
                      paddingLeft: `${project.gridSettings.marginDp}px`,
                      paddingRight: `${project.gridSettings.marginDp}px`,
                      gap: `${project.gridSettings.gutterDp}px`,
                    }}
                    className="w-full h-full flex"
                  >
                    {Array.from({ length: project.gridSettings.columns }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 h-full bg-indigo-500/[0.03] border-x border-indigo-500/10"
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Safe Area Inset Overlay */}
            {showSafeArea && (
              <div className="absolute inset-x-4 top-7 bottom-6 border border-dashed border-amber-400/50 rounded-2xl pointer-events-none z-30 flex items-start justify-end p-1.5">
                <span className="text-[9px] font-mono text-amber-300 bg-slate-950/80 px-1.5 py-0.5 rounded">
                  WindowInsets.safeDrawing
                </span>
              </div>
            )}

            {/* User-placed Pro Guides */}
            {isPro &&
              activeScreen.guides.map((g) => (
                <div
                  key={g.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeGuide(g.id);
                  }}
                  title="Click to remove guide"
                  style={
                    g.axis === 'vertical'
                      ? { left: `${g.positionDp}px`, top: 0, bottom: 0, width: '1px' }
                      : { top: `${g.positionDp}px`, left: 0, right: 0, height: '1px' }
                  }
                  className="absolute bg-cyan-400/80 z-30 cursor-pointer group"
                >
                  <span className="px-1 py-0.5 rounded bg-cyan-500 text-slate-950 font-mono text-[9px] font-bold opacity-85 group-hover:opacity-100">
                    {g.positionDp}dp ×
                  </span>
                </div>
              ))}

            {/* Active Dynamic Snap Helper Lines */}
            {activeSnapLines.map((line, idx) => (
              <div
                key={idx}
                style={
                  line.axis === 'vertical'
                    ? { left: `${line.positionDp}px`, top: 0, bottom: 0, width: '1.5px' }
                    : { top: `${line.positionDp}px`, left: 0, right: 0, height: '1.5px' }
                }
                className="absolute bg-fuchsia-500 z-40 pointer-events-none"
              >
                {line.label && (
                  <span className="absolute top-2 left-1 px-1.5 py-0.5 rounded bg-fuchsia-600 text-white font-mono text-[9px] whitespace-nowrap">
                    {line.label}
                  </span>
                )}
              </div>
            ))}

            {/* Compose Elements Layer */}
            {visibleElements.map((element) => {
              const isSelected = selectedIds.includes(element.id);
              const isPendingGroupMember = pendingGroupMoveIds.includes(element.id);
              return (
                <div
                  key={element.id}
                  data-testid={`canvas-element-${element.type}`}
                  onPointerDown={(e) => startElementPointerDown(e, element)}
                  style={{
                    left: `${element.x}px`,
                    top: `${element.y}px`,
                    width: `${element.width}px`,
                    height: `${element.height}px`,
                    zIndex: element.zIndex,
                    opacity: element.props.alpha ?? 1,
                  }}
                  className={`absolute transition-shadow ${
                    element.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
                  } ${
                    isPendingGroupMember
                      ? 'ring-2 ring-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]'
                      : isSelected
                        ? 'ring-2 ring-indigo-400 shadow-[0_0_0_4px_rgba(99,102,241,0.2)]'
                        : 'hover:ring-1 hover:ring-indigo-400/50'
                  }`}
                >
                  <WidgetRenderer
                    element={element}
                    materialVersion={project.materialVersion}
                    projectTheme={project.theme}
                    isSelected={isSelected}
                  />

                  {/* Selection Coordinate Badge & 8-Point Resize Handles */}
                  {isSelected && !element.locked && (
                    <>
                      <div
                        className={`absolute -top-6 left-0 px-1.5 py-0.5 rounded text-white font-mono text-[10px] whitespace-nowrap shadow pointer-events-none z-50 ${
                          isPendingGroupMember ? 'bg-emerald-600' : 'bg-indigo-600'
                        }`}
                      >
                        {element.name} · {formatUnit(element.width)}×{formatUnit(element.height)} (
                        {formatUnit(element.x)}, {formatUnit(element.y)})
                      </div>

                      {selectedIds.length === 1 &&
                        (['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as ResizeHandle[]).map(
                          (handle) => {
                            const posClasses: Record<ResizeHandle, string> = {
                              nw: '-top-2 -left-2 cursor-nwse-resize',
                              n: '-top-2 left-1/2 -translate-x-1/2 cursor-ns-resize',
                              ne: '-top-2 -right-2 cursor-nesw-resize',
                              e: 'top-1/2 -translate-y-1/2 -right-2 cursor-ew-resize',
                              se: '-bottom-2 -right-2 cursor-nwse-resize',
                              s: '-bottom-2 left-1/2 -translate-x-1/2 cursor-ns-resize',
                              sw: '-bottom-2 -left-2 cursor-nesw-resize',
                              w: 'top-1/2 -translate-y-1/2 -left-2 cursor-ew-resize',
                            };
                            return (
                              <div
                                key={handle}
                                onPointerDown={(e) =>
                                  startElementPointerDown(e, element, handle)
                                }
                                className={`absolute w-4 h-4 rounded-full bg-white border-2 border-indigo-600 shadow z-50 ${posClasses[handle]}`}
                              />
                            );
                          }
                        )}
                    </>
                  )}
                </div>
              );
            })}

            {/* Android Status Bar Overlay */}
            {showStatusBar && (
              <div className="absolute top-0 inset-x-0 h-7 px-5 flex items-center justify-between text-[11px] font-medium text-slate-200/90 pointer-events-none z-30">
                <span className="font-mono">09:41</span>
                <div className="w-3.5 h-3.5 rounded-full bg-black/80 border border-slate-700/60" />
                <div className="flex items-center gap-1.5">
                  <Signal className="w-3 h-3" />
                  <Wifi className="w-3 h-3" />
                  <BatteryCharging className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            {/* Android Gesture Navigation Pill Bar Overlay */}
            {showNavBar && (
              <div className="absolute bottom-0 inset-x-0 h-6 flex items-center justify-center pointer-events-none z-30">
                <div className="w-28 h-1 rounded-full bg-white/50" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom-Right Viewport Zoom, Pan, and Overlay Controls */}
      <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-xl p-1 shadow-lg">
        <button
          type="button"
          onClick={() => setPanToolActive(!panToolActive)}
          aria-label="Toggle Pan Hand Tool"
          title="Pan Canvas Tool"
          className={`min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center transition-colors ${
            panToolActive
              ? 'bg-indigo-600 text-white'
              : 'text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Move className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() =>
            useEditorStore.getState().updateGridSettings({
              enabled: !project.gridSettings.enabled,
            })
          }
          aria-label="Toggle Grid Lines"
          title="Toggle Grid Lines"
          className={`min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center transition-colors ${
            project.gridSettings.enabled
              ? 'text-indigo-400 bg-indigo-500/15'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>

        {isPro && (
          <button
            type="button"
            onClick={() => toggleOverlay('rulers')}
            aria-label={t('editor.rulers')}
            title={t('editor.rulers')}
            className={`min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center transition-colors ${
              showRulers
                ? 'text-indigo-400 bg-indigo-500/15'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Ruler className="w-4 h-4" />
          </button>
        )}

        <div className="w-px h-4 bg-slate-800 mx-0.5" />

        <button
          type="button"
          onClick={() => setViewport({ zoom: zoom - 0.12 })}
          aria-label={t('editor.zoomOut')}
          className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={resetViewport}
          aria-label={t('editor.resetView')}
          className="min-h-[36px] px-2 rounded-lg font-mono text-xs text-slate-200 hover:bg-slate-800"
        >
          {Math.round(zoom * 100)}%
        </button>

        <button
          type="button"
          onClick={() => setViewport({ zoom: zoom + 0.12 })}
          aria-label={t('editor.zoomIn')}
          className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={resetViewport}
          aria-label="Center Canvas"
          title="Center Canvas"
          className="min-w-[36px] min-h-[36px] rounded-lg flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
