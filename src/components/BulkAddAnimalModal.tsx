import React, { useState } from 'react';
import { Farm, User, Animal, Species, AnimalHealthStatus, AnimalMilkStatus } from '../types';
import { 
  COW_ILLUSTRATION, 
  GOAT_ILLUSTRATION, 
  SHEEP_ILLUSTRATION, 
  CHICKEN_ILLUSTRATION 
} from '../data/initialData';
import { useLanguage } from '../i18n/LanguageContext';
import { db } from '../services/db';
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

function getBreedsForSpecies(sp: Species): string[] {
  const live = db.getBreedNames(sp);
  if (live && live.length > 0) return live;
  if (sp === 'Goat') {
    return ['Sirohi Brown Goat', 'Jamnapari Goat', 'Barbari White Goat', 'Black Bengal Goat', 'Osmanabadi Goat', 'Boer Meat Goat', 'Beetal Goat', 'Sojat Goat'];
  }
  return ['Deccani Wool Sheep', 'Nellore Meat Sheep', 'Bellary Sheep', 'Mandya Sheep', 'Merino Sheep', 'Nali Carpet Sheep', 'Marwari Sheep'];
}

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
  const { t, localeText } = useLanguage();

  const availableSpecies: Species[] = ['Goat', 'Sheep'];

  const startingSpecies: Species = (initialSpecies && (initialSpecies === 'Goat' || initialSpecies === 'Sheep'))
    ? initialSpecies
    : 'Goat';

  const PRESET_QUANTITIES = [5, 10, 20, 25, 50, 100];

  const [species, setSpecies] = useState<Species>(startingSpecies);
  const [quantity, setQuantity] = useState<number>(10);
  const [isOthersMode, setIsOthersMode] = useState<boolean>(false);
  const [customQuantityInput, setCustomQuantityInput] = useState<string>('10');
  const [genderMode, setGenderMode] = useState<'all_female' | 'all_male' | 'split'>('all_female');
  const [femaleCount, setFemaleCount] = useState<number>(7);
  const [maleCount, setMaleCount] = useState<number>(3);

  // Details
  const [breed, setBreed] = useState<string>(() => getBreedsForSpecies(startingSpecies)[0] || 'Desi Local');
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
    const breeds = getBreedsForSpecies(newSpecies);
    setBreed(breeds[0] || 'Desi Local');
    
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

  const applyNewQuantity = (rawQ: number) => {
    const clamped = Math.max(1, Math.min(1000, Math.floor(rawQ) || 1));
    setQuantity(clamped);
    setCustomQuantityInput(String(clamped));
    if (genderMode === 'split') {
      const f = Math.max(1, Math.ceil(clamped * 0.7));
      const m = Math.max(0, clamped - f);
      setFemaleCount(f);
      setMaleCount(m);
    }
  };

  const handlePresetSelect = (q: number) => {
    setIsOthersMode(false);
    applyNewQuantity(q);
  };

  const handleSelectOther = () => {
    setIsOthersMode(true);
    setCustomQuantityInput(String(quantity));
  };

  const handleCustomQuantityChange = (valStr: string) => {
    // Strictly accept only numbers (digits 0-9)
    const cleaned = valStr.replace(/[^0-9]/g, '');

    if (cleaned === '') {
      setCustomQuantityInput('');
      return;
    }

    let parsed = parseInt(cleaned, 10);
    if (!isNaN(parsed)) {
      if (parsed > 1000) {
        parsed = 1000;
        setCustomQuantityInput('1000');
      } else {
        setCustomQuantityInput(cleaned);
      }
      if (parsed >= 1) {
        setQuantity(parsed);
        if (genderMode === 'split') {
          const f = Math.max(1, Math.ceil(parsed * 0.7));
          const m = Math.max(0, parsed - f);
          setFemaleCount(f);
          setMaleCount(m);
        }
      }
    }
  };

  const handleCustomQuantityBlur = () => {
    if (!customQuantityInput || parseInt(customQuantityInput, 10) < 1) {
      applyNewQuantity(1);
    } else {
      const parsed = Math.min(1000, Math.max(1, parseInt(customQuantityInput, 10)));
      applyNewQuantity(parsed);
    }
  };

  const handleGenderModeChange = (mode: 'all_female' | 'all_male' | 'split') => {
    setGenderMode(mode);
    if (mode === 'split') {
      const f = Math.max(1, Math.ceil(quantity * 0.7));
      const m = Math.max(0, quantity - f);
      setFemaleCount(f);
      setMaleCount(m);
    }
  };

  const handleFemaleCountChange = (newF: number) => {
    const clampedF = Math.max(0, Math.min(quantity, newF));
    setFemaleCount(clampedF);
    setMaleCount(quantity - clampedF);
  };

  const handleMaleCountChange = (newM: number) => {
    const clampedM = Math.max(0, Math.min(quantity, newM));
    setMaleCount(clampedM);
    setFemaleCount(quantity - clampedM);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQuantity = Math.max(1, Math.min(1000, quantity));
    if (finalQuantity <= 0) return;

    let actualFemales = femaleCount;
    let actualMales = maleCount;
    if (genderMode === 'split') {
      if (actualFemales + actualMales !== finalQuantity) {
        actualFemales = Math.max(0, Math.min(finalQuantity, femaleCount));
        actualMales = finalQuantity - actualFemales;
      }
    }

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
        sex = i < actualFemales ? 'Female' : 'Male';
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

  const finalQuantity = quantity;
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
              <span>{t('bulkTitle', 'Add Animals in Bulk')}</span>
            </h2>
            <p className="text-xs text-stone-900 font-bold mt-0.5">
              {t('bulkSubtitle', 'Quickly add goats or sheep in bulk (Phase 1 Tracker)')}
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
                    <span className="text-xs font-black">{sp === 'Goat' ? t('goat', 'Goat') : t('sheep_single', 'Sheep')}</span>
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

          {/* Step 2: Quantity Selection (Presets: 5, 10, 20, 25, 50, 100 & Other: 1 - 1000) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1">
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider">
                {localeText({
                  en: '2. How Many Animals? (Select 5, 10, 20, 25, 50, 100 or custom)',
                  hi: '2. कितने पशु जोड़ने हैं? (5, 10, 20, 25, 50, 100 या अन्य)',
                  kn: '2. ಎಷ್ಟು ಪ್ರಾಣಿಗಳನ್ನು ಸೇರಿಸಬೇಕು? (5, 10, 20, 25, 50, 100 ಅಥವಾ ಇತರೆ)',
                  te: '2. ఎన్ని జీవాలు చేర్చాలి? (5, 10, 20, 25, 50, 100 లేదా ఇతరులు)',
                  ta: '2. எத்தனை கால்நடைகள் சேர்க்க வேண்டும்? (5, 10, 20, 25, 50, 100 அல்லது மற்றவை)',
                  ml: '2. എത്ര മൃഗങ്ങളെ ചേർക്കണം? (5, 10, 20, 25, 50, 100 അല്ലെങ്കിൽ മറ്റുള്ളവ)',
                  mr: '2. किती जनावरे जोडायची? (5, 10, 20, 25, 50, 100 किंवा इतर)'
                })}
              </label>
              <div className="flex items-center gap-1.5">
                {finalQuantity % 2 !== 0 ? (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                    <span>⚡</span>
                    <span>{localeText({ en: 'Odd Number', hi: 'विषम संख्या', kn: 'ಬೆಸ ಸಂಖ್ಯೆ', te: 'బేసి సంఖ్య', ta: 'ஒற்றைப்படை எண்', ml: 'ഒറ്റ സംഖ്യ', mr: 'विषम संख्या' })}</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                    <span>⚖️</span>
                    <span>{localeText({ en: 'Even Number', hi: 'सम संख्या', kn: 'ಸಮ ಸಂಖ್ಯೆ', te: 'సరి సంఖ్య', ta: 'இரட்டைப்படை எண்', ml: 'ഇരട്ട സംഖ്യ', mr: 'सम संख्या' })}</span>
                  </span>
                )}
                <span className="text-xs font-mono font-black text-emerald-950 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                  Total: {finalQuantity} {species}s
                </span>
              </div>
            </div>

            {/* Presets: 5, 10, 20, 25, 50, 100, and Other */}
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
              {PRESET_QUANTITIES.map(q => {
                const isSelected = quantity === q && !isOthersMode;
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => handlePresetSelect(q)}
                    className={`py-2 px-1 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-300'
                        : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    <span>{q}</span>
                    <span className="text-[9px] block opacity-80">{species}s</span>
                  </button>
                );
              })}

              {/* 'Other' Button: Opens number text field (1 - 1000) */}
              <button
                type="button"
                onClick={handleSelectOther}
                className={`py-2 px-1 rounded-xl border text-xs font-black cursor-pointer transition-all ${
                  isOthersMode
                    ? 'border-purple-600 bg-purple-700 text-white shadow-xs scale-102 ring-2 ring-purple-300'
                    : 'border-purple-300 bg-purple-50 text-purple-950 hover:bg-purple-100'
                }`}
              >
                <span>Other ✍️</span>
                <span className="text-[9px] block opacity-80">1 - 1000</span>
              </button>
            </div>

            {/* Dedicated Custom / Other Quantity Text Field (Strictly Numbers, 1 - 1000) */}
            {isOthersMode ? (
              <div className="p-3 sm:p-3.5 rounded-2xl border-2 border-purple-500 bg-purple-50/60 shadow-xs space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <label htmlFor="custom-bulk-qty-input" className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                    <span>🔢</span>
                    <span>{localeText({
                      en: 'Enter Number of Animals (1 - 1000):',
                      hi: 'संख्या दर्ज करें (1 - 1000):',
                      kn: 'ಪ್ರಾಣಿಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ (1 - 1000):',
                      te: 'జీవాల సంఖ్యను నమోదు చేయండి (1 - 1000):',
                      ta: 'கால்நடைகளின் எண்ணிக்கையை உள்ளிடவும் (1 - 1000):',
                      ml: 'മൃഗങ്ങളുടെ എണ്ണം നൽകുക (1 - 1000):',
                      mr: 'जनावरांची संख्या प्रविष्ट करा (1 - 1000):'
                    })}</span>
                  </label>
                  <span className="text-[11px] text-purple-900 font-bold bg-purple-100 border border-purple-200 px-2 py-0.5 rounded-full">
                    {quantity} {species}s selected
                  </span>
                </div>

                <div className="relative">
                  <input
                    id="custom-bulk-qty-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoFocus
                    value={customQuantityInput}
                    onChange={(e) => handleCustomQuantityChange(e.target.value)}
                    onBlur={handleCustomQuantityBlur}
                    onKeyDown={(e) => {
                      const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'];
                      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
                        return;
                      }
                      if (!/^[0-9]$/.test(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter number (1 - 1000)..."
                    className="w-full pl-3.5 pr-20 py-2.5 rounded-xl border border-purple-300 bg-white font-mono text-base font-black text-stone-900 focus:outline-none focus:ring-2 focus:ring-purple-600 shadow-inner"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded">
                    {species}s
                  </span>
                </div>
                <p className="text-[11px] text-purple-800 font-medium">
                  Type any number from 1 to 1000. Only numbers are accepted.
                </p>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between text-xs text-stone-600">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-bold">✓</span>
                  <span>Preset chosen: <strong>{quantity} {species}s</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handleSelectOther}
                  className="text-purple-700 hover:text-purple-900 font-bold hover:underline cursor-pointer text-xs"
                >
                  Custom number? Click 'Other' (1-1000) &rarr;
                </button>
              </div>
            )}
          </div>

          {/* Step 3: Gender Breakdown (Supports Exact Odd Split) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
                3. Gender Selection
              </label>
              {genderMode === 'split' && (
                <span className="text-[11px] font-bold text-stone-500">
                  {femaleCount} ♀ + {maleCount} ♂ = {finalQuantity} Total
                </span>
              )}
            </div>

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
                ♀ All Females ({finalQuantity})
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
                ♂ All Males ({finalQuantity})
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
                ⚖️ Mixed Split
              </button>
            </div>

            {genderMode === 'split' && (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-700 block">{t('mummy', 'Females')}:</span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {Math.round((femaleCount / Math.max(1, finalQuantity)) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleFemaleCountChange(femaleCount - 1)}
                      disabled={femaleCount <= 0}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-sm min-w-6 text-center">{femaleCount}</span>
                    <button
                      type="button"
                      onClick={() => handleFemaleCountChange(femaleCount + 1)}
                      disabled={femaleCount >= finalQuantity}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 disabled:opacity-40 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-stone-700 block">{t('papa', 'Males')}:</span>
                    <span className="text-[10px] text-stone-400 font-medium">
                      {Math.round((maleCount / Math.max(1, finalQuantity)) * 100)}%
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleMaleCountChange(maleCount - 1)}
                      disabled={maleCount <= 0}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 disabled:opacity-40 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-mono font-black text-sm min-w-6 text-center">{maleCount}</span>
                    <button
                      type="button"
                      onClick={() => handleMaleCountChange(maleCount + 1)}
                      disabled={maleCount >= finalQuantity}
                      className="w-7 h-7 rounded-lg bg-stone-200 hover:bg-stone-300 font-bold text-stone-800 disabled:opacity-40 cursor-pointer"
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
                {getBreedsForSpecies(species).map(b => (
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
