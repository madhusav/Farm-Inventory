import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Check, Share2, PlusSquare } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ 
  variant = 'compact',
  className = '' 
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  // If already running as an installed standalone PWA, suppress the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    if (variant === 'full') {
      return (
        <button
          onClick={install}
          className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer active:scale-98 ${className}`}
        >
          <Download className="w-4 h-4 text-emerald-200" />
          <span>{isHi ? '📲 ऐप फ़ोन में इनस्टॉल करें (Offline App)' : '📲 Install Offline App on Phone'}</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${className}`}
        title={isHi ? 'फ़ोन में ऐप इंस्टॉल करें' : 'Install App for Offline Use'}
      >
        <Download className="w-3.5 h-3.5 text-emerald-300" />
        <span className="hidden sm:inline">{isHi ? 'ऐप इंस्टॉल करें' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        {variant === 'full' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border-2 border-emerald-700 bg-emerald-50 text-emerald-950 text-xs font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer ${className}`}
          >
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>{isHi ? '📲 iPhone/iPad में इंस्टॉल करें' : '📲 Install on iPhone / iPad'}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${className}`}
            title="Install on iPhone / iPad"
          >
            <Smartphone className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Install</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <h3 className="text-base font-black text-stone-900">
                    {isHi ? 'iPhone / iPad में इंस्टॉल करें' : 'Install on iPhone / iPad'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-700">
                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <Share2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold">1. Tap the Share button</strong>
                    <span>At the bottom of your Safari browser window.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
                  <PlusSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-stone-900 font-bold">2. Tap 'Add to Home Screen'</strong>
                    <span>Scroll down and select 'Add to Home Screen' (होम स्क्रीन पर जोड़ें).</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                {isHi 
                  ? 'होम स्क्रीन पर जोड़ने के बाद, यह ऐप खेत में बिना इंटरनेट के भी पूरी तरह काम करेगा।' 
                  : 'Once added, the app will launch like a native application and remain functional offline without internet.'}
              </p>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                {isHi ? 'समझ गया (Done)' : 'Got it!'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
