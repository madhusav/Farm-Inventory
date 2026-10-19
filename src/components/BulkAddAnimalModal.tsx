import React, { useState } from 'react';
import { Farm, User, Animal, Species, AnimalHealthStatus, AnimalMilkStatus } from '../types';
import { 
  COW_ILLUSTRATION, 
  GOAT_ILLUSTRATION, 
  SHEEP_ILLUSTRATION, 
  CHICKEN_ILLUSTRATION 
} from '../data/initialData';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Check, Tag } from 'lucide-react';

interface BulkAddAnimalModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onBulkAdd: (animals: Animal[]) => void;
  initialSpecies?: Species;
}

const SPECIES_ILLUSTRATIONS: Record<string, string> = {
  Cow: COW_ILLUSTRATION,
  Goat: GOAT_ILLUSTRATION,
  Sheep: SHEEP_ILLUSTRATION,
  Chicken: CHICKEN_ILLUSTRATION,
  Buffalo: COW_ILLUSTRATION,
};

const BREED_SUGGESTIONS: Record<string, string[]> = {
  Goat: ['Sirohi Brown Goat', 'Jamnapari Goat', 'Barbari White Goat', 'Black Bengal Goat', 'Osmanabadi Goat', 'Boer Meat Goat', 'Beetal Goat', 'Sojat Goat'],
  Sheep: ['Deccani Wool Sheep', 'Nellore Meat Sheep', 'Bellary Sheep', 'Mandya Sheep', 'Merino Sheep', 'Nali Carpet Sheep', 'Marwari Sheep'],
};

function getSuggestedTagPrefix(sp: Species): string {
  if (sp === 'Sheep') return 'SHEEP-';
  return 'GOAT-';
}

function getSpeciesEmoji(sp: Species): string {
  if (sp === 'Sheep') return '🐑';
  return '🐐';
}

