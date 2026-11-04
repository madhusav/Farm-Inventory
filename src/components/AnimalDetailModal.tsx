import React, { useState } from 'react';
import { Animal, Species, Farm, User, GrowthMetric, VaccinationRecord, HealthRecord, AnimalHealthStatus, isVaccineManager, AnimalPurpose, AnimalOrigin } from '../types';
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
  Camera,
  Edit2,
  Info
} from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { AnimalAvatar } from './AnimalAvatar';

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
  onUpdateAnimal?: (animalId: string, updates: Partial<Animal>) => void;
  onOpenSymptomChecker?: (animalId?: string) => void;
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
  onUpdateAnimal,
  onOpenSymptomChecker,
}) => {
  const isAdmin = farm.adminUserId === currentUser.id;
  const { t, localeText } = useLanguage();
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const canManageVaccine = isVaccineManager(currentMember?.role, isAdmin);
  const [activeTab, setActiveTab] = useState<'lineage' | 'growth' | 'health'>('lineage');
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Edit Animal & Tag state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTagId, setEditTagId] = useState(animal.tagId);
  const [editName, setEditName] = useState(animal.name);
  const [editSpecies, setEditSpecies] = useState<Species>(animal.species);
  const [editBreed, setEditBreed] = useState(animal.breed);
  const [editSex, setEditSex] = useState<'Female' | 'Male'>(animal.sex);
  const [editLocation, setEditLocation] = useState(animal.paddockLocation);
  const [editWeight, setEditWeight] = useState(String(animal.currentWeightKg));
  const [editHealth, setEditHealth] = useState<AnimalHealthStatus>(animal.healthStatus || 'Healthy & Fit');
  const [editPurpose, setEditPurpose] = useState<AnimalPurpose>(animal.purpose || 'Breeding');
  const [editOrigin, setEditOrigin] = useState<AnimalOrigin>(animal.origin || 'Born on Farm');
  const [editKnowsParents, setEditKnowsParents] = useState<boolean>(animal.knowsParents !== false);

  const handleOpenEdit = () => {
    setEditTagId(animal.tagId);
    setEditName(animal.name);
    setEditSpecies(animal.species);
    setEditBreed(animal.breed);
    setEditSex(animal.sex);
    setEditLocation(animal.paddockLocation);
    setEditWeight(String(animal.currentWeightKg));
    setEditHealth(animal.healthStatus || 'Healthy & Fit');
    setEditPurpose(animal.purpose || 'Breeding');
    setEditOrigin(animal.origin || 'Born on Farm');
    setEditKnowsParents(animal.knowsParents !== false);
    setShowEditModal(true);
  };

  const handleSaveEditAnimal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTagId.trim() || !onUpdateAnimal) return;

    const w = parseFloat(editWeight) || animal.currentWeightKg;
    onUpdateAnimal(animal.id, {
      tagId: editTagId.trim().toUpperCase(),
      name: editName.trim() || `${editBreed} #${editTagId.trim().toUpperCase()}`,
      species: editSpecies,
      breed: editBreed.trim(),
      sex: editSex,
      paddockLocation: editLocation.trim(),
      currentWeightKg: w,
      healthStatus: editHealth,
      purpose: editPurpose,
      origin: editOrigin,
      knowsParents: editPurpose === 'Fattening' ? false : (editOrigin === 'Born on Farm' ? true : editKnowsParents),
    });
    setShowEditModal(false);
  };

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

    const unit = 'kg body wt';

    onAddGrowthRecord(animal.id, {
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      heightCm: h,
      bodyConditionScore: bcs,
      averageDailyGainG: Math.max(10, Math.round(((w - animal.currentWeightKg) * 1000) / 14)),
      dailyYieldValue: 0,
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
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200 flex items-center justify-between gap-2.5 bg-[#FFFDF9]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-mono text-xs font-bold text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                #{animal.tagId}
              </span>
              <span className="text-[11px] sm:text-xs text-stone-600 font-bold truncate">
                {animal.species} · {animal.breed} · {animal.sex}
              </span>
              {/* Purpose Badge */}
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                animal.purpose === 'Fattening'
                  ? 'bg-amber-100 text-amber-950 border-amber-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}>
                {animal.purpose === 'Fattening' ? `🥩 ${t('fattening', 'Fattening')}` : `🧬 ${t('breeding', 'Breeding')}`}
              </span>
              {/* Origin Badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                animal.origin === 'Brought from Outside'
                  ? 'bg-purple-50 text-purple-900 border-purple-200'
                  : 'bg-blue-50 text-blue-900 border-blue-200'
              }`}>
                {animal.origin === 'Brought from Outside' ? `🚚 ${t('broughtFromOutside', 'Outside')}` : `🏡 ${t('bornOnFarm', 'Born on Farm')}`}
              </span>
              {onUpdateAnimal && (
                <button
                  type="button"
                  onClick={handleOpenEdit}
                  className="px-2 py-0.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 text-[11px] font-black border border-amber-300 flex items-center gap-1 cursor-pointer active:scale-95 transition-all ml-1 shadow-2xs"
                  title="Update Ear Tag & Animal Info"
                >
                  <Edit2 className="w-3 h-3 text-amber-800" />
                  <span>Update Tag</span>
                </button>
              )}
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-stone-900 truncate mt-0.5">
              {animal.name}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin ? (
              confirmDelete ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onDeleteAnimal(animal.id)}
                    className="px-2.5 py-1.5 rounded-xl bg-red-700 hover:bg-red-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="px-2.5 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl border border-stone-200 hover:border-red-300 hover:bg-red-50 text-stone-400 hover:text-red-700 transition-colors cursor-pointer"
                  title="Delete Animal"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            ) : (
              <div
                className="p-1.5 rounded-xl bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1 border border-amber-200"
                title="Only Farm Boss can delete animals."
              >
                <Lock className="w-3.5 h-3.5" />
              </div>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-3 sm:space-y-5">

          {/* Top Identity Hero Card */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-5 items-stretch">
            
            <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-stone-200 h-44 sm:h-52 md:h-auto md:min-h-[200px] bg-stone-100 flex items-center justify-center">
              <AnimalAvatar animal={animal} size="hero" />
              <label className="absolute bottom-2.5 right-2.5 px-2.5 py-1.5 rounded-xl bg-stone-900/85 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 backdrop-blur-xs cursor-pointer transition-colors shadow-md z-20">
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

            <div className="md:col-span-7 flex flex-col justify-between bg-[#FFFDF7] rounded-2xl border border-amber-200/80 p-3.5 sm:p-4 space-y-2.5 sm:space-y-3">
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

                {/* Health & Weight Status Badges */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-white border border-amber-200">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🩺</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-stone-400 block">Health Status</span>
                      <span className="text-xs font-black text-stone-900">{animal.healthStatus || 'Healthy & Fit'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-amber-100 pt-2 sm:pt-0 sm:pl-3">
                    <span className="text-xl">⚖️</span>
                    <div>
                      <span className="text-[10px] font-black uppercase text-stone-400 block">Current Weight & Target</span>
                      <span className="text-xs font-black text-stone-900">{animal.currentWeightKg} kg (Mature: {animal.targetMatureWeightKg} kg)</span>
                    </div>
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
              {animal.purpose === 'Fattening' ? (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-amber-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🥩</span>
                    <span>{t('fattening', 'Fattening Stock')} ({localeText({ en: 'Meat / Market', hi: 'मांस व बिक्री', kn: 'ಮಾಂಸ / ಮಾರುಕಟ್ಟೆ', te: 'మాంసం / మార్కెట్', ta: 'இறைச்சி / சந்தை', ml: 'മാംസം / വിപണി', mr: 'मटण / बाजार' })})</span>
                  </span>
                  <span className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 px-2 py-0.5 rounded-full">
                    {t('familyTreeNotNeeded', 'Family tree not tracked')}
                  </span>
                </div>
              ) : animal.origin === 'Brought from Outside' && !animal.knowsParents && (!animal.sireName && !animal.damName) ? (
                <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs text-purple-950">
                  <span className="font-bold flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>{t('broughtFromOutside', 'Brought from Outside')} ({t('parentsUnknown', 'Foundation Stock')})</span>
                  </span>
                  <span className="text-[11px] text-purple-800 font-semibold bg-purple-100/70 px-2 py-0.5 rounded-full">
                    Parents unknown
                  </span>
                </div>
              ) : (
                <div className="pt-2 border-t border-amber-200/60 flex flex-wrap items-center justify-between text-xs text-stone-700">
                  <span>
                    <strong>Papa (Father):</strong> {animal.sireName || 'Foundation Sire'} {animal.sireTag ? `(${animal.sireTag})` : ''}
                  </span>
                  <span> · </span>
                  <span>
                    <strong>Mummy (Mother):</strong> {animal.damName || 'Foundation Dam'} {animal.damTag ? `(${animal.damTag})` : ''}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Responsive Navigation Tabs */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-2xl overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('lineage')}
              className={`flex-1 min-h-[38px] py-1.5 px-2 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'lineage'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>🌳</span>
              <span className="hidden sm:inline">Family (Papa & Mummy)</span>
              <span className="sm:hidden">Family</span>
            </button>
            <button
              onClick={() => setActiveTab('growth')}
              className={`flex-1 min-h-[38px] py-1.5 px-2 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'growth'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>⚖️</span>
              <span className="hidden sm:inline">Weight & Milk ({animal.growthHistory.length})</span>
              <span className="sm:hidden">Weight ({animal.growthHistory.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('health')}
              className={`flex-1 min-h-[38px] py-1.5 px-2 text-xs font-black rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'health'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>💉</span>
              <span className="hidden sm:inline">Vaccines & Health ({animalVacs.length + animalHealth.length})</span>
              <span className="sm:hidden">Health ({animalVacs.length})</span>
            </button>
          </div>

          {/* TAB 1: SIMPLE FAMILY TREE (PAPA & MUMMY) */}
          {activeTab === 'lineage' && (
            <div className="space-y-5">
              {animal.purpose === 'Fattening' ? (
                /* Fattening Animal Notice */
                <div className="p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-amber-200/80 text-3xl flex items-center justify-center mx-auto shadow-xs">
                    🥩
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-amber-950">
                      {t('familyTreeNotNeeded', 'Family tree is not tracked for fattening animals')}
                    </h3>
                    <p className="text-xs sm:text-sm text-amber-900 leading-relaxed font-medium">
                      {t('parentsNotTrackedFattening', 'Fattening animals are reared for meat and market; pedigree records are not needed.')}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto pt-2 text-left">
                    <div className="p-3 rounded-2xl bg-white border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Current Weight</span>
                      <span className="text-base font-black text-stone-900 font-mono">{animal.currentWeightKg} kg</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-white border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Target Weight</span>
                      <span className="text-base font-black text-emerald-800 font-mono">{animal.targetMatureWeightKg} kg</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-white border border-amber-200">
                      <span className="text-[10px] uppercase font-bold text-stone-500 block">Market Readiness</span>
                      <span className="text-base font-black text-amber-800 font-mono">
                        {Math.min(100, Math.round((animal.currentWeightKg / animal.targetMatureWeightKg) * 100))}%
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('growth')}
                    className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold cursor-pointer transition-all shadow-xs inline-flex items-center gap-1.5"
                  >
                    <span>⚖️ {localeText({ en: 'View Weight & Growth Records', hi: 'वजन व वृद्धि रिकॉर्ड देखें', kn: 'ತೂಕ ಮತ್ತು ಬೆಳವಣಿಗೆ ದಾಖಲೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ', te: 'బరువు & పెరుగుదల రికార్డులను చూడండి', ta: 'எடை மற்றும் வளர்ச்சி பதிவுகளைக் காண்க', ml: 'തൂക്കവും വളർച്ചയും കാണുക', mr: 'वजन व वाढीच्या नोंदी पहा' })}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : animal.origin === 'Brought from Outside' && !animal.knowsParents && (!animal.sireName && !animal.damName) ? (
                /* Brought from outside with unknown parents */
                <div className="p-5 rounded-3xl bg-purple-50/80 border-2 border-purple-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl shrink-0">🚚</span>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-purple-950">
                        {t('parentsUnknown', 'Parents Unknown (Foundation Stock)')}
                      </h4>
                      <p className="text-xs text-purple-900 mt-1 leading-relaxed font-medium">
                        {t('foundationStockDesc', 'Brought from outside with unknown ancestry. Serves as foundation breeding stock.')}
                      </p>
                      <div className="mt-2 text-xs text-purple-800 bg-white/80 p-2.5 rounded-xl border border-purple-200 font-medium">
                        ✓ {localeText({
                          en: 'Family tree does not show unverified or fake parents for market purchases. Kids and lambs born to this animal on your farm will establish its verified lineage below.',
                          hi: 'मंडी खरीद के लिए फर्जी या खाली माता-पिता नहीं दिखाए जाते। इस पशु से आपके फार्म पर जन्मे बच्चे नीचे दिखेंगे।',
                          kn: 'ಮಾರುಕಟ್ಟೆ ಖರೀದಿಗೆ ನಕಲಿ ಪೋಷಕರು ಕಾಣಿಸುವುದಿಲ್ಲ. ನಿಮ್ಮ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಜನಿಸಿದ ಮರಿಗಳು ಕೆಳಗೆ ದಾಖಲಾಗುತ್ತವೆ.',
                          te: 'సంత కొనుగోళ్లకు నకిలీ తల్లిదंड్రుల వివరాలు చూపబడవు. ఈ జీవానికి మీ ఫారమ్‌లో పుట్టిన పిల్లలు క్రింద కనిపిస్తాయి.',
                          ta: 'சந்தை வாங்குதல்களுக்கு போலி பெற்றோர் காட்டப்படாது. உங்கள் பண்ணையில் பிறந்த குட்டிகள் கீழே உள்ளன.',
                          ml: 'ചന്തയിൽ നിന്ന് വാങ്ങിയതിന് വ്യാജ രേഖകൾ ഉണ്ടാവില്ല. ഇവിടെ ജനിച്ച കുഞ്ഞുങ്ങൾ താഴെ കാണാം.',
                          mr: 'बाजार खरेदीसाठी खोटे आई-वडील दाखवले जात नाहीत. या जनावरापासून तुमच्या फार्मवर जन्मलेली करडे खाली दिसतील.'
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Full Family Tree with Papa & Mummy Cards */
                <>
                  <div>
                    <h3 className="text-base font-extrabold text-stone-900">
                      {t('familyTree', 'Animal Family Tree')}
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      See who the Papa (father) and Mummy (mother) are. Tap on them to see their records!
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Papa Card */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-700 uppercase">
                          🐐/🐑 Papa (Stud Buck / Ram)
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2 py-0.5 rounded border">
                          Tag #{animal.sireTag || 'FOUNDATION'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-stone-900">{animal.sireName || 'Foundation Sire'}</h4>
                      <p className="text-xs text-stone-600">Breed: {animal.sireBreed || 'Foundation Stock'}</p>

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
                          Foundation Sire from outside breed registry
                        </p>
                      )}
                    </div>

                    {/* Mummy Card */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-stone-50 border-2 border-stone-200 space-y-1.5 sm:space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-stone-700 uppercase">
                          🐐/🐑 Mummy (Doe / Ewe)
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2 py-0.5 rounded border">
                          Tag #{animal.damTag || 'FOUNDATION'}
                        </span>
                      </div>
                      <h4 className="text-sm sm:text-base font-black text-stone-900">{animal.damName || 'Foundation Dam'}</h4>
                      <p className="text-xs text-stone-600">Breed: {animal.damBreed || 'Foundation Stock'}</p>

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
                          Foundation Dam from outside breed registry
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* Good Traits Inherited */}
              <div className="space-y-2.5 sm:space-y-3">
                <h4 className="text-xs font-black uppercase text-stone-700">
                  Good Qualities from Papa & Mummy:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {(animal.inheritedTraits || []).map((t, idx) => (
                    <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-emerald-950">{t.traitName}</span>
                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          {t.scoreOrGrade}
                        </span>
                      </div>
                      <p className="text-xs text-stone-600">{t.impactDescription}</p>
                      <span className="text-[10px] text-stone-500 font-bold block pt-0.5">
                        Got from: {t.inheritedFrom === 'Sire' ? 'Papa' : t.inheritedFrom === 'Dam' ? 'Mummy' : 'Both Papa & Mummy'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Baby Offspring in Herd */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <h4 className="text-xs font-black uppercase text-stone-700">
                  Baby Kids & Lambs of {animal.name} on this Farm ({offspringInHerd.length})
                </h4>
                {offspringInHerd.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">
                    No baby kids or lambs registered for this animal yet. When you add a new kid or lamb, pick {animal.name} as the Papa or Mummy!
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
                        {t('bodyWeight', 'Body Weight')} (kg)
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
                        {t('dailyMilk', 'Daily Milk')} (L)
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
                {onOpenSymptomChecker && (
                  <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🩺</span>
                      <div>
                        <div className="text-xs font-black text-teal-950">
                          {animal.name} ({animal.tagId}) - {t('symptomChecker', 'Symptom Checker')}
                        </div>
                        <div className="text-[11px] text-teal-800 font-medium">
                          Check observed symptoms & view immediate offline first-aid advice.
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenSymptomChecker(animal.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-black shrink-0 cursor-pointer shadow-xs active:scale-95 transition-all"
                    >
                      {t('symptomChecker', 'Check Symptoms')}
                    </button>
                  </div>
                )}

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
                          <option value="Routine Checkup">{localeText({ en: 'General Health Check', hi: 'सामान्य स्वास्थ्य जांच', kn: 'ಸಾಮಾನ್ಯ ಆರೋಗ್ಯ ತಪಾಸಣೆ', te: 'సాధారణ ఆరోగ్య పరీక్ష', ta: 'பொது சுகாதார பரிசோதனை', ml: 'പൊതുവായ ആരോഗ്യ പരിശോധന', mr: 'सामान्य आरोग्य तपासणी' })}</option>
                          <option value="Treatment">{localeText({ en: 'Medicine Treatment', hi: 'दवा / उपचार', kn: 'ಔಷಧ ಚಿಕಿತ್ಸೆ', te: 'మందుల చికిత్స', ta: 'மருத்துவ சிகிச்சை', ml: 'മരുന്ന് ചികിത്സ', mr: 'औषधोपचार' })}</option>
                          <option value="Deworming">{t('deworming', 'Deworming')}</option>
                          <option value="Maternal / Birth">{localeText({ en: 'Baby Birth Checkup', hi: 'प्रसव व मेमना देखभाल', kn: 'ಹೆರಿಗೆ ಮತ್ತು ಮರಿ ಆರೈಕೆ', te: 'ప్రసవ మరియు పిల్లల సంరక్షణ', ta: 'பிரசவம் & குட்டி பராமரிப்பு', ml: 'പ്രസവവും കുഞ്ഞുങ്ങളുടെ പരിചരണവും', mr: 'प्रसूती व करडू काळजी' })}</option>
                          <option value="Hoof & Coat Care">{localeText({ en: 'Nails & Skin Care', hi: 'खुर व त्वचा देखभाल', kn: 'ಗೊರಸು ಮತ್ತು ಚರ್ಮದ ಆರೈಕೆ', te: 'డెక్కలు & చర్మ సంరక్షణ', ta: 'குளம்பு & தோல் பராமரிப்பு', ml: 'കുളമ്പും ചർമ്മ പരിചരണവും', mr: 'खूर व त्वचा काळजी' })}</option>
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

      {/* Edit Animal & Tag Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-amber-50 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏷️</span>
                <h3 className="font-black text-stone-900 text-base">Update Ear Tag & Animal Info</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="p-1.5 rounded-full hover:bg-stone-200 text-stone-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditAnimal} className="p-4 space-y-3.5 text-stone-900">
              {/* Ear Tag Number */}
              <div className="space-y-1">
                <label className="text-xs font-black text-stone-800 block">
                  Ear Tag Number (Update freely)
                </label>
                <input
                  type="text"
                  required
                  value={editTagId}
                  onChange={(e) => setEditTagId(e.target.value.toUpperCase())}
                  placeholder="e.g. GOAT-303, SHEEP-101, COW-55"
                  className="w-full px-3 py-2.5 rounded-xl border-2 border-amber-300 bg-amber-50/40 text-sm font-mono font-black text-stone-900 uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <p className="text-[11px] text-stone-500">
                  Update if this animal has a custom ear tag or belongs to a different series.
                </p>
              </div>

              {/* Animal Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">Animal Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900"
                />
              </div>

              {/* Species & Breed */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Animal Type</label>
                  <select
                    value={editSpecies}
                    onChange={(e) => setEditSpecies(e.target.value as Species)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  >
                    <option value="Goat">🐐 {t('goat', 'Goat')}</option>
                    <option value="Sheep">🐑 {t('sheep_single', 'Sheep')}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Breed</label>
                  <input
                    type="text"
                    value={editBreed}
                    onChange={(e) => setEditBreed(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  />
                </div>
              </div>

              {/* Gender & Shed */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Gender</label>
                  <select
                    value={editSex}
                    onChange={(e) => setEditSex(e.target.value as 'Female' | 'Male')}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Shed / Location</label>
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900"
                  />
                </div>
              </div>

              {/* Weight & Health */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Current Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editWeight}
                    onChange={(e) => setEditWeight(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono text-stone-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700 block">Health Status</label>
                  <select
                    value={editHealth}
                    onChange={(e) => setEditHealth(e.target.value as AnimalHealthStatus)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                  >
                    <option value="Healthy & Fit">🟢 Healthy & Fit</option>
                    <option value="Vaccine Due">💉 Vaccine Due</option>
                    <option value="Needs Medicine">💊 Needs Medicine</option>
                    <option value="Pregnant Care">🤰 Pregnant Care</option>
                    <option value="Under Observation">👀 Under Observation</option>
                  </select>
                </div>
              </div>

              {/* Purpose & Origin */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">{t('purpose', 'Animal Purpose')}</label>
                    <select
                      value={editPurpose}
                      onChange={(e) => setEditPurpose(e.target.value as AnimalPurpose)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    >
                      <option value="Breeding">🧬 {t('breeding', 'Breeding')}</option>
                      <option value="Fattening">🥩 {t('fattening', 'Fattening')}</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-stone-700 block">{t('origin', 'Animal Origin')}</label>
                    <select
                      value={editOrigin}
                      onChange={(e) => setEditOrigin(e.target.value as AnimalOrigin)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                    >
                      <option value="Born on Farm">🏡 {t('bornOnFarm', 'Born on Farm')}</option>
                      <option value="Brought from Outside">🚚 {t('broughtFromOutside', 'Brought from Outside')}</option>
                    </select>
                  </div>
                </div>

                {editPurpose === 'Breeding' && editOrigin === 'Brought from Outside' && (
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 pt-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editKnowsParents}
                      onChange={(e) => setEditKnowsParents(e.target.checked)}
                      className="w-4 h-4 rounded text-purple-700 focus:ring-purple-600"
                    />
                    <span>{t('knowParentsCheck', 'I know the parents of this animal')}</span>
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-xs cursor-pointer active:scale-98"
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
