import React, { useState } from 'react';
import { Farm, User, Animal, GrowthMetric } from '../types';
import { Scale, Activity, ArrowUpRight, Check } from 'lucide-react';

interface GrowthTrackerViewProps {
  farm: Farm;
  currentUser: User;
  onSelectAnimal: (animal: Animal) => void;
  onAddGrowthRecord: (animalId: string, record: Omit<GrowthMetric, 'id'>) => void;
}

export const GrowthTrackerView: React.FC<GrowthTrackerViewProps> = ({
  farm,
  currentUser,
  onSelectAnimal,
  onAddGrowthRecord,
}) => {
  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(
    farm.animals[0]?.id || ''
  );
  const targetAnimal = farm.animals.find(a => a.id === selectedAnimalId) || farm.animals[0];
  const [quickWeight, setQuickWeight] = useState<string>(() => targetAnimal ? String(targetAnimal.currentWeightKg) : '35');
  const [quickBcs, setQuickBcs] = useState<string>('3.5');
  const [quickHeight, setQuickHeight] = useState<string>('65');
  const [quickNotes, setQuickNotes] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string>('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAnimal) return;

    const w = parseFloat(quickWeight) || targetAnimal.currentWeightKg;
    const bcs = parseFloat(quickBcs) || 3.5;
    const h = parseFloat(quickHeight) || 65;

    onAddGrowthRecord(targetAnimal.id, {
      date: new Date().toISOString().split('T')[0],
      weightKg: w,
      heightCm: h,
      bodyConditionScore: bcs,
      averageDailyGainG: Math.max(10, Math.round(((w - targetAnimal.currentWeightKg) * 1000) / 14)),
      dailyYieldValue: 0,
      dailyYieldUnit: 'kg',
      recordedBy: currentUser.name,
      recordedById: currentUser.id,
      notes: quickNotes.trim() || 'Healthy daily feeding.',
    });

    setQuickNotes('');
    setToastMessage(`✓ Saved ${w} kg weight & BCS ${bcs} for ${targetAnimal.name}!`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          Flock Weight & Growth Diary (वजन व स्वास्थ्य डायरी)
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          Track body weight gain, average daily gain (ADG), and body condition score (BCS) for your sheep and goats.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Quick Logger */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-800" />
              <span>Quick Weigh-In & Condition</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Today
            </span>
          </div>
          
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            Type today's weight and body condition score right from your phone in the shed.
          </p>

          <form onSubmit={handleQuickSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Choose Animal
              </label>
              <select
                value={selectedAnimalId}
                onChange={(e) => {
                  setSelectedAnimalId(e.target.value);
                  const found = farm.animals.find(a => a.id === e.target.value);
                  if (found) {
                    setQuickWeight(String(found.currentWeightKg));
                  }
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
              >
                {farm.animals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Tag #{a.tagId} · {a.species} · {a.currentWeightKg} kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={quickWeight}
                  onChange={(e) => setQuickWeight(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 font-mono text-base sm:text-sm font-black text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  step="1"
                  required
                  value={quickHeight}
                  onChange={(e) => setQuickHeight(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 font-mono text-base sm:text-sm font-black text-emerald-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">BCS (1-5)</label>
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="5"
                  required
                  value={quickBcs}
                  onChange={(e) => setQuickBcs(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 font-mono text-base sm:text-sm font-black text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Fodder & Feed Notes</label>
              <input
                type="text"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder="e.g. Green Lucerne, concentrate grain feed..."
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-stone-300 text-sm sm:text-xs text-stone-900"
              />
            </div>

            {toastMessage && (
              <div className="p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 text-xs font-bold text-emerald-900 flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{toastMessage}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold text-xs shadow-sm transition-colors cursor-pointer"
            >
              Save to Flock Growth Diary
            </button>
          </form>
        </div>

        {/* Right: Table on Tablet/Desktop, Mobile Cards on Phone (Zero Horizontal Scrolling) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
              Flock Growth & ADG Summary
            </h2>
            <span className="text-xs text-stone-500 font-bold">
              {farm.animals.length} Animals on Farm
            </span>
          </div>

          {/* Mobile Card View (Phone screens: zero horizontal scroll) */}
          <div className="sm:hidden divide-y divide-stone-100">
            {farm.animals.map(animal => {
              const pct = Math.min(100, Math.round((animal.currentWeightKg / animal.targetMatureWeightKg) * 100));
              return (
                <div
                  key={animal.id}
                  onClick={() => onSelectAnimal(animal)}
                  className="p-3.5 hover:bg-stone-50 active:bg-stone-100 transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100 px-1.5 py-0.5 rounded">
                        #{animal.tagId}
                      </span>
                      <h4 className="text-xs font-black text-stone-900 truncate">
                        {animal.name}
                      </h4>
                      <span className="text-xs">
                        {animal.species === 'Goat' ? '🐐' : '🐑'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <span className="font-mono font-black text-stone-900">
                        {animal.currentWeightKg} kg
                      </span>
                      <span className="text-[10px] text-stone-400">
                        (birth {animal.birthWeightKg} kg)
                      </span>
                      <span className="font-mono text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                        {pct}% mature
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                      Target: <strong>{animal.targetMatureWeightKg} kg</strong> · {animal.breed}
                    </div>
                  </div>

                  <span className="text-xs text-emerald-800 font-black flex items-center gap-0.5 shrink-0 bg-emerald-50 px-2 py-1.5 rounded-xl border border-emerald-200">
                    <span>Diary</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Table View for sm+ screens */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold text-[11px]">
                  <th className="py-3 px-4">Animal</th>
                  <th className="py-3 px-4">Birth Wt</th>
                  <th className="py-3 px-4">Current Wt</th>
                  <th className="py-3 px-4">Target Mature</th>
                  <th className="py-3 px-4">Growth %</th>
                  <th className="py-3 px-4">Diary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {farm.animals.map(animal => {
                  const pct = Math.min(100, Math.round((animal.currentWeightKg / animal.targetMatureWeightKg) * 100));
                  return (
                    <tr
                      key={animal.id}
                      onClick={() => onSelectAnimal(animal)}
                      className="hover:bg-stone-50/80 cursor-pointer"
                    >
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-stone-900">{animal.name}</div>
                        <div className="text-[11px] font-mono text-stone-500 font-bold">Tag #{animal.tagId} · {animal.species} · {animal.breed}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-600 font-semibold">
                        {animal.birthWeightKg} kg
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-stone-900">
                        {animal.currentWeightKg} kg
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-stone-700">
                        {animal.targetMatureWeightKg} kg
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-800 font-bold">
                        {pct}% grown
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-800 font-extrabold hover:underline flex items-center gap-0.5">
                          <span>See Diary</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