export const BulkAddAnimalModal: React.FC<BulkAddAnimalModalProps> = ({
  farm,
  currentUser,
  onClose,
  onBulkAdd,
  initialSpecies,
}) => {
  const { lang, t } = useLanguage();
  const isHi = lang === 'hi';

  const availableSpecies: Species[] = ['Goat', 'Sheep'];

  const startingSpecies: Species = (initialSpecies && (initialSpecies === 'Goat' || initialSpecies === 'Sheep'))
    ? initialSpecies
    : 'Goat';

  const [species, setSpecies] = useState<Species>(startingSpecies);
  const [quantity, setQuantity] = useState<number>(10);
  const [genderMode, setGenderMode] = useState<'all_female' | 'all_male' | 'split'>('all_female');
  const [femaleCount, setFemaleCount] = useState<number>(8);
  const [maleCount, setMaleCount] = useState<number>(2);

  // Details
  const [breed, setBreed] = useState<string>(BREED_SUGGESTIONS[startingSpecies]?.[0] || 'Desi Local');
  const [tagPrefix, setTagPrefix] = useState<string>(getSuggestedTagPrefix(startingSpecies));
  const [startTagNum, setStartTagNum] = useState<number>(() => {
    if (startingSpecies === 'Sheep') return 201;
    if (startingSpecies === 'Chicken') return 501;
    return 101;
  });
  const [avgWeight, setAvgWeight] = useState<number>(() => {
    if (startingSpecies === 'Goat') return 32;
    if (startingSpecies === 'Sheep') return 38;
    if (startingSpecies === 'Cow') return 350;
    if (startingSpecies === 'Buffalo') return 450;
    if (startingSpecies === 'Chicken') return 2.2;
    return 50;
  });
  const [shedLocation, setShedLocation] = useState<string>(() => {
    if (startingSpecies === 'Goat') return 'Goat Shed East';
    if (startingSpecies === 'Sheep') return 'Sheep Paddock Field';
    if (startingSpecies === 'Cow') return 'Cow Shed No. 1';
    if (startingSpecies === 'Buffalo') return 'Buffalo Shed';
    if (startingSpecies === 'Chicken') return 'Poultry Coop';
    return 'Main Yard';
  });
  const [healthStatus, setHealthStatus] = useState<AnimalHealthStatus>('Healthy & Fit');
  const [milkStatus, setMilkStatus] = useState<AnimalMilkStatus>('Giving Milk');

  // Species check: milk status ONLY for Cow or Buffalo
  const isDairySpecies = species === 'Cow' || species === 'Buffalo';

  const handleSpeciesChange = (newSpecies: Species) => {
    setSpecies(newSpecies);
    const breeds = BREED_SUGGESTIONS[newSpecies] || ['Local Desi Breed'];
    setBreed(breeds[0]);
    
    // Automatically update tag prefix to match selected species
    const newPrefix = getSuggestedTagPrefix(newSpecies);
    setTagPrefix(newPrefix);

    if (newSpecies === 'Goat') {
      setAvgWeight(32);
      setShedLocation('Goat Shed East');
      setStartTagNum(101);
    } else if (newSpecies === 'Sheep') {
      setAvgWeight(38);
      setShedLocation('Sheep Paddock Field');
      setStartTagNum(201);
    } else if (newSpecies === 'Cow') {
      setAvgWeight(350);
      setShedLocation('Cow Shed No. 1');
      setMilkStatus('Giving Milk');
      setStartTagNum(101);
    } else if (newSpecies === 'Buffalo') {
      setAvgWeight(450);
      setShedLocation('Buffalo Shed');
      setMilkStatus('Giving Milk');
      setStartTagNum(101);
    } else if (newSpecies === 'Chicken') {
      setAvgWeight(2.2);
      setShedLocation('Poultry Coop');
      setStartTagNum(501);
    } else {
      setAvgWeight(100);
      setShedLocation('Main Yard');
      setStartTagNum(101);
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
    let prodLabel = 'Growth & Health';
    let prodVal = 'Healthy Meat & Breeding';

    if (species === 'Cow') {
      targetMatureWeight = 450;
      prodLabel = 'Daily Milk';
      prodVal = '14 Litres / day';
    } else if (species === 'Buffalo') {
      targetMatureWeight = 550;
      prodLabel = 'Daily Milk';
      prodVal = '10 Litres / day';
    } else if (species === 'Goat') {
      targetMatureWeight = 55;
      prodLabel = 'Growth & Breeding';
      prodVal = 'Active Breeder';
    } else if (species === 'Sheep') {
      targetMatureWeight = 50;
      prodLabel = 'Yearly Wool';
      prodVal = '3.5 kg wool';
    } else if (species === 'Chicken') {
      targetMatureWeight = 2.5;
      prodLabel = 'Weekly Eggs';
      prodVal = '6 eggs/week';
    }

    const cleanPrefix = tagPrefix.trim().toUpperCase() || `${species.toUpperCase().slice(0, 4)}-`;

    for (let i = 0; i < finalQuantity; i++) {
      const tagNum = startTagNum + i;
      const tagId = `${cleanPrefix}${tagNum}`;
      
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
      let animalMilk: AnimalMilkStatus | undefined = undefined;
      let dailyLiters: number | undefined = undefined;

      // Milk status is ONLY for Cow or Buffalo
      if (isDairySpecies) {
        if (sex === 'Male') {
          animalStatus = 'Breeding Sire';
          animalMilk = 'Not Milking (Male/Kid)';
        } else {
          animalStatus = milkStatus === 'Giving Milk' ? 'Lactating' : 'Active';
          animalMilk = milkStatus;
          dailyLiters = milkStatus === 'Giving Milk' ? (species === 'Cow' ? 12 : 9) : 0;
        }
      } else if (sex === 'Male') {
        animalStatus = 'Breeding Sire';
      } else if (species === 'Chicken') {
        animalStatus = 'Laying';
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
        dateOfBirth: '2024-05-10',
        photoUrl: illustration,
        paddockLocation: shedLocation,
        status: animalStatus,
        healthStatus,
        milkStatus: animalMilk,
        dailyMilkLitres: dailyLiters,
        sireId: null,
        sireName: 'Foundation Sire',
        sireTag: `${cleanPrefix}SIRE`,
        sireBreed: breed,
        damId: null,
        damName: 'Foundation Dam',
        damTag: `${cleanPrefix}DAM`,
        damBreed: breed,
        inheritedTraits: [
          {
            traitName: 'Hardy Pasture Immunity',
            inheritedFrom: 'Both',
            scoreOrGrade: 'Strong Grade A',
            impactDescription: 'Naturally resilient against weather changes and common farm diseases.',
          },
        ],
        inbreedingCoefficientPct: 0.1,
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
            heightCm: Math.round(curWeight * 1.5),
            bodyConditionScore: 3.5,
            averageDailyGainG: 200,
            dailyYieldValue: dailyLiters || 0,
            dailyYieldUnit: isDairySpecies ? 'Litres' : 'Units',
            recordedBy: currentUser.name,
          },
        ],
      };

      generatedAnimals.push(newAnimal);
    }

    onBulkAdd(generatedAnimals);
    onClose();
  };

  const finalQuantity = genderMode === 'split' ? femaleCount + maleCount : quantity;
  const cleanPrefix = tagPrefix.trim().toUpperCase() || `${species.toUpperCase().slice(0, 4)}-`;
  const endTagNum = startTagNum + finalQuantity - 1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-700 text-stone-950 rounded-t-3xl sticky top-0 z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-950 flex items-center gap-2">
              <span>📦</span>
              <span>{isHi ? 'एक साथ कई पशु जोड़ें (Bulk Add)' : 'Add Animals in Bulk'}</span>
            </h2>
            <p className="text-xs text-stone-900 font-bold mt-0.5">
              {isHi ? 'बकरी व भेड़ 1 क्लिक में जोड़ें (Phase 1)' : 'Quickly add goats or sheep in bulk (Phase 1 Tracker)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/10 text-stone-950 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 text-stone-900">
          
          {/* Step 1: Choose Species (Goat & Sheep Phase) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                1. Choose Animal Type
              </label>
              <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-full">
                Phase 1: Goat & Sheep
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {availableSpecies.map(sp => {
                const isSelected = species === sp;
                const emoji = getSpeciesEmoji(sp);
                return (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => handleSpeciesChange(sp)}
                    className={`p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col items-center justify-center text-center ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 font-black shadow-xs scale-102'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold'
                    }`}
                  >
                    <span className="text-3xl mb-1">{emoji}</span>
                    <span className="text-xs font-black">{sp}</span>
                    <span className="text-[10px] text-stone-500 font-medium mt-0.5">
                      {sp === 'Goat' ? 'Sirohi, Jamnapari, Boer' : 'Deccani, Nellore, Bellary'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500 pt-1 font-medium flex items-center justify-between">
              <span>Looking for cattle or chickens?</span>
              <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 text-[10px]">
                Phase 2: Cattle & Poultry Coming Soon
              </span>
            </p>
          </div>

          {/* Step 2: Quantity Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider">
                2. How Many Animals?
              </label>
              <span className="text-xs font-mono font-black text-emerald-900 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                Total: {finalQuantity} {species}s
              </span>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-4 gap-2">
              {[5, 10, 20, 50].map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => handleQuantitySelect(q)}
                  className={`py-2 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                    quantity === q && genderMode !== 'split'
                      ? 'border-amber-500 bg-amber-500 text-stone-950 shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  +{q} {species}s
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Gender Breakdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
              3. Gender Selection
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleGenderModeChange('all_female')}
                className={`p-2 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'all_female'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                ♀ All Females
              </button>
              <button
                type="button"
                onClick={() => handleGenderModeChange('all_male')}
                className={`p-2 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'all_male'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                ♂ All Males
              </button>
              <button
                type="button"
                onClick={() => handleGenderModeChange('split')}
                className={`p-2 rounded-xl border text-xs font-bold text-center cursor-pointer transition-all ${
                  genderMode === 'split'
                    ? 'border-emerald-700 bg-emerald-100 text-emerald-950 font-black'
                    : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                }`}
              >
                ⚖️ Mixed
              </button>
            </div>

            {genderMode === 'split' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Females:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSplitChange(Math.max(1, femaleCount - 1), maleCount)}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-sm w-6 text-center">{femaleCount}</span>
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount + 1, maleCount)}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700">Males:</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount, Math.max(0, maleCount - 1))}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-sm w-6 text-center">{maleCount}</span>
                    <button
                      type="button"
                      onClick={() => handleSplitChange(femaleCount, maleCount + 1)}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step 4: Tag Configuration & Live Ear Tag Preview */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 border-2 border-amber-300/80 space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-black text-amber-950 uppercase tracking-wider">
              <Tag className="w-4 h-4 text-amber-700" />
              <span>4. Ear Tag Configuration (Customizable)</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {/* Tag Prefix Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">
                  Tag Prefix (e.g. {getSuggestedTagPrefix(species)})
                </label>
                <input
                  type="text"
                  value={tagPrefix}
                  onChange={(e) => setTagPrefix(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-xs font-mono font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 uppercase"
                  placeholder="e.g. GOAT-"
                />
              </div>

              {/* Starting Number Input */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-stone-700 block">
                  Starting Tag Number
                </label>
                <input
                  type="number"
                  min="1"
                  value={startTagNum}
                  onChange={(e) => setStartTagNum(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border-2 border-amber-300 bg-white text-xs font-mono font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
              </div>
            </div>

            {/* Live Tag Range Preview Box */}
            <div className="p-2.5 rounded-xl bg-white border border-amber-200">
              <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                <span>🏷️ Live Ear Tags Generated:</span>
                <span className="font-mono text-emerald-900 font-black">
                  {cleanPrefix}{startTagNum} → {cleanPrefix}{endTagNum}
                </span>
              </div>
              <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[11px] font-bold">
                  #{cleanPrefix}{startTagNum}
                </span>
                {finalQuantity > 2 && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[11px] font-bold">
                    #{cleanPrefix}{startTagNum + 1}
                  </span>
                )}
                {finalQuantity > 3 && (
                  <span className="text-stone-400 font-mono text-[11px] self-center">
                    ... +{finalQuantity - 2} more ...
                  </span>
                )}
                {finalQuantity > 1 && (
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-950 font-mono text-[11px] font-bold">
                    #{cleanPrefix}{endTagNum}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Step 5: Breed & Shed Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Breed</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 focus:ring-2 focus:ring-emerald-700"
              >
                {(BREED_SUGGESTIONS[species] || ['Desi Local Breed']).map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Shed or Pen Location</label>
              <input
                type="text"
                value={shedLocation}
                onChange={(e) => setShedLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-700"
                placeholder="e.g. Goat Shed East, Pen 2"
              />
            </div>
          </div>

          {/* Step 6: Health & Milk Status (Milk Status ONLY for Cow or Buffalo) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200">
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700">Health Status</label>
              <select
                value={healthStatus}
                onChange={(e) => setHealthStatus(e.target.value as AnimalHealthStatus)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
              >
                <option value="Healthy & Fit">🟢 Healthy & Fit</option>
                <option value="Vaccine Due">💉 Vaccine Due Soon</option>
                <option value="Needs Medicine">💊 Needs Medicine</option>
                <option value="Pregnant Care">🤰 Pregnant Care</option>
              </select>
            </div>

            {/* Milk Status ONLY for Cow or Buffalo */}
            {isDairySpecies ? (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Milk Status (Cows/Buffaloes)</label>
                <select
                  value={milkStatus}
                  onChange={(e) => setMilkStatus(e.target.value as AnimalMilkStatus)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                >
                  <option value="Giving Milk">🥛 Giving Milk</option>
                  <option value="Dry Period">🥥 Dry Period</option>
                </select>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Average Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={avgWeight}
                  onChange={(e) => setAvgWeight(parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900"
                />
              </div>
            )}
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-98 transition-all"
            >
              <Check className="w-5 h-5" />
              <span>
                Add {finalQuantity} {species}s with Tags #{cleanPrefix}{startTagNum} - #{cleanPrefix}{endTagNum}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
