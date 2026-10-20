/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import './lib/i18n';
import { useProjectStore } from './store/projectStore';
import { useEditorStore } from './store/editorStore';
import { useUIStore } from './store/uiStore';
import { HomeView } from './features/home/HomeView';
import { EditorView } from './features/editor/EditorView';
import { ExportModal } from './features/export/ExportModal';
import { SettingsModal } from './features/settings/SettingsModal';
import { ThemeStudioModal } from './features/settings/ThemeStudioModal';
import { OfflineIndicator } from './components/ui/PWAInstallButton';

export default function App() {
  const { projects, hydrateProjects } = useProjectStore();
  const { project, loadProject } = useEditorStore();
  const { activeView, setActiveView, toasts, removeToast } = useUIStore();

  useEffect(() => {
    hydrateProjects().then(() => {
      // Support ?autostart=1 to jump directly into the active Compose editor canvas
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('autostart') === '1') {
          const initial = useProjectStore.getState().projects[0];
          if (initial) {
            loadProject(initial);
            setActiveView('editor');
          }
        }
      }
    });
  }, [hydrateProjects, loadProject, setActiveView]);

  // Ensure editor always has a valid project loaded if activeView === 'editor'
  useEffect(() => {
    if (activeView === 'editor' && !project && projects.length > 0) {
      loadProject(projects[0]);
    }
  }, [activeView, project, projects, loadProject]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 relative">
      {activeView === 'editor' && project ? <EditorView /> : <HomeView />}

      {/* Modals */}
      <ExportModal />
      <SettingsModal />
      <ThemeStudioModal />

      {/* Toast Feedback Stack */}
      {toasts.length > 0 && (
        <div
          aria-live="polite"
          className="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        >
          {toasts.map((t) => (
            <div
              key={t.id}
              onClick={() => removeToast(t.id)}
              className="pointer-events-auto px-4 py-2.5 rounded-xl bg-slate-900/95 border border-indigo-500/40 text-xs font-medium text-white shadow-xl backdrop-blur-md"
            >
              {t.title}
            </div>
          ))}
        </div>
      )}

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
