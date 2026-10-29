import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { DEFAULT_USERS } from '../data/initialData';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { 
  Smartphone, 
  User as UserIcon, 
  ChevronDown, 
  Check, 
  ArrowRight,
  Sparkles,
  Lock,
  RotateCcw,
  ShieldCheck,
  BellRing
} from 'lucide-react';
import { db } from '../services/db';

interface LandingPageProps {
  users: User[];
  appName?: string;
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  users,
  appName,
  onLogin,
  onRegister,
}) => {
  const { lang, setLang, t, localeText } = useLanguage();
  const displayAppName = appName || db.getAppName() || 'Testing';

  const [mode, setMode] = useState<'login' | 'register' | 'verify_otp'>('login');
  const [showLangMenu, setShowLangMenu] = useState(false);

  // Sign In fields
  const [loginPhone, setLoginPhone] = useState('9876543210');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginMethod, setLoginMethod] = useState<'pin' | 'otp'>('otp');
  const [loginError, setLoginError] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regCountryCode, setRegCountryCode] = useState('+91');
  const [regPhone, setRegPhone] = useState('');
  const [regError, setRegError] = useState('');

  // OTP Verification state
  const [otpPurpose, setOtpPurpose] = useState<'register' | 'login'>('register');
  const [targetPhoneFormatted, setTargetPhoneFormatted] = useState('');
  const [targetName, setTargetName] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpSuccessMessage, setOtpSuccessMessage] = useState('');
  const [resendTimer, setResendTimer] = useState<number>(30);
  const [showSimulatedSms, setShowSimulatedSms] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (mode === 'verify_otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [mode, resendTimer]);

  // Clean numeric phone extractor
  const extractCleanDigits = (input: string) => input.replace(/\D/g, '');

  // Generate and send simulated OTP
  const triggerSendOtp = (phone: string, name: string, purpose: 'register' | 'login') => {
    const randomCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(randomCode);
    setTargetPhoneFormatted(phone);
    setTargetName(name);
    setOtpPurpose(purpose);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setOtpSuccessMessage('');
    setResendTimer(30);
    setShowSimulatedSms(true);
    setMode('verify_otp');

    // Focus first input box shortly after render
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 150);
  };

  // 1. Submit Registration -> triggers OTP
  const handleRegisterGetOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    const cleanName = regName.trim();
    if (cleanName.length < 2) {
      setRegError(localeText({
        en: 'Please enter your full name (at least 2 letters)',
        hi: 'कृपया अपना पूरा नाम दर्ज करें',
        kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ನಮೂದಿಸಿ (ಕನಿಷ್ಠ 2 ಅಕ್ಷರಗಳು)',
        te: 'దయచేసి మీ పూర్తి పేరును నమోదు చేయండి (కనీసం 2 అక్షరాలు)',
        ta: 'தயவுசெய்து உங்கள் முழு பெயரை உள்ளிடவும் (குறைந்தது 2 எழுத்துக்கள்)',
        ml: 'ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് നൽകുക (കുറഞ്ഞത് 2 അക്ഷരങ്ങൾ)',
        mr: 'कृपया आपले पूर्ण नाव प्रविष्ट करा (किमान २ अक्षरे)'
      }));
      return;
    }

    const cleanDigits = extractCleanDigits(regPhone);
    if (cleanDigits.length < 10) {
      setRegError(localeText({
        en: 'Please enter a valid 10-digit mobile phone number',
        hi: 'कृपया वैध 10 अंकों का मोबाइल नंबर दर्ज करें',
        kn: 'ದಯವಿಟ್ಟು ಮಾನ್ಯವಾದ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
        te: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',
        ta: 'தயவுசெய்து சரியான 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
        ml: 'സാധുവായ 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക',
        mr: 'कृपया वैध 10 अंकी मोबाइल क्रमांक प्रविष्ट करा'
      }));
      return;
    }

    const fullPhoneNumber = `${regCountryCode} ${cleanDigits.slice(-10)}`;

    // Check if phone already registered
    const existing = users.find(u => {
      const uDigits = extractCleanDigits(u.phone || u.identifier || '');
      return uDigits.endsWith(cleanDigits.slice(-10));
    });

    if (existing) {
      setRegError(
        localeText({
          en: `This mobile number is already registered for ${existing.name}. Please select "Sign In".`,
          hi: `यह मोबाइल नंबर पहले से पंजीकृत है (${existing.name})। कृपया "साइन इन" टैब चुनें।`,
          kn: `ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಈಗಾಗಲೇ ನೋಂದಾಯಿತವಾಗಿದೆ (${existing.name}). ದಯವಿಟ್ಟು "ಸೈನ್ ಇನ್" ಆಯ್ಕೆಮಾಡಿ.`,
          te: `ఈ మొబైల్ నంబర్ ఇప్పటికే నమోదు చేయబడింది (${existing.name}). దయచేసి "సైన్ ఇన్" ఎంచుకోండి.`,
          ta: `இந்த மொபைல் எண் ஏற்கனவே பதிவு செய்யப்பட்டுள்ளது (${existing.name}). தயவுசெய்து "உள்நுழை" என்பதைத் தேர்ந்தெடுக்கவும்.`,
          ml: `ഈ മൊബൈൽ നമ്പർ ഇതിനകം രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (${existing.name}). ദയവായി "സൈൻ ഇൻ" തിരഞ്ഞെടുക്കുക.`,
          mr: `हा मोबाइल क्रमांक आधीच नोंदणीकृत आहे (${existing.name}). कृपया "साइन इन" निवडा.`
        })
      );
      return;
    }

    triggerSendOtp(fullPhoneNumber, cleanName, 'register');
  };

  // 2. Submit Login (either OTP or PIN)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanDigits = extractCleanDigits(loginPhone);
    if (cleanDigits.length < 10 && !loginPhone.includes('@')) {
      setLoginError(localeText({
        en: 'Please enter a valid 10-digit mobile number',
        hi: 'कृपया 10 अंकों का मोबाइल नंबर दर्ज करें',
        kn: 'ದಯವಿಟ್ಟು 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ',
        te: 'దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి',
        ta: 'தயவுசெய்து 10 இலக்க மொபைல் எண்ணை உள்ளிடவும்',
        ml: 'ദയവായി 10 അക്ക മൊബൈൽ നമ്പർ നൽകുക',
        mr: 'कृपया 10 अंकी मोबाइल क्रमांक प्रविष्ट करा'
      }));
      return;
    }

    const matched = users.find(u => {
      const uClean = extractCleanDigits(u.phone || u.identifier || '');
      return (
        (cleanDigits.length >= 10 && (uClean === cleanDigits || uClean.endsWith(cleanDigits.slice(-10)))) ||
        u.identifier.toLowerCase() === loginPhone.trim().toLowerCase()
      );
    });

    if (!matched) {
      setLoginError(
        localeText({
          en: `Mobile number "${loginPhone}" not found. Tap "Register" to create an account.`,
          hi: `मोबाइल नंबर "${loginPhone}" पंजीकृत नहीं है। कृपया "रजिस्टर" टैब से नया खाता बनाएं।`,
          kn: `ಮೊಬೈಲ್ ಸಂಖ್ಯೆ "${loginPhone}" ಕಂಡುಬಂದಿಲ್ಲ. ಖಾತೆ ತೆರೆಯಲು "ನೋಂದಣಿ" ಒತ್ತಿ.`,
          te: `మొబైల్ సంఖ్య "${loginPhone}" కనుగొనబడలేదు. ఖాతాను సృష్టించడానికి "రిజిస్టర్" నొక్కండి.`,
          ta: `மொபைல் எண் "${loginPhone}" இல்லை. கணக்கை உருவாக்க "பதிவு செய்" என்பதைத் தொடவும்.`,
          ml: `മൊബൈൽ നമ്പർ "${loginPhone}" കണ്ടെത്തിയില്ല. അക്കൗണ്ട് സൃഷ്ടിക്കാൻ "രജിസ്റ്റർ" ചെയ്യുക.`,
          mr: `मोबाइल क्रमांक "${loginPhone}" सापडला नाही. खाते तयार करण्यासाठी "नोंदणी" टॅप करा.`
        })
      );
      return;
    }

    if (loginMethod === 'otp') {
      triggerSendOtp(matched.phone || matched.identifier, matched.name, 'login');
    } else {
      // Direct PIN login
      onLogin(matched);
    }
  };

  // 3. Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);
    setOtpError('');

    // Advance to next box if digit entered
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newDigits = [...otpDigits];
      for (let i = 0; i < 6; i++) {
        newDigits[i] = pastedData[i] || '';
      }
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pastedData.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (!generatedOtp) return;
    const chars = generatedOtp.split('');
    setOtpDigits(chars);
    setOtpError('');
    otpInputRefs.current[5]?.focus();
  };

  // 4. Verify OTP and complete registration/login
  const handleVerifyOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setOtpError(localeText({
        en: 'Please enter all 6 digits of the OTP code',
        hi: 'कृपया पूरा 6 अंकों का ओटीपी दर्ज करें',
        kn: 'ದಯವಿಟ್ಟು ಎಲ್ಲಾ 6 ಅಂಕಿಗಳ OTP ಕೋಡ್ ನಮೂದಿಸಿ',
        te: 'దయచేసి మొత్తం 6 అంకెల OTP కోడ్‌ను నమోదు చేయండి',
        ta: 'தயவுசெய்து 6 இலக்க OTP குறியீட்டை உள்ளிடவும்',
        ml: 'എല്ലാ 6 അക്ക OTP കോഡും നൽകുക',
        mr: 'कृपया सर्व 6 अंकी OTP कोड प्रविष्ट करा'
      }));
      return;
    }

    if (enteredOtp !== generatedOtp) {
      setOtpError(localeText({
        en: 'Invalid OTP code! Please enter the code shown in the SMS or request a new one.',
        hi: 'गलत ओटीपी! कृपया सही कोड दर्ज करें या नया ओटीपी मंगाएं।',
        kn: 'ತಪ್ಪಾದ OTP ಕೋಡ್! ದಯವಿಟ್ಟು SMS ನಲ್ಲಿ ತೋರಿಸಿರುವ ಕೋಡ್ ನಮೂದಿಸಿ.',
        te: 'చెల్లని OTP కోడ్! దయచేసి SMS లో చూపిన కోడ్‌ను నమోదు చేయండి.',
        ta: 'தவறான OTP குறியீடு! SMS-ல் காட்டப்பட்டுள்ள குறியீட்டை உள்ளிடவும்.',
        ml: 'തെറ്റായ OTP കോഡ്! SMS-ൽ കാണിച്ചിരിക്കുന്ന കോഡ് നൽകുക.',
        mr: 'अवैध OTP कोड! कृपया SMS मध्ये दर्शविलेला कोड प्रविष्ट करा.'
      }));
      return;
    }

    // Success!
    setOtpSuccessMessage(localeText({
      en: '✓ Mobile number verified successfully!',
      hi: '✓ मोबाइल नंबर सफलतापूर्वक सत्यापित हुआ!',
      kn: '✓ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಯಶಸ್ವಿಯಾಗಿ ಪರಿಶೀಲಿಸಲ್ಪಟ್ಟಿದೆ!',
      te: '✓ మొబైల్ సంఖ్య విజయవంతంగా ధృవీకరించబడింది!',
      ta: '✓ மொபைல் எண் வெற்றிகரமாக சரிபார்க்கப்பட்டது!',
      ml: '✓ മൊബൈൽ നമ്പർ വിജയകരമായി പരിശോധിച്ചു!',
      mr: '✓ मोबाइल क्रमांक यशस्वीरित्या सत्यापित झाला!'
    }));

    setTimeout(() => {
      setShowSimulatedSms(false);
      if (otpPurpose === 'register') {
        const newUser: User = {
          id: `usr-${Date.now()}`,
          name: targetName.trim(),
          identifier: targetPhoneFormatted.trim(),
          authType: 'phone',
          phone: targetPhoneFormatted.trim(),
          createdAt: new Date().toISOString().split('T')[0],
        };
        onRegister(newUser);
      } else {
        const matched = users.find(u => {
          const uClean = extractCleanDigits(u.phone || u.identifier || '');
          const targetClean = extractCleanDigits(targetPhoneFormatted);
          return uClean.endsWith(targetClean.slice(-10));
        });
        if (matched) {
          onLogin(matched);
        }
      }
    }, 600);
  };

  // 5. Resend OTP
  const handleResendOtp = () => {
    if (resendTimer > 0) return;
    const newCode = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(newCode);
    setResendTimer(30);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setShowSimulatedSms(true);
    setTimeout(() => {
      otpInputRefs.current[0]?.focus();
    }, 100);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-between text-stone-900 px-3 py-4 sm:p-6 relative">
      
      {/* SIMULATED SMS NOTIFICATION TOAST */}
      {showSimulatedSms && generatedOtp && (
        <div className="fixed top-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-50 animate-in slide-in-from-top duration-300">
          <div className="bg-stone-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl border-2 border-emerald-500 flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5 text-emerald-200 animate-pulse" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  {localeText({
                    en: '📲 SMS Notification Received',
                    hi: '📲 मैसेज (SMS) प्राप्त हुआ',
                    kn: '📲 SMS ಸಂದೇಶ ಸ್ವೀಕರಿಸಲಾಗಿದೆ',
                    te: '📲 SMS సందేశం అందింది',
                    ta: '📲 SMS செய்தி பெறப்பட்டது',
                    ml: '📲 SMS സന്ദേശം ലഭിച്ചു',
                    mr: '📲 SMS संदेश प्राप्त झाला'
                  })}
                </span>
                <span className="text-[10px] text-stone-400">Just now</span>
              </div>
              <p className="text-xs text-stone-200 font-medium mt-0.5 leading-snug">
                {localeText({
                  en: 'Your Flock Diary verification OTP is:',
                  hi: 'आपका फार्मट्रैक सत्यापन कोड है:',
                  kn: 'ನಿಮ್ಮ ಹಿಂಡಿನ ಡೈರಿ ಪರಿಶೀಲನಾ OTP:',
                  te: 'మీ మంద డైరీ ధృవీకరణ OTP:',
                  ta: 'உங்கள் மந்தை நாட்குறிப்பு சரிபார்ப்பு OTP:',
                  ml: 'നിങ്ങളുടെ ആട്ടിൻകൂട്ടം ഡയറി പരിശോധന OTP:',
                  mr: 'तुमचा कळप डायरी पडताळणी OTP आहे:'
                })}{' '}
                <strong className="font-mono text-white text-sm bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-600 font-black">
                  {generatedOtp}
                </strong>
              </p>
              
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>
                    {localeText({
                      en: '⚡ 1-Tap Auto-fill OTP',
                      hi: '⚡ 1-टैप ऑटो भरें',
                      kn: '⚡ 1-ಟ್ಯಾಪ್ ಸ್ವಯಂ ಭರ್ತಿ',
                      te: '⚡ 1-ట్యాప్ ఆటో ఫిల్',
                      ta: '⚡ 1-தட்டு தானாக நிரப்பு',
                      ml: '⚡ 1-ടാപ്പ് സ്വയം പൂരിപ്പിക്കുക',
                      mr: '⚡ 1-टॅप ऑटो भरा'
                    })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowSimulatedSms(false)}
                  className="text-[10px] text-stone-400 hover:text-stone-200 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Bar with Language Selector */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🐐</span>
          <span className="text-base font-black tracking-tight text-emerald-950 font-mono">
            {displayAppName}
          </span>
        </div>

        {/* Language Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowLangMenu(!showLangMenu)}
            className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-stone-800 shadow-2xs"
          >
            <span>{currentLangObj.flag}</span>
            <span>{currentLangObj.nativeName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </button>

          {showLangMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLangMenu(false)} />
              <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50">
                {SUPPORTED_LANGUAGES.map(item => (
                  <button
                    type="button"
                    key={item.code}
                    onClick={() => {
                      setLang(item.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between cursor-pointer ${
                      lang === item.code ? 'bg-emerald-50 text-emerald-900 font-black' : 'text-stone-700 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{item.flag}</span>
                      <span>{item.nativeName}</span>
                    </div>
                    {lang === item.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Centered Auth Card */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden p-5 sm:p-7 space-y-4 my-auto">
        
        {/* Brand Lockup */}
        <div className="text-center space-y-1 pb-1 border-b border-stone-100">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-800 text-white text-2xl shadow-sm mb-1">
            🐐
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {displayAppName}
          </h1>
          <p className="text-xs text-stone-500 font-bold">
            {t('appNameSubtitle', 'Sheep & Goat Flock Diary')}
          </p>
        </div>

        {/* Tab Switcher (Visible in login and register, hidden during OTP verify) */}
        {mode !== 'verify_otp' && (
          <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
                setRegError('');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {t('signIn', 'Sign In')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setLoginError('');
                setRegError('');
              }}
              className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {localeText({
                en: 'Register with OTP',
                hi: 'नया रजिस्ट्रेशन',
                kn: 'OTP ಯೊಂದಿಗೆ ನೋಂದಣಿ',
                te: 'OTP తో రిజిస్ట్రేషన్',
                ta: 'OTP உடன் பதிவு',
                ml: 'OTP ഉപയോഗിച്ച് രജിസ്റ്റർ ചെയ്യുക',
                mr: 'OTP सह नोंदणी'
              })}
            </button>
          </div>
        )}

        {/* ==================== 1. REGISTER FORM ==================== */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterGetOtp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                {localeText({
                  en: 'Your Full Name',
                  hi: 'आपका पूरा नाम',
                  kn: 'ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು',
                  te: 'మీ పూర్తి పేరు',
                  ta: 'உங்கள் முழு பெயர்',
                  ml: 'നിങ്ങളുടെ മുഴുവൻ പേര്',
                  mr: 'आपले पूर्ण नाव'
                })}
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                {localeText({
                  en: 'Mobile Phone Number (for OTP)',
                  hi: 'मोबाइल नंबर (ओटीपी सत्यापन के लिए)',
                  kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (OTP ಗಾಗಿ)',
                  te: 'మొబైల్ నంబర్ (OTP కోసం)',
                  ta: 'மொபைல் எண் (OTP க்காக)',
                  ml: 'മൊബൈൽ നമ്പർ (OTP ക്കായി)',
                  mr: 'मोबाइल क्रमांक (OTP साठी)'
                })}
              </label>
              <div className="flex gap-2">
                <div className="w-20 shrink-0">
                  <select
                    value={regCountryCode}
                    onChange={(e) => setRegCountryCode(e.target.value)}
                    className="w-full min-h-[44px] px-2 py-2 rounded-xl border border-stone-300 bg-stone-50 text-xs font-black text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                  >
                    <option value="+91">🇮🇳 +91</option>
                    <option value="+1">🇺🇸 +1</option>
                    <option value="+44">🇬🇧 +44</option>
                    <option value="+971">🇦🇪 +971</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <Smartphone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="98765 43210"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 font-mono text-base sm:text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
              <span className="text-[11px] text-stone-400 font-medium block mt-1">
                {localeText({
                  en: 'We will send a 6-digit OTP code to verify this mobile number.',
                  hi: 'पंजीकरण के लिए इस नंबर पर 6 अंकों का ओटीपी भेजा जाएगा।',
                  kn: 'ಈ ಮೊಬೈಲ್ ಸಂಖ್ಯೆಯನ್ನು ಪರಿಶೀಲಿಸಲು ನಾವು 6 ಅಂಕಿಗಳ OTP ಕಳುಹಿಸುತ್ತೇವೆ.',
                  te: 'ఈ మొబైల్ సంఖ్యను ధృవీకరించడానికి మేము 6 అంకెల OTP కోడ్‌ను పంపుతాము.',
                  ta: 'இந்த மொபைல் எண்ணை சரிபார்க்க 6 இலக்க OTP குறியீட்டை அனுப்புவோம்.',
                  ml: 'ഈ മൊബൈൽ നമ്പർ പരിശോധിക്കാൻ 6 അക്ക OTP അയക്കും.',
                  mr: 'हा मोबाइल नंबर पडताळण्यासाठी आम्ही 6 अंकी OTP पाठवू.'
                })}
              </span>
            </div>

            {regError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
                {regError}
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>
                {localeText({
                  en: 'Get Verification OTP 📲',
                  hi: 'ओटीपी प्राप्त करें 📲',
                  kn: 'ಪರಿಶೀಲನಾ OTP ಪಡೆಯಿರಿ 📲',
                  te: 'ధృవీకరణ OTP పొందండి 📲',
                  ta: 'சரிபார்ப்பு OTP பெறவும் 📲',
                  ml: 'പരിശോധന OTP നേടുക 📲',
                  mr: 'पडताळणी OTP मिळवा 📲'
                })}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ==================== 2. VERIFY OTP SCREEN ==================== */}
        {mode === 'verify_otp' && (
          <form onSubmit={handleVerifyOtpSubmit} className="space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div className="min-w-0">
                <span className="font-black block text-emerald-900">
                  {localeText({
                    en: 'Verify Your Mobile Number',
                    hi: 'मोबाइल नंबर सत्यापन',
                    kn: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಪರಿಶೀಲನೆ',
                    te: 'మొబైల్ నంబర్ ధృవీకరణ',
                    ta: 'மொபைல் எண் சரிபார்ப்பு',
                    ml: 'മൊബൈൽ നമ്പർ പരിശോധന',
                    mr: 'मोबाइल क्रमांक पडताळणी'
                  })}
                </span>
                <span className="text-emerald-800 font-medium">
                  {localeText({
                    en: '6-digit OTP sent to:',
                    hi: 'ओटीपी भेजा गया:',
                    kn: 'OTP ಕಳುಹಿಸಲಾಗಿದೆ:',
                    te: 'OTP పంపబడింది:',
                    ta: 'OTP அனுப்பப்பட்டது:',
                    ml: 'OTP അയച്ചു:',
                    mr: 'OTP पाठवला गेला:'
                  })}{' '}
                  <strong className="font-mono font-bold text-emerald-950">{targetPhoneFormatted}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setMode(otpPurpose)}
                  className="text-[11px] text-emerald-900 underline block font-bold mt-1 cursor-pointer"
                >
                  {localeText({
                    en: 'Change or edit number',
                    hi: 'नंबर बदलें / सुधारें',
                    kn: 'ಸಂಖ್ಯೆಯನ್ನು ಬದಲಾಯಿಸಿ / ಸಂಪಾದಿಸಿ',
                    te: 'నంబర్‌ను మార్చండి / సవరించండి',
                    ta: 'எண்ணை மாற்றவும் / திருத்தவும்',
                    ml: 'നമ്പർ മാറ്റുക / തിരുത്തുക',
                    mr: 'क्रमांक बदला / संपादित करा'
                  })}
                </button>
              </div>
            </div>

            {/* 6 Digit Input Boxes */}
            <div>
              <label className="block text-xs font-black text-stone-700 mb-2 text-center">
                {localeText({
                  en: 'Enter 6-Digit OTP Code',
                  hi: '6 अंकों का ओटीपी कोड दर्ज करें',
                  kn: '6 ಅಂಕಿಗಳ OTP ಕೋಡ್ ನಮೂದಿಸಿ',
                  te: '6 అంకెల OTP కోడ్‌ను నమోదు చేయండి',
                  ta: '6 இலக்க OTP குறியீட்டை உள்ளிடவும்',
                  ml: '6 അക്ക OTP കോഡ് നൽകുക',
                  mr: '6 अंकी OTP कोड प्रविष्ट करा'
                })}
              </label>

              <div 
                className="grid grid-cols-6 gap-1.5 sm:gap-2 justify-center"
                onPaste={handleOtpPaste}
              >
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      otpInputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-full h-12 text-center text-xl font-mono font-black rounded-xl border-2 border-stone-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 bg-stone-50 focus:bg-white text-stone-900 focus:outline-none transition-all"
                  />
                ))}
              </div>
            </div>

            {/* Auto-fill helper pill */}
            {generatedOtp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black border border-emerald-300 cursor-pointer active:scale-95 transition-all"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>
                    {localeText({
                      en: `Auto-fill OTP: ${generatedOtp}`,
                      hi: `ओटीपी स्वतः भरें: ${generatedOtp}`,
                      kn: `ಸ್ವಯಂ ಭರ್ತಿ OTP: ${generatedOtp}`,
                      te: `ఆటో ఫిల్ OTP: ${generatedOtp}`,
                      ta: `தானாக நிரப்பு OTP: ${generatedOtp}`,
                      ml: `സ്വയം പൂരിപ്പിക്കുക OTP: ${generatedOtp}`,
                      mr: `ऑटो भरा OTP: ${generatedOtp}`
                    })}
                  </span>
                </button>
              </div>
            )}

            {otpError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800 text-center">
                {otpError}
              </div>
            )}

            {otpSuccessMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs font-black text-emerald-900 text-center flex items-center justify-center gap-2">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>{otpSuccessMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>
                {otpPurpose === 'register' 
                  ? localeText({
                      en: 'Verify & Set Up Farm 🚀',
                      hi: 'सत्यापित करें व फार्म बनाएं 🚀',
                      kn: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಫಾರ್ಮ್ ರಚಿಸಿ 🚀',
                      te: 'ధృవీకరించి ఫామ్ ఏర్పాటు చేయండి 🚀',
                      ta: 'சரிபார்த்து பண்ணையை அமைக்கவும் 🚀',
                      ml: 'പരിശോധിച്ച് ഫാം ആരംഭിക്കുക 🚀',
                      mr: 'पडताळणी करा आणि फार्म तयार करा 🚀'
                    })
                  : localeText({
                      en: 'Verify & Sign In',
                      hi: 'सत्यापित करें व साइन इन करें',
                      kn: 'ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಸೈನ್ ಇನ್ ಮಾಡಿ',
                      te: 'ధృవీకరించి సైన్ ఇన్ చేయండి',
                      ta: 'சரிபார்த்து உள்நுழையவும்',
                      ml: 'പരിശോധിച്ച് സൈൻ ഇൻ ചെയ്യുക',
                      mr: 'पडताळणी करा आणि साइन इन करा'
                    })}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resend Timer or Button */}
            <div className="text-center pt-1">
              {resendTimer > 0 ? (
                <span className="text-xs text-stone-500 font-medium">
                  {localeText({
                    en: `Resend OTP code in ${resendTimer}s`,
                    hi: `नया ओटीपी भेजें (${resendTimer} सेकंड में)`,
                    kn: `ಮತ್ತೆ OTP ಕಳುಹಿಸಿ (${resendTimer} ಸೆ)`,
                    te: `మళ్లీ OTP పంపండి (${resendTimer} సె)`,
                    ta: `மீண்டும் OTP அனுப்பவும் (${resendTimer} வி)`,
                    ml: `വീണ്ടും OTP അയക്കുക (${resendTimer} സെ)`,
                    mr: `पुन्हा OTP पाठवा (${resendTimer} सेकंदात)`
                  })}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>
                    {localeText({
                      en: "Didn't receive code? Resend OTP",
                      hi: 'ओटीपी नहीं मिला? दोबारा भेजें',
                      kn: 'ಕೋಡ್ ಬಂದಿಲ್ಲವೇ? ಮತ್ತೆ OTP ಕಳುಹಿಸಿ',
                      te: 'కోడ్ రాలేదా? మళ్లీ OTP పంపండి',
                      ta: 'குறியீடு வரவில்லையா? மீண்டும் OTP அனுப்பவும்',
                      ml: 'കോഡ് ലഭിച്ചില്ലേ? വീണ്ടും OTP അയക്കുക',
                      mr: 'कोड मिळाला नाही? पुन्हा OTP पाठवा'
                    })}
                  </span>
                </button>
              )}
            </div>
          </form>
        )}

        {/* ==================== 3. SIGN IN FORM ==================== */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-black text-stone-700 mb-1">
                {localeText({
                  en: 'Registered Mobile Number',
                  hi: 'पंजीकृत मोबाइल नंबर',
                  kn: 'ನೋಂದಾಯಿತ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
                  te: 'నమోదైన మొబైల్ నంబర్',
                  ta: 'பதிவுசெய்யப்பட்ட ಮೊபைಲ್ எண்',
                  ml: 'രജിസ്റ്റർ ചെയ്ത മൊബൈൽ നമ്പർ',
                  mr: 'नोंदणीकृत मोबाइल क्रमांक'
                })}
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="9876543210 or email"
                  className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 font-mono text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Method toggle: OTP vs PIN */}
            <div className="flex items-center justify-between text-xs font-bold pt-0.5">
              <span className="text-stone-500">
                {localeText({
                  en: 'Login Method:',
                  hi: 'साइन इन विधि:',
                  kn: 'ಲಾಗಿನ್ ವಿಧಾನ:',
                  te: 'లాగిన్ పద్ధతి:',
                  ta: 'உள்நுழைவு முறை:',
                  ml: 'ലോഗിൻ രീതി:',
                  mr: 'लॉगिन पद्धत:'
                })}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLoginMethod('otp')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    loginMethod === 'otp'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  📲 Mobile OTP
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('pin')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    loginMethod === 'pin'
                      ? 'bg-emerald-800 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  🔒 PIN (1234)
                </button>
              </div>
            </div>

            {loginMethod === 'pin' && (
              <div>
                <label className="block text-xs font-black text-stone-700 mb-1">
                  Security PIN
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={loginPin}
                    onChange={(e) => setLoginPin(e.target.value)}
                    placeholder="PIN (1234)"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2 rounded-xl border border-stone-300 font-mono text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>
              </div>
            )}

            {loginError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-800">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-98"
            >
              <span>
                {loginMethod === 'otp'
                  ? localeText({
                      en: 'Send Login OTP 📲',
                      hi: 'लॉगिन ओटीपी प्राप्त करें 📲',
                      kn: 'ಲಾಗಿನ್ OTP ಕಳುಹಿಸಿ 📲',
                      te: 'లాగిన్ OTP పంపండి 📲',
                      ta: 'உள்நுழைவு OTP அனுப்பவும் 📲',
                      ml: 'ലോഗിൻ OTP അയക്കുക 📲',
                      mr: 'लॉगिन OTP पाठवा 📲'
                    })
                  : t('signIn', 'Sign In')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Quick 1-Tap Demo Logins */}
            <div className="pt-2 border-t border-stone-100">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2 text-center">
                {localeText({
                  en: 'Demo Accounts (1-Tap):',
                  hi: 'त्वरित डेमो खाते (1-टैप):',
                  kn: 'ಡೆಮೊ ಖಾತೆಗಳು (1-ಟ್ಯಾಪ್):',
                  te: 'డెమో ఖాతాలు (1-ట్యాప్):',
                  ta: 'டெமோ கணக்குகள் (1-தட்டு):',
                  ml: 'ഡെമോ അക്കൗണ്ടുകൾ (1-ടാപ്പ്):',
                  mr: 'डेमो खाती (1-टॅप):'
                })}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => onLogin(DEFAULT_USERS[0])}
                  className="px-2.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-950 text-xs font-bold text-left cursor-pointer transition-all truncate"
                  title="Log in as System Admin (madhusav@gmail.com)"
                >
                  <span className="block truncate text-purple-900 font-black">🛡️ Madhu S</span>
                  <span className="text-[10px] text-purple-700 block truncate">System Admin (madhusav@gmail.com)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin(DEFAULT_USERS[2])}
                  className="px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 text-xs font-bold text-left cursor-pointer transition-all truncate"
                >
                  <span className="block truncate font-black">👑 Ramesh Patel</span>
                  <span className="text-[10px] text-emerald-800 block truncate">Farm Boss (FARM-7821)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onLogin(DEFAULT_USERS[3])}
                  className="px-2.5 py-2 rounded-xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 text-xs font-bold text-left cursor-pointer transition-all truncate"
                >
                  <span className="block truncate font-bold">🚜 Suresh Kumar</span>
                  <span className="text-[10px] text-stone-500 block truncate">Herdsman Helper</span>
                </button>
              </div>
            </div>
          </form>
        )}

      </div>

      {/* Quiet Footer */}
      <div className="text-center text-xs text-stone-400 font-medium pt-3">
        {displayAppName} · Sheep & Goat Flock Management
      </div>

    </div>
  );
};
