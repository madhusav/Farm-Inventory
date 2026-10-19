import React, { useState } from 'react';
import { Farm, User, Animal, VaccinationRecord, isVaccineManager } from '../types';
import { db } from '../services/db';
import { 
  Check, 
  Search, 
  Calendar, 
  Lock,
  Plus,
  Edit2,
  Trash2,
  X,
  Syringe,
  CheckSquare,
  Square
} from 'lucide-react';

interface VaccinationScheduleViewProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onMarkVaccineComplete: (vacId: string) => void;
  onAddVaccine?: (vac: Omit<VaccinationRecord, 'id'>) => void;
  onUpdateVaccine?: (vacId: string, updates: Partial<VaccinationRecord>) => void;
  onDeleteVaccine?: (vacId: string) => void;
  onBulkMarkComplete?: (vacIds: string[]) => void;
  onBulkAddVaccine?: (animalIds: string[], vacData: Omit<VaccinationRecord, 'id' | 'animalId'>) => void;
  onBulkUpdateVaccine?: (vacIds: string[], updates: Partial<VaccinationRecord>) => void;
  onBulkDeleteVaccine?: (vacIds: string[]) => void;
}

const COMMON_VACCINES = [
  { name: 'PPR (Goat & Sheep Plague)', disease: 'Peste des Petits Ruminants / High Fever & Pneumonia', dosage: '1.0 mL subcutaneous injection' },
  { name: 'Enterotoxemia (ET / Pulpy Kidney)', disease: 'Clostridium perfringens toxin / Sudden death in healthy flock', dosage: '2.0 mL subcutaneous in neck' },
  { name: 'Sheep & Goat Pox', disease: 'Pox virus nodular skin lesions & high fever', dosage: '0.5 mL subcutaneous injection' },
  { name: 'CCPP (Goat Pleuropneumonia)', disease: 'Contagious Caprine Pleuropneumonia (breathing distress)', dosage: '0.2 mL subcutaneous in tail tip / ear' },
  { name: 'FMD (Foot & Mouth Disease)', disease: 'Mouth ulcers, salivation & foot blisters', dosage: '2.0 mL subcutaneous injection' },
  { name: 'Deworming (Albendazole / Ivermectin)', disease: 'Haemonchus (wireworm), tapeworms & liver fluke', dosage: '10 mL oral liquid drench' },
  { name: 'Anthrax Spore Vaccine', disease: 'Bacillus anthracis protection before monsoon', dosage: '1.0 mL subcutaneous injection' },
  { name: 'Black Quarter (BQ)', disease: 'Clostridial muscle swelling and lameness', dosage: '2.0 mL subcutaneous injection' },
  { name: 'H.S. (Haemorrhagic Septicaemia)', disease: 'Throat swelling, respiratory choking & fever', dosage: '2.0 mL subcutaneous injection' },
];

