import React, { useState } from 'react';
import { Animal, Species, Farm, User, AnimalHealthStatus, AnimalMilkStatus } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { db } from '../services/db';
import { 
  Plus, 
  Search, 
  Trash2, 
  Lock, 
  MapPin, 
  ArrowUpRight,
  PackagePlus,
  Settings,
  Sparkles,
  Milk,
  HeartPulse,
  Activity,
  Bell
} from 'lucide-react';

interface LivestockListProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onOpenAddModal: () => void;
  onOpenBulkModal: () => void;
  onOpenSpeciesModal: () => void;
  onOpenMilkModal: (animal?: Animal) => void;
  onDeleteAnimal: (animalId: string) => void;
  onOpenVaccineAlerts?: () => void;
}

export function calculateAge(dob: string): string {
  const birth = new Date(dob);
  const now = new Date('2026-10-12');
  if (isNaN(birth.getTime())) return dob;
  let months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 0) months = 0;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} months old`;
  if (remMonths === 0) return `${years} years old`;
  return `${years} yrs, ${remMonths} mos`;
}

export const LivestockList: React.FC<LivestockListProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onOpenAddModal,
  onOpenBulkModal,
  onOpenSpeciesModal,
  onOpenMilkModal,
  onDeleteAnimal,
  onOpenVaccineAlerts,
}) => {
  const { t } = useLanguage();
  const isAdmin = farm.adminUserId === currentUser.id;
  const alerts = db.getVaccineAlerts(farm.id);

  const [selectedSpecies, setSelectedSpecies] = useState<'All' | string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Available species configured for this farm
  const farmSpecies = farm.primarySpecies.length > 0
    ? farm.primarySpecies
    : ['Cow', 'Goat', 'Sheep', 'Chicken'];

  const filteredAnimals = farm.animals.filter(a => {
    // 1. Species filter
    const matchesSpecies = selectedSpecies === 'All' || a.species === selectedSpecies;
    
    // 2. Status filter
    let matchesStatus = true;
    if (selectedStatusFilter === 'Milking') {
      matchesStatus = a.milkStatus === 'Giving Milk' || a.status === 'Lactating';
    } else if (selectedStatusFilter === 'Dry') {
      matchesStatus = a.milkStatus === 'Dry Period';
    } else if (selectedStatusFilter === 'Eggs') {
      matchesStatus = a.milkStatus === 'Laying Eggs' || a.species === 'Chicken';
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
      a.breed.toLowerCase().includes(q) ||
      a.sireName.toLowerCase().includes(q) ||
      a.damName.toLowerCase().includes(q);

    return matchesSpecies && matchesStatus && matchesQuery;
  });

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
      case 'Duck': return '🦆';
      default: return '🐾';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2">
            <span>{t('allAnimals', 'Your Farm Animals')}</span>
            <span className="text-sm font-black font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900">
              {farm.animals.length}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            {t('appSubtitle', 'Easy livestock diary: check milk, health, and family lineage for each animal.')}
          </p>
        </div>

        {/* Buttons: Add Animal + Bulk Add + Farm Setup */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Record Daily Milk Log */}
          <button
            onClick={() => onOpenMilkModal()}
            className="px-3.5 py-2.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white font-black text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Record Morning or Evening Milk in Liters"
          >
            <Milk className="w-4 h-4 text-sky-100" />
            <span>🥛 Record Milk Log</span>
          </button>

          {/* Add in Bulk (Highlighted for quick addition of Goats/Sheep/Cows) */}
          <button
            onClick={onOpenBulkModal}
            className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title={t('bulkTitle', 'Add in bulk like 10 or 20 goats/sheep')}
          >
            <PackagePlus className="w-4 h-4 text-stone-950" />
            <span>{t('addBulk', '📦 Add in Bulk')}</span>
          </button>

          {/* Add Single Animal */}
          <button
            onClick={onOpenAddModal}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addAnimal', '+ Add Animal')}</span>
          </button>

          {/* Farm Animals Setup */}
          <button
            onClick={onOpenSpeciesModal}
            className="p-2.5 rounded-xl border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold transition-colors cursor-pointer"
            title={t('manageSpeciesTitle', 'Choose which animals live on this farm')}
          >
            <Settings className="w-4 h-4 text-stone-600" />
          </button>
        </div>
      </div>

      {/* Vaccine Nearing Alert Notification Banner */}
      {alerts.length > 0 && (
        <div 
          onClick={onOpenVaccineAlerts}
          className="p-4 rounded-3xl bg-amber-50 border-2 border-amber-300 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:bg-amber-100/70 transition-all"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center text-xl shrink-0 animate-bounce">
              🔔
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
                  Vaccine Due Alert ({alerts.length} Animals)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-600 text-white">
                  Action Required
                </span>
              </div>
              <p className="text-xs text-amber-950 font-bold truncate mt-0.5">
                {alerts.map(a => `${a.animalName}: ${a.vaccineName} (${a.daysLeft <= 0 ? 'OVERDUE' : `in ${a.daysLeft}d`})`).join(' · ')}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold shrink-0 cursor-pointer shadow-xs"
          >
            Review Alerts
          </button>
        </div>
      )}

      {/* Role Permission Notice for Farm Helpers */}
      {!isAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>{t('farmHelper', 'Farm Helper')} Permission:</strong> {t('onlyBossCanDelete', 'You can update daily milk and weight. Only Farm Boss can delete animals.')}
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
            {t('cannotDelete', 'Cannot Delete')}
          </span>
        </div>
      )}

      {/* Species Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Animal Species Filters */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
          <button
            onClick={() => setSelectedSpecies('All')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              selectedSpecies === 'All'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <span>🐾 {t('allAnimals', 'All Animals')}</span> ({farm.animals.length})
          </button>

          {farmSpecies.map(sp => {
            const count = farm.animals.filter(a => a.species === sp).length;
            const isSelected = selectedSpecies === sp;
            const emoji = getSpeciesEmoji(sp);
            return (
              <button
                key={sp}
                onClick={() => setSelectedSpecies(sp)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{emoji} {sp}</span> ({count})
              </button>
            );
          })}

          <button
            onClick={onOpenSpeciesModal}
            className="px-2 py-1.5 rounded-xl text-[11px] font-bold text-stone-500 hover:text-stone-800 hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            title="Add or remove animal types for this farm"
          >
            + {t('farmSettings', 'Setup Animals')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder', 'Search ear tag, name, or breed...')}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Basic Health & Milk Status Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-black uppercase text-stone-400 tracking-wider shrink-0 pr-1">
          Quick Filters:
        </span>
        {[
          { id: 'All', label: 'All Status' },
          { id: 'Milking', label: '🥛 Giving Milk' },
          { id: 'Dry', label: '🥥 Dry Period' },
          { id: 'Eggs', label: '🥚 Laying Eggs' },
          { id: 'Healthy', label: '🟢 Healthy & Fit' },
          { id: 'VaccineDue', label: '💉 Vaccine Due' },
          { id: 'NeedsCare', label: '💊 Needs Medicine' },
          { id: 'Pregnant', label: '🤰 Pregnant Care' },
        ].map(filter => {
          const isActive = selectedStatusFilter === filter.id;
          return (
            <button
              key={filter.id}
              onClick={() => setSelectedStatusFilter(filter.id)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'bg-stone-800 text-white shadow-2xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300'
              }`}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Livestock Animals Cards Grid */}
      {filteredAnimals.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-stone-300 bg-white text-center space-y-3">
          <div className="text-4xl">🐮</div>
          <h3 className="text-base font-bold text-stone-800">
            {searchQuery || selectedStatusFilter !== 'All' ? 'No animals match this filter' : 'No animals here yet'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No animals match "${searchQuery}". Try typing another tag or name.` 
              : selectedStatusFilter !== 'All'
              ? 'Try selecting "All Status" to see your other animals.'
              : `Tap the buttons above to add animals or add a herd in bulk!`}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenBulkModal}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs cursor-pointer"
            >
              📦 Add in Bulk
            </button>
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer"
            >
              + Add Single Animal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAnimals.map(animal => {
            const growthPct = Math.min(
              100,
              Math.round((animal.currentWeightKg / animal.targetMatureWeightKg) * 100)
            );
            const pendingVac = farm.vaccinations.find(
              v => v.animalId === animal.id && (v.status === 'Due Soon' || v.status === 'Overdue')
            );
            const isConfirmingDelete = deleteConfirmId === animal.id;

            // Health Status styling
            const currentHealth = animal.healthStatus || (pendingVac ? 'Vaccine Due' : 'Healthy & Fit');
            let healthBadgeBg = 'bg-emerald-50 text-emerald-800 border-emerald-200';
            let healthIcon = '🟢';
            if (currentHealth === 'Needs Medicine' || currentHealth === 'Under Observation') {
              healthBadgeBg = 'bg-rose-50 text-rose-800 border-rose-200';
              healthIcon = '💊';
            } else if (currentHealth === 'Vaccine Due') {
              healthBadgeBg = 'bg-amber-50 text-amber-800 border-amber-200';
              healthIcon = '💉';
            } else if (currentHealth === 'Pregnant Care') {
              healthBadgeBg = 'bg-purple-50 text-purple-800 border-purple-200';
              healthIcon = '🤰';
            }

            // Milk Status styling
            const currentMilk = animal.milkStatus || (animal.status === 'Lactating' ? 'Giving Milk' : animal.species === 'Chicken' ? 'Laying Eggs' : 'Dry Period');
            let milkBadgeBg = 'bg-sky-50 text-sky-900 border-sky-200';
            let milkIcon = '🥛';
            if (currentMilk === 'Dry Period') {
              milkBadgeBg = 'bg-stone-100 text-stone-700 border-stone-200';
              milkIcon = '🥥';
            } else if (currentMilk === 'Laying Eggs') {
              milkBadgeBg = 'bg-amber-50 text-amber-900 border-amber-200';
              milkIcon = '🥚';
            } else if (currentMilk === 'Not Milking (Male/Kid)') {
              milkBadgeBg = 'bg-stone-100 text-stone-600 border-stone-200';
              milkIcon = '🐂';
            }

            const animalAlert = alerts.find(al => al.animalId === animal.id);

            return (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-700 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Photo with Overlay */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    {animalAlert && (
                      <div className="absolute top-3 left-3 z-10 px-2.5 py-1 rounded-xl bg-amber-500 text-stone-950 font-black text-[10px] shadow-md flex items-center gap-1 animate-pulse">
                        <span>⏰</span>
                        <span>{animalAlert.status === 'Overdue' ? 'Shot Overdue!' : `Shot in ${animalAlert.daysLeft}d`}</span>
                      </div>
                    )}
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                        <span>Tag No: {animal.tagId}</span>
                        <span className="text-white text-[11px] font-sans bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {animal.species} · {animal.sex}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white mt-0.5 truncate">
                        {animal.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-4 sm:p-5 space-y-3.5">
                    
                    {/* Basic Info */}
                    <div className="text-xs text-stone-600 font-medium">
                      <span className="text-stone-900 font-extrabold">{animal.breed}</span>
                      <span className="block text-stone-500 mt-0.5">
                        Age: <strong>{calculateAge(animal.dateOfBirth)}</strong>
                      </span>
                    </div>

                    {/* Prominent Health Status & Milk Status Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      
                      {/* Health Status Box */}
                      <div className={`p-2 rounded-xl border text-xs flex flex-col justify-between ${healthBadgeBg}`}>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                          {t('healthStatus', 'Health Status')}
                        </span>
                        <div className="font-extrabold text-xs flex items-center gap-1 mt-0.5 truncate">
                          <span>{healthIcon}</span>
                          <span className="truncate">{currentHealth}</span>
                        </div>
                      </div>

                      {/* Milk / Yield Status Box */}
                      <div className={`p-2 rounded-xl border text-xs flex flex-col justify-between ${milkBadgeBg}`}>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-75">
                          {t('milkStatus', 'Milk / Eggs')}
                        </span>
                        <div className="font-extrabold text-xs flex items-center gap-1 mt-0.5 truncate">
                          <span>{milkIcon}</span>
                          <span className="truncate">
                            {animal.dailyMilkLitres ? `${animal.dailyMilkLitres} L/day` : currentMilk}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Papa & Mummy Box */}
                    <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-bold">{t('papa', 'Papa (Father)')}:</span>
                        <span className="font-bold text-stone-900 truncate ml-2">
                          {animal.sireName} ({animal.sireTag})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-bold">{t('mummy', 'Mummy (Mother)')}:</span>
                        <span className="font-bold text-stone-900 truncate ml-2">
                          {animal.damName} ({animal.damTag})
                        </span>
                      </div>
                    </div>

                    {/* Weight & Productivity Gauge */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-stone-500">
                          Weight: <strong className="text-stone-900">{animal.currentWeightKg} kg</strong> (Target: {animal.targetMatureWeightKg} kg)
                        </span>
                        <span className="font-mono font-bold text-emerald-900">
                          {animal.currentProductivityValue}
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                        <div
                          className="h-full bg-emerald-700 rounded-full"
                          style={{ width: `${growthPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Paddock Location */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                      <span className="text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{animal.paddockLocation}</span>
                      </span>
                      <span className="text-emerald-700 font-bold text-[11px]">
                        ✓ Diary Updated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-4 sm:px-5 pb-5 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAnimal(animal);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>{t('seeDiary', 'See Animal Diary')}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Quick Log Milk button for Cows, Goats, Buffaloes */}
                  {animal.sex === 'Female' && (animal.species === 'Cow' || animal.species === 'Goat' || animal.species === 'Buffalo') && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenMilkModal(animal);
                      }}
                      className="py-2.5 px-3 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-900 border border-sky-300 text-xs font-black flex items-center justify-center gap-1 transition-colors cursor-pointer shrink-0"
                      title="Log morning or evening milk in liters"
                    >
                      <span>🥛</span>
                      <span className="hidden sm:inline">Log Milk</span>
                    </button>
                  )}

                  {/* Delete Button - Allowed ONLY for Admin */}
                  {isAdmin ? (
                    isConfirmingDelete ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, animal.id)}
                          className="px-2 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold cursor-pointer"
                        >
                          {t('deleteAnimal', 'Delete')}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-2 rounded-xl bg-stone-200 text-stone-700 text-[10px] font-semibold cursor-pointer"
                        >
                          {t('cancel', 'Cancel')}
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(e, animal)}
                        className="p-2.5 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors shrink-0 cursor-pointer"
                        title="Delete Animal (Farm Boss Only)"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  ) : (
                    <div
                      className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 text-stone-300 cursor-not-allowed shrink-0"
                      title={t('onlyBossCanDelete', 'Delete is locked. Only Farm Boss can delete animals. Helpers can update milk and weight.')}
                    >
                      <Lock className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
