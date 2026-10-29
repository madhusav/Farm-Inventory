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
  labels: Record<string, string>;
  defaultTitles: Record<string, string>;
}

const EXPENSE_CATEGORIES: CategoryOption[] = [
  {
    name: 'Feed & Fodder',
    icon: '🌾',
    labels: {
      en: 'Feed & Fodder',
      hi: 'पशु आहार व भूसा',
      kn: 'ಮೇವು ಮತ್ತು ಆಹಾರ',
      te: 'మేత మరియు దాణా',
      ta: 'தீவனம் மற்றும் புல்',
      ml: 'തീറ്റയും വൈക്കോലും',
      mr: 'पशुखाद्य व चारा',
    },
    defaultTitles: {
      en: 'Feed & Green Fodder',
      hi: 'पशु आहार व भूसा',
      kn: 'ಹಸಿರು ಮೇವು ಮತ್ತು ಆಹಾರ',
      te: 'పచ్చి మేత మరియు దాణా',
      ta: 'பசுந்தீவனம் மற்றும் தானியங்கள்',
      ml: 'പച്ചപ്പുല്ലും തീറ്റയും',
      mr: 'हिरवा चारा व पशुखाद्य',
    },
  },
  {
    name: 'Medicine & Doctor',
    icon: '💊',
    labels: {
      en: 'Medicine & Vet',
      hi: 'दवाई व डॉक्टर',
      kn: 'ಔಷಧಿ ಮತ್ತು ಪಶುವೈದ್ಯ',
      te: 'మందులు మరియు వెట్',
      ta: 'மருந்து மற்றும் கால்நடை மருத்துவர்',
      ml: 'മരുന്നും വെറ്ററിനറിയും',
      mr: 'औषध व डॉक्टर',
    },
    defaultTitles: {
      en: 'Doctor & Medicine',
      hi: 'डॉक्टर फीस व दवाई',
      kn: 'ವೈದ್ಯರ ಶುಲ್ಕ ಮತ್ತು ಔಷಧಿ',
      te: 'డాక్టర్ ఫీజు మరియు మందులు',
      ta: 'மருத்துவர் கட்டணம் & மருந்து',
      ml: 'ഡോക്ടർ ഫീസും മരുന്നും',
      mr: 'डॉक्टर फी व औषधे',
    },
  },
  {
    name: 'Vaccination',
    icon: '💉',
    labels: {
      en: 'Vaccine Shot',
      hi: 'टीकाकरण',
      kn: 'ಲಸಿಕೆ',
      te: 'టీకా',
      ta: 'தடுப்பூசி',
      ml: 'പ്രതിരോധ കുത്തിവയ്പ്പ്',
      mr: 'लसीकरण',
    },
    defaultTitles: {
      en: 'Vaccination Dose',
      hi: 'टीकाकरण खर्च',
      kn: 'ಲಸಿಕೆ ವೆಚ್ಚ',
      te: 'టీకా ఖర్చు',
      ta: 'தடுப்பூசி செலவு',
      ml: 'കുത്തിവയ്പ്പ് ചിലവ്',
      mr: 'लसीकरण खर्च',
    },
  },
  {
    name: 'Worker Wages',
    icon: '👥',
    labels: {
      en: 'Worker Wages',
      hi: 'मजदूरों की मजदूरी',
      kn: 'ಕೆಲಸಗಾರರ ಕೂಲಿ',
      te: 'కూలీల వేతనాలు',
      ta: 'பணியாளர் கூலி',
      ml: 'തൊഴിലാളി കൂലി',
      mr: 'मजुरांची मजुरी',
    },
    defaultTitles: {
      en: 'Labour Wages',
      hi: 'मजदूरों की मजदूरी',
      kn: 'ಕೂಲಿ ವೇತನ',
      te: 'కూలీ ఖర్చులు',
      ta: 'கூலி செலவு',
      ml: 'കൂലി ചിലവ്',
      mr: 'मजुरी खर्च',
    },
  },
  {
    name: 'Transport & Fuel',
    icon: '🚛',
    labels: {
      en: 'Transport & Fuel',
      hi: 'किराया व डीज़ल',
      kn: 'ಸಾರಿಗೆ ಮತ್ತು ಇಂಧನ',
      te: 'రవాణా మరియు ఇంధనం',
      ta: 'போக்குவரத்து மற்றும் எரிபொருள்',
      ml: 'ഗതാഗതവും ഇന്ധനവും',
      mr: 'वाहतूक व इंधन',
    },
    defaultTitles: {
      en: 'Milk & Cattle Transport',
      hi: 'परिवहन किराया',
      kn: 'ಹಾಲು ಮತ್ತು ಜಾನುವಾರು ಸಾರಿಗೆ',
      te: 'రవాణా చార్జీలు',
      ta: 'பால் மற்றும் கால்நடை போக்குவரத்து',
      ml: 'പാൽ ഗതാഗതം',
      mr: 'दूध व पशु वाहतूक',
    },
  },
  {
    name: 'Equipment & Shed',
    icon: '🛠️',
    labels: {
      en: 'Shed & Equipment',
      hi: 'शेड व उपकरण',
      kn: 'ಶೆಡ್ ಮತ್ತು ಉಪಕರಣ',
      te: 'షెడ్ మరియు పరికరాలు',
      ta: 'கொட்டகை மற்றும் உபகரணங்கள்',
      ml: 'ഷെഡ്ഡും ഉപകരണങ്ങളും',
      mr: 'शेड व उपकरणे',
    },
    defaultTitles: {
      en: 'Shed Repair & Tools',
      hi: 'शेड मरम्मत व बर्तन',
      kn: 'ಶೆಡ್ ದುರಸ್ತಿ ಮತ್ತು ಉಪಕರಣಗಳು',
      te: 'షెడ్ మరమ్మత్తు మరియు పరికరాలు',
      ta: 'கொட்டகை பழுது மற்றும் கருவிகள்',
      ml: 'ഷെഡ് അറ്റകുറ്റപ്പണി',
      mr: 'शेड दुरुस्ती व उपकरणे',
    },
  },
  {
    name: 'Other Expense',
    icon: '📋',
    labels: {
      en: 'Other Expense',
      hi: 'अन्य खर्च',
      kn: 'ಇತರ ಖರ್ಚು',
      te: 'ఇతర ఖర్చులు',
      ta: 'இதர செலவு',
      ml: 'മറ്റ് ചിലവുകൾ',
      mr: 'इतर खर्च',
    },
    defaultTitles: {
      en: 'Farm Expense',
      hi: 'अन्य खर्च',
      kn: 'ಇತರ ಫಾರ್ಮ್ ಖರ್ಚು',
      te: 'ఇతర ఫారం ఖర్చు',
      ta: 'இதர பண்ணை செலவு',
      ml: 'മറ്റ് ചിലവുകൾ',
      mr: 'इतर फार्म खर्च',
    },
  },
];

