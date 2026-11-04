import React, { useState, useEffect, useRef } from 'react';
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
  Receipt,
  ListTodo,
  Target,
  User as UserIcon,
  Phone
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
  onOpenTasksModal?: (filter?: any) => void;
  onOpenLedger?: () => void;
  onOpenSystemAdmin?: () => void;
  onOpenSymptomChecker?: () => void;
  vaccineAlertsCount?: number;
  tasksCount?: number;
  dueRemindersCount?: number;
  pendingBreedProposalsCount?: number;
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
  onOpenTasksModal,
  onOpenLedger,
  onOpenSystemAdmin,
  onOpenSymptomChecker,
  vaccineAlertsCount = 0,
  tasksCount = 0,
  dueRemindersCount = 0,
  pendingBreedProposalsCount = 0,
  onLogout,
}) => {
  const { lang, setLang, t } = useLanguage();
  const [copiedId, setCopiedId] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close User Details menu on click outside or Escape key
  useEffect(() => {
    if (!showUserDetails) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserDetails(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowUserDetails(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserDetails]);

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
            {/* Desktop Only: Configured Application Name Badge */}
            <div className="hidden sm:flex items-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-800 text-white rounded-xl sm:rounded-2xl text-xs font-black shrink-0 tracking-tight shadow-2xs">
              <span className="text-sm">🐐</span>
              <span className="font-extrabold max-w-[85px] sm:max-w-none truncate">{displayAppName}</span>
            </div>

            {/* Farm Selector Pill */}
            <button
              onClick={onOpenFarmSelection}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl sm:rounded-2xl bg-stone-100 hover:bg-stone-200 transition-all text-left group shrink-0 cursor-pointer max-w-[125px] sm:max-w-none shadow-2xs"
              title="Tap to Change Farm or Make New Farm"
            >
              <span className="text-base sm:text-xl">🚜</span>
              <div className="min-w-0">
                <div className="text-xs font-black text-stone-900 group-hover:text-emerald-900 flex items-center gap-0.5 sm:gap-1">
                  <span className="truncate max-w-[75px] xs:max-w-[110px] sm:max-w-[130px] md:max-w-none">{currentFarm.name}</span>
                  <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-stone-700 shrink-0" />
                </div>
                <div className="text-[10px] text-stone-500 font-medium truncate max-w-[120px] hidden sm:block">
                  {currentFarm.location}
                </div>
              </div>
            </button>

            {/* Mobile Only: Live Corner Temperature (Stationed in the corner next to the farm) */}
            <div className="sm:hidden shrink-0">
              <CornerTemperature 
                farm={currentFarm} 
                onOpenAdminLocation={onOpenAdminLocation} 
              />
            </div>

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
              <span>{t('reports', 'Reports')}</span>
            </button>
          </nav>

          {/* Right Zone: Alerts, Controls, User Icon & Corner Temperature */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">

            {/* Vaccine Alert Notification Bell */}
            <button
              onClick={onOpenVaccineAlertsModal}
              className={`relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                vaccineAlertsCount > 0
                  ? 'flex border-amber-400 bg-amber-50 text-amber-950 hover:bg-amber-100 ring-2 ring-amber-300/60 animate-pulse'
                  : 'hidden sm:flex border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
              }`}
              title="Vaccine Alerts & Due Notifications"
            >
              <Bell className={`w-4 h-4 ${vaccineAlertsCount > 0 ? 'text-amber-700 fill-amber-500/20' : 'text-stone-500'}`} />
              <span className="hidden xl:inline">
                {vaccineAlertsCount > 0 ? `${vaccineAlertsCount} ${t('vaccineDue', 'Due')}` : t('alerts', 'Alerts')}
              </span>
              {vaccineAlertsCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-600 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs">
                  {vaccineAlertsCount}
                </span>
              )}
            </button>

            {/* Sheep & Goat Tasks, Targets & Reminders Button (Desktop/Tablet Only) */}
            {onOpenTasksModal && (
              <button
                onClick={() => onOpenTasksModal('all')}
                className={`hidden md:flex relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border text-xs font-bold items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
                  dueRemindersCount > 0
                    ? 'border-purple-400 bg-purple-50 text-purple-950 hover:bg-purple-100 ring-2 ring-purple-300/60'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
                title="Sheep & Goat Tasks, Target Progress & Reminders"
              >
                <Target className={`w-4 h-4 ${dueRemindersCount > 0 ? 'text-purple-700' : 'text-stone-600'}`} />
                <span className="hidden xl:inline">
                  {dueRemindersCount > 0 ? `${dueRemindersCount} ${t('tasksAndTargets', 'Tasks Due')}` : t('tasksAndTargets', 'Tasks & Targets')}
                </span>
                {tasksCount > 0 && (
                  <span className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center shadow-xs ${
                    dueRemindersCount > 0 ? 'bg-purple-700 animate-pulse' : 'bg-emerald-700'
                  }`}>
                    {dueRemindersCount > 0 ? dueRemindersCount : tasksCount}
                  </span>
                )}
              </button>
            )}

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
              title={t('ledger', 'Farm Money Ledger')}
            >
              <span className="text-emerald-800 font-black">₹</span>
              <span className="hidden xl:inline">{t('ledger', 'Ledger')}</span>
            </button>

            {/* Desktop Only: Symptom Checker & Offline First Aid Button */}
            {onOpenSymptomChecker && (
              <button
                onClick={onOpenSymptomChecker}
                className="hidden lg:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-950 text-xs font-black items-center gap-1.5 cursor-pointer shadow-2xs shrink-0"
                title="Sheep & Goat Offline Symptom Checker & First Aid"
              >
                <span>🩺</span>
                <span className="hidden xl:inline">{t('symptomChecker', 'Symptom Checker')}</span>
              </button>
            )}

            {/* Desktop Only: Farm Animals Setup Button */}
            <button
              onClick={onOpenSpeciesModal}
              className="hidden xl:flex p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 text-xs font-bold items-center gap-1.5 cursor-pointer shrink-0"
              title={t('manageSpeciesTitle', 'Animals Available on this Farm')}
            >
              <Settings className="w-4 h-4 text-stone-600" />
              <span className="hidden 2xl:inline">{t('farmSettings', 'Animals')}</span>
            </button>

            {/* Desktop Only: Admin Tool Button */}
            <button
              onClick={onOpenTeamModal}
              className={`hidden sm:flex relative px-2.5 py-1.5 rounded-xl border text-xs font-bold items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                pendingRequestsCount > 0
                  ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                  : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
              }`}
              title="Farm Admin Tool: Helpers, Database, Vaccines & Settings"
            >
              <Users className="w-3.5 h-3.5 text-stone-600" />
              <span className="hidden xl:inline">
                {isAdmin ? t('adminTool', 'Admin Tool') : t('farmHelpers', 'Farm Helpers')}
              </span>
              {pendingRequestsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[9px] font-bold flex items-center justify-center">
                  {pendingRequestsCount}
                </span>
              )}
            </button>

            {/* Desktop Only: System Admin Dashboard Trigger */}
            {onOpenSystemAdmin && (
              <button
                onClick={onOpenSystemAdmin}
                className={`hidden md:flex relative px-2.5 py-1.5 rounded-xl border text-xs font-black items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                  pendingBreedProposalsCount > 0
                    ? 'border-purple-400 bg-purple-50 text-purple-950 hover:bg-purple-100 ring-2 ring-purple-300/60'
                    : 'border-purple-200 bg-purple-50/60 text-purple-900 hover:bg-purple-100'
                }`}
                title="System Admin Dashboard: Approve / Reject Breed Proposals & Manage Universal Catalog"
              >
                <span className="text-sm">🛡️</span>
                <span className="hidden 2xl:inline">{t('systemAdmin', 'System Admin')}</span>
                {pendingBreedProposalsCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-purple-700 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {pendingBreedProposalsCount}
                  </span>
                )}
              </button>
            )}

            {/* In-App PWA Install Button for Offline Farm Use */}
            <PWAInstallButton variant="compact" className="hidden sm:flex" />

            {/* USER ICON / AVATAR BUTTON & POPOVER (No text fullname in navbar! Click opens User Details) */}
            <div className="relative shrink-0" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setShowUserDetails(!showUserDetails)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all cursor-pointer relative shadow-2xs ${
                  showUserDetails
                    ? 'ring-2 ring-emerald-600 bg-emerald-200 text-emerald-950 scale-105'
                    : 'bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 hover:ring-2 hover:ring-emerald-400/60'
                }`}
                title={`${currentUser.name} (${roleTitle}) - ${t('userDetails', 'Click for User Details')}`}
                aria-label="User details & profile"
              >
                <UserIcon className="w-4 h-4 text-emerald-800" />
                {/* Role Status Dot */}
                <span className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-white ${
                  currentUser.isSuperAdmin 
                    ? 'bg-purple-600' 
                    : isAdmin 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-600'
                }`} />
              </button>

              {/* USER DETAILS POPOVER */}
              {showUserDetails && (
                <div className="absolute right-0 mt-2 w-[calc(100vw-28px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3.5 sm:p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  
                  {/* Top: Avatar & User Info */}
                  <div className="flex items-start justify-between gap-2.5 border-b border-stone-100 pb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-950 font-black text-base sm:text-lg flex items-center justify-center shrink-0 shadow-2xs">
                        {currentUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate">
                          {currentUser.name}
                        </h4>
                        <div className="text-[11px] text-stone-500 font-medium truncate flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                          <span className="truncate">{currentUser.phone || currentUser.identifier || 'Farm User'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setShowUserDetails(false)}
                      className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center cursor-pointer transition-colors shrink-0"
                      title="Close"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Role Badge Card */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold ${
                    currentUser.isSuperAdmin
                      ? 'bg-purple-50 border-purple-200 text-purple-950'
                      : isAdmin
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className="text-base">
                        {currentUser.isSuperAdmin ? '👑' : isAdmin ? '👑' : currentMember?.role === 'Veterinarian' ? '🩺' : '🚜'}
                      </span>
                      <div>
                        <div className="text-[10px] uppercase font-black tracking-wider opacity-70">
                          {t('userRole', 'Farm Role')}
                        </div>
                        <div className="font-black text-xs">
                          {currentUser.isSuperAdmin ? 'Super Admin' : roleTitle}
                        </div>
                      </div>
                    </div>
                    {currentUser.isSuperAdmin && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black">
                        All Farms
                      </span>
                    )}
                  </div>

                  {/* Active Farm Context */}
                  <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="text-[10px] font-black uppercase text-stone-400 tracking-wider">
                        {t('currentFarm', 'Current Farm')}
                      </div>
                      <button
                        onClick={() => {
                          setShowUserDetails(false);
                          onOpenFarmSelection();
                        }}
                        className="text-[11px] font-black text-emerald-800 hover:text-emerald-950 hover:underline cursor-pointer"
                      >
                        {t('switchFarm', 'Switch Farm')} →
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="font-black text-stone-900 truncate">
                          🚜 {currentFarm.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          📍 {currentFarm.location}
                        </div>
                      </div>
                      
                      <button
                        onClick={handleCopyFarmId}
                        className="px-2 py-1 rounded-lg bg-white border border-stone-200 text-stone-700 hover:bg-stone-100 text-[11px] font-bold flex items-center gap-1 cursor-pointer shrink-0 transition-all active:scale-95 shadow-2xs"
                        title="Copy Farm Code"
                      >
                        <span className="font-mono text-emerald-900 font-black">#{currentFarm.id}</span>
                        {copiedId ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3 text-stone-400" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick Actions List */}
                  <div className="space-y-1 pt-0.5">
                    <button
                      onClick={() => {
                        setShowUserDetails(false);
                        onOpenTeamModal();
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-stone-700 hover:bg-stone-100 flex items-center justify-between cursor-pointer transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <span>⚙️</span>
                        <span>{isAdmin ? t('adminTool', 'Farm Admin Tool') : t('farmHelpers', 'Farm Helpers')}</span>
                      </span>
                      {pendingRequestsCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black">
                          {pendingRequestsCount}
                        </span>
                      )}
                    </button>

                    {onOpenSystemAdmin && (
                      <button
                        onClick={() => {
                          setShowUserDetails(false);
                          onOpenSystemAdmin();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-purple-900 hover:bg-purple-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>🛡️</span>
                          <span>{t('systemAdmin', 'System Admin Dashboard')}</span>
                        </span>
                        {pendingBreedProposalsCount > 0 && (
                          <span className="px-1.5 py-0.5 rounded-full bg-purple-700 text-white text-[10px] font-black">
                            {pendingBreedProposalsCount}
                          </span>
                        )}
                      </button>
                    )}

                    {onOpenSymptomChecker && (
                      <button
                        onClick={() => {
                          setShowUserDetails(false);
                          onOpenSymptomChecker();
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-teal-900 hover:bg-teal-50 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <span>🩺</span>
                          <span>{t('symptomChecker', 'Symptom Checker & First Aid')}</span>
                        </span>
                        <span className="text-[10px] text-teal-700 font-black">Offline Guide</span>
                      </button>
                    )}
                  </div>

                  {/* Sign Out Action */}
                  <div className="pt-2 border-t border-stone-100">
                    <button
                      onClick={() => {
                        setShowUserDetails(false);
                        onLogout();
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-black flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>{t('signOut', 'Sign Out')}</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Visual Divider between User and Corner Weather */}
            <div className="h-6 w-px bg-stone-200 mx-0.5 sm:mx-1 hidden sm:block shrink-0" />

            {/* Desktop Only: LIVE CORNER TEMPERATURE WIDGET (Positioned in the corner where it has dedicated breathing room) */}
            <div className="hidden sm:flex shrink-0 items-center pl-0.5">
              <CornerTemperature 
                farm={currentFarm} 
                onOpenAdminLocation={onOpenAdminLocation} 
              />
            </div>

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
                <span>{t('farmCode', 'Farm Code')}: <strong className="font-mono">{currentFarm.id}</strong></span>
              </div>
              <button
                onClick={handleCopyFarmId}
                className="px-2.5 py-1 rounded-xl bg-emerald-800 text-white text-[11px] font-black cursor-pointer active:scale-95 transition-all"
              >
                {copiedId ? t('copied', 'Copied ✓') : t('copyCode', 'Copy Code')}
              </button>
            </div>

            {/* Offline PWA Install Prompt in Mobile Drawer */}
            <PWAInstallButton variant="full" />

            {/* System Admin Dashboard in Mobile Drawer */}
            {onOpenSystemAdmin && (
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenSystemAdmin();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-purple-950 via-stone-900 to-stone-950 text-white flex items-center justify-between cursor-pointer shadow-xs active:scale-98 transition-all border border-purple-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🛡️</span>
                  <div className="text-left">
                    <div className="text-xs font-black">{t('systemAdmin', 'System Admin')}</div>
                    <div className="text-[10px] text-purple-200 font-medium">Review & Approve Breed Proposals</div>
                  </div>
                </div>
                {pendingBreedProposalsCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black animate-pulse">
                    {pendingBreedProposalsCount} Pending
                  </span>
                ) : (
                  <span className="text-stone-400 text-xs">→</span>
                )}
              </button>
            )}

            {/* Sheep & Goat Tasks & Targets in Mobile Drawer */}
            {onOpenTasksModal && (
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenTasksModal('all');
                }}
                className={`w-full p-3 rounded-2xl flex items-center justify-between cursor-pointer shadow-xs active:scale-98 transition-all border ${
                  dueRemindersCount > 0
                    ? 'bg-gradient-to-r from-purple-900 via-stone-900 to-stone-900 text-white border-purple-400/50 ring-2 ring-purple-400/30'
                    : 'bg-emerald-900 text-white border-emerald-800'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🎯</span>
                  <div className="text-left">
                    <div className="text-xs font-black flex items-center gap-2">
                      <span>{t('flockTasksTargets', 'Flock Tasks & Targets')}</span>
                      {dueRemindersCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse">
                          {dueRemindersCount} {t('dueToday', 'Due Today!')}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-emerald-200 font-medium">
                      Shearing, deworming, dipping & staff reminders
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-xs font-mono font-bold">
                    {tasksCount}
                  </span>
                  <span className="text-stone-300 text-xs">→</span>
                </div>
              </button>
            )}

            {/* Offline Sheep & Goat Symptom Checker in Mobile Drawer */}
            {onOpenSymptomChecker && (
              <button
                type="button"
                onClick={() => {
                  setShowMobileDrawer(false);
                  onOpenSymptomChecker();
                }}
                className="w-full p-3 rounded-2xl bg-gradient-to-r from-teal-900 via-emerald-950 to-stone-900 text-white flex items-center justify-between cursor-pointer shadow-xs active:scale-98 transition-all border border-teal-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🩺</span>
                  <div className="text-left">
                    <div className="text-xs font-black flex items-center gap-2">
                      <span>{t('symptomChecker', 'Symptom Checker & First Aid')}</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500/40 text-emerald-200 text-[9px] font-black uppercase">
                        Offline
                      </span>
                    </div>
                    <div className="text-[10px] text-teal-200 font-medium">
                      Bloat, cough, worms, diarrhea & emergency steps
                    </div>
                  </div>
                </div>
                <span className="text-stone-300 text-xs">→</span>
              </button>
            )}

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
                  <div className="text-xs font-extrabold">{t('adminTool', 'Admin Tool')}</div>
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
                  <div className="text-xs font-extrabold">{t('farmSettings', 'Animals Setup')}</div>
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
                  <div className="text-xs font-extrabold">{t('familyTree', 'Family Tree')}</div>
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
                  <div className="text-xs font-extrabold">{t('weightGrowth', 'Weight & Growth')}</div>
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
                <span>{t('language', 'Language')}</span>
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
                <span>{t('signOut', 'Sign Out')}</span>
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
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{t('flock', 'Flock')}</span>
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
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{t('pedigree', 'Pedigree')}</span>
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
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{t('vaccines', 'Vaccines')}</span>
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
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{t('weight', 'Weight')}</span>
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
          <span className="text-[10px] mt-0.5 truncate w-full text-center">{t('reports', 'Reports')}</span>
        </button>
      </nav>
    </>
  );
};
