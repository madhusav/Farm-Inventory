import React, { useState, useEffect } from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Wifi, Check, X, HardDrive } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const { t, localeText } = useLanguage();

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
            {`🟢 ${t('backOnline', 'Back Online — Internet Reconnected')}`}
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
              <span>{t('offlineMode', 'Offline Farm Mode Active')}</span>
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
            {localeText({
              en: 'No internet connection in the field. All vaccinations, animal records, and weights are safely cached on this device.',
              hi: 'खेत या बाड़े में इंटरनेट नहीं है। आपके सभी टीके, वजन और पशु रिकॉर्ड मोबाइल में सुरक्षित सेव हो रहे हैं।',
              kn: 'ಹೊಲದಲ್ಲಿ ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲ. ಎಲ್ಲಾ ಲಸಿಕೆಗಳು ಮತ್ತು ಪ್ರಾಣಿಗಳ ವಿವರಗಳು ಮೊಬೈಲ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿವೆ.',
              te: 'పొలంలో ఇంటర్నెట్ లేదు. మీ అన్ని టీకాలు, బరువులు మరియు జీవాల రికార్డులు సురక్షితంగా భద్రపరచబడ్డాయి.',
              ta: 'பண்ணையில் இணைய இணைப்பு இல்லை. அனைத்து தடுப்பூசிகள் மற்றும் கால்நடை பதிவுகள் மொபைலில் பாதுகாப்பாக உள்ளன.',
              ml: 'ഫാമിൽ ഇന്റർനെറ്റ് ലഭ്യമല്ല. എല്ലാ വാക്സിനുകളും മൃഗങ്ങളുടെ രേഖകളും മൊബൈലിൽ സുരക്ഷിതമാണ്.',
              mr: 'शेतात किंवा गोठ्यात इंटरनेट नाही. सर्व लसीकरण, वजन व जनावरांची नोंद मोबाईलमध्ये सुरक्षित आहे.'
            })}
          </p>

          <div className="mt-2 flex items-center gap-2 text-[10px] text-emerald-300 font-bold">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span>
              {localeText({
                en: 'Local Storage Cache: 100% Functional',
                hi: 'लोकल स्टोरेज सुरक्षित है',
                kn: 'ಲೋಕಲ್ ಸ್ಟೋರೇಜ್ ಸುರಕ್ಷಿತವಾಗಿದೆ',
                te: 'లోకల్ స్టోరేజ్ సురక్షితం',
                ta: 'உள்ளூர் சேமிப்பு பாதுகாப்பானது',
                ml: 'ലോക്കൽ സ്റ്റോറേജ് സുരക്ഷിതം',
                mr: 'स्थानिक मेमरी सुरक्षित आहे'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
