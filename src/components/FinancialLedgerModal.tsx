import React, { useState } from 'react';
import { Farm, User, FinancialRecord, TransactionType, ExpenseCategory, IncomeCategory } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Plus, 
  Trash2, 
  Search,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight
} from 'lucide-react';

interface FinancialLedgerModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onAddTransaction: (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => void;
  onDeleteTransaction: (recordId: string) => void;
}

interface CategoryOption {
  name: string;
  icon: string;
  labelEn: string;
  labelHi: string;
  defaultTitleEn: string;
  defaultTitleHi: string;
}

const EXPENSE_CATEGORIES: CategoryOption[] = [
  { name: 'Feed & Fodder', icon: '🌾', labelEn: 'Feed & Fodder', labelHi: 'पशु आहार (दाना-भूसा)', defaultTitleEn: 'Feed & Green Fodder', defaultTitleHi: 'पशु आहार व भूसा' },
  { name: 'Medicine & Doctor', icon: '💊', labelEn: 'Medicine & Vet', labelHi: 'दवाई व डॉक्टर', defaultTitleEn: 'Doctor & Medicine', defaultTitleHi: 'डॉक्टर फीस व दवाई' },
  { name: 'Vaccination', icon: '💉', labelEn: 'Vaccine Shot', labelHi: 'टीकाकरण', defaultTitleEn: 'Vaccination Dose', defaultTitleHi: 'टीकाकरण खर्च' },
  { name: 'Worker Wages', icon: '👥', labelEn: 'Worker Wages', labelHi: 'मजदूरों की मजदूरी', defaultTitleEn: 'Labour Wages', defaultTitleHi: 'मजदूरों की मजदूरी' },
  { name: 'Transport & Fuel', icon: '🚛', labelEn: 'Transport & Fuel', labelHi: 'किराया व डीज़ल', defaultTitleEn: 'Milk & Cattle Transport', defaultTitleHi: 'परिवहन किराया' },
  { name: 'Equipment & Shed', icon: '🛠️', labelEn: 'Shed & Equipment', labelHi: 'शेड व उपकरण', defaultTitleEn: 'Shed Repair & Tools', defaultTitleHi: 'शेड मरम्मत व बर्तन' },
  { name: 'Other Expense', icon: '📋', labelEn: 'Other Expense', labelHi: 'अन्य खर्च', defaultTitleEn: 'Farm Expense', defaultTitleHi: 'अन्य खर्च' },
];

