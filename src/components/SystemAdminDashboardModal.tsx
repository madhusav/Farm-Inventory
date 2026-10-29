import React, { useState, useEffect } from 'react';
import { User, BreedProposal, GlobalBreed, Species } from '../types';
import { db } from '../services/db';
import { 
  ShieldCheck, 
  X, 
  Check, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Plus, 
  Trash2, 
  Sparkles, 
  Filter, 
  ArrowRight, 
  Building2, 
  Info,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface SystemAdminDashboardModalProps {
  currentUser: User;
  onClose: () => void;
  onSwitchToSystemAdmin?: () => void;
}

export const SystemAdminDashboardModal: React.FC<SystemAdminDashboardModalProps> = ({
  currentUser,
  onClose,
  onSwitchToSystemAdmin,
}) => {
  const { lang, t, localeText } = useLanguage();
  const isUserSuperAdmin = db.isSuperAdmin(currentUser);

  // Reactive state from db
  const [proposals, setProposals] = useState<BreedProposal[]>(() => db.getBreedProposals());
  const [globalBreeds, setGlobalBreeds] = useState<GlobalBreed[]>(() => db.getGlobalBreeds());
  const [activeTab, setActiveTab] = useState<'pending' | 'catalog' | 'history'>('pending');

  // Feedback notifications
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Approval review modal
  const [approvingProposal, setApprovingProposal] = useState<BreedProposal | null>(null);
  const [approveBreedName, setApproveBreedName] = useState('');
  const [approveTraits, setApproveTraits] = useState('');
  const [approveNotes, setApproveNotes] = useState('');

  // Rejection modal
  const [rejectingProposal, setRejectingProposal] = useState<BreedProposal | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Catalog search & filter
  const [catalogSpeciesFilter, setCatalogSpeciesFilter] = useState<'All' | 'Goat' | 'Sheep'>('All');
  const [catalogSearch, setCatalogSearch] = useState('');

  // Add Direct Breed form modal
  const [showAddBreedModal, setShowAddBreedModal] = useState(false);
  const [directSpecies, setDirectSpecies] = useState<Species>('Goat');
  const [directName, setDirectName] = useState('');
  const [directOrigin, setDirectOrigin] = useState('');
  const [directPurpose, setDirectPurpose] = useState<string>('Meat');
  const [directTraits, setDirectTraits] = useState('');
  const [directWeight, setDirectWeight] = useState<string>('40');

  // Refresh data when db updates
  useEffect(() => {
    const unsub = db.subscribe(() => {
      setProposals(db.getBreedProposals());
      setGlobalBreeds(db.getGlobalBreeds());
    });
    return () => unsub();
  }, []);

  const pendingProposals = proposals.filter(p => p.status === 'pending');
  const resolvedProposals = proposals.filter(p => p.status !== 'pending');

  const filteredCatalog = globalBreeds.filter(b => {
    const matchesSpecies = catalogSpeciesFilter === 'All' || b.species.toLowerCase() === catalogSpeciesFilter.toLowerCase();
    const query = catalogSearch.toLowerCase().trim();
    const matchesQuery = !query || 
      b.name.toLowerCase().includes(query) || 
      (b.originRegion && b.originRegion.toLowerCase().includes(query)) ||
      (b.characteristics && b.characteristics.toLowerCase().includes(query));
    return matchesSpecies && matchesQuery;
  });

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setNotice({ type, message });
    setTimeout(() => setNotice(null), 3500);
  };

  // Open approve dialog
  const handleOpenApprove = (prop: BreedProposal) => {
    setApprovingProposal(prop);
    setApproveBreedName(prop.breedName);
    setApproveTraits(prop.characteristics || '');
    setApproveNotes('Verified & published to universal breed catalog.');
  };

  // Confirm approval
  const handleConfirmApprove = () => {
    if (!approvingProposal) return;
    try {
      const result = db.approveBreedProposal(approvingProposal.id, currentUser, {
        breedName: approveBreedName.trim() || approvingProposal.breedName,
        characteristics: approveTraits.trim(),
        adminNotes: approveNotes.trim(),
      });
      setApprovingProposal(null);
      showFeedback('success', `✓ Breed "${result.breed.name}" approved and published to the global breed list!`);
    } catch (e: any) {
      showFeedback('error', e.message || 'Error approving proposal');
    }
  };

  // Open rejection dialog
  const handleOpenReject = (prop: BreedProposal) => {
    setRejectingProposal(prop);
    setRejectionReason('Duplicate or name does not conform to standard ICAR-NBAGR accession registry.');
  };

  // Confirm rejection
  const handleConfirmReject = () => {
    if (!rejectingProposal) return;
    try {
      db.rejectBreedProposal(rejectingProposal.id, currentUser, rejectionReason.trim());
      setRejectingProposal(null);
      showFeedback('error', `Proposal for "${rejectingProposal.breedName}" was rejected.`);
    } catch (e: any) {
      showFeedback('error', e.message || 'Error rejecting proposal');
    }
  };

  // Add breed directly
  const handleDirectAddBreed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName.trim()) return;

    try {
      const newBreed = db.addGlobalBreedDirectly({
        species: directSpecies,
        name: directName.trim(),
        originRegion: directOrigin.trim() || undefined,
        primaryPurpose: directPurpose,
        characteristics: directTraits.trim() || undefined,
        averageMatureWeightKg: parseFloat(directWeight) || 40,
        isSystemDefault: false,
      });

      setShowAddBreedModal(false);
      setDirectName('');
      setDirectOrigin('');
      setDirectTraits('');
      showFeedback('success', `✓ Successfully added "${newBreed.name}" to global catalog!`);
    } catch (e: any) {
      showFeedback('error', e.message || 'Error adding breed');
    }
  };

  // Delete breed from catalog
  const handleDeleteBreed = (breed: GlobalBreed) => {
    if (confirm(`Are you sure you want to remove "${breed.name}" from the global breed catalog?`)) {
      db.deleteGlobalBreed(breed.id);
      showFeedback('success', `Breed "${breed.name}" removed from catalog.`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-5xl rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Header */}
        <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-stone-200 bg-gradient-to-r from-purple-950 via-stone-900 to-stone-950 text-white flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-purple-600/30 border border-purple-400/40 flex items-center justify-center text-xl shrink-0">
              🛡️
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black truncate tracking-tight text-white">
                  System Admin Dashboard
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/30 border border-purple-400 text-purple-200">
                  Global Breed Authority
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium truncate">
                Admin: <strong className="text-purple-200">{currentUser.name}</strong> ({currentUser.email || currentUser.identifier})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isUserSuperAdmin && onSwitchToSystemAdmin && (
              <button
                type="button"
                onClick={onSwitchToSystemAdmin}
                className="hidden sm:flex px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Switch to madhusav@gmail.com</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer shrink-0 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Global Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 sm:p-6 bg-stone-50 border-b border-stone-200">
          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center justify-between">
              <span>Pending Reviews</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-700 font-mono mt-0.5">
              {pendingProposals.length}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Awaiting decision</div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center justify-between">
              <span>Total Breeds</span>
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-900 font-mono mt-0.5">
              {globalBreeds.length}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">In universal catalog</div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center justify-between">
              <span>{localeText({
                en: 'Goat Breeds',
                hi: 'बकरियां',
                kn: 'ಮೇಕೆ ತಳಿಗಳು',
                te: 'మేక జాతులు',
                ta: 'ஆட்டு இனங்கள்',
                ml: 'ആട് ഇനങ്ങൾ',
                mr: 'शेळीच्या जाती',
              })}</span>
              <span>🐐</span>
            </div>
            <div className="text-2xl font-black text-stone-900 font-mono mt-0.5">
              {globalBreeds.filter(b => b.species === 'Goat').length}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Active registered breeds</div>
          </div>

          <div className="p-3 bg-white rounded-2xl border border-stone-200 shadow-2xs">
            <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 flex items-center justify-between">
              <span>{localeText({
                en: 'Sheep Breeds',
                hi: 'भेड़ें',
                kn: 'ಕುರಿ ತಳಿಗಳು',
                te: 'గొర్రె జాతులు',
                ta: 'செம்மறி இனங்கள்',
                ml: 'ചെമ്മരിയാട് ഇനങ്ങൾ',
                mr: 'मेंढीच्या जाती',
              })}</span>
              <span>🐑</span>
            </div>
            <div className="text-2xl font-black text-stone-900 font-mono mt-0.5">
              {globalBreeds.filter(b => b.species === 'Sheep').length}
            </div>
            <div className="text-[11px] text-stone-500 font-medium">Wool & meat bloodlines</div>
          </div>
        </div>

        {/* Notice Banner */}
        {notice && (
          <div className={`px-4 sm:px-6 py-2.5 text-xs font-bold flex items-center gap-2 ${
            notice.type === 'success' ? 'bg-emerald-100 text-emerald-950 border-b border-emerald-300' : 'bg-red-100 text-red-950 border-b border-red-300'
          }`}>
            {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700" /> : <XCircle className="w-4 h-4 text-red-700" />}
            <span>{notice.message}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="px-4 sm:px-8 border-b border-stone-200 flex items-center gap-2 overflow-x-auto bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('pending')}
            className={`py-3 text-xs font-black border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pending'
                ? 'border-purple-700 text-purple-950'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>⏳ Pending Reviews</span>
            {pendingProposals.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-black animate-pulse">
                {pendingProposals.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('catalog')}
            className={`py-3 text-xs font-black border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'catalog'
                ? 'border-purple-700 text-purple-950'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>📚 Universal Breed Catalog ({globalBreeds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`py-3 text-xs font-black border-b-2 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'history'
                ? 'border-purple-700 text-purple-950'
                : 'border-transparent text-stone-500 hover:text-stone-900'
            }`}
          >
            <span>📜 Proposal Audit Log ({resolvedProposals.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1">
          
          {/* TAB 1: PENDING BREED PROPOSALS */}
          {activeTab === 'pending' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    Pending Breed Proposals from Farm Admins ({pendingProposals.length})
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Review submissions from farm bosses. Approving adds the breed to the global dropdowns across all farms.
                  </p>
                </div>
              </div>

              {pendingProposals.length === 0 ? (
                <div className="p-8 rounded-3xl border border-dashed border-stone-300 text-center space-y-2 bg-stone-50/50">
                  <span className="text-3xl">🎉</span>
                  <div className="text-sm font-black text-stone-800">
                    All caught up! No pending breed proposals.
                  </div>
                  <p className="text-xs text-stone-500 max-w-md mx-auto">
                    When farm admins submit new sheep or goat breeds in their Farm Admin modal, they will show up here for your immediate review and approval.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingProposals.map(prop => (
                    <div
                      key={prop.id}
                      className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300 bg-amber-50/30 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs hover:border-amber-400 transition-all"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                            prop.species === 'Goat' ? 'bg-amber-100 text-amber-950 border border-amber-200' : 'bg-sky-100 text-sky-950 border border-sky-200'
                          }`}>
                            {prop.species === 'Goat' ? '🐐 Goat Breed' : '🐑 Sheep Breed'}
                          </span>

                          <span className="text-base sm:text-lg font-black text-stone-900">
                            {prop.breedName}
                          </span>

                          {prop.primaryPurpose && (
                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-stone-100 text-stone-700">
                              🎯 {prop.primaryPurpose}
                            </span>
                          )}
                        </div>

                        {prop.characteristics && (
                          <p className="text-xs text-stone-700 font-medium leading-relaxed bg-white/80 p-2.5 rounded-xl border border-stone-200">
                            <strong>Traits & Description:</strong> {prop.characteristics}
                          </p>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-stone-600 pt-1">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-black block">Origin Region</span>
                            <span className="font-bold text-stone-800">📍 {prop.originRegion || 'Not specified'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-black block">Adult Mature Weight</span>
                            <span className="font-bold text-stone-800">⚖️ {prop.averageMatureWeightKg ? `${prop.averageMatureWeightKg} kg` : 'N/A'}</span>
                          </div>

                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-black block">Submitted By</span>
                            <span className="font-bold text-stone-800 truncate block">
                              🏡 {prop.proposedByFarmName} ({prop.proposedByUserName})
                            </span>
                          </div>
                        </div>

                        <div className="text-[10px] text-stone-400 font-medium">
                          Submitted on: {new Date(prop.createdAt).toLocaleDateString()} at {new Date(prop.createdAt).toLocaleTimeString()}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center sm:flex-col gap-2 shrink-0 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={() => handleOpenApprove(prop)}
                          className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-95"
                          title="Approve and publish breed to global catalog"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Breed</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenReject(prop)}
                          className="px-3.5 py-1.5 rounded-xl border border-stone-300 hover:bg-red-50 hover:text-red-700 text-stone-600 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          title="Reject proposal with reason"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UNIVERSAL BREED CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-stone-900">
                    Global Universal Breed List ({filteredCatalog.length})
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    All breeds in this list are immediately available when users create or bulk add livestock.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddBreedModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-black flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Global Breed Directly</span>
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={catalogSearch}
                    onChange={(e) => setCatalogSearch(e.target.value)}
                    placeholder="Search breed by name, state, or traits..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-700"
                  />
                </div>

                <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0">
                  {(['All', 'Goat', 'Sheep'] as const).map(sp => (
                    <button
                      key={sp}
                      type="button"
                      onClick={() => setCatalogSpeciesFilter(sp)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        catalogSpeciesFilter === sp
                          ? 'bg-white text-stone-900 shadow-2xs font-black'
                          : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      {sp === 'Goat' ? '🐐 Goats' : sp === 'Sheep' ? '🐑 Sheep' : 'All Species'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Breed Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCatalog.map(breed => (
                  <div
                    key={breed.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition-all flex flex-col justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          breed.species === 'Goat' ? 'bg-amber-100 text-amber-950' : 'bg-sky-100 text-sky-950'
                        }`}>
                          {breed.species === 'Goat' ? '🐐 Goat' : '🐑 Sheep'}
                        </span>

                        {breed.isSystemDefault ? (
                          <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                            Standard ICAR
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>Community Approved</span>
                          </span>
                        )}
                      </div>

                      <div className="font-black text-stone-900 text-sm">
                        {breed.name}
                      </div>

                      {breed.originRegion && (
                        <div className="text-[11px] text-stone-500 font-medium">
                          📍 {breed.originRegion}
                        </div>
                      )}

                      {breed.primaryPurpose && (
                        <div className="text-[11px] text-stone-700 font-bold">
                          🎯 {breed.primaryPurpose} · {breed.averageMatureWeightKg ? `${breed.averageMatureWeightKg} kg` : ''}
                        </div>
                      )}

                      {breed.characteristics && (
                        <p className="text-[11px] text-stone-600 line-clamp-3 leading-snug">
                          {breed.characteristics}
                        </p>
                      )}
                    </div>

                    {!breed.isSystemDefault && (
                      <div className="pt-2 border-t border-stone-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleDeleteBreed(breed)}
                          className="text-stone-400 hover:text-red-600 p-1 rounded cursor-pointer"
                          title="Remove custom breed"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: PROPOSALS HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h3 className="text-sm sm:text-base font-black text-stone-900">
                Processed Breed Proposals History ({resolvedProposals.length})
              </h3>

              {resolvedProposals.length === 0 ? (
                <div className="p-8 text-center text-xs text-stone-500 border border-stone-200 rounded-2xl bg-stone-50">
                  No resolved proposals yet.
                </div>
              ) : (
                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200 bg-white">
                  {resolvedProposals.map(prop => (
                    <div key={prop.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-stone-900 text-sm">
                            {prop.breedName}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            prop.status === 'approved' ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                          }`}>
                            {prop.status === 'approved' ? '✓ Approved' : '✕ Rejected'}
                          </span>
                          <span className="text-[11px] text-stone-500">
                            ({prop.species})
                          </span>
                        </div>

                        <div className="text-stone-600">
                          Proposed by <strong>{prop.proposedByFarmName}</strong> ({prop.proposedByUserName})
                        </div>

                        {prop.adminNotes && (
                          <div className="text-emerald-800 text-[11px] font-medium">
                            📝 Admin Remarks: {prop.adminNotes}
                          </div>
                        )}

                        {prop.rejectionReason && (
                          <div className="text-red-700 text-[11px] font-medium">
                            ⚠️ Rejection Reason: {prop.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div className="text-[11px] text-stone-400 text-right">
                        <div>Reviewed on: {prop.reviewedAt ? new Date(prop.reviewedAt).toLocaleDateString() : 'N/A'}</div>
                        <div>By: {prop.reviewedBy || 'System Admin'}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* ==================== APPROVAL REVIEW MODAL ==================== */}
        {approvingProposal && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white max-w-lg w-full rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✅</span>
                  <h3 className="text-sm font-black text-stone-900">
                    Confirm & Publish Breed to Global List
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setApprovingProposal(null)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Canonical Breed Name
                  </label>
                  <input
                    type="text"
                    value={approveBreedName}
                    onChange={(e) => setApproveBreedName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-black text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Key Characteristics / Traits
                  </label>
                  <textarea
                    rows={2}
                    value={approveTraits}
                    onChange={(e) => setApproveTraits(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    System Admin Notes for Submitting Farm
                  </label>
                  <input
                    type="text"
                    value={approveNotes}
                    onChange={(e) => setApproveNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-[11px] font-medium leading-relaxed">
                  📢 Once confirmed, <strong>"{approveBreedName}"</strong> will be globally published into the dropdowns of all farms across the entire applet.
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setApprovingProposal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Confirm & Add to Global List</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== REJECTION MODAL ==================== */}
        {rejectingProposal && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white max-w-lg w-full rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">❌</span>
                  <h3 className="text-sm font-black text-red-900">
                    Reject Breed Proposal: {rejectingProposal.breedName}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setRejectingProposal(null)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-stone-600 font-medium">
                  Provide a clear reason so the farm admin understands why this breed was not added:
                </p>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">
                    Rejection Reason
                  </label>
                  <textarea
                    rows={3}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-medium text-stone-900 bg-white"
                  />
                </div>

                {/* Quick suggestions */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase">Quick presets:</span>
                  <div className="flex flex-wrap gap-1">
                    {[
                      'Duplicate of existing registered breed',
                      'Name not found in ICAR-NBAGR accession database',
                      'Please provide local geographic documentation',
                    ].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setRejectionReason(preset)}
                        className="px-2 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-[11px] font-medium cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRejectingProposal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject Proposal</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================== ADD DIRECT BREED MODAL ==================== */}
        {showAddBreedModal && (
          <div className="fixed inset-0 z-60 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
            <div className="bg-white max-w-lg w-full rounded-2xl border border-stone-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✨</span>
                  <h3 className="text-sm font-black text-stone-900">
                    Add Global Breed Directly (Admin)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddBreedModal(false)}
                  className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={handleDirectAddBreed} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Species</label>
                    <select
                      value={directSpecies}
                      onChange={(e) => setDirectSpecies(e.target.value as Species)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-white"
                    >
                      <option value="Goat">{localeText({
                        en: '🐐 Goat',
                        hi: '🐐 बकरी',
                        kn: '🐐 ಮೇಕೆ',
                        te: '🐐 మేక',
                        ta: '🐐 ஆடு',
                        ml: '🐐 ആട്',
                        mr: '🐐 शेळी',
                      })}</option>
                      <option value="Sheep">{localeText({
                        en: '🐑 Sheep',
                        hi: '🐑 भेड़',
                        kn: '🐑 ಕುರಿ',
                        te: '🐑 గొర్రె',
                        ta: '🐑 செம்மறியாடு',
                        ml: '🐑 ചെമ്മരിയാട്',
                        mr: '🐑 मेंढी',
                      })}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Primary Purpose</label>
                    <select
                      value={directPurpose}
                      onChange={(e) => setDirectPurpose(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-white"
                    >
                      <option value="Meat">{localeText({
                        en: 'Meat',
                        hi: 'मांस',
                        kn: 'ಮಾಂಸ',
                        te: 'మాంసం',
                        ta: 'இறைச்சி',
                        ml: 'മാംസം',
                        mr: 'मांस',
                      })}</option>
                      <option value="Milk">{localeText({
                        en: 'Milk',
                        hi: 'दूध',
                        kn: 'ಹಾಲು',
                        te: 'పాలు',
                        ta: 'பால்',
                        ml: 'പാൽ',
                        mr: 'दूध',
                      })}</option>
                      <option value="Dual Purpose (Meat & Milk)">{localeText({
                        en: 'Dual Purpose',
                        hi: 'मांस व दूध',
                        kn: 'ದ್ವಿಗುಣ ಉದ್ದೇಶ',
                        te: 'ద్విముఖ ప్రయోజనం',
                        ta: 'இருநோக்கு பயன்பாடு',
                        ml: 'ഇരട്ട ഉദ്ദേശ്യം',
                        mr: 'दुहेरी वापर',
                      })}</option>
                      <option value="Wool & Fiber">{localeText({
                        en: 'Wool & Fiber',
                        hi: 'ऊन व रेशा',
                        kn: 'ಉಣ್ಣೆ ಮತ್ತು ನಾರು',
                        te: 'ఉన్ని మరియు పీచు',
                        ta: 'கம்பளி & இழை',
                        ml: 'കമ്പിളി',
                        mr: 'लोकर व तंतू',
                      })}</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Breed Name</label>
                  <input
                    type="text"
                    required
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="e.g. Surti Goat / Patanwadi Sheep"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 font-bold bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Native Region / State</label>
                    <input
                      type="text"
                      value={directOrigin}
                      onChange={(e) => setDirectOrigin(e.target.value)}
                      placeholder="e.g. Saurashtra, Gujarat"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-stone-700 mb-1">Adult Weight (kg)</label>
                    <input
                      type="number"
                      value={directWeight}
                      onChange={(e) => setDirectWeight(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Key Traits / Description</label>
                  <textarea
                    rows={2}
                    value={directTraits}
                    onChange={(e) => setDirectTraits(e.target.value)}
                    placeholder="e.g. Medium sized, white face, high twinning rate..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setShowAddBreedModal(false)}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-600 font-bold text-xs hover:bg-stone-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-black text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Publish to Universal Catalog</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
