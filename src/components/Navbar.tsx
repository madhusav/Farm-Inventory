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
  activeTab: 'inventory' | 'lineage' | 'vaccinations' | 'growth';
  onTabChange: (tab: 'inventory' | 'lineage' | 'vaccinations' | 'growth') => void;
  onOpenFarmSelection: () => void;
  onOpenTeamModal: () => void;
  onOpenSpeciesModal: () => void;
  onOpenVaccineAlertsModal?: () => void;
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

        {/* Center: Simple Navigation Tabs for 6-7 year old kid */}
        <nav className="hidden lg:flex items-center gap-1 bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => onTabChange('inventory')}
            className={`px-3 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🐄</span>
            <span>{t('allAnimals', 'All Animals')}</span>
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
        </nav>

        {/* Right: Language Selector, Farm Animals Setup, Helpers & User Badge */}
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

          {/* Farm Animals Setup Button */}
          <button
            onClick={onOpenSpeciesModal}
            className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            title={t('manageSpeciesTitle', 'Animals Available on this Farm')}
          >
            <Settings className="w-4 h-4 text-stone-600" />
            <span className="hidden xl:inline">{t('farmSettings', 'Animals')}</span>
          </button>

          {/* Admin Tool / Helpers / Approvals Button */}
          <button
            onClick={onOpenTeamModal}
            className={`relative px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
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
          <div className="hidden sm:flex items-center gap-2 border-l border-stone-200 pl-2.5">
            <div className="text-right">
              <div className="text-xs font-black text-stone-900 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] font-bold">
                {isAdmin ? (
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
            className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            title={t('signOut', 'Sign Out')}
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-stone-200 px-2 py-1.5 bg-stone-50 flex items-center justify-around gap-1">
        <button
          onClick={() => onTabChange('inventory')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'inventory' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600'
          }`}
        >
          🐄 {t('allAnimals', 'Animals')}
        </button>
        <button
          onClick={() => onTabChange('lineage')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'lineage' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600'
          }`}
        >
          🌳 {t('familyTree', 'Family')}
        </button>
        <button
          onClick={() => onTabChange('vaccinations')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'vaccinations' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600'
          }`}
        >
          💉 {t('vaccines', 'Vaccines')}
        </button>
        <button
          onClick={() => onTabChange('growth')}
          className={`px-2.5 py-1.5 rounded-xl text-xs font-black transition-all ${
            activeTab === 'growth' ? 'bg-emerald-800 text-white shadow-xs' : 'text-stone-600'
          }`}
        >
          ⚖️ {t('weightAndMilk', 'Weight')}
        </button>
      </div>
    </header>
  );
};
