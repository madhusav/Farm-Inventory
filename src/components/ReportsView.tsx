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
  const { lang, t, localeText } = useLanguage();
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
    { 
      monthName: localeText({ en: 'May', hi: 'मई', kn: 'ಮೇ', te: 'మే', ta: 'மே', ml: 'മേയ്', mr: 'मे' }), 
      avgWeight: 31.2, flockGainKg: 180, income: 24000, expense: 12500 
    },
    { 
      monthName: localeText({ en: 'Jun', hi: 'जून', kn: 'ಜೂನ್', te: 'జూన్', ta: 'ஜூன்', ml: 'ജൂൺ', mr: 'जून' }), 
      avgWeight: 32.8, flockGainKg: 210, income: 26000, expense: 14200 
    },
    { 
      monthName: localeText({ en: 'Jul', hi: 'जुलाई', kn: 'ಜುಲೈ', te: 'జూలై', ta: 'ஜூலை', ml: 'ജൂലൈ', mr: 'जुलै' }), 
      avgWeight: 34.1, flockGainKg: 245, income: 29000, expense: 15800 
    },
    { 
      monthName: localeText({ en: 'Aug', hi: 'अगस्त', kn: 'ಆಗಸ್ಟ್', te: 'ఆగస్టు', ta: 'ஆகஸ்ட்', ml: 'ആഗസ്റ്റ്', mr: 'ऑगस्ट' }), 
      avgWeight: 35.6, flockGainKg: 270, income: 30500, expense: 16400 
    },
    { 
      monthName: localeText({ en: 'Sep', hi: 'सितम्बर', kn: 'ಸೆಪ್ಟೆಂಬರ್', te: 'సెప్టెంబర్', ta: 'செப்டம்பர்', ml: 'സെപ്റ്റംബർ', mr: 'सप्टेंबर' }), 
      avgWeight: 37.0, flockGainKg: 290, income: 32000, expense: 17100 
    },
    { 
      monthName: localeText({ en: 'Oct', hi: 'अक्टूबर', kn: 'ಅಕ್ಟೋಬರ್', te: 'అక్టోబర్', ta: 'அக்டோபர்', ml: 'ഒക്ടോബർ', mr: 'ऑक्टोबर' }), 
      avgWeight: parseFloat(avgWeightKg) || 38.4, 
      flockGainKg: 310, 
      income: totalIncome || 34000, 
      expense: totalExpense || 18500 
    },
  ];

  const maxGainKg = Math.max(...monthsData.map(m => m.flockGainKg));
  const activeMonthData = monthsData[selectedMonthIdx] || monthsData[monthsData.length - 1];

  // Category palette with icons
  const categoryDetails: Record<string, { bg: string; icon: string; label: string }> = {
    'Feed & Fodder': { 
      bg: 'bg-amber-500', 
      icon: '🌾', 
      label: localeText({ en: 'Feed & Lucerne Fodder', hi: 'पशु आहार (दाना-भूसा)', kn: 'ಮೇವು ಮತ್ತು ಆಹಾರ', te: 'మేత & దాణా', ta: 'தீவனம்', ml: 'തീറ്റ & പുല്ല്', mr: 'चारा आणि खाद्य' })
    },
    'Medicine & Doctor': { 
      bg: 'bg-rose-500', 
      icon: '💊', 
      label: localeText({ en: 'Medicine & Deworming', hi: 'दवाई व कृमिनाशक', kn: 'ಔಷಧಿ & ಜಂತುಹುಳು ನಿವಾರಕ', te: 'మందులు & నట్టల నివారణ', ta: 'மருந்து & புழுநீக்கம்', ml: 'മരുന്നും വിരയിളക്കലും', mr: 'औषध आणि जंतनाशक' })
    },
    'Vaccination': { 
      bg: 'bg-indigo-500', 
      icon: '💉', 
      label: localeText({ en: 'Vaccinations (PPR/ET/FMD)', hi: 'टीकाकरण (PPR/ET/FMD)', kn: 'ಲಸಿಕೆಗಳು (PPR/ET/FMD)', te: 'టీకాలు (PPR/ET/FMD)', ta: 'தடுப்பூசிகள் (PPR/ET/FMD)', ml: 'വാക്സിനേഷൻ (PPR/ET/FMD)', mr: 'लसीकरण (PPR/ET/FMD)' })
    },
    'Worker Wages': { 
      bg: 'bg-teal-500', 
      icon: '👥', 
      label: localeText({ en: 'Flock Shepherd Wages', hi: 'मजदूरों की मजदूरी', kn: 'ಕುರಿಗಾಹಿಗಳ ಕೂಲಿ', te: 'కూలీలు', ta: 'பணியாளர் கூலி', ml: 'തൊഴിലാളി കൂലി', mr: 'मजुरी खर्च' })
    },
    'Equipment & Shed': { 
      bg: 'bg-sky-500', 
      icon: '🛠️', 
      label: localeText({ en: 'Shed & Fencing Care', hi: 'शेड व बाड़ मरम्मत', kn: 'ಶೆಡ್ & ಬೇಲಿ ನಿರ್ವಹಣೆ', te: 'షెడ్డు & కంచె నిర్వహణ', ta: 'கொட்டகை & வேலி பராமரிப்பு', ml: 'കൂടും വേലിയും പരിപാലനം', mr: 'गोठा आणि कुंपण दुरुस्ती' })
    },
    'Transport & Fuel': { 
      bg: 'bg-purple-500', 
      icon: '🚛', 
      label: localeText({ en: 'Transport & Market Haul', hi: 'किराया व परिवहन', kn: 'ಸಾರಿಗೆ & ಮಾರುಕಟ್ಟೆ ವೆಚ್ಚ', te: 'రవాణా & మార్కెట్ రవాణా', ta: 'போக்குவரத்து செலவு', ml: 'ഗതാഗത ചെലവ്', mr: 'वाहतूक खर्च' })
    },
    'Other Expense': { 
      bg: 'bg-stone-500', 
      icon: '📋', 
      label: localeText({ en: 'Other Expenses', hi: 'अन्य खर्च', kn: 'ಇತರ ಖರ್ಚುಗಳು', te: 'ఇతర ఖర్చులు', ta: 'இதர செலவுகள்', ml: 'മറ്റ് ചെലവുകൾ', mr: 'इतर खर्च' })
    },
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
              {localeText({
                en: 'Flock Reports & Profit',
                hi: 'रेवड़ रिपोर्ट व वित्तीय मुनाफा',
                kn: 'ಹಿಂಡಿನ ವರದಿಗಳು & ಲಾಭ',
                te: 'మంద నివేదికలు & లాభం',
                ta: 'மந்தை அறிக்கைகள் & லாபம்',
                ml: 'ആട്ടിൻകൂട്ടം റിപ്പോർട്ടുകൾ & ലാഭം',
                mr: 'कळप अहवाल आणि नफा'
              })}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
            {localeText({
              en: `Flock weight progress, expense analysis, and net profit for ${farm.name}`,
              hi: `बकरी-भेड़ वजन वृद्धि, स्वास्थ्य और शुद्ध बचत का सरल हिसाब (${farm.name})`,
              kn: `ಕುರಿ-ಆಡುಗಳ ತೂಕ ಹೆಚ್ಚಳ, ವೆಚ್ಚ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ನಿವ್ವಳ ಲಾಭ (${farm.name})`,
              te: `గొర్రెలు-మేకల బరువు పెరుగుదల, ఖర్చుల విశ్లేషణ మరియు నికర లాభం (${farm.name})`,
              ta: `ஆடு-செம்மறி எடை வளர்ச்சி, செலவு பகுப்பாய்வு மற்றும் நிகர லாபம் (${farm.name})`,
              ml: `ആടുകളുടെ ഭാര വളർച്ച, ചെലവ് വിശകലനം, അറ്റാദായം (${farm.name})`,
              mr: `शेळी-मेंढी वजन वाढ, खर्च विश्लेषण आणि निव्वळ नफा (${farm.name})`
            })}
          </p>
        </div>

        <button
          onClick={onOpenLedger}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
        >
          <Receipt className="w-4 h-4" />
          <span>
            {localeText({
              en: 'Open Money Ledger',
              hi: '💰 बहीखाता खोलें',
              kn: '💰 ಲೆಡ್ಜರ್ ತೆರೆಯಿರಿ',
              te: '💰 లెడ్జర్ తెరవండి',
              ta: '💰 கணக்கு புத்தகத்தைத் திறக்க',
              ml: '💰 ലെഡ്ജർ തുറക്കുക',
              mr: '💰 जमाखर्च खाते उघडा'
            })}
          </span>
        </button>
      </div>

      {/* 4 Big Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
        {/* Flock Strength */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {localeText({
                en: 'Total Flock',
                hi: 'कुल रेवड़',
                kn: 'ಒಟ್ಟು ಹಿಂಡು',
                te: 'మొత్తం మంద',
                ta: 'மொத்த மந்தை',
                ml: 'ആകെ ആട്ടിൻകൂട്ടം',
                mr: 'एकूण कळप'
              })}
            </span>
            <span className="p-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm">🐐🐑</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-emerald-950 font-mono">
              {farm.animals.length}
            </span>
            <span className="text-[11px] font-bold text-stone-500">
              {localeText({ en: 'Heads', hi: 'पशु', kn: 'ಪ್ರಾಣಿ', te: 'జీవాలు', ta: 'எண்ணிக்கை', ml: 'എണ്ണം', mr: 'जनावरे' })}
            </span>
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5 truncate">
            {goatsCount} 🐐 {localeText({ en: 'Goats', hi: 'बकरियां', kn: 'ಆಡುಗಳು', te: 'మేకలు', ta: 'வெள்ளாடுகள்', ml: 'ആടുകൾ', mr: 'शेळ्या' })} · {sheepCount} 🐑 {localeText({ en: 'Sheep', hi: 'भेड़ें', kn: 'ಕುರಿಗಳು', te: 'గొర్రెలు', ta: 'செம்மறி', ml: 'ചെമ്മരിയാട്', mr: 'मेंढ्या' })}
          </div>
        </div>

        {/* Breeding Stock */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {localeText({
                en: 'Breeding Stock',
                hi: 'प्रजनन स्टॉक',
                kn: 'ಸಂತಾನೋತ್ಪತ್ತಿ ದಾಸ್ತಾನು',
                te: 'సంతానోత్పత్తి స్టాక్',
                ta: 'இனப்பெருக்க இருப்பு',
                ml: 'പ്രജനന സ്റ്റോക്ക്',
                mr: 'प्रजनन साठा'
              })}
            </span>
            <span className="p-1 rounded-lg bg-amber-50 text-amber-700 text-sm">👑</span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-amber-950 font-mono">
              {breedingFemales}F / {breedingMales}M
            </span>
          </div>
          <div className="text-[10px] text-stone-500 font-bold mt-0.5 truncate">
            {healthyCount}/{farm.animals.length} {localeText({ en: 'Healthy & Fit', hi: 'तंदुरुस्त', kn: 'ಆರೋಗ್ಯಕರ', te: 'ఆరోగ్యంగా', ta: 'ஆரோக்கியமானது', ml: 'ആരോഗ്യമുള്ളത്', mr: 'तंदुरुस्त' })}
          </div>
        </div>

        {/* Total Earned */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {localeText({
                en: 'Total Income',
                hi: 'कुल कमाई',
                kn: 'ಒಟ್ಟು ಆದಾಯ',
                te: 'మొత్తం ఆదాయం',
                ta: 'மொத்த வருமானம்',
                ml: 'ആകെ വരുമാനം',
                mr: 'एकूण उत्पन्न'
              })}
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
            {incomeRecords.length} {localeText({ en: 'entries', hi: 'कमाई रिकॉर्ड', kn: 'ದಾಖಲೆಗಳು', te: 'నమోదులు', ta: 'பதிவுகள்', ml: 'രേഖകൾ', mr: 'नोंदी' })}
          </div>
        </div>

        {/* Total Spent */}
        <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] sm:text-[11px] font-black text-stone-500 uppercase tracking-wider">
              {localeText({
                en: 'Total Expenses',
                hi: 'कुल खर्च',
                kn: 'ಒಟ್ಟು ವೆಚ್ಚ',
                te: 'మొత్తం ఖర్చులు',
                ta: 'மொத்த செலவுகள்',
                ml: 'ആകെ ചെലവുകൾ',
                mr: 'एकूण खर्च'
              })}
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
            {expenseRecords.length} {localeText({ en: 'entries', hi: 'खर्च रिकॉर्ड', kn: 'ದಾಖಲೆಗಳು', te: 'నమోదులు', ta: 'பதிவுகள்', ml: 'രേഖകൾ', mr: 'नोंदी' })}
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
              <span>
                {localeText({
                  en: 'Monthly Net Profit',
                  hi: 'महीने का शुद्ध मुनाफा',
                  kn: 'ಮಾಸಿಕ ನಿವ್ವಳ ಲಾಭ',
                  te: 'నెలవారీ నికర లాభం',
                  ta: 'மாதாந்திர நிகர லாபம்',
                  ml: 'പ്രതിമാസ അറ്റാദായം',
                  mr: 'मासिक निव्वळ नफा'
                })}
              </span>
            </div>
            <div className="text-3xl sm:text-5xl font-black font-mono tracking-tight">
              ₹{netProfit.toLocaleString('en-IN')}
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/90 font-medium max-w-xl">
              {localeText({
                en: `Net profit after subtracting feed, vaccines, and shepherd costs (₹${totalExpense.toLocaleString('en-IN')}) from livestock sales revenue (₹${totalIncome.toLocaleString('en-IN')}).`,
                hi: `भेड़-बकरी बिक्री व अन्य आय ₹${totalIncome.toLocaleString('en-IN')} में से दाना, हरा चारा, टीका व मजदूरी का खर्च ₹${totalExpense.toLocaleString('en-IN')} घटाने के बाद बची शुद्ध रकम।`,
                kn: `ಜಾನುವಾರು ಮಾರಾಟ ಆದಾಯದಿಂದ (₹${totalIncome.toLocaleString('en-IN')}) ಮೇವು, ಲಸಿಕೆ ಮತ್ತು ಕುರಿಗಾಹಿ ವೆಚ್ಚಗಳನ್ನು (₹${totalExpense.toLocaleString('en-IN')}) ಕಳೆದ ನಂತರ ಉಳಿದ ನಿವ್ವಳ ಲಾಭ.`,
                te: `జీవాల విక్రయ ఆదాయం (₹${totalIncome.toLocaleString('en-IN')}) నుండి మేత, టీకాలు మరియు కూలీల ఖర్చులు (₹${totalExpense.toLocaleString('en-IN')}) తీసివేయగా మిగిలిన నికర లాభం.`,
                ta: `கால்நடை விற்பனை வருவாயிலிருந்து (₹${totalIncome.toLocaleString('en-IN')}) தீவனம், தடுப்பூசி மற்றும் பராமரிப்பு செலவுகளை (₹${totalExpense.toLocaleString('en-IN')}) கழித்த பின் மீதமுள்ள நிகர லாபம்.`,
                ml: `വില്പന വരുമാനത്തിൽ (₹${totalIncome.toLocaleString('en-IN')}) നിന്ന് തീറ്റ, വാക്സിൻ, ചെലവുകൾ (₹${totalExpense.toLocaleString('en-IN')}) കുറച്ച ശേഷമുള്ള അറ്റാദായം.`,
                mr: `जनावरांच्या विक्री उत्पन्नातून (₹${totalIncome.toLocaleString('en-IN')}) खाद्य, लस आणि मजुरी खर्च (₹${totalExpense.toLocaleString('en-IN')}) वजा केल्यानंतर उरलेला निव्वळ नफा.`
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {localeText({
                  en: 'Profit Margin',
                  hi: 'मुनाफा मार्जिन',
                  kn: 'ಲಾಭಾಂಶ ಮಾರ್ಜಿನ್',
                  te: 'లాభ శాతం',
                  ta: 'லாப வரம்பு',
                  ml: 'ലാഭവിഹിതം',
                  mr: 'नफा प्रमाण'
                })}
              </span>
              <div className="text-xl sm:text-2xl font-black font-mono mt-0.5">
                {profitMargin}%
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider">
                {localeText({
                  en: 'Feed Share',
                  hi: 'चारे की लागत',
                  kn: 'ಮೇವು ವೆಚ್ಚ ಪಾಲು',
                  te: 'మేత ఖర్చు వాటా',
                  ta: 'தீவன பங்கு',
                  ml: 'തീറ്റ ചെലവ് വിഹിതം',
                  mr: 'खाद्य खर्च वाटा'
                })}
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
                {localeText({
                  en: 'Monthly Flock Weight Gain Trend',
                  hi: 'महीनेवार रेवड़ वजन वृद्धि',
                  kn: 'ಮಾಸಿಕ ಹಿಂಡಿನ ತೂಕ ಹೆಚ್ಚಳ ಪ್ರವೃತ್ತಿ',
                  te: 'నెలవారీ మంద బరువు పెరుగుదల ధోరణి',
                  ta: 'மாதாந்திர மந்தை எடை வளர்ச்சி போக்கு',
                  ml: 'പ്രതിമാസ ഭാര വളർച്ച പ്രവണത',
                  mr: 'मासिक कळप वजन वाढ कल'
                })}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {localeText({
                en: 'Total flock body weight added across the last 6 months (in kg)',
                hi: 'पिछले 6 महीनों में रेवड़ द्वारा हासिल कुल वजन (किलोग्राम में)',
                kn: 'ಕಳೆದ 6 ತಿಂಗಳುಗಳಲ್ಲಿ ಹಿಂಡು ಗಳಿಸಿದ ಒಟ್ಟು ತೂಕ (ಕಿಲೋಗ್ರಾಂಗಳಲ್ಲಿ)',
                te: 'గత 6 నెలల్లో మంద సాధించిన మొత్తం బరువు (కిలోలలో)',
                ta: 'கடந்த 6 மாதங்களில் மந்தை பெற்ற மொத்த எடை (கிலோவில்)',
                ml: 'കഴിഞ്ഞ 6 മാസത്തിനിടെ നേടിയ ആകെ ഭാരം (കിലോഗ്രാമിൽ)',
                mr: 'गेल्या ६ महिन्यांत कळपाने मिळवलेले एकूण वजन (किलोमध्ये)'
              })}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-stone-500">
              {localeText({ en: 'Selected:', hi: 'चयनित माह:', kn: 'ಆಯ್ಕೆಮಾಡಿದ್ದು:', te: 'ఎంచుకున్నది:', ta: 'தேர்ந்தெடுக்கப்பட்டது:', ml: 'തിരഞ്ഞെടുത്തത്:', mr: 'निवडलेले:' })}
            </span>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-900 font-black text-xs font-mono">
              {activeMonthData.monthName} · +{activeMonthData.flockGainKg} kg {localeText({ en: 'gain', hi: 'वृद्धि', kn: 'ಗಳಿಕೆ', te: 'పెరుగుదల', ta: 'வளர்ச்சி', ml: 'നേട്ടം', mr: 'वाढ' })}
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
                  key={idx} 
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
                    {m.monthName}
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
                {activeMonthData.monthName}: +{activeMonthData.flockGainKg} kg {localeText({ en: 'Total Flock Gain', hi: 'वजन वृद्धि', kn: 'ಒಟ್ಟು ಹಿಂಡಿನ ತೂಕ ಹೆಚ್ಚಳ', te: 'మొత్తం మంద బరువు పెరుగుదల', ta: 'மொத்த மந்தை எடை வளர்ச்சி', ml: 'ആകെ ഭാര വളർച്ച', mr: 'एकूण कळप वजन वाढ' })}
              </span>
              <span className="text-emerald-700 ml-2">
                (Avg Weight: {activeMonthData.avgWeight} kg)
              </span>
            </div>
          </div>
          <div className="text-emerald-900 font-bold">
            {localeText({ en: 'Estimated Flock ADG:', hi: 'दैनिक औसत वृद्धि (ADG):', kn: 'ಅಂದಾಜು ದೈನಂದಿನ ತೂಕ ಹೆಚ್ಚಳ (ADG):', te: 'అంచనా రోజువారీ సగటు పెరుగుదల (ADG):', ta: 'தோராயமான தினசரி எடை அதிகரிப்பு (ADG):', ml: 'പ്രതിദിന ശരാശരി ഭാര വർദ്ധനവ് (ADG):', mr: 'अंदाजे दैनिक सरासरी वाढ (ADG):' })} ~{(activeMonthData.flockGainKg / 30 / (farm.animals.length || 1) * 1000).toFixed(0)} g/animal/day
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
                {localeText({
                  en: 'Expense Distribution',
                  hi: 'खर्च कहाँ हुआ?',
                  kn: 'ವೆಚ್ಚದ ಹಂಚಿಕೆ',
                  te: 'ఖర్చుల వివరాలు',
                  ta: 'செலவு பகிர்வு',
                  ml: 'ചെലവ് വിതരണം',
                  mr: 'खर्च वाटप'
                })}
              </h3>
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {localeText({
                en: 'Breakdown across lucerne fodder, vaccines, deworming, and shepherd wages',
                hi: 'दाना, टीका, दवाई, मजदूरी और अन्य खर्चों का वितरण',
                kn: 'ಮೇವು, ಲಸಿಕೆಗಳು, ಜಂತುಹುಳು ನಿವಾರಕ ಮತ್ತು ಕುರಿಗಾಹಿ ಕೂಲಿಗಳ ವಿಂಗಡಣೆ',
                te: 'మేత, టీకాలు, మందులు మరియు కూలీల వివరాలు',
                ta: 'தீவனம், தடுப்பூசி, மருந்து மற்றும் பணியாளர் கூலி விவரங்கள்',
                ml: 'തീറ്റ, വാക്സിൻ, മരുന്ന്, തൊഴിലാളി കൂലി തുടങ്ങിയവയുടെ വിശദാംശങ്ങൾ',
                mr: 'चारा, लस, औषध आणि मजुरी खर्चाचे वर्गीकरण'
              })}
            </p>
          </div>

          {/* Segmented Progress Bar */}
          {totalExpense > 0 && (
            <div className="space-y-2">
              <div className="h-4 rounded-full bg-stone-100 overflow-hidden flex shadow-inner">
                {categoryEntries.map(([cat, amount]) => {
                  const percent = Math.round((amount / totalExpense) * 100);
                  const details = categoryDetails[cat] || { bg: 'bg-stone-500', icon: '📋', label: cat };
                  if (percent <= 0) return null;
                  return (
                    <div
                      key={cat}
                      style={{ width: `${percent}%` }}
                      className={`${details.bg} transition-all`}
                      title={`${details.label}: ₹${amount} (${percent}%)`}
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
                {localeText({
                  en: 'No expenses recorded yet.',
                  hi: 'अभी कोई खर्च दर्ज नहीं है।',
                  kn: 'ಇನ್ನೂ ಯಾವುದೇ ವೆಚ್ಚ ದಾಖಲಾಗಿಲ್ಲ.',
                  te: 'ఇంకా ఎలాంటి ఖర్చులు నమోదు కాలేదు.',
                  ta: 'இதுவரை செலவுகள் எதுவும் பதிவாகவில்லை.',
                  ml: 'ചെലവുകൾ ഒന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.',
                  mr: 'अद्याप कोणताही खर्च नोंदवलेला नाही.'
                })}
              </div>
            ) : (
              categoryEntries.map(([cat, amount]) => {
                const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                const details = categoryDetails[cat] || { 
                  bg: 'bg-stone-500', 
                  icon: '📋', 
                  label: cat
                };

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{details.icon}</span>
                        <span className="text-stone-800">{details.label}</span>
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
                {localeText({
                  en: 'Golden Flock Rule:',
                  hi: 'भेड़-बकरी पालन का सुनहरा नियम:',
                  kn: 'ಕುರಿ-ಆಡು ಸಾಕಣೆಯ ಸುವರ್ಣ ನಿಯಮ:',
                  te: 'గొర్రెలు-మేకల పెంపకం బంగారు సూత్రం:',
                  ta: 'ஆடு வளர்ப்பின் பொன் விதி:',
                  ml: 'ആടുവളർത്തലിന്റെ സുവർണ്ണ നിയമം:',
                  mr: 'शेळी-मेंढी पालनाचा सुवर्ण नियम:'
                })}
              </span>
              <p className="font-normal text-amber-900 mt-0.5">
                {localeText({
                  en: 'Timely deworming and high-protein green fodder (Lucerne/Subabul) boost average daily gain (ADG) to 150-200g/day.',
                  hi: 'समय पर कृमिनाशक (Deworming) और प्रोटीन युक्त हरा चारा (लूसर्न/दशरथ घास) देने से मेमनों का दैनिक वजन 150-200 ग्राम तक बढ़ता है।',
                  kn: 'ಸಕಾಲಿಕ ಜಂತುಹುಳು ನಿವಾರಣೆ ಮತ್ತು ಪ್ರೋಟೀನ್ ಯುಕ್ತ ಹಸಿರು ಮೇವು ನೀಡಿದರೆ ಮರಿಗಳ ತೂಕ ದಿನಕ್ಕೆ 150-200 ಗ್ರಾಂ ಹೆಚ್ಚಾಗುತ್ತದೆ.',
                  te: 'సకాలంలో నట్టల నివారణ మరియు మాంసకృత్తులు సమృద్ధిగా ఉండే పచ్చిమేత అందిస్తే పిల్లల బరువు రోజుకు 150-200 గ్రాములు పెరుగుతుంది.',
                  ta: 'சரியான நேரத்தில் குடற்புழு நீக்கம் மற்றும் புரதச்சத்து நிறைந்த பசுந்தீவனம் கொடுத்தால் குட்டிகளின் எடை தினமும் 150-200 கிராம் வரை அதிகரிக்கும்.',
                  ml: 'കൃത്യസമയത്തുള്ള വിരയിളക്കലും മാംസ്യ സമ്പുഷ്ടമായ പച്ചപ്പുല്ലും കുഞ്ഞുങ്ങളുടെ പ്രതിദിന ഭാരം 150-200 ഗ്രാം വരെ കൂട്ടുന്നു.',
                  mr: 'वेळेवर जंतनाशक आणि प्रथिनयुक्त हिरवा चारा दिल्यास पिल्लांचे वजन दररोज १५०-२०० ग्रॅमने वाढते.'
                })}
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
                  {localeText({
                    en: 'Top Flock Champions',
                    hi: 'वजन व कद के सिरमौर पशु',
                    kn: 'ಅತ್ಯುತ್ತಮ ಬೆಳವಣಿಗೆಯ ಪ್ರಾಣಿಗಳು',
                    te: 'ఉత్తమ పెరుగుదల కనబరిచిన జీవాలు',
                    ta: 'சிறந்த வளர்ச்சி பெற்ற விலங்குகள்',
                    ml: 'മികച്ച വളർച്ചയുള്ള ജീവികൾ',
                    mr: 'उत्कृष्ट वाढ असलेली जनावरे'
                  })}
                </h3>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {localeText({
                  en: 'Heaviest and highest growth animals in your flock',
                  hi: 'आपके फार्म में सबसे भारी व उत्तम विकास वाले बकरे/मेढ़े',
                  kn: 'ನಿಮ್ಮ ಹಿಂಡಿನಲ್ಲಿ ಅತ್ಯಂತ ತೂಕ ಮತ್ತು ಉತ್ತಮ ಬೆಳವಣಿಗೆಯ ಪ್ರಾಣಿಗಳು',
                  te: 'మీ మందలో అత్యధిక బరువు మరియు పెరుగుదల గల జీవాలు',
                  ta: 'உங்கள் மந்தையில் அதிக எடையும் வளர்ச்சியும் கொண்ட விலங்குகள்',
                  ml: 'നിങ്ങളുടെ കൂട്ടത്തിലെ ഏറ്റവും ഭാരമുള്ള ജീവികൾ',
                  mr: 'तुमच्या कळपातील सर्वात वजनदार आणि उत्तम वाढ झालेली जनावरे'
                })}
              </p>
            </div>
            <Award className="w-6 h-6 text-amber-500 shrink-0" />
          </div>

          <div className="divide-y divide-stone-100">
            {growthChampions.length === 0 ? (
              <div className="p-8 text-center text-xs text-stone-400">
                {localeText({
                  en: 'No animals recorded yet.',
                  hi: 'अभी कोई पशु दर्ज नहीं है।',
                  kn: 'ಇನ್ನೂ ಯಾವುದೇ ಪ್ರಾಣಿ ದಾಖಲಾಗಿಲ್ಲ.',
                  te: 'ఇంకా ఎలాంటి జీవాలు నమోదు కాలేదు.',
                  ta: 'விலங்குகள் எதுவும் பதிவு செய்யப்படவில்லை.',
                  ml: 'മൃഗങ്ങളെ രേഖപ്പെടുത്തിയിട്ടില്ല.',
                  mr: 'अद्याप कोणतीही जनावरे नोंदवलेली नाहीत.'
                })}
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
                          {localeText({ en: 'Target:', hi: 'लक्ष्य:', kn: 'ಗುರಿ:', te: 'లక్ష్యం:', ta: 'இலக்கு:', ml: 'ലക്ഷ്യം:', mr: 'ध्येय:' })} {animal.targetMatureWeightKg} kg
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
              {localeText({
                en: 'Record fodder, medicines, or sales',
                hi: 'रोज का चारा, दवा व बिक्री खर्च दर्ज करें',
                kn: 'ದೈನಂದಿನ ಮೇವು, ಔಷಧಿ ಅಥವಾ ಮಾರಾಟ ನಮೂದಿಸಿ',
                te: 'మేత, మందులు లేదా అమ్మకాల ఖర్చులు నమోదు చేయండి',
                ta: 'தினசரி தீவனம், மருந்து அல்லது விற்பனையை பதிவு செய்யவும்',
                ml: 'തീറ്റ, മരുന്ന്, വിൽപ്പന രേഖപ്പെടുത്തുക',
                mr: 'दैनिक चारा, औषध किंवा विक्री नोंदवा'
              })}
            </span>
            <button
              onClick={onOpenLedger}
              className="text-xs font-black text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              {localeText({
                en: 'View Ledger →',
                hi: 'बहीखाता देखें →',
                kn: 'ಲೆಡ್ಜರ್ ವೀಕ್ಷಿಸಿ →',
                te: 'లెడ్జర్ చూడండి →',
                ta: 'கணக்கை பார்க்கவும் →',
                ml: 'ലെഡ്ജർ കാണുക →',
                mr: 'जमाखर्च पहा →'
              })}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
