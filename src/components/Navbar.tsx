import React, { useState } from 'react';
import { Farm, User } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { SUPPORTED_LANGUAGES, Language } from '../i18n/translations';
import { 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  Users, 
  ChevronDown, 
  Globe, 
  Settings, 
  Bell,
  Menu,
  X,
  GitBranch,
  Scale,
  Receipt
} from 'lucide-react';
import { CornerTemperature } from './CornerTemperature';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  currentFarm: Farm;
  currentUser: User;
  appName?: string;
  activeTab: 'inventory' | 'lineage' | 'vaccinations' | 'growth' | 'reports';
  onTabChange: (tab: 'inventory' | 'lineage' | 'vaccinations' | 'growth' | 'reports') => void;
  onOpenFarmSelection: () => void;
  onOpenTeamModal: () => void;
  onOpenAdminLocation?: () => void;
  onOpenSpeciesModal: () => void;
  onOpenVaccineAlertsModal?: () => void;
  onOpenLedger?: () => void;
  vaccineAlertsCount?: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFarm,
  currentUser,
  appName,
  activeTab,
  onTabChange,
  onOpenFarmSelection,
  onOpenTeamModal,
  onOpenAdminLocation,
  onOpenSpeciesModal,
  onOpenVaccineAlertsModal,
  onOpenLedger,
  vaccineAlertsCount = 0,
  onLogout,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [copiedId, setCopiedId] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const displayAppName = currentFarm.config?.appName || appName || 'Testing';

  const isAdmin = currentFarm.adminUserId === currentUser.id;
  const currentMember = currentFarm.members.find(m => m.userId === currentUser.id);
  const roleTitle = isAdmin 
    ? t('farmBoss', 'Farm Boss') 
    : (currentMember?.role === 'Veterinarian' ? 'Animal Doctor' : t('farmHelper', 'Farm Helper'));
  
  const pendingRequestsCount = currentFarm.joinRequests.filter(r => r.status === 'pending').length;

  const handleCopyFarmId = () => {
    navigator.clipboard.writeText(currentFarm.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  return (
    <>
      <header className="border-b border-stone-200 bg-white sticky top-0 z-30 shadow-2xs">
        
        {/* Top Bar Container - Perfectly balanced for both mobile viewports (<640px) and desktop */}
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-3">
          
          {/* Left Zone: Brand & Farm Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
            {/* Configured Application Name Badge */}
            <div className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-800 text-white rounded-xl sm:rounded-2xl text-xs font-black shrink-0 tracking-tight shadow-2xs">
              <span className="text-sm">🐐</span>
              <span className="font-extrabold max-w-[85px] sm:max-w-none truncate">{displayAppName}</span>
            </div>

            {/* Farm Selector Pill */}
            <button
              onClick={onOpenFarmSelection}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-stone-200 transition-all text-left group shrink-0 cursor-pointer max-w-[130px] sm:max-w-none"
              title="Tap to Change Farm or Make New Farm"
            >
              <span className="text-base sm:text-xl">🚜</span>
              <div className="min-w-0">
                <div className="text-xs font-black text-stone-900 group-hover:text-emerald-900 flex items-center gap-0.5 sm:gap-1">
                  <span className="truncate max-w-[70px] sm:max-w-[130px] md:max-w-none">{currentFarm.name}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 shrink-0" />
                </div>
                <div className="text-[10px] text-stone-500 font-medium truncate max-w-[120px] hidden sm:block">
                  {currentFarm.location}
                </div>
              </div>
            </button>

            {/* Farm Code with Copy Button (Visible on Tablet/Desktop) */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2 sm:px-2.5 py-1 rounded-xl shrink-0">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider">
                {t('farmCode', 'Farm Code')}:
              </span>
              <span className="font-mono text-xs font-black text-emerald-950">
                {currentFarm.id}
              </span>
              <button
                onClick={handleCopyFarmId}
                className="p-1 rounded hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer"
                title="Copy Farm Code to share"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Center Zone: Navigation Tabs for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl shrink-0">
            <button
              onClick={() => onTabChange('inventory')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'inventory'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🐐</span>
              <span>{t('allAnimals', 'Flock')}</span>
            </button>

            <button
              onClick={() => onTabChange('lineage')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lineage'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🌳</span>
              <span>{t('familyTree', 'Family Tree')}</span>
            </button>

            <button
              onClick={() => onTabChange('vaccinations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'vaccinations'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>💉</span>
              <span>{t('vaccines', 'Vaccines')}</span>
            </button>

            <button
              onClick={() => onTabChange('growth')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'growth'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚖️</span>
              <span>{t('weightGrowth', 'Flock Weight')}</span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📊</span>
              <span>Reports</span>
            </button>
          </nav>

          {/* Right Zone: Corner Weather, Alerts, Desktop Controls, and Mobile Drawer Trigger */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Live Corner Temperature Widget (Compact Pill on Mobile, Full on Desktop) */}
            <CornerTemperature 
              farm={currentFarm} 
              onOpenAdminLocation={onOpenAdminLocation} 
            />

            {/* Vaccine Alert Notification Bell */}
            <button
              onClick={onOpenVaccineAlertsModal}
              className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                vaccineAlertsCount > 0
                  ? 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-300/60 animate-pulse'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
              title="Vaccine Alerts & Due Notifications"
            >
              <Bell className={`w-4 h-4 ${vaccineAlertsCount > 0 ? 'text-amber-700 fill-amber-500/20' : 'text-stone-500'}`} />
              <span className="hidden xl:inline">
                {vaccineAlertsCount > 0 ? `${vaccineAlertsCount} Due` : 'Alerts'}
              </span>
              {vaccineAlertsCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
                  {vaccineAlertsCount}
                </span>
              )}
            </button>

            {/* Desktop Only: Language Selector Dropdown */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer text-stone-800"
                title="Change Language"
              >
                <span>{currentLangObj.flag}</span>
                <span className="font-bold text-xs">{currentLangObj.nativeName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {showLangMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowLangMenu(false)}
                  />
                  <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-stone-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-3 py-1 text-[10px] font-black uppercase text-stone-400 tracking-wider">
                      Select Language
                    </div>
                    {SUPPORTED_LANGUAGES.map(item => (
                      <button
                        key={item.code}
                        onClick={() => {
                          setLang(item.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                          lang === item.code 
                            ? 'bg-emerald-50 text-emerald-950 font-black' 
                            : 'text-stone-700 hover:bg-stone-50 font-medium'
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

            {/* Desktop Only: Financial Ledger Button */}
            <button
              onClick={onOpenLedger}
              className="hidden lg:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-black items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Farm Money Ledger"
            >
              <span className="text-emerald-800 font-black">₹</span>
              <span>{lang === 'hi' ? 'बहीखाता' : 'Ledger'}</span>
            </button>

            {/* Desktop Only: Farm Animals Setup Button */}
            <button
              onClick={onOpenSpeciesModal}
              className="hidden xl:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold items-center gap-1.5 cursor-pointer shrink-0"
              title={t('manageSpeciesTitle', 'Animals Available on this Farm')}
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span>{t('farmSettings', 'Animals')}</span>
            </button>

            {/* Desktop Only: Admin Tool Button */}
            <button
              onClick={onOpenTeamModal}
              className={`hidden sm:flex relative px-2.5 py-1.5 rounded-xl border text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                pendingRequestsCount > 0
                  ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
              title="Farm Admin Tool: Helpers, MySQL Database, Vaccines & Settings"
            >
              <Users className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden md:inline">
                {isAdmin ? 'Admin Tool' : t('farmHelpers', 'Farm Helpers')}
              </span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* In-App PWA Install Button for Offline Farm Use */}
            <PWAInstallButton variant="compact" className="hidden sm:flex" />

            {/* Desktop Only: User Role Badge */}
            <div className="hidden sm:flex items-center gap-2 border-l border-stone-200 pl-2 shrink-0">
              <div className="text-right">
                <div className="text-xs font-black text-stone-900 leading-tight truncate max-w-[80px] lg:max-w-[120px]">
                  {currentUser.name.split(' ')[0]}
                </div>
                <div className="text-[10px] font-bold">
                  {currentUser.isSuperAdmin ? (
                    <span className="text-purple-800 font-black">👑 Super Admin</span>
                  ) : isAdmin ? (
                    <span className="text-amber-800">👑 {roleTitle}</span>
                  ) : (
                    <span className="text-emerald-800">🚜 {roleTitle}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Only: Logout */}
            <button
              onClick={onLogout}
              className="hidden sm:flex p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
              title={t('signOut', 'Sign Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* MOBILE ONLY: Menu Drawer Trigger (Opens All Admin, Tools, and Farm Settings cleanly) */}
            <button
              onClick={() => setShowMobileDrawer(true)}
              className="sm:hidden p-2 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 active:scale-95 transition-all cursor-pointer relative shrink-0"
              title="Open Farm Menu & Admin Tools"
              aria-label="Open Farm Menu"
            >
              <Menu className="w-4 h-4" />
              {pendingRequestsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white"></span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE ACTION DRAWER / SHEET (Gives 100% full access to Admin Tool, Settings, Language, Lineage on phones) */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setShowMobileDrawer(false)}
          />

          {/* Drawer Body */}
          <div className="relative bg-white rounded-t-3xl border-t border-stone-200 shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto space-y-4 animate-in slide-in-from-bottom duration-200 safe-area-pb">
            {/* Grab Handle */}
            <div className="w-10 h-1 bg-stone-300 rounded-full mx-auto -mt-1 mb-2" />

            {/* Header of Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🚜</span>
                <div>
                  <h3 className="text-sm font-black text-stone-900">{currentFarm.name}</h3>
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 font-medium">
                    <span>{currentFarm.location}</span>
                    <span>·</span>
                    <span className="font-mono font-bold text-emerald-900">#{currentFarm.id}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowMobileDrawer(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Farm Code 1-Tap Copy Chip */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-950">
              <div className="flex items-center gap-2">
                <span className="text-emerald-700">📋</span>
                <span>Farm Code: <strong className="font-mono">{currentFarm.id}</strong></span>
              </div>
              <button
                onClick={handleCopyFarmId}
                className="px-2.5 py-1 rounded-xl bg-emerald-800 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all"
              >
                {copiedId ? 'Copied ✓' : 'Copy Code'}
              </button>
            </div>

            {/* Offline PWA Install Prompt in Mobile Drawer */}
            <PWAInstallButton variant="full" />

            {/* Primary Mobile Action Links */}
            <div className="grid grid-cols-2 gap-2 text-xs font-black">
              {/* Admin Tool */}
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenTeamModal();
                }}
                className="p-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 flex flex-col items-start justify-between min-h-[72px] cursor-pointer transition-all text-left shadow-2xs relative"
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-lg">⚙️</span>
                  {pendingRequestsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-600 text-white text-[10px] font-black">
                      {pendingRequestsCount} Pending
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-extrabold">Admin Tool</div>
                  <div className="text-[10px] text-amber-800 font-medium">Team, Location & App Name</div>
                </div>
              </button>

              {/* Farm Animals & Species Setup */}
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenSpeciesModal();
                }}
                className="p-3 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-900 flex flex-col items-start justify-between min-h-[72px] cursor-pointer transition-all text-left shadow-2xs"
              >
                <span className="text-lg">🐐</span>
                <div>
                  <div className="text-xs font-extrabold">Animals Setup</div>
                  <div className="text-[10px] text-stone-500 font-medium">Available Sheep & Goats</div>
                </div>
              </button>

              {/* Family Tree / Pedigree */}
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onTabChange('lineage');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-start justify-between min-h-[72px] cursor-pointer transition-all text-left shadow-2xs ${
                  activeTab === 'lineage' 
                    ? 'bg-emerald-900 text-white border-emerald-950' 
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-900'
                }`}
              >
                <span className="text-lg">🌳</span>
                <div>
                  <div className="text-xs font-extrabold">Family Tree</div>
                  <div className={`text-[10px] font-medium ${activeTab === 'lineage' ? 'text-emerald-200' : 'text-stone-500'}`}>
                    Parents & Matchmaking
                  </div>
                </div>
              </button>

              {/* Weight & Daily Milk */}
              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onTabChange('growth');
                }}
                className={`p-3 rounded-2xl border flex flex-col items-start justify-between min-h-[72px] cursor-pointer transition-all text-left shadow-2xs ${
                  activeTab === 'growth' 
                    ? 'bg-emerald-900 text-white border-emerald-950' 
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-900'
                }`}
              >
                <span className="text-lg">⚖️</span>
                <div>
                  <div className="text-xs font-extrabold">Weight & Growth</div>
                  <div className={`text-[10px] font-medium ${activeTab === 'growth' ? 'text-emerald-200' : 'text-stone-500'}`}>
                    Body condition & records
                  </div>
                </div>
              </button>
            </div>

            {/* Language Selector in Drawer */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[11px] font-black uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-500" />
                <span>Language (भाषा / ಭಾಷೆ)</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SUPPORTED_LANGUAGES.map(item => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setLang(item.code);
                      setShowMobileDrawer(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center justify-between border cursor-pointer transition-all ${
                      lang === item.code 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-black' 
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50 font-medium'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span>{item.flag}</span>
                      <span>{item.nativeName}</span>
                    </span>
                    {lang === item.code && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile & Sign Out Footer */}
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-sm font-black text-stone-700 shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-stone-900 truncate">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-800">
                    {roleTitle}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowMobileDrawer(false);
                  onLogout();
                }}
                className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 text-xs font-black flex items-center gap-1.5 cursor-pointer transition-colors shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* THUMB-FRIENDLY FIXED BOTTOM NAVIGATION BAR FOR MOBILE (360px - 430px safe, zero overlap) */}
      <nav aria-label="Mobile Navigation" className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200 px-1 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb">
        {/* 1. Flock & Herd */}
        <button
          onClick={() => onTabChange('inventory')}
          className={`flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'inventory' 
              ? 'text-emerald-900 font-black scale-105' 
              : 'text-stone-500 font-bold hover:text-stone-800'
          }`}
        >
          <span className="text-xl">🐐</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'रेवड़' : 'Flock'}</span>
        </button>

        {/* 2. Family Tree & Pedigree */}
        <button
          onClick={() => onTabChange('lineage')}
          className={`flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'lineage' 
              ? 'text-emerald-900 font-black scale-105' 
              : 'text-stone-500 font-bold hover:text-stone-800'
          }`}
        >
          <span className="text-xl">🌳</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'खानदान' : 'Pedigree'}</span>
        </button>

        {/* 3. Vaccines */}
        <button
          onClick={() => onTabChange('vaccinations')}
          className={`flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer relative ${
            activeTab === 'vaccinations' 
              ? 'text-emerald-900 font-black scale-105' 
              : 'text-stone-500 font-bold hover:text-stone-800'
          }`}
        >
          <span className="text-xl">💉</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'टीके' : 'Vaccines'}</span>
          {vaccineAlertsCount > 0 && (
            <span className="absolute top-0 right-1 w-2.5 h-2.5 rounded-full bg-red-600 ring-2 ring-white"></span>
          )}
        </button>

        {/* 4. Weight & Growth */}
        <button
          onClick={() => onTabChange('growth')}
          className={`flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'growth' 
              ? 'text-emerald-900 font-black scale-105' 
              : 'text-stone-500 font-bold hover:text-stone-800'
          }`}
        >
          <span className="text-xl">⚖️</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'वजन' : 'Weight'}</span>
        </button>

        {/* 5. Reports & Profit */}
        <button
          onClick={() => onTabChange('reports')}
          className={`flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'reports' 
              ? 'text-emerald-900 font-black scale-105' 
              : 'text-stone-500 font-bold hover:text-stone-800'
          }`}
        >
          <span className="text-xl">📊</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'रिपोर्ट' : 'Reports'}</span>
        </button>
      </nav>
    </>
  );
};
