import React, { useState } from 'react';
import { Farm, User, Species } from '../types';
import { db } from '../services/db';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Lock,
  Plus,
  ShieldAlert,
  Crown,
  Users,
  Check
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface FarmSelectionModalProps {
  currentUser: User;
  farms: Farm[];
  onSelectFarm: (farm: Farm) => void;
  onCreateFarm: (newFarm: Farm) => void;
  onRequestJoinFarm: (farmId: string, message: string) => void;
  onLogout: () => void;
}

export const FarmSelectionModal: React.FC<FarmSelectionModalProps> = ({
  currentUser,
  farms,
  onSelectFarm,
  onCreateFarm,
  onRequestJoinFarm,
  onLogout,
}) => {
  const { t, localeText } = useLanguage();
  const isSuperAdmin = db.isSuperAdmin(currentUser);

  // Farms where current user is already an active member or admin (or all if Super Admin)
  const allSystemFarms = isSuperAdmin ? db.getAllTenantsForSuperAdmin() : farms;
  const myFarms = isSuperAdmin 
    ? allSystemFarms 
    : farms.filter(f => 
        f.members.some(m => m.userId === currentUser.id && m.status === 'active') ||
        f.adminUserId === currentUser.id
      );

  const isBrandNewUser = myFarms.length === 0;

  // Active tab: If user has no farm yet, default to 'create' (Become Boss)
  const [activeTab, setActiveTab] = useState<'create' | 'existing'>(() => 
    isBrandNewUser ? 'create' : 'existing'
  );

  // Search existing farm
  const [farmSearchQuery, setFarmSearchQuery] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedFarmToJoin, setSelectedFarmToJoin] = useState<Farm | null>(null);
  const [joinSuccessNotice, setJoinSuccessNotice] = useState('');

  // Create new farm
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmId, setNewFarmId] = useState(() => `FARM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newLocation, setNewLocation] = useState('Ahmednagar, Maharashtra');
  const [newAcreage, setNewAcreage] = useState('15');
  const [newSpecies, setNewSpecies] = useState<Species[]>(['Goat', 'Sheep']);
  const [withStarterFlock, setWithStarterFlock] = useState<boolean>(true);
  const [createError, setCreateError] = useState('');

  const searchResults = allSystemFarms.filter(f => {
    const q = farmSearchQuery.trim().toLowerCase();
    if (!q) return true;
    return f.id.toLowerCase().includes(q) || f.name.toLowerCase().includes(q);
  });

  const toggleSpecies = (s: Species) => {
    if (newSpecies.includes(s)) {
      if (newSpecies.length > 1) {
        setNewSpecies(newSpecies.filter(item => item !== s));
      }
    } else {
      setNewSpecies([...newSpecies, s]);
    }
  };

  const handleCreateFarmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError('');

    const cleanId = newFarmId.trim().toUpperCase();
    if (!cleanId) {
      setCreateError('Please enter a Farm Code (e.g. FARM-101)');
      return;
    }
    if (!newFarmName.trim()) {
      setCreateError('Please enter your Farm Name');
      return;
    }

    const isTaken = farms.some(f => f.id.toUpperCase() === cleanId);
    if (isTaken) {
      setCreateError(`Farm Code "${cleanId}" is already taken! Please choose another code.`);
      return;
    }

    const createdFarm: Farm = {
      id: cleanId,
      name: newFarmName.trim(),
      adminUserId: currentUser.id,
      adminName: currentUser.name,
      location: newLocation.trim() || 'India',
      totalAcreage: parseInt(newAcreage) || 10,
      establishedYear: new Date().getFullYear(),
      primarySpecies: newSpecies,
      createdAt: new Date().toISOString().split('T')[0],
      members: [
        {
          userId: currentUser.id,
          name: currentUser.name,
          identifier: currentUser.identifier,
          role: 'Admin',
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'active',
        },
      ],
      joinRequests: [],
      animals: withStarterFlock ? [...(farms[0]?.animals || [])] : [],
      vaccinations: withStarterFlock ? [...(farms[0]?.vaccinations || [])] : [],
      healthRecords: withStarterFlock ? [...(farms[0]?.healthRecords || [])] : [],
    };

    onCreateFarm(createdFarm);
  };

  const handleSendJoinRequest = (farm: Farm) => {
    onRequestJoinFarm(farm.id, joinMessage.trim() || 'Namaste! Please add me to update flock vaccinations and animal weight records.');
    setJoinSuccessNotice(`Your request was sent to Farm Boss ${farm.adminName}! Once they approve your mobile number (${currentUser.phone || currentUser.identifier}), you can open this farm.`);
    setSelectedFarmToJoin(null);
    setJoinMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Header - Mobile friendly */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">🐐</span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black text-stone-900 truncate">
                {isSuperAdmin ? 'Super Admin: All Tenants' : isBrandNewUser ? 'Set Up Your Farm & Flock' : 'Choose or Make Your Farm'}
              </h2>
              <p className="text-xs text-stone-500 font-medium truncate">
                {currentUser.name} ({currentUser.phone || currentUser.identifier})
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-bold text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 cursor-pointer shrink-0"
          >
            Sign Out
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-7 overflow-y-auto space-y-4 sm:space-y-5">
          
          {/* Welcome Banner for Newly Registered Users */}
          {isBrandNewUser && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white shadow-md space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Registration Successful! Welcome, {currentUser.name}
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
                Your mobile number <strong className="font-mono text-white bg-white/15 px-1.5 py-0.5 rounded">{currentUser.phone || currentUser.identifier}</strong> has been verified via OTP. You can now create your own sheep & goat farm and become the <strong>Farm Boss</strong>, or join an existing farm with a Farm Code.
              </p>
            </div>
          )}

          {/* Super Admin Notice */}
          {isSuperAdmin && (
            <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 text-xs text-amber-950 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-black block">👑 Super Admin Access Active</span>
                <span className="text-stone-600">
                  You have full cross-tenant visibility. You can manage, open, or audit all {allSystemFarms.length} tenant farm organizations across the platform.
                </span>
              </div>
            </div>
          )}

          {/* If user is already part of any farm, show them here */}
          {myFarms.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                  {isSuperAdmin ? `All Platform Tenants (${myFarms.length})` : `Your Authorized Farms (${myFarms.length})`}
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Tenant Access Active
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {myFarms.map(f => {
                  const isAdmin = f.adminUserId === currentUser.id;
                  return (
                    <button
                      key={f.id}
                      onClick={() => onSelectFarm(f)}
                      className="text-left p-4 rounded-2xl border-2 border-stone-200 hover:border-emerald-700 bg-emerald-50/20 hover:bg-emerald-50/60 transition-all flex flex-col justify-between cursor-pointer group shadow-xs"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-extrabold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Code: {f.id}
                          </span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            isAdmin 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-stone-100 text-stone-700'
                          }`}>
                            {isAdmin ? '👑 Farm Boss' : '🚜 Farm Helper'}
                          </span>
                        </div>

                        <h3 className="font-bold text-stone-900 text-base mt-2 group-hover:text-emerald-900">
                          {f.name}
                        </h3>

                        <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          <span>{f.location} · {f.animals.length} animals</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs font-bold text-emerald-800">
                        <span>Tap to Open Farm</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {joinSuccessNotice && (
            <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <span>{joinSuccessNotice}</span>
            </div>
          )}

          {/* Choice Navigation Tabs */}
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-2xl gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`py-3 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'create'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Crown className="w-4 h-4 text-amber-400" />
                <span className="truncate">1. Create Farm & Become Boss</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`py-3 px-3 text-xs sm:text-sm font-black rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'existing'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <Users className="w-4 h-4 text-sky-400" />
                <span className="truncate">2. Join Existing Farm</span>
              </button>
            </div>

            {/* TAB 1: CREATE BRAND NEW FARM (BECOME BOSS) */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateFarmSubmit} className="space-y-4">
                
                {/* Boss Privileges Card */}
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-1">
                  <div className="flex items-center gap-2 font-black text-xs text-amber-900">
                    <span className="text-base">👑</span>
                    <span>{localeText({
                      en: 'You will be the Farm Boss (Admin)',
                      hi: 'आप फार्म के मालिक (Boss) होंगे',
                      kn: 'ನೀವು ಫಾರ್ಮ್ ಮಾಲೀಕರಾಗುವಿರಿ (Boss)',
                      te: 'మీరు ఫార్మ్ యజమాని అవుతారు (Boss)',
                      ta: 'நீங்கள் பண்ணை உரிமையாளராக இருப்பீர்கள் (Boss)',
                      ml: 'നിങ്ങൾ ഫാം ഉടമയാകും (Boss)',
                      mr: 'तुम्ही फार्मचे मालक (Boss) व्हाल'
                    })}</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-medium">
                    As the Farm Boss, you have complete authority to manage sheep & goats, record vaccinations, invite & approve workers, and track the financial ledger.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      {localeText({
                        en: 'Farm Name',
                        hi: 'फ़ार्म का नाम',
                        kn: 'ಫಾರ್ಮ್ ಹೆಸರು',
                        te: 'ఫార్మ్ పేరు',
                        ta: 'பண்ணை பெயர்',
                        ml: 'ഫാം പേര്',
                        mr: 'फार्मचे नाव'
                      })}
                    </label>
                    <input
                      type="text"
                      required
                      value={newFarmName}
                      onChange={(e) => setNewFarmName(e.target.value)}
                      placeholder="e.g. Gokul Goat & Sheep Farm"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      {t('farmCode', 'Unique Farm Code')}
                    </label>
                    <input
                      type="text"
                      required
                      value={newFarmId}
                      onChange={(e) => setNewFarmId(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                      placeholder="e.g. FARM-5821"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      {localeText({
                        en: 'Village, District or State',
                        hi: 'स्थान (गाँव, जिला या राज्य)',
                        kn: 'ಸ್ಥಳ (ಗ್ರಾಮ, ಜಿಲ್ಲೆ ಅಥವಾ ರಾಜ್ಯ)',
                        te: 'స్థలం (గ్రామం, జిల్లా లేదా రాష్ట్రం)',
                        ta: 'இடம் (கிராமம், மாவட்டம் அல்லது மாநிலம்)',
                        ml: 'സ്ഥലം (ഗ്രാമം, ജില്ല അല്ലെങ്കിൽ സംസ്ഥാനം)',
                        mr: 'ठिकाण (गाव, जिल्हा किंवा राज्य)'
                      })}
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Satara, Maharashtra"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-black text-stone-700 mb-1">
                      {localeText({
                        en: 'Land Size in Acres',
                        hi: 'ज़मीन (एकड़ में)',
                        kn: 'ಭೂಮಿ (ಎಕರೆಗಳಲ್ಲಿ)',
                        te: 'భూమి (ఎకరాలలో)',
                        ta: 'நிலம் (ஏக்கரில்)',
                        ml: 'സ്ഥലം (ഏക്കറിൽ)',
                        mr: 'जमीन (एकरमध्ये)'
                      })}
                    </label>
                    <input
                      type="number"
                      value={newAcreage}
                      onChange={(e) => setNewAcreage(e.target.value)}
                      placeholder="e.g. 15"
                      className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                {/* Primary Species */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-black text-stone-700">
                      Flock Species (Phase 1 Specialized)
                    </label>
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Caprine & Ovine
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-2">
                    {(['Goat', 'Sheep'] as Species[]).map(s => {
                      const isSelected = newSpecies.includes(s);
                      const icon = s === 'Goat' ? ('🐐 ' + t('goats', 'Goats')) : ('🐑 ' + t('sheep', 'Sheep'));
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecies(s)}
                          className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                              : 'bg-stone-100 text-stone-700 border-stone-300 hover:bg-stone-200'
                          }`}
                        >
                          {isSelected ? `✓ ${icon}` : `+ ${icon}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Starter Flock Checkbox */}
                <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="starterFlockCheck"
                    checked={withStarterFlock}
                    onChange={(e) => setWithStarterFlock(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded text-emerald-700 accent-emerald-700 cursor-pointer"
                  />
                  <label htmlFor="starterFlockCheck" className="text-xs text-stone-800 font-medium cursor-pointer">
                    <span className="font-bold text-stone-900 block">
                      Include starter sample flock (Sirohi Buck, Barbari Doe, Nellore Ram, Deccani Ewe)
                    </span>
                    <span>Allows you to immediately test vaccine alerts, breeding pedigree, and growth tracker without entering data manually.</span>
                  </label>
                </div>

                {createError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-bold">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full min-h-[48px] py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Crown className="w-5 h-5 text-amber-300" />
                  <span>{localeText({
                    en: 'Create Farm & Become Boss',
                    hi: 'फार्म बनाएं व मालिक बनें',
                    kn: 'ಫಾರ್ಮ್ ರಚಿಸಿ & ಮಾಲೀಕರಾಗಿ',
                    te: 'ఫార్మ్ సృష్టించి & యజమాని అవ్వండి',
                    ta: 'பண்ணை உருவாக்கி & உரிமையாளராகுங்கள்',
                    ml: 'ഫാം നിർമ്മിച്ച് ഉടമയാവുക',
                    mr: 'फार्म तयार करा आणि मालक व्हा'
                  })}</span>
                </button>
              </form>
            )}

            {/* TAB 2: SEARCH AND JOIN EXISTING FARM */}
            {activeTab === 'existing' && (
              <div className="space-y-4">
                
                {/* Explanation */}
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Farm Security & Permissions:</span>
                  </div>
                  <p className="leading-relaxed">
                    Only the <strong>Farm Boss</strong> can approve your mobile number to join. 
                    Once approved, you can view the whole flock, record vaccinations, log animal weights, and check lineage, but you <strong>cannot delete animals</strong>.
                  </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={farmSearchQuery}
                    onChange={(e) => setFarmSearchQuery(e.target.value)}
                    placeholder="Type Farm Code (e.g. FARM-7821) or Farm Name..."
                    className="w-full min-h-[44px] pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {/* Results list */}
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {searchResults.map(farm => {
                    const isMember = farm.members.some(m => m.userId === currentUser.id && m.status === 'active');
                    const isPending = farm.joinRequests.some(r => r.userId === currentUser.id && r.status === 'pending');
                    const isAdmin = farm.adminUserId === currentUser.id;

                    return (
                      <div
                        key={farm.id}
                        className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                              {farm.id}
                            </span>
                            <h3 className="font-bold text-stone-900 text-sm">{farm.name}</h3>
                          </div>
                          <p className="text-xs text-stone-500 mt-1">
                            Farm Boss: <strong>{farm.adminName}</strong> · {farm.location} · {farm.animals.length} animals
                          </p>
                        </div>

                        <div>
                          {isMember || isAdmin ? (
                            <button
                              type="button"
                              onClick={() => onSelectFarm(farm)}
                              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
                            >
                              Open Farm
                            </button>
                          ) : isPending ? (
                            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 text-xs font-bold">
                              <Clock className="w-3.5 h-3.5" />
                              <span>Waiting for Farm Boss Approval</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedFarmToJoin(farm)}
                              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold cursor-pointer"
                            >
                              Ask to Join
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Confirm ask to join */}
                {selectedFarmToJoin && (
                  <div className="p-4 rounded-2xl bg-stone-100 border border-stone-300 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-stone-900">
                        Ask to Join: {selectedFarmToJoin.name} (Code: {selectedFarmToJoin.id})
                      </span>
                      <button
                        onClick={() => setSelectedFarmToJoin(null)}
                        className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <p className="text-xs text-stone-600">
                      Your name ({currentUser.name}) and mobile number ({currentUser.phone || currentUser.identifier}) will be shown to Farm Boss <strong>{selectedFarmToJoin.adminName}</strong> so they can approve your role.
                    </p>

                    <input
                      type="text"
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      placeholder="Optional message (e.g. I help with daily flock grazing and vaccines)..."
                      className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendJoinRequest(selectedFarmToJoin)}
                      className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black cursor-pointer active:scale-98"
                    >
                      Send Join Request to Farm Boss
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
