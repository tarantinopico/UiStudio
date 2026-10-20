import React, { useMemo, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  BookmarkPlus,
  Edit3,
  Eye,
  EyeOff,
  FolderPlus,
  Layers,
  Lock,
  Trash2,
  Unlock,
} from 'lucide-react';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import { getWidgetDefinition } from '../../lib/palette/widgetCatalog';
import { renderWidgetTypeIcon } from '../../lib/icons/iconLibrary';

export const LayersPanel: React.FC = () => {
  const {
    project,
    selectedIds,
    selectElement,
    toggleLockElement,
    toggleHideElement,
    reorderElement,
    renameElement,
    nestElementInContainer,
    groupSelectedInBox,
    createGroupTemplateFromSelection,
    deleteSelected,
  } = useEditorStore();
  const { saveCustomWidgetGroup, addToast, triggerHaptic } = useUIStore();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [scrollOffset, setScrollOffset] = useState(0);

  if (!project) return null;

  const activeScreen =
    project.screens.find((s) => s.id === project.activeScreenId) ?? project.screens[0];
  const elements = activeScreen.elements;

  // Container options for nesting
  const containers = useMemo(
    () => elements.filter((el) => getWidgetDefinition(el.type).isContainer),
    [elements]
  );

  // Reverse order so top-most Z-index layers appear at the top of the list
  const orderedLayers = useMemo(() => [...elements].reverse(), [elements]);

  // Virtualize when > 200 items as required by technical spec
  const isVirtualized = orderedLayers.length > 200;
  const rowHeight = 52;
  const visibleSlice = isVirtualized
    ? orderedLayers.slice(
        Math.floor(scrollOffset / rowHeight),
        Math.floor(scrollOffset / rowHeight) + 25
      )
    : orderedLayers;

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const commitRename = (id: string) => {
    if (editName.trim()) {
      renameElement(id, editName.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Header Toolbar */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Screen Hierarchy ({elements.length})</span>
        </div>

        <div className="flex items-center gap-1">
          {selectedIds.length >= 1 && (
            <>
              <button
                type="button"
                onClick={() => {
                  const tpl = createGroupTemplateFromSelection(
                    `Custom Group (${selectedIds.length})`,
                    'Custom'
                  );
                  if (tpl) {
                    saveCustomWidgetGroup(tpl);
                    triggerHaptic(10);
                    addToast(`Saved "${tpl.name}" to Groups`, 'success');
                  }
                }}
                aria-label="Save Selected as Reusable Group"
                title="Save Selected as Reusable Group"
                className="min-h-[34px] px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-[11px] font-medium text-emerald-300 flex items-center gap-1"
              >
                <BookmarkPlus className="w-3.5 h-3.5" />
                <span>Save Group</span>
              </button>
              <button
                type="button"
                onClick={() => groupSelectedInBox()}
                aria-label="Group Selected in Box"
                title="Group Selected in Box"
                className="min-h-[34px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-indigo-300 flex items-center gap-1"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>Box</span>
              </button>
              <button
                type="button"
                onClick={() => deleteSelected()}
                aria-label="Delete Selected Layer"
                title="Delete Selected"
                className="min-w-[34px] min-h-[34px] rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Layer Tree List */}
      <div
        onScroll={(e) => {
          if (isVirtualized) {
            setScrollOffset(e.currentTarget.scrollTop);
          }
        }}
        className="flex-1 overflow-y-auto p-2 space-y-1"
      >
        {orderedLayers.length === 0 ? (
          <div className="py-12 px-4 text-center text-xs text-slate-500">
            No composables on this screen yet. Add widgets from the Palette.
          </div>
        ) : (
          visibleSlice.map((el) => {
            const isSelected = selectedIds.includes(el.id);
            const parent = elements.find((p) => p.id === el.parentId);

            return (
              <div
                key={el.id}
                onClick={(e) => selectElement(el.id, e.shiftKey || e.metaKey)}
                className={`min-h-[48px] px-2.5 py-1.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-indigo-600/20 border-indigo-500/60 text-white'
                    : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                } ${el.parentId ? 'ml-4' : ''}`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-indigo-400'
                    }`}
                  >
                    {renderWidgetTypeIcon(el.type, 'w-3.5 h-3.5')}
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    {editingId === el.id ? (
                      <input
                        type="text"
                        value={editName}
                        autoFocus
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => commitRename(el.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') commitRename(el.id);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="px-2 py-0.5 rounded bg-slate-950 border border-indigo-500 text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium truncate">{el.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          · {el.type}
                        </span>
                      </div>
                    )}

                    {parent && (
                      <span className="text-[10px] text-indigo-400/80 truncate">
                        inside {parent.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Layer Quick Controls */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-0.5 shrink-0"
                >
                  {project.editorMode === 'pro' && containers.length > 0 && (
                    <select
                      aria-label={`Container parent for ${el.name}`}
                      value={el.parentId ?? ''}
                      onChange={(e) =>
                        nestElementInContainer(el.id, e.target.value || null)
                      }
                      className="max-w-[78px] h-7 px-1 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 mr-1"
                    >
                      <option value="">Root</option>
                      {containers
                        .filter((c) => c.id !== el.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            ↳ {c.name}
                          </option>
                        ))}
                    </select>
                  )}

                  <button
                    type="button"
                    onClick={() => startRename(el.id, el.name)}
                    aria-label={`Rename ${el.name}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => reorderElement(el.id, 'up')}
                    aria-label={`Move ${el.name} forward`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => reorderElement(el.id, 'down')}
                    aria-label={`Move ${el.name} backward`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleLockElement(el.id)}
                    aria-label={el.locked ? `Unlock ${el.name}` : `Lock ${el.name}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      el.locked
                        ? 'text-amber-400 bg-amber-500/15'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {el.locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleHideElement(el.id)}
                    aria-label={el.hidden ? `Show ${el.name}` : `Hide ${el.name}`}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      el.hidden
                        ? 'text-rose-400 bg-rose-500/15'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {el.hidden ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