const INCOME_CATEGORIES: CategoryOption[] = [
  {
    name: 'Milk Sales',
    icon: '🥛',
    labels: {
      en: 'Milk Sales',
      hi: 'दूध बिक्री',
      kn: 'ಹಾಲು ಮಾರಾಟ',
      te: 'పాలు విక్రయం',
      ta: 'பால் விற்பனை',
      ml: 'പാൽ വിൽപ്പന',
      mr: 'दूध विक्री',
    },
    defaultTitles: {
      en: 'Daily Milk Sales',
      hi: 'डेयरी दूध बिक्री',
      kn: 'ದೈನಂದಿನ ಹಾಲು ಮಾರಾಟ',
      te: 'రోజువారీ పాల విక్రయం',
      ta: 'தினசரி பால் விற்பனை',
      ml: 'പ്രതിദിന പാൽ വിൽപ്പന',
      mr: 'दैनिक दूध विक्री',
    },
  },
  {
    name: 'Animal Sale',
    icon: '🐐',
    labels: {
      en: 'Goat & Sheep Sale',
      hi: 'बकरा/मेढ़ा बिक्री',
      kn: 'ಮೇಕೆ ಮತ್ತು ಕುರಿ ಮಾರಾಟ',
      te: 'మేక మరియు గొర్రె విక్రయం',
      ta: 'ஆடு மற்றும் செம்மறியாடு விற்பனை',
      ml: 'ആട് വിൽപ്പന',
      mr: 'शेळी व मेंढी विक्री',
    },
    defaultTitles: {
      en: 'Buck / Ram Livestock Sale',
      hi: 'बकरा व मेढ़ा बिक्री',
      kn: 'ಹೋತ ಮತ್ತು ಟಗರು ಮಾರಾಟ',
      te: 'మేకపోతు / పొట్టేలు విక్రయం',
      ta: 'ஆட்டுக்கிடா விற்பனை',
      ml: 'ആട് വിൽപ്പന വരുമാനം',
      mr: 'बोकड व मेंढा विक्री',
    },
  },
  {
    name: 'Dung & Manure',
    icon: '🌱',
    labels: {
      en: 'Manure & Compost',
      hi: 'खाद बिक्री',
      kn: 'ಗೊಬ್ಬರ ಮಾರಾಟ',
      te: 'ఎరువు విక్రయం',
      ta: 'எரு விற்பனை',
      ml: 'വളം വിൽപ്പന',
      mr: 'शेणखत विक्री',
    },
    defaultTitles: {
      en: 'Organic Flock Manure Sale',
      hi: 'जैविक खाद बिक्री',
      kn: 'ಸಾವಯವ ಗೊಬ್ಬರ ಮಾರಾಟ',
      te: 'సేంద్రీయ ఎరువు విక్రయం',
      ta: 'இயற்கை எரு விற்பனை',
      ml: 'ജൈവവളം വിൽപ്പന',
      mr: 'सेंद्रिय खत विक्री',
    },
  },
  {
    name: 'Eggs & Wool',
    icon: '🐑',
    labels: {
      en: 'Wool & Fleece',
      hi: 'ऊन बिक्री',
      kn: 'ಉಣ್ಣೆ ಮಾರಾಟ',
      te: 'ఉన్ని విక్రయం',
      ta: 'கம்பளி விற்பனை',
      ml: 'കമ്പിളി വിൽപ്പന',
      mr: 'लोकर विक्री',
    },
    defaultTitles: {
      en: 'Sheep Wool Harvest Sale',
      hi: 'भेड़ की ऊन बिक्री',
      kn: 'ಕುರಿ ಉಣ್ಣೆ ಮಾರಾಟ',
      te: 'గొర్రెల ఉన్ని విక్రయం',
      ta: 'செம்மறி கம்பளி விற்பனை',
      ml: 'കമ്പിളി വിൽപ്പന',
      mr: 'मेंढ्याची लोकर विक्री'
    },
  },
  {
    name: 'Government Aid',
    icon: '🏛️',
    labels: {
      en: 'Govt Subsidy',
      hi: 'सरकारी अनुदान',
      kn: 'ಸರ್ಕಾರಿ ಸಬ್ಸಿಡಿ',
      te: 'ప్రభుత్వ సబ్సిడీ',
      ta: 'அரசு மானியம்',
      ml: 'സർക്കാർ സബ്‌സിഡി',
      mr: 'सरकारी अनुदान',
    },
    defaultTitles: {
      en: 'Flock Scheme Subsidy',
      hi: 'पशुपालन सब्सिडी',
      kn: 'ಪಶುಸಂಗೋಪನೆ ಸಬ್ಸಿಡಿ',
      te: 'పశుసంవర్ಧక సబ్సిడీ',
      ta: 'கால்நடை மானியம்',
      ml: 'പദ്ധതി സബ്‌സിഡി',
      mr: 'पशुसंवर्धन योजना अनुदान',
    },
  },
  {
    name: 'Other Income',
    icon: '💰',
    labels: {
      en: 'Other Income',
      hi: 'अन्य कमाई',
      kn: 'ಇತರ ಆದಾಯ',
      te: 'ఇతర ఆదాయం',
      ta: 'இதர வருமானம்',
      ml: 'മറ്റ് വരുമാനം',
      mr: 'इतर उत्पन्न',
    },
    defaultTitles: {
      en: 'Other Farm Income',
      hi: 'अन्य कमाई',
      kn: 'ಇತರ ಫಾರ್ಮ್ ಆದಾಯ',
      te: 'ఇతర ఫారం ఆదాయం',
      ta: 'இதர பண்ணை வருமானம்',
      ml: 'മറ്റ് വരുമാനം',
      mr: 'इतर शेती उत्पन्न',
    },
  },
];

