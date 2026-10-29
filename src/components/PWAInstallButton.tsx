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
  const { t, localeText } = useLanguage();

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
          <span>📲 {t('pwaInstall', 'Install Offline App on Phone')}</span>
        </button>
      );
    }

    return (
      <button
        onClick={install}
        className={`min-h-[38px] px-2.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95 ${className}`}
        title={t('pwaInstall', 'Install App for Offline Use')}
      >
        <Download className="w-3.5 h-3.5 text-emerald-300" />
        <span className="hidden sm:inline">{t('pwaInstall', 'Install App')}</span>
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
            <span>📲 {localeText({
              en: 'Install on iPhone / iPad',
              hi: 'iPhone/iPad में इंस्टॉल करें',
              kn: 'iPhone/iPad ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
              te: 'iPhone/iPad లో ఇన్‌స్టాల్ చేయండి',
              ta: 'iPhone/iPad இல் நிறுவவும்',
              ml: 'iPhone/iPad ൽ ഇൻസ്റ്റാൾ ചെയ്യുക',
              mr: 'iPhone/iPad मध्ये इन्स्टॉल करा'
            })}</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer ${className}`}
            title="Install on iPhone / iPad"
          >
            <Smartphone className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">{t('pwaInstall', 'Install')}</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🍎</span>
                  <h3 className="text-base font-black text-stone-900">
                    {localeText({
                      en: 'Install on iPhone / iPad',
                      hi: 'iPhone / iPad में इंस्टॉल करें',
                      kn: 'iPhone / iPad ನಲ್ಲಿ ಇನ್‌ಸ್ಟಾಲ್ ಮಾಡಿ',
                      te: 'iPhone / iPad లో ఇన్‌స్టాల్ చేయండి',
                      ta: 'iPhone / iPad இல் நிறுவவும்',
                      ml: 'iPhone / iPad ൽ ഇൻസ്റ്റാൾ ചെയ്യുക',
                      mr: 'iPhone / iPad मध्ये इन्स्टॉल करा'
                    })}
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
                    <span>{localeText({
                      en: "Scroll down and select 'Add to Home Screen'.",
                      hi: "नीचे स्क्रॉल करें और 'होम स्क्रीन पर जोड़ें' चुनें।",
                      kn: "ಕೆಳಗೆ ಸ್ಕ್ರಾಲ್ ಮಾಡಿ 'Add to Home Screen' ಆಯ್ಕೆಮಾಡಿ.",
                      te: "క్రిందికి స్క్రోల్ చేసి 'Add to Home Screen' ఎంచుకోండి.",
                      ta: "கீழே உருட்டி 'Add to Home Screen' என்பதைத் தேர்ந்தெடுக்கவும்.",
                      ml: "താഴേക്ക് സ്ക്രോൾ ചെയ്ത് 'Add to Home Screen' തിരഞ്ഞെടുക്കുക.",
                      mr: "खाली स्क्रोल करा आणि 'Add to Home Screen' निवडा."
                    })}</span>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 leading-relaxed font-medium">
                {localeText({
                  en: 'Once added, the app will launch like a native application and remain functional offline without internet.',
                  hi: 'होम स्क्रीन पर जोड़ने के बाद, यह ऐप खेत में बिना इंटरनेट के भी पूरी तरह काम करेगा।',
                  kn: 'ಹೋಮ್ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿದ ನಂತರ, ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದೆಯೂ ಆ್ಯಪ್ ಸಂಪೂರ್ಣವಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುತ್ತದೆ.',
                  te: 'హోమ్ స్క్రీన్‌కు చేర్చిన తర్వాత, ఇంటర్నెట్ లేకపోయినా యాప్ పూర్తిగా పనిచేస్తుంది.',
                  ta: 'முகப்புத் திரையில் சேர்த்த பிறகு, இணையம் இல்லாமலும் செயலி முழுமையாக செயல்படும்.',
                  ml: 'ഹോം സ്ക്രീനിൽ ചേർത്ത ശേഷം, ഇന്റർനെറ്റ് ഇല്ലാതെയും ആപ്പ് പൂർണ്ണമായി പ്രവർത്തിക്കും.',
                  mr: 'होम स्क्रीनवर जोडल्यानंतर, हे ॲप शेतात इंटरनेट नसतानाही पूर्णपणे काम करेल.'
                })}
              </p>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full min-h-[44px] py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs cursor-pointer"
              >
                {localeText({
                  en: 'Got it!',
                  hi: 'समझ गया',
                  kn: 'ಅರ್ಥವಾಯಿತು',
                  te: 'అర్థమైంది',
                  ta: 'புரிந்தது',
                  ml: 'മനസ്സിലായി',
                  mr: 'समजले'
                })}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
