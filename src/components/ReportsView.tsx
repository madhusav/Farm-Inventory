import React, { useState } from 'react';
import { Farm, User, Animal } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Award,
  ChevronRight,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight
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

  // Flock composition (Phase 1: Sheep & Goat)
  const goatsCount = farm.animals.filter(a => a.species === 'Goat').length;
  const sheepCount = farm.animals.filter(a => a.species === 'Sheep').length;
  const breedingFemales = farm.animals.filter(a => a.sex === 'Female').length;
  const breedingMales = farm.animals.filter(a => a.sex === 'Male').length;
  const healthyCount = farm.animals.filter(a => a.healthStatus === 'Healthy & Fit' || !a.healthStatus).length;

  // Milk yield calculations (Dairy does or cattle if present)
  const dairyAnimals = farm.animals.filter(a => a.dailyMilkLitres && a.dailyMilkLitres > 0);
  const totalDailyYield = dairyAnimals.reduce((sum, a) => sum + (a.dailyMilkLitres || 0), 0);
  const estimatedMonthlyLiters = Math.round(totalDailyYield * 30);

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  expenseRecords.forEach(r => {
    expensesByCategory[r.category] = (expensesByCategory[r.category] || 0) + r.amount;
  });

  const categoryEntries = Object.entries(expensesByCategory).sort((a, b) => b[1] - a[1]);

  // Monthly milk trend data
  const monthsData = [
    { monthEn: 'May', monthHi: 'मई', liters: 480, income: 24000, expense: 12500 },
    { monthEn: 'Jun', monthHi: 'जून', liters: 520, income: 26000, expense: 14200 },
    { monthEn: 'Jul', monthHi: 'जुलाई', liters: 580, income: 29000, expense: 15800 },
    { monthEn: 'Aug', monthHi: 'अगस्त', liters: 610, income: 30500, expense: 16400 },
    { monthEn: 'Sep', monthHi: 'सितम्बर', liters: 640, income: 32000, expense: 17100 },
    { 
      monthEn: 'Oct',
      monthHi: 'अक्टूबर', 
      liters: estimatedMonthlyLiters || 670, 
      income: totalIncome || 34000, 
      expense: totalExpense || 18500 
    },
  ];

  const maxMonthlyLiters = Math.max(...monthsData.map(m => m.liters));
  const activeMonthData = monthsData[selectedMonthIdx] || monthsData[monthsData.length - 1];

  // Category palette with icons
  const categoryDetails: Record<string, { bg: string; icon: string; labelEn: string; labelHi: string }> = {
    'Feed & Fodder': { bg: 'bg-amber-500', icon: '🌾', labelEn: 'Feed & Fodder', labelHi: 'पशु आहार (दाना-भूसा)' },
    'Medicine & Doctor': { bg: 'bg-rose-500', icon: '💊', labelEn: 'Medicine & Vet', labelHi: 'दवाई व डॉक्टर' },
    'Vaccination': { bg: 'bg-indigo-500', icon: '💉', labelEn: 'Vaccinations', labelHi: 'टीकाकरण' },
    'Worker Wages': { bg: 'bg-teal-500', icon: '👥', labelEn: 'Worker Wages', labelHi: 'मजदूरों की मजदूरी' },
    'Equipment & Shed': { bg: 'bg-sky-500', icon: '🛠️', labelEn: 'Shed & Equipment', labelHi: 'शेड व उपकरण' },
    'Transport & Fuel': { bg: 'bg-purple-500', icon: '🚛', labelEn: 'Transport & Fuel', labelHi: 'किराया व डीज़ल' },
    'Other Expense': { bg: 'bg-stone-500', icon: '📋', labelEn: 'Other Expenses', labelHi: 'अन्य खर्च' },
  };

  // Top milk champions
  const milkingLeaderboard = [...farm.animals]
    .filter(a => a.dailyMilkLitres && a.dailyMilkLitres > 0)
    .sort((a, b) => (b.dailyMilkLitres || 0) - (a.dailyMilkLitres || 0))
    .slice(0, 4);

  // Feed to Milk Income ratio
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
              {isHi ? 'फार्म रिपोर्ट व मुनाफा' : 'Farm Reports & Profit'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            {isHi 
              ? `दूध उत्पादन, खर्च और शुद्ध बचत का सरल हिसाब (${farm.name})` 
              : `Milk production, expense trends, and net profit for ${farm.name}`}
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
                ? `दूध और अन्य बिक्री से कुल कमाई ₹${totalIncome.toLocaleString('en-IN')} में से दाना, दवाई व मजदूरी का खर्च ₹${totalExpense.toLocaleString('en-IN')} घटाने के बाद बची शुद्ध रकम।`
                : `Net profit after subtracting feed, medicine, and labor costs (₹${totalExpense.toLocaleString('en-IN')}) from total farm revenue (₹${totalIncome.toLocaleString('en-IN')}).`}
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

      {/* Monthly Milk Production Trends */}
      <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                {isHi ? 'महीनेवार दूध उत्पादन' : 'Monthly Milk Production Trend'}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {isHi ? 'पिछले 6 महीनों में हर महीने कितना दूध हुआ (लीटर में)' : 'Monthly milk output over the last 6 months (in Liters)'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">
              {isHi ? 'चयनित माह:' : 'Selected:'}
            </span>
            <span className="px-3 py-1 rounded-xl bg-sky-100 text-sky-900 font-black text-xs font-mono">
              {isHi ? activeMonthData.monthHi : activeMonthData.monthEn} · {activeMonthData.liters} L
            </span>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6 pb-2">
          <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 sm:h-64 border-b-2 border-stone-200 px-2">
            {monthsData.map((m, idx) => {
              const heightPercent = Math.max(18, Math.round((m.liters / maxMonthlyLiters) * 100));
              const isSelected = selectedMonthIdx === idx;

              return (
                <div 
                  key={m.monthEn} 
                  onClick={() => setSelectedMonthIdx(idx)}
                  className="flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Liters badge on top of bar */}
                  <span className={`text-[10px] sm:text-xs font-mono font-black mb-1 transition-all ${
                    isSelected ? 'text-sky-900 scale-110 font-extrabold' : 'text-stone-500 group-hover:text-stone-800'
                  }`}>
                    {m.liters}L
                  </span>

                  {/* Vertical Bar */}
                  <div 
                    style={{ height: `${heightPercent}%` }}
                    className={`w-full max-w-[52px] rounded-t-2xl transition-all relative ${
                      isSelected 
                        ? 'bg-gradient-to-t from-sky-800 to-sky-600 shadow-md ring-2 ring-sky-400/50' 
                        : 'bg-gradient-to-t from-sky-300 to-sky-200 group-hover:from-sky-400 group-hover:to-sky-300'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                    )}
                  </div>

                  {/* Month Label */}
                  <span className={`mt-2 text-[10px] sm:text-xs font-bold truncate max-w-full text-center ${
                    isSelected ? 'text-sky-950 font-black' : 'text-stone-500 group-hover:text-stone-800'
                  }`}>
                    {isHi ? m.monthHi : m.monthEn}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Month Summary Drilldown */}
        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-xl">📅</span>
            <div>
              <span className="font-black text-sky-950">
                {isHi ? activeMonthData.monthHi : activeMonthData.monthEn}: {activeMonthData.liters} {isHi ? 'लीटर दूध' : 'Liters Milk'}
              </span>
              <span className="text-sky-700 ml-2">
                (≈ ₹{activeMonthData.income.toLocaleString('en-IN')} {isHi ? 'कमाई' : 'income'})
              </span>
            </div>
          </div>
          <div className="text-sky-900 font-bold">
            {isHi ? 'औसत दैनिक उत्पादन:' : 'Average Daily:'} {(activeMonthData.liters / 30).toFixed(1)} L/{isHi ? 'दिन' : 'day'}
          </div>
        </div>
      </div>

      {/* 2-Column Section: Expense Distribution & Milking Champions */}
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
              {isHi ? 'दाना, दवाई, मजदूरी और अन्य खर्चों का वितरण' : 'Breakdown by category across feed, medicine, wages and shed care'}
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
                {isHi ? 'डेयरी का सुनहरा नियम:' : 'Golden Dairy Rule:'}
              </span>
              <p className="font-normal text-amber-900 mt-0.5">
                {isHi 
                  ? 'सफल डेयरी में चारे का खर्च दूध की कुल कमाई के 60% से कम रहना चाहिए।'
                  : 'For healthy dairy profits, total feed expenditure should remain under 60% of milk revenue.'}
              </p>
            </div>
          </div>
        </div>

        {/* Top Milking Champions */}
        <div className="p-5 sm:p-7 rounded-3xl bg-white border border-stone-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                  {isHi ? 'दूध की रानी (शीर्ष पशु)' : 'Top Milking Animals'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {isHi ? 'आपके फार्म में सबसे ज्यादा दूध देने वाले पशु' : 'Highest producing cows and goats on your farm'}
              </p>
            </div>
            <Award className="w-6 h-6 text-amber-500 shrink-0" />
          </div>

          <div className="divide-y divide-stone-100">
            {milkingLeaderboard.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                {isHi ? 'अभी किसी पशु का दूध दर्ज नहीं है।' : 'No animals with active milk records.'}
              </div>
            ) : (
              milkingLeaderboard.map((animal, rank) => {
                const rankBadges = ['🥇', '🥈', '🥉', '🎖️'];

                return (
                  <div
                    key={animal.id}
                    onClick={() => onSelectAnimal(animal)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50 p-2 rounded-2xl transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xl shrink-0">{rankBadges[rank] || '🐄'}</span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-black text-stone-900 text-xs sm:text-sm group-hover:text-emerald-800 transition-colors truncate">
                            {animal.name}
                          </h4>
                          <span className="text-[10px] font-mono font-bold text-stone-400">
                            ({animal.tagId})
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-500 truncate">
                          {animal.breed} · {animal.species}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-emerald-800 font-mono">
                          {animal.dailyMilkLitres} L/{isHi ? 'दिन' : 'day'}
                        </div>
                        <div className="text-[10px] text-stone-400 font-medium">
                          ≈ ₹{((animal.dailyMilkLitres || 0) * 50).toFixed(0)}/{isHi ? 'दिन' : 'day'}
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
              {isHi ? 'रोज का दूध या चारा खर्च दर्ज करें' : 'Record milk or feed expenses in diary'}
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
