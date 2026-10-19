import React, { useState } from 'react';
import { Farm, User, Species } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { X, Check, Plus, Trash2 } from 'lucide-react';

interface ManageAvailableSpeciesModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onSaveAvailableSpecies: (speciesList: Species[]) => void;
}

interface PredefinedOption {
  id: string;
  name: string;
  icon: string;
  hindi: string;
  desc: string;
}

const PHASE1_ANIMALS: PredefinedOption[] = [
  { id: 'Goat', name: 'Goat', icon: '🐐', hindi: 'बकरी (Capra)', desc: 'Sirohi, Jamnapari, Barbari, Boer, Black Bengal meat & milk does/bucks' },
  { id: 'Sheep', name: 'Sheep', icon: '🐑', hindi: 'भेड़ (Ovis)', desc: 'Deccani, Nellore, Bellary, Mandya, Merino wool & mutton ewes/rams' },
];

const FUTURE_PHASE_ANIMALS: PredefinedOption[] = [
  { id: 'Cow', name: 'Dairy Cattle (Cow)', icon: '🐄', hindi: 'गाय (Cattle)', desc: 'Gir, Sahiwal, Jersey dairy cattle (Phase 2)' },
  { id: 'Buffalo', name: 'Dairy Buffalo', icon: '🐃', hindi: 'भैंस (Buffaloes)', desc: 'Murrah, Mehsana high-fat milk buffaloes (Phase 2)' },
  { id: 'Chicken', name: 'Poultry (Chicken)', icon: '🐔', hindi: 'मुर्गी (Poultry)', desc: 'Kadaknath, Aseel, BV380 egg layers & broilers (Phase 2)' },
  { id: 'Duck', name: 'Duck & Waterfowl', icon: '🦆', hindi: 'बतख (Ducks)', desc: 'Khaki Campbell, White Pekin water birds (Phase 2)' },
];

export const ManageAvailableSpeciesModal: React.FC<ManageAvailableSpeciesModalProps> = ({
  farm,
  currentUser,
  onClose,
  onSaveAvailableSpecies,
}) => {
  const { t } = useLanguage();
  const isAdmin = farm.adminUserId === currentUser.id;

  const [selectedSpecies, setSelectedSpecies] = useState<Species[]>(
    farm.primarySpecies.length > 0 ? farm.primarySpecies : ['Goat', 'Sheep']
  );
  const [customAnimalName, setCustomAnimalName] = useState('');

  const toggleSpecies = (sp: string) => {
    if (!isAdmin) return;
    if (selectedSpecies.includes(sp)) {
      if (selectedSpecies.length <= 1) {
        alert('Your flock must have at least one species enabled (Goat or Sheep)!');
        return;
      }
      setSelectedSpecies(selectedSpecies.filter(s => s !== sp));
    } else {
      setSelectedSpecies([...selectedSpecies, sp]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    const clean = customAnimalName.trim();
    if (!clean) return;
    const capitalized = clean.charAt(0).toUpperCase() + clean.slice(1);
    if (!selectedSpecies.includes(capitalized)) {
      setSelectedSpecies([...selectedSpecies, capitalized]);
    }
    setCustomAnimalName('');
  };

  const handleSave = () => {
    onSaveAvailableSpecies(selectedSpecies);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-stone-900 text-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐐</span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black tracking-tight text-white">
                  Flock Species Setup
                </h2>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                  Phase 1
                </span>
              </div>
              <p className="text-xs text-stone-300 font-medium mt-0.5">
                Specialized for Sheep and Goat tracking. Other livestock will add up in coming phases.
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

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-6">
          
          {/* Phase 1 Notice Banner */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-2.5 text-xs text-emerald-950">
            <span className="text-lg">🌿</span>
            <div>
              <span className="font-extrabold block">Phase 1 Focus: Sheep & Goat Flock</span>
              <p className="text-emerald-800 text-[11px] mt-0.5 leading-relaxed">
                This phase gives you streamlined tools for ear tagging, Sire/Dam pedigree, kid/lamb weights, and ovine/caprine vaccines (PPR, ET, Pox). Cattle, buffalo, and poultry will be enabled in upcoming phases.
              </p>
            </div>
          </div>

          {/* Permission notice if not admin */}
          {!isAdmin && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900">
              Only the <strong>Farm Boss</strong> can change which animals live on this farm. You can view the list below.
            </div>
          )}

          {/* Active Phase 1 Species */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-900 uppercase tracking-wider block">
                Active Flock Animals (Phase 1):
              </span>
              <span className="text-[11px] font-bold text-emerald-800">
                {selectedSpecies.filter(s => s === 'Goat' || s === 'Sheep').length} Enabled
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PHASE1_ANIMALS.map(item => {
                const isChecked = selectedSpecies.includes(item.id);
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleSpecies(item.id)}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-start justify-between gap-3 cursor-pointer ${
                      isChecked
                        ? 'border-emerald-700 bg-emerald-50/70 shadow-xs'
                        : 'border-stone-200 bg-stone-50 hover:bg-stone-100 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-3xl shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-xs font-black text-stone-900 flex items-center gap-1.5">
                          <span>{item.name}</span>
                          <span className="text-[11px] font-medium text-stone-500">({item.hindi})</span>
                        </div>
                        <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>

                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-colors ${
                      isChecked
                        ? 'bg-emerald-800 border-emerald-900 text-white'
                        : 'bg-white border-stone-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
              {/* Any other custom species that was added */}
              {selectedSpecies
                .filter(s => !PHASE1_ANIMALS.some(c => c.id === s))
                .map(customSp => (
                  <div
                    key={customSp}
                    className="p-3.5 rounded-2xl border-2 border-emerald-700 bg-emerald-50/70 shadow-xs flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🐾</span>
                      <span className="text-xs font-black text-stone-900">{customSp}</span>
                    </div>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={() => toggleSpecies(customSp)}
                        className="p-1 rounded text-red-600 hover:bg-red-100 cursor-pointer"
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>

          {/* Future Phases Roadmap (Cattle, Buffalo, Poultry) */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-stone-600 uppercase tracking-wider block">
                Upcoming Livestock (Coming in Phase 2 & 3):
              </span>
              <span className="text-[10px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                Future Phases
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FUTURE_PHASE_ANIMALS.map(item => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 flex items-start justify-between gap-3 opacity-75"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl shrink-0 grayscale opacity-80 mt-0.5">{item.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Phase 2
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Add custom animal type */}
          {isAdmin && (
            <form onSubmit={handleAddCustom} className="p-4 rounded-2xl bg-stone-100 border border-stone-200 space-y-2">
              <label className="text-xs font-black text-stone-800 block">
                + Add Another Animal Type (e.g. Quail, Rabbit, Horse):
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={customAnimalName}
                  onChange={(e) => setCustomAnimalName(e.target.value)}
                  placeholder="Type animal name (e.g. Rabbit, Quail)..."
                  className="flex-1 px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </form>
          )}

          {/* Selected Summary */}
          <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 font-medium">
            Active Animal Types on Farm: <strong>{selectedSpecies.join(', ')}</strong> ({selectedSpecies.length} types)
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              {t('cancel', 'Cancel')}
            </button>
            {isAdmin && (
              <button
                type="button"
                onClick={handleSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>{t('saveFarmSettings', 'Save Farm Setup')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
