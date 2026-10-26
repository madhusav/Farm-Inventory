import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, Check, X, HardDrive } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { lang } = useLanguage();
  const isHi = lang === 'hi';

  const [dismissed, setDismissed] = useState(false);
  const [showReconnected, setShowReconnected] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true);
      setDismissed(false);
    } else if (wasOffline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setWasOffline(false);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline, wasOffline]);

  if (showReconnected) {
    return (
      <div className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:left-auto sm:right-4 z-50 animate-in fade-in slide-in-from-bottom duration-300">
        <div className="bg-emerald-900 text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-emerald-400 flex items-center gap-2.5 text-xs font-black">
          <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
            <Wifi className="w-3.5 h-3.5" />
          </div>
          <span>
            {isHi ? '🟢 इंटरनेट जुड़ गया (Back Online)' : '🟢 Back Online — Internet Reconnected'}
          </span>
        </div>
      </div>
    );
  }

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-4 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom duration-300">
      <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border-2 border-amber-500/80 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
          <WifiOff className="w-4 h-4 animate-pulse" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <span>{isHi ? 'ऑफ़लाइन मोड (बिना इंटरनेट)' : 'Offline Farm Mode Active'}</span>
            </span>
            <button
              onClick={() => setDismissed(true)}
              className="text-stone-400 hover:text-white p-0.5 cursor-pointer"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-stone-200 mt-1 leading-snug">
            {isHi 
              ? 'खेत या बाड़े में इंटरनेट नहीं है। आपके सभी टीके, वजन और पशु रिकॉर्ड मोबाइल में सुरक्षित सेव हो रहे हैं।' 
              : 'No internet connection in the field. All vaccinations, animal records, and weights are safely cached on this device.'}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-300 font-bold">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>{isHi ? 'लोकल स्टोरेज सुरक्षित है' : 'Local Storage Cache: 100% Functional'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