export const VaccinationScheduleView: React.FC<VaccinationScheduleViewProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onMarkVaccineComplete,
  onAddVaccine,
  onUpdateVaccine,
  onDeleteVaccine,
  onBulkMarkComplete,
  onBulkAddVaccine,
  onBulkUpdateVaccine,
  onBulkDeleteVaccine,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const canManageVaccine = isVaccineManager(currentMember?.role, isAdmin);

  const [statusFilter, setStatusFilter] = useState<'All' | 'Due Soon' | 'Overdue' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Multi-select bulk state
  const [selectedVacIds, setSelectedVacIds] = useState<string[]>([]);
  const [showBulkDateModal, setShowBulkDateModal] = useState<boolean>(false);
  const [bulkNewDate, setBulkNewDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkVaccinateModal, setShowBulkVaccinateModal] = useState(false);
  const [editingVac, setEditingVac] = useState<VaccinationRecord | null>(null);

  // Single Add Form state
  const [targetAnimalId, setTargetAnimalId] = useState(farm.animals[0]?.id || '');
  const [vacName, setVacName] = useState('FMD (Foot & Mouth Disease)');
  const [vacDisease, setVacDisease] = useState('Foot & Mouth Blisters');
  const [vacDueDate, setVacDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [vacDosage, setVacDosage] = useState('2.0 mL injection');
  const [vacBatch, setVacBatch] = useState('LOT-IND-2026');

  // Bulk Vaccinate Flock State (Phase 1: Sheep & Goat)
  const [bulkTargetType, setBulkTargetType] = useState<'All' | 'Goat' | 'Sheep'>('All');
  const [bulkSelectedAnimalIds, setBulkSelectedAnimalIds] = useState<string[]>(() => farm.animals.map(a => a.id));
  const [bulkVacPreset, setBulkVacPreset] = useState(COMMON_VACCINES[0].name);
  const [bulkDisease, setBulkDisease] = useState(COMMON_VACCINES[0].disease);
  const [bulkDosage, setBulkDosage] = useState(COMMON_VACCINES[0].dosage);
  const [bulkBatch, setBulkBatch] = useState('LOT-HERD-2026');
  const [bulkDate, setBulkDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulkStatus, setBulkStatus] = useState<'Completed' | 'Scheduled'>('Completed');

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

  // Toggle individual selection
  const toggleSelectVac = (id: string) => {
    setSelectedVacIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Select all currently filtered vaccines
  const handleSelectAll = () => {
    if (selectedVacIds.length === filteredVaccines.length && filteredVaccines.length > 0) {
      setSelectedVacIds([]);
    } else {
      setSelectedVacIds(filteredVaccines.map(v => v.id));
    }
  };

  // Bulk Actions
  const handleBulkComplete = () => {
    if (selectedVacIds.length === 0) return;
    if (onBulkMarkComplete) {
      onBulkMarkComplete(selectedVacIds);
    } else {
      selectedVacIds.forEach(id => onMarkVaccineComplete(id));
    }
    setSelectedVacIds([]);
  };

  const handleApplyBulkDate = () => {
    if (selectedVacIds.length === 0) return;
    if (onBulkUpdateVaccine) {
      onBulkUpdateVaccine(selectedVacIds, { dueDate: bulkNewDate });
    }
    setShowBulkDateModal(false);
    setSelectedVacIds([]);
  };

  const handleBulkDelete = () => {
    if (selectedVacIds.length === 0) return;
    if (confirm(`Delete ${selectedVacIds.length} selected vaccine records?`)) {
      if (onBulkDeleteVaccine) {
        onBulkDeleteVaccine(selectedVacIds);
      } else if (onDeleteVaccine) {
        selectedVacIds.forEach(id => onDeleteVaccine(id));
      }
      setSelectedVacIds([]);
    }
  };

  // Bulk Vaccinate Target Group Selection (Phase 1: Sheep & Goat)
  const handleBulkTargetGroupChange = (type: 'All' | 'Goat' | 'Sheep') => {
    setBulkTargetType(type);
    if (type === 'All') {
      setBulkSelectedAnimalIds(farm.animals.map(a => a.id));
    } else {
      setBulkSelectedAnimalIds(farm.animals.filter(a => a.species === type).map(a => a.id));
    }
  };

  const handleBulkPresetChange = (vacTitle: string) => {
    setBulkVacPreset(vacTitle);
    const found = COMMON_VACCINES.find(v => v.name === vacTitle);
    if (found) {
      setBulkDisease(found.disease);
      setBulkDosage(found.dosage);
    }
  };

  const handleExecuteBulkVaccination = (e: React.FormEvent) => {
    e.preventDefault();
    if (bulkSelectedAnimalIds.length === 0) {
      alert('Please select at least 1 animal.');
      return;
    }

    const vacData: Omit<VaccinationRecord, 'id' | 'animalId'> = {
      vaccineName: bulkVacPreset,
      diseaseTarget: bulkDisease,
      dueDate: bulkDate,
      administeredDate: bulkStatus === 'Completed' ? bulkDate : undefined,
      status: bulkStatus,
      dosage: bulkDosage,
      batchNumber: bulkBatch,
      administeredBy: bulkStatus === 'Completed' ? currentUser.name : undefined,
      nextBoosterDate: new Date(new Date(bulkDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    if (onBulkAddVaccine) {
      onBulkAddVaccine(bulkSelectedAnimalIds, vacData);
    }
    setShowBulkVaccinateModal(false);
  };

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

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Vaccines & Medicine Shots
            </h1>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
              {farm.vaccinations.length} Shots
            </span>
          </div>
        </div>

        {/* Buttons: + Single Shot AND + Bulk Vaccinate Herd */}
        <div className="flex items-center gap-2 flex-wrap">
          {canManageVaccine ? (
            <>
              {/* 1. Bulk Vaccinate Herd */}
              <button
                type="button"
                onClick={() => {
                  setBulkSelectedAnimalIds(farm.animals.map(a => a.id));
                  setShowBulkVaccinateModal(true);
                }}
                className="w-full xs:w-auto px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <span>💉 Bulk Vaccinate Herd</span>
              </button>

              {/* 2. Single Vaccine Shot */}
              <button
                type="button"
                onClick={() => {
                  setTargetAnimalId(farm.animals[0]?.id || '');
                  setShowAddModal(true);
                }}
                className="w-full xs:w-auto px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
              >
                <Plus className="w-4 h-4 shrink-0" />
                <span>+ Single Shot</span>
              </button>
            </>
          ) : (
            <div className="px-3 py-2 rounded-xl bg-stone-100 border border-stone-200 text-stone-600 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <span>Admin only</span>
            </div>
          )}
        </div>
      </div>

      {/* Vaccine Nearing Alert Notification Banner */}
      {alerts.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="text-xl shrink-0 animate-bounce">🔔</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-950">
                  Vaccine Alert ({alerts.length} Due)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-200 text-amber-950">
                  Window: {farm.config?.vaccineAlertDaysThreshold || 7} Days
                </span>
              </div>
              <p className="text-[11px] text-amber-900 font-bold truncate mt-0.5">
                {alerts.map(a => `${a.animalName}: ${a.vaccineName} (${a.daysLeft <= 0 ? 'OVERDUE' : `in ${a.daysLeft}d`})`).join(' · ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => setStatusFilter('Due Soon')}
            className="self-end sm:self-auto px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold cursor-pointer shrink-0"
          >
            Filter Due
          </button>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex flex-wrap gap-1.5">
          {[
            { id: 'All', label: 'All Shots' },
            { id: 'Due Soon', label: '⏰ Due Soon' },
            { id: 'Overdue', label: '⚠️ Past Due' },
            { id: 'Completed', label: '✓ Done' },
          ].map(st => {
            const count = st.id === 'All'
              ? farm.vaccinations.length
              : farm.vaccinations.filter(v => v.status === st.id).length;
            const isSelected = statusFilter === st.id;
            return (
              <button
                key={st.id}
                onClick={() => setStatusFilter(st.id as 'All' | 'Due Soon' | 'Overdue' | 'Completed')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {st.label} ({count})
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vaccine, tag, or animal..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 font-medium"
          />
        </div>
      </div>

      {/* Select All Checkbox Row */}
      {filteredVaccines.length > 0 && (
        <div className="flex items-center justify-between px-1 text-xs text-stone-600 font-bold">
          <button
            onClick={handleSelectAll}
            className="flex items-center gap-1.5 text-stone-700 hover:text-stone-900 cursor-pointer"
          >
            {selectedVacIds.length === filteredVaccines.length && filteredVaccines.length > 0 ? (
              <CheckSquare className="w-4 h-4 text-emerald-800" />
            ) : (
              <Square className="w-4 h-4 text-stone-400" />
            )}
            <span>Select All ({filteredVaccines.length} shots)</span>
          </button>

          {selectedVacIds.length > 0 && (
            <span className="font-mono text-emerald-800 font-black">
              {selectedVacIds.length} Selected
            </span>
          )}
        </div>
      )}

      {/* Floating / Sticky Bulk Action Toolbar */}
      {selectedVacIds.length > 0 && (
        <div className="p-3 bg-emerald-950 text-white rounded-2xl shadow-xl flex flex-wrap items-center justify-between gap-2.5 sticky top-20 z-20 animate-in slide-in-from-top duration-200 border-2 border-emerald-600">
          <div className="flex items-center gap-2">
            <span className="font-mono font-black text-xs bg-emerald-800 px-2 py-0.5 rounded-full">
              {selectedVacIds.length} Selected
            </span>
            <button
              onClick={() => setSelectedVacIds([])}
              className="text-[11px] text-stone-300 hover:text-white underline cursor-pointer"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Bulk Mark Done */}
            <button
              onClick={handleBulkComplete}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done ({selectedVacIds.length})</span>
            </button>

            {/* Bulk Change Date */}
            <button
              onClick={() => setShowBulkDateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Change Date</span>
            </button>

            {/* Bulk Delete */}
            {isAdmin && (
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-600 text-white text-xs font-black flex items-center gap-1 cursor-pointer active:scale-95 shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Vaccines List */}
      <div className="border border-stone-200 rounded-2xl bg-white overflow-hidden divide-y divide-stone-100 shadow-2xs">
        {filteredVaccines.length === 0 ? (
          <div className="p-8 text-center text-xs text-stone-500">
            No vaccine records match this filter.
          </div>
        ) : (
          filteredVaccines.map(vac => {
            const animal = farm.animals.find(a => a.id === vac.animalId);
            const isOverdue = vac.status === 'Overdue';
            const isDueSoon = vac.status === 'Due Soon';
            const isDone = vac.status === 'Completed';
            const isSelected = selectedVacIds.includes(vac.id);

            return (
              <div
                key={vac.id}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected ? 'bg-emerald-50/60' : 'hover:bg-stone-50/70'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  {/* Selection Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelectVac(vac.id)}
                    className="p-1 rounded-lg hover:bg-stone-200 text-stone-500 cursor-pointer shrink-0 mt-0.5"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-5 h-5 text-emerald-800" />
                    ) : (
                      <Square className="w-5 h-5 text-stone-300" />
                    )}
                  </button>

                  {animal && (
                    <div
                      onClick={() => onSelectAnimal(animal)}
                      className="w-12 h-12 rounded-xl overflow-hidden border border-stone-200 shrink-0 cursor-pointer"
                    >
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
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
                      <span className="font-mono text-[11px] text-stone-500 font-bold">
                        {isDone ? `Given: ${vac.administeredDate}` : `Due: ${vac.dueDate}`}
                      </span>
                    </div>

                    <h3 className="font-extrabold text-stone-900 text-sm mt-0.5 truncate">
                      {vac.vaccineName}
                    </h3>

                    {animal && (
                      <p className="text-xs text-stone-600 truncate mt-0.5">
                        Animal: <strong>{animal.name}</strong> (#{animal.tagId}) · {animal.species}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                  {!isDone && (
                    <button
                      type="button"
                      onClick={() => onMarkVaccineComplete(vac.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Done</span>
                    </button>
                  )}

                  {canManageVaccine && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleStartEdit(vac)}
                        className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 cursor-pointer"
                        title="Edit Shot"
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
                          className="p-1.5 rounded-lg border border-stone-200 text-stone-400 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                          title="Delete Shot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* BULK VACCINATE HERD MODAL */}
      {showBulkVaccinateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-amber-500 to-emerald-700 text-stone-950 rounded-t-3xl sticky top-0 z-10">
              <div>
                <h2 className="text-lg font-black text-stone-950 flex items-center gap-2">
                  <span>💉</span>
                  <span>Bulk Vaccinate Animals (Herd Protection)</span>
                </h2>
                <p className="text-xs text-stone-900 font-bold mt-0.5">
                  Apply a single vaccine shot to all sheep, goats, or entire herd at once
                </p>
              </div>
              <button
                onClick={() => setShowBulkVaccinateModal(false)}
                className="p-1.5 rounded-full hover:bg-black/10 text-stone-950 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteBulkVaccination} className="p-4 sm:p-5 space-y-4 text-stone-900">
              {/* Target Animals Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                  1. Which Animals to Vaccinate?
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {(['All', 'Goat', 'Sheep'] as const).map(grp => (
                    <button
                      key={grp}
                      type="button"
                      onClick={() => handleBulkTargetGroupChange(grp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                        bulkTargetType === grp
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {grp === 'All' ? `Whole Flock (${farm.animals.length})` : grp === 'Goat' ? `All Goats 🐐 (${farm.animals.filter(a => a.species === 'Goat').length})` : `All Sheep 🐑 (${farm.animals.filter(a => a.species === 'Sheep').length})`}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-stone-500 font-bold pt-1">
                  Selected Animals: <strong className="text-emerald-900 font-mono">{bulkSelectedAnimalIds.length} animals</strong>
                </div>
              </div>

              {/* Vaccine Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                  2. Choose Vaccine
                </label>
                <select
                  value={bulkVacPreset}
                  onChange={(e) => handleBulkPresetChange(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-black bg-white text-stone-900 focus:ring-2 focus:ring-emerald-700"
                >
                  {COMMON_VACCINES.map(v => (
                    <option key={v.name} value={v.name}>
                      {v.name} — protects {v.disease}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status: Given Today vs Scheduled */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                  3. Vaccination Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkStatus('Completed')}
                    className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                      bulkStatus === 'Completed'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    ✓ Already Injected Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkStatus('Scheduled')}
                    className={`py-2 rounded-xl text-xs font-black border cursor-pointer ${
                      bulkStatus === 'Scheduled'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    📅 Schedule for Later
                  </button>
                </div>
              </div>

              {/* Date & Batch */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Date</label>
                  <input
                    type="date"
                    value={bulkDate}
                    onChange={(e) => setBulkDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Batch / Lot #</label>
                  <input
                    type="text"
                    value={bulkBatch}
                    onChange={(e) => setBulkBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dosage */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700">Dosage per animal</label>
                <input
                  type="text"
                  value={bulkDosage}
                  onChange={(e) => setBulkDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
                />
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    Apply "{bulkVacPreset.split(' ')[0]}" to {bulkSelectedAnimalIds.length} Animals
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK CHANGE DATE MODAL */}
      {showBulkDateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-stone-200 shadow-xl">
            <h3 className="text-sm font-black text-stone-900">
              Update Due Date for {selectedVacIds.length} Shots
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">New Due Date</label>
              <input
                type="date"
                value={bulkNewDate}
                onChange={(e) => setBulkNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBulkDateModal(false)}
                className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyBulkDate}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-black cursor-pointer"
              >
                Apply Date
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SINGLE ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 space-y-4 shadow-xl border border-stone-200">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-stone-900 flex items-center gap-1.5">
                <Syringe className="w-4 h-4 text-emerald-800" />
                <span>Schedule Vaccine for Single Animal</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded-full hover:bg-stone-100">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onAddVaccine) {
                  onAddVaccine({
                    animalId: targetAnimalId,
                    vaccineName: vacName,
                    diseaseTarget: vacDisease,
                    dueDate: vacDueDate,
                    status: 'Scheduled',
                    dosage: vacDosage,
                    batchNumber: vacBatch,
                    nextBoosterDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                  });
                }
                setShowAddModal(false);
              }}
              className="space-y-3"
            >
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Select Animal</label>
                <select
                  value={targetAnimalId}
                  onChange={(e) => setTargetAnimalId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
                >
                  {farm.animals.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (#{a.tagId} · {a.species})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={vacName}
                  onChange={(e) => setVacName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={vacDueDate}
                    onChange={(e) => setVacDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Dosage</label>
                  <input
                    type="text"
                    value={vacDosage}
                    onChange={(e) => setVacDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-black cursor-pointer"
                >
                  Save Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingVac && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 border border-stone-200 shadow-xl">
            <h3 className="text-sm font-black text-stone-900">
              Edit Vaccine Record
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Vaccine Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">Due Date</label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVac(null)}
                  className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-black cursor-pointer"
                >
                  Save Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
