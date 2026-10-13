import React, { useState } from 'react';
import { Animal, Farm, User, GrowthMetric, VaccinationRecord, HealthRecord, isVaccineManager } from '../types';
import { calculateAge } from './LivestockList';
import { 
  X, 
  GitBranch, 
  Activity, 
  Syringe, 
  Stethoscope, 
  Plus, 
  Check, 
  Trash2, 
  Lock, 
  Scale,
  Sparkles,
  ArrowUpRight,
  Camera
} from 'lucide-react';

interface AnimalDetailModalProps {
  animal: Animal;
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onSelectAnotherAnimal: (animal: Animal) => void;
  onAddGrowthRecord: (animalId: string, record: Omit<GrowthMetric, 'id'>) => void;
  onMarkVaccineComplete: (vacId: string) => void;
  onAddVaccine: (vac: Omit<VaccinationRecord, 'id'>) => void;
  onAddHealthRecord: (record: Omit<HealthRecord, 'id'>) => void;
  onDeleteAnimal: (animalId: string) => void;
  onUpdateAnimalPhoto: (animalId: string, newPhoto: string) => void;
  onOpenMilkModal?: (animal: Animal) => void;
}

export const AnimalDetailModal: React.FC<AnimalDetailModalProps> = ({
  animal,
  farm,
  currentUser,
  onClose,
  onSelectAnotherAnimal,
  onAddGrowthRecord,
  onMarkVaccineComplete,
  onAddVaccine,
  onAddHealthRecord,
  onDeleteAnimal,
  onUpdateAnimalPhoto,
  onOpenMilkModal,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const canManageVaccine = isVaccineManager(currentMember?.role, isAdmin);
  const [activeTab, setActiveTab] = useState<'lineage' | 'growth' | 'health'>('lineage');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Growth form
  const [showGrowthForm, setShowGrowthForm] = useState(false);
  const [newWeight, setNewWeight] = useState(String(animal.currentWeightKg));
  const [newHeight, setNewHeight] = useState('135');
  const [newBcs, setNewBcs] = useState('3.5');
  const [newYield, setNewYield] = useState('18');
  const [growthNotes, setGrowthNotes] = useState('');

  // Vaccine form
  const [showVacForm, setShowVacForm] = useState(false);
  const [vacName, setVacName] = useState('');
  const [vacDisease, setVacDisease] = useState('');
  const [vacDueDate, setVacDueDate] = useState('2026-11-15');
  const [vacDosage, setVacDosage] = useState('2.0 ml injection');
  const [vacBatch, setVacBatch] = useState('IND-BATCH-2026');

  // Health form
  const [showHealthForm, setShowHealthForm] = useState(false);
  const [healthType, setHealthType] = useState<HealthRecord['type']>('Routine Checkup');
  const [healthTitle, setHealthTitle] = useState('');
  const [healthDiagnosis, setHealthDiagnosis] = useState('');
  const [healthTreatment, setHealthTreatment] = useState('');
  const [healthTemp, setHealthTemp] = useState('38.5');
  const [healthCost, setHealthCost] = useState('250');

  const animalVacs = farm.vaccinations.filter(v => v.animalId === animal.id);
  const animalHealth = farm.healthRecords.filter(h => h.animalId === animal.id);

  const sireInHerd = farm.animals.find(a => a.id === animal.sireId || a.tagId === animal.sireTag);
  const damInHerd = farm.animals.find(a => a.id === animal.damId || a.tagId === animal.damTag);
  const offspringInHerd = farm.animals.filter(a => 
    a.sireId === animal.id || a.damId === animal.id || a.sireTag === animal.tagId || a.damTag === animal.tagId
  );

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onUpdateAnimalPhoto(animal.id, reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleGrowthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(newWeight) || animal.currentWeightKg;
    const h = parseFloat(newHeight) || 120;
    const bcs = parseFloat(newBcs) || 3.5;
    const yv = parseFloat(newYield) || 0;

    const lastEntry = animal.growthHistory[animal.growthHistory.length - 1];
    const unit = lastEntry?.dailyYieldUnit || (animal.species === 'Cow' || animal.species === 'Goat' ? 'Litres/day' : animal.species === 'Chicken' ? 'eggs/wk' : 'kg wool');

    onAddGrowthRecord(animal.id, {
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      heightCm: h,
      bodyConditionScore: bcs,
      averageDailyGainG: Math.max(10, Math.round(((w - animal.currentWeightKg) * 1000) / 14)),
      dailyYieldValue: yv,
      dailyYieldUnit: unit,
      recordedBy: currentUser.name,
      recordedById: currentUser.id,
      notes: growthNotes.trim() || 'Healthy daily feed and fresh water.',
    });

    setGrowthNotes('');
    setShowGrowthForm(false);
  };

  const handleVacSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacName.trim()) return;

    onAddVaccine({
      animalId: animal.id,
      vaccineName: vacName.trim(),
      diseaseTarget: vacDisease.trim() || 'Seasonal Animal Protection',
      dueDate: vacDueDate,
      status: 'Scheduled',
      dosage: vacDosage,
      batchNumber: vacBatch,
      nextBoosterDate: '2027-10-15',
    });

    setVacName('');
    setVacDisease('');
    setShowVacForm(false);
  };

  const handleHealthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!healthTitle.trim()) return;

    onAddHealthRecord({
      animalId: animal.id,
      date: new Date().toISOString().split('T')[0],
      type: healthType,
      title: healthTitle.trim(),
      diagnosis: healthDiagnosis.trim() || 'Animal is doing very well.',
      treatmentGiven: healthTreatment.trim() || 'Nutritious diet and herbal care.',
      temperatureC: parseFloat(healthTemp) || 38.5,
      veterinarian: currentUser.name,
      outcome: 'Cleared',
      costInr: parseFloat(healthCost) || 0,
    });

    setHealthTitle('');
    setHealthDiagnosis('');
    setHealthTreatment('');
    setShowHealthForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[94vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between gap-4 bg-[#FFFDF9]">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                Tag: {animal.tagId}
              </span>
              <span className="text-xs text-stone-600 font-bold">
                {animal.species} · {animal.breed} · {animal.sex}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 truncate mt-0.5">
              {animal.name}
            </h2>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin ? (
              confirmDelete ? (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onDeleteAnimal(animal.id)}
                    className="px-3 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                  title="Delete Animal (Farm Boss Only)"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            ) : (
              <div
                className="px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-200"
                title="Only Farm Boss can delete animals. Helpers can update milk and weight."
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Delete Locked</span>
              </div>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* Top Identity Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
            
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200 min-h-[220px] bg-stone-100">
              <img
                src={animal.photoUrl}
                alt={animal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <label className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs cursor-pointer transition-colors">
                <Camera className="w-3.5 h-3.5" />
                <span>Change Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="md:col-span-7 flex flex-col justify-between bg-[#FFFDF7] rounded-2xl border border-amber-200/80 p-5 space-y-3">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-100 pb-2.5">
                  <div>
                    <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                      Status & Shed
                    </span>
                    <span className="text-sm font-extrabold text-emerald-950">
                      {animal.status} · {animal.paddockLocation}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-stone-500 font-bold uppercase tracking-wider block">
                      Age & Birthday
                    </span>
                    <span className="text-sm font-bold text-stone-900">
                      {calculateAge(animal.dateOfBirth)} ({animal.dateOfBirth})
                    </span>
                  </div>
                </div>

                {/* Health & Milk Status Badges in Modal */}
                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🩺</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-stone-400 block">Health Status</span>
                      <span className="text-xs font-black text-stone-900">{animal.healthStatus || 'Healthy & Fit'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">🥛</span>
                      <div>
                        <span className="text-[10px] font-black uppercase text-stone-400 block">Milk / Production</span>
                        <span className="text-xs font-black text-stone-900">{animal.milkStatus || (animal.species === 'Chicken' ? 'Laying Eggs' : 'Giving Milk')}</span>
                      </div>
                    </div>
                    {onOpenMilkModal && (animal.species === 'Cow' || animal.species === 'Goat' || animal.species === 'Buffalo') && (
                      <button
                        type="button"
                        onClick={() => onOpenMilkModal(animal)}
                        className="px-2.5 py-1 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-[11px] font-black shadow-2xs transition-colors cursor-pointer shrink-0"
                      >
                        + Log Milk
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <div>
                    <div className="text-xs text-stone-500">Weight Today</div>
                    <div className="text-lg font-black text-stone-900 font-mono">
                      {animal.currentWeightKg} kg
                    </div>
                    <div className="text-[11px] text-stone-400 font-mono">
                      At birth: {animal.birthWeightKg} kg
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-500">Target Weight</div>
                    <div className="text-lg font-black text-stone-900 font-mono">
                      {animal.targetMatureWeightKg} kg
                    </div>
                    <div className="text-[11px] text-emerald-800 font-bold">
                      {Math.min(100, Math.round((animal.currentWeightKg / animal.targetMatureWeightKg) * 100))}% grown
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-500">{animal.productivityLabel}</div>
                    <div className="text-lg font-black text-emerald-900 font-mono">
                      {animal.currentProductivityValue}
                    </div>
                    <div className="text-[11px] text-stone-400">Daily yield</div>
                  </div>

                  <div>
                    <div className="text-xs text-stone-500">Family Match</div>
                    <div className="text-lg font-black text-emerald-900 font-mono">
                      Safe ({animal.inbreedingCoefficientPct}%)
                    </div>
                    <div className="text-[11px] text-emerald-700">Healthy line</div>
                  </div>
                </div>
              </div>

              {/* Parents summary */}
              <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-xs text-stone-700">
                <span>
                  <strong>Papa (Father):</strong> {animal.sireName} ({animal.sireTag})
                </span>
                <span> · </span>
                <span>
                  <strong>Mummy (Mother):</strong> {animal.damName} ({animal.damTag})
                </span>
              </div>
            </div>
          </div>

          {/* Simple Navigation Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl">
            <button
              onClick={() => setActiveTab('lineage')}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'lineage'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🌳</span>
              <span>Family (Papa & Mummy)</span>
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'growth'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚖️</span>
              <span>Weight & Milk Logs ({animal.growthHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`flex-1 py-2 text-xs font-black rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'health'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>💉</span>
              <span>Vaccines & Doctor ({animalVacs.length + animalHealth.length})</span>
            </button>
          </div>

          {/* TAB 1: SIMPLE FAMILY TREE (PAPA & MUMMY) */}
          {activeTab === 'lineage' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-base font-extrabold text-stone-900">
                  Animal Family Tree (माता-पिता व खानदान)
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  See who the Papa (father) and Mummy (mother) are. Tap on them to see their records!
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Papa Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-700 uppercase">
                      🐂 Papa (Father)
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2 py-0.5 rounded border">
                      Tag #{animal.sireTag}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900">{animal.sireName}</h4>
                  <p className="text-xs text-stone-600">Breed: {animal.sireBreed}</p>

                  {sireInHerd ? (
                    <button
                      type="button"
                      onClick={() => onSelectAnotherAnimal(sireInHerd)}
                      className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white border border-stone-300 hover:border-emerald-700 text-xs font-bold text-emerald-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>See Papa's Diary on this Farm</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">
                      Foundation Father from outside breed registry
                    </p>
                  )}
                </div>

                {/* Mummy Card */}
                <div className="p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-stone-700 uppercase">
                      🐄 Mummy (Mother)
                    </span>
                    <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2 py-0.5 rounded border">
                      Tag #{animal.damTag}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-stone-900">{animal.damName}</h4>
                  <p className="text-xs text-stone-600">Breed: {animal.damBreed}</p>

                  {damInHerd ? (
                    <button
                      type="button"
                      onClick={() => onSelectAnotherAnimal(damInHerd)}
                      className="mt-2 w-full py-1.5 px-3 rounded-xl bg-white border border-stone-300 hover:border-emerald-700 text-xs font-bold text-emerald-900 flex items-center justify-between cursor-pointer"
                    >
                      <span>See Mummy's Diary on this Farm</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <p className="text-[11px] text-stone-400 italic">
                      Foundation Mother from outside breed registry
                    </p>
                  )}
                </div>
              </div>

              {/* Good Traits Inherited */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-700">
                  Good Qualities from Papa & Mummy:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {animal.inheritedTraits.map((t, idx) => (
                    <div key={idx} className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950">{t.traitName}</span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {t.scoreOrGrade}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{t.impactDescription}</p>
                      <span className="text-[10px] text-stone-500 font-bold block pt-1">
                        Got from: {t.inheritedFrom === 'Sire' ? 'Papa' : t.inheritedFrom === 'Dam' ? 'Mummy' : 'Both Papa & Mummy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baby Offspring in Herd */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-black uppercase text-stone-700">
                  Baby Animals of {animal.name} on this Farm ({offspringInHerd.length})
                </h4>
                {offspringInHerd.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">
                    No baby animals registered for this animal yet. When you add a new calf, kid, lamb, or chick, pick {animal.name} as the Papa or Mummy!
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {offspringInHerd.map(child => (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => onSelectAnotherAnimal(child)}
                        className="text-left p-3.5 rounded-2xl border border-stone-200 hover:border-emerald-700 bg-white flex items-center justify-between gap-2 cursor-pointer shadow-xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-stone-900">{child.name} (Tag #{child.tagId})</div>
                          <div className="text-[11px] text-stone-500">{child.breed} · Born {child.dateOfBirth}</div>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-emerald-700 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WEIGHT & DAILY MILK LOGS */}
          {activeTab === 'growth' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-stone-900">
                    Animal Weight & Daily Milk Diary
                  </h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Any helper or doctor can type today's milk in Litres or weight in Kilograms (kg).
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowGrowthForm(!showGrowthForm)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Write Today's Weight & Milk</span>
                </button>
              </div>

              {/* Form to log weigh-in */}
              {showGrowthForm && (
                <form onSubmit={handleGrowthSubmit} className="p-4 rounded-2xl bg-amber-50/50 border-2 border-amber-200 space-y-3">
                  <h4 className="text-xs font-black text-amber-950 uppercase">
                    Write New Weight or Milk Record
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Body Weight in kg (वजन)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        required
                        value={newWeight}
                        onChange={(e) => setNewWeight(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Daily Milk in Litres or Eggs (दूध)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={newYield}
                        onChange={(e) => setNewYield(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Health Score (1 to 5)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        max="5"
                        value={newBcs}
                        onChange={(e) => setNewBcs(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Notes (What did the animal eat? e.g. green grass, mustard cake)
                    </label>
                    <input
                      type="text"
                      value={growthNotes}
                      onChange={(e) => setGrowthNotes(e.target.value)}
                      placeholder="e.g. Ate fresh green jowar grass and gave rich milk..."
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowGrowthForm(false)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 text-xs text-stone-600 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                    >
                      Save to Diary
                    </button>
                  </div>
                </form>
              )}

              {/* Growth History Table */}
              <div className="border border-stone-200 rounded-2xl overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px]">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Weight (kg)</th>
                      <th className="py-2.5 px-3">Milk / Yield</th>
                      <th className="py-2.5 px-3">Daily Gain</th>
                      <th className="py-2.5 px-3">Written By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {[...animal.growthHistory].reverse().map(gm => (
                      <tr key={gm.id} className="hover:bg-stone-50/70">
                        <td className="py-2.5 px-3 font-mono text-stone-700">{gm.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-stone-900">{gm.weightKg} kg</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">{gm.dailyYieldValue} {gm.dailyYieldUnit}</td>
                        <td className="py-2.5 px-3 font-mono text-stone-600">+{gm.averageDailyGainG} g/day</td>
                        <td className="py-2.5 px-3 text-stone-600">
                          <strong>{gm.recordedBy}</strong>
                          {gm.notes && <span className="block text-[11px] text-stone-400">{gm.notes}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: VACCINES & DOCTOR VISITS */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              
              {/* Vaccines */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                    <span>💉</span>
                    <span>Vaccine Injections & Protection Shots</span>
                  </h3>
                  
                  {canManageVaccine ? (
                    <button
                      type="button"
                      onClick={() => setShowVacForm(!showVacForm)}
                      className="px-3 py-1.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Schedule Next Shot</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg flex items-center gap-1">
                      <Lock className="w-3 h-3 text-stone-400" />
                      <span>Admin/Support only</span>
                    </span>
                  )}
                </div>

                {showVacForm && (
                  <form onSubmit={handleVacSubmit} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Vaccine Name</label>
                        <input
                          type="text"
                          required
                          value={vacName}
                          onChange={(e) => setVacName(e.target.value)}
                          placeholder="e.g. FMD Mouth & Foot Fever"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Protection For</label>
                        <input
                          type="text"
                          value={vacDisease}
                          onChange={(e) => setVacDisease(e.target.value)}
                          placeholder="e.g. Mouth sores and fever"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Date Needed</label>
                        <input
                          type="date"
                          value={vacDueDate}
                          onChange={(e) => setVacDueDate(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowVacForm(false)}
                        className="px-3 py-1 rounded-xl border border-stone-300 text-xs text-stone-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-xl bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                      >
                        Save Vaccine Shot
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {animalVacs.map(v => (
                    <div
                      key={v.id}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs"
                    >
                      <div>
                        <div className="text-xs font-mono text-stone-500 font-bold">
                          {v.status === 'Completed' ? '✓ Completed' : v.status === 'Due Soon' ? '⏰ Shot Due Soon' : '⚠️ Past Due'} · Date: {v.dueDate}
                        </div>
                        <div className="font-extrabold text-stone-900 text-sm mt-0.5">{v.vaccineName}</div>
                        <div className="text-xs text-stone-600">{v.diseaseTarget} · Dose: {v.dosage}</div>
                      </div>

                      <div className="shrink-0">
                        {v.status !== 'Completed' ? (
                          <button
                            type="button"
                            onClick={() => onMarkVaccineComplete(v.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Mark Shot Given Today</span>
                          </button>
                        ) : (
                          <span className="text-xs text-emerald-800 font-bold font-mono">
                            ✓ Given on {v.administeredDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Doctor Visits */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-stone-900 flex items-center gap-1.5">
                    <span>🩺</span>
                    <span>Doctor Visits & Medicine Diary</span>
                  </h3>
                  
                  <button
                    type="button"
                    onClick={() => setShowHealthForm(!showHealthForm)}
                    className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Write Doctor Checkup</span>
                  </button>
                </div>

                {showHealthForm && (
                  <form onSubmit={handleHealthSubmit} className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Checkup Type</label>
                        <select
                          value={healthType}
                          onChange={(e) => setHealthType(e.target.value as HealthRecord['type'])}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                        >
                          <option value="Routine Checkup">General Health Check</option>
                          <option value="Treatment">Medicine Treatment</option>
                          <option value="Deworming">Tummy Worm Medicine (पेट की दवा)</option>
                          <option value="Maternal / Birth">Baby Birth Checkup</option>
                          <option value="Hoof & Coat Care">Nails & Skin Care</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Short Title</label>
                        <input
                          type="text"
                          required
                          value={healthTitle}
                          onChange={(e) => setHealthTitle(e.target.value)}
                          placeholder="e.g. Monthly milk check"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">Cost in Rupees (₹)</label>
                        <input
                          type="number"
                          value={healthCost}
                          onChange={(e) => setHealthCost(e.target.value)}
                          placeholder="₹250"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-mono font-bold"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={healthDiagnosis}
                        onChange={(e) => setHealthDiagnosis(e.target.value)}
                        placeholder="What did the doctor find? (e.g. Healthy udder)"
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                      />
                      <input
                        type="text"
                        value={healthTreatment}
                        onChange={(e) => setHealthTreatment(e.target.value)}
                        placeholder="What medicine was given? (e.g. Herbal tonic)"
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs"
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowHealthForm(false)}
                        className="px-3 py-1 rounded-xl border border-stone-300 text-xs text-stone-600 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 rounded-xl bg-stone-900 text-white text-xs font-bold cursor-pointer"
                      >
                        Save Doctor Note
                      </button>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {animalHealth.map(h => (
                    <div key={h.id} className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/60 space-y-1">
                      <div className="flex items-center justify-between text-xs text-stone-500 font-mono">
                        <span>{h.date} · {h.type}</span>
                        <span className="font-bold text-stone-900">{h.veterinarian} · ₹{h.costInr}</span>
                      </div>
                      <div className="text-sm font-extrabold text-stone-900">{h.title}</div>
                      <div className="text-xs text-stone-700"><strong>Checkup:</strong> {h.diagnosis}</div>
                      <div className="text-xs text-stone-600"><strong>Medicine Given:</strong> {h.treatmentGiven}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
