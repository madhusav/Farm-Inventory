import React, { useState } from 'react';
import { Animal, Farm, User, VaccinationRecord } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { db } from '../services/db';
import { WeatherCard } from './WeatherCard';
import { 
  Plus, 
  Search, 
  Trash2, 
  Lock, 
  PackagePlus, 
  Settings, 
  Milk, 
  ArrowUpRight, 
  ChevronRight, 
  AlertCircle,
  Edit2,
  CheckSquare,
  Square,
  MinusSquare,
  X,
  Syringe,
  Check,
  AlertTriangle
} from 'lucide-react';

interface LivestockListProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onOpenAddModal: () => void;
  onOpenBulkModal: (species?: any) => void;
  onOpenSpeciesModal: () => void;
  onOpenMilkModal: (animal?: Animal) => void;
  onDeleteAnimal: (animalId: string) => void;
  onBatchDeleteAnimals?: (animalIds: string[]) => void;
  onOpenVaccineAlerts?: () => void;
  onUpdateAnimal?: (animalId: string, updates: Partial<Animal>) => void;
  onBulkAddVaccine?: (animalIds: string[], vacData: Omit<VaccinationRecord, 'id' | 'animalId'>) => void;
}

export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date('2026-10-12');
  if (isNaN(birth.getTime())) return dob;
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} mos`;
  if (remMonths === 0) return `${years} yrs`;
  return `${years}y ${remMonths}m`;
}

const COMMON_VACCINE_PRESETS = [
  { name: 'PPR (Goat & Sheep Plague)', disease: 'Peste des Petits Ruminants', dosage: '1.0 mL subcutaneous' },
  { name: 'FMD (Foot & Mouth Disease)', disease: 'Foot & Mouth Blisters', dosage: '2.0 mL subcutaneous' },
  { name: 'Enterotoxemia (ET)', disease: 'Pulpy Kidney / Poisoning', dosage: '2.0 mL subcutaneous' },
  { name: 'Sheep & Goat Pox', disease: 'Pox Skin Eruptions', dosage: '0.5 mL subcutaneous' },
  { name: 'Black Quarter (BQ)', disease: 'Muscle Swelling & Lameness', dosage: '2.0 mL subcutaneous' },
  { name: 'Deworming (Albendazole / Ivermectin)', disease: 'Internal Tummy Worms', dosage: '10 mL oral liquid' },
  { name: 'H.S. (Haemorrhagic Septicaemia)', disease: 'Throat Swelling & High Fever', dosage: '2.0 mL subcutaneous' },
];

export const LivestockList: React.FC<LivestockListProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenSpeciesModal,
  onOpenMilkModal,
  onDeleteAnimal,
  onBatchDeleteAnimals,
  onOpenVaccineAlerts,
  onUpdateAnimal,
  onBulkAddVaccine,
}) => {
  const { t } = useLanguage();
  const isAdmin = farm.adminUserId === currentUser.id;
  const alerts = db.getVaccineAlerts(farm.id);

  const [selectedSpecies, setSelectedSpecies] = useState<'All' | string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Multi-animal selection for batch actions (vaccination & deletion)
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<string[]>([]);
  const [showBulkVaccineModal, setShowBulkVaccineModal] = useState(false);
  const [showBatchDeleteModal, setShowBatchDeleteModal] = useState(false);
  const [batchActionToast, setBatchActionToast] = useState('');

  // Quick tag edit state
  const [quickTagAnimal, setQuickTagAnimal] = useState<Animal | null>(null);
  const [quickTagInput, setQuickTagInput] = useState('');

  // Bulk vaccine form inputs
  const [bulkVacName, setBulkVacName] = useState(COMMON_VACCINE_PRESETS[0].name);
  const [bulkVacDisease, setBulkVacDisease] = useState(COMMON_VACCINE_PRESETS[0].disease);
  const [bulkVacDueDate, setBulkVacDueDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [bulkVacStatus, setBulkVacStatus] = useState<'Completed' | 'Scheduled'>('Completed');
  const [bulkVacDosage, setBulkVacDosage] = useState(COMMON_VACCINE_PRESETS[0].dosage);
  const [bulkVacBatch, setBulkVacBatch] = useState('LOT-BULK-2026');

  const handleToggleSelectAnimal = (e: React.MouseEvent, animalId: string) => {
    e.stopPropagation();
    setSelectedAnimalIds(prev =>
      prev.includes(animalId) ? prev.filter(id => id !== animalId) : [...prev, animalId]
    );
  };

  const handleClearSelection = () => {
    setSelectedAnimalIds([]);
  };

  const handleOpenBatchDelete = () => {
    if (!isAdmin) {
      alert('Only the Farm Boss (Admin) has permission to delete animals.');
      return;
    }
    if (selectedAnimalIds.length === 0) return;
    setShowBatchDeleteModal(true);
  };

  const handleConfirmBatchDelete = () => {
    if (selectedAnimalIds.length === 0) return;
    const count = selectedAnimalIds.length;
    if (onBatchDeleteAnimals) {
      onBatchDeleteAnimals(selectedAnimalIds);
    } else {
      selectedAnimalIds.forEach(id => onDeleteAnimal(id));
    }
    setSelectedAnimalIds([]);
    setShowBatchDeleteModal(false);
    setBatchActionToast(`✓ Deleted ${count} ${count === 1 ? 'animal' : 'animals'} from farm.`);
    setTimeout(() => setBatchActionToast(''), 4000);
  };

  const handleOpenQuickTag = (e: React.MouseEvent, animal: Animal) => {
    e.stopPropagation();
    setQuickTagAnimal(animal);
    setQuickTagInput(animal.tagId);
  };

  const handleSaveQuickTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTagAnimal || !quickTagInput.trim() || !onUpdateAnimal) return;
    onUpdateAnimal(quickTagAnimal.id, { tagId: quickTagInput.trim().toUpperCase() });
    setQuickTagAnimal(null);
  };

  const handlePresetChange = (vacName: string) => {
    setBulkVacName(vacName);
    const found = COMMON_VACCINE_PRESETS.find(p => p.name === vacName);
    if (found) {
      setBulkVacDisease(found.disease);
      setBulkVacDosage(found.dosage);
    }
  };

  const handleExecuteBulkVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimalIds.length === 0 || !onBulkAddVaccine) return;

    const vacData: Omit<VaccinationRecord, 'id' | 'animalId'> = {
      vaccineName: bulkVacName.trim(),
      diseaseTarget: bulkVacDisease.trim(),
      dueDate: bulkVacDueDate,
      administeredDate: bulkVacStatus === 'Completed' ? bulkVacDueDate : undefined,
      status: bulkVacStatus,
      dosage: bulkVacDosage.trim(),
      batchNumber: bulkVacBatch.trim(),
      administeredBy: bulkVacStatus === 'Completed' ? currentUser.name : undefined,
      nextBoosterDate: new Date(new Date(bulkVacDueDate).getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    };

    const count = selectedAnimalIds.length;
    onBulkAddVaccine(selectedAnimalIds, vacData);

    if (bulkVacStatus === 'Completed' && onUpdateAnimal) {
      selectedAnimalIds.forEach(id => {
        onUpdateAnimal(id, { healthStatus: 'Healthy & Fit' });
      });
    }

    setShowBulkVaccineModal(false);
    setSelectedAnimalIds([]);
    setBatchActionToast(`✓ Successfully recorded ${bulkVacName} for ${count} animals!`);
    setTimeout(() => setBatchActionToast(''), 4000);
  };

  // Phase 1 is focused on Sheep and Goat (Caprine & Ovine)
  const farmSpecies = farm.primarySpecies.length > 0
    ? farm.primarySpecies.filter(s => s === 'Goat' || s === 'Sheep')
    : ['Goat', 'Sheep'];
  const activeFlockSpecies = farmSpecies.length > 0 ? farmSpecies : ['Goat', 'Sheep'];

  const filteredAnimals = farm.animals.filter(a => {
    // 1. Species filter
    const matchesSpecies = selectedSpecies === 'All' || a.species === selectedSpecies;
    
    // 2. Status filter for Phase 1 (Sheep & Goat flock statuses)
    let matchesStatus = true;
    if (selectedStatusFilter === 'Milking') {
      matchesStatus = a.species === 'Goat' && a.sex === 'Female' && ((a.dailyMilkLitres && a.dailyMilkLitres > 0) || a.milkStatus === 'Giving Milk');
    } else if (selectedStatusFilter === 'BreedingMale') {
      matchesStatus = a.sex === 'Male' && (a.status === 'Breeding Sire' || a.name.includes('Buck') || a.name.includes('Ram'));
    } else if (selectedStatusFilter === 'YoungKids') {
      const birth = new Date(a.dateOfBirth);
      const now = new Date('2026-10-12');
      const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
      matchesStatus = diffMonths <= 12 || a.name.includes('Kid') || a.name.includes('Lamb');
    } else if (selectedStatusFilter === 'Healthy') {
      matchesStatus = a.healthStatus === 'Healthy & Fit' || !a.healthStatus;
    } else if (selectedStatusFilter === 'VaccineDue') {
      matchesStatus = a.healthStatus === 'Vaccine Due' || farm.vaccinations.some(v => v.animalId === a.id && (v.status === 'Due Soon' || v.status === 'Overdue'));
    } else if (selectedStatusFilter === 'NeedsCare') {
      matchesStatus = a.healthStatus === 'Needs Medicine' || a.healthStatus === 'Under Observation';
    } else if (selectedStatusFilter === 'Pregnant') {
      matchesStatus = a.healthStatus === 'Pregnant Care';
    }

    // 3. Search query
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery = !q || 
      a.tagId.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q);

    return matchesSpecies && matchesStatus && matchesQuery;
  });

  const allFilteredIds = filteredAnimals.map(a => a.id);
  const isAllSelected = filteredAnimals.length > 0 && filteredAnimals.every(a => selectedAnimalIds.includes(a.id));
  const isSomeSelected = !isAllSelected && filteredAnimals.some(a => selectedAnimalIds.includes(a.id));

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedAnimalIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedAnimalIds(prev => Array.from(new Set([...prev, ...allFilteredIds])));
    }
  };

  const handleSelectAll = (_species?: string) => {
    handleToggleSelectAll();
  };

  const handleDeleteClick = (e: React.MouseEvent, animal: Animal) => {
    e.stopPropagation();
    if (!isAdmin) return;
    setDeleteConfirmId(animal.id);
  };

  const handleConfirmDelete = (e: React.MouseEvent, animalId: string) => {
    e.stopPropagation();
    onDeleteAnimal(animalId);
    setDeleteConfirmId(null);
  };

  const getSpeciesEmoji = (sp: string) => {
    switch (sp) {
      case 'Cow': return '🐄';
      case 'Goat': return '🐐';
      case 'Sheep': return '🐑';
      case 'Chicken': return '🐔';
      case 'Buffalo': return '🐃';
      default: return '🐾';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      
      {/* Top Header & Large Mobile Action Buttons */}
      <div className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight flex items-center gap-2">
              <span>🐐 {t('allAnimals', 'Flock & Herd')}</span>
              <span className="text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950">
                {farm.animals.length}
              </span>
            </h1>
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 rounded-full">
              Phase 1: Sheep & Goat Tracker
            </span>
          </div>
        </div>

        {/* Action Grid (Compact & Responsive on Mobile & Tablet) */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={onOpenAddModal}
            className="w-full px-2.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ Add Animal</span>
          </button>

          <button
            onClick={() => onOpenBulkModal(selectedSpecies !== 'All' ? selectedSpecies : undefined)}
            className="w-full px-2.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <PackagePlus className="w-4 h-4 shrink-0" />
            <span>📦 Bulk Add</span>
          </button>

          <button
            onClick={() => {
              if (selectedAnimalIds.length === 0) {
                setSelectedAnimalIds(filteredAnimals.map(a => a.id));
              }
              setShowBulkVaccineModal(true);
            }}
            className="w-full px-2.5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
            title="Bulk vaccinate multiple animals"
          >
            <Syringe className="w-4 h-4 shrink-0" />
            <span>💉 Bulk Vaccine</span>
          </button>

          <button
            onClick={() => onOpenMilkModal()}
            className="w-full px-2.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <Milk className="w-4 h-4 shrink-0" />
            <span>🥛 Record Milk</span>
          </button>

          <button
            onClick={onOpenSpeciesModal}
            className="col-span-2 sm:col-span-1 w-full px-2.5 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
          >
            <Settings className="w-4 h-4 shrink-0 text-stone-600" />
            <span>⚙️ Farm Setup</span>
          </button>
        </div>
      </div>

      {/* Vaccine Nearing Alert Notification Banner */}
      {alerts.length > 0 && (
        <div 
          onClick={onOpenVaccineAlerts}
          className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-xl shrink-0 animate-bounce">🔔</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-amber-950">
                  Vaccine Due ({alerts.length} Animals)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-red-600 text-white">
                  Action
                </span>
              </div>
              <p className="text-[11px] text-amber-900 font-bold truncate mt-0.5">
                {alerts.map(a => `${a.animalName}: ${a.vaccineName} (${a.daysLeft <= 0 ? 'OVERDUE' : `in ${a.daysLeft}d`})`).join(' · ')}
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1.5 rounded-xl bg-amber-800 text-white text-[11px] font-bold shrink-0">
            View
          </span>
        </div>
      )}

      {/* Compact Local Weather & Farmer Advisory Card */}
      <WeatherCard farm={farm} />

      {/* Filter Bar: Wrap cleanly with ZERO horizontal scrollbars */}
      <div className="space-y-2 pt-1">
        {/* Species Filter Tabs (wrapped) */}
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setSelectedSpecies('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              selectedSpecies === 'All'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            🐾 Whole Flock ({farm.animals.length})
          </button>

          {activeFlockSpecies.map(sp => {
            const count = farm.animals.filter(a => a.species === sp).length;
            const isSelected = selectedSpecies === sp;
            return (
              <button
                key={sp}
                onClick={() => setSelectedSpecies(sp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                {getSpeciesEmoji(sp)} {sp === 'Goat' ? 'Goats' : 'Sheep'} ({count})
              </button>
            );
          })}
        </div>

        {/* Search & Status Filter Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <div className="sm:col-span-7 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tag number, name, or breed..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="sm:col-span-5">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="All">Filter: Whole Flock (All)</option>
              <option value="Healthy">🟢 Healthy & Fit</option>
              <option value="VaccineDue">💉 Vaccine Due</option>
              <option value="Milking">🥛 Milking Does (बकरियां)</option>
              <option value="BreedingMale">👑 Stud Bucks & Rams (बकरा/मेढ़ा)</option>
              <option value="YoungKids">🐣 Kids & Lambs (मेमने/बच्चे)</option>
              <option value="Pregnant">🤰 Pregnant Care</option>
              <option value="NeedsCare">💊 Needs Medicine / Watch</option>
            </select>
          </div>
        </div>
      </div>

      {/* 'Select All' Checkbox Toolbar */}
      {filteredAnimals.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 px-3 py-2 bg-stone-100/90 rounded-2xl border border-stone-200/90 text-xs font-bold text-stone-800">
          <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1">
            <input
              type="checkbox"
              checked={isAllSelected}
              ref={(el) => {
                if (el) el.indeterminate = isSomeSelected;
              }}
              onChange={handleToggleSelectAll}
              className="w-4 h-4 rounded text-emerald-700 accent-emerald-700 cursor-pointer focus:ring-emerald-600 focus:ring-offset-0"
            />
            <span className="font-extrabold text-stone-800">
              Select All {selectedSpecies !== 'All' ? (selectedSpecies === 'Goat' ? 'Goats' : selectedSpecies === 'Sheep' ? 'Sheep' : selectedSpecies + 's') : 'Flock'} ({filteredAnimals.length})
            </span>
          </label>

          <div className="flex items-center gap-2">
            {selectedAnimalIds.length > 0 ? (
              <>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black font-mono">
                  {selectedAnimalIds.length} of {filteredAnimals.length} selected
                </span>
                <button
                  type="button"
                  onClick={handleClearSelection}
                  className="px-2 py-0.5 text-xs text-stone-500 hover:text-stone-900 font-semibold cursor-pointer underline"
                >
                  Clear
                </button>
              </>
            ) : (
              <span className="text-[11px] text-stone-500 font-normal">
                Select animals for batch updates
              </span>
            )}
          </div>
        </div>
      )}

      {/* Animals Grid: Mobile Clean Cards (Zero Overlapping, Layman-Friendly) */}
      {filteredAnimals.length === 0 ? (
        <div className="p-8 rounded-2xl border border-dashed border-stone-300 bg-white text-center space-y-3">
          <div className="text-3xl">🐮</div>
          <h3 className="text-sm font-bold text-stone-800">
            {searchQuery || selectedStatusFilter !== 'All' ? 'No animals match this filter' : 'No animals here yet'}
          </h3>
          <div className="flex items-center justify-center gap-2 pt-1">
            <button
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-emerald-800 text-white font-bold text-xs cursor-pointer"
            >
              + Add Animal
            </button>
            <button
              onClick={() => onOpenBulkModal(selectedSpecies !== 'All' ? selectedSpecies : undefined)}
              className="px-3.5 py-2 rounded-xl bg-amber-500 text-stone-950 font-bold text-xs cursor-pointer"
            >
              📦 Bulk Add
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {filteredAnimals.map(animal => {
            const pendingVac = farm.vaccinations.find(
              v => v.animalId === animal.id && (v.status === 'Due Soon' || v.status === 'Overdue')
            );
            const animalAlert = alerts.find(al => al.animalId === animal.id);
            const isConfirmingDelete = deleteConfirmId === animal.id;
            const isAnimalSelected = selectedAnimalIds.includes(animal.id);

            // Health Status styling
            const currentHealth = animal.healthStatus || (pendingVac ? 'Vaccine Due' : 'Healthy & Fit');
            let healthColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
            let healthIcon = '🟢';
            if (currentHealth === 'Needs Medicine' || currentHealth === 'Under Observation') {
              healthColor = 'text-rose-800 bg-rose-50 border-rose-200';
              healthIcon = '💊';
            } else if (currentHealth === 'Vaccine Due') {
              healthColor = 'text-amber-800 bg-amber-50 border-amber-200';
              healthIcon = '💉';
            } else if (currentHealth === 'Pregnant Care') {
              healthColor = 'text-purple-800 bg-purple-50 border-purple-200';
              healthIcon = '🤰';
            }

            const isDairyAnimal = animal.species === 'Cow' || animal.species === 'Buffalo' || animal.species === 'Goat';

            return (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className={`bg-white rounded-2xl border transition-all overflow-hidden flex flex-col justify-between cursor-pointer ${
                  isAnimalSelected 
                    ? 'border-emerald-600 ring-2 ring-emerald-500/30 shadow-sm' 
                    : 'border-stone-200 hover:border-emerald-700 shadow-2xs hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Clean Visual Header: Image + Primary Details cleanly side by side */}
                  <div className="p-3 sm:p-3.5 flex gap-2.5 sm:gap-3 items-start border-b border-stone-100 bg-[#FCFBF8]">
                    {/* Animal Photo: Clean, rounded square with NO overlaid text */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-stone-200 bg-stone-100 shrink-0">
                      <img
                        src={animal.photoUrl}
                        alt={animal.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Animal Name, Tag, Species, Age */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="font-mono text-xs font-black text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-200/80">
                            #{animal.tagId}
                          </span>
                          {onUpdateAnimal && (
                            <button
                              type="button"
                              onClick={(e) => handleOpenQuickTag(e, animal)}
                              className="px-1.5 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-950 text-[10px] font-bold border border-amber-300 flex items-center gap-0.5 cursor-pointer active:scale-95 shadow-2xs"
                              title="Update Tag Number"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                              <span>Edit Tag</span>
                            </button>
                          )}
                        </div>

                        {/* Multi-select Checkbox */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[11px] font-bold text-stone-500">
                            {calculateAge(animal.dateOfBirth)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleToggleSelectAnimal(e, animal.id)}
                            className={`p-1 rounded-lg border cursor-pointer transition-all ${
                              isAnimalSelected
                                ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                                : 'bg-white text-stone-400 border-stone-200 hover:text-stone-700'
                            }`}
                            title={isAnimalSelected ? 'Deselect from bulk vaccination' : 'Select for bulk vaccination'}
                          >
                            {isAnimalSelected ? (
                              <CheckSquare className="w-3.5 h-3.5" />
                            ) : (
                              <Square className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      <h3 className="text-sm sm:text-base font-black text-stone-900 truncate mt-1">
                        {animal.name}
                      </h3>

                      <p className="text-xs text-stone-500 font-medium truncate mt-0.5">
                        {getSpeciesEmoji(animal.species)} {animal.species} · {animal.breed} · {animal.sex}
                      </p>
                    </div>
                  </div>

                  {/* Body: 2 Clean Status Badges (Health & Yield/Weight) */}
                  <div className="p-3 space-y-2">
                    {/* Vaccine Due Warning Banner (if due) */}
                    {animalAlert && (
                      <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 font-bold text-[11px] flex items-center gap-1.5">
                        <span>⏰</span>
                        <span className="truncate">
                          Shot: {animalAlert.vaccineName} ({animalAlert.daysLeft <= 0 ? 'Overdue!' : `in ${animalAlert.daysLeft}d`})
                        </span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Health */}
                      <div className={`p-2 rounded-xl border flex items-center gap-1.5 truncate ${healthColor}`}>
                        <span>{healthIcon}</span>
                        <span className="font-bold truncate text-[11px]">
                          {currentHealth}
                        </span>
                      </div>

                      {/* Yield or Weight */}
                      {animal.dailyMilkLitres && animal.dailyMilkLitres > 0 ? (
                        <div className="p-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-950 flex items-center gap-1.5 truncate">
                          <span>🥛</span>
                          <span className="font-bold truncate text-[11px]">
                            {animal.dailyMilkLitres} L/day milk
                          </span>
                        </div>
                      ) : animal.species === 'Sheep' ? (
                        <div className="p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 flex items-center gap-1.5 truncate">
                          <span>🐑</span>
                          <span className="font-bold truncate text-[11px]">
                            {animal.currentWeightKg} kg (Wool)
                          </span>
                        </div>
                      ) : (
                        <div className="p-2 rounded-xl border border-stone-200 bg-stone-50 text-stone-800 flex items-center gap-1.5 truncate">
                          <span>⚖️</span>
                          <span className="font-bold truncate text-[11px]">
                            {animal.currentWeightKg} kg weight
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Breed & Location in 1 quiet line */}
                    <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium pt-0.5">
                      <span className="truncate max-w-[130px]">{animal.breed}</span>
                      <span className="truncate max-w-[140px] text-stone-400">{animal.paddockLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions: Large touch buttons */}
                <div className="px-3 pb-3 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAnimal(animal);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black flex items-center justify-center gap-1 shadow-2xs cursor-pointer active:scale-98 transition-all"
                  >
                    <span>View Diary</span>
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  </button>

                  {/* Quick Log Milk button ONLY for female Cow or Buffalo */}
                  {animal.sex === 'Female' && isDairyAnimal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMilkModal(animal);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-sky-100 hover:bg-sky-200 text-sky-950 border border-sky-300 text-xs font-black flex items-center justify-center gap-1 cursor-pointer active:scale-98 transition-all shrink-0"
                      title="Quick Milk Log"
                    >
                      <span>🥛</span>
                      <span className="hidden xs:inline">Milk</span>
                    </button>
                  )}

                  {/* Delete Button (Admin Only) */}
                  {isAdmin && (
                    isConfirmingDelete ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, animal.id)}
                          className="px-2.5 py-2 rounded-xl bg-red-700 text-white text-xs font-black cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-2.5 py-2 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, animal)}
                        className="p-2.5 rounded-xl border border-stone-200 hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors shrink-0 cursor-pointer"
                        title="Delete Animal"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Action Bar (Appears only when items are selected) */}
      {selectedAnimalIds.length > 0 && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-xl sm:w-full z-40 bg-stone-900/95 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-2xl shadow-2xl flex items-center justify-between gap-2 border-2 border-emerald-500/80 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-mono font-black flex items-center justify-center shrink-0">
              {selectedAnimalIds.length}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">
                {selectedAnimalIds.length} {selectedAnimalIds.length === 1 ? 'Animal' : 'Animals'} Selected
              </p>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-[10px] text-stone-400 hover:text-white cursor-pointer underline leading-none"
              >
                Deselect
              </button>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Batch Delete Button */}
            <button
              type="button"
              onClick={handleOpenBatchDelete}
              className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 shadow-xs ${
                isAdmin
                  ? 'bg-rose-900/80 hover:bg-rose-800 text-rose-100 border border-rose-700/60'
                  : 'bg-stone-800 text-stone-400 border border-stone-700 cursor-not-allowed opacity-60'
              }`}
              title={isAdmin ? 'Batch Delete Selected Animals' : 'Only Farm Boss can delete animals'}
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-300" />
              <span><span className="hidden xs:inline">Batch </span>Delete</span>
            </button>

            {/* Batch Vaccination Button */}
            <button
              type="button"
              onClick={() => setShowBulkVaccineModal(true)}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer active:scale-95"
            >
              <Syringe className="w-3.5 h-3.5" />
              <span><span className="hidden xs:inline">Batch </span>Vaccinate</span>
            </button>
          </div>
        </div>
      )}

      {/* QUICK TAG EDIT MODAL */}
      {quickTagAnimal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 border border-stone-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-sm font-black text-stone-900">
                  Update Ear Tag
                </h3>
                <p className="text-[11px] text-stone-500 font-medium">
                  {quickTagAnimal.name} ({quickTagAnimal.species} · {quickTagAnimal.breed})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuickTagAnimal(null)}
                className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickTag} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Ear Tag Number
                </label>
                <input
                  type="text"
                  value={quickTagInput}
                  onChange={(e) => setQuickTagInput(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-400 bg-white text-sm font-mono font-black text-stone-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="e.g. GOAT-101, SHEEP-202, COW-303, BUF-404"
                  autoFocus
                />
                <p className="text-[11px] text-stone-500">
                  Enter new unique tag ID for this {quickTagAnimal.species.toLowerCase()}.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setQuickTagAnimal(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs cursor-pointer active:scale-98"
                >
                  Save Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK VACCINATE SELECTED ANIMALS MODAL */}
      {showBulkVaccineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-auto">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div>
                <h3 className="text-sm sm:text-base font-black text-stone-900 flex items-center gap-2">
                  <Syringe className="w-4 h-4 text-emerald-800" />
                  <span>Bulk Update Vaccination ({selectedAnimalIds.length} Animals)</span>
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Record shot or deworming for all selected animals in one tap
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBulkVaccineModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* List of selected animal badges */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-700 block">
                Selected Animals ({selectedAnimalIds.length})
              </label>
              <div className="max-h-24 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap gap-1.5">
                {selectedAnimalIds.map(id => {
                  const anim = farm.animals.find(a => a.id === id);
                  if (!anim) return null;
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-950 font-mono text-[11px] font-bold flex items-center gap-1 border border-emerald-200"
                    >
                      <span>#{anim.tagId}</span>
                      <span className="font-sans font-medium text-[10px] text-emerald-800">({anim.name})</span>
                    </span>
                  );
                })}
              </div>
            </div>

            <form onSubmit={handleExecuteBulkVaccine} className="space-y-3.5">
              {/* Vaccine preset selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Select Vaccine or Medicine
                </label>
                <select
                  value={bulkVacName}
                  onChange={(e) => handlePresetChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-black bg-white text-stone-900 focus:ring-2 focus:ring-emerald-700"
                >
                  {COMMON_VACCINE_PRESETS.map(p => (
                    <option key={p.name} value={p.name}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status: Completed vs Scheduled */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkVacStatus('Completed')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      bulkVacStatus === 'Completed'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    ✓ Administered Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkVacStatus('Scheduled')}
                    className={`py-2 px-3 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      bulkVacStatus === 'Scheduled'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950'
                        : 'border-stone-200 bg-white text-stone-700'
                    }`}
                  >
                    📅 Schedule Due Date
                  </button>
                </div>
              </div>

              {/* Date & Batch */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Date</label>
                  <input
                    type="date"
                    value={bulkVacDueDate}
                    onChange={(e) => setBulkVacDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-700">Batch / Lot #</label>
                  <input
                    type="text"
                    value={bulkVacBatch}
                    onChange={(e) => setBulkVacBatch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              {/* Dosage */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700">Dosage per animal</label>
                <input
                  type="text"
                  value={bulkVacDosage}
                  onChange={(e) => setBulkVacDosage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold"
                />
              </div>

              {/* Submit */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBulkVaccineModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs cursor-pointer active:scale-98 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Save for {selectedAnimalIds.length} Animals</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BATCH DELETE CONFIRMATION MODAL */}
      {showBatchDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 space-y-4 shadow-2xl border border-stone-200 my-auto">
            <div className="flex items-start justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-stone-900">
                    Batch Delete {selectedAnimalIds.length} Animals?
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Permanent action for farm flock
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-stone-600 leading-relaxed">
                Are you sure you want to remove these <strong className="text-stone-900">{selectedAnimalIds.length}</strong> selected animals from your farm records? All their linked vaccination records will also be archived.
              </p>

              {/* Badges preview */}
              <div className="max-h-28 overflow-y-auto p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex flex-wrap gap-1.5">
                {selectedAnimalIds.map(id => {
                  const anim = farm.animals.find(a => a.id === id);
                  if (!anim) return null;
                  return (
                    <span
                      key={id}
                      className="px-2 py-0.5 rounded-md bg-stone-200 text-stone-800 font-mono text-[11px] font-bold flex items-center gap-1 border border-stone-300"
                    >
                      <span>#{anim.tagId}</span>
                      <span className="font-sans font-medium text-[10px] text-stone-600">({anim.name})</span>
                    </span>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This action cannot be undone. Only Farm Boss / Admin has permission.</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setShowBatchDeleteModal(false)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBatchDelete}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-black shadow-xs cursor-pointer active:scale-98 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete {selectedAnimalIds.length} Animals</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Toast Notification */}
      {batchActionToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 bg-stone-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500 font-bold text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>{batchActionToast}</span>
        </div>
      )}
    </div>
  );
};
