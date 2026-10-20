import React, { useState } from 'react';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';
import { usePWAInstall } from '../../lib/pwa/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowIOSGuide(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        aria-label="Install ComposeStudio PWA"
        className={
          compact
            ? 'min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0'
            : 'w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-sm'
        }
      >
        <Download className="w-4 h-4 shrink-0" />
        <span>{compact ? 'Install App' : isIOS ? 'Install on iPhone / iPad' : 'Install ComposeStudio PWA'}</span>
      </button>

      {showIOSGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Install ComposeStudio as a Native App"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
        >
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold">Install ComposeStudio</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                aria-label="Close installation guide"
                className="min-w-[40px] min-h-[40px] rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              ComposeStudio works 100% offline as a standalone Android &amp; iOS touch studio:
            </p>
            <ol className="space-y-2.5 text-xs text-slate-300 mb-5">
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono flex items-center justify-center text-[11px] shrink-0">
                  1
                </span>
                <span>
                  Tap the browser <strong className="text-white">Share</strong> <Share className="w-3.5 h-3.5 inline mx-0.5" /> or Menu icon.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-indigo-400 font-mono flex items-center justify-center text-[11px] shrink-0">
                  2
                </span>
                <span>
                  Select <strong className="text-white">Add to Home Screen</strong> or <strong className="text-white">Install App</strong>.
                </span>
              </li>
            </ol>
            <button
              type="button"
              onClick={() => setShowIOSGuide(false)}
              className="w-full min-h-[44px] rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const OfflineIndicator: React.FC = () => {
  const { isOnline } = usePWAInstall();
  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-lg">
      <WifiOff className="w-3.5 h-3.5 shrink-0" />
      <span>Offline Mode · Changes saved to IndexedDB</span>
    </div>
  );
};
