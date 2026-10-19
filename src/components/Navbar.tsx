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
  Bell
} from 'lucide-react';

interface NavbarProps {
  currentFarm: Farm;
  currentUser: User;
  activeTab: 'inventory' | 'lineage' | 'vaccinations' | 'growth' | 'reports';
  onTabChange: (tab: 'inventory' | 'lineage' | 'vaccinations' | 'growth' | 'reports') => void;
  onOpenFarmSelection: () => void;
  onOpenTeamModal: () => void;
  onOpenSpeciesModal: () => void;
  onOpenVaccineAlertsModal?: () => void;
  onOpenLedger?: () => void;
  onOpenMilkModal?: () => void;
  vaccineAlertsCount?: number;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFarm,
  currentUser,
  activeTab,
  onTabChange,
  onOpenFarmSelection,
  onOpenTeamModal,
  onOpenSpeciesModal,
  onOpenVaccineAlertsModal,
  onOpenLedger,
  onOpenMilkModal,
  vaccineAlertsCount = 0,
  onLogout,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [copiedId, setCopiedId] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);

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
        
        {/* Top Bar */}
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-3">
          
          {/* Left: Farm Name & Farm Code */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={onOpenFarmSelection}
              className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-all text-left group shrink-0 cursor-pointer"
              title="Tap to Change Farm or Make New Farm"
            >
              <span className="text-xl">🚜</span>
              <div className="hidden sm:block">
                <div className="text-xs font-black text-stone-900 group-hover:text-emerald-900 flex items-center gap-1">
                  <span className="truncate max-w-[140px] md:max-w-none">{currentFarm.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700 shrink-0" />
                </div>
                <div className="text-[11px] text-stone-500 font-medium truncate max-w-[140px]">
                  {currentFarm.location}
                </div>
              </div>
            </button>

            {/* Farm Code with Copy Button */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2 sm:px-2.5 py-1 rounded-xl shrink-0">
              <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider hidden md:inline">
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

          {/* Center: Navigation Tabs for Desktop */}
          <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
            <button
              onClick={() => onTabChange('inventory')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
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
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'growth'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚖️</span>
              <span>{t('weightAndMilk', 'Weight & Milk')}</span>
            </button>

            <button
              onClick={() => onTabChange('reports')}
              className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reports'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>📊</span>
              <span>Reports & Profit</span>
            </button>
          </nav>

          {/* Right: Language Selector, Alerts, Ledger, Animals Setup & User Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="px-2.5 py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-xs font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer text-stone-800"
                title="Change Language (भाषा बदलें / ಭಾಷೆ ಬದಲಾಯಿಸಿ)"
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
                      Select Language / भाषा
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

            {/* Vaccine Nearing Alert Notification Bell */}
            <button
              onClick={onOpenVaccineAlertsModal}
              className={`relative p-2 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                vaccineAlertsCount > 0
                  ? 'border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-300/60 animate-pulse'
                  : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
              title="Vaccine Alerts & Due Notifications"
            >
              <Bell className={`w-4 h-4 ${vaccineAlertsCount > 0 ? 'text-amber-700 fill-amber-500/20' : 'text-stone-500'}`} />
              <span className="hidden xl:inline">
                {vaccineAlertsCount > 0 ? `${vaccineAlertsCount} Shots Due` : 'Alerts'}
              </span>
              {vaccineAlertsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  {vaccineAlertsCount}
                </span>
              )}
            </button>

            {/* Financial Ledger Button (Desktop) */}
            <button
              onClick={onOpenLedger}
              className="hidden sm:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 text-xs font-black items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
              title="Farm Money Ledger: Track income and expenses"
            >
              <span className="text-emerald-800 font-black">₹</span>
              <span>{lang === 'hi' ? 'बहीखाता' : 'Ledger'}</span>
            </button>

            {/* Farm Animals Setup Button */}
            <button
              onClick={onOpenSpeciesModal}
              className="hidden md:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold items-center gap-1.5 cursor-pointer shrink-0"
              title={t('manageSpeciesTitle', 'Animals Available on this Farm')}
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span className="hidden xl:inline">{t('farmSettings', 'Animals')}</span>
            </button>

            {/* Admin Tool / Helpers / Approvals Button */}
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
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* User Role Badge */}
            <div className="hidden sm:flex items-center gap-2 border-l border-stone-200 pl-2.5 shrink-0">
              <div className="text-right">
                <div className="text-xs font-black text-stone-900 leading-tight truncate max-w-[100px]">
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

            {/* Logout */}
            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
              title={t('signOut', 'Sign Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

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

        {/* 2. Record Milk */}
        <button
          onClick={() => {
            if (onOpenMilkModal) {
              onOpenMilkModal();
            } else {
              onTabChange('growth');
            }
          }}
          className="flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-0.5 rounded-xl text-stone-600 font-bold hover:text-sky-900 transition-all cursor-pointer"
        >
          <span className="text-xl">🥛</span>
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{lang === 'hi' ? 'दूध' : 'Milk'}</span>
        </button>

        {/* 3. Money Ledger (Khata) */}
        <button
          onClick={() => {
            if (onOpenLedger) onOpenLedger();
          }}
          className="flex-1 min-w-0 max-w-[72px] flex flex-col items-center justify-center py-1 px-1 rounded-2xl bg-emerald-800 text-white font-black shadow-md transition-all cursor-pointer scale-105"
        >
          <span className="text-lg">₹</span>
          <span className="text-[10px] leading-tight truncate w-full text-center">{lang === 'hi' ? 'बहीखाता' : 'Ledger'}</span>
        </button>

        {/* 4. Vaccines */}
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
