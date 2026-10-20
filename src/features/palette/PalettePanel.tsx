import React, { useMemo, useState } from 'react';
import {
  Box,
  Compass,
  Edit3,
  FolderPlus,
  Layers,
  LayoutGrid,
  Loader,
  Palette,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Type,
} from 'lucide-react';
import { WIDGET_CATALOG } from '../../lib/palette/widgetCatalog';
import { renderWidgetTypeIcon } from '../../lib/icons/iconLibrary';
import { useEditorStore } from '../../store/editorStore';
import { useUIStore } from '../../store/uiStore';
import type {
  WidgetCategory,
  WidgetGroupTemplate,
  WidgetType,
} from '../../types/models';

const CATEGORY_TABS: {
  id: 'all' | WidgetCategory;
  label: string;
  icon: React.FC<{ className?: string }>;
}[] = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'layout', label: 'Layout', icon: LayoutGrid },
  { id: 'inputs', label: 'Controls', icon: Type },
  { id: 'surfaces', label: 'Surfaces', icon: Box },
  { id: 'navigation', label: 'Nav & Bars', icon: Compass },
  { id: 'feedback', label: 'Progress', icon: Loader },
];

export const PalettePanel: React.FC<{ onInserted?: () => void }> = ({ onInserted }) => {
  const {
    project,
    selectedIds,
    addWidget,
    insertWidgetGroup,
    createGroupTemplateFromSelection,
  } = useEditorStore();
  const {
    triggerHaptic,
    addToast,
    customWidgetGroups,
    getAllWidgetGroups,
    saveCustomWidgetGroup,
    renameCustomWidgetGroup,
    deleteCustomWidgetGroup,
  } = useUIStore();

  const [paletteSection, setPaletteSection] = useState<'widgets' | 'groups'>('widgets');
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | WidgetCategory>('all');

  // Group insertion & creation states
  const [groupColorMode, setGroupColorMode] = useState<'theme' | 'keep'>('theme');
  const [newGroupName, setNewGroupName] = useState('');
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroupName, setEditingGroupName] = useState('');

  const isSimpleMode = project?.editorMode === 'simple';

  const allGroups = useMemo(
    () => getAllWidgetGroups(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [customWidgetGroups]
  );

  const filteredWidgets = useMemo(() => {
    return WIDGET_CATALOG.filter((item) => {
      if (isSimpleMode && !item.simpleModeVisible && !search.trim()) {
        return false;
      }
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.label.toLowerCase().includes(q) ||
          item.type.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [activeCategory, isSimpleMode, search]);

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return allGroups;
    const q = search.toLowerCase();
    return allGroups.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q) ||
        g.category.toLowerCase().includes(q)
    );
  }, [allGroups, search]);

  const handleAddWidget = (type: WidgetType, label: string) => {
    addWidget(type);
    triggerHaptic(10);
    addToast(`Added ${label} to canvas`, 'success');
    if (onInserted) onInserted();
  };

  const handleInsertGroup = (group: WidgetGroupTemplate) => {
    const inserted = insertWidgetGroup(group, groupColorMode);
    if (inserted.length > 0) {
      triggerHaptic(14);
      addToast(
        `Inserted "${group.name}" — Drag once to move together, then auto-ungroups!`,
        'success'
      );
      if (onInserted) onInserted();
    }
  };

  const handleSaveSelectionAsGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      addToast('Select 1 or more widgets on the canvas first', 'error');
      return;
    }
    const nameToUse =
      newGroupName.trim() || `Custom Group (${selectedIds.length} widgets)`;
    const template = createGroupTemplateFromSelection(nameToUse, 'Custom');
    if (template) {
      saveCustomWidgetGroup(template);
      setNewGroupName('');
      triggerHaptic(12);
      addToast(`Saved group "${template.name}"`, 'success');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100">
      {/* Top Section Switcher: Widgets vs Groups */}
      <div className="p-3 border-b border-slate-800 space-y-2.5">
        <div className="grid grid-cols-2 p-0.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setPaletteSection('widgets')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              paletteSection === 'widgets'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Widgets (29)</span>
          </button>
          <button
            type="button"
            onClick={() => setPaletteSection('groups')}
            className={`py-2 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
              paletteSection === 'groups'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Groups ({allGroups.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              paletteSection === 'widgets'
                ? 'Search 29 Compose widgets...'
                : 'Search predefined & custom widget groups...'
            }
            aria-label="Search Compose widgets or groups"
            className="w-full min-h-[40px] pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {paletteSection === 'widgets' && (
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {CATEGORY_TABS.map((tab) => {
              const IconComp = tab.icon;
              const active = activeCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveCategory(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-colors min-h-[34px] ${
                    active
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800/70 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <IconComp className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* WIDGETS LIST */}
      {paletteSection === 'widgets' ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {isSimpleMode && !search.trim() && (
            <div className="px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-500/20 text-[11px] text-indigo-200 flex items-center justify-between">
              <span>Simple Mode: Essential M3 widgets shown</span>
              <span className="font-mono text-[10px] opacity-75">
                {filteredWidgets.length} items
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            {filteredWidgets.map((widget) => (
              <button
                key={widget.type}
                type="button"
                onClick={() => handleAddWidget(widget.type, widget.label)}
                className="group flex flex-col justify-between p-2.5 rounded-xl bg-slate-800/55 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/60 text-left transition-all active:scale-[0.98] min-h-[92px]"
              >
                <div className="flex items-start justify-between gap-1.5 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                      {renderWidgetTypeIcon(widget.type, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <span className="font-semibold text-xs text-slate-100 group-hover:text-indigo-200 truncate block">
                        {widget.label}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 truncate block">
                        {widget.defaultWidth}×{widget.defaultHeight}dp
                      </span>
                    </div>
                  </div>
                  <div className="w-6 h-6 rounded-lg bg-slate-900/90 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="mt-2 w-full">
                  <div className="text-[10px] font-mono text-indigo-300/80 bg-slate-950/75 px-2 py-0.5 rounded truncate border border-slate-800">
                    {widget.composeSignature}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredWidgets.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              No Compose widgets matching &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      ) : (
        /* WIDGET GROUPS & TEMPLATES SECTION */
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {/* Group Color Mode Picker */}
          <div className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-indigo-400" />
                <span>When Inserting Group:</span>
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setGroupColorMode('theme')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors ${
                  groupColorMode === 'theme'
                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Use Project Theme
              </button>
              <button
                type="button"
                onClick={() => setGroupColorMode('keep')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-medium border transition-colors ${
                  groupColorMode === 'keep'
                    ? 'bg-indigo-600/25 border-indigo-500 text-indigo-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                Keep Group Colors
              </button>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              Inserted groups move together as one unit on your first drag, then automatically split into individual editable widgets.
            </p>
          </div>

          {/* Save Current Selection as Group */}
          <form
            onSubmit={handleSaveSelectionAsGroup}
            className="p-2.5 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2"
          >
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-indigo-200 flex items-center gap-1.5">
                <FolderPlus className="w-3.5 h-3.5 text-indigo-400" />
                <span>Save Selection as Group</span>
              </span>
              <span className="font-mono text-[10px] text-indigo-300">
                {selectedIds.length} selected
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Group name (e.g. Custom Header)..."
                className="flex-1 min-h-[34px] px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={selectedIds.length === 0}
                className="min-h-[34px] px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs font-semibold shrink-0 transition-colors"
              >
                Save
              </button>
            </div>
          </form>

          {/* Group Cards */}
          <div className="space-y-2">
            {filteredGroups.map((group) => {
              const isEditing = editingGroupId === group.id;
              return (
                <div
                  key={group.id}
                  className="p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-indigo-500/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            value={editingGroupName}
                            onChange={(e) => setEditingGroupName(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                renameCustomWidgetGroup(group.id, editingGroupName);
                                setEditingGroupId(null);
                              }
                            }}
                            className="w-full px-2 py-1 rounded bg-slate-950 border border-indigo-500 text-xs text-white"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => {
                              renameCustomWidgetGroup(group.id, editingGroupName);
                              setEditingGroupId(null);
                            }}
                            className="px-2 py-1 rounded bg-indigo-600 text-[10px] font-semibold text-white"
                          >
                            OK
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-slate-100 truncate">
                            {group.name}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                              group.isBuiltIn
                                ? 'bg-slate-700/80 text-slate-300'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {group.isBuiltIn ? group.category : 'Custom'}
                          </span>
                        </div>
                      )}
                      <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                        {group.description}
                      </p>
                    </div>

                    {!group.isBuiltIn && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingGroupId(group.id);
                            setEditingGroupName(group.name);
                          }}
                          title="Rename group"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            deleteCustomWidgetGroup(group.id);
                            addToast(`Deleted group "${group.name}"`, 'info');
                          }}
                          title="Delete group"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview of contained widgets with icons */}
                  <div className="flex items-center flex-wrap gap-1 pt-0.5">
                    {group.elements.slice(0, 5).map((el, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-slate-300"
                      >
                        {renderWidgetTypeIcon(el.type, 'w-3 h-3 text-indigo-400')}
                        <span className="truncate max-w-[80px]">{el.name}</span>
                      </span>
                    ))}
                    {group.elements.length > 5 && (
                      <span className="text-[10px] font-mono text-slate-400 px-1">
                        +{group.elements.length - 5} more
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleInsertGroup(group)}
                    className="w-full min-h-[36px] py-1.5 px-3 rounded-lg bg-indigo-600/90 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>
                      Insert Group ({group.elements.length} widgets ·{' '}
                      {groupColorMode === 'theme' ? 'Theme Colors' : 'Original Colors'})
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
