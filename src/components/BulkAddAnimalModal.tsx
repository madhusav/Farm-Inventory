import React, { useState } from 'react';
import { Farm, User, Animal, Species, AnimalHealthStatus, AnimalMilkStatus } from '../types';
import { 
  COW_ILLUSTRATION, 
  GOAT_ILLUSTRATION, 
  SHEEP_ILLUSTRATION, 
  CHICKEN_ILLUSTRATION 
} from '../data/initialData';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Sparkles, Check, ChevronRight } from 'lucide-react';

interface BulkAddAnimalModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onBulkAdd: (animals: Animal[]) => void;
}

const SPECIES_ILLUSTRATIONS: Record<string, string> = {
  Cow: COW_ILLUSTRATION,
  Goat: GOAT_ILLUSTRATION,
  Sheep: SHEEP_ILLUSTRATION,
  Chicken: CHICKEN_ILLUSTRATION,
  Buffalo: COW_ILLUSTRATION,
};

const BREED_SUGGESTIONS: Record<string, string[]> = {
  Goat: ['Sirohi Brown Goat', 'Jamnapari Goat', 'Barbari White Goat', 'Black Bengal Goat', 'Osmanabadi Goat', 'Boer Goat'],
  Sheep: ['Deccani Wool Sheep', 'Nellore Meat Sheep', 'Bellary Sheep', 'Mandya Sheep', 'Merino Sheep'],
  Cow: ['Gir Cow (Desi)', 'Sahiwal Dairy Cow', 'Red Sindhi Cow', 'Tharparkar Cow', 'Kankrej Cow', 'Jersey Cross'],
  Chicken: ['Aseel Desi Hen', 'Kadaknath Black Chicken', 'BV380 Egg Layer', 'Gramapriya Country Hen', 'Rainbow Rooster'],
  Buffalo: ['Murrah Dairy Buffalo', 'Mehsana Buffalo', 'Jaffarabadi Buffalo', 'Surti Buffalo'],
};

