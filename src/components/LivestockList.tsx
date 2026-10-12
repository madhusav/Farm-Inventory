import React, { useState } from 'react';
import { Animal, Species, Farm, User } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Lock, 
  MapPin, 
  ArrowUpRight
} from 'lucide-react';

interface LivestockListProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onOpenAddModal: () => void;
  onDeleteAnimal: (animalId: string) => void;
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
  return `${years} years, ${remMonths} months old`;
}

export const LivestockList: React.FC<LivestockListProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onOpenAddModal,
  onDeleteAnimal,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;
  const [selectedSpecies, setSelectedSpecies] = useState<'All' | Species>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredAnimals = farm.animals.filter(a => {
    const matchesSpecies = selectedSpecies === 'All' || a.species === selectedSpecies;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesSpecies;
    const matchesQuery = 
      a.tagId.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.breed.toLowerCase().includes(q) ||
      a.sireName.toLowerCase().includes(q) ||
      a.damName.toLowerCase().includes(q);
    return matchesSpecies && matchesQuery;
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

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Your Farm Animals ({farm.animals.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            Tap any cow, goat, sheep, or chicken to see their family tree, daily milk, and vaccine shots!
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-sm transition-colors flex items-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Animal</span>
        </button>
      </div>

      {/* Role permission info banner for Helpers */}
      {!isAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <strong>Farm Helper Permission:</strong> You can add daily milk, write weight, and record doctor vaccines. <em>Only Farm Boss can delete animals.</em>
            </span>
          </div>
          <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
            Cannot Delete
          </span>
        </div>
      )}

      {/* Species Tabs and Search Input */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Simple Species Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl overflow-x-auto">
          {[
            { id: 'All', label: 'All Animals', icon: '🐾' },
            { id: 'Cow', label: 'Cows (गाय)', icon: '🐄' },
            { id: 'Goat', label: 'Goats (बकरी)', icon: '🐐' },
            { id: 'Sheep', label: 'Sheep (भेड़)', icon: '🐑' },
            { id: 'Chicken', label: 'Chickens (मुर्गी)', icon: '🐔' },
          ].map(tab => {
            const count = tab.id === 'All' 
              ? farm.animals.length 
              : farm.animals.filter(a => a.species === tab.id).length;
            const isSelected = selectedSpecies === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedSpecies(tab.id as 'All' | Species)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>{tab.icon} {tab.label}</span> ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ear tag, name, or breed..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
          />
        </div>
      </div>

      {/* Livestock Animals Cards */}
      {filteredAnimals.length === 0 ? (
        <div className="p-12 rounded-3xl border border-dashed border-stone-300 bg-white text-center space-y-3">
          <div className="text-4xl">🐮</div>
          <h3 className="text-base font-bold text-stone-800">No animals here yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery 
              ? `No animals match "${searchQuery}". Try typing another tag or name.` 
              : `Tap the green button to add your first ${selectedSpecies === 'All' ? 'animal' : selectedSpecies}!`}
          </p>
          <button
            onClick={onOpenAddModal}
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs cursor-pointer"
          >
            + Add First Animal
          </button>
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

            return (
              <div
                key={animal.id}
                onClick={() => onSelectAnimal(animal)}
                className="bg-white rounded-3xl border border-stone-200 hover:border-emerald-700 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  {/* Photo with Overlay */}
                  <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                    <img
                      src={animal.photoUrl}
                      alt={animal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center justify-between text-xs font-mono text-emerald-300 font-bold">
                        <span>Tag No: {animal.tagId}</span>
                        <span className="text-white text-[11px] font-sans bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                          {animal.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold tracking-tight text-white mt-0.5 truncate">
                        {animal.name}
                      </h3>
                    </div>
                  </div>

                  {/* Body Info with Simple Language */}
                  <div className="p-5 space-y-4">
                    
                    {/* Basic Info */}
                    <div className="text-xs text-stone-600 font-medium">
                      <span className="text-stone-900 font-extrabold">{animal.species}</span>
                      <span> · </span>
                      <span>{animal.breed}</span>
                      <span> · </span>
                      <span>{animal.sex}</span>
                      <span className="block text-stone-500 mt-0.5">
                        Age: <strong>{calculateAge(animal.dateOfBirth)}</strong> (Born {animal.dateOfBirth})
                      </span>
                    </div>

                    {/* Papa & Mummy Box */}
                    <div className="p-3 rounded-2xl bg-[#FFFDF7] border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-bold">Papa (Father):</span>
                        <span className="font-bold text-stone-900 truncate">
                          {animal.sireName} ({animal.sireTag})
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500 font-bold">Mummy (Mother):</span>
                        <span className="font-bold text-stone-900 truncate">
                          {animal.damName} ({animal.damTag})
                        </span>
                      </div>
                    </div>

                    {/* Weight & Milk Output */}
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

                    {/* Vaccine status */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-stone-100">
                      <span className="text-stone-500 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span className="truncate">{animal.paddockLocation}</span>
                      </span>

                      {pendingVac ? (
                        <span className="font-bold text-amber-800 text-[11px] bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          💉 Shot Needed
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          ✓ Vaccines Safe
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="px-5 pb-5 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectAnimal(animal);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>See Animal Diary</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete Button - Allowed ONLY for Admin */}
                  {isAdmin ? (
                    isConfirmingDelete ? (
                      <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={(e) => handleConfirmDelete(e, animal.id)}
                          className="px-2 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white text-[10px] font-bold cursor-pointer"
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-2 rounded-xl bg-stone-200 text-stone-700 text-[10px] font-semibold cursor-pointer"
                        >
                          Cancel
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
                      title="Delete is locked. Only Farm Boss can delete animals. Helpers can update milk and weight."
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
