import React, { useState } from 'react';
import { Farm, User, Animal } from '../types';
import { 
  Syringe, 
  Check, 
  Clock, 
  AlertTriangle, 
  Search, 
  Calendar, 
  ShieldCheck, 
  Lock 
} from 'lucide-react';

interface VaccinationScheduleViewProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onMarkVaccineComplete: (vacId: string) => void;
}

export const VaccinationScheduleView: React.FC<VaccinationScheduleViewProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onMarkVaccineComplete,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | 'Due Soon' | 'Overdue' | 'Completed'>('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Vaccines & Protection Shots (टीकाकरण)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Make sure every cow, goat, sheep, and chicken gets their medicine shots on time so they never fall sick!
        </p>
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
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-stone-300 bg-white text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
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
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                        isOverdue 
                          ? 'bg-red-100 text-red-900' 
                          : isDueSoon 
                          ? 'bg-amber-100 text-amber-900' 
                          : 'bg-emerald-100 text-emerald-900'
                      }`}>
                        {isDone ? '✓ Shot Done' : isDueSoon ? '⏰ Due Soon' : '⚠️ Past Due'}
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

                <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                  {!isDone ? (
                    <button
                      type="button"
                      onClick={() => onMarkVaccineComplete(vac.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Mark Shot Given Today</span>
                    </button>
                  ) : (
                    <div className="text-right text-xs font-mono text-emerald-800">
                      <div className="font-bold">✓ Given on {vac.administeredDate}</div>
                      <div className="text-[11px] text-stone-500 font-sans">By {vac.administeredBy}</div>
                    </div>
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
    </div>
  );
};
