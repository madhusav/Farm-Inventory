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

const SPECIES_ILLUSTRATIONS: Record<Species, string> = {
  Cow: COW_ILLUSTRATION,
  Goat: GOAT_ILLUSTRATION,
  Sheep: SHEEP_ILLUSTRATION,
  Chicken: CHICKEN_ILLUSTRATION,
};

export const AddAnimalModal: React.FC<AddAnimalModalProps> = ({
  farm,
  currentUser,
  onClose,
  onAddAnimal,
}) => {
  const [species, setSpecies] = useState<Species>('Cow');
  const [tagId, setTagId] = useState(() => `COW-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [breed, setBreed] = useState('Gir Cow (Desi)');
  const [sex, setSex] = useState<'Female' | 'Male'>('Female');
  const [dateOfBirth, setDateOfBirth] = useState('2025-06-15');
  const [paddockLocation, setPaddockLocation] = useState('Shed No. 1');
  const [status, setStatus] = useState<Animal['status']>('Active');
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string>('');

  // Parent Sire & Dam
  const [selectedSireId, setSelectedSireId] = useState<string>('custom');
  const [customSireName, setCustomSireName] = useState('Nandi Bull');
  const [customSireTag, setCustomSireTag] = useState('BULL-202');
  
  const [selectedDamId, setSelectedDamId] = useState<string>('custom');
  const [customDamName, setCustomDamName] = useState('Gauri Cow');
  const [customDamTag, setCustomDamTag] = useState('COW-101');

  const [birthWeightKg, setBirthWeightKg] = useState('28');
  const [currentWeightKg, setCurrentWeightKg] = useState('180');
  const [targetMatureWeightKg, setTargetMatureWeightKg] = useState('420');
  const [productivityValue, setProductivityValue] = useState('16 Litres / day');
  const [traitName, setTraitName] = useState('Sweet rich A2 milk');

  const handleSpeciesSelect = (sp: Species) => {
    setSpecies(sp);
    if (sp === 'Cow') {
      setTagId(`COW-${Math.floor(100 + Math.random() * 900)}`);
      setBreed('Gir Cow (Desi)');
      setBirthWeightKg('28');
      setCurrentWeightKg('180');
      setTargetMatureWeightKg('420');
      setProductivityValue('16 Litres / day');
      setPaddockLocation('Shed No. 1');
      setTraitName('Sweet rich A2 milk');
    } else if (sp === 'Goat') {
      setTagId(`GOAT-${Math.floor(300 + Math.random() * 300)}`);
      setBreed('Sirohi Brown Goat');
      setBirthWeightKg('3.5');
      setCurrentWeightKg('35');
      setTargetMatureWeightKg('55');
      setProductivityValue('2.5 Litres / day');
      setPaddockLocation('Goat Shed East');
      setTraitName('Twins giving ability');
    } else if (sp === 'Sheep') {
      setTagId(`SHEEP-${Math.floor(400 + Math.random() * 300)}`);
      setBreed('Deccani Sheep');
      setBirthWeightKg('3.5');
      setCurrentWeightKg('38');
      setTargetMatureWeightKg('48');
      setProductivityValue('3.5 kg Wool / year');
      setPaddockLocation('Pasture Field');
      setTraitName('Thick warm wool');
    } else {
      setTagId(`HEN-${Math.floor(500 + Math.random() * 200)}`);
      setBreed('Aseel Desi Hen');
      setBirthWeightKg('0.04');
      setCurrentWeightKg('2.2');
      setTargetMatureWeightKg('2.5');
      setProductivityValue('6 Eggs / week');
      setPaddockLocation('Backyard Coop');
      setTraitName('Healthy brown eggs');
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

    const newAnimal: Animal = {
      id: `anim-${Date.now()}`,
      tagId: tagId.trim().toUpperCase(),
      name: name.trim() || `${breed} #${tagId}`,
      species,
      breed: breed.trim(),
      sex,
      dateOfBirth,
      photoUrl: customPhotoUrl || SPECIES_ILLUSTRATIONS[species],
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
      productivityLabel: species === 'Cow' 
        ? 'Daily Milk' 
        : species === 'Goat' 
        ? 'Goat Milk & Kids' 
        : species === 'Sheep' 
        ? 'Yearly Wool' 
        : 'Eggs Each Week',
      currentProductivityValue: productivityValue,
      healthStatus: 'Healthy & Fit',
      milkStatus: sex === 'Male' ? 'Not Milking (Male/Kid)' : (species === 'Chicken' ? 'Laying Eggs' : 'Giving Milk'),
      dailyMilkLitres: sex === 'Female' && (species === 'Cow' || species === 'Goat') ? (parseFloat(productivityValue) || 12) : undefined,
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
              Add New Animal (नया पशु जोड़ें)
            </h2>
            <p className="text-xs text-stone-500 font-medium">
              Save a new cow, goat, sheep, or chicken to {farm.name}
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
          
          {/* Step 1: Species */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">
              1. Which Animal is this? (पशु चुनें)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'Cow', label: '🐄 Cow (गाय)' },
                { id: 'Goat', label: '🐐 Goat (बकरी)' },
                { id: 'Sheep', label: '🐑 Sheep (भेड़)' },
                { id: 'Chicken', label: '🐔 Chicken (मुर्गी)' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSpeciesSelect(item.id as Species)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    species === item.id
                      ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Name & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Ear Tag Number (कान का नंबर)
              </label>
              <input
                type="text"
                required
                value={tagId}
                onChange={(e) => setTagId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 font-mono text-xs uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Animal's Name (नाम)
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
                Birthday (जन्म तिथि)
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
              <label className="block text-xs font-bold text-stone-700 mb-1">Breed (नस्ल)</label>
              <input
                type="text"
                required
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Female or Male?</label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as 'Female' | 'Male')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              >
                <option value="Female">Female / Girl (मादा)</option>
                <option value="Male">Male / Boy (नर)</option>
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
              {/* Papa */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Papa (Father)
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

              {/* Mummy */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Mummy (Mother)
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