const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000];

export const FinancialLedgerModal: React.FC<FinancialLedgerModalProps> = ({
  farm,
  currentUser,
  onClose,
  onAddTransaction,
  onDeleteTransaction,
}) => {
  const { lang, t, localeText } = useLanguage();
  const records = farm.financialRecords || [];

  const getDefTitle = (cat: CategoryOption) => {
    return cat.defaultTitles[lang] || cat.defaultTitles['en'] || cat.name;
  };

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [transType, setTransType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>(EXPENSE_CATEGORIES[0].name);
  const [title, setTitle] = useState<string>(() => getDefTitle(EXPENSE_CATEGORIES[0]));
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
    setTitle(getDefTitle(cat));
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
      ? getDefTitle(EXPENSE_CATEGORIES[0])
      : getDefTitle(INCOME_CATEGORIES[0])
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
                  {localeText({
                    en: 'Farm Money Ledger',
                    hi: 'किसान बहीखाता',
                    kn: 'ರೈತರ ಲೆಕ್ಕಪುಸ್ತಕ',
                    te: 'రైతు ఖాతా పుస్తకం',
                    ta: 'பண்ணை வரவு-செலவு புத்தகம்',
                    ml: 'കർഷക വരവ്-ചിലവ് പുസ്തകം',
                    mr: 'शेतकरी हिशोब वही',
                  })}
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-950">
                  {records.length} {localeText({
                    en: 'records',
                    hi: 'रिकॉर्ड',
                    kn: 'ದಾಖಲೆಗಳು',
                    te: 'రికార్డులు',
                    ta: 'பதிவுகள்',
                    ml: 'രേഖകൾ',
                    mr: 'नोंदी',
                  })}
                </span>
              </div>
              <p className="text-xs text-stone-500 font-medium truncate">
                {farm.name} · {localeText({
                  en: 'Daily milk income and farm expenses tracking',
                  hi: 'दूध बिक्री कमाई और दाना-दवाई का सरल हिसाब',
                  kn: 'ದೈನಂದಿನ ಹಾಲು ಆದಾಯ ಮತ್ತು ವೆಚ್ಚಗಳ ಟ್ರ್ಯಾಕಿಂಗ್',
                  te: 'రోజువారీ పాల ఆదాయం మరియు ఖర్చుల నిర్వహణ',
                  ta: 'தினசரி பால் வருமானம் மற்றும் பண்ணை செலவுகள்',
                  ml: 'പാൽ വരുമാനവും കൃഷി ചിലവുകളും രേഖപ്പെടുത്തൽ',
                  mr: 'दैनिक दूध उत्पन्न आणि शेती खर्चाची नोंद',
                })}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-2xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-700 cursor-pointer shrink-0 transition-colors"
            title={localeText({
              en: 'Close',
              hi: 'बंद करें',
              kn: 'ಮುಚ್ಚಿ',
              te: 'మూసివేయి',
              ta: 'மூடு',
              ml: 'അടയ്ക്കുക',
              mr: 'बंद करा',
            })}
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
                  <span>{localeText({
                    en: 'Total Income',
                    hi: 'कुल कमाई (पैसे आए)',
                    kn: 'ಒಟ್ಟು ಆದಾಯ (ಬಂದ ಹಣ)',
                    te: 'మొత్తం ఆదాయం (వచ్చినవి)',
                    ta: 'மொத்த வருமானம் (வரவு)',
                    ml: 'ആകെ വരുമാനം (വരവ്)',
                    mr: 'एकूण उत्पन्न (आवक)',
                  })}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-emerald-900 mt-1 font-mono">
                  ₹{totalIncome.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block mt-1">
                {localeText({
                  en: 'Milk, animal & produce sales',
                  hi: 'दूध, पशु व गोबर बिक्री',
                  kn: 'ಹಾಲು, ಪ್ರಾಣಿ ಮತ್ತು ಗೊಬ್ಬರ ಮಾರಾಟ',
                  te: 'పాలు, జంతువులు మరియు ఎరువుల విక్రయం',
                  ta: 'பால், விலங்கு மற்றும் எரு விற்பனை',
                  ml: 'പാൽ, കന്നുകാലി, വളം വിൽപ്പന',
                  mr: 'दूध, जनावरे व शेणखत विक्री',
                })}
              </span>
            </div>

            {/* Expense Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-red-200 shadow-xs flex sm:flex-col justify-between items-center sm:items-start">
              <div>
                <span className="text-[11px] font-black text-red-800 uppercase tracking-wider flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-red-600" />
                  <span>{localeText({
                    en: 'Total Expenses',
                    hi: 'कुल खर्च (पैसे गए)',
                    kn: 'ಒಟ್ಟು ಖರ್ಚು (ಹೋದ ಹಣ)',
                    te: 'మొత్తం ఖర్చులు (పోయినవి)',
                    ta: 'மொத்த செலவுகள் (செலவு)',
                    ml: 'ആകെ ചിലവുകൾ (ചിലവ്)',
                    mr: 'एकूण खर्च (जावक)',
                  })}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-red-900 mt-1 font-mono">
                  ₹{totalExpense.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[11px] text-stone-500 font-medium hidden sm:block mt-1">
                {localeText({
                  en: 'Feed, medicine, doctor & wages',
                  hi: 'दाना, चारा, डॉक्टर व मजदूरी',
                  kn: 'ಮೇವು, ಔಷಧಿ, ಪಶುವೈದ್ಯ ಮತ್ತು ಕೂಲಿ',
                  te: 'మేత, మందులు, డాక్టర్ మరియు కూలీ',
                  ta: 'தீவனம், மருந்து, மருத்துவர் & கூலி',
                  ml: 'തീറ്റ, മരുന്ന്, ഡോക്ടർ, കൂലി',
                  mr: 'चारा, औषध, डॉक्टर आणि मजुरी',
                })}
              </span>
            </div>

            {/* Net Profit */}
            <div className={`p-3.5 sm:p-4 rounded-2xl border-2 shadow-xs flex sm:flex-col justify-between items-center sm:items-start ${
              netProfit >= 0 ? 'bg-emerald-900 text-white border-emerald-800' : 'bg-red-900 text-white border-red-800'
            }`}>
              <div>
                <span className="text-[11px] font-black text-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span>💰 {localeText({
                    en: 'Net Profit',
                    hi: 'शुद्ध बचत (मुनाफा)',
                    kn: 'ನಿವ್ವಳ ಲಾಭ',
                    te: 'నికర లాభం',
                    ta: 'நிகர லாபம்',
                    ml: 'അറ്റാദായം',
                    mr: 'निव्वळ नफा',
                  })}</span>
                </span>
                <div className="text-xl sm:text-2xl font-black text-white mt-1 font-mono">
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>
              </div>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white/20 mt-1">
                {profitMargin}% {localeText({
                  en: 'Margin',
                  hi: 'मुनाफा',
                  kn: 'ಲಾಭಾಂಶ',
                  te: 'మార్జిన్',
                  ta: 'விளிம்பு',
                  ml: 'ലാഭം',
                  mr: 'नफा',
                })}
              </span>
            </div>
          </div>

          {/* Simple Farmer Tip */}
          <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-950 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              {netProfit >= 0
                ? localeText({
                    en: `Great job! Your farm is running profitably at +₹${totalIncome - totalExpense}.`,
                    hi: `बधाई! आपकी डेयरी ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} के शुद्ध फायदे में चल रही है।`,
                    kn: `ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಫಾರ್ಮ್ ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} ಲಾಭದಲ್ಲಿದೆ.`,
                    te: `అభినందనలు! మీ ఫారం ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} లాభంలో నడుస్తోంది.`,
                    ta: `வாழ்த்துகள்! உங்கள் பண்ணை ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} லாபத்தில் இயங்குகிறது.`,
                    ml: `അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ ഫാം ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} ലാഭത്തിലാണ്.`,
                    mr: `अभिनंदन! तुमची डेअरी ₹${(totalIncome - totalExpense).toLocaleString('en-IN')} च्या निव्वळ नफ्यात आहे.`,
                  })
                : localeText({
                    en: 'Attention: Expenses currently exceed income. Check feed and medicine costs to restore profit.',
                    hi: 'सावधानी: इस समय खर्च कमाई से अधिक है। चारे और मजदूरी की लागत संतुलित करें।',
                    kn: 'ಎಚ್ಚರಿಕೆ: ಖರ್ಚು ಆದಾಯಕ್ಕಿಂತ ಹೆಚ್ಚಾಗಿದೆ. ಮೇವು ಮತ್ತು ವೆಚ್ಚಗಳನ್ನು ನಿಯಂತ್ರಿಸಿ.',
                    te: 'జాగ్రత్త: ప్రస్తుతం ఖర్చులు ఆదాయం కంటే ఎక్కువగా ఉన్నాయి. మేత ఖర్చులను సమీక్షించండి.',
                    ta: 'கவனம்: செலவுகள் வருமானத்தை விட அதிகமாக உள்ளன. தீவனச் செலவுகளை சமன் செய்யவும்.',
                    ml: 'ശ്രദ്ധിക്കുക: ചിലവുകൾ വരുമാനത്തേക്കാൾ കൂടുതലാണ്. തീറ്റച്ചിലവുകൾ നിയന്ത്രിക്കുക.',
                    mr: 'सावधान: सध्या खर्च उत्पन्नापेक्षा जास्त आहे. चारा व मजुरी खर्च नियंत्रित करा.',
                  })}
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
                {
                  id: 'all',
                  label: localeText({
                    en: 'All',
                    hi: 'सभी',
                    kn: 'ಎಲ್ಲಾ',
                    te: 'అన్నీ',
                    ta: 'அனைத்தும்',
                    ml: 'എല്ലാം',
                    mr: 'सर्व',
                  }),
                },
                {
                  id: 'income',
                  label: `🟢 ${localeText({
                    en: 'Income',
                    hi: 'कमाई',
                    kn: 'ಆದಾಯ',
                    te: 'ఆదాయం',
                    ta: 'வரவு',
                    ml: 'വരവ്',
                    mr: 'आवक',
                  })}`,
                },
                {
                  id: 'expense',
                  label: `🔴 ${localeText({
                    en: 'Expense',
                    hi: 'खर्च',
                    kn: 'ಖರ್ಚು',
                    te: 'ఖర్చు',
                    ta: 'செலவு',
                    ml: 'ചിലവ്',
                    mr: 'खर्च',
                  })}`,
                },
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
                  ? localeText({
                      en: 'Close Form',
                      hi: 'बंद करें',
                      kn: 'ಮುಚ್ಚಿ',
                      te: 'మూసివేయి',
                      ta: 'படிவத்தை மூடு',
                      ml: 'ഫോം അടയ്ക്കുക',
                      mr: 'फॉर्म बंद करा',
                    })
                  : ('+ ' + localeText({
                      en: 'Record Expense / Income',
                      hi: 'नया खर्च या कमाई लिखें',
                      kn: 'ಹೊಸ ಖರ್ಚು ಅಥವಾ ಆದಾಯ ದಾಖಲಿಸಿ',
                      te: 'కొత్త ఖర్చు లేదా ఆదాయాన్ని నమోదు చేయండి',
                      ta: 'புதிய வரவு / செலவை பதிவு செய்',
                      ml: 'പുതിയ വരുമാനം/ചിലവ് രേഖപ്പെടുത്തുക',
                      mr: 'नवीन खर्च किंवा उत्पन्न नोंदवा',
                    }))}
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
              placeholder={localeText({
                en: 'Search by item, category or note (feed, milk, doctor)...',
                hi: 'खर्च या आमदनी खोजें (जैसे: दाना, दूध, डॉक्टर)...',
                kn: 'ಐಟಂ, ವರ್ಗ ಅಥವಾ ಟಿಪ್ಪಣಿ ಮೂಲಕ ಹುಡುಕಿ...',
                te: 'వస్తువు లేదా వర్గం ద్వారా శోధించండి...',
                ta: 'பொருள், வகை அல்லது குறிப்பு மூலம் தேடவும்...',
                ml: 'വസ്തു, വിഭാഗം എന്നിവ പ്രകാരം തിരയുക...',
                mr: 'वस्तू, श्रेणी किंवा नोंदीनुसार शोधा...',
              })}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm bg-white font-medium"
            />
          </div>

          {/* Simple Farmer Recording Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 rounded-3xl bg-amber-50/70 border-2 border-amber-300 space-y-5">
              
              {/* STEP 1: Toggle Expense or Income */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {localeText({
                    en: 'Step 1: Select Type',
                    hi: 'कदम 1: क्या हुआ?',
                    kn: 'ಹಂತ 1: ಯಾವ ವಿಧ?',
                    te: 'దశ 1: ఏ రకం?',
                    ta: 'படி 1: வகையைத் தேர்ந்தெடுக்கவும்',
                    ml: 'ഘട്ടം 1: തരം തിരഞ്ഞെടുക്കുക',
                    mr: 'पायरी 1: व्यवहार प्रकार निवडा',
                  })}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTransType('expense');
                      setCategory(EXPENSE_CATEGORIES[0].name);
                      setTitle(getDefTitle(EXPENSE_CATEGORIES[0]));
                    }}
                    className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-2 cursor-pointer transition-all ${
                      transType === 'expense'
                        ? 'bg-red-600 border-red-700 text-white shadow-md'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🔴</span>
                    <span>{localeText({
                      en: 'Money Spent (Expense)',
                      hi: 'खर्च हुआ (Expense)',
                      kn: 'ಖರ್ಚಾಗಿದೆ (ಖರ್ಚು)',
                      te: 'ఖర్చు అయింది (ఖర్చు)',
                      ta: 'செலவானது (செலவு)',
                      ml: 'ചിലവായി (ചിലവ്)',
                      mr: 'झालेला खर्च (खर्च)',
                    })}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTransType('income');
                      setCategory(INCOME_CATEGORIES[0].name);
                      setTitle(getDefTitle(INCOME_CATEGORIES[0]));
                    }}
                    className={`py-3.5 px-3 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 border-2 cursor-pointer transition-all ${
                      transType === 'income'
                        ? 'bg-emerald-700 border-emerald-800 text-white shadow-md'
                        : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                    }`}
                  >
                    <span className="text-lg">🟢</span>
                    <span>{localeText({
                      en: 'Money Received (Income)',
                      hi: 'पैसे मिले (Income)',
                      kn: 'ಹಣ ಬಂದಿದೆ (ಆದಾಯ)',
                      te: 'డబ్బులు వచ్చాయి (ఆదాయం)',
                      ta: 'பணம் வந்தது (வரவு)',
                      ml: 'പണം ലഭിച്ചു (വരവ്)',
                      mr: 'मिळालेले पैसे (उत्पन्न)',
                    })}</span>
                  </button>
                </div>
              </div>

              {/* STEP 2: Category Chips */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {localeText({
                    en: 'Step 2: Choose Category',
                    hi: 'कदम 2: किस चीज़ के लिए?',
                    kn: 'ಹಂತ 2: ಯಾವ ವರ್ಗ?',
                    te: 'దశ 2: ఏ వర్గం కోసం?',
                    ta: 'படி 2: வகையைத் தேர்ந்தெடுக்கவும்',
                    ml: 'ഘട്ടം 2: വിഭാഗം തിരഞ്ഞെടുക്കുക',
                    mr: 'पायरी 2: कशासाठी?',
                  })}
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
                      <span className="truncate">{cat.labels[lang] || cat.labels['en'] || cat.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* STEP 3: Amount in Rupees */}
              <div>
                <label className="block text-xs font-black text-amber-950 uppercase tracking-wider mb-2">
                  {localeText({
                    en: 'Step 3: Amount in Rupees (₹)',
                    hi: 'कदम 3: कितने रुपये?',
                    kn: 'ಹಂತ 3: ಎಷ್ಟು ರೂಪಾಯಿಗಳು?',
                    te: 'దశ 3: ఎన్ని రూపాయలు?',
                    ta: 'படி 3: தொகை (₹)',
                    ml: 'ഘട്ടം 3: എത്ര രൂപ?',
                    mr: 'पायरी 3: किती रुपये?',
                  })}
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
                    {localeText({
                      en: 'Quick Add:',
                      hi: 'तेजी से जोड़ें:',
                      kn: 'ತ್ವರಿತವಾಗಿ ಸೇರಿಸಿ:',
                      te: 'త్వరితంగా జోడించండి:',
                      ta: 'விரைவாகச் சேர்:',
                      ml: 'പെട്ടെന്ന് ചേർക്കുക:',
                      mr: 'झटपट जोडा:',
                    })}
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
                      {localeText({
                        en: 'Clear',
                        hi: 'हटाएं',
                        kn: 'ಅಳಿಸಿ',
                        te: 'తొలగించు',
                        ta: 'அழி',
                        ml: 'മായ്ക്കുക',
                        mr: 'हटवा',
                      })}
                    </button>
                  )}
                </div>
              </div>

              {/* STEP 4: Date & Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Date Picker */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-700">
                      {localeText({
                        en: 'Date',
                        hi: 'तारीख',
                        kn: 'ದಿನಾಂಕ',
                        te: 'తేదీ',
                        ta: 'தேதி',
                        ml: 'തീയതി',
                        mr: 'तारीख',
                      })}
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={setToday}
                        className="text-[10px] font-black text-emerald-800 px-1.5 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100"
                      >
                        {localeText({
                          en: 'Today',
                          hi: 'आज',
                          kn: 'ಇಂದು',
                          te: 'ఈ రోజు',
                          ta: 'இன்று',
                          ml: 'ഇന്ന്',
                          mr: 'आज',
                        })}
                      </button>
                      <button
                        type="button"
                        onClick={setYesterday}
                        className="text-[10px] font-black text-stone-600 px-1.5 py-0.5 rounded bg-stone-100 hover:bg-stone-200"
                      >
                        {localeText({
                          en: 'Yesterday',
                          hi: 'कल',
                          kn: 'ನಿನ್ನೆ',
                          te: 'నిన్న',
                          ta: 'நேற்று',
                          ml: 'ഇന്നലെ',
                          mr: 'काल',
                        })}
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
                    {localeText({
                      en: 'Title / Item',
                      hi: 'विवरण',
                      kn: 'ವಿವರಣೆ',
                      te: 'వివరణ',
                      ta: 'விவரம்',
                      ml: 'വിവരണം',
                      mr: 'तपशील',
                    })}
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={localeText({
                      en: 'e.g. 2 bags cattle feed or morning milk sale',
                      hi: 'जैसे: 2 बोरी दाना या दूध बिक्री',
                      kn: 'ಉದಾ: 2 ಚೀಲ ಆಹಾರ ಅಥವಾ ಮುಂಜಾನೆಯ ಹಾಲು ಮಾರಾಟ',
                      te: 'ఉదా: 2 బస్తాల మేత లేదా పాల విక్రయం',
                      ta: 'உதா: 2 மூட்டை தீவனம் அல்லது பால் விற்பனை',
                      ml: 'ഉദാ: 2 ചാക്ക് തീറ്റ അല്ലെങ്കിൽ പാൽ വിൽപ്പന',
                      mr: 'उदा: 2 पोती चारा किंवा सकाळची दूध विक्री',
                    })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {localeText({
                    en: 'Notes or Bill / Receipt (Optional)',
                    hi: 'अतिरिक्त टिप्पणी या बिल नंबर (वैकल्पिक)',
                    kn: 'ಟಿಪ್ಪಣಿ ಅಥವಾ ರಶೀದಿ (ಐಚ್ಛಿಕ)',
                    te: 'గమనిక లేదా రసీదు నంబర్ (ఐచ్ఛికం)',
                    ta: 'குறிப்பு அல்லது ரசீது எண் (விருப்பத்தேர்வு)',
                    ml: 'കുറിപ്പ് അല്ലെങ്കിൽ ബിൽ നമ്പർ (ഐച്ഛികം)',
                    mr: 'नोंद किंवा पावती क्रमांक (पर्यायी)',
                  })}
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={localeText({
                    en: 'e.g. 150 Liters milk @ ₹52/L or Receipt #402',
                    hi: 'जैसे: 150 लीटर दूध @ ₹52 प्रति लीटर',
                    kn: 'ಉದಾ: 150 ಲೀಟರ್ ಹಾಲು @ ₹52/ಲೀ',
                    te: 'ఉదా: 150 లీటర్ల పాలు @ ₹52/లీ',
                    ta: 'உதா: 150 லிட்டர் பால் @ ₹52/லி',
                    ml: 'ഉദാ: 150 ലിറ്റർ പാൽ @ ₹52/ലിറ്റർ',
                    mr: 'उदा: 150 लिटर दूध @ ₹52 प्रति लिटर',
                  })}
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
                  {localeText({
                    en: 'Cancel',
                    hi: 'रद्द करें',
                    kn: 'ರದ್ದುಮಾಡಿ',
                    te: 'రద్దు చేయి',
                    ta: 'ரத்து செய்',
                    ml: 'റദ്ദാക്കുക',
                    mr: 'रद्द करा',
                  })}
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-sm font-black cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{'✓ ' + localeText({
                    en: 'Save Entry to Ledger',
                    hi: 'बहीखाते में दर्ज करें',
                    kn: 'ಲೆಕ್ಕಪುಸ್ತಕದಲ್ಲಿ ಉಳಿಸಿ',
                    te: 'ఖాతాలో నమోదు చేయండి',
                    ta: 'புத்தகத்தில் பதிவு செய்',
                    ml: 'രേഖപ്പെടുത്തുക',
                    mr: 'हिशोबात नोंदवा',
                  })}</span>
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
                  {localeText({
                    en: 'No transactions recorded yet',
                    hi: 'अभी कोई लेन-देन नहीं है',
                    kn: 'ಇನ್ನೂ ಯಾವುದೇ ವಹಿವಾಟು ದಾಖಲಾಗಿಲ್ಲ',
                    te: 'ఇంకా ఎలాంటి లావాదేవీలు నమోదు కాలేదు',
                    ta: 'இன்னும் பரிவர்த்தனைகள் எதுவும் இல்லை',
                    ml: 'ഇതുവരെ ഇടപാടുകളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല',
                    mr: 'अद्याप कोणतेही व्यवहार नोंदवलेले नाहीत',
                  })}
                </div>
                <p className="text-xs text-stone-400 max-w-sm mx-auto">
                  {localeText({
                    en: 'Tap "+ Record Expense / Income" above to log milk revenue or feed and medicine expenses.',
                    hi: 'दूध की कमाई और दाना-दवाई का खर्च दर्ज करने के लिए ऊपर "+ नया खर्च या कमाई लिखें" बटन दबाएं।',
                    kn: 'ಹಾಲು ಆದಾಯ ಅಥವಾ ಮೇವು-ಔಷಧಿ ವೆಚ್ಚಗಳನ್ನು ದಾಖಲಿಸಲು ಮೇಲಿನ ಬಟನ್ ಒತ್ತಿರಿ.',
                    te: 'పాల ఆదాయం లేదా మేత మరియు ఔషధ ఖర్చులను నమోదు చేయడానికి పైన ఉన్న బటన్‌ను నొక్కండి.',
                    ta: 'பால் வருமானம் அல்லது தீவன செலவுகளை பதிவு செய்ய மேலே உள்ள பட்டனை அழுத்தவும்.',
                    ml: 'പാൽ വരുമാനമോ തീറ്റച്ചിലവുകളോ രേഖപ്പെടുത്താൻ മുകളിലുള്ള ബട്ടൺ ക്ലിക്ക് ചെയ്യുക.',
                    mr: 'दूध उत्पन्न किंवा चारा-औषध खर्च नोंदवण्यासाठी वरील बटण दाबा.',
                  })}
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
                          {localeText({
                            en: 'By',
                            hi: 'दर्ज',
                            kn: 'ದಾಖಲಿಸಿದವರು',
                            te: 'నమోదు చేసినవారు',
                            ta: 'பதிவு',
                            ml: 'രേഖപ്പെടുത്തിയത്',
                            mr: 'नोंदणी',
                          })}: {record.recordedBy.split(' ')[0]}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          const confirmMsg = localeText({
                            en: `Delete "${record.title}" (₹${record.amount})?`,
                            hi: `क्या आप "${record.title}" (₹${record.amount}) को हटाना चाहते हैं?`,
                            kn: `"${record.title}" (₹${record.amount}) ಅಳಿಸಬೇಕೇ?`,
                            te: `"${record.title}" (₹${record.amount}) తొలగించాలా?`,
                            ta: `"${record.title}" (₹${record.amount}) நீக்கவா?`,
                            ml: `"${record.title}" (₹${record.amount}) നീക്കം ചെയ്യണോ?`,
                            mr: `"${record.title}" (₹${record.amount}) हटवायचे का?`,
                          });
                          if (confirm(confirmMsg)) {
                            onDeleteTransaction(record.id);
                          }
                        }}
                        className="p-2 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title={localeText({
                          en: 'Delete',
                          hi: 'हटाएं',
                          kn: 'ಅಳಿಸಿ',
                          te: 'తొలగించు',
                          ta: 'நீக்கு',
                          ml: 'നീക്കം ചെയ്യുക',
                          mr: 'हटवा',
                        })}
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