const INCOME_CATEGORIES: CategoryOption[] = [
  { name: 'Milk Sales', icon: '🥛', labelEn: 'Milk Sales', labelHi: 'दूध बिक्री', defaultTitleEn: 'Daily Milk Sales', defaultTitleHi: 'डेयरी दूध बिक्री' },
  { name: 'Animal Sale', icon: '🐐', labelEn: 'Goat & Sheep Sale', labelHi: 'बकरा/मेढ़ा बिक्री', defaultTitleEn: 'Buck / Ram Livestock Sale', defaultTitleHi: 'बकरा व मेढ़ा बिक्री' },
  { name: 'Dung & Manure', icon: '🌱', labelEn: 'Manure & Compost', labelHi: 'खाद बिक्री', defaultTitleEn: 'Organic Flock Manure Sale', defaultTitleHi: 'जैविक खाद बिक्री' },
  { name: 'Eggs & Wool', icon: '🐑', labelEn: 'Wool & Fleece', labelHi: 'ऊन बिक्री', defaultTitleEn: 'Sheep Wool Harvest Sale', defaultTitleHi: 'भेड़ की ऊन बिक्री' },
  { name: 'Government Aid', icon: '🏛️', labelEn: 'Govt Subsidy', labelHi: 'सरकारी अनुदान', defaultTitleEn: 'Flock Scheme Subsidy', defaultTitleHi: 'पशुपालन सब्सिडी' },
  { name: 'Other Income', icon: '💰', labelEn: 'Other Income', labelHi: 'अन्य कमाई', defaultTitleEn: 'Other Farm Income', defaultTitleHi: 'अन्य कमाई' },
];

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const FinancialLedgerModal: React.FC<FinancialLedgerModalProps> = ({
  farm,
  currentUser,
  onClose,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const records = farm.financialRecords || [];

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [transType, setTransType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].name);
  const [title, setTitle] = useState<string>(isHi ? EXPENSE_CATEGORIES[0].defaultTitleHi : EXPENSE_CATEGORIES[0].defaultTitleEn);
  const [notes, setNotes] = useState<string>('');
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Filters
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Calculations
  const totalIncome = records
    .filter(r => r.type === 'income')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalExpense = records
    .filter(r => r.type === 'expense')
    .reduce((sum, r) => sum + r.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  const filteredRecords = records.filter(r => {
    const matchesType = filterType === 'all' || r.type === filterType;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || 
      r.title.toLowerCase().includes(q) || 
      r.category.toLowerCase().includes(q) || 
      (r.notes && r.notes.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  const handleSelectQuickCategory = (cat: CategoryOption) => {
    setCategory(cat.name);
    setTitle(isHi ? cat.defaultTitleHi : cat.defaultTitleEn);
  };

  const handleAddPresetAmount = (value: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return;
    if (!title.trim()) return;

    onAddTransaction({
      farmId: farm.id,
      date,
      type: transType,
      category,
      amount: parsedAmount,
      title: title.trim(),
      notes: notes.trim() || undefined,
      recordedBy: currentUser.name,
    });

    setAmount('');
    setTitle(transType === 'expense' 
      ? (isHi ? EXPENSE_CATEGORIES[0].defaultTitleHi : EXPENSE_CATEGORIES[0].defaultTitleEn)
      : (isHi ? INCOME_CATEGORIES[0].defaultTitleHi : INCOME_CATEGORIES[0].defaultTitleEn)
    );
    setNotes('');
    setShowForm(false);
  };

  const setToday = () => {
    setDate(new Date().toISOString().split('T')[0]);
  };

  const setYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setDate(d.toISOString().split('T')[0]);
  };

  const getCategoryIcon = (cat: string, type: TransactionType) => {
    if (type === 'income') {
      if (cat.includes('Milk')) return '🥛';
      if (cat.includes('Animal')) return '🐄';
      if (cat.includes('Dung')) return '🌱';
      if (cat.includes('Eggs')) return '🥚';
      if (cat.includes('Government')) return '🏛️';
      return '💰';
    }
    if (cat.includes('Feed')) return '🌾';
    if (cat.includes('Medicine')) return '💊';
    if (cat.includes('Vaccin')) return '💉';
    if (cat.includes('Wages')) return '👥';
    if (cat.includes('Equipment')) return '🛠️';
    if (cat.includes('Transport')) return '🚛';
    return '📋';
  };

  const currentCategoryList = transType === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[96vh]">
        
        {/* Header - Large Touch Friendly */}
        <div className="px-4 sm:px-6 py-4 border-b border-stone-200 bg-[#FFFDF9] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl font-black shrink-0 shadow-2xs">
              ₹
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-stone-900 tracking-tight">
                  {isHi ? 'किसान बहीखाता' : 'Farm Money Ledger'}
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950">
                  {records.length} {isHi ? 'रिकॉर्ड' : 'records'}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium truncate">
                {isHi ? `${farm.name} · दूध बिक्री कमाई और दाना-दवाई का सरल हिसाब` : `${farm.name} · Daily milk income and farm expenses tracking`}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer shrink-0 transition-colors"
            title={isHi ? 'बंद करें' : 'Close'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Profit & Loss Summary Cards */}
        <div className="p-3 sm:p-5 bg-stone-50 border-b border-stone-200">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {/* Income Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-emerald-200 shadow-xs flex sm:flex-col justify-between items-center sm:items-start">
              <div>
                <span className="text-[11px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                  <span>{isHi ? 'कुल कमाई (पैसे आए)' : 'Total Income'}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">
                  ₹{totalIncome.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block mt-1">
                {isHi ? 'दूध, पशु व गोबर बिक्री' : 'Milk, animal & produce sales'}
              </span>
            </div>

            {/* Expense Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-red-200 shadow-xs flex sm:flex-col justify-between items-center sm:items-start">
              <div>
                <span className="text-[11px] font-black text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                  <span>{isHi ? 'कुल खर्च (पैसे गए)' : 'Total Expenses'}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-red-900 mt-1 font-mono">
                  ₹{totalExpense.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block mt-1">
                {isHi ? 'दाना, चारा, डॉक्टर व मजदूरी' : 'Feed, medicine, doctor & wages'}
              </span>
            </div>

            {/* Net Profit */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border-2 shadow-xs flex sm:flex-col justify-between items-center sm:items-start ${
              netProfit >= 0 ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-red-900 text-white border-red-800'
            }`}>
              <div>
                <span className="text-[11px] font-black text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💰 {isHi ? 'शुद्ध बचत (मुनाफा)' : 'Net Profit'}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 mt-1">
                {profitMargin}% {isHi ? 'मुनाफा' : 'Margin'}
              </span>
            </div>
          </div>

          {/* Simple Farmer Tip */}
          <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              {isHi
                ? (netProfit >= 0 
                    ? `बधाई! आपकी डेयरी ₹${netProfit.toLocaleString('en-IN')} के शुद्ध फायदे में चल रही है।` 
                    : 'सावधानी: इस समय खर्च कमाई से अधिक है। चारे और मजदूरी की लागत संतुलित करें।')
                : (netProfit >= 0 
                    ? `Great job! Your farm is running profitably at +₹${netProfit.toLocaleString('en-IN')}.` 
                    : 'Attention: Expenses currently exceed income. Check feed and medicine costs to restore profit.')}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4">
          
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 bg-stone-100 p-1.5 rounded-2xl overflow-x-auto">
              {[
                { id: 'all', label: isHi ? 'सभी' : 'All' },
                { id: 'income', label: isHi ? '🟢 कमाई' : '🟢 Income' },
                { id: 'expense', label: isHi ? '🔴 खर्च' : '🔴 Expense' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setFilterType(tab.id as any)}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                    filterType === tab.id
                      ? 'bg-white text-stone-900 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Quick Add Button */}
            <button
              onClick={() => {
                setShowForm(!showForm);
                if (!showForm) {
                  setAmount('');
                }
              }}
              className={`w-full sm:w-auto px-5 py-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all ${
                showForm 
                  ? 'bg-stone-800 text-white hover:bg-stone-900' 
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>
                {showForm 
                  ? (isHi ? 'बंद करें' : 'Close Form') 
                  : (isHi ? '+ नया खर्च या कमाई लिखें' : '+ Record Expense / Income')}
              </span>
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isHi ? 'खर्च या आमदनी खोजें (जैसे: दाना, दूध, डॉक्टर)...' : 'Search by item, category or note (feed, milk, doctor)...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white font-medium"
            />
          </div>

          {/* Simple Farmer Recording Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 space-y-5">
              
              {/* STEP 1: Toggle Expense or Income */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {isHi ? 'कदम 1: क्या हुआ?' : 'Step 1: Select Type'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTransType('expense');
                      setCategory(EXPENSE_CATEGORIES[0].name);
                      setTitle(isHi ? EXPENSE_CATEGORIES[0].defaultTitleHi : EXPENSE_CATEGORIES[0].defaultTitleEn);
                    }}
                    className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-2 cursor-pointer transition-all ${
                      transType === 'expense'
                        ? 'bg-red-600 border-red-700 text-white shadow-md'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🔴</span>
                    <span>{isHi ? 'खर्च हुआ (Expense)' : 'Money Spent (Expense)'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransType('income');
                      setCategory(INCOME_CATEGORIES[0].name);
                      setTitle(isHi ? INCOME_CATEGORIES[0].defaultTitleHi : INCOME_CATEGORIES[0].defaultTitleEn);
                    }}
                    className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-2 cursor-pointer transition-all ${
                      transType === 'income'
                        ? 'bg-emerald-700 border-emerald-800 text-white shadow-md'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🟢</span>
                    <span>{isHi ? 'पैसे मिले (Income)' : 'Money Received (Income)'}</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Category Chips */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {isHi ? 'कदम 2: किस चीज़ के लिए?' : 'Step 2: Choose Category'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {currentCategoryList.map(cat => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => handleSelectQuickCategory(cat)}
                      className={`p-2.5 rounded-2xl text-left border-2 text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
                        category === cat.name
                          ? 'bg-amber-100 border-amber-600 text-stone-900 shadow-xs'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{isHi ? cat.labelHi : cat.labelEn}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Amount in Rupees */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {isHi ? 'कदम 3: कितने रुपये?' : 'Step 3: Amount in Rupees (₹)'}
                </label>
                
                {/* Big Input */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-black text-stone-400">₹</span>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 text-2xl sm:text-3xl font-black font-mono bg-white text-stone-900 shadow-inner focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                {/* Quick Add Chips */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1">
                  <span className="text-[11px] font-bold text-stone-500 shrink-0">
                    {isHi ? 'तेजी से जोड़ें:' : 'Quick Add:'}
                  </span>
                  {PRESET_AMOUNTS.map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handleAddPresetAmount(val)}
                      className="px-2.5 py-1 rounded-xl bg-white border border-stone-300 text-xs font-mono font-black text-stone-800 hover:bg-stone-100 cursor-pointer shrink-0"
                    >
                      +₹{val}
                    </button>
                  ))}
                  {amount && (
                    <button
                      type="button"
                      onClick={() => setAmount('')}
                      className="px-2 py-1 rounded-xl bg-stone-200 text-stone-700 text-xs font-bold hover:bg-stone-300 cursor-pointer shrink-0"
                    >
                      {isHi ? 'हटाएं' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 4: Date & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700">{isHi ? 'तारीख' : 'Date'}</label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={setToday}
                        className="text-[10px] font-black text-emerald-800 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100"
                      >
                        {isHi ? 'आज' : 'Today'}
                      </button>
                      <button
                        type="button"
                        onClick={setYesterday}
                        className="text-[10px] font-black text-stone-600 px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200"
                      >
                        {isHi ? 'कल' : 'Yesterday'}
                      </button>
                    </div>
                  </div>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-mono font-bold bg-white"
                  />
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {isHi ? 'विवरण' : 'Title / Item'}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={isHi ? 'जैसे: 2 बोरी दाना या दूध बिक्री' : 'e.g. 2 bags cattle feed or morning milk sale'}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {isHi ? 'अतिरिक्त टिप्पणी या बिल नंबर (वैकल्पिक)' : 'Notes or Bill / Receipt (Optional)'}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={isHi ? 'जैसे: 150 लीटर दूध @ ₹52 प्रति लीटर' : 'e.g. 150 Liters milk @ ₹52/L or Receipt #402'}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white font-medium"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-2 border-t border-amber-200">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl border border-stone-300 text-xs font-black text-stone-700 cursor-pointer hover:bg-stone-100"
                >
                  {isHi ? 'रद्द करें' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-black cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{isHi ? '✓ बहीखाते में दर्ज करें' : '✓ Save Entry to Ledger'}</span>
                </button>
              </div>

            </form>
          )}

          {/* Transactions List */}
          <div className="border border-stone-200 rounded-3xl overflow-hidden divide-y divide-stone-200 bg-white shadow-2xs">
            {filteredRecords.length === 0 ? (
              <div className="p-10 text-center space-y-2">
                <div className="text-3xl">📒</div>
                <div className="text-xs sm:text-sm font-black text-stone-700">
                  {isHi ? 'अभी कोई लेन-देन नहीं है' : 'No transactions recorded yet'}
                </div>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  {isHi 
                    ? 'दूध की कमाई और दाना-दवाई का खर्च दर्ज करने के लिए ऊपर "+ नया खर्च या कमाई लिखें" बटन दबाएं।' 
                    : 'Tap "+ Record Expense / Income" above to log milk revenue or feed and medicine expenses.'}
                </p>
              </div>
            ) : (
              filteredRecords.map(record => {
                const isIncome = record.type === 'income';

                return (
                  <div
                    key={record.id}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-stone-50/80 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 shadow-2xs ${
                        isIncome ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {getCategoryIcon(record.category, record.type)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            isIncome ? 'bg-emerald-100 text-emerald-900' : 'bg-red-100 text-red-900'
                          }`}>
                            {record.category}
                          </span>
                          <span className="font-mono text-xs text-stone-500 font-bold">
                            {record.date}
                          </span>
                        </div>

                        <h4 className="font-black text-stone-900 text-xs sm:text-sm mt-0.5 truncate">
                          {record.title}
                        </h4>

                        {record.notes && (
                          <p className="text-[11px] text-stone-500 truncate">
                            {record.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-base sm:text-lg font-black font-mono ${
                          isIncome ? 'text-emerald-800' : 'text-red-700'
                        }`}>
                          {isIncome ? '+' : '-'}₹{record.amount.toLocaleString('en-IN')}
                        </div>
                        <div className="text-[10px] text-stone-400">
                          {isHi ? 'दर्ज' : 'By'}: {record.recordedBy.split(' ')[0]}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const confirmMsg = isHi
                            ? `क्या आप "${record.title}" (₹${record.amount}) को हटाना चाहते हैं?`
                            : `Delete "${record.title}" (₹${record.amount})?`;
                          if (confirm(confirmMsg)) {
                            onDeleteTransaction(record.id);
                          }
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title={isHi ? 'हटाएं' : 'Delete'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
};
