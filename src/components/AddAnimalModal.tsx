import React, { useState } from 'react';
import { Animal, Species, Farm, User } from '../types';
import { 
  COW_ILLUSTRATION, 
  GOAT_ILLUSTRATION, 
  SHEEP_ILLUSTRATION, 
  CHICKEN_ILLUSTRATION 
} from '../data/initialData';
import { X, Plus, Camera } from 'lucide-react';

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
  const [species, setSpecies] = useState<Species>('Goat');
  const [tagId, setTagId] = useState(() => `GOAT-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Sirohi Brown Goat');
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [dateOfBirth, setDateOfBirth] = useState('2025-06-15');
  const [paddockLocation, setPaddockLocation] = useState('Goat Shed East');
  const [status, setStatus] = useState<Animal['status']>('Active');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');

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

    const sireObj = farm.animals.find(a => a.id === selectedSireId);
    const damObj = farm.animals.find(a => a.id === selectedDamId);

    const bw = parseFloat(birthWeightKg) || 5;
    const cw = parseFloat(currentWeightKg) || 50;
    const tw = parseFloat(targetMatureWeightKg) || 100;
    const isDairy = species === 'Cow' || species === 'Buffalo';

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
      status,
      sireId: sireObj ? sireObj.id : null,
      sireName: sireObj ? sireObj.name : customSireName.trim() || 'Foundation Sire',
      sireTag: sireObj ? sireObj.tagId : customSireTag.trim() || 'SIRE-01',
      sireBreed: sireObj ? sireObj.breed : breed,
      damId: damObj ? damObj.id : null,
      damName: damObj ? damObj.name : customDamName.trim() || 'Foundation Dam',
      damTag: damObj ? damObj.tagId : customDamTag.trim() || 'DAM-01',
      damBreed: damObj ? damObj.breed : breed,
      inheritedTraits: [
        {
          traitName: traitName.trim() || 'Healthy Family Line',
          inheritedFrom: 'Both',
          scoreOrGrade: '5 Stars ★★★★★',
          impactDescription: `Baby animal from ${sireObj ? sireObj.name : customSireName} and ${damObj ? damObj.name : customDamName}.`,
        },
      ],
      inbreedingCoefficientPct: 0.5,
      birthWeightKg: bw,
      currentWeightKg: cw,
      targetMatureWeightKg: tw,
      productivityLabel: species === 'Cow' || species === 'Buffalo'
        ? 'Daily Milk' 
        : species === 'Goat' 
        ? 'Kids & Breeding' 
        : species === 'Sheep' 
        ? 'Yearly Wool' 
        : 'Eggs Each Week',
      currentProductivityValue: productivityValue,
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
          notes: 'Added to farm diary today.',
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
                { id: 'Goat', label: '🐐 Goat (बकरी)', desc: 'Meat & Kidding (Sirohi, Jamnapari, Boer)' },
                { id: 'Sheep', label: '🐑 Sheep (भेड़)', desc: 'Wool & Meat (Deccani, Nellore, Bellary)' },
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
              <label className="block text-xs font-bold text-stone-700 mb-1">Breed</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {species === 'Goat' ? 'Sex (Doe or Buck?)' : 'Sex (Ewe or Ram?)'}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Female' | 'Male')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white"
              >
                <option value="Female">
                  {species === 'Goat' ? '♀ Female (Doe / बकरी)' : '♀ Female (Ewe / भेड़)'}
                </option>
                <option value="Male">
                  {species === 'Goat' ? '♂ Male (Buck / बकरा)' : '♂ Male (Ram / मेढ़ा)'}
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

          {/* Family Section (Papa & Mummy) */}
          <div className="p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 space-y-3">
            <h4 className="text-xs font-black text-amber-950 uppercase">
              2. Who are the Parents? (माता-पिता)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sire (Father) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Sire / Father ({species === 'Goat' ? 'Stud Buck / बकरा' : 'Stud Ram / मेढ़ा'})
                </label>
                <select
                  value={selectedSireId}
                  onChange={(e) => setSelectedSireId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs mb-1.5"
                >
                  <option value="custom">+ Type Father's Name Below</option>
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
                      placeholder="Papa Name"
                      className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs"
                    />
                    <input
                      type="text"
                      value={customSireTag}
                      onChange={(e) => setCustomSireTag(e.target.value)}
                      placeholder="Papa Tag"
                      className="px-2 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-mono uppercase"
                    />
                  </div>
                )}
              </div>

              {/* Dam (Mother) */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Dam / Mother ({species === 'Goat' ? 'Breeder Doe / बकरी' : 'Breeder Ewe / भेड़'})
                </label>
                <select
                  value={selectedDamId}
                  onChange={(e) => setSelectedDamId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs mb-1.5"
                >
                  <option value="custom">+ Type Mother's Name Below</option>
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

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Good Family Quality (e.g. Gives sweet A2 milk)
              </label>
              <input
                type="text"
                value={traitName}
                onChange={(e) => setTraitName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs"
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
