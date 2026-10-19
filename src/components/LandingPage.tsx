import React, { useState } from 'react';
import { User } from '../types';
import { DEFAULT_USERS } from '../data/initialData';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../i18n/translations';
import { 
  ShieldCheck, 
  ArrowRight, 
  Smartphone, 
  Mail, 
  Lock, 
  User as UserIcon, 
  Sparkles,
  Copy,
  Check,
  Heart,
  Baby,
  Smile,
  ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  users: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  users,
  onLogin,
  onRegister,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [showLangMenu, setShowLangMenu] = useState(false);
  
  // Login fields
  const [loginIdentifier, setLoginIdentifier] = useState('+91 98765 43210');
  const [loginPin, setLoginPin] = useState('1234');
  const [loginError, setLoginError] = useState('');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regAuthType, setRegAuthType] = useState<'phone' | 'email'>('phone');
  const [regPhone, setRegPhone] = useState('+91 ');
  const [regEmail, setRegEmail] = useState('');
  
  // OTP state
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [copiedOtp, setCopiedOtp] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError('');

    const targetIdentifier = regAuthType === 'phone' ? regPhone.trim() : regEmail.trim();
    if (!regName.trim()) {
      setOtpError('Please type your name');
      return;
    }
    if (!targetIdentifier || targetIdentifier === '+91') {
      setOtpError(`Please enter your ${regAuthType === 'phone' ? 'mobile number' : 'email'}`);
      return;
    }

    // Generate easy 6-digit OTP
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(randomCode);
    setIsOtpSent(true);
    setEnteredOtp('');
  };

  const handleVerifyOtpAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredOtp.trim() !== generatedOtp.trim()) {
      setOtpError('Wrong secret code! Please type the 6 numbers shown in the green box above.');
      return;
    }

    const targetIdentifier = regAuthType === 'phone' ? regPhone.trim() : regEmail.trim();
    const newUser: User = {
      id: `user-${Date.now()}`,
      name: regName.trim(),
      identifier: targetIdentifier,
      authType: regAuthType,
      phone: regAuthType === 'phone' ? targetIdentifier : undefined,
      email: regAuthType === 'email' ? targetIdentifier : undefined,
      createdAt: new Date().toISOString().split('T')[0],
    };

    onRegister(newUser);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanInput = loginIdentifier.trim().toLowerCase();
    if (!cleanInput) {
      setLoginError('Please enter your mobile phone number or email');
      return;
    }

    const matched = users.find(u => 
      u.identifier.toLowerCase() === cleanInput || 
      (u.phone && u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '')) ||
      (u.email && u.email.toLowerCase() === cleanInput)
    );

    if (matched) {
      onLogin(matched);
    } else {
      setLoginError(`We could not find "${loginIdentifier}". Tap "Create New Account" below to register!`);
    }
  };

  const handleQuickDemoLogin = (demoUser: User) => {
    onLogin(demoUser);
  };

  const copyOtpToClipboard = () => {
    navigator.clipboard.writeText(generatedOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] flex flex-col justify-between text-stone-900">
      
      {/* Top Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-3xl">🐐</span>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-emerald-900">
                {t('appTitle', 'Sheep & Goat Tracker')}
              </span>
              <span className="text-[11px] block text-stone-500 font-semibold">
                {t('appSubtitle', 'Phase 1: Flock & Herd Manager')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 cursor-pointer text-stone-800"
              >
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === lang)?.flag}</span>
                <span>{SUPPORTED_LANGUAGES.find(l => l.code === lang)?.nativeName}</span>
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
                        className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between cursor-pointer ${
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

            <button
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setIsOtpSent(false);
                setLoginError('');
                setOtpError('');
              }}
              className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-300 transition-colors cursor-pointer"
            >
              {mode === 'login' ? 'New Farmer? Register' : 'Already Registered? Sign In'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Friendly, Kid-Simple Features */}
          <div className="lg:col-span-7 space-y-5">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-950 text-xs font-bold border border-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>🐐 Phase 1: Sheep & Goat Specialists 🐑 · Other Livestock in Phase 2</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
              Flock Diary for Your Goats & Sheep!
            </h1>

            <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
              Specialized for <strong>Goats (बकरी)</strong> and <strong>Sheep (भेड़)</strong> flock owners, breeders, and herders. 
              Track ear tags, kid & lamb birth weights, Sire & Dam pedigree, and critical vaccines (PPR, Enterotoxemia, Pox). 
              <em>Cattle, buffalo, and poultry will be added in coming phases.</em>
            </p>

            {/* 4 Specialized Flock Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              
              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🌳</span>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Flock Family Lineage</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Track Sire (Stud Buck / Ram) & Dam (Doe / Ewe) to prevent inbreeding and build stronger bloodlines.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">💉</span>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">PPR, ET & Pox Vaccines</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Ovine & caprine protocols with 1-click batch shots, deworming drenches, and nearing due alerts.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">⚖️</span>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Kid / Lamb Growth & Wool</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Record birth weights, daily grams gain (ADG), shearing fleece yield, and doe milking.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-xs flex items-start gap-3">
                <span className="text-2xl mt-0.5">🏷️</span>
                <div>
                  <h3 className="font-bold text-stone-900 text-sm">Ear Tagging & Fast Bulk Add</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Manage GOAT- and SHEEP- tag series, update ear tags quickly, and bulk-import new flocks in seconds.
                  </p>
                </div>
              </div>
            </div>

            {/* 1-Tap Demo Logins for Instant Testing */}
            <div className="pt-2">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                Tap to Try with Demo Accounts:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEFAULT_USERS[0])}
                  className="px-3 py-2 rounded-xl bg-purple-50 border-2 border-purple-500 hover:bg-purple-100 text-xs font-bold text-purple-950 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>👑 Super Admin (All Tenants)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEFAULT_USERS[1])}
                  className="px-3 py-2 rounded-xl bg-white border-2 border-emerald-600 hover:bg-emerald-50 text-xs font-bold text-emerald-950 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>👑 Ramesh Patel (Farm Boss)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEFAULT_USERS[2])}
                  className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-xs font-bold text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>🚜 Suresh Kumar (Farm Helper)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickDemoLogin(DEFAULT_USERS[4] || DEFAULT_USERS[3])}
                  className="px-3 py-2 rounded-xl bg-white border border-stone-300 hover:border-emerald-600 hover:bg-emerald-50 text-xs font-bold text-stone-800 flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>🆕 Priya Verma (New User)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Simple Sign In or Register Box */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border-2 border-stone-200 shadow-xl p-6 sm:p-8">
              
              {/* Simple Toggle Tabs */}
              <div className="flex items-center p-1 bg-stone-100 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setIsOtpSent(false);
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                    mode === 'login'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {lang === 'hi' ? 'लॉग इन' : 'Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setIsOtpSent(false);
                    setOtpError('');
                  }}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                    mode === 'register'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Register with OTP
                </button>
              </div>

              {/* MODE 1: SIMPLE SIGN IN */}
              {mode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900">Sign In to Your Farm</h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Type your mobile phone number to open your farm animals diary.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Your Mobile Number (or Email)
                    </label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-stone-700">
                        Farm PIN or Password
                      </label>
                      <span className="text-[11px] text-stone-400 font-mono">Demo: 1234</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPin}
                        onChange={(e) => setLoginPin(e.target.value)}
                        placeholder="Type password"
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                      {loginError}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Open Farm Animals Diary</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="pt-1 text-center">
                    <p className="text-xs text-stone-500">
                      New to this farm app?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setMode('register');
                          setLoginError('');
                        }}
                        className="text-emerald-800 font-extrabold hover:underline cursor-pointer"
                      >
                        Tap here to Register with OTP
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* MODE 2: NEW REGISTRATION WITH SIMPLE OTP */}
              {mode === 'register' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900">New Farmer Registration</h2>
                    <p className="text-xs text-stone-500 mt-1">
                      Enter your mobile number to get a secret 6-digit code (OTP).
                    </p>
                  </div>

                  {!isOtpSent ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      {/* Name */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Your Full Name (किसान का नाम)
                        </label>
                        <div className="relative">
                          <UserIcon className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="e.g. Anita Sharma"
                            className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                          />
                        </div>
                      </div>

                      {/* Phone vs Email Toggle */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1.5">
                          How should we send your OTP code?
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setRegAuthType('phone')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              regAuthType === 'phone'
                                ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                                : 'border-stone-200 bg-stone-50 text-stone-600'
                            }`}
                          >
                            <Smartphone className="w-4 h-4" />
                            <span>Mobile Phone (+91)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setRegAuthType('email')}
                            className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              regAuthType === 'email'
                                ? 'border-emerald-700 bg-emerald-50 text-emerald-900'
                                : 'border-stone-200 bg-stone-50 text-stone-600'
                            }`}
                          >
                            <Mail className="w-4 h-4" />
                            <span>Email Address</span>
                          </button>
                        </div>
                      </div>

                      {/* Number / Email input */}
                      {regAuthType === 'phone' ? (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Mobile Phone Number (मोबाइल नंबर)
                          </label>
                          <div className="relative">
                            <Smartphone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={regPhone}
                              onChange={(e) => setRegPhone(e.target.value)}
                              placeholder="+91 98765 01234"
                              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-stone-700 mb-1">
                            Email Address (ईमेल)
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                              type="email"
                              required
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                              placeholder="anita@gmail.com"
                              className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                            />
                          </div>
                        </div>
                      )}

                      {otpError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                          {otpError}
                        </div>
                      )}

                      <button
                        type="submit"
                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Send 6-Digit Secret Code (OTP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Very Simple OTP Input with Clear Simulator */
                    <form onSubmit={handleVerifyOtpAndRegister} className="space-y-4">
                      
                      {/* Big Friendly Green Box showing the OTP */}
                      <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold uppercase text-emerald-800 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            Secret Code Message (SMS)
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold">Just Now</span>
                        </div>

                        <p className="text-xs text-emerald-900">
                          Your secret code sent to <strong>{regAuthType === 'phone' ? regPhone : regEmail}</strong> is:
                        </p>

                        <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-emerald-300 shadow-xs">
                          <span className="font-mono text-2xl font-extrabold tracking-widest text-emerald-900">
                            {generatedOtp}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={copyOtpToClipboard}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                            >
                              {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setEnteredOtp(generatedOtp)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-800 text-white text-xs font-bold cursor-pointer hover:bg-emerald-900"
                            >
                              Auto-Fill Code
                            </button>
                          </div>
                        </div>

                        <p className="text-[11px] text-emerald-700">
                          Tap <strong>"Auto-Fill Code"</strong> or type the 6 numbers below!
                        </p>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Type the 6 Numbers Here
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={enteredOtp}
                          onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="6-digit code"
                          className="w-full text-center tracking-widest font-mono text-2xl font-black py-2.5 rounded-xl border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>

                      {otpError && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                          {otpError}
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOtpSent(false)}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                        >
                          Change Number
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold shadow-sm cursor-pointer"
                        >
                          Check Code & Finish
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-white py-5 text-center text-xs text-stone-500 font-medium">
        FarmTrack India · Made with love for Indian Farmers & Gaushalas · Cows, Goats, Sheep & Poultry
      </footer>
    </div>
  );
};
