import React, { useState } from 'react';
import { Farm, User, UserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Clock, 
  ShieldAlert,
  Lock
} from 'lucide-react';

interface FarmAdminUsersModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onApproveRequest: (requestId: string, assignedRole: UserRole) => void;
  onRejectRequest: (requestId: string) => void;
  onAddUserDirectly: (name: string, identifier: string, role: UserRole) => void;
  onRemoveMember: (userId: string) => void;
}

export const FarmAdminUsersModal: React.FC<FarmAdminUsersModalProps> = ({
  farm,
  currentUser,
  onClose,
  onApproveRequest,
  onRejectRequest,
  onAddUserDirectly,
  onRemoveMember,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;

  // Direct user addition form
  const [newUserName, setNewUserName] = useState('');
  const [newUserIdentifier, setNewUserIdentifier] = useState('+91 ');
  const [newUserRole, setNewUserRole] = useState<UserRole>('Herdsman');
  const [addSuccessNotice, setAddSuccessNotice] = useState('');
  const [addErrorNotice, setAddErrorNotice] = useState('');

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
    setAddSuccessNotice(`✓ Helper "${newUserName}" (${newUserIdentifier}) can now open and update this farm!`);
    setNewUserName('');
    setNewUserIdentifier('+91 ');
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">👥</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">Farm Helpers & Approvals</h2>
                <span className="font-mono text-xs font-black text-stone-800 bg-stone-100 px-2 py-0.5 rounded">
                  {farm.id}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium">
                {farm.name} · Farm Boss: <strong>{farm.adminName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* Simple Explanation of the rule for child or farmer */}
          <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-xs text-amber-950 space-y-1">
            <div className="flex items-center gap-1.5 font-black text-amber-900 text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-700" />
              <span>How Farm Permissions Work (फ़ार्म के नियम):</span>
            </div>
            <p className="leading-relaxed">
              1. <strong>Only the Farm Boss</strong> can approve helpers or add them with their mobile phone number or email ID.<br/>
              2. <strong>Farm Helpers</strong> can see all animals, add daily milk, record weights, and give doctor vaccines, but <strong>CANNOT delete any animal</strong>!
            </p>
          </div>

          {/* Section 1: Pending Join Requests */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>People Asking to Help on this Farm ({pendingRequests.length})</span>
              </h3>
            </div>

            {pendingRequests.length === 0 ? (
              <div className="p-4 rounded-2xl border border-dashed border-stone-200 bg-stone-50/50 text-center text-xs text-stone-500">
                No new people waiting to join right now.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingRequests.map(req => (
                  <div
                    key={req.id}
                    className="p-4 rounded-2xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 text-sm">{req.userName}</span>
                        <span className="font-mono text-xs text-stone-600 bg-stone-100 px-2 py-0.5 rounded font-bold">
                          {req.userIdentifier}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600 mt-1">
                        Asked on {req.requestedAt} {req.message ? `— "${req.message}"` : ''}
                      </p>
                    </div>

                    {isAdmin ? (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => onApproveRequest(req.id, 'Herdsman')}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve as Helper</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onApproveRequest(req.id, 'Veterinarian')}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve as Doctor</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onRejectRequest(req.id)}
                          className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-red-100 hover:text-red-800 text-stone-700 text-xs font-semibold cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-stone-500 italic">
                        Only Farm Boss can tap Approve
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Direct Addition by Mobile or Email (Farm Boss Only) */}
          {isAdmin ? (
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-800" />
                <h3 className="text-sm font-extrabold text-stone-900">
                  Add a Helper by Mobile Phone Number (+91)
                </h3>
              </div>
              
              <p className="text-xs text-stone-500">
                Type their phone number so they can log in and update daily milk and animal weights.
              </p>

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Helper Name (नाम)
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      placeholder="e.g. Raju Gwala"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Mobile Number (मोबाइल)
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserIdentifier}
                      onChange={(e) => setNewUserIdentifier(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Role / Job
                    </label>
                    <select
                      value={newUserRole}
                      onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 cursor-pointer"
                    >
                      <option value="Herdsman">Farm Helper (Add Milk & Weight)</option>
                      <option value="Veterinarian">Animal Doctor (Vaccines & Medicine)</option>
                    </select>
                  </div>
                </div>

                {addErrorNotice && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium">
                    {addErrorNotice}
                  </div>
                )}

                {addSuccessNotice && (
                  <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs text-emerald-950 font-bold">
                    {addSuccessNotice}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add Helper to Farm</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
              <Lock className="w-4 h-4 text-stone-400 shrink-0" />
              <span>You are viewing as a helper. Only Farm Boss <strong>{farm.adminName}</strong> can invite new helpers.</span>
            </div>
          )}

          {/* Section 3: Active Members List */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-stone-700">
              Active People on this Farm ({farm.members.length})
            </h3>

            <div className="border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-200">
              {farm.members.map(member => {
                const isMemberAdmin = member.role === 'Admin' || member.userId === farm.adminUserId;
                return (
                  <div
                    key={member.userId}
                    className="p-4 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-stone-900 text-sm">{member.name}</span>
                        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${
                          isMemberAdmin
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-emerald-100 text-emerald-950'
                        }`}>
                          {isMemberAdmin ? '👑 Farm Boss' : '🚜 Farm Helper'}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500 font-mono mt-0.5 font-bold">
                        {member.identifier} · Joined on {member.joinedAt}
                      </div>
                      <div className="text-[11px] text-stone-400 mt-0.5 font-medium">
                        {isMemberAdmin ? 'Has full permissions including delete' : 'Can view & update details (cannot delete animals)'}
                      </div>
                    </div>

                    {isAdmin && !isMemberAdmin && (
                      <button
                        type="button"
                        onClick={() => onRemoveMember(member.userId)}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-700 hover:bg-red-50 transition-colors self-start sm:self-auto cursor-pointer"
                        title="Remove helper"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-stone-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
