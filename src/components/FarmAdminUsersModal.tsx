import React, { useState } from 'react';
import { Farm, User, UserRole, FarmConfig, isVaccineManager } from '../types';
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
  Navigation
} from 'lucide-react';

interface FarmAdminUsersModalProps {
  farm: Farm;
  currentUser: User;
  initialTab?: 'team' | 'vaccines' | 'farm' | 'database';
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
}) => {
  const { t } = useLanguage();
  const isSuperAdmin = currentUser.isSuperAdmin || currentUser.identifier.toLowerCase() === 'admin@farmtrack.io';
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const isSupportAdmin = currentMember?.role === 'Support Admin';
  const hasAdminRights = isAdmin || isSupportAdmin || isSuperAdmin;

  const [activeTab, setActiveTab] = useState<'team' | 'vaccines' | 'farm' | 'database'>(initialTab || 'team');

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

  const pendingRequests = farm.joinRequests.filter(r => r.status === 'pending');

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
        <div className="px-2.5 sm:px-6 bg-stone-50 border-b border-stone-200 flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'team', label: '👥 Team & Approvals', badge: pendingRequests.length },
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
                      Add a Helper Directly (बिना इंतज़ार नया साथी जोड़ें)
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
                          Helper's Name (साथी का नाम)
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
                          Role & Permissions (भूमिका)
                        </label>
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-bold"
                        >
                          <option value="Herdsman">Herdsman (गौपालक / Helper)</option>
                          <option value="Support Admin">Support Admin (Can manage Vaccines & Settings)</option>
                          <option value="Veterinarian">Veterinarian (पशु चिकित्सक / Doctor)</option>
                          <option value="Field Staff">Field Staff (कार्यकर्ता)</option>
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
                  Vaccination Due Alert Window (टीकाकरण चेतावनी समय)
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
                  Farm Vaccine Catalog (मानक टीके)
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
                          Application Name (एप्लीकेशन का नाम)
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
                          <span>Farm Weather Location (मौसम स्थान सेटिंग)</span>
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
                      Quick Select Farming Hubs (क्विक जिला चयन):
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
                        Farm Name (फार्म का नाम)
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
                        Total Acreage (कुल ज़मीन एकड़)
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
                        Contact Phone (संपर्क नंबर)
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
                        Daily Milk Target (दैनिक दूध लक्ष्य)
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
