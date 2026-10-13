import React, { useState } from 'react';
import { Farm, User, Animal, VaccinationRecord, isVaccineManager } from '../types';
import { db } from '../services/db';
import { 
  Syringe, 
  Check, 
  Clock, 
  AlertTriangle, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Lock,
  Plus,
  Edit2,
  Trash2,
  X,
  Bell
} from 'lucide-react';

interface VaccinationScheduleViewProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onMarkVaccineComplete: (vacId: string) => void;
  onAddVaccine?: (vac: Omit<VaccinationRecord, 'id'>) => void;
  onUpdateVaccine?: (vacId: string, updates: Partial<VaccinationRecord>) => void;
  onDeleteVaccine?: (vacId: string) => void;
}

export const VaccinationScheduleView: React.FC<VaccinationScheduleViewProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onMarkVaccineComplete,
  onAddVaccine,
  onUpdateVaccine,
  onDeleteVaccine,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const canManageVaccine = isVaccineManager(currentMember?.role, isAdmin);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Due Soon' | 'Overdue' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingVac, setEditingVac] = useState<VaccinationRecord | null>(null);

  // Add Form state
  const [targetAnimalId, setTargetAnimalId] = useState(farm.animals[0]?.id || '');
  const [vacName, setVacName] = useState('');
  const [vacDisease, setVacDisease] = useState('');
  const [vacDueDate, setVacDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [vacDosage, setVacDosage] = useState('2.0 mL injection');
  const [vacBatch, setVacBatch] = useState('LOT-IND-2026');

  // Edit Form state
  const [editName, setEditName] = useState('');
  const [editDisease, setEditDisease] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editDosage, setEditDosage] = useState('');
  const [editBatch, setEditBatch] = useState('');

  // Nearing alerts
  const alerts = db.getVaccineAlerts(farm.id);

  const filteredVaccines = farm.vaccinations.filter(v => {
    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    const animal = farm.animals.find(a => a.id === v.animalId);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;
    const matchesQuery = 
      v.vaccineName.toLowerCase().includes(q) ||
      v.diseaseTarget.toLowerCase().includes(q) ||
      (animal && (animal.name.toLowerCase().includes(q) || animal.tagId.toLowerCase().includes(q)));
    return matchesStatus && matchesQuery;
  });

  const handleStartEdit = (vac: VaccinationRecord) => {
    setEditingVac(vac);
    setEditName(vac.vaccineName);
    setEditDisease(vac.diseaseTarget);
    setEditDueDate(vac.dueDate);
    setEditDosage(vac.dosage);
    setEditBatch(vac.batchNumber);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVac || !onUpdateVaccine) return;

    onUpdateVaccine(editingVac.id, {
      vaccineName: editName.trim(),
      diseaseTarget: editDisease.trim(),
      dueDate: editDueDate,
      dosage: editDosage.trim(),
      batchNumber: editBatch.trim(),
    });

    setEditingVac(null);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim() || !targetAnimalId || !onAddVaccine) return;

    onAddVaccine({
      animalId: targetAnimalId,
      vaccineName: vacName.trim(),
      diseaseTarget: vacDisease.trim() || 'Herd Protection',
      dueDate: vacDueDate,
      status: 'Scheduled',
      dosage: vacDosage.trim() || '2.0 mL injection',
      batchNumber: vacBatch.trim() || 'LOT-2026',
      nextBoosterDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    setVacName('');
    setVacDisease('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Vaccines & Medicine Shots (टीकाकरण)
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              {farm.vaccinations.length} Recorded
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Keep every cow, goat, sheep, and chicken healthy and protected on time!
          </p>
        </div>

        <div>
          {canManageVaccine ? (
            <button
              type="button"
              onClick={() => {
                setTargetAnimalId(farm.animals[0]?.id || '');
                setShowAddModal(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center gap-2 shadow-xs cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Schedule New Vaccine Shot</span>
            </button>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-bold flex items-center gap-1.5" title="Only Admin or Support Admin can add or delete vaccine shots">
              <Lock className="w-3.5 h-3.5 text-stone-400" />
              <span>Schedule Shot (Admin & Support only)</span>
            </div>
          )}
        </div>
      </div>

      {/* Vaccine Nearing Alert Notification Banner */}
      {alerts.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center text-xl shrink-0">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  Vaccination Alert ({alerts.length} Pending)
                </span>
                <span className="text-[11px] font-bold px-2 py-0.2 rounded-full bg-amber-200 text-amber-950">
                  Reminder Window: {farm.config?.vaccineAlertDaysThreshold || 7} Days
                </span>
              </div>
              <p className="text-xs text-amber-950 font-bold mt-0.5">
                {alerts.map(a => `${a.animalName} (${a.species}) needs ${a.vaccineName} in ${a.daysLeft <= 0 ? 'OVERDUE' : `${a.daysLeft} days`}`).join(' · ')}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('Due Soon')}
              className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold cursor-pointer transition-colors shadow-xs"
            >
              Filter Due Shots
            </button>
          </div>
        </div>
      )}

      {/* Permission Explainer Notice */}
      <div className="p-3 px-4 rounded-2xl bg-stone-100 border border-stone-200 text-xs text-stone-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-800 shrink-0" />
          <span>
            {canManageVaccine 
              ? '✓ You have Admin/Support permissions: You can Add, Edit, Delete, or Mark vaccine records.'
              : '🔒 You are signed in as a helper: Only Farm Boss or Support Admin can create or delete vaccine records.'}
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
          {[
            { id: 'All', label: 'All Shots' },
            { id: 'Due Soon', label: '⏰ Due Soon' },
            { id: 'Overdue', label: '⚠️ Past Due Date' },
            { id: 'Completed', label: '✓ Already Done' },
          ].map(st => {
            const count = st.id === 'All'
              ? farm.vaccinations.length
              : farm.vaccinations.filter(v => v.status === st.id).length;
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as 'All' | 'Due Soon' | 'Overdue' | 'Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vaccine name, shot, or ear tag..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
          />
        </div>
      </div>

      {/* Vaccines List */}
      <div className="border border-stone-200 rounded-3xl bg-white overflow-hidden divide-y divide-stone-200 shadow-xs">
        {filteredVaccines.length === 0 ? (
          <div className="p-12 text-center text-xs text-stone-500">
            No vaccine shots match this filter. All animals are safe!
          </div>
        ) : (
          filteredVaccines.map(vac => {
            const animal = farm.animals.find(a => a.id === vac.animalId);
            const isOverdue = vac.status === 'Overdue';
            const isDueSoon = vac.status === 'Due Soon';
            const isDone = vac.status === 'Completed';

            return (
              <div
                key={vac.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-stone-50/70 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {animal && (
                    <div
                      onClick={() => onSelectAnimal(animal)}
                      className="w-14 h-14 rounded-2xl overflow-hidden border border-stone-200 shrink-0 cursor-pointer hover:border-emerald-700"
                    >
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-900'
                          : isOverdue 
                          ? 'bg-red-100 text-red-900 font-black' 
                          : isDueSoon 
                          ? 'bg-amber-100 text-amber-900 font-black' 
                          : 'bg-stone-100 text-stone-700'
                      }`}>
                        {isDone ? '✓ Shot Done' : isOverdue ? '⚠️ Past Due' : isDueSoon ? '⏰ Due Soon' : '📅 Scheduled'}
                      </span>
                      <span className="font-mono text-xs text-stone-500 font-bold">
                        Date: {vac.dueDate} · Lot #{vac.batchNumber}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-stone-900 text-base mt-1">
                      {vac.vaccineName}
                    </h3>
                    
                    <p className="text-xs text-stone-600 mt-0.5">
                      Protects from: {vac.diseaseTarget} · Dose: {vac.dosage}
                    </p>

                    {animal && (
                      <div className="mt-1.5 text-xs text-stone-600 flex items-center gap-1.5">
                        <span>Animal: <strong>{animal.name}</strong> (Tag #{animal.tagId})</span>
                        <span> · </span>
                        <span>{animal.species} ({animal.breed})</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => onMarkVaccineComplete(vac.id)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Shot Done</span>
                    </button>
                  ) : (
                    <div className="text-right text-xs font-mono text-emerald-800">
                      <div className="font-bold">✓ Given on {vac.administeredDate}</div>
                      <div className="text-[11px] text-stone-500 font-sans">By {vac.administeredBy || 'Farm Staff'}</div>
                    </div>
                  )}

                  {/* Admin / Support CRUD controls */}
                  {canManageVaccine && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(vac)}
                        className="p-2 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="Edit Vaccine Shot (Admin & Support only)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteVaccine && (
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Delete vaccine record "${vac.vaccineName}"?`)) {
                              onDeleteVaccine(vac.id);
                            }
                          }}
                          className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                          title="Delete Vaccine Record (Admin & Support only)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}

                  {animal && (
                    <button
                      type="button"
                      onClick={() => onSelectAnimal(animal)}
                      className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
                    >
                      See Diary
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SCHEDULE NEW VACCINE MODAL (ADMIN & SUPPORT ONLY) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto">
            <div className="px-6 py-4 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💉</span>
                <h3 className="font-black text-stone-900 text-base">Schedule New Vaccine Shot</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Select Animal (किस जानवर को टीका लगेगा?)
                </label>
                <select
                  required
                  value={targetAnimalId}
                  onChange={(e) => setTargetAnimalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                >
                  {farm.animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.species} · Tag #{a.tagId})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Vaccine Name (टीके का नाम)
                </label>
                <input
                  type="text"
                  required
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  placeholder="e.g. FMD Mouth & Foot Fever / Black Quarter"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
                
                {/* Catalog quick picks */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(farm.config?.customVaccines || [
                    'FMD Vaccine',
                    'Black Quarter (BQ)',
                    'Anthrax',
                    'Brucellosis Shield',
                    'PPR Goat Plague'
                  ]).slice(0, 4).map(v => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setVacName(v)}
                      className="px-2 py-0.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-[10px] font-bold text-stone-700 cursor-pointer"
                    >
                      + {v.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Protects Against (बीमारी का नाम)
                  </label>
                  <input
                    type="text"
                    value={vacDisease}
                    onChange={(e) => setVacDisease(e.target.value)}
                    placeholder="e.g. Foot sores & fever"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Due Date (कब लगाना है?)
                  </label>
                  <input
                    type="date"
                    required
                    value={vacDueDate}
                    onChange={(e) => setVacDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dosage (मात्रा)
                  </label>
                  <input
                    type="text"
                    value={vacDosage}
                    onChange={(e) => setVacDosage(e.target.value)}
                    placeholder="e.g. 2.0 mL injection"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Batch / Lot Number (बैच नंबर)
                  </label>
                  <input
                    type="text"
                    value={vacBatch}
                    onChange={(e) => setVacBatch(e.target.value)}
                    placeholder="e.g. LOT-2026-IND"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Scheduled Shot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT VACCINE MODAL (ADMIN & SUPPORT ONLY) */}
      {editingVac && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto">
            <div className="px-6 py-4 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                <h3 className="font-black text-stone-900 text-base">Edit Vaccine Shot Details</h3>
              </div>
              <button
                onClick={() => setEditingVac(null)}
                className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Vaccine Name
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Protects Against
                  </label>
                  <input
                    type="text"
                    value={editDisease}
                    onChange={(e) => setEditDisease(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editDueDate}
                    onChange={(e) => setEditDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Dosage
                  </label>
                  <input
                    type="text"
                    value={editDosage}
                    onChange={(e) => setEditDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={editBatch}
                    onChange={(e) => setEditBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setEditingVac(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold cursor-pointer shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
