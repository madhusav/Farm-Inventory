import React, { useState } from 'react';
import { Farm, User, Species } from '../types';
import { 
  Building2, 
  Search, 
  ArrowRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Lock,
  Plus
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'existing' | 'create'>('existing');

  // Search existing farm
  const [farmSearchQuery, setFarmSearchQuery] = useState('');
  const [joinMessage, setJoinMessage] = useState('');
  const [selectedFarmToJoin, setSelectedFarmToJoin] = useState<Farm | null>(null);
  const [joinSuccessNotice, setJoinSuccessNotice] = useState('');

  // Create new farm
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmId, setNewFarmId] = useState(() => `FARM-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newLocation, setNewLocation] = useState('Anand, Gujarat');
  const [newAcreage, setNewAcreage] = useState('15');
  const [newSpecies, setNewSpecies] = useState<Species[]>(['Cow', 'Goat', 'Sheep', 'Chicken']);
  const [createError, setCreateError] = useState('');

  // Farms where current user is already an active member or admin
  const myFarms = farms.filter(f => 
    f.members.some(m => m.userId === currentUser.id && m.status === 'active') ||
    f.adminUserId === currentUser.id
  );

  const searchResults = farms.filter(f => {
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
      setCreateError('Please give your farm a simple Farm Code');
      return;
    }
    if (!newFarmName.trim()) {
      setCreateError('Please enter your Farm Name');
      return;
    }

    const isTaken = farms.some(f => f.id.toUpperCase() === cleanId);
    if (isTaken) {
      setCreateError(`Farm Code "${cleanId}" is already used by someone else! Please pick another code.`);
      return;
    }

    const createdFarm: Farm = {
      id: cleanId,
      name: newFarmName.trim(),
      adminUserId: currentUser.id,
      adminName: currentUser.name,
      location: newLocation.trim() || 'India',
      totalAcreage: parseInt(newAcreage) || 10,
      establishedYear: 2026,
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
      animals: [],
      vaccinations: [],
      healthRecords: [],
    };

    onCreateFarm(createdFarm);
  };

  const handleSendJoinRequest = (farm: Farm) => {
    onRequestJoinFarm(farm.id, joinMessage.trim() || 'Namaste! Please add me to update milk and animal weight records.');
    setJoinSuccessNotice(`Your request was sent to Farm Boss ${farm.adminName}! Once they approve your phone number, you can open this farm.`);
    setSelectedFarmToJoin(null);
    setJoinMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🚜</span>
            <div>
              <h2 className="text-lg font-extrabold text-stone-900">Choose or Make Your Farm</h2>
              <p className="text-xs text-stone-500 font-medium">
                Hello <strong>{currentUser.name}</strong> ({currentUser.identifier})!
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="text-xs font-bold text-stone-500 hover:text-stone-800 px-3 py-1.5 rounded-xl border border-stone-200 hover:bg-stone-100 cursor-pointer"
          >
            Sign Out
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* If user is already part of any farm, show them here */}
          {myFarms.length > 0 && (
            <div className="space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
                Your Farms ({myFarms.length})
              </span>
              
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
                              ? 'bg-amber-100 text-amber-900' 
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

          {/* Toggle between finding an existing farm or making a new one */}
          <div className="space-y-4 pt-1">
            <div className="flex items-center p-1 bg-stone-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setActiveTab('existing')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'existing'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                1. Join Existing Farm with Code
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('create')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                  activeTab === 'create'
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                2. Make Brand New Farm (Become Boss)
              </button>
            </div>

            {/* TAB 1: Search and Join Existing Farm */}
            {activeTab === 'existing' && (
              <div className="space-y-4">
                
                {/* Super simple kid-friendly explanation */}
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Lock className="w-4 h-4 text-amber-700" />
                    <span>Important Farm Rule:</span>
                  </div>
                  <p className="leading-relaxed">
                    Only the <strong>Farm Boss</strong> can approve your mobile number to join. 
                    Once approved, you can see all animals, add daily milk, and write weights, but you <strong>cannot delete any animal</strong>!
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                              <span>Waiting for Farm Boss to Approve</span>
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
                      Your name ({currentUser.name}) and phone number ({currentUser.identifier}) will be shown to Farm Boss <strong>{selectedFarmToJoin.adminName}</strong> so they can approve you.
                    </p>

                    <input
                      type="text"
                      value={joinMessage}
                      onChange={(e) => setJoinMessage(e.target.value)}
                      placeholder="Optional short message (e.g. I help with morning cow milking)..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900"
                    />

                    <button
                      type="button"
                      onClick={() => handleSendJoinRequest(selectedFarmToJoin)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
                    >
                      Send Join Request to Farm Boss
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Make Brand New Farm */}
            {activeTab === 'create' && (
              <form onSubmit={handleCreateFarmSubmit} className="space-y-4">
                
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-extrabold text-xs text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-700" />
                    <span>You will be the Farm Boss (Admin)!</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    You can approve other helpers, add animals, and share your Farm Code with your family and workers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Farm Name (फ़ार्म का नाम)
                    </label>
                    <input
                      type="text"
                      required
                      value={newFarmName}
                      onChange={(e) => setNewFarmName(e.target.value)}
                      placeholder="e.g. Shiv Shakti Gaushala & Dairy"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Unique Farm Code (e.g. FARM-101)
                    </label>
                    <input
                      type="text"
                      required
                      value={newFarmId}
                      onChange={(e) => setNewFarmId(e.target.value.toUpperCase().replace(/\s+/g, '-'))}
                      placeholder="e.g. FARM-101"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 font-mono text-sm uppercase font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Village, City or State (स्थान)
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="e.g. Anand, Gujarat"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Land Size in Acres (जमीन / एकड़)
                    </label>
                    <input
                      type="number"
                      value={newAcreage}
                      onChange={(e) => setNewAcreage(e.target.value)}
                      placeholder="e.g. 10"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1.5">
                    Which animals live on this farm?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {(['Cow', 'Goat', 'Sheep', 'Chicken'] as Species[]).map(s => {
                      const isSelected = newSpecies.includes(s);
                      const icon = s === 'Cow' ? '🐄 Cow (गाय)' : s === 'Goat' ? '🐐 Goat (बकरी)' : s === 'Sheep' ? '🐑 Sheep (भेड़)' : '🐔 Chicken (मुर्गी)';
                      return (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSpecies(s)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
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

                {createError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                    {createError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Create Farm & Enter as Farm Boss</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
