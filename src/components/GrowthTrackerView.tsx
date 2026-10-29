import React, { useState } from 'react';
import { Farm, User, Animal, GrowthMetric } from '../types';
import { Scale, Activity, ArrowUpRight, Check } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

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
  const { lang, t, localeText } = useLanguage();
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
    setToastMessage('✓ ' + localeText({
      en: `Saved ${w} kg weight & BCS ${bcs} for ${targetAnimal.name}!`,
      hi: `${targetAnimal.name} के लिए ${w} किग्रा वजन व BCS ${bcs} सहेजा गया!`,
      kn: `${targetAnimal.name} ಗಾಗಿ ${w} ಕೆಜಿ ತೂಕ ಮತ್ತು BCS ${bcs} ಉಳಿಸಲಾಗಿದೆ!`,
      te: `${targetAnimal.name} కోసం ${w} కిలోల బరువు మరియు BCS ${bcs} నమోదు చేయబడింది!`,
      ta: `${targetAnimal.name} க்கு ${w} கிலோ எடை & BCS ${bcs} சேமிக்கப்பட்டது!`,
      ml: `${targetAnimal.name} ന് ${w} കിലോഗ്രാം ഭാരവും BCS ${bcs} ഉം രേഖപ്പെടുത്തി!`,
      mr: `${targetAnimal.name} चे ${w} किग्रॅ वजन व BCS ${bcs} जतन केले!`,
    }));
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {localeText({
            en: 'Flock Weight & Growth Diary',
            hi: 'वजन व स्वास्थ्य डायरी',
            kn: 'ತೂಕ ಮತ್ತು ಬೆಳವಣಿಗೆ ಡೈರಿ',
            te: 'బరువు మరియు పెరుగుదల డైరీ',
            ta: 'எடை & வளர்ச்சி நாட்குறிப்பு',
            ml: 'ഭാരവും വളർച്ചയും ഡയറി',
            mr: 'वजन व वाढ डायरी',
          })}
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 mt-1 font-medium">
          {localeText({
            en: 'Track body weight gain, average daily gain (ADG), and body condition score (BCS) for your sheep and goats.',
            hi: 'बकरी और भेड़ों के वजन, दैनिक बढ़वार (ADG) और शारीरिक स्थिति स्कोर (BCS) का रिकॉर्ड रखें।',
            kn: 'ನಿಮ್ಮ ಮೇಕೆ ಮತ್ತು ಕುರಿಗಳ ತೂಕ ಹೆಚ್ಚಳ, ದೈನಂದಿನ ಸರಾಸರಿ ಹೆಚ್ಚಳ (ADG) ಮತ್ತು ದೇಹದ ಸ್ಥಿತಿ ಸ್ಕೋರ್ (BCS) ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.',
            te: 'మీ మేకలు మరియు గొర్రెల శరీర బరువు పెరుగుదల, రోజువారీ సగటు పెరుగుదల (ADG) మరియు శరీర పరిస్థితి స్కోర్ (BCS) నమోదు చేయండి.',
            ta: 'உங்கள் ஆடுகள் மற்றும் செம்மறியாடுகளின் உடல் எடை அதிகரிப்பு, தினசரி சராசரி வளர்ச்சி (ADG) மற்றும் உடல் நிலை ஸ்கோர் (BCS) ஆகியவற்றைக் கண்காணிக்கவும்.',
            ml: 'നിങ്ങളുടെ ആടുകളുടെ ശരീരഭാരം വർദ്ധനവ്, പ്രതിദിന ശരാശരി വളർച്ച (ADG), ശരീര അവസ്ഥ സ്കോർ (BCS) എന്നിവ രേഖപ്പെടുത്തുക.',
            mr: 'शेळ्या आणि मेंढ्यांच्या शरीराचे वजन वाढ, सरासरी दैनिक वाढ (ADG) आणि शारीरिक स्थिती गुण (BCS) ची नोंद ठेवा.',
          })}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Quick Logger */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-stone-200 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-stone-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-800" />
              <span>{localeText({
                en: 'Quick Weigh-In & Condition',
                hi: 'त्वरित वजन व स्वास्थ्य दर्ज करें',
                kn: 'ತ್ವರಿತ ತೂಕ ಮತ್ತು ಸ್ಥಿತಿ ದಾಖಲಿಸಿ',
                te: 'త్వరిత బరువు మరియు పరిస్థితి నమోదు',
                ta: 'விரைவு எடை & நிலை பதிவு',
                ml: 'പെട്ടെന്ന് ഭാരവും അവസ്ഥയും രേഖപ്പെടുത്തുക',
                mr: 'झटपट वजन व आरोग्य नोंदणी',
              })}</span>
            </h2>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {localeText({
                en: 'Today',
                hi: 'आज',
                kn: 'ಇಂದು',
                te: 'ఈ రోజు',
                ta: 'இன்று',
                ml: 'ഇന്ന്',
                mr: 'आज',
              })}
            </span>
          </div>
          
          <p className="text-xs text-stone-500 leading-relaxed font-medium">
            {localeText({
              en: "Type today's weight and body condition score right from your phone in the shed.",
              hi: 'बाड़े से सीधे मोबाइल द्वारा आज का वजन और शारीरिक स्थिति (BCS) दर्ज करें।',
              kn: 'ಶೆಡ್‌ನಿಂದಲೇ ನೇರವಾಗಿ ಇಂದಿನ ತೂಕ ಮತ್ತು ದೇಹದ ಸ್ಥಿತಿ ಸ್ಕೋರ್ ನಮೂದಿಸಿ.',
              te: 'షెడ్ నుండే నేరుగా నేటి బరువు మరియు శరీర పరిస్థితి స్కోర్‌ను నమోదు చేయండి.',
              ta: 'கொட்டகையிலிருந்தே நேரடியாக இன்றைய எடையையும் உடல் நிலையையும் பதிவு செய்யவும்.',
              ml: 'ഷെഡിൽ നിന്ന് നേരിട്ട് ഇന്നത്തെ ഭാരവും ശരീര അവസ്ഥയും രേഖപ്പെടുത്തുക.',
              mr: 'गोठ्यातून थेट मोबाईलवरून आजचे वजन व शारीरिक स्थिती नोंदवा.',
            })}
          </p>

          <form onSubmit={handleQuickSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {localeText({
                  en: 'Choose Animal',
                  hi: 'पशु चुनें',
                  kn: 'ಪ್ರಾಣಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
                  te: 'జంతువును ఎంచుకోండి',
                  ta: 'விலங்கைத் தேர்ந்தெடுக்கவும்',
                  ml: 'കന്നുകാലിയെ തിരഞ്ഞെടുക്കുക',
                  mr: 'जनावर निवडा',
                })}
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {localeText({
                    en: 'Weight (kg)',
                    hi: 'वजन (किग्रा)',
                    kn: 'ತೂಕ (ಕೆಜಿ)',
                    te: 'బరువు (కిలోలు)',
                    ta: 'எடை (கிலோ)',
                    ml: 'ഭാരം (കിലോഗ്രാം)',
                    mr: 'वजन (किग्रॅ)',
                  })}
                </label>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {localeText({
                    en: 'Height (cm)',
                    hi: 'ऊंचाई (सेमी)',
                    kn: 'ಎತ್ತರ (ಸೆಂ.ಮೀ)',
                    te: 'ఎత్తు (సెం.మీ)',
                    ta: 'உயரம் (செ.மீ)',
                    ml: 'உയരം (സെ.മീ)',
                    mr: 'उंची (सेंमी)',
                  })}
                </label>
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {localeText({
                    en: 'BCS (1-5)',
                    hi: 'बीसीएस (1-5)',
                    kn: 'ಬಿಸಿಎಸ್ (1-5)',
                    te: 'BCS (1-5)',
                    ta: 'BCS (1-5)',
                    ml: 'BCS (1-5)',
                    mr: 'BCS (1-5)',
                  })}
                </label>
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
              <label className="block text-xs font-bold text-stone-700 mb-1">
                {localeText({
                  en: 'Fodder & Feed Notes',
                  hi: 'दाना-चारा विवरण',
                  kn: 'ಮೇವು ಮತ್ತು ಆಹಾರ ಟಿಪ್ಪಣಿಗಳು',
                  te: 'మేత మరియు దాణా వివరాలు',
                  ta: 'தீவனம் & புல் குறிப்புகள்',
                  ml: 'തീറ്റ വിവരങ്ങൾ',
                  mr: 'चारा व खाद्य नोंदी',
                })}
              </label>
              <input
                type="text"
                value={quickNotes}
                onChange={(e) => setQuickNotes(e.target.value)}
                placeholder={localeText({
                  en: 'e.g. Green Lucerne, concentrate grain feed...',
                  hi: 'जैसे: हरा चारा (बरसीम/लूसर्न), दाना मिश्रण...',
                  kn: 'ಉದಾ: ಹಸಿರು ಲುಸರ್ನ್, ಕಾಳು ಮೇವು...',
                  te: 'ఉదా: పచ్చి లూసర్న్, ధాన్యపు దాణా...',
                  ta: 'உதா: குதிரை மசால், அடர் தீவனம்...',
                  ml: 'ഉദാ: പച്ചപ്പുല്ല്, സാന്ദ്രീകൃത തീറ്റ...',
                  mr: 'उदा: हिरवा चारा (लसूण घास), पोषक दाणा मिश्रण...',
                })}
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
              {localeText({
                en: 'Save to Flock Growth Diary',
                hi: 'डायरी में सुरक्षित करें',
                kn: 'ಬೆಳವಣಿಗೆ ಡೈರಿಗೆ ಉಳಿಸಿ',
                te: 'పెరుగుదల డైరీలో సేవ్ చేయండి',
                ta: 'வளர்ச்சி நாட்குறிப்பில் சேமிக்கவும்',
                ml: 'വളർച്ചാ ഡയറിയിൽ സൂക്ഷിക്കുക',
                mr: 'वाढ डायरीत जतन करा',
              })}
            </button>
          </form>
        </div>

        {/* Right: Table on Tablet/Desktop, Mobile Cards on Phone (Zero Horizontal Scrolling) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/60">
            <h2 className="text-sm sm:text-base font-extrabold text-stone-900">
              {localeText({
                en: 'Flock Growth & ADG Summary',
                hi: 'झुंड विकास व दैनिक बढ़वार सारांश',
                kn: 'ಹಿಂಡಿನ ಬೆಳವಣಿಗೆ ಮತ್ತು ADG ಸಾರಾಂಶ',
                te: 'మంద పెరుగుదల మరియు ADG సారాంశం',
                ta: 'மந்தை வளர்ச்சி & ADG சுருக்கம்',
                ml: 'വളർച്ചയും ADG സംഗ്രഹവും',
                mr: 'कळप वाढ व दैनिक वजन वाढ सारांश',
              })}
            </h2>
            <span className="text-xs text-stone-500 font-bold">
              {farm.animals.length}{' '}
              {localeText({
                en: 'Animals on Farm',
                hi: 'पशु फार्म पर',
                kn: 'ಪ್ರಾಣಿಗಳು ಫಾರ್ಮ್‌ನಲ್ಲಿ',
                te: 'జంతువులు ఫారంలో',
                ta: 'பண்ணை விலங்குகள்',
                ml: 'ഫാമിലെ മൃഗങ്ങൾ',
                mr: 'फार्मवरील जनावरे',
              })}
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
                        ({localeText({
                          en: 'birth',
                          hi: 'जन्म',
                          kn: 'ಜನನ',
                          te: 'పుట్టుక',
                          ta: 'பிறப்பு',
                          ml: 'ജനനം',
                          mr: 'जन्म',
                        })} {animal.birthWeightKg} kg)
                      </span>
                      <span className="font-mono text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">
                        {pct}%{' '}
                        {localeText({
                          en: 'mature',
                          hi: 'परिपक्व',
                          kn: 'ಪ್ರಬುದ್ಧ',
                          te: 'పరిపక్వ',
                          ta: 'முதிர்ச்சி',
                          ml: 'പൂർണ്ണവളർച്ച',
                          mr: 'परिपक्व',
                        })}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-500 font-medium truncate mt-0.5">
                      {localeText({
                        en: 'Target',
                        hi: 'लक्ष्य',
                        kn: 'ಗುರಿ',
                        te: 'లక్ష్యం',
                        ta: 'இலக்கு',
                        ml: 'ലക്ഷ്യം',
                        mr: 'ध्येय',
                      })}: <strong>{animal.targetMatureWeightKg} kg</strong> · {animal.breed}
                    </div>
                  </div>

                  <span className="text-xs text-emerald-800 font-black flex items-center gap-0.5 shrink-0 bg-emerald-50 px-2 py-1.5 rounded-xl border border-emerald-200">
                    <span>
                      {localeText({
                        en: 'Diary',
                        hi: 'डायरी',
                        kn: 'ಡೈರಿ',
                        te: 'డైరీ',
                        ta: 'நாட்குறிப்பு',
                        ml: 'ഡയറി',
                        mr: 'डायरी',
                      })}
                    </span>
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
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Animal',
                      hi: 'पशु',
                      kn: 'ಪ್ರಾಣಿ',
                      te: 'జంతువు',
                      ta: 'விலங்கு',
                      ml: 'മൃഗം',
                      mr: 'जनावर',
                    })}
                  </th>
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Birth Wt',
                      hi: 'जन्म वजन',
                      kn: 'ಜನನ ತೂಕ',
                      te: 'పుట్టుక బరువు',
                      ta: 'பிறப்பு எடை',
                      ml: 'ജനന ഭാരം',
                      mr: 'जन्म वजन',
                    })}
                  </th>
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Current Wt',
                      hi: 'वर्तमान वजन',
                      kn: 'ಪ್ರಸ್ತುತ ತೂಕ',
                      te: 'ప్రస్తుత బరువు',
                      ta: 'தற்போதைய எடை',
                      ml: 'ഇപ്പോഴത്തെ ഭാരം',
                      mr: 'चालू वजन',
                    })}
                  </th>
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Target Mature',
                      hi: 'लक्ष्य वजन',
                      kn: 'ಗುರಿ ತೂಕ',
                      te: 'లక్ష్య బరువు',
                      ta: 'இலக்கு எடை',
                      ml: 'ലക്ഷ്യ ഭാരം',
                      mr: 'अपेक्षित वजन',
                    })}
                  </th>
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Growth %',
                      hi: 'विकास %',
                      kn: 'ಬೆಳವಣಿಗೆ %',
                      te: 'పెరుగుదల %',
                      ta: 'வளர்ச்சி %',
                      ml: 'വളർച്ച %',
                      mr: 'वाढ %',
                    })}
                  </th>
                  <th className="py-3 px-4">
                    {localeText({
                      en: 'Diary',
                      hi: 'डायरी',
                      kn: 'ಡೈರಿ',
                      te: 'డైరీ',
                      ta: 'நாட்குறிப்பு',
                      ml: 'ഡയറി',
                      mr: 'डायरी',
                    })}
                  </th>
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
                        {pct}%{' '}
                        {localeText({
                          en: 'grown',
                          hi: 'विकास',
                          kn: 'ಬೆಳವಣಿಗೆ',
                          te: 'పెరిగింది',
                          ta: 'வளர்ச்சி',
                          ml: 'വളർന്നു',
                          mr: 'वाढ',
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-emerald-800 font-extrabold hover:underline flex items-center gap-0.5">
                          <span>
                            {localeText({
                              en: 'See Diary',
                              hi: 'डायरी देखें',
                              kn: 'ಡೈರಿ ನೋಡಿ',
                              te: 'డైరీ చూడండి',
                              ta: 'நாட்குறிப்பு பார்க்க',
                              ml: 'ഡയറി കാണുക',
                              mr: 'डायरी पहा',
                            })}
                          </span>
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
