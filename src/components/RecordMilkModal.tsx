import React, { useState } from 'react';
import { Farm, User, Animal, MilkingSession, MilkYieldLog } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Check, 
  Sun, 
  Moon, 
  Clock, 
  Sparkles, 
  ChevronRight, 
  Calendar, 
  History,
  TrendingUp,
  Milk as MilkIcon
} from 'lucide-react';

interface RecordMilkModalProps {
  farm: Farm;
  currentUser: User;
  preSelectedAnimal?: Animal | null;
  onClose: () => void;
  onSaveMilkLog: (log: Omit<MilkYieldLog, 'id' | 'createdAt'>) => void;
}

export const RecordMilkModal: React.FC<RecordMilkModalProps> = ({
  farm,
  currentUser,
  preSelectedAnimal,
  onClose,
  onSaveMilkLog,
}) => {
  const { t } = useLanguage();

  // Find all cows or milking animals in the farm
  const eligibleAnimals = farm.animals.filter(
    a => a.sex === 'Female' && (a.species === 'Cow' || a.species === 'Goat' || a.species === 'Buffalo')
  );

  const [selectedAnimalId, setSelectedAnimalId] = useState<string>(() => {
    if (preSelectedAnimal) return preSelectedAnimal.id;
    if (eligibleAnimals.length > 0) return eligibleAnimals[0].id;
    return farm.animals[0]?.id || '';
  });

  const selectedAnimal = farm.animals.find(a => a.id === selectedAnimalId) || eligibleAnimals[0] || farm.animals[0];

  // Default time based on current hour
  const currentHour = new Date().getHours();
  const defaultSession: MilkingSession = currentHour >= 14 ? 'Evening' : 'Morning';

  const [session, setSession] = useState<MilkingSession>(defaultSession);
  const [liters, setLiters] = useState<number>(() => {
    if (selectedAnimal?.dailyMilkLitres) {
      // Half of daily yield for session
      return Math.round((selectedAnimal.dailyMilkLitres / 2) * 10) / 10;
    }
    return selectedAnimal?.species === 'Goat' ? 1.5 : 8.0;
  });

  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [fatPercentage, setFatPercentage] = useState<string>('4.5');
  const [notes, setNotes] = useState<string>('');
  const [showHistory, setShowHistory] = useState<boolean>(false);

  // Stepper adjustments
  const adjustLiters = (delta: number) => {
    setLiters(prev => {
      const next = Math.max(0.25, Math.round((prev + delta) * 10) / 10);
      return next;
    });
  };

  // Recent milk logs for this selected cow
  const cowLogs = (farm.milkLogs || []).filter(l => l.animalId === selectedAnimalId);

  // Calculate today's total if logged
  const todaysLogs = cowLogs.filter(l => l.date === date);
  const todaysTotal = todaysLogs.reduce((sum, item) => sum + item.liters, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnimal || liters <= 0) return;

    onSaveMilkLog({
      animalId: selectedAnimal.id,
      cowTag: selectedAnimal.tagId,
      cowName: selectedAnimal.name,
      date,
      session,
      liters,
      fatPercentage: fatPercentage ? parseFloat(fatPercentage) : undefined,
      recordedBy: currentUser.name,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 flex flex-col">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-center justify-between bg-gradient-to-r from-sky-800 to-emerald-800 text-white rounded-t-3xl sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🥛</span>
            <div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                <span>Record Daily Milk Log</span>
              </h2>
              <p className="text-xs text-sky-100 font-medium mt-0.5">
                Write morning or evening milk yield in liters for your cows
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
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Cow Selector */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center justify-between">
              <span>1. Choose Cow (गाय चुनें)</span>
              <span className="text-[11px] font-bold text-stone-500">
                {eligibleAnimals.length} Milking Animals
              </span>
            </label>

            {eligibleAnimals.length > 1 ? (
              <select
                value={selectedAnimalId}
                onChange={(e) => {
                  setSelectedAnimalId(e.target.value);
                  const found = farm.animals.find(a => a.id === e.target.value);
                  if (found?.dailyMilkLitres) {
                    setLiters(Math.round((found.dailyMilkLitres / 2) * 10) / 10);
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-2xl border-2 border-stone-300 text-sm font-black bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              >
                {eligibleAnimals.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.tagId}) — {a.breed} [{a.currentProductivityValue || 'Giving Milk'}]
                  </option>
                ))}
              </select>
            ) : null}

            {/* Selected Cow Identity Card */}
            {selectedAnimal && (
              <div className="p-3.5 rounded-2xl bg-[#FFFDF8] border border-amber-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-amber-200">
                    <img 
                      src={selectedAnimal.photoUrl} 
                      alt={selectedAnimal.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-black text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                        {selectedAnimal.tagId}
                      </span>
                      <span className="text-[11px] font-bold text-stone-600">
                        {selectedAnimal.breed}
                      </span>
                    </div>
                    <div className="text-base font-black text-stone-900 truncate mt-0.5">
                      {selectedAnimal.name}
                    </div>
                    <div className="text-[11px] text-stone-500 font-medium">
                      Normal Yield: <strong>{selectedAnimal.currentProductivityValue || `${selectedAnimal.dailyMilkLitres || 14} L/day`}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHistory(!showHistory)}
                  className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                  title="View past milk entries"
                >
                  <History className="w-3.5 h-3.5 text-amber-800" />
                  <span className="hidden sm:inline">Past Logs</span>
                </button>
              </div>
            )}
          </div>

          {/* Past History Drawer if toggled */}
          {showHistory && (
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs font-black text-stone-800">
                <span>Recent Milk Logs for {selectedAnimal?.name}:</span>
                <span className="font-mono text-emerald-800">Total Entries: {cowLogs.length}</span>
              </div>
              {cowLogs.length === 0 ? (
                <div className="text-xs text-stone-500 italic py-2">
                  No milk logs entered yet. Be the first to record today's milking!
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {cowLogs.map(log => (
                    <div key={log.id} className="p-2 bg-white rounded-xl border border-stone-200 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>{log.session === 'Morning' ? '🌅' : '🌇'}</span>
                        <span className="font-bold text-stone-900">{log.session} ({log.date})</span>
                        {log.fatPercentage && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-1.5 rounded">
                            Fat: {log.fatPercentage}%
                          </span>
                        )}
                      </div>
                      <div className="font-mono font-black text-emerald-900">
                        {log.liters} Liters
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Milking Session: Morning vs Evening */}
          <div className="space-y-2">
            <label className="text-xs font-black text-stone-800 uppercase tracking-wider block">
              2. Milking Time (दोहन का समय - सुबह या शाम?)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSession('Morning')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  session === 'Morning'
                    ? 'border-amber-500 bg-amber-50 text-amber-950 font-black shadow-xs ring-2 ring-amber-400/50'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold'
                }`}
              >
                <Sun className={`w-5 h-5 ${session === 'Morning' ? 'text-amber-600' : 'text-stone-400'}`} />
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">Morning (सुबह)</div>
                  <div className="text-[10px] font-medium text-stone-500">6:00 AM – 9:00 AM</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSession('Evening')}
                className={`p-4 rounded-2xl border-2 transition-all flex items-center justify-center gap-2.5 cursor-pointer ${
                  session === 'Evening'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-950 font-black shadow-xs ring-2 ring-indigo-400/50'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-700 font-bold'
                }`}
              >
                <Moon className={`w-5 h-5 ${session === 'Evening' ? 'text-indigo-600' : 'text-stone-400'}`} />
                <div className="text-left">
                  <div className="text-sm font-black leading-tight">Evening (शाम)</div>
                  <div className="text-[10px] font-medium text-stone-500">5:00 PM – 8:00 PM</div>
                </div>
              </button>
            </div>
          </div>

          {/* Amount in Liters */}
          <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-sky-50/70 border border-sky-200">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-sky-950 uppercase tracking-wider flex items-center gap-1.5">
                <MilkIcon className="w-4 h-4 text-sky-700" />
                <span>3. Milk Amount (कितना लीटर दूध?)</span>
              </label>
              <span className="text-xs font-bold text-sky-900 font-mono">
                Session: {session}
              </span>
            </div>

            {/* Big Numeric Stepper */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-2">
              <button
                type="button"
                onClick={() => adjustLiters(-1.0)}
                className="w-11 h-11 rounded-2xl bg-white hover:bg-sky-100 border border-sky-300 text-sky-950 text-lg font-black transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                title="Minus 1 Liter"
              >
                -1
              </button>

              <button
                type="button"
                onClick={() => adjustLiters(-0.5)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-sky-100 border border-sky-300 text-sky-900 text-sm font-black transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                title="Minus 0.5 Liter"
              >
                -½
              </button>

              <div className="flex items-baseline justify-center gap-1.5 px-4 py-2 bg-white rounded-2xl border-2 border-sky-400 shadow-sm min-w-[150px]">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={liters}
                  onChange={(e) => setLiters(Math.max(0.1, parseFloat(e.target.value) || 0.1))}
                  className="w-24 text-center font-mono font-black text-3xl sm:text-4xl text-sky-950 focus:outline-none"
                />
                <span className="text-base sm:text-lg font-black text-sky-800">Liters</span>
              </div>

              <button
                type="button"
                onClick={() => adjustLiters(0.5)}
                className="w-10 h-10 rounded-xl bg-white hover:bg-sky-100 border border-sky-300 text-sky-900 text-sm font-black transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                title="Add 0.5 Liter"
              >
                +½
              </button>

              <button
                type="button"
                onClick={() => adjustLiters(1.0)}
                className="w-11 h-11 rounded-2xl bg-white hover:bg-sky-100 border border-sky-300 text-sky-950 text-lg font-black transition-colors flex items-center justify-center shadow-xs cursor-pointer"
                title="Add 1 Liter"
              >
                +1
              </button>
            </div>

            {/* Quick preset chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {[3, 5, 7, 8.5, 10, 12, 14].map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setLiters(val)}
                  className={`px-3 py-1 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                    liters === val
                      ? 'bg-sky-800 text-white shadow-xs'
                      : 'bg-white border border-sky-200 text-sky-900 hover:bg-sky-100'
                  }`}
                >
                  {val} L
                </button>
              ))}
            </div>
          </div>

          {/* Date & Optional Fat / Quality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Milking Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-stone-400" />
                <span>Date of Milking (तारीख)</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
              />
            </div>

            {/* Fat % (Dairy standard) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
                <span>Fat % (फैट प्रतिशत)</span>
                <span className="text-[10px] text-stone-400 font-normal">Optional</span>
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  step="0.1"
                  min="1"
                  max="12"
                  value={fatPercentage}
                  onChange={(e) => setFatPercentage(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                />
                <span className="text-xs font-bold text-stone-500 font-mono">%</span>
              </div>
            </div>
          </div>

          {/* Optional Short Notes */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-700 flex items-center justify-between">
              <span>Farmer Note (टिप्पणी)</span>
              <span className="text-[10px] text-stone-400 font-normal">Optional</span>
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Clean bucket, cow ate sweet green grass, good froth..."
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          {/* Summary Box */}
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">✅</span>
              <div>
                <span className="font-bold block">
                  Recording {liters} L for {selectedAnimal?.name} ({session})
                </span>
                <span className="text-[11px] text-emerald-800">
                  Logged by: <strong>{currentUser.name}</strong>
                </span>
              </div>
            </div>
            <div className="text-right font-mono">
              <span className="text-[10px] text-stone-500 block uppercase">Today's Milk</span>
              <span className="text-sm font-black text-emerald-900">
                {Math.round((todaysTotal + liters) * 10) / 10} L
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Save Milk Record (दूध दर्ज करें)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
