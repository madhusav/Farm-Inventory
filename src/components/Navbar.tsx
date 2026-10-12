import React, { useState } from 'react';
import { Farm, User } from '../types';
import { 
  Building2, 
  Copy, 
  Check, 
  LogOut, 
  Users, 
  Layers, 
  GitBranch, 
  Syringe, 
  Activity, 
  ChevronDown
} from 'lucide-react';

interface NavbarProps {
  currentFarm: Farm;
  currentUser: User;
  activeTab: 'inventory' | 'lineage' | 'vaccinations' | 'growth';
  onTabChange: (tab: 'inventory' | 'lineage' | 'vaccinations' | 'growth') => void;
  onOpenFarmSelection: () => void;
  onOpenTeamModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentFarm,
  currentUser,
  activeTab,
  onTabChange,
  onOpenFarmSelection,
  onOpenTeamModal,
  onLogout,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const isAdmin = currentFarm.adminUserId === currentUser.id;
  const currentMember = currentFarm.members.find(m => m.userId === currentUser.id);
  const roleTitle = isAdmin ? 'Farm Boss' : (currentMember?.role === 'Veterinarian' ? 'Animal Doctor' : 'Farm Helper');
  const pendingRequestsCount = currentFarm.joinRequests.filter(r => r.status === 'pending').length;

  const handleCopyFarmId = () => {
    navigator.clipboard.writeText(currentFarm.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <header className="border-b border-stone-200 bg-white sticky top-0 z-30">
      
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Left: Farm Name & Farm Code */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onOpenFarmSelection}
            className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-stone-100 hover:bg-stone-200 transition-all text-left group shrink-0 cursor-pointer"
            title="Tap to Change Farm or Make New Farm"
          >
            <span className="text-xl">🚜</span>
            <div className="hidden sm:block">
              <div className="text-xs font-black text-stone-900 group-hover:text-emerald-900 flex items-center gap-1">
                <span>{currentFarm.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400 group-hover:text-stone-700" />
              </div>
              <div className="text-[11px] text-stone-500 font-medium">
                {currentFarm.location}
              </div>
            </div>
          </button>

          {/* Farm Code with Copy Button */}
          <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-xl">
            <span className="text-[10px] font-black text-emerald-900 uppercase tracking-wider hidden md:inline">
              Farm Code:
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
        <nav className="hidden lg:flex items-center gap-1.5 bg-stone-100 p-1 rounded-2xl">
          <button
            onClick={() => onTabChange('inventory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🐄</span>
            <span>All Animals</span>
          </button>

          <button
            onClick={() => onTabChange('lineage')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lineage'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🌳</span>
            <span>Family Tree</span>
          </button>

          <button
            onClick={() => onTabChange('vaccinations')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'vaccinations'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>💉</span>
            <span>Vaccines</span>
          </button>

          <button
            onClick={() => onTabChange('growth')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'growth'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>⚖️</span>
            <span>Weight & Milk</span>
          </button>
        </nav>

        {/* Right: Farm Helpers & Role Badge */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Helpers / Approvals Button */}
          <button
            onClick={onOpenTeamModal}
            className={`relative px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
              pendingRequestsCount > 0
                ? 'border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100'
                : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
            }`}
            title="Farm Helpers & Approvals"
          >
            <Users className="w-3.5 h-3.5 text-stone-600" />
            <span className="hidden sm:inline">Farm Helpers</span>
            {pendingRequestsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white text-[10px] font-bold flex items-center justify-center">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          {/* User Role Badge */}
          <div className="hidden sm:flex items-center gap-2 border-l border-stone-200 pl-3">
            <div className="text-right">
              <div className="text-xs font-black text-stone-900 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] font-bold">
                {isAdmin ? (
                  <span className="text-amber-800">👑 Farm Boss (Full Delete)</span>
                ) : (
                  <span className="text-emerald-800">🚜 {roleTitle} (No Delete)</span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="lg:hidden border-t border-stone-200 px-3 py-2 bg-stone-50 flex items-center justify-around gap-1">
        <button
          onClick={() => onTabChange('inventory')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'inventory' ? 'bg-emerald-800 text-white' : 'text-stone-600'
          }`}
        >
          🐄 Animals
        </button>
        <button
          onClick={() => onTabChange('lineage')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'lineage' ? 'bg-emerald-800 text-white' : 'text-stone-600'
          }`}
        >
          🌳 Family
        </button>
        <button
          onClick={() => onTabChange('vaccinations')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'vaccinations' ? 'bg-emerald-800 text-white' : 'text-stone-600'
          }`}
        >
          💉 Vaccines
        </button>
        <button
          onClick={() => onTabChange('growth')}
          className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
            activeTab === 'growth' ? 'bg-emerald-800 text-white' : 'text-stone-600'
          }`}
        >
          ⚖️ Weight
        </button>
      </div>
    </header>
  );
};
