import React, { useState } from 'react';
import { Farm, Animal } from '../types';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

interface LineagePedigreeViewProps {
  farm: Farm;
  onSelectAnimal: (animal: Animal) => void;
}

export const LineagePedigreeView: React.FC<LineagePedigreeViewProps> = ({
  farm,
  onSelectAnimal,
}) => {
  const { t, localeText } = useLanguage();
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    farm.animals[0]?.id || ''
  );
  
  // Pairing simulator
  const [selectedSireId, setSelectedSireId] = useState<string>(
    farm.animals.find(a => a.sex === 'Male')?.id || farm.animals[0]?.id || ''
  );
  const [selectedDamId, setSelectedDamId] = useState<string>(
    farm.animals.find(a => a.sex === 'Female')?.id || farm.animals[1]?.id || ''
  );

  const currentAnimal = farm.animals.find(a => a.id === selectedAnimalId) || farm.animals[0];

  if (!currentAnimal) {
    return (
      <div className="p-8 text-center text-xs text-stone-500">
        No animals registered in farm yet to show family tree.
      </div>
    );
  }

  const sireInHerd = farm.animals.find(a => a.id === currentAnimal.sireId || a.tagId === currentAnimal.sireTag);
  const damInHerd = farm.animals.find(a => a.id === currentAnimal.damId || a.tagId === currentAnimal.damTag);
  const offspringInHerd = farm.animals.filter(a => 
    a.sireId === currentAnimal.id || a.damId === currentAnimal.id || 
    a.sireTag === currentAnimal.tagId || a.damTag === currentAnimal.tagId
  );

  // Pairing calculation
  const sireCandidate = farm.animals.find(a => a.id === selectedSireId);
  const damCandidate = farm.animals.find(a => a.id === selectedDamId);
  
  const isDirectRelation = sireCandidate && damCandidate && (
    sireCandidate.id === damCandidate.sireId ||
    damCandidate.id === sireCandidate.damId ||
    sireCandidate.id === damCandidate.id
  );
  const hasSharedParents = sireCandidate && damCandidate && (
    sireCandidate.sireTag === damCandidate.sireTag ||
    sireCandidate.damTag === damCandidate.damTag
  );
  const isHighRisk = isDirectRelation || hasSharedParents;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {t('familyTree', 'Family Tree & Parents')}
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            See who the Papa (father) and Mummy (mother) are, and check safe matches so newborn babies grow up strong!
          </p>
        </div>

        <div className="w-full sm:w-72">
          <label className="block text-xs font-bold text-stone-700 mb-1">
            Pick Animal to See Family Tree:
          </label>
          <select
            value={selectedAnimalId}
            onChange={(e) => setSelectedAnimalId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
          >
            {farm.animals.map(a => (
              <option key={a.id} value={a.id}>
                {a.name} (Tag #{a.tagId} · {a.species})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Pedigree Tree */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 sm:p-8 space-y-5 sm:space-y-6 shadow-xs">
        
        {/* Selected Head Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-stone-200 shrink-0">
              <img
                src={currentAnimal.photoUrl}
                alt={currentAnimal.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono text-emerald-950 font-bold truncate">
                Tag #{currentAnimal.tagId} · {currentAnimal.species} · {currentAnimal.sex}
              </div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 truncate">{currentAnimal.name}</h2>
              <div className="text-xs text-stone-500 font-medium truncate">
                {currentAnimal.breed} · Born {currentAnimal.dateOfBirth}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSelectAnimal(currentAnimal)}
            className="w-full sm:w-auto min-h-[40px] px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
          >
            <span>See Full Animal Diary</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3-Tier Pedigree Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          
          {/* Box 1: The Animal */}
          <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-2 shadow-xs">
            <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider block">
              ⭐ Animal
            </span>
            <div className="text-lg font-black">{currentAnimal.name} (Tag #{currentAnimal.tagId})</div>
            <div className="text-xs text-stone-300">
              Weight Today: {currentAnimal.currentWeightKg} kg · {currentAnimal.currentProductivityValue}
            </div>
            <div className="text-xs text-emerald-200 pt-2 border-t border-emerald-900 font-bold">
              Status: {currentAnimal.status}
            </div>
          </div>

          {/* Box 2: Papa and Mummy */}
          <div className="space-y-3">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 space-y-1">
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                🐐/🐑 Papa (Stud Buck / Ram)
              </span>
              <div className="text-sm font-black text-stone-900">{currentAnimal.sireName} (Tag #{currentAnimal.sireTag})</div>
              <div className="text-xs text-stone-600">Breed: {currentAnimal.sireBreed}</div>
              {sireInHerd && (
                <button
                  type="button"
                  onClick={() => setSelectedAnimalId(sireInHerd.id)}
                  className="mt-1 text-xs text-emerald-800 font-bold hover:underline block cursor-pointer"
                >
                  See Papa's Family Tree →
                </button>
              )}
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-[#FFFDF7] border-2 border-amber-200 space-y-1">
              <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                🐐/🐑 Mummy (Doe / Ewe)
              </span>
              <div className="text-sm font-black text-stone-900">{currentAnimal.damName} (Tag #{currentAnimal.damTag})</div>
              <div className="text-xs text-stone-600">Breed: {currentAnimal.damBreed}</div>
              {damInHerd && (
                <button
                  type="button"
                  onClick={() => setSelectedAnimalId(damInHerd.id)}
                  className="mt-1 text-xs text-emerald-800 font-bold hover:underline block cursor-pointer"
                >
                  See Mummy's Family Tree →
                </button>
              )}
            </div>
          </div>

          {/* Box 3: Qualities and Babies */}
          <div className="space-y-3">
            <span className="text-[11px] font-bold text-stone-600 uppercase tracking-wider block">
              Good Qualities & Baby Animals ({offspringInHerd.length})
            </span>
            {currentAnimal.inheritedTraits.map((t, idx) => (
              <div key={idx} className="p-3 sm:p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs space-y-0.5">
                <div className="font-extrabold text-emerald-950">{t.traitName}</div>
                <div className="text-stone-600">{t.impactDescription}</div>
                <div className="text-emerald-800 font-bold text-[11px]">Inherited from {t.inheritedFrom === 'Sire' ? 'Papa' : t.inheritedFrom === 'Dam' ? 'Mummy' : 'Both'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breeding Pair Match Safety Checker */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-6 space-y-4 shadow-xs">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-stone-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-700" />
            <span>{t('safeMatch', 'Safe Family Match Checker')}</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            {localeText({
              en: 'Check if a male (father) and female (mother) are safe to pair so baby kids and lambs are born healthy and vigorous.',
              hi: 'जांचें कि नर और मादा का मिलान सुरक्षित है या नहीं, ताकि मेमने स्वस्थ पैदा हों।',
              kn: 'ಗಂಡು ಮತ್ತು ಹೆಣ್ಣು ಜೋಡಿ ಸುರಕ್ಷಿತವೇ ಎಂದು ಪರಿಶೀಲಿಸಿ, ಇದರಿಂದ ಮರಿಗಳು ಆರೋಗ್ಯಕರವಾಗಿ ಜನಿಸುತ್ತವೆ.',
              te: 'పిల్లలు ఆరోగ్యంగా పుట్టేందుకు మగ మరియు ఆడ జీవాల జత సురక్షితమైనదో కాదో తనిఖీ చేయండి.',
              ta: 'குட்டிகள் ஆரோக்கியமாக பிறக்க ஆடு மற்றும் கிடாவின் இனச்சேர்க்கை பாதுகாப்பானதா என சரிபார்க்கவும்.',
              ml: 'കുഞ്ഞുങ്ങൾ ആരോഗ്യത്തോടെ ജനിക്കാൻ ആൺ-പെൺ ഇണചേരൽ സുരക്ഷിതമാണോ എന്ന് പരിശോധിക്കുക.',
              mr: 'नर आणि मादीची जोडी सुरक्षित आहे का ते तपासा, जेणेकरून करडे निरोगी जन्माला येतील.'
            })}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-center">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Pick Papa (Stud Buck / Ram)
            </label>
            <select
              value={selectedSireId}
              onChange={(e) => setSelectedSireId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 cursor-pointer"
            >
              {farm.animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (Tag #{a.tagId} · {a.sex})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Pick Mummy (Doe / Ewe)
            </label>
            <select
              value={selectedDamId}
              onChange={(e) => setSelectedDamId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 cursor-pointer"
            >
              {farm.animals.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (Tag #{a.tagId} · {a.sex})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FFFDF7] border-2 border-stone-200">
            <span className="text-[11px] text-stone-500 uppercase tracking-wider font-bold block">
              Match Safety Result:
            </span>
            <div className={`text-sm sm:text-base font-extrabold mt-0.5 ${isHighRisk ? 'text-red-700' : 'text-emerald-800'}`}>
              {isHighRisk ? ('⚠️ ' + t('dangerMatch', 'Warning: Too Closely Related')) : ('✓ ' + t('safeMatch', 'Safe Match (Good Family Mix)'))}
            </div>
            <p className="text-xs text-stone-600 mt-1">
              {isHighRisk 
                ? 'They share the same parents. Pick another Papa or Mummy so babies are born strong!' 
                : 'They come from different healthy lines. Their baby will be very active and fast growing!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
