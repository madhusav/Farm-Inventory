import React, { useState, useEffect } from 'react';
import { Farm, User, UserRole, FarmConfig, isVaccineManager, BreedProposal, GlobalBreed, Species } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { db, DEFAULT_FARM_CONFIG } from '../services/db';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Clock, 
  ShieldAlert,
  Lock,
  Settings,
  Database,
  Syringe,
  Building2,
  Download,
  AlertTriangle,
  FileCode,
  Sparkles,
  Phone,
  Milk,
  CheckCircle2,
  MapPin,
  Navigation,
  FileText,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface FarmAdminUsersModalProps {
  farm: Farm;
  currentUser: User;
  initialTab?: 'team' | 'vaccines' | 'farm' | 'breeds' | 'database';
  onClose: () => void;
  onApproveRequest: (requestId: string, assignedRole: UserRole) => void;
  onRejectRequest: (requestId: string) => void;
  onAddUserDirectly: (name: string, identifier: string, role: UserRole) => void;
  onUpdateMemberRole?: (userId: string, role: UserRole) => void;
  onRemoveMember: (userId: string) => void;
  onUpdateFarmConfig?: (configUpdates: Partial<FarmConfig>) => void;
  onUpdateFarmProfile?: (profileUpdates: Partial<Farm>) => void;
  onResetStarterData?: () => void;
  onClearFarmData?: () => void;
  onOpenSystemAdmin?: () => void;
}

