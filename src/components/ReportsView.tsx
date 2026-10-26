import React, { useState } from 'react';
import { Farm, User, Animal } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Award,
  ChevronRight,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Scale
} from 'lucide-react';

interface ReportsViewProps {
  farm: Farm;
  currentUser: User;
  onOpenLedger: () => void;
  onSelectAnimal: (animal: Animal) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  farm,
  currentUser,
  onOpenLedger,
  onSelectAnimal,
}) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const [selectedMonthIdx, setSelectedMonthIdx] = useState<number>(5);

  // Financial calculations
  const financialRecords = farm.financialRecords || [];
  const incomeRecords = financialRecords.filter(r => r.type === 'income');
  const expenseRecords = financialRecords.filter(r => r.type === 'expense');

  const totalIncome = incomeRecords.reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = expenseRecords.reduce((sum, r) => sum + r.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Flock composition (Specialized for Sheep & Goat / Caprine & Ovine)
  const goatsCount = farm.animals.filter(a => a.species === 'Goat').length;
  const sheepCount = farm.animals.filter(a => a.species === 'Sheep').length;
  const breedingFemales = farm.animals.filter(a => a.sex === 'Female').length;
  const breedingMales = farm.animals.filter(a => a.sex === 'Male').length;
  const healthyCount = farm.animals.filter(a => a.healthStatus === 'Healthy & Fit' || !a.healthStatus).length;

  // Average weight & total flock biomass
  const totalWeightKg = farm.animals.reduce((sum, a) => sum + a.currentWeightKg, 0);
  const avgWeightKg = farm.animals.length > 0 ? (totalWeightKg / farm.animals.length).toFixed(1) : '0';

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenseRecords.forEach(r => {
    expensesByCategory[r.category] = (expensesByCategory[r.category] || 0) + r.amount;
  });

  const categoryEntries = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  // Monthly flock weight growth performance trend
  const monthsData = [
    { monthEn: 'May', monthHi: 'मई', avgWeight: 31.2, flockGainKg: 180, income: 24000, expense: 12500 },
    { monthEn: 'Jun', monthHi: 'जून', avgWeight: 32.8, flockGainKg: 210, income: 26000, expense: 14200 },
    { monthEn: 'Jul', monthHi: 'जुलाई', avgWeight: 34.1, flockGainKg: 245, income: 29000, expense: 15800 },
    { monthEn: 'Aug', monthHi: 'अगस्त', avgWeight: 35.6, flockGainKg: 270, income: 30500, expense: 16400 },
    { monthEn: 'Sep', monthHi: 'सितम्बर', avgWeight: 37.0, flockGainKg: 290, income: 32000, expense: 17100 },
    { 
      monthEn: 'Oct',
      monthHi: 'अक्टूबर', 
      avgWeight: parseFloat(avgWeightKg) || 38.4, 
      flockGainKg: 310, 
      income: totalIncome || 34000, 
      expense: totalExpense || 18500 
    },
  ];

  const maxGainKg = Math.max(...monthsData.map(m => m.flockGainKg));
  const activeMonthData = monthsData[selectedMonthIdx] || monthsData[monthsData.length - 1];

  // Category palette with icons
  const categoryDetails: Record<string, { bg: string; icon: string; labelEn: string; labelHi: string }> = {
    'Feed & Fodder': { bg: 'bg-amber-500', icon: '🌾', labelEn: 'Feed & Lucerne Fodder', labelHi: 'पशु आहार (दाना-भूसा)' },
    'Medicine & Doctor': { bg: 'bg-rose-500', icon: '💊', labelEn: 'Medicine & Deworming', labelHi: 'दवाई व कृमिनाशक' },
    'Vaccination': { bg: 'bg-indigo-500', icon: '💉', labelEn: 'Vaccinations (PPR/ET/FMD)', labelHi: 'टीकाकरण (PPR/ET/FMD)' },
    'Worker Wages': { bg: 'bg-teal-500', icon: '👥', labelEn: 'Flock Shepherd Wages', labelHi: 'मजदूरों की मजदूरी' },
    'Equipment & Shed': { bg: 'bg-sky-500', icon: '🛠️', labelEn: 'Shed & Fencing Care', labelHi: 'शेड व बाड़ मरम्मत' },
    'Transport & Fuel': { bg: 'bg-purple-500', icon: '🚛', labelEn: 'Transport & Market Haul', labelHi: 'किराया व परिवहन' },
    'Other Expense': { bg: 'bg-stone-500', icon: '📋', labelEn: 'Other Expenses', labelHi: 'अन्य खर्च' },
  };

  // Top weight gain & body condition champions (Goat & Sheep)
  const growthChampions = [...farm.animals]
    .sort((a, b) => b.currentWeightKg - a.currentWeightKg)
    .slice(0, 4);

  // Feed to Income ratio
  const feedCost = expensesByCategory['Feed & Fodder'] || 0;
  const feedRatio = totalIncome > 0 ? Math.round((feedCost / totalIncome) * 100) : 0;

  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl">📊</span>
            <h1 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              {isHi ? 'रेवड़ रिपोर्ट व वित्तीय मुनाफा' : 'Flock Reports & Profit'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            {isHi 
              ? `बकरी-भेड़ वजन वृद्धि, स्वास्थ्य और शुद्ध बचत का सरल हिसाब (${farm.name})` 
              : `Flock weight progress, expense analysis, and net profit for ${farm.name}`}
          </p>
        </div>

        <button
          onClick={onOpenLedger}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <Receipt className="w-4 h-4" />
          <span>{isHi ? '💰 बहीखाता खोलें' : 'Open Money Ledger'}</span>
        </button>
      </div>

      {/* 4 Big Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Flock Strength */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {isHi ? 'कुल रेवड़ (Flock)' : 'Total Flock'}
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm">🐐🐑</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              {farm.animals.length}
            </span>
            <span className="text-[11px] font-bold text-stone-500">{isHi ? 'पशु' : 'Heads'}</span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5 truncate">
            {goatsCount} 🐐 Goats · {sheepCount} 🐑 Sheep
          </div>
        </div>

        {/* Breeding Stock */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {isHi ? 'प्रजनन स्टॉक' : 'Breeding Stock'}
            </span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-700 text-sm">👑</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
              {breedingFemales}F / {breedingMales}M
            </span>
          </div>
          <div className="text-[10px] text-stone-500 font-bold mt-0.5 truncate">
            {healthyCount}/{farm.animals.length} {isHi ? 'तंदुरुस्त' : 'Healthy & Fit'}
          </div>
        </div>

        {/* Total Earned */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {isHi ? 'कुल कमाई' : 'Total Income'}
            </span>
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800 text-sm">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-700" />
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-900 font-mono">
              ₹{totalIncome.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5 truncate">
            {incomeRecords.length} {isHi ? 'कमाई रिकॉर्ड' : 'entries'}
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {isHi ? 'कुल खर्च' : 'Total Expenses'}
            </span>
            <span className="p-1 rounded-lg bg-red-100 text-red-800 text-sm">
              <ArrowUpRight className="w-3.5 h-3.5 text-red-600" />
            </span>
          </div>
          <div className="mt-1.5">
            <span className="text-xl sm:text-2xl font-black text-red-900 font-mono">
              ₹{totalExpense.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="text-[10px] text-red-700 font-bold mt-0.5 truncate">
            {expenseRecords.length} {isHi ? 'खर्च रिकॉर्ड' : 'entries'}
          </div>
        </div>
      </div>

      {/* Net Profit Hero Card */}
      <div className={`p-5 sm:p-7 rounded-3xl border-2 shadow-lg text-white ${
        netProfit >= 0 
          ? 'bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 border-emerald-600' 
          : 'bg-gradient-to-br from-red-900 via-red-800 to-stone-900 border-red-600'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-wider">
              <span>{netProfit >= 0 ? '🟢' : '🔴'}</span>
              <span>{isHi ? 'महीने का शुद्ध मुनाफा' : 'Monthly Net Profit'}</span>
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight">
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl">
              {isHi 
                ? `भेड़-बकरी बिक्री व अन्य आय ₹${totalIncome.toLocaleString('en-IN')} में से दाना, हरा चारा, टीका व मजदूरी का खर्च ₹${totalExpense.toLocaleString('en-IN')} घटाने के बाद बची शुद्ध रकम।`
                : `Net profit after subtracting feed, vaccines, and shepherd costs (₹${totalExpense.toLocaleString('en-IN')}) from livestock sales revenue (₹${totalIncome.toLocaleString('en-IN')}).`}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {isHi ? 'मुनाफा मार्जिन' : 'Profit Margin'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">
                {profitMargin}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {isHi ? 'चारे की लागत' : 'Feed Share'}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">
                {feedRatio}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Flock Weight Gain Trends */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {isHi ? 'महीनेवार रेवड़ वजन वृद्धि (Flock Weight Gain)' : 'Monthly Flock Weight Gain Trend'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {isHi ? 'पिछले 6 महीनों में रेवड़ द्वारा हासिल कुल वजन (किलोग्राम में)' : 'Total flock body weight added across the last 6 months (in kg)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">
              {isHi ? 'चयनित माह:' : 'Selected:'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs font-mono">
              {isHi ? activeMonthData.monthHi : activeMonthData.monthEn} · +{activeMonthData.flockGainKg} kg gain
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 sm:h-64 border-b-2 border-stone-200 px-2">
            {monthsData.map((m, idx) => {
              const heightPercent = Math.max(18, Math.round((m.flockGainKg / maxGainKg) * 100));
              const isSelected = selectedMonthIdx === idx;

              return (
                <div 
                  key={m.monthEn} 
                  onClick={() => setSelectedMonthIdx(idx)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Weight gain badge on top of bar */}
                  <span className={`text-[10px] sm:text-xs font-mono font-black mb-1 transition-all ${
                    isSelected ? 'text-emerald-900 scale-110 font-extrabold' : 'text-stone-500 group-hover:text-stone-800'
                  }`}>
                    +{m.flockGainKg}kg
                  </span>

                  {/* Vertical Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[52px] rounded-t-2xl transition-all relative ${
                      isSelected 
                        ? 'bg-gradient-to-t from-emerald-800 to-emerald-600 shadow-md ring-2 ring-emerald-400/50' 
                        : 'bg-gradient-to-t from-emerald-300 to-emerald-200 group-hover:from-emerald-400 group-hover:to-emerald-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    )}
                  </div>

                  {/* Month Label */}
                  <span className={`mt-2 text-[10px] sm:text-xs font-bold truncate max-w-full text-center ${
                    isSelected ? 'text-emerald-950 font-black' : 'text-stone-500 group-hover:text-stone-800'
                  }`}>
                    {isHi ? m.monthHi : m.monthEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Month Summary Drilldown */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <span className="font-black text-emerald-950">
                {isHi ? activeMonthData.monthHi : activeMonthData.monthEn}: +{activeMonthData.flockGainKg} kg {isHi ? 'वजन वृद्धि' : 'Total Flock Gain'}
              </span>
              <span className="text-emerald-700 ml-2">
                (Avg Weight: {activeMonthData.avgWeight} kg)
              </span>
            </div>
          </div>
          <div className="text-emerald-900 font-bold">
            {isHi ? 'दैनिक औसत वृद्धि (ADG):' : 'Estimated Flock ADG:'} ~{(activeMonthData.flockGainKg / 30 / (farm.animals.length || 1) * 1000).toFixed(0)} g/animal/day
          </div>
        </div>
      </div>

      {/* 2-Column Section: Expense Distribution & Flock Growth Champions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category-wise Expense Distribution */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {isHi ? 'खर्च कहाँ हुआ?' : 'Expense Distribution'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {isHi ? 'दाना, टीका, दवाई, मजदूरी और अन्य खर्चों का वितरण' : 'Breakdown across lucerne fodder, vaccines, deworming, and shepherd wages'}
            </p>
          </div>

          {/* Segmented Progress Bar */}
          {totalExpense > 0 && (
            <div className="space-y-2">
              <div className="h-4 rounded-full bg-stone-100 overflow-hidden flex shadow-inner">
                {categoryEntries.map(([cat, amount]) => {
                  const percent = Math.round((amount / totalExpense) * 100);
                  const details = categoryDetails[cat] || { bg: 'bg-stone-500', icon: '📋' };
                  if (percent <= 0) return null;
                  return (
                    <div
                      key={cat}
                      style={{ width: `${percent}%` }}
                      className={`${details.bg} transition-all`}
                      title={`${cat}: ₹${amount} (${percent}%)`}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Category List with Visual Percent Bars */}
          <div className="space-y-3">
            {categoryEntries.length === 0 ? (
              <div className="p-6 text-center text-xs text-stone-400">
                {isHi ? 'अभी कोई खर्च दर्ज नहीं है।' : 'No expenses recorded yet.'}
              </div>
            ) : (
              categoryEntries.map(([cat, amount]) => {
                const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                const details = categoryDetails[cat] || { 
                  bg: 'bg-stone-500', 
                  icon: '📋', 
                  labelEn: cat, 
                  labelHi: cat 
                };

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{details.icon}</span>
                        <span className="text-stone-800">{isHi ? details.labelHi : details.labelEn}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-stone-900">
                          ₹{amount.toLocaleString('en-IN')}
                        </span>
                        <span className="text-[11px] font-mono text-stone-400 w-10 text-right">
                          {percent}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className={`h-full ${details.bg} rounded-full`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Golden Rule Tip */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 flex items-start gap-2.5">
            <span className="text-lg shrink-0">💡</span>
            <div>
              <span className="font-black">
                {isHi ? 'भेड़-बकरी पालन का सुनहरा नियम:' : 'Golden Flock Rule:'}
              </span>
              <p className="font-normal text-amber-900 mt-0.5">
                {isHi 
                  ? 'समय पर कृमिनाशक (Deworming) और प्रोटीन युक्त हरा चारा (लूसर्न/दशरथ घास) देने से मेमनों का दैनिक वजन 150-200 ग्राम तक बढ़ता है।'
                  : 'Timely deworming and high-protein green fodder (Lucerne/Subabul) boost average daily gain (ADG) to 150-200g/day.'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Flock Growth Champions */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  {isHi ? 'वजन व कद के सिरमौर पशु' : 'Top Flock Champions'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {isHi ? 'आपके फार्म में सबसे भारी व उत्तम विकास वाले बकरे/मेढ़े' : 'Heaviest and highest growth animals in your flock'}
              </p>
            </div>
            <Award className="w-6 h-6 text-amber-500 shrink-0" />
          </div>

          <div className="divide-y divide-stone-100">
            {growthChampions.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                {isHi ? 'अभी कोई पशु दर्ज नहीं है।' : 'No animals recorded yet.'}
              </div>
            ) : (
              growthChampions.map((animal, rank) => {
                const rankBadges = ['🥇', '🥈', '🥉', '🎖️'];

                return (
                  <div
                    key={animal.id}
                    onClick={() => onSelectAnimal(animal)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 p-2 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{rankBadges[rank] || '🐐'}</span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-stone-900 text-xs sm:text-sm group-hover:text-emerald-800 transition-colors truncate">
                            {animal.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-stone-400">
                            (#{animal.tagId})
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {animal.species === 'Goat' ? '🐐 Goat' : '🐑 Sheep'} · {animal.breed} · {animal.sex}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-emerald-800 font-mono">
                          {animal.currentWeightKg} kg
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          Mature target: {animal.targetMatureWeightKg} kg
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-stone-300 group-hover:text-stone-700 transition-colors" />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Ledger Shortcut */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
            <span className="text-xs text-stone-500 font-medium">
              {isHi ? 'रोज का चारा, दवा व बिक्री खर्च दर्ज करें' : 'Record fodder, medicines, or sales'}
            </span>
            <button
              onClick={onOpenLedger}
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              {isHi ? 'बहीखाता देखें →' : 'View Ledger →'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
