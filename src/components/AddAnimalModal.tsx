import React, { useState } from 'react';
import { Animal, Species, Farm, User, AnimalPurpose, AnimalOrigin } from '../types';
import { db } from '../services/db';
import { 
  COW_ILLUSTRATION, 
  GOAT_ILLUSTRATION, 
  SHEEP_ILLUSTRATION, 
  CHICKEN_ILLUSTRATION 
} from '../data/initialData';
import { X, Plus, Camera, Sparkles, Check, Info } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface AddAnimalModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onAddAnimal: (newAnimal: Animal) => void;
}

const SPECIES_ILLUSTRATIONS: Record<string, string> = {
  Cow: COW_ILLUSTRATION,
  Goat: GOAT_ILLUSTRATION,
  Sheep: SHEEP_ILLUSTRATION,
  Chicken: CHICKEN_ILLUSTRATION,
  Buffalo: COW_ILLUSTRATION,
};

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  farm,
  currentUser,
  onClose,
  onAddAnimal,
}) => {
  const { t, lang, localeText } = useLanguage();
  const [species, setSpecies] = useState<Species>('Goat');
  const [tagId, setTagId] = useState(() => `GOAT-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Sirohi Brown Goat');
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [dateOfBirth, setDateOfBirth] = useState('2025-06-15');
  const [paddockLocation, setPaddockLocation] = useState('Goat Shed East');
  const [status, setStatus] = useState<Animal['status']>('Active');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');

  // Purpose & Origin (Breeding vs Fattening, Born on Farm vs Brought from Outside)
  const [purpose, setPurpose] = useState<AnimalPurpose>('Breeding');
  const [origin, setOrigin] = useState<AnimalOrigin>('Born on Farm');
  const [knowsParents, setKnowsParents] = useState<boolean>(false);

  // Parent Sire & Dam
  const [selectedSireId, setSelectedSireId] = useState<string>('custom');
  const [customSireName, setCustomSireName] = useState('Raja Buck');
  const [customSireTag, setCustomSireTag] = useState('BUCK-102');
  
  const [selectedDamId, setSelectedDamId] = useState<string>('custom');
  const [customDamName, setCustomDamName] = useState('Munni Doe');
  const [customDamTag, setCustomDamTag] = useState('GOAT-101');

  const [birthWeightKg, setBirthWeightKg] = useState('3.2');
  const [currentWeightKg, setCurrentWeightKg] = useState('32');
  const [targetMatureWeightKg, setTargetMatureWeightKg] = useState('55');
  const [productivityValue, setProductivityValue] = useState('Twin Kids Breeder');
  const [traitName, setTraitName] = useState('Twins giving ability & fast growth');

  const handleSpeciesSelect = (sp: Species) => {
    setSpecies(sp);
    if (sp === 'Sheep') {
      setTagId(`SHEEP-${Math.floor(200 + Math.random() * 800)}`);
      setBreed('Deccani Sheep');
      setBirthWeightKg('3.5');
      setCurrentWeightKg('38');
      setTargetMatureWeightKg('50');
      setProductivityValue('3.8 kg Wool / year');
      setPaddockLocation('Sheep Pasture Field');
      setTraitName('Thick clean wool & meat build');
      setCustomSireName('Sultan Ram');
      setCustomSireTag('RAM-202');
      setCustomDamName('Rani Ewe');
      setCustomDamTag('SHEEP-201');
    } else {
      setTagId(`GOAT-${Math.floor(100 + Math.random() * 900)}`);
      setBreed('Sirohi Brown Goat');
      setBirthWeightKg('3.2');
      setCurrentWeightKg('32');
      setTargetMatureWeightKg('55');
      setProductivityValue('Twin Kids Breeder');
      setPaddockLocation('Goat Shed East');
      setTraitName('Twins giving ability & fast growth');
      setCustomSireName('Raja Buck');
      setCustomSireTag('BUCK-102');
      setCustomDamName('Munni Doe');
      setCustomDamTag('GOAT-101');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCustomPhotoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isFattening = purpose === 'Fattening';
    const isBornOnFarm = origin === 'Born on Farm';
    // If breeding and born on farm, parents are tracked by default.
    // If brought from outside, only tracked if knowsParents is true.
    const shouldTrackParents = !isFattening && (isBornOnFarm || knowsParents);

    const sireObj = shouldTrackParents && selectedSireId !== 'custom' 
      ? farm.animals.find(a => a.id === selectedSireId) 
      : undefined;
    const damObj = shouldTrackParents && selectedDamId !== 'custom' 
      ? farm.animals.find(a => a.id === selectedDamId) 
      : undefined;

    const sName = shouldTrackParents 
      ? (sireObj ? sireObj.name : customSireName.trim() || undefined)
      : undefined;
    const sTag = shouldTrackParents 
      ? (sireObj ? sireObj.tagId : customSireTag.trim() || undefined)
      : undefined;
    const sBreed = shouldTrackParents 
      ? (sireObj ? sireObj.breed : breed)
      : undefined;

    const dName = shouldTrackParents 
      ? (damObj ? damObj.name : customDamName.trim() || undefined)
      : undefined;
    const dTag = shouldTrackParents 
      ? (damObj ? damObj.tagId : customDamTag.trim() || undefined)
      : undefined;
    const dBreed = shouldTrackParents 
      ? (damObj ? damObj.breed : breed)
      : undefined;

    const bw = parseFloat(birthWeightKg) || 5;
    const cw = parseFloat(currentWeightKg) || 50;
    const tw = parseFloat(targetMatureWeightKg) || 100;
    const isDairy = species === 'Cow' || species === 'Buffalo';

    // Tailored traits based on purpose & origin
    let traits = [
      {
        traitName: traitName.trim() || (isFattening ? 'Rapid Weight Gain' : 'Healthy Family Line'),
        inheritedFrom: (isFattening ? 'Both' : (sName && dName ? 'Both' : 'Sire')) as 'Sire' | 'Dam' | 'Both',
        scoreOrGrade: isFattening ? 'Fattening Grade A' : '5 Stars ★★★★★',
        impactDescription: isFattening 
          ? 'Fast meat growth and feed conversion for market.'
          : (shouldTrackParents 
              ? `Lineage from ${sName || 'Father'} and ${dName || 'Mother'}.`
              : 'Foundation breeding stock brought from outside without parental records.'),
      },
    ];

    const newAnimal: Animal = {
      id: `anim-${Date.now()}`,
      tagId: tagId.trim().toUpperCase(),
      name: name.trim() || `${breed} #${tagId.trim().toUpperCase()}`,
      species,
      breed: breed.trim(),
      sex,
      dateOfBirth,
      photoUrl: customPhotoUrl || SPECIES_ILLUSTRATIONS[species] || COW_ILLUSTRATION,
      paddockLocation: paddockLocation.trim(),
      purpose,
      origin,
      knowsParents: isFattening ? false : (isBornOnFarm ? true : knowsParents),
      status,
      sireId: shouldTrackParents && sireObj ? sireObj.id : null,
      sireName: sName,
      sireTag: sTag,
      sireBreed: sBreed,
      damId: shouldTrackParents && damObj ? damObj.id : null,
      damName: dName,
      damTag: dTag,
      damBreed: dBreed,
      inheritedTraits: traits,
      inbreedingCoefficientPct: isFattening ? 0 : (shouldTrackParents ? 0.5 : 0),
      birthWeightKg: bw,
      currentWeightKg: cw,
      targetMatureWeightKg: tw,
      productivityLabel: isFattening
        ? 'Market Readiness'
        : species === 'Cow' || species === 'Buffalo'
        ? 'Daily Milk' 
        : species === 'Goat' 
        ? 'Kids & Breeding' 
        : species === 'Sheep' 
        ? 'Yearly Wool' 
        : 'Eggs Each Week',
      currentProductivityValue: isFattening ? `${cw} kg (Fattening)` : productivityValue,
      healthStatus: 'Healthy & Fit',
      milkStatus: isDairy 
        ? (sex === 'Male' ? 'Not Milking (Male/Kid)' : 'Giving Milk')
        : undefined,
      dailyMilkLitres: isDairy && sex === 'Female' 
        ? (parseFloat(productivityValue) || (species === 'Cow' ? 12 : 9))
        : undefined,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: currentUser.name,
      growthHistory: [
        {
          id: `gm-${Date.now()}-1`,
          date: dateOfBirth,
          weightKg: bw,
          heightCm: species === 'Chicken' ? 12 : 55,
          bodyConditionScore: 3.5,
          averageDailyGainG: species === 'Chicken' ? 10 : 400,
          dailyYieldValue: 0,
          dailyYieldUnit: species === 'Chicken' ? 'eggs/wk' : 'Litres/day',
          recordedBy: currentUser.name,
          recordedById: currentUser.id,
          notes: 'Baby birth weight check.',
        },
        {
          id: `gm-${Date.now()}-2`,
          date: new Date().toISOString().split('T')[0],
          weightKg: cw,
          heightCm: species === 'Chicken' ? 32 : 125,
          bodyConditionScore: 3.6,
          averageDailyGainG: species === 'Chicken' ? 10 : 420,
          dailyYieldValue: parseFloat(productivityValue) || 12,
          dailyYieldUnit: species === 'Chicken' ? 'eggs/wk' : 'Litres/day',
          recordedBy: currentUser.name,
          recordedById: currentUser.id,
          notes: isFattening ? 'Added for fattening & market gain.' : 'Added to farm diary today.',
        },
      ],
    };

    onAddAnimal(newAnimal);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-stone-900">
              Add New Animal (Goat or Sheep)
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Save a new goat or sheep to {farm.name} (Phase 1 Tracker)
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Step 1: Species (Phase 1: Goat & Sheep) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-stone-700">
                1. Which Animal is this? (Phase 1)
              </label>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Goat & Sheep Phase
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { 
                  id: 'Goat', 
                  label: `🐐 ${localeText({ en: 'Goat', hi: 'बकरी', kn: 'ಆಡು', te: 'మేక', ta: 'வெள்ளாடு', ml: 'ആട്', mr: 'शेळी' })}`, 
                  desc: 'Meat & Kidding (Sirohi, Jamnapari, Boer)' 
                },
                { 
                  id: 'Sheep', 
                  label: `🐑 ${localeText({ en: 'Sheep', hi: 'भेड़', kn: 'ಕುರಿ', te: 'గొర్రె', ta: 'செம்மறி', ml: 'ചെമ്മരിയാട്', mr: 'मेंढी' })}`, 
                  desc: 'Wool & Meat (Deccani, Nellore, Bellary)' 
                },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSpeciesSelect(item.id as Species)}
                  className={`p-3 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    species === item.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-md'
                      : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  <span className="text-sm font-black">{item.label}</span>
                  <span className={`text-[11px] mt-1 ${species === item.id ? 'text-emerald-100' : 'text-stone-500'}`}>
                    {item.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ear Tag Number (Editable)
              </label>
              <input
                type="text"
                required
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                placeholder="e.g. GOAT-101, SHEEP-201"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Animal's Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ganga or Munna"
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Birthday
              </label>
              <input
                type="date"
                required
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
              />
            </div>
          </div>

          {/* Breed, Boy/Girl, Shed */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-stone-700">
                  {localeText({ en: 'Breed', hi: 'नस्ल', kn: 'ತಳಿ', te: 'జాతి', ta: 'இனம்', ml: 'ഇനം', mr: 'जात' })}
                </label>
                <span className="text-[10px] text-purple-700 font-bold">Universal Catalog</span>
              </div>
              <input
                type="text"
                required
                list="global-breed-options"
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                placeholder="Select or enter breed..."
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              />
              <datalist id="global-breed-options">
                {db.getBreedNames(species).map(bName => (
                  <option key={bName} value={bName} />
                ))}
              </datalist>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {species === 'Goat'
                  ? localeText({
                      en: 'Sex (Doe or Buck?)',
                      hi: 'लिंग (बकरी या बकरा?)',
                      kn: 'ಲಿಂಗ (ಹೆಣ್ಣು ಅಥವಾ ಗಂಡು?)',
                      te: 'లింగం (ఆడ లేదా మగ?)',
                      ta: 'பாலினம் (பெண் அல்லது ஆண்?)',
                      ml: 'ലിംഗം (പെൺ അല്ലെങ്കിൽ ആൺ?)',
                      mr: 'लिंग (शेळी की बोकड?)'
                    })
                  : localeText({
                      en: 'Sex (Ewe or Ram?)',
                      hi: 'लिंग (भेड़ या मेढ़ा?)',
                      kn: 'ಲಿಂಗ (ಹೆಣ್ಣು ಕುರಿ ಅಥವಾ ಟಗರು?)',
                      te: 'లింగం (ఆడ లేదా పొట్టేలు?)',
                      ta: 'பாலினம் (பெண் அல்லது கிடா?)',
                      ml: 'ലിംഗം (പെൺ അല്ലെങ്കിൽ മുട്ടൻ?)',
                      mr: 'लिंग (मेंढी की मेंढा?)'
                    })}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Female' | 'Male')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              >
                <option value="Female">
                  {species === 'Goat'
                    ? `♀ ${localeText({ en: 'Female (Doe)', hi: 'मादा (बकरी)', kn: 'ಹೆಣ್ಣು (ಆಡು)', te: 'ఆడ (మేక)', ta: 'பெண் (வெள்ளாடு)', ml: 'പെൺ (ആട്)', mr: 'मादी (शेळी)' })}`
                    : `♀ ${localeText({ en: 'Female (Ewe)', hi: 'मादा (भेड़)', kn: 'ಹೆಣ್ಣು (ಕುರಿ)', te: 'ఆడ (గొర్రె)', ta: 'பெண் (செம்மறி)', ml: 'പെൺ (ചെമ്മരിയാട്)', mr: 'मादी (मेंढी)' })}`}
                </option>
                <option value="Male">
                  {species === 'Goat'
                    ? `♂ ${localeText({ en: 'Male (Buck)', hi: 'नर (बकरा)', kn: 'ಗಂಡು (ಬೊक್ಕ)', te: 'మగ (మేకపోతు)', ta: 'ஆண் (கடா)', ml: 'ആൺ (കൊറ്റൻ)', mr: 'नर (बोकड)' })}`
                    : `♂ ${localeText({ en: 'Male (Ram)', hi: 'नर (मेढ़ा)', kn: 'ಗಂಡು (ಟಗರು)', te: 'మగ (పొట్టేలు)', ta: 'ஆண் (கிடா)', ml: 'ആൺ (മുട്ടൻ)', mr: 'नर (मेंढा)' })}`}
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Shed / Place on Farm</label>
              <input
                type="text"
                value={paddockLocation}
                onChange={(e) => setPaddockLocation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
              />
            </div>
          </div>

          {/* Step 2: Purpose (Breeding vs Fattening) */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-amber-950 uppercase">
                  2. {t('purpose', 'Animal Purpose')}
                </h4>
                <span className="text-[11px] font-bold text-amber-800">
                  {purpose === 'Breeding' ? '🧬 Breeding Stock' : '🥩 Fattening Stock'}
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                {localeText({
                  en: 'Is this animal kept for breeding offspring, or for fattening and meat sale?',
                  hi: 'क्या यह पशु बच्चे पैदा करने (ब्रीडिंग) के लिए है या वजन बढ़ाकर बेचने (फैटनिंग) के लिए?',
                  kn: 'ಈ ಪ್ರಾಣಿ ಮರಿಗಳನ್ನು ಪಡೆಯಲು (ಬ್ರೀಡಿಂಗ್) ಅಥವಾ ತೂಕ ಹೆಚ್ಚಿಸಿ ಮಾರಾಟ ಮಾಡಲು (ಫ್ಯಾಟನಿಂಗ್)?',
                  te: 'ఈ జీవం సంతానోత్పత్తి కోసమా లేక బరువు పెంచి విక్రయించడానికా?',
                  ta: 'இந்த கால்நடை இனப்பெருக்கத்திற்கா அல்லது எடை ஏற்றி விற்பனை செய்யவா?',
                  ml: 'ഈ മൃഗം പ്രജനനത്തിനാണോ അതോ ഭാരം കൂട്ടി വിൽക്കാനാണോ?',
                  mr: 'हे जनावर पैदाशीसाठी (ब्रीडिंग) आहे की वजन वाढवून विक्रीसाठी (फॅटनिंग)?'
                })}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setPurpose('Breeding')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  purpose === 'Breeding'
                    ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                  purpose === 'Breeding' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  🧬
                </div>
                <div>
                  <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span>{t('breeding', 'Breeding')}</span>
                    {purpose === 'Breeding' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                    {t('breedingDesc', 'For producing kids/lambs (family tree tracked)')}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setPurpose('Fattening')}
                className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                  purpose === 'Fattening'
                    ? 'border-amber-600 bg-amber-50/80 shadow-xs ring-1 ring-amber-500'
                    : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                  purpose === 'Fattening' ? 'bg-amber-600 text-white' : 'bg-stone-100 text-stone-600'
                }`}>
                  🥩
                </div>
                <div>
                  <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                    <span>{t('fattening', 'Fattening (Meat / Market)')}</span>
                    {purpose === 'Fattening' && <Check className="w-3.5 h-3.5 text-amber-700" />}
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                    {t('fatteningDesc', 'For meat & market sale (family tree not needed)')}
                  </p>
                </div>
              </button>
            </div>

            {/* If Fattening: Family Tree is not needed */}
            {purpose === 'Fattening' && (
              <div className="p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-3">
                <span className="text-xl shrink-0">🥩</span>
                <div>
                  <h5 className="text-xs font-black">
                    {t('familyTreeNotNeeded', 'Family tree is not tracked for fattening animals')}
                  </h5>
                  <p className="text-[11px] text-amber-900 mt-0.5 leading-relaxed font-medium">
                    {t('parentsNotTrackedFattening', 'Fattening animals are reared for meat and market; pedigree records are not needed.')}
                  </p>
                </div>
              </div>
            )}

            {/* If Breeding: Ask Origin (Born on Farm vs Brought from Outside) */}
            {purpose === 'Breeding' && (
              <div className="pt-2 border-t border-amber-200/80 space-y-3">
                <div>
                  <h4 className="text-xs font-black text-amber-950 uppercase">
                    3. {t('origin', 'Animal Origin')}
                  </h4>
                  <p className="text-[11px] text-stone-600 font-medium mt-0.5">
                    {localeText({
                      en: 'Was this animal born on your farm, or brought from outside?',
                      hi: 'क्या यह पशु आपके फार्म में पैदा हुआ, या बाहर (मंडी/अन्य फार्म) से लाया गया?',
                      kn: 'ಈ ಪ್ರಾಣಿ ನಿಮ್ಮ ಫಾರ್ಮ್‌ನಲ್ಲಿ ಜನಿಸಿದ್ದೇ ಅಥವಾ ಹೊರಗಿನಿಂದ ತಂದಿದ್ದೇ?',
                      te: 'ఈ జీవం మీ ఫారమ్‌లోనే పుట్టిందా లేక బయట నుండి తెచ్చారా?',
                      ta: 'இந்த கால்நடை உங்கள் பண்ணையிலேயே பிறந்ததா அல்லது வெளியில் இருந்து கொண்டு வரப்பட்டதா?',
                      ml: 'ഈ മൃഗം നിങ്ങളുടെ ഫാമിൽ ജനിച്ചതാണോ അതോ പുറത്തുനിന്ന് കൊണ്ടുവന്നതാണോ?',
                      mr: 'हे जनावर तुमच्या फार्मवर जन्मले आहे की बाहेरून (बाजार/इतर फार्म) आणले आहे?'
                    })}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setOrigin('Born on Farm');
                      setKnowsParents(true);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                      origin === 'Born on Farm'
                        ? 'border-emerald-600 bg-emerald-50/80 shadow-xs ring-1 ring-emerald-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                      origin === 'Born on Farm' ? 'bg-emerald-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      🏡
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                        <span>{t('bornOnFarm', 'Born in the Farm')}</span>
                        {origin === 'Born on Farm' && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                        {t('bornOnFarmDesc', 'Born here (parents tracked from flock)')}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOrigin('Brought from Outside');
                      setKnowsParents(false);
                    }}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 ${
                      origin === 'Brought from Outside'
                        ? 'border-purple-600 bg-purple-50/80 shadow-xs ring-1 ring-purple-500'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
                      origin === 'Brought from Outside' ? 'bg-purple-600 text-white' : 'bg-stone-100 text-stone-600'
                    }`}>
                      🚚
                    </div>
                    <div>
                      <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                        <span>{t('broughtFromOutside', 'Brought from Outside')}</span>
                        {origin === 'Brought from Outside' && <Check className="w-3.5 h-3.5 text-purple-700" />}
                      </div>
                      <p className="text-[11px] text-stone-500 font-medium mt-0.5 leading-tight">
                        {t('broughtFromOutsideDesc', 'Purchased from market or external source')}
                      </p>
                    </div>
                  </button>
                </div>

                {/* If Brought from Outside: Ask with Checkbox if user knows parents */}
                {origin === 'Brought from Outside' && (
                  <div className="space-y-2">
                    <label className="flex items-start gap-3 p-3 bg-white border-2 border-stone-200 rounded-2xl cursor-pointer hover:border-purple-400 transition-all">
                      <input
                        type="checkbox"
                        checked={knowsParents}
                        onChange={(e) => setKnowsParents(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-stone-300 text-purple-700 focus:ring-purple-600 cursor-pointer"
                      />
                      <div>
                        <span className="text-xs font-black text-stone-900 block">
                          {t('knowParentsCheck', 'I know the parents (Sire/Dam) of this animal')}
                        </span>
                        <span className="text-[11px] text-stone-500 font-medium block mt-0.5">
                          {localeText({
                            en: 'Check if you have known pedigree records from the seller/breeder.',
                            hi: 'यदि विक्रेता या पुराने फार्म से माता-पिता की पक्की जानकारी है तभी चेक करें।',
                            kn: 'ಮಾರಾಟಗಾರರಿಂದ ತಂದೆ-ತಾಯಿಯ ಖಚಿತ ಮಾಹಿತಿ ಇದ್ದರೆ ಮಾತ್ರ ಗುರುತು ಹಾಕಿ.',
                            te: 'విక్రేత లేదా మునుపటి ఫారం నుంచి తల్లిదండ్రుల ఖచ్చితమైన సమాచారం ఉంటే ఎంచుకోండి.',
                            ta: 'முந்தைய வளர்ப்பாளரிடம் இருந்து பெற்றோர் பற்றிய விபரம் தெரிந்தால் மட்டும் டிக் செய்யவும்.',
                            ml: 'വിൽപ്പനക്കാരനിൽ നിന്ന് മാതാപിതാക്കളുടെ ശരിയായ വിവരം ലഭിച്ചിട്ടുണ്ടെങ്കിൽ മാത്രം ടിക്ക് ചെയ്യുക.',
                            mr: 'विक्रेत्याकडून आई-वडिलांची खात्रीशीर माहिती मिळालेली असेल तरच टिक करा.'
                          })}
                        </span>
                      </div>
                    </label>

                    {!knowsParents && (
                      <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 flex items-start gap-2.5">
                        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                        <div className="text-[11px] font-medium leading-relaxed">
                          <strong>{t('parentsUnknown', 'Parents Unknown (Foundation Stock)')}:</strong>{' '}
                          {t('foundationStockDesc', 'Brought from outside with unknown ancestry. Serves as foundation breeding stock.')}
                          <span className="block mt-1 text-purple-800">
                            ✓ {localeText({
                              en: 'Family tree will not show empty or unverified parents for this animal.',
                              hi: 'इस पशु के लिए खानदान में खाली या फर्जी माता-पिता नहीं दिखाए जाएंगे।',
                              kn: 'ಈ ಪ್ರಾಣಿಗೆ ಕುಟುಂಬ ಮರದಲ್ಲಿ ಖಾಲಿ ಅಥವಾ ಅಜ್ಞಾತ ಪೋಷಕರು ಕಾಣಿಸುವುದಿಲ್ಲ.',
                              te: 'ఈ జీవానికి కుటుంబ వృక్షంలో ఖాళీ లేదా నకిలీ తల్లిదండ్రులు కనిపించరు.',
                              ta: 'இந்த கால்நடைக்கு குடும்ப மரத்தில் வெற்று அல்லது போலி பெற்றோர் காட்டப்பட மாட்டாது.',
                              ml: 'ഈ മൃഗത്തിന് കുടുംബ വൃക്ഷത്തിൽ ശൂന്യമായ മാതാപിതാക്കളുടെ വിവരം കാണിക്കില്ല.',
                              mr: 'या जनावरासाठी वंशावळीत रिकामे किंवा खोटे आई-वडील दिसणार नाहीत.'
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* If Born on Farm OR Brought from Outside with knowsParents === true: Show Sire & Dam inputs */}
                {(origin === 'Born on Farm' || knowsParents) && (
                  <div className="pt-2 border-t border-amber-200/80 space-y-3">
                    <h5 className="text-xs font-black text-amber-950 uppercase flex items-center justify-between">
                      <span>4. {localeText({
                        en: 'Papa & Mummy Information',
                        hi: 'माता-पिता की जानकारी',
                        kn: 'ತಂದೆ-ತಾಯಿಯ ಮಾಹಿತಿ',
                        te: 'తల్లిదండ్రుల వివరాలు',
                        ta: 'பெற்றோர் விவரங்கள்',
                        ml: 'മാതാപിതാക്കളുടെ വിവരം',
                        mr: 'आई-वडिलांची माहिती'
                      })}</span>
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        {origin === 'Born on Farm' ? 'Flock Lineage' : 'Verified Pedigree'}
                      </span>
                    </h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Sire (Father) */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {species === 'Goat'
                            ? localeText({
                                en: 'Sire / Father (Stud Buck)',
                                hi: 'पिता / नर (बकरा)',
                                kn: 'ತಂದೆ / ಗಂಡು (ಬೊಕ್ಕ)',
                                te: 'తండ్రి / మగ (పోతు)',
                                ta: 'தந்தை / ஆண் (கடா)',
                                ml: 'പിതാവ് / ആൺ (കൊറ്റൻ)',
                                mr: 'वडील / नर (बोकड)'
                              })
                            : localeText({
                                en: 'Sire / Father (Stud Ram)',
                                hi: 'पिता / नर (मेढ़ा)',
                                kn: 'ತಂದೆ / ಗಂಡು (ಟಗರು)',
                                te: 'తండ్రి / మగ (పొట్టేలు)',
                                ta: 'தந்தை / ஆண் (கிடா)',
                                ml: 'പിതാവ് / ആൺ (മുട്ടൻ)',
                                mr: 'वडील / नर (मेंढा)'
                              })}
                        </label>
                        <select
                          value={selectedSireId}
                          onChange={(e) => setSelectedSireId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs mb-1.5 font-bold"
                        >
                          <option value="custom">
                            + {localeText({
                              en: "Type Father's Name Below",
                              hi: 'नीचे पिता का नाम लिखें',
                              kn: 'ಕೆಳಗೆ ತಂದೆಯ ಹೆಸರು ಬರೆಯಿರಿ',
                              te: 'క్రింద తండ్రి పేరు రాయండి',
                              ta: 'கீழே தந்தை பெயரை எழுதவும்',
                              ml: 'താഴെ പിതാവിന്റെ പേര് എഴുതുക',
                              mr: 'खाली वडिलांचे नाव लिहा'
                            })}
                          </option>
                          {farm.animals.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name} (Tag #{a.tagId} · {a.breed})
                            </option>
                          ))}
                        </select>
                        {selectedSireId === 'custom' && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={customSireName}
                              onChange={(e) => setCustomSireName(e.target.value)}
                              placeholder={localeText({ en: 'Sire Name', hi: 'पिता का नाम', kn: 'ತಂದೆಯ ಹೆಸರು', te: 'తండ్రి పేరు', ta: 'தந்தை பெயர்', ml: 'പിതാവിന്റെ പേര്', mr: 'वडिलांचे नाव' })}
                              className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                            />
                            <input
                              type="text"
                              value={customSireTag}
                              onChange={(e) => setCustomSireTag(e.target.value)}
                              placeholder={localeText({ en: 'Sire Tag', hi: 'टैग नंबर', kn: 'ಟ್ಯಾಗ್ ಸಂಖ್ಯೆ', te: 'ట్యాగ్ నంబర్', ta: 'டேக் எண்', ml: 'ടാഗ് നമ്പർ', mr: 'टॅग क्रमांक' })}
                              className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono uppercase"
                            />
                          </div>
                        )}
                      </div>

                      {/* Dam (Mother) */}
                      <div>
                        <label className="block text-xs font-bold text-stone-700 mb-1">
                          {species === 'Goat'
                            ? localeText({
                                en: 'Dam / Mother (Breeder Doe)',
                                hi: 'माता / मादा (बकरी)',
                                kn: 'ತಾಯಿ / ಹೆಣ್ಣು (ಆಡು)',
                                te: 'తల్లి / ఆడ (మేక)',
                                ta: 'தாய் / பெண் (வெள்ளாடு)',
                                ml: 'മാതാവ് / പെൺ (ആട്)',
                                mr: 'आई / मादी (शेळी)'
                              })
                            : localeText({
                                en: 'Dam / Mother (Breeder Ewe)',
                                hi: 'माता / मादा (भेड़)',
                                kn: 'ತಾಯಿ / ಹೆಣ್ಣು (ಕುರಿ)',
                                te: 'తల్లి / ఆడ (గొర్రె)',
                                ta: 'தாய் / பெண் (செம்மறி)',
                                ml: 'മാതാവ് / പെൺ (ചെമ്മരിയാട്)',
                                mr: 'आई / मादी (मेंढी)'
                              })}
                        </label>
                        <select
                          value={selectedDamId}
                          onChange={(e) => setSelectedDamId(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs mb-1.5 font-bold"
                        >
                          <option value="custom">
                            + {localeText({
                              en: "Type Mother's Name Below",
                              hi: 'नीचे माता का नाम लिखें',
                              kn: 'ಕೆಳಗೆ ತಾಯಿಯ ಹೆಸರು ಬರೆಯಿರಿ',
                              te: 'క్రింద తల్లి పేరు రాయండి',
                              ta: 'கீழே தாய் பெயரை எழுதவும்',
                              ml: 'താഴെ മാതാവിന്റെ പേര് എഴുതുക',
                              mr: 'खाली आईचे नाव लिहा'
                            })}
                          </option>
                          {farm.animals.map(a => (
                            <option key={a.id} value={a.id}>
                              {a.name} (Tag #{a.tagId} · {a.breed})
                            </option>
                          ))}
                        </select>
                        {selectedDamId === 'custom' && (
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={customDamName}
                              onChange={(e) => setCustomDamName(e.target.value)}
                              placeholder="Mummy Name"
                              className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                            />
                            <input
                              type="text"
                              value={customDamTag}
                              onChange={(e) => setCustomDamTag(e.target.value)}
                              placeholder="Mummy Tag"
                              className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono uppercase"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {purpose === 'Fattening' ? 'Fattening Goal / Breed Trait' : 'Good Family Quality (e.g. Twin birth line)'}
              </label>
              <input
                type="text"
                value={traitName}
                onChange={(e) => setTraitName(e.target.value)}
                placeholder={purpose === 'Fattening' ? 'Rapid Weight Gain & Market Finishing' : 'Twin kids ability & hardy frame'}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium"
              />
            </div>
          </div>

          {/* Starting Weights & Photo */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Birth Wt in kg</label>
              <input
                type="number"
                step="0.1"
                value={birthWeightKg}
                onChange={(e) => setBirthWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Weight Today (kg)</label>
              <input
                type="number"
                step="0.1"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Grown Target (kg)</label>
              <input
                type="number"
                step="1"
                value={targetMatureWeightKg}
                onChange={(e) => setTargetMatureWeightKg(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Animal Photo</label>
              <label className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-stone-50 hover:bg-stone-100 text-xs font-bold text-stone-700 flex items-center justify-center gap-1.5 cursor-pointer">
                <Camera className="w-3.5 h-3.5" />
                <span>Upload</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Save Animal to Farm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