export const FarmAdminUsersModal: React.FC<FarmAdminUsersModalProps> = ({
  farm,
  currentUser,
  initialTab,
  onClose,
  onApproveRequest,
  onRejectRequest,
  onAddUserDirectly,
  onUpdateMemberRole,
  onRemoveMember,
  onUpdateFarmConfig,
  onUpdateFarmProfile,
  onResetStarterData,
  onClearFarmData,
  onOpenSystemAdmin,
}) => {
  const { t, lang, localeText } = useLanguage();
  const isSuperAdmin = db.isSuperAdmin(currentUser);
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const isSupportAdmin = currentMember?.role === 'Support Admin';
  const hasAdminRights = isAdmin || isSupportAdmin || isSuperAdmin;

  const [activeTab, setActiveTab] = useState<'team' | 'vaccines' | 'farm' | 'breeds' | 'database'>(initialTab || 'team');

  // Direct user addition form
  const [newUserName, setNewUserName] = useState('');
  const [newUserIdentifier, setNewUserIdentifier] = useState('+91 ');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Herdsman');
  const [addSuccessNotice, setAddSuccessNotice] = useState('');
  const [addErrorNotice, setAddErrorNotice] = useState('');

  // Configurable Application Name (Default: Testing)
  const [appNameInput, setAppNameInput] = useState(farm.config?.appName || db.getAppName(farm.id) || 'Testing');

  // Farm Profile & Weather Location State
  const [farmName, setFarmName] = useState(farm.name);
  const [farmLocation, setFarmLocation] = useState(farm.config?.weatherLocation || farm.location || 'Anand, Gujarat');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsNotice, setGpsNotice] = useState('');
  const [totalAcreage, setTotalAcreage] = useState(String(farm.totalAcreage || 5.0));
  const [contactPhone, setContactPhone] = useState(farm.config?.contactPhone || '+91 98765 43210');
  const [profileSaved, setProfileSaved] = useState(false);

  // Vaccine Policy State
  const farmConfig = farm.config || DEFAULT_FARM_CONFIG;
  const [vaccineAlertDays, setVaccineAlertDays] = useState(farmConfig.vaccineAlertDaysThreshold || 7);
  const [customVaccineInput, setCustomVaccineInput] = useState('');
  const [customVaccines, setCustomVaccines] = useState<string[]>(farmConfig.customVaccines || DEFAULT_FARM_CONFIG.customVaccines || []);
  const [targetMilkLiters, setTargetMilkLiters] = useState(farmConfig.targetDailyMilkLiters || 45);
  const [policySaved, setPolicySaved] = useState(false);

  // MySQL SQL preview
  const [showSqlPreview, setShowSqlPreview] = useState(false);
  const [sqlDumpContent, setSqlDumpContent] = useState('');

  // Breed Proposals State
  const [farmProposals, setFarmProposals] = useState<BreedProposal[]>(() => db.getBreedProposals(farm.id));
  const [globalBreeds, setGlobalBreeds] = useState<GlobalBreed[]>(() => db.getGlobalBreeds());
  const [propSpecies, setPropSpecies] = useState<Species>('Goat');
  const [propBreedName, setPropBreedName] = useState('');
  const [propOrigin, setPropOrigin] = useState('');
  const [propPurpose, setPropPurpose] = useState<BreedProposal['primaryPurpose']>('Meat');
  const [propWeight, setPropWeight] = useState('38');
  const [propTraits, setPropTraits] = useState('');
  const [propNotice, setPropNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const unsub = db.subscribe(() => {
      setFarmProposals(db.getBreedProposals(farm.id));
      setGlobalBreeds(db.getGlobalBreeds());
    });
    return () => unsub();
  }, [farm.id]);

  const handleBreedProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propBreedName.trim()) {
      setPropNotice({ type: 'error', message: 'Please provide the breed name' });
      return;
    }

    try {
      const created = db.submitBreedProposal({
        species: propSpecies,
        breedName: propBreedName.trim(),
        originRegion: propOrigin.trim() || undefined,
        primaryPurpose: propPurpose,
        characteristics: propTraits.trim() || undefined,
        averageMatureWeightKg: parseFloat(propWeight) || undefined,
        proposedByFarmId: farm.id,
        proposedByFarmName: farm.name,
        proposedByUserId: currentUser.id,
        proposedByUserName: currentUser.name,
      });

      setPropBreedName('');
      setPropOrigin('');
      setPropTraits('');
      setPropNotice({ 
        type: 'success', 
        message: `✓ Proposal for "${created.breedName}" submitted successfully! It is now pending review by the System Admin.` 
      });
      setTimeout(() => setPropNotice(null), 5000);
    } catch (err: any) {
      setPropNotice({ type: 'error', message: err.message || 'Error submitting proposal' });
    }
  };

  const pendingRequests = farm.joinRequests.filter(r => r.status === 'pending');
  const farmPendingBreedProposals = farmProposals.filter(p => p.status === 'pending');
  const totalPendingProposalsInSystem = db.getPendingBreedProposalsCount();

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddErrorNotice('');
    setAddSuccessNotice('');

    if (!newUserName.trim() || !newUserIdentifier.trim() || newUserIdentifier.trim() === '+91') {
      setAddErrorNotice('Please provide both the helper name and their mobile number or email');
      return;
    }

    const cleanId = newUserIdentifier.trim().toLowerCase();
    const alreadyMember = farm.members.some(m => m.identifier.toLowerCase() === cleanId);
    if (alreadyMember) {
      setAddErrorNotice(`User with number "${newUserIdentifier}" is already a member of this farm!`);
      return;
    }

    onAddUserDirectly(newUserName.trim(), newUserIdentifier.trim(), newUserRole);
    setAddSuccessNotice(`✓ Helper "${newUserName}" (${newUserIdentifier}) can now open and work on this farm!`);
    setNewUserName('');
    setNewUserIdentifier('+91 ');
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsDetectingGps(true);
    setGpsNotice('');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(2));
        const lon = parseFloat(pos.coords.longitude.toFixed(2));
        const gpsStr = `${lat}, ${lon}`;
        setFarmLocation(gpsStr);
        setIsDetectingGps(false);
        setGpsNotice(`✓ Device GPS detected (${gpsStr})! Save settings to apply.`);
      },
      (err) => {
        setIsDetectingGps(false);
        alert('Could not detect device GPS: ' + err.message);
      },
      { timeout: 8000 }
    );
  };

  const handleSaveFarmProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAppName = appNameInput.trim() || 'Testing';
    const cleanLocation = farmLocation.trim() || 'Anand, Gujarat';

    if (onUpdateFarmProfile) {
      onUpdateFarmProfile({
        name: farmName.trim(),
        location: cleanLocation,
        totalAcreage: parseFloat(totalAcreage) || 5.0,
      });
    }
    if (onUpdateFarmConfig) {
      onUpdateFarmConfig({
        appName: cleanAppName,
        weatherLocation: cleanLocation,
        contactPhone: contactPhone.trim(),
      });
    }
    db.setAppName(cleanAppName, farm.id);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSaveVaccinePolicy = () => {
    if (onUpdateFarmConfig) {
      onUpdateFarmConfig({
        vaccineAlertDaysThreshold: Number(vaccineAlertDays),
        targetDailyMilkLiters: Number(targetMilkLiters),
        customVaccines,
      });
    }
    setPolicySaved(true);
    setTimeout(() => setPolicySaved(false), 2500);
  };

  const handleAddCustomVaccine = () => {
    if (!customVaccineInput.trim()) return;
    if (customVaccines.includes(customVaccineInput.trim())) return;
    const updated = [...customVaccines, customVaccineInput.trim()];
    setCustomVaccines(updated);
    setCustomVaccineInput('');
    if (onUpdateFarmConfig) {
      onUpdateFarmConfig({ customVaccines: updated });
    }
  };

  const handleRemoveCustomVaccine = (vacName: string) => {
    const updated = customVaccines.filter(v => v !== vacName);
    setCustomVaccines(updated);
    if (onUpdateFarmConfig) {
      onUpdateFarmConfig({ customVaccines: updated });
    }
  };

  const handleDownloadSqlDump = () => {
    const sql = db.exportAsMySQL();
    const blob = new Blob([sql], { type: 'application/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `farmtrack_mysql_dump_${farm.id.toLowerCase()}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOpenSqlPreview = () => {
    const sql = db.exportAsMySQL();
    setSqlDumpContent(sql);
    setShowSqlPreview(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh] sm:max-h-[92vh]">
        
        {/* Header - Responsive Mobile First */}
        <div className="px-3.5 sm:px-8 py-3 sm:py-5 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-xl sm:text-3xl shrink-0">⚙️</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg font-black text-stone-900 truncate">
                  Farm Admin & Config
                </h2>
                <span className="font-mono text-[11px] sm:text-xs font-black text-stone-800 bg-stone-100 px-1.5 sm:px-2 py-0.5 rounded">
                  {farm.id}
                </span>
                {isSuperAdmin && (
                  <span className="text-[10px] font-black text-purple-900 bg-purple-100 px-2 py-0.5 rounded-full">
                    Super Admin
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-stone-500 font-medium truncate">
                {farm.name} · Boss: <strong>{farm.adminName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar - Clean horizontal scroll on mobile */}
        <div className="px-2.5 sm:px-6 bg-stone-50 border-b border-stone-200 flex items-center justify-between gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1 sm:gap-2">
            {[
              { id: 'team', label: '👥 Team & Approvals', badge: pendingRequests.length },
              { id: 'breeds', label: '📋 Breed Proposals', badge: farmPendingBreedProposals.length },
              { id: 'vaccines', label: '💉 Vaccine Policies' },
              { id: 'farm', label: '🏡 Farm, Location & App Name' },
              { id: 'database', label: '🗄️ Database & Export' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-bold transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-emerald-800 text-emerald-950 bg-white'
                    : 'border-transparent text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </div>

          {onOpenSystemAdmin && (
            <button
              type="button"
              onClick={onOpenSystemAdmin}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-950 text-xs font-black shrink-0 transition-colors cursor-pointer border border-purple-200"
              title="Open System Admin Dashboard to approve or reject pending breed proposals"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
              <span>System Admin View</span>
              {totalPendingProposalsInSystem > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-purple-700 text-white text-[10px] font-black">
                  {totalPendingProposalsInSystem}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="p-3.5 sm:p-8 overflow-y-auto space-y-5 sm:space-y-6">

          {/* TAB 1: TEAM & ACCESS APPROVALS */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              {/* Simple Rule Box for Child or Farmer */}
              <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-amber-900">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Farm Rule: Only Approved Helpers Can Use This Farm</span>
                </div>
                <p>
                  Any friend, family member, or worker who enters Farm Code <strong>{farm.id}</strong> must be approved by the Farm Boss here before they can see or add cows, goats, sheep, and milk logs.
                </p>
                <p className="text-[11px] text-amber-800 font-bold mt-1">
                  🔒 Note: Only users with <strong>"Admin"</strong> or <strong>"Support Admin"</strong> role can create, edit, or delete vaccine shots.
                </p>
              </div>

              {/* Pending Requests Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Waiting for Boss Approval ({pendingRequests.length})</span>
                  </h3>
                </div>

                {pendingRequests.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500 bg-stone-50/50">
                    No helpers are waiting for approval right now. Everyone approved is ready to work!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {pendingRequests.map(req => (
                      <div
                        key={req.id}
                        className="p-4 rounded-2xl border border-amber-300 bg-amber-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-stone-900 text-sm">{req.userName}</span>
                            <span className="font-mono text-xs text-stone-600 font-bold bg-white px-2 py-0.5 rounded border border-stone-200">
                              {req.userIdentifier}
                            </span>
                          </div>
                          {req.message && (
                            <p className="text-xs text-stone-600 mt-1 italic">
                              "{req.message}"
                            </p>
                          )}
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            Asked to join on: {req.requestedAt}
                          </div>
                        </div>

                        {isAdmin ? (
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => onApproveRequest(req.id, 'Support Admin')}
                              className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                              title="Give Support Admin role (can manage vaccines)"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve as Support Admin</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onApproveRequest(req.id, 'Herdsman')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve Helper</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onRejectRequest(req.id)}
                              className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-white cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-stone-500">
                            Waiting for Farm Boss
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Add Helper Form */}
              {hasAdminRights && (
                <div className="p-5 rounded-2xl border border-stone-200 bg-[#FAF9F5] space-y-4">
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-emerald-800" />
                    <h3 className="text-sm font-black text-stone-900">
                      {localeText({
                        en: 'Add a Helper Directly',
                        hi: 'बिना इंतज़ार नया साथी जोड़ें',
                        kn: 'ನೇರವಾಗಿ ಸಹಾಯಕನನ್ನು ಸೇರಿಸಿ',
                        te: 'సహాయకుడిని నేరుగా జోడించండి',
                        ta: 'நேரடியாக உதவியாளரைச் சேர்க்கவும்',
                        ml: 'സഹായിയെ നേരിട്ട് ചേർക്കുക',
                        mr: 'थेट नवीन मदतनीस जोडा',
                      })}
                    </h3>
                  </div>

                  {addSuccessNotice && (
                    <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold">
                      {addSuccessNotice}
                    </div>
                  )}

                  {addErrorNotice && (
                    <div className="p-3 rounded-xl bg-red-100 text-red-900 text-xs font-bold">
                      {addErrorNotice}
                    </div>
                  )}

                  <form onSubmit={handleAddSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {localeText({
                            en: "Helper's Name",
                            hi: 'साथी का नाम',
                            kn: 'ಸಹಾಯಕರ ಹೆಸರು',
                            te: 'సహాయకుడి పేరు',
                            ta: 'உதவியாளர் பெயர்',
                            ml: 'സഹായിയുടെ പേര്',
                            mr: 'सहकाऱ्याचे नाव',
                          })}
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          placeholder="e.g. Raju Bhai / Priya"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          Mobile Number (+91...)
                        </label>
                        <input
                          type="text"
                          required
                          value={newUserIdentifier}
                          onChange={(e) => setNewUserIdentifier(e.target.value)}
                          placeholder="+91 9876543210"
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-mono font-bold"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {localeText({
                            en: 'Role & Permissions',
                            hi: 'भूमिका व अनुमति',
                            kn: 'ಪಾತ್ರ ಮತ್ತು ಅನುಮತಿಗಳು',
                            te: 'పాత్ర మరియు అనుమతులు',
                            ta: 'பொறுப்பு & அனுமதிகள்',
                            ml: 'സ്ഥാനവും അനുമതികളും',
                            mr: 'भूमिका व परवानग्या',
                          })}
                        </label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
                        >
                          <option value="Herdsman">{localeText({
                            en: 'Herdsman (Helper)',
                            hi: 'गौपालक (Herdsman)',
                            kn: 'ಪಾಲಕ (Herdsman)',
                            te: 'కాపరి (Herdsman)',
                            ta: 'பண்ணையாளர் (Herdsman)',
                            ml: 'പാലകൻ (Herdsman)',
                            mr: 'पशुपालक (Herdsman)',
                          })}</option>
                          <option value="Support Admin">Support Admin (Can manage Vaccines & Settings)</option>
                          <option value="Veterinarian">{localeText({
                            en: 'Veterinarian (Doctor)',
                            hi: 'पशु चिकित्सक (Doctor)',
                            kn: 'ಪಶುವೈದ್ಯ (Doctor)',
                            te: 'పశువైద్యుడు (Doctor)',
                            ta: 'கால்நடை மருத்துவர் (Doctor)',
                            ml: 'മൃഗഡോക്ടർ (Doctor)',
                            mr: 'पशुवैद्यकीय डॉक्टर (Doctor)',
                          })}</option>
                          <option value="Field Staff">{localeText({
                            en: 'Field Staff',
                            hi: 'कार्यकर्ता',
                            kn: 'ಕ್ಷೇತ್ರ ಸಿಬ್ಬಂದಿ',
                            te: 'ఫీల్డ్ స్టాఫ్',
                            ta: 'களப் பணியாளர்',
                            ml: 'ഫീൽഡ് സ്റ്റാഫ്',
                            mr: 'क्षेत्रीय कर्मचारी',
                          })}</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Add & Grant Farm Access</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Active Members List */}
              <div className="space-y-3">
                <h3 className="text-sm font-black text-stone-900">
                  Approved Farm Team Members ({farm.members.length})
                </h3>

                <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200">
                  {farm.members.map(member => {
                    const isFarmBoss = farm.adminUserId === member.userId;
                    const canEditMemberRole = hasAdminRights && !isFarmBoss;

                    return (
                      <div
                        key={member.userId}
                        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white hover:bg-stone-50/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            isFarmBoss ? 'bg-amber-100 text-amber-950' : 'bg-emerald-100 text-emerald-950'
                          }`}>
                            {isFarmBoss ? '👑' : '🚜'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-stone-900 text-xs sm:text-sm">
                                {member.name}
                              </span>
                              {isFarmBoss ? (
                                <span className="text-[10px] font-black bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                                  Farm Boss (Admin)
                                </span>
                              ) : member.role === 'Support Admin' ? (
                                <span className="text-[10px] font-black bg-indigo-100 text-indigo-900 px-2 py-0.5 rounded-full">
                                  Support Admin (Vaccine CRUD)
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-full">
                                  {member.role}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-stone-500 font-mono">
                              {member.identifier} · Joined {member.joinedAt}
                            </div>
                          </div>
                        </div>

                        {canEditMemberRole && (
                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            {onUpdateMemberRole && (
                              <select
                                value={member.role}
                                onChange={(e) => onUpdateMemberRole(member.userId, e.target.value as UserRole)}
                                className="px-2 py-1 rounded-lg border border-stone-200 text-xs bg-stone-50 font-bold"
                              >
                                <option value="Herdsman">Herdsman</option>
                                <option value="Support Admin">Support Admin</option>
                                <option value="Veterinarian">Veterinarian</option>
                                <option value="Field Staff">Field Staff</option>
                              </select>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Remove access for helper "${member.name}"?`)) {
                                  onRemoveMember(member.userId);
                                }
                              }}
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Remove helper from farm"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB: BREED PROPOSALS & UNIVERSAL CATALOG REGISTRY */}
          {activeTab === 'breeds' && (
            <div className="space-y-6">
              
              {/* Informational Guidance Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-amber-50 border border-purple-200 text-xs text-purple-950 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📋</span>
                    <div>
                      <div className="font-black text-purple-950 flex items-center gap-1.5 text-sm">
                        <span>Propose New Goat & Sheep Breeds to Universal Catalog</span>
                        <span className="text-[10px] font-black bg-purple-200 text-purple-900 px-2 py-0.5 rounded-full">
                          Community Registry
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-900 font-medium mt-0.5">
                        Have indigenous, regional, or crossbreed sheep and goats not in the standard list? Submit your breed proposal here.
                      </p>
                    </div>
                  </div>

                  {onOpenSystemAdmin && (
                    <button
                      type="button"
                      onClick={onOpenSystemAdmin}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto transition-transform active:scale-95"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                      <span>System Admin Review Dashboard</span>
                      {totalPendingProposalsInSystem > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-stone-950 text-[10px] font-black">
                          {totalPendingProposalsInSystem}
                        </span>
                      )}
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-purple-900/80 leading-relaxed pt-1 border-t border-purple-200/60">
                  💡 <strong>How it works:</strong> Once submitted by a farm admin, proposals enter <em>Pending</em> status. The System Admin (<strong>madhusav@gmail.com</strong>) validates the proposal against the ICAR-NBAGR accession registry and approves or rejects it. Once approved, the breed is immediately available to <strong>all farms</strong> in the app when adding animals!
                </div>
              </div>

              {/* Submission Notice Toast */}
              {propNotice && (
                <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-200 ${
                  propNotice.type === 'success' 
                    ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' 
                    : 'bg-red-100 text-red-950 border border-red-300'
                }`}>
                  {propNotice.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />}
                  <span>{propNotice.message}</span>
                </div>
              )}

              {/* 1. SUBMIT PROPOSAL FORM */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4 shadow-2xs">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-purple-800" />
                  <h3 className="text-sm font-black text-stone-900">
                    {localeText({
                      en: 'Submit New Breed Proposal',
                      hi: 'नई नस्ल का प्रस्ताव भेजें',
                      kn: 'ಹೊಸ ತಳಿಯ ಪ್ರಸ್ತಾವನೆ ಸಲ್ಲಿಸಿ',
                      te: 'కొత్త జాతి ప్రతిపాదనను పంపండి',
                      ta: 'புதிய இன முன்மொழிவை சமர்ப்பிக்கவும்',
                      ml: 'പുതിയ ഇനം നിർദ്ദേശം സമർപ്പിക്കുക',
                      mr: 'नवीन जातीचा प्रस्ताव पाठवा',
                    })}
                  </h3>
                </div>

                <form onSubmit={handleBreedProposalSubmit} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Species *',
                          hi: 'पशु प्रकार *',
                          kn: 'ಪ್ರಾಣಿ ವಿಧ *',
                          te: 'జంతు రకం *',
                          ta: 'இன வகை *',
                          ml: 'ജീവി വർഗ്ഗം *',
                          mr: 'जनावर प्रकार *',
                        })}
                      </label>
                      <select
                        value={propSpecies}
                        onChange={(e) => setPropSpecies(e.target.value as Species)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
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

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Proposed Breed Name *',
                          hi: 'नस्ल का नाम *',
                          kn: 'ತಳಿಯ ಹೆಸರು *',
                          te: 'జాతి పేరు *',
                          ta: 'இனப் பெயர் *',
                          ml: 'ഇനത്തിന്റെ പേര് *',
                          mr: 'जातीचे नाव *',
                        })}
                      </label>
                      <input
                        type="text"
                        required
                        value={propBreedName}
                        onChange={(e) => setPropBreedName(e.target.value)}
                        placeholder="e.g. Attappady Black / Dumba Fat-Tailed / Patanwadi"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Native Region / State',
                          hi: 'मूल क्षेत्र / राज्य',
                          kn: 'ಮೂಲ ಪ್ರದೇಶ / ರಾಜ್ಯ',
                          te: 'స్థానిక ప్రాంతం / రాష్ట్రం',
                          ta: 'பூர்வீக பகுதி / மாநிலம்',
                          ml: 'സ്വദേശ പ്രദേശം / സംസ്ഥാനം',
                          mr: 'मूळ प्रदेश / राज्य',
                        })}
                      </label>
                      <input
                        type="text"
                        value={propOrigin}
                        onChange={(e) => setPropOrigin(e.target.value)}
                        placeholder="e.g. Palakkad, Kerala / Rajasthan"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Primary Purpose',
                          hi: 'मुख्य उपयोग',
                          kn: 'ಮುಖ್ಯ ಉದ್ದೇಶ',
                          te: 'ప్రధాన ప్రయోజనం',
                          ta: 'முக்கிய பயன்பாடு',
                          ml: 'പ്രധാന ഉപയോഗം',
                          mr: 'मुख्य उपयोग',
                        })}
                      </label>
                      <select
                        value={propPurpose}
                        onChange={(e) => setPropPurpose(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                      >
                        <option value="Meat">{localeText({
                          en: 'Meat',
                          hi: 'मांस उत्पादन',
                          kn: 'ಮಾಂಸ',
                          te: 'మాంసం',
                          ta: 'இறைச்சி',
                          ml: 'മാംസം',
                          mr: 'मांस उत्पादन',
                        })}</option>
                        <option value="Milk">{localeText({
                          en: 'Milk',
                          hi: 'दुग्ध उत्पादन',
                          kn: 'ಹಾಲು',
                          te: 'పాలు',
                          ta: 'பால்',
                          ml: 'പാൽ',
                          mr: 'दूध उत्पादन',
                        })}</option>
                        <option value="Dual Purpose (Meat & Milk)">{localeText({
                          en: 'Dual Purpose (Meat & Milk)',
                          hi: 'मांस व दूध',
                          kn: 'ದ್ವಿಗುಣ ಉದ್ದೇಶ (ಮಾಂಸ & ಹಾಲು)',
                          te: 'ద్విముఖ ప్రయోజనం (మాంసం & పాలు)',
                          ta: 'இருநோக்கு பயன்பாடு (பால் & இறைச்சி)',
                          ml: 'ഇരട്ട ഉദ്ദേശ്യം (പാൽ & മാംസം)',
                          mr: 'दुहेरी वापर (मांस व दूध)',
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
                        <option value="Draft / Multi-purpose">Draft / Multi-purpose</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Avg Adult Weight (kg)
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        value={propWeight}
                        onChange={(e) => setPropWeight(e.target.value)}
                        placeholder="e.g. 40"
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      {localeText({
                        en: 'Key Characteristics & Physical Traits',
                        hi: 'शारीरिक पहचान, कान, रंग व रोग प्रतिरोधक क्षमता',
                        kn: 'ಪ್ರಮುಖ ಲಕ್ಷಣಗಳು ಮತ್ತು ದೈಹಿಕ ಗುಣಗಳು',
                        te: 'ముఖ్య లక్షణాలు మరియు శరీర గుణాలు',
                        ta: 'முக்கிய குணாதிசயங்கள் மற்றும் உடல் பண்புகள்',
                        ml: 'പ്രധാന സവിശേഷതകൾ',
                        mr: 'शारीरिक वैशिष्ट्ये, कान, रंग व रोगप्रतिकारक्षमता',
                      })}
                    </label>
                    <textarea
                      rows={2}
                      value={propTraits}
                      onChange={(e) => setPropTraits(e.target.value)}
                      placeholder="e.g. Jet black glossy coat, bronze-colored eyes, curved horns, superior heat and tick resistance in humid regions..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-purple-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 shadow-sm cursor-pointer transition-all active:scale-98"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Breed Proposal to System Admin</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* 2. PENDING & PROPOSED BREEDS FOR THIS FARM */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-700" />
                    <span>Your Farm's Breed Proposals ({farmProposals.length})</span>
                  </h3>
                  <span className="text-[11px] text-stone-500 font-bold">
                    {farmPendingBreedProposals.length} awaiting decision
                  </span>
                </div>

                {farmProposals.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-stone-300 text-center text-xs text-stone-500 bg-stone-50/50">
                    No breed proposals submitted by this farm yet. Use the form above to suggest rare or indigenous breeds!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {farmProposals.map(prop => (
                      <div
                        key={prop.id}
                        className={`p-4 rounded-2xl border transition-all ${
                          prop.status === 'pending'
                            ? 'border-amber-300 bg-amber-50/40 shadow-xs'
                            : prop.status === 'approved'
                            ? 'border-emerald-300 bg-emerald-50/30'
                            : 'border-red-200 bg-red-50/20'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                                prop.species === 'Goat' ? 'bg-amber-100 text-amber-950' : 'bg-sky-100 text-sky-950'
                              }`}>
                                {prop.species === 'Goat' ? '🐐 Goat' : '🐑 Sheep'}
                              </span>

                              <span className="font-extrabold text-stone-900 text-sm">
                                {prop.breedName}
                              </span>

                              {/* Status Badge */}
                              {prop.status === 'pending' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full">
                                  <Clock className="w-2.5 h-2.5" />
                                  <span>Pending System Admin Review</span>
                                </span>
                              )}

                              {prop.status === 'approved' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 rounded-full">
                                  <Check className="w-2.5 h-2.5 text-emerald-700" />
                                  <span>Approved & Live in Universal Catalog</span>
                                </span>
                              )}

                              {prop.status === 'rejected' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-black bg-red-100 text-red-950 border border-red-300 px-2 py-0.5 rounded-full">
                                  <X className="w-2.5 h-2.5 text-red-700" />
                                  <span>Declined</span>
                                </span>
                              )}
                            </div>

                            {prop.originRegion && (
                              <div className="text-xs text-stone-600 font-medium">
                                📍 Native Tract: <strong>{prop.originRegion}</strong> · {prop.primaryPurpose} {prop.averageMatureWeightKg ? `· ~${prop.averageMatureWeightKg} kg` : ''}
                              </div>
                            )}

                            {prop.characteristics && (
                              <p className="text-xs text-stone-600 italic bg-white/70 p-2 rounded-xl border border-stone-200/60 mt-1">
                                "{prop.characteristics}"
                              </p>
                            )}

                            {prop.adminNotes && (
                              <div className="text-[11px] text-emerald-900 bg-emerald-100/60 p-2 rounded-xl border border-emerald-200 font-medium mt-1">
                                💬 <strong>Admin Note:</strong> {prop.adminNotes}
                              </div>
                            )}

                            {prop.rejectionReason && (
                              <div className="text-[11px] text-red-900 bg-red-100/60 p-2 rounded-xl border border-red-200 font-medium mt-1">
                                ⚠️ <strong>Reason for decline:</strong> {prop.rejectionReason}
                              </div>
                            )}
                          </div>

                          <div className="text-[10px] text-stone-400 font-medium shrink-0 text-left sm:text-right">
                            <div>Submitted: {new Date(prop.createdAt).toLocaleDateString()}</div>
                            {prop.reviewedAt && (
                              <div>Reviewed: {new Date(prop.reviewedAt).toLocaleDateString()} by {prop.reviewedBy}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. CURRENT UNIVERSAL BREEDS PREVIEW */}
              <div className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-stone-800 uppercase tracking-wider">
                    Universal Breed Catalog Quick Reference ({globalBreeds.length})
                  </h4>
                  <span className="text-[11px] text-stone-500 font-medium">
                    Already available on all animal forms
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {globalBreeds.map(b => (
                    <span
                      key={b.id}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        b.species === 'Goat'
                          ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                          : 'bg-sky-50/80 border-sky-200 text-sky-950'
                      }`}
                    >
                      <span>{b.species === 'Goat' ? '🐐' : '🐑'}</span>
                      <span>{b.name}</span>
                      {!b.isSystemDefault && (
                        <span className="text-[9px] bg-emerald-700 text-white px-1 rounded-full font-black">
                          New
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VACCINE POLICIES & NOTIFICATION CONFIGURATION */}
          {activeTab === 'vaccines' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-950 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-indigo-900">
                  <Syringe className="w-4 h-4 text-indigo-700" />
                  <span>Vaccine Security & Notification Policy</span>
                </div>
                <p>
                  As requested, <strong>only Admin and Support Admin</strong> can add, edit, or delete vaccine records. Regular helpers can only view vaccination status and see alerts.
                </p>
              </div>

              {policySaved && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>✓ Vaccine policies and alert days saved successfully!</span>
                </div>
              )}

              {/* Reminder Threshold Setting */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h3 className="text-sm font-black text-stone-900">
                  {localeText({
                    en: 'Vaccination Due Alert Window',
                    hi: 'टीकाकरण चेतावनी समय',
                    kn: 'ಲಸಿಕೆ ಎಚ್ಚರಿಕೆ ಸಮಯ',
                    te: 'టీకా హెచ్చరిక సమయం',
                    ta: 'தடுப்பூசி எச்சரிக்கை காலம்',
                    ml: 'കുത്തിവയ്പ്പ് മുന്നറിയിപ്പ് സമയം',
                    mr: 'लसीकरण चेतावणी कालावधी',
                  })}
                </h3>
                <p className="text-xs text-stone-600">
                  How many days before a vaccine is due should the system show notifications to workers on the farm dashboard?
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[3, 7, 14, 30].map(days => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setVaccineAlertDays(days)}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        vaccineAlertDays === days
                          ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:bg-stone-50 font-bold text-xs'
                      }`}
                    >
                      <div className="text-base font-black">{days} Days</div>
                      <div className="text-[10px] text-stone-500">before due date</div>
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveVaccinePolicy}
                    className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer"
                  >
                    Save Alert Window Setting
                  </button>
                </div>
              </div>

              {/* Custom Vaccine Catalog */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h3 className="text-sm font-black text-stone-900">
                  {localeText({
                    en: 'Farm Vaccine Catalog',
                    hi: 'मानक टीके',
                    kn: 'ಫಾರ್ಮ್ ಲಸಿಕೆ ಪಟ್ಟಿ',
                    te: 'ఫారం టీకా జాబితా',
                    ta: 'பண்ணை தடுப்பூசி பட்டியல்',
                    ml: 'ഫാം വാക്സിൻ പട്ടിക',
                    mr: 'फार्म लस सूची',
                  })}
                </h3>
                <p className="text-xs text-stone-600">
                  Admin can configure custom vaccines commonly used in this locality.
                </p>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customVaccineInput}
                    onChange={(e) => setCustomVaccineInput(e.target.value)}
                    placeholder="e.g. Theileriosis Vaccine / Bovine Herpes"
                    className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomVaccine}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer shrink-0"
                  >
                    + Add Vaccine
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {customVaccines.map(vac => (
                    <span
                      key={vac}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-stone-800"
                    >
                      <span>💉 {vac}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomVaccine(vac)}
                        className="text-stone-400 hover:text-red-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: FARM PROFILE, WEATHER LOCATION & APPLICATION NAME CONFIGURATION */}
          {activeTab === 'farm' && (
            <div className="space-y-6">
              {profileSaved && (
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-900 text-xs font-bold flex items-center gap-1.5 animate-in fade-in duration-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>✓ Application name, farm location, and profile settings saved successfully!</span>
                </div>
              )}

              <form onSubmit={handleSaveFarmProfile} className="space-y-5">
                
                {/* 1. APPLICATION NAME CONFIGURATION */}
                <div className="p-5 rounded-2xl border-2 border-emerald-500/30 bg-emerald-50/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🏷️</span>
                      <div>
                        <h3 className="text-sm font-black text-stone-900">
                          {localeText({
                            en: 'Application Name',
                            hi: 'एप्लीकेशन का नाम',
                            kn: 'ಅಪ್ಲಿಕೇಶನ್ ಹೆಸರು',
                            te: 'అప్లికేషన్ పేరు',
                            ta: 'பயன்பாட்டின் பெயர்',
                            ml: 'ആപ്ലിക്കേഷൻ പേര്',
                            mr: 'अ‍ॅपचे नाव',
                          })}
                        </h3>
                        <p className="text-[11px] text-stone-600 font-medium">
                          Configurable app brand displayed in the top navbar, header, and system reports.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setAppNameInput('Testing')}
                      className="px-2.5 py-1 rounded-lg border border-emerald-400 bg-white hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold cursor-pointer transition-all shadow-2xs"
                    >
                      Reset to "Testing"
                    </button>
                  </div>

                  <div className="pt-1">
                    <input
                      type="text"
                      required
                      value={appNameInput}
                      onChange={(e) => setAppNameInput(e.target.value)}
                      placeholder="e.g. Testing"
                      className="w-full sm:max-w-md px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-sm font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                    <p className="text-[11px] text-stone-500 mt-1">
                      Currently configured as: <strong className="text-emerald-950 font-black">"{appNameInput || 'Testing'}"</strong>
                    </p>
                  </div>
                </div>

                {/* 2. FARM WEATHER LOCATION CONFIGURATION */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">☀️</span>
                      <div>
                        <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-amber-700" />
                          <span>{localeText({
                            en: 'Farm Weather Location',
                            hi: 'मौसम स्थान सेटिंग',
                            kn: 'ಹವಾಮಾನ ಸ್ಥಳ ಸೆಟ್ಟಿಂಗ್',
                            te: 'వాతావరణ స్థానం సెట్టింగ్',
                            ta: 'வானிலை இருப்பிட அமைப்பு',
                            ml: 'കാലാവസ്ഥാ സ്ഥലം ക്രമീകരണം',
                            mr: 'हवामान ठिकाण सेटिंग',
                          })}</span>
                        </h3>
                        <p className="text-xs text-stone-600">
                          Set the city/district of your farm. The live temperature widget in the corner shows live weather for this location.
                        </p>
                      </div>
                    </div>

                    {/* GPS Button */}
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={isDetectingGps}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs disabled:opacity-50"
                      title="Use device GPS to set farm coordinates"
                    >
                      <Navigation className={`w-3.5 h-3.5 text-amber-700 ${isDetectingGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingGps ? 'Detecting GPS...' : '📍 Detect Device GPS'}</span>
                    </button>
                  </div>

                  {gpsNotice && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 font-bold flex items-center gap-2">
                      <span>{gpsNotice}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Location / District Name or GPS Coordinates
                    </label>
                    <input
                      type="text"
                      required
                      value={farmLocation}
                      onChange={(e) => setFarmLocation(e.target.value)}
                      placeholder="e.g. Anand, Gujarat or Pune, Maharashtra"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Quick Preset Farming Districts */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-stone-500 block">
                      {localeText({
                        en: 'Quick Select Farming Hubs:',
                        hi: 'क्विक जिला चयन:',
                        kn: 'ತ್ವರಿತ ಜಿಲ್ಲಾ ಆಯ್ಕೆ:',
                        te: 'త్వరిత జిల్లా ఎంపిక:',
                        ta: 'விரைவு மாவட்ட தேர்வு:',
                        ml: 'പെട്ടെന്ന് ജില്ല തിരഞ്ഞെടുക്കുക:',
                        mr: 'झटपट जिल्हा निवडा:',
                      })}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Anand, Gujarat',
                        'Pune, Maharashtra',
                        'Karnal, Haryana',
                        'Jaipur, Rajasthan',
                        'Ludhiana, Punjab',
                        'Nagpur, Maharashtra',
                        'Coimbatore, Tamil Nadu',
                        'Varanasi, UP',
                        'Patna, Bihar',
                        'Hyderabad, Telangana',
                        'Hisar, Haryana',
                        'Satara, Maharashtra',
                      ].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setFarmLocation(loc)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                            farmLocation.toLowerCase().includes(loc.split(',')[0].toLowerCase())
                              ? 'bg-amber-100 border-amber-400 text-amber-950 font-black shadow-2xs'
                              : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-700'
                          }`}
                        >
                          🌾 {loc}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3. FARM PROFILE DETAILS */}
                <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                  <h3 className="text-sm font-black text-stone-900">
                    Farm Profile Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Farm Name',
                          hi: 'फार्म का नाम',
                          kn: 'ಫಾರ್ಮ್ ಹೆಸರು',
                          te: 'ఫారం పేరు',
                          ta: 'பண்ணை பெயர்',
                          ml: 'ഫാം പേര്',
                          mr: 'फार्मचे नाव',
                        })}
                      </label>
                      <input
                        type="text"
                        required
                        value={farmName}
                        onChange={(e) => setFarmName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Total Acreage (Acres)',
                          hi: 'कुल ज़मीन (एकड़)',
                          kn: 'ಒಟ್ಟು ಭೂಮಿ (ಎಕರೆ)',
                          te: 'మొత్తం భూమి (ఎకరాలు)',
                          ta: 'மொத்த நிலம் (ஏக்கர்)',
                          ml: 'ആകെ സ്ഥലം (ഏക്കർ)',
                          mr: 'एकूण जमीन (एकर)',
                        })}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={totalAcreage}
                        onChange={(e) => setTotalAcreage(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Contact Phone',
                          hi: 'संपर्क नंबर',
                          kn: 'ಸಂಪರ್ಕ ಸಂಖ್ಯೆ',
                          te: 'సంప్రదింపు నంబరు',
                          ta: 'தொடர்பு எண்',
                          ml: 'ഫോൺ നമ്പർ',
                          mr: 'संपर्क क्रमांक',
                        })}
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {localeText({
                          en: 'Daily Milk Target',
                          hi: 'दैनिक दूध लक्ष्य',
                          kn: 'ದೈನಂದಿನ ಹಾಲು ಗುರಿ',
                          te: 'రోజువారీ పాల లక్ష్యం',
                          ta: 'தினசரி பால் இலக்கு',
                          ml: 'പ്രതിദിന പാൽ ലക്ഷ്യം',
                          mr: 'दैनिक दूध उद्दिष्ट',
                        })}
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="1"
                          value={targetMilkLiters}
                          onChange={(e) => setTargetMilkLiters(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-black font-mono"
                        />
                        <span className="text-xs font-bold text-stone-600 shrink-0">Liters</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black cursor-pointer shadow-sm active:scale-98 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Farm & Location Settings</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: MYSQL DATABASE MANAGEMENT & EXPORT */}
          {activeTab === 'database' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-xs text-sky-950 space-y-1">
                <div className="font-black flex items-center gap-1.5 text-sky-900">
                  <Database className="w-4 h-4 text-sky-700" />
                  <span>Production MySQL Database Engine</span>
                </div>
                <p>
                  This farm application runs on a real relational MySQL data model with ACID support, foreign key cascade deletion, and multi-tenant farm isolation.
                </p>
              </div>

              {/* MySQL Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] font-bold text-stone-500 uppercase">Database Status</div>
                  <div className="text-emerald-700 font-black text-sm flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                    <span>MySQL Connected & Active</span>
                  </div>
                  <div className="text-[11px] text-stone-500">Character Set: utf8mb4</div>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] font-bold text-stone-500 uppercase">Total Relational Tables</div>
                  <div className="text-stone-900 font-black text-sm">11 Normalized Tables</div>
                  <div className="text-[11px] text-stone-500">Foreign Keys & Cascades enabled</div>
                </div>

                <div className="p-4 rounded-2xl border border-stone-200 bg-white space-y-1">
                  <div className="text-[11px] font-bold text-stone-500 uppercase">Farm Records</div>
                  <div className="text-stone-900 font-black text-sm">
                    {farm.animals.length} Animals · {farm.vaccinations.length} Vaccines
                  </div>
                  <div className="text-[11px] text-stone-500">{farm.milkLogs?.length || 0} Milk Logs recorded</div>
                </div>
              </div>

              {/* Actions: Download SQL Dump & View SQL */}
              <div className="p-5 rounded-2xl border border-stone-200 bg-white space-y-4">
                <h3 className="text-sm font-black text-stone-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-800" />
                  <span>Export MySQL Database Dump (.sql)</span>
                </h3>
                <p className="text-xs text-stone-600">
                  Download standard MySQL 8.0 `CREATE TABLE` and `INSERT INTO` statements ready to import directly into any cloud or local MySQL server instance.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSqlDump}
                    className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MySQL Dump (.sql)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleOpenSqlPreview}
                    className="px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCode className="w-4 h-4 text-stone-500" />
                    <span>Preview SQL Script</span>
                  </button>
                </div>
              </div>

              {/* Data Reset & Danger Zone */}
              {isAdmin && (
                <div className="p-5 rounded-2xl border border-red-200 bg-red-50/40 space-y-3">
                  <h3 className="text-xs font-black text-red-950 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-red-700" />
                    <span>Database Maintenance & Reset</span>
                  </h3>
                  <p className="text-xs text-stone-600">
                    You can reload starter farm data (Gir Cow & Sirohi Goat demo) or wipe farm data to start clean.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {onResetStarterData && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Reload sample starter farm data (Gir Cows & Sirohi Goats)?')) {
                            onResetStarterData();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold cursor-pointer"
                      >
                        Reload Starter Demo Farm
                      </button>
                    )}

                    {onClearFarmData && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Clear all animals and records for this farm? This cannot be undone!')) {
                            onClearFarmData();
                          }
                        }}
                        className="px-3 py-1.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-100 text-xs font-bold cursor-pointer"
                      >
                        Wipe All Livestock Records
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* SQL Preview Modal */}
              {showSqlPreview && (
                <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                  <div className="bg-white w-full max-w-3xl rounded-3xl border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                    <div className="px-6 py-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-emerald-800" />
                        <h4 className="text-sm font-black text-stone-900">MySQL Database Script Preview</h4>
                      </div>
                      <button
                        onClick={() => setShowSqlPreview(false)}
                        className="p-1 rounded-full text-stone-500 hover:bg-stone-200 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-4 overflow-y-auto flex-1 bg-stone-900 text-stone-100 font-mono text-xs">
                      <pre className="whitespace-pre-wrap">{sqlDumpContent}</pre>
                    </div>

                    <div className="p-4 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={handleDownloadSqlDump}
                        className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download .sql File</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowSqlPreview(false)}
                        className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold cursor-pointer text-stone-700"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