export const BulkAddAnimalModal: React.FC<BulkAddAnimalModalProps> = ({
  farm,
  currentUser,
  onClose,
  onBulkAdd,
}) => {
  const { t } = useLanguage();

  // Species available on this farm
  const availableSpecies = farm.primarySpecies.length > 0 
    ? farm.primarySpecies 
    : ['Cow', 'Goat', 'Sheep', 'Chicken'];

  const [species, setSpecies] = useState<Species>(availableSpecies.includes('Goat') ? 'Goat' : availableSpecies[0]);
  const [quantity, setQuantity] = useState<number>(10);
  const [genderMode, setGenderMode] = useState<'all_female' | 'all_male' | 'split'>('all_female');
  const [femaleCount, setFemaleCount] = useState<number>(8);
  const [maleCount, setMaleCount] = useState<number>(2);

  // Details
  const [breed, setBreed] = useState<string>('Sirohi Brown Goat');
  const [tagPrefix, setTagPrefix] = useState<string>('GOAT-');
  const [startTagNum, setStartTagNum] = useState<number>(101);
  const [avgWeight, setAvgWeight] = useState<number>(32);
  const [shedLocation, setShedLocation] = useState<string>('Goat Shed East');
  const [healthStatus, setHealthStatus] = useState<AnimalHealthStatus>('Healthy & Fit');
  const [milkStatus, setMilkStatus] = useState<AnimalMilkStatus>('Giving Milk');

  // When species changes, update sensible defaults
  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const breeds = BREED_SUGGESTIONS[newSpecies] || ['Local Desi Breed'];
    setBreed(breeds[0]);
    if (newSpecies === 'Goat') {
      setTagPrefix('GOAT-');
      setAvgWeight(32);
      setShedLocation('Goat Shed East');
      setMilkStatus('Giving Milk');
    } else if (newSpecies === 'Sheep') {
      setTagPrefix('SHEEP-');
      setAvgWeight(38);
      setShedLocation('Meadow Pasture Field');
      setMilkStatus('Dry Period');
    } else if (newSpecies === 'Cow') {
      setTagPrefix('COW-');
      setAvgWeight(350);
      setShedLocation('Shed No. 1');
      setMilkStatus('Giving Milk');
    } else if (newSpecies === 'Chicken') {
      setTagPrefix('HEN-');
      setAvgWeight(2.2);
      setShedLocation('Backyard Coop');
      setMilkStatus('Laying Eggs');
    } else {
      setTagPrefix(`${newSpecies.toUpperCase().slice(0, 4)}-`);
      setAvgWeight(400);
      setShedLocation('Main Yard');
      setMilkStatus('Giving Milk');
    }
  };

  const handleGenderModeChange = (mode: 'all_female' | 'all_male' | 'split') => {
    setGenderMode(mode);
    if (mode === 'split') {
      const f = Math.max(1, Math.floor(quantity * 0.8));
      const m = Math.max(1, quantity - f);
      setFemaleCount(f);
      setMaleCount(m);
    }
  };

  const handleQuantitySelect = (q: number) => {
    setQuantity(q);
    if (genderMode === 'split') {
      const f = Math.max(1, Math.floor(q * 0.8));
      const m = Math.max(1, q - f);
      setFemaleCount(f);
      setMaleCount(m);
    }
  };

  const handleSplitChange = (f: number, m: number) => {
    setFemaleCount(f);
    setMaleCount(m);
    setQuantity(f + m);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuantity = genderMode === 'split' ? femaleCount + maleCount : quantity;
    if (finalQuantity <= 0) return;

    const generatedAnimals: Animal[] = [];
    const today = new Date().toISOString().split('T')[0];
    const illustration = SPECIES_ILLUSTRATIONS[species] || COW_ILLUSTRATION;

    let targetMatureWeight = avgWeight * 1.25;
    let prodLabel = 'Daily Milk';
    let prodVal = '2.5 L/day';
    if (species === 'Cow') {
      targetMatureWeight = 420;
      prodLabel = 'Daily Fresh Milk';
      prodVal = '14 Litres / day';
    } else if (species === 'Goat') {
      targetMatureWeight = 55;
      prodLabel = 'Daily Goat Milk';
      prodVal = '2.0 Litres / day';
    } else if (species === 'Sheep') {
      targetMatureWeight = 48;
      prodLabel = 'Yearly Wool';
      prodVal = '3.5 kg wool';
    } else if (species === 'Chicken') {
      targetMatureWeight = 2.5;
      prodLabel = 'Eggs Per Week';
      prodVal = '6 eggs/week';
    }

    for (let i = 0; i < finalQuantity; i++) {
      const tagNum = startTagNum + i;
      const tagId = `${tagPrefix}${tagNum}`;
      
      // Determine gender
      let sex: 'Female' | 'Male' = 'Female';
      if (genderMode === 'all_male') {
        sex = 'Male';
      } else if (genderMode === 'split') {
        sex = i < femaleCount ? 'Female' : 'Male';
      }

      // Name
      const animalName = `${breed.split(' ')[0]} #${tagNum}`;

      // Status
      let animalStatus: Animal['status'] = 'Active';
      let animalMilk: AnimalMilkStatus = milkStatus;
      if (sex === 'Male') {
        animalStatus = 'Breeding Sire';
        animalMilk = 'Not Milking (Male/Kid)';
      } else if (species === 'Chicken') {
        animalStatus = 'Laying';
        animalMilk = 'Laying Eggs';
      } else if (species === 'Cow' || species === 'Goat') {
        animalStatus = animalMilk === 'Giving Milk' ? 'Lactating' : 'Active';
      }

      // Weight variation (+/- 5%)
      const weightVariation = (Math.sin(i * 1.5) * 0.05 + 1);
      const curWeight = Math.round(avgWeight * weightVariation * 10) / 10;

      const newAnimal: Animal = {
        id: `anim-bulk-${Date.now()}-${i}`,
        tagId,
        name: animalName,
        species,
        breed,
        sex,
        dateOfBirth: '2024-05-10', // Approx 2 years old
        photoUrl: illustration,
        paddockLocation: shedLocation,
        status: animalStatus,
        healthStatus,
        milkStatus: animalMilk,
        dailyMilkLitres: sex === 'Female' && (species === 'Cow' || species === 'Goat') ? (species === 'Cow' ? 14 : 2) : undefined,
        sireId: null,
        sireName: 'Foundation Sire',
        sireTag: `${tagPrefix}SIRE`,
        sireBreed: breed,
        damId: null,
        damName: 'Foundation Dam',
        damTag: `${tagPrefix}DAM`,
        damBreed: breed,
        inheritedTraits: [
          {
            traitName: 'Hardy Local Immunity',
            inheritedFrom: 'Both',
            scoreOrGrade: 'Strong Grade A',
            impactDescription: 'Naturally strong against climate changes and pasture ticks.',
          },
        ],
        inbreedingCoefficientPct: 0.2,
        birthWeightKg: Math.round(avgWeight * 0.1 * 10) / 10,
        currentWeightKg: curWeight,
        targetMatureWeightKg: Math.round(targetMatureWeight),
        productivityLabel: prodLabel,
        currentProductivityValue: sex === 'Male' ? 'Breeding Sire' : prodVal,
        createdAt: today,
        createdBy: currentUser.name,
        growthHistory: [
          {
            id: `gm-bulk-${Date.now()}-${i}`,
            date: today,
            weightKg: curWeight,
            heightCm: species === 'Cow' ? 130 : species === 'Goat' ? 65 : 60,
            bodyConditionScore: 3.5,
            averageDailyGainG: 100,
            dailyYieldValue: sex === 'Female' ? (species === 'Cow' ? 14 : 2) : 0,
            dailyYieldUnit: species === 'Chicken' ? 'eggs/wk' : 'Litres/day',
            recordedBy: currentUser.name,
            notes: 'Bulk intake recorded into farm inventory.',
          },
        ],
      };

      generatedAnimals.push(newAnimal);
    }

    onBulkAdd(generatedAnimals);
    onClose();
  };

  const currentTotal = genderMode === 'split' ? femaleCount + maleCount : quantity;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📦</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {t('bulkTitle', 'Add Animals in Bulk (झुंड जोड़ें)')}
              </h2>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                {t('bulkSubtitle', 'Add multiple goats, sheep, cows, or chickens in one click!')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-6">
          
          {/* Step 1: Choose Animal Type */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>1. {t('selectAnimalType', 'Which animals to add?')}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'Goat', label: t('goats', 'Goats (बकरियां)'), icon: '🐐' },
                { id: 'Sheep', label: t('sheep', 'Sheep (भेड़ें)'), icon: '🐑' },
                { id: 'Cow', label: t('cows', 'Cows (गायें)'), icon: '🐄' },
                { id: 'Chicken', label: t('chickens', 'Chickens (मुर्गियां)'), icon: '🐔' },
              ].map(opt => {
                const isSelected = species === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => handleSpeciesChange(opt.id as Species)}
                    className={`p-3 rounded-2xl border-2 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:border-stone-300 text-stone-700 font-bold'
                    }`}
                  >
                    <span className="text-3xl">{opt.icon}</span>
                    <span className="text-xs leading-tight">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: How Many Animals? (Quantity) */}
          <div className="space-y-2.5">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center justify-between">
              <span>2. {t('quantity', 'How many animals? (संख्या)')}</span>
              <span className="text-sm font-black text-emerald-800 font-mono">
                Total: {currentTotal} {species}s
              </span>
            </label>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[5, 10, 20, 25, 50].map(q => (
                <button
                  type="button"
                  key={q}
                  onClick={() => handleQuantitySelect(q)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    quantity === q && genderMode !== 'split'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                  }`}
                >
                  +{q}
                </button>
              ))}
              <div className="flex items-center gap-1.5 ml-auto">
                <span className="text-xs text-stone-500 font-bold">Or write exact number:</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={quantity}
                  onChange={(e) => handleQuantitySelect(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2.5 py-1.5 rounded-xl border border-stone-300 font-mono font-black text-center text-sm focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Gender (Boy or Girl?) */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-[#FFFDF7] border border-amber-200">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>3. {t('genderBreakdown', 'Gender (लिंग - नर या मादा?)')}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleGenderModeChange('all_female')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'all_female'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                🌸 {t('allFemale', 'All Females (सभी मादा)')}
              </button>

              <button
                type="button"
                onClick={() => handleGenderModeChange('all_male')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'all_male'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                🌿 {t('allMale', 'All Males (सभी नर)')}
              </button>

              <button
                type="button"
                onClick={() => handleGenderModeChange('split')}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'split'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                ⚖️ {t('splitGender', 'Mixed (Females + Males)')}
              </button>
            </div>

            {/* If split, show fine-grained steppers */}
            {genderMode === 'split' && (
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">Females (मादा)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleSplitChange(Math.max(1, femaleCount - 1), maleCount)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-800"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-base text-stone-900">
                      {femaleCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount + 1, maleCount)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-stone-200">
                  <span className="text-[11px] font-bold text-stone-600 block">Males (नर)</span>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount, Math.max(0, maleCount - 1))}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-800"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center font-mono font-black text-base text-stone-900">
                      {maleCount}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount, maleCount + 1)}
                      className="w-8 h-8 rounded-lg bg-stone-100 hover:bg-stone-200 font-bold text-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Breed, Ear Tag & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Breed */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('breed', 'Breed (नस्ल)')}
              </label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 focus:ring-2 focus:ring-emerald-700"
              >
                {(BREED_SUGGESTIONS[species] || ['Desi Local']).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Tag Prefix */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('tagPrefix', 'Tag Code Prefix (e.g. GOAT-)')}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagPrefix}
                  onChange={(e) => setTagPrefix(e.target.value.toUpperCase())}
                  className="w-28 px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold text-stone-900 focus:ring-2 focus:ring-emerald-700"
                />
                <span className="text-xs text-stone-500 font-mono">Starts from #{startTagNum}</span>
              </div>
            </div>

            {/* Average Weight */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('startingWeight', 'Average Weight (kg)')}
              </label>
              <input
                type="number"
                step="0.1"
                value={avgWeight}
                onChange={(e) => setAvgWeight(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Shed Location */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('shedLocation', 'Shed or Pasture Field')}
              </label>
              <input
                type="text"
                value={shedLocation}
                onChange={(e) => setShedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-700"
                placeholder="e.g. Shed No. 2, Pasture Field"
              />
            </div>
          </div>

          {/* Step 5: Initial Health & Milk Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('healthStatus', 'Health Status')}
              </label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as AnimalHealthStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
              >
                <option value="Healthy & Fit">🟢 {t('healthy', 'Healthy & Fit (बिल्कुल तंदुरुस्त)')}</option>
                <option value="Vaccine Due">💉 {t('vaccineDue', 'Vaccine Due Soon (टीका बाकी)')}</option>
                <option value="Needs Medicine">💊 {t('needsCare', 'Needs Medicine (दवा की जरूरत)')}</option>
                <option value="Pregnant Care">🤰 {t('pregnant', 'Pregnant Care (गाभिन)')}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">
                {t('milkStatus', 'Milk / Production Status')}
              </label>
              <select
                value={milkStatus}
                onChange={(e) => setMilkStatus(e.target.value as AnimalMilkStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
              >
                {species === 'Chicken' ? (
                  <>
                    <option value="Laying Eggs">🥚 {t('laying', 'Laying Eggs (अंडे दे रही है)')}</option>
                    <option value="Rest Period">🐣 {t('notLaying', 'Rest Period (आराम)')}</option>
                  </>
                ) : (
                  <>
                    <option value="Giving Milk">🥛 {t('milking', 'Giving Milk (दूध दे रही है)')}</option>
                    <option value="Dry Period">🥥 {t('dry', 'Dry Period (सूखी अवधि)')}</option>
                    <option value="Not Milking (Male/Kid)">🐂 {t('notLaying', 'Not Milking (Male/Young)')}</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
            <span className="text-[11px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Preview of Generated Animals:</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="font-mono font-black text-emerald-950 block">{tagPrefix}{startTagNum}</span>
                <span className="text-stone-600 text-[11px]">{breed} · {genderMode === 'all_male' ? 'Male' : 'Female'}</span>
                <span className="text-stone-500 text-[10px] block mt-0.5">⚖️ {avgWeight} kg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200">
                <span className="font-mono font-black text-emerald-950 block">{tagPrefix}{startTagNum + 1}</span>
                <span className="text-stone-600 text-[11px]">{breed} · {genderMode === 'all_male' ? 'Male' : 'Female'}</span>
                <span className="text-stone-500 text-[10px] block mt-0.5">⚖️ {avgWeight} kg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-stone-500 text-xs font-bold">
                + and {currentTotal - 2 > 0 ? currentTotal - 2 : 0} more animals...
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{t('bulkAddBtn', `Add All ${currentTotal} Animals to Farm`)}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
