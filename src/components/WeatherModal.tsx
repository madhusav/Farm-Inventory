import React, { useState, useEffect, useCallback } from 'react';
import { 
  CloudRain, 
  MapPin, 
  RefreshCw, 
  Navigation, 
  Droplets,
  Wind,
  Clock,
  Sparkles,
  CalendarDays,
  Compass,
  X,
  Settings
} from 'lucide-react';
import { Farm } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { Language } from '../i18n/translations';
import { 
  getWeatherDescription, 
  parseLocationCoordinates, 
  KNOWN_FARM_LOCATIONS 
} from './CornerTemperature';

interface WeatherModalProps {
  farm: Farm;
  onClose: () => void;
  onOpenAdminLocation?: () => void;
}

interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

interface DailyForecast {
  date: string;
  dayName: string;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  rainChance: number;
  grazingStatus: 'safe' | 'caution' | 'avoid';
}

interface GrazingGuidance {
  status: 'safe' | 'caution' | 'avoid';
  statusLabel: string;
  badgeColor: string;
  bestHours: string;
  headline: string;
  detailedAdvice: string;
  keyActionItem: string;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ 
  farm, 
  onClose,
  onOpenAdminLocation 
}) => {
  const { lang, localeText, t } = useLanguage();

  const farmLocName = farm.config?.weatherLocation || farm.location || 'Anand, Gujarat';
  const defaultCoords = parseLocationCoordinates(farmLocName);

  const [coords, setCoords] = useState(defaultCoords);
  const [current, setCurrent] = useState<CurrentWeather | null>(null);
  const [forecast, setForecast] = useState<DailyForecast[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [showLocationPicker, setShowLocationPicker] = useState<boolean>(false);
  const [locatingGPS, setLocatingGPS] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const calculateGrazingStatus = (code: number, maxTemp: number, rainChance: number): 'safe' | 'caution' | 'avoid' => {
    if (code >= 51 || rainChance >= 50) return 'avoid';
    if (maxTemp >= 35 || maxTemp <= 16 || rainChance >= 25 || code === 3) return 'caution';
    return 'safe';
  };

  const fetchWeather = useCallback(async (lat: number, lon: number, locationName: string) => {
    setLoading(true);
    setIsRefreshing(true);
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API error');
      const data = await res.json();

      const curData: CurrentWeather = {
        temperature: Math.round(data.current.temperature_2m),
        apparentTemperature: Math.round(data.current.apparent_temperature),
        humidity: Math.round(data.current.relative_humidity_2m),
        windSpeed: Math.round(data.current.wind_speed_10m),
        precipitation: data.current.precipitation || 0,
        weatherCode: data.current.weather_code,
      };

      const dailyDays: DailyForecast[] = (data.daily.time || []).slice(0, 3).map((dStr: string, idx: number) => {
        const dObj = new Date(dStr);
        const dayNames: Record<Language, string[]> = {
          en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
          hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
          kn: ['ಭಾನು', 'ಸೋಮ', 'ಮಂಗಳ', 'ಬುಧ', 'ಗುರು', 'ಶುಕ್ರ', 'ಶನಿ'],
          te: ['ఆది', 'సోమ', 'మంగళ', 'బుధ', 'గురు', 'శుక్ర', 'శని'],
          ta: ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'],
          ml: ['ഞായർ', 'തിങ്കൾ', 'ചൊവ്വ', 'ബുധൻ', 'വ്യാഴം', 'വെള്ളി', 'ശനി'],
          mr: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
        };
        const todayLabels: Record<Language, string> = {
          en: 'Today', hi: 'आज', kn: 'ಇಂದು', te: 'ఈరోజు', ta: 'இன்று', ml: 'ഇന്ന്', mr: 'आज'
        };
        const tomorrowLabels: Record<Language, string> = {
          en: 'Tomorrow', hi: 'कल', kn: 'ನಾಳೆ', te: 'రేపు', ta: 'நாளை', ml: 'നാളെ', mr: 'उद्या'
        };

        const dayName = idx === 0 
          ? (todayLabels[lang] || 'Today') 
          : (idx === 1 ? (tomorrowLabels[lang] || 'Tomorrow') : (dayNames[lang] || dayNames.en)[dObj.getDay()]);

        const maxTemp = Math.round(data.daily.temperature_2m_max[idx]);
        const wCode = data.daily.weather_code[idx] || 0;
        const rChance = data.daily.precipitation_probability_max[idx] || 0;

        return {
          date: dStr,
          dayName,
          weatherCode: wCode,
          tempMax: maxTemp,
          tempMin: Math.round(data.daily.temperature_2m_min[idx]),
          rainChance: rChance,
          grazingStatus: calculateGrazingStatus(wCode, maxTemp, rChance)
        };
      });

      setCurrent(curData);
      setForecast(dailyDays);

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(nowTime);

      try {
        localStorage.setItem(`farm_weather_cache_${farm.id}`, JSON.stringify({
          coords: { lat, lon, label: locationName },
          current: curData,
          forecast: dailyDays,
          updatedAt: nowTime,
        }));
      } catch {
        // ignore cache write error
      }
    } catch {
      // Safe fallback data
      const todayLabels: Record<Language, string> = {
        en: 'Today', hi: 'आज', kn: 'ಇಂದು', te: 'ఈరోజు', ta: 'இன்று', ml: 'ഇന്ന്', mr: 'आज'
      };
      const tomorrowLabels: Record<Language, string> = {
        en: 'Tomorrow', hi: 'कल', kn: 'ನಾಳೆ', te: 'రేపు', ta: 'நாளை', ml: 'നാളെ', mr: 'उद्या'
      };
      setCurrent({
        temperature: 29,
        apparentTemperature: 31,
        humidity: 58,
        windSpeed: 10,
        precipitation: 0,
        weatherCode: 1,
      });
      setForecast([
        { date: '2026-11-06', dayName: todayLabels[lang] || 'Today', weatherCode: 1, tempMax: 32, tempMin: 21, rainChance: 5, grazingStatus: 'safe' },
        { date: '2026-11-07', dayName: tomorrowLabels[lang] || 'Tomorrow', weatherCode: 2, tempMax: 31, tempMin: 20, rainChance: 10, grazingStatus: 'safe' },
        { date: '2026-11-08', dayName: localeText({ en: 'Day 3', hi: 'परसों', kn: 'ನಾಡದ್ದು', te: 'ఎల్లుండి', ta: 'மறுநாள்', ml: 'മറ്റന്നാൾ', mr: 'परवा' }), weatherCode: 0, tempMax: 33, tempMin: 21, rainChance: 5, grazingStatus: 'safe' },
      ]);
      setLastUpdated(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [farm.id, lang, localeText]);

  useEffect(() => {
    fetchWeather(coords.lat, coords.lon, coords.label);
  }, [coords.lat, coords.lon, coords.label, fetchWeather]);

  const handleUseGPS = () => {
    if (!navigator.geolocation) return;
    setLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(2));
        const lon = parseFloat(pos.coords.longitude.toFixed(2));
        const label = localeText({
          en: 'GPS Coordinates',
          hi: 'जीपीएस स्थान',
          kn: 'ಜಿಪಿಎಸ್ ಸ್ಥಳ',
          te: 'GPS స్థానం',
          ta: 'GPS இருப்பிடம்',
          ml: 'GPS ലൊക്കേഷൻ',
          mr: 'जीपीएस स्थान'
        });
        setCoords({ lat, lon, label });
        setLocatingGPS(false);
        setShowLocationPicker(false);
        fetchWeather(lat, lon, label);
      },
      () => setLocatingGPS(false),
      { timeout: 8000 }
    );
  };

  const getGrazingGuidance = (cur: CurrentWeather | null, rainP: number): GrazingGuidance => {
    if (!cur) {
      return {
        status: 'safe',
        statusLabel: localeText({
          en: 'Checking weather...',
          hi: 'मौसम की जांच हो रही है...',
          kn: 'ಹವಾಮಾನ ತಪಾಸಣೆ...',
          te: 'వాతావరణం తనిಖీ...',
          ta: 'வானிலை சரிபார்க்கிறது...',
          ml: 'കാലാവസ്ഥ പരിശോധിക്കുന്നു...',
          mr: 'हवामान तपासत आहे...'
        }),
        badgeColor: 'bg-stone-100 text-stone-700 border-stone-300',
        bestHours: '--',
        headline: localeText({ en: 'Updating live farm weather', hi: 'लाइव मौसम अपडेट हो रहा है', kn: 'ಹವಾಮಾನ ನವೀಕರಿಸಲಾಗುತ್ತಿದೆ', te: 'వాతావరణం నవీకరణ', ta: 'வானிலை புதுப்பிக்கப்படுகிறது', ml: 'കാലാവസ്ഥ പുതുക്കുന്നു', mr: 'हवामान अपडेट' }),
        detailedAdvice: '',
        keyActionItem: ''
      };
    }

    const { temperature, weatherCode, humidity } = cur;
    const isRaining = weatherCode >= 51 || rainP >= 45 || cur.precipitation > 0;

    // 1. Rain / Wet Ground (High bloat & foot rot risk)
    if (isRaining) {
      return {
        status: 'avoid',
        statusLabel: localeText({
          en: 'Avoid Open Grazing',
          hi: 'खुले में चराई रोकें',
          kn: 'ಹೊರಗೆ ಮೇಯಿಸಬೇಡಿ',
          te: 'బయట మేపడం నివారించండి',
          ta: 'வெளியே மேய்ச்சலைத் தவிர்க்கவும்',
          ml: 'പുറത്ത് മേയ്ക്കുന്നത് ഒഴിവാക്കുക',
          mr: 'उघड्यावर चराई टाळा'
        }),
        badgeColor: 'bg-rose-100 text-rose-950 border-rose-300',
        bestHours: localeText({
          en: 'Stall Feeding Only',
          hi: 'केवल शेड में चारा दें',
          kn: 'ಶೆಡ್‌ನಲ್ಲೇ ಮೇವು ನೀಡಿ',
          te: 'షెడ్‌లోనే మేత ఇవ్వండి',
          ta: 'கொட்டிலிலேயே தீவனம் கொடுங்கள்',
          ml: 'കൂട്ടിൽ തന്നെ തീറ്റ നൽകുക',
          mr: 'फक्त गोठ्यात चारा द्या'
        }),
        headline: localeText({
          en: 'Rain Warning: High Risk of Frothy Bloat & Foot Rot',
          hi: 'बारिश चेतावनी: पेट फूलने (अफरा) और खुर सड़न का खतरा',
          kn: 'ಮಳೆ ಎಚ್ಚರಿಕೆ: ಹೊಟ್ಟೆ ಉಬ್ಬರ ಮತ್ತು ಗೊರಸು ಕೊಳೆತ ಅಪಾಯ',
          te: 'వర్ష హెచ్చరిక: కడుపు ఉబ్బరం & గిట్టల కుళ్లు ప్రమాదం',
          ta: 'மழை எச்சரிக்கை: வயிறு உப்பசம் & குளம்பு அழுகல் ஆபத்து',
          ml: 'മഴ മുന്നറിയിപ്പ്: വയർ വീർക്കലും കുളമ്പ് ചീയലും വരാം',
          mr: 'पाऊस इशारा: पोट फुगणे आणि खूर कुजण्याचा धोका'
        }),
        detailedAdvice: localeText({
          en: 'Wet green pasture causes rapid fermentation and fatal frothy bloat in goats and sheep. Muddy soil softens hooves leading to foot rot bacteria.',
          hi: 'गीली हरी घास खाने से भेड़ों और बकरियों में तेजी से झागदार अफरा (ब्लोट) बनता है। गीली मिट्टी से खुर नरम होकर सड़ने लगते हैं।',
          kn: 'ತೇವಾಂಶವಿರುವ ಹಸಿರು ಹುಲ್ಲು ಹೊಟ್ಟೆ ಉಬ್ಬರಕ್ಕೆ ಕಾರಣವಾಗುತ್ತದೆ. ಕೆಸರು ಮಣ್ಣು ಗೊರಸುಗಳನ್ನು ಮೃದುಗೊಳಿಸಿ ಕೊಳೆಯುವಂತೆ ಮಾಡುತ್ತದೆ.',
          te: 'తడి పచ్చగడ్డి వల్ల జీవాలలో కడుపుబ్బరం వస్తుంది. బురద వల్ల గిట్టలు మెత్తబడి కుళ్లు వ్యాధి సోకుతుంది.',
          ta: 'ஈரமான புல் ஆடுகளுக்கு கடுமையான வயிறு உப்பசத்தை ஏற்படுத்தும். சேற்று நிலம் குளம்புகளை அழுக வைக்கும்.',
          ml: 'നനഞ്ഞ പുല്ല് തിന്നുന്നത് ആടുകളിൽ പെട്ടെന്ന് വയർ വീർക്കാൻ കാരണമാകും. ചെളി കുളമ്പുരോഗം ഉണ്ടാക്കും.',
          mr: 'ओले गवत खाल्ल्याने शेळ्या-मेंढ्यांचे पोट फुगून अफरा होतो. चिखलामुळे खुरांचे आजार होतात.'
        }),
        keyActionItem: localeText({
          en: 'Keep flock in dry shelter. Feed dry hay, gram bhusa, and clean water.',
          hi: 'रेवड़ को सूखे शेड में रखें। सूखा चारा, भूसा और साफ पानी दें।',
          kn: 'ಹಿಂಡನ್ನು ಒಣ ಶೆಡ್‌ನಲ್ಲಿರಿಸಿ. ಒಣ ಹುಲ್ಲು ಮತ್ತು ಶುದ್ಧ ನೀರು ನೀಡಿ.',
          te: 'జీవాలను పొడి షెడ్‌లో ఉంచండి. ఎండు గడ్డి, దాణా అందించండి.',
          ta: 'ஆடுகளை உலர்ந்த கொட்டிலில் வையுங்கள். உலர்ந்த வைக்கோல் கொடுக்கவும்.',
          ml: 'ആടുകളെ ഉണങ്ങിയ കൂട്ടിൽ നിർത്തുക. ഉണങ്ങിയ വൈക്കോലും ശുദ്ധജലവും നൽകുക.',
          mr: 'कळपाला कोरड्या गोठ्यात ठेवा. सुका चारा आणि स्वच्छ पाणी द्या.'
        })
      };
    }

    // 2. High Heat (> 34°C)
    if (temperature >= 35) {
      return {
        status: 'caution',
        statusLabel: localeText({
          en: 'Midday Heat Alert',
          hi: 'दोपहर में तेज धूप',
          kn: 'ಮಧ್ಯಾಹ್ನದ ತೀವ್ರ ಬಿಸಿಲು',
          te: 'మధ్యాహ్న ఎండ తీవ్రత',
          ta: 'மதிய வெயில் எச்சரிக்கை',
          ml: 'ഉച്ചവെയിൽ മുന്നറിയിപ്പ്',
          mr: 'दुपारचे कडक ऊन'
        }),
        badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
        bestHours: localeText({
          en: '6:00 – 9:30 AM & 5:00 – 6:45 PM',
          hi: 'सुबह 6:00 – 9:30 & शाम 5:00 – 6:45',
          kn: 'ಬೆಳಿಗ್ಗೆ 6:00 – 9:30 & ಸಂಜೆ 5:00 – 6:45',
          te: 'ఉదయం 6:00 – 9:30 & సాయంత్రం 5:00 – 6:45',
          ta: 'காலை 6:00 – 9:30 & மாலை 5:00 – 6:45',
          ml: 'രാവിലെ 6:00 – 9:30 & വൈകുന്നേരം 5:00 – 6:45',
          mr: 'सकाळी 6:00 – 9:30 & संध्याकाळी 5:00 – 6:45'
        }),
        headline: localeText({
          en: 'Split Grazing Schedule: Rest in Shade from 10:30 AM to 4:30 PM',
          hi: 'दोपहर में आराम कराएं: सुबह-शाम ही चराने ले जाएं',
          kn: 'ಮಧ್ಯಾಹ್ನ ನೆರಳಿನಲ್ಲಿರಿಸಿ: ಬೆಳಿಗ್ಗೆ ಮತ್ತು ಸಂಜೆ ಮಾತ್ರ ಮೇಯಿಸಿ',
          te: 'మధ్యాహ్నం నీడలో ఉంచండి: ఉదయం, సాయంత్రం మాత్రమే మేపండి',
          ta: 'மதியம் நிழலில் ஓய்வு கொடுங்கள்: காலை-மாலை மட்டும் மேய்க்கவும்',
          ml: 'ഉച്ചയ്ക്ക് തണലിൽ നിർത്തുക: രാവിലെയും വൈകുന്നേരവും മാത്രം മേയ്ക്കുക',
          mr: 'दुपारी सावलीत विश्रांती द्या: सकाळी आणि संध्याकाळीच चरा'
        }),
        detailedAdvice: localeText({
          en: 'Excess heat causes heat stroke, dehydration, and drops weight gain in kids & lambs. Pregnant does/ewes may abort if overheated.',
          hi: 'तेज धूप से लू लगना, पानी की कमी और मेमनों का वजन गिरना होता है। गाभिन बकरियों में गर्भपात का खतरा बढ़ जाता है।',
          kn: 'ಹೆಚ್ಚಿನ ಬಿಸಿಲು ಬಿಸಿಲುಗಾಳಿ, ನಿರ್ಜಲೀಕರಣ ಮತ್ತು ತೂಕ ಇಳಿಕೆಗೆ ಕಾರಣವಾಗುತ್ತದೆ.',
          te: 'తీవ్రమైన ఎండ వల్ల వడదెబ్బ, నీరసం వస్తాయి. గర్భంతో ఉన్న జీవాలకు ప్రమాదం.',
          ta: 'அதிக வெயில் ஆடுகளுக்கு வெப்பத் தாக்கம் மற்றும் எடை இழப்பை ஏற்படுத்தும்.',
          ml: 'കഠിനമായ ചൂട് സൂര്യാഘാതത്തിനും ശരീരഭാരം കുറയാനും ഇടയാക്കും.',
          mr: 'जास्त उष्णतेमुळे उष्माघात आणि पिल्लांचे वजन कमी होण्याची शक्यता असते.'
        }),
        keyActionItem: localeText({
          en: 'Provide shaded pens, cool drinking water, and add electrolyte/mineral mixture.',
          hi: 'छायादार व्यवस्था करें, ठंडा पीने का पानी और ओआरएस/नमक घोल दें।',
          kn: 'ತಣ್ಣನೆಯ ಕುಡಿಯುವ ನೀರು ಮತ್ತು ಎಲೆಕ್ಟ್ರೋಲೈಟ್ ಪುಡಿ ನೀಡಿ.',
          te: 'చల్లని తాగునీరు, ఓఆర్ఎస్ ద్రావణం అందించండి.',
          ta: 'குளிர்ந்த குடிநீர் மற்றும் உப்பு/எலக்ட்ரோலைட் கரைசல் வழங்கவும்.',
          ml: 'തണുത്ത കുടിവെള്ളവും ഇലക്ട്രോലൈറ്റും നൽകുക.',
          mr: 'थंड पिण्याचे पाणी आणि ओआरएस / मीठ पाणी द्या.'
        })
      };
    }

    // 3. High Morning Dew / Humidity (Larvae Alert)
    if (humidity >= 78) {
      return {
        status: 'caution',
        statusLabel: localeText({
          en: 'Morning Dew Warning',
          hi: 'सुबह की ओस से सावधान',
          kn: 'ಬೆಳಗಿನ ಇಬ್ಬನಿ ಎಚ್ಚರಿಕೆ',
          te: 'ఉదయపు మంచు హెచ్చరిక',
          ta: 'காலை பனி எச்சரிக்கை',
          ml: 'രാവിലത്തെ മഞ്ഞ് മുന്നറിയിപ്പ്',
          mr: 'सकाळच्या दवापासून सावध'
        }),
        badgeColor: 'bg-sky-100 text-sky-950 border-sky-300',
        bestHours: localeText({
          en: '8:30 AM – 11:30 AM & 3:30 – 6:00 PM',
          hi: 'सुबह 8:30 – 11:30 & शाम 3:30 – 6:00',
          kn: 'ಬೆಳಿಗ್ಗೆ 8:30 – 11:30 & ಸಂಜೆ 3:30 – 6:00',
          te: 'ఉదయం 8:30 – 11:30 & సాయంత్రం 3:30 – 6:00',
          ta: 'காலை 8:30 – 11:30 & மாலை 3:30 – 6:00',
          ml: 'രാവിലെ 8:30 – 11:30 & വൈകുന്നേരം 3:30 – 6:00',
          mr: 'सकाळी 8:30 – 11:30 & संध्याकाळी 3:30 – 6:00'
        }),
        headline: localeText({
          en: 'Graze After Pasture Dew Dries to Prevent Stomach Worms',
          hi: 'ओस सूखने के बाद चराएं: पेट के कीड़ों (कृमि) से बचाव',
          kn: 'ಹುಲ್ಲಿನ ಇಬ್ಬನಿ ಆರಿದ ನಂತರ ಮೇಯಿಸಿ: ಜಂತುಹುಳುಗಳಿಂದ ರಕ್ಷಣೆ',
          te: 'గడ్డిపై మంచు ఆరిన తర్వాతే మేపండి: నులిపురుగుల నివారణ',
          ta: 'பனி காய்ந்த பிறகு மேய்க்கவும்: குடல் புழுக்கள் பரவாமல் தடுக்கலாம்',
          ml: 'മഞ്ഞ് ഉണങ്ങിയ ശേഷം മേയ്ക്കുക: വിരബാധ തടയാം',
          mr: 'दव सुकल्यावरच चरा: पोटातील जंतांपासून बचाव'
        }),
        detailedAdvice: localeText({
          en: 'Harmful stomach worm larvae (Haemonchus / wireworms) crawl up wet dew grass droplets. Grazing after 8:30 AM cuts worm burden by over 70%.',
          hi: 'पेट के खतरनाक कीड़े (तार कृमि) ओस की बूंदों के सहारे घास की नोक पर चढ़ जाते हैं। ओस सूखने के बाद चराने से कीड़ों का हमला 70% कम होता है।',
          kn: 'ಜಂತುಹುಳುಗಳು ಇಬ್ಬನಿ ಹನಿಗಳ ಮೂಲಕ ಹುಲ್ಲಿನ ತುದಿಗೇರುತ್ತವೆ. ಇಬ್ಬನಿ ಆರಿದ ನಂತರ ಮೇಯಿಸಿದರೆ ಹುಳುಗಳ ಬಾಧೆ ಶೇ 70% ಕಡಿಮೆಯಾಗುತ್ತದೆ.',
          te: 'నులిపురుగులు మంచు బిందువుల ద్వారా గడ్డి పైకి చేరుతాయి. మంచు ఆరిన తర్వాత మేపితే పురుగుల బెడద 70% తగ్గుతుంది.',
          ta: 'பனித்துளிகள் மூலம் குடல் புழுக்கள் புல்லின் உச்சிக்கு வரும். பனி காய்ந்த பின் மேய்த்தால் புழுத்தொல்லை 70% குறையும்.',
          ml: 'വിരകൾ മഞ്ഞുതുള്ളികളിലൂടെ പുല്ലിന്റെ തുമ്പിലേക്ക് കയറും. മഞ്ഞ് മാറിയ ശേഷം മേയ്ക്കുന്നത് വിരബാധ കുറയ്ക്കും.',
          mr: 'दवामुळे पोटातील जंत गवताच्या टोकावर येतात. दव सुकल्यावर चरल्यास जंतबाधा ७०% कमी होते.'
        }),
        keyActionItem: localeText({
          en: 'Feed dry roughage first in shed; take herd to pasture only after sun warms the field.',
          hi: 'शेड में पहले सूखा भूसा दें, धूप खिलने पर ही pasture में ले जाएं।',
          kn: 'ಮೊದಲು ಶೆಡ್‌ನಲ್ಲಿ ಒಣ ಮೇವು ನೀಡಿ, ಬಿಸಿಲು ಬಂದ ಮೇಲೆ ಮೇಯಿಸಲು ಕರೆದೊಯ್ಯಿರಿ.',
          te: 'మొదట షెడ్‌లో ఎండు గడ్డి వేయండి, ఎండ వచ్చాకే పొలానికి తోలండి.',
          ta: 'முதலில் கொட்டிலில் உலர் தீவனம் கொடுத்து, வெயில் வந்த பின் வெளியே விடவும்.',
          ml: 'ആദ്യം കൂട്ടിൽ ഉണങ്ങിയ തീറ്റ കൊടുക്കുക, വെയിൽ വന്ന ശേഷം പുറത്തേക്ക് വിടുക.',
          mr: 'आधी गोठ्यात सुका चारा द्या, ऊन पडल्यावरच शेतात न्या.'
        })
      };
    }

    // 4. Cold Night / Winter Chill (< 16°C)
    if (temperature <= 16) {
      return {
        status: 'caution',
        statusLabel: localeText({
          en: 'Cold Weather Alert',
          hi: 'ठंड का मौसम',
          kn: 'ಚಳಿಯ ವಾತಾವರಣ',
          te: 'చలి వాతావరణం',
          ta: 'குளிர் காலம்',
          ml: 'തണുത്ത കാലാവസ്ഥ',
          mr: 'थंडीचा दिवस'
        }),
        badgeColor: 'bg-indigo-100 text-indigo-950 border-indigo-300',
        bestHours: localeText({
          en: '10:00 AM – 3:30 PM (Warm Sunlight)',
          hi: 'सुबह 10:00 – दोपहर 3:30 (धूप के समय)',
          kn: 'ಬೆಳಿಗ್ಗೆ 10:00 – ಮಧ್ಯಾಹ್ನ 3:30 (ಬಿಸಿಲಿನ ಸಮಯ)',
          te: 'ఉదయం 10:00 – మధ్యాహ్నం 3:30 (ఎండ సమయం)',
          ta: 'காலை 10:00 – பிற்பகல் 3:30 (வெயில் நேரம்)',
          ml: 'രാവിലെ 10:00 – ഉച്ചയ്ക്ക് 3:30 (വെയിൽ ഉള്ളപ്പോൾ)',
          mr: 'सकाळी 10:00 – दुपारी 3:30 (उन्हाच्या वेळेत)'
        }),
        headline: localeText({
          en: 'Graze in Warm Midday Sun; Protect Young Lambs & Kids from Night Chill',
          hi: 'गुनगुनी धूप में चराएं; छोटे मेमनों को रात की ठंडी हवा से बचाएं',
          kn: 'ಬೆಚ್ಚನೆಯ ಬಿಸಿಲಿನಲ್ಲಿ ಮೇಯಿಸಿ; ಎಳೆಯ ಮರಿಗಳನ್ನು ಚಳಿಯಿಂದ ರಕ್ಷಿಸಿ',
          te: 'మంచి ఎండలో మేపండి; చిన్న పిల్లలను చలిగాలి నుంచి కాపాడండి',
          ta: 'இதமான வெயிலில் மேய்க்கவும்; குட்டிகளை குளிர்காற்றிலிருந்து பாதுகாக்கவும்',
          ml: 'ഇളംവെയിലിൽ മേയ്ക്കുക; കുഞ്ഞുങ്ങളെ തണുപ്പിൽ നിന്ന് സംരക്ഷിക്കുക',
          mr: 'कोवळ्या उन्हात चरा; लहान पिल्लांना थंडीपासून वाचवा'
        }),
        detailedAdvice: localeText({
          en: 'Young kids & lambs under 2 months lack fat reserves and can quickly develop lethal hypothermia or pneumonia during cold night breezes.',
          hi: '2 महीने से छोटे मेमने ठंड बर्दाश्त नहीं कर पाते और निमोनिया की चपेट में आ जाते हैं।',
          kn: '2 ತಿಂಗಳೊಳಗಿನ ಮರಿಗಳಿಗೆ ಚಳಿ ತಡೆಯುವ ಶಕ್ತಿ ಇರುವುದಿಲ್ಲ, ನ್ಯುಮೋನಿಯಾ ಬರುವ ಅಪಾಯವಿರುತ್ತದೆ.',
          te: 'రెండు నెలల లోపు పిల్లలు చలిని తట్టుకోలేక న్యుమోనియా బారిన పడవచ్చు.',
          ta: 'இரண்டு மாதத்திற்கு உட்பட்ட குட்டிகளுக்கு நிமோனியா காய்ச்சல் வர வாய்ப்புள்ளது.',
          ml: 'രണ്ട് മാസത്തിൽ താഴെയുള്ള കുഞ്ഞുങ്ങൾക്ക് ന്യുമോണിയ വരാൻ സാധ്യതയുണ്ട്.',
          mr: 'दोन महिन्यांपेक्षा लहान पिल्लांना थंडी सहन होत नाही आणि न्यूमोनिया होऊ शकतो.'
        }),
        keyActionItem: localeText({
          en: 'Spread clean dry paddy straw bedding in nursery pens. Close nighttime cold draft curtains.',
          hi: 'मेमनों के नीचे सूखी पुआल बिछाएं। रात को ठंडी हवा रोकने के लिए पर्दे लगाएं।',
          kn: 'ಮರಿಗಳ ಕೆಳಗೆ ಒಣ ಹುಲ್ಲು ಹಾಸಿ, ರಾತ್ರಿ ಚಳಿಗಾಳಿ ತಡೆಯಲು ಪರದೆ ಹಾಕಿ.',
          te: 'పిల్లల కింద ఎండు గడ్డి పరచండి, రాత్రి చలిగాలి తగలకుండా పరదాలు వేయండి.',
          ta: 'குட்டிகளுக்கு உலர்ந்த வைக்கோல் படுக்கை போட்டு, இரவு குளிர்காற்று வீசாமல் மூடவும்.',
          ml: 'കുഞ്ഞുങ്ങൾക്ക് ഉണങ്ങിയ വൈക്കോൽ വിരിക്കുക, തണുത്ത കാറ്റ് തടയാൻ മറയിടുക.',
          mr: 'पिल्लांखाली सुका पेंढा अंथरा, रात्रीच्या हवेपासून वाचवण्यासाठी पडदे लावा.'
        })
      };
    }

    // 5. Pleasant / Prime Grazing
    return {
      status: 'safe',
      statusLabel: localeText({
        en: 'Prime Grazing Conditions',
        hi: 'उत्तम चराई का दिन',
        kn: 'ಮೇಯಿಸಲು ಅತ್ಯುತ್ತಮ ದಿನ',
        te: 'మేతకు అనుకూలమైన రోజు',
        ta: 'மேய்ச்சலுக்கு ஏற்ற நாள்',
        ml: 'മേച്ചിലിന് ഏറ്റവും നല്ല ദിവസം',
        mr: 'चरण्यासाठी उत्तम दिवस'
      }),
      badgeColor: 'bg-emerald-100 text-emerald-950 border-emerald-300',
      bestHours: localeText({
        en: '7:00 – 11:00 AM & 3:45 – 6:30 PM',
        hi: 'सुबह 7:00 – 11:00 & शाम 3:45 – 6:30',
        kn: 'ಬೆಳಿಗ್ಗೆ 7:00 – 11:00 & ಸಂಜೆ 3:45 – 6:30',
        te: 'ఉదయం 7:00 – 11:00 & సాయంత్రం 3:45 – 6:30',
        ta: 'காலை 7:00 – 11:00 & மாலை 3:45 – 6:30',
        ml: 'രാവിലെ 7:00 – 11:00 & വൈകുന്നേരം 3:45 – 6:30',
        mr: 'सकाळी 7:00 – 11:00 & संध्याकाळी 3:45 – 6:30'
      }),
      headline: localeText({
        en: 'Ideal Weather for Open Flock Grazing & Pasture Foraging',
        hi: 'खुले मैदान में चराने और प्राकृतिक जड़ी-बूटियों की चरने का सही समय',
        kn: 'ತೆರೆದ ಪ್ರದೇಶದಲ್ಲಿ ಆಡು-ಕುರಿಗಳನ್ನು ಮೇಯಿಸಲು ಸೂಕ್ತ ಹವಾಮಾನ',
        te: 'జీవాలను మేతకు తీసుకెళ్లడానికి అత్యంత అనుకూలమైన వాతావరణం',
        ta: 'ஆடுகளை திறந்த வெளியில் மேய்ப்பதற்கு மிகவும் சாதகமான சூழல்',
        ml: 'ആടുകളെ തുറസ്സായ സ്ഥലങ്ങളിൽ മേയ്ക്കാൻ അനുയോജ്യമായ കാലാവസ്ഥ',
        mr: 'शेळ्या-मेंढ्यांना खुल्या रानात चरण्यासाठी अत्यंत अनुकूल हवामान'
      }),
      detailedAdvice: localeText({
        en: 'Dry grass and mild sun stimulate rumen digestion, natural mineral intake from native shrubs, and overall flock stamina.',
        hi: 'हल्की धूप और सूखी घास से पाचन शक्ति बढ़ती है और बकरियां झाड़ियों से प्राकृतिक खनिज ग्रहण करती हैं।',
        kn: 'ಒಣ ಹುಲ್ಲು ಮತ್ತು ಹಿತಕರ ಬಿಸಿಲು ಜೀರ್ಣಕ್ರಿಯೆ ಹೆಚ್ಚಿಸಿ ಆಡುಗಳ ಆರೋಗ್ಯ ಸುಧಾರಿಸುತ್ತದೆ.',
        te: 'లేత ఎండ వల్ల జీర్ణక్రియ బాగుంటుంది, పొదల నుంచి సహజ లవణాలు లభిస్తాయి.',
        ta: 'இதமான வெயிலும் உலர்ந்த புல்லும் செரிமானத்தை அதிகரித்து ஆடுகளை சுறுசுறுப்பாக்கும்.',
        ml: 'ഇളംവെയിലും ഉണങ്ങിയ പുല്ലും ദഹനശേഷി കൂട്ടുകയും ആരോഗ്യം നൽകുകയും ചെയ്യുന്നു.',
        mr: 'कोवळे ऊन आणि सुके गवत यामुळे पचनशक्ती सुधारते आणि रोगप्रतिकारशक्ती वाढते.'
      }),
      keyActionItem: localeText({
        en: 'Excellent day for flock exercise, body condition scoring, and weekly hoof inspection.',
        hi: 'आज रेवड़ को अच्छा व्यायाम कराएं, वजन व स्वास्थ्य की जांच करें।',
        kn: 'ಇಂದು ಹಿಂಡಿನ ತಪಾಸಣೆ ಮತ್ತು ಗೊರಸು ಪರಿಶೀಲನೆಗೆ ಉತ್ತಮ ದಿನ.',
        te: 'నేడు జీవాల ఆరోగ్య స్థితి మరియు గిట్టల పరిశీలనకు మంచి రోజు.',
        ta: 'இன்று ஆடுகளின் எடை மற்றும் குளம்புகளைப் பரிசோதிக்க நல்ல நாள்.',
        ml: 'ഇന്ന് ആടുകളുടെ ആരോഗ്യവും കുളമ്പുകളും പരിശോധിക്കാൻ നല്ല ദിവസം.',
        mr: 'आज कळपाची तपासणी आणि खुरांची पाहणी करण्यासाठी चांगला दिवस आहे.'
      })
    };
  };

  const weatherDesc = current 
    ? getWeatherDescription(current.weatherCode, lang) 
    : { text: 'Loading weather...', emoji: '☀️' };
  const rainChance = forecast.length > 0 ? forecast[0].rainChance : 0;
  const guidance = getGrazingGuidance(current, rainChance);

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-800 to-emerald-950 text-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-2xl sm:text-3xl shrink-0">🌤️</span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-black tracking-tight truncate">
                {localeText({
                  en: 'Weather & Grazing Dashboard',
                  hi: 'मौसम और चराई डैशबोर्ड',
                  kn: 'ಹವಾಮಾನ & ಮೇಯಿಸುವ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
                  te: 'వాతావరణం & మేత డాష్‌బోర్డ్',
                  ta: 'வானிலை & மேய்ச்சல் டாஷ்போர்டு',
                  ml: 'കാലാവസ്ഥ & മേച്ചിൽ ഡാഷ്‌ബോർഡ്',
                  mr: 'हवामान आणि चराई डॅशबोर्ड'
                })}
              </h2>
              <p className="text-xs text-emerald-200 font-medium truncate">
                {farm.name} · {coords.label}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
            title="Cancel & Close"
            aria-label="Cancel and Close Weather Dashboard"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-stone-900">
          
          {/* 1. Live Weather Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50/60 via-stone-50 to-emerald-50/40 border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-center text-3xl shrink-0">
                  {weatherDesc.emoji}
                </div>
                <div>
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-3xl font-black text-stone-900 tracking-tight font-mono">
                      {current ? `${current.temperature}°C` : '--'}
                    </span>
                    <span className="text-sm font-black text-emerald-800">
                      {weatherDesc.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 font-medium mt-0.5">
                    <span className="flex items-center gap-1 text-stone-700 font-bold truncate">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span className="truncate">{coords.label}</span>
                    </span>
                    {current && (
                      <span className="text-stone-400">
                        ({localeText({ en: 'Feels', hi: 'महसूस', kn: 'ಅನಿಸುತ್ತದೆ', te: 'అనిపిస్తుంది', ta: 'உணர்கிறது', ml: 'തോന്നുന്നു', mr: 'जाणवते' })} {current.apparentTemperature}°C)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Safety Badge */}
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-black flex items-center gap-1.5 shadow-2xs shrink-0 ${guidance.badgeColor}`}>
                <span className="text-sm">
                  {guidance.status === 'safe' ? '🟢' : guidance.status === 'caution' ? '🟡' : '🔴'}
                </span>
                <span>{guidance.statusLabel}</span>
              </div>
            </div>

            {/* Quick Metrics (Rain, Humidity, Wind) */}
            {current && (
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-200/60">
                <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center justify-center gap-1">
                    <CloudRain className="w-3 h-3 text-sky-600" />
                    <span>{localeText({ en: 'Rain Chance', hi: 'बारिश', kn: 'ಮಳೆ', te: 'వర్షం', ta: 'மழை', ml: 'മഴ', mr: 'पाऊस' })}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-sky-950 block mt-0.5">
                    {rainChance}%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center justify-center gap-1">
                    <Droplets className="w-3 h-3 text-teal-600" />
                    <span>{localeText({ en: 'Humidity', hi: 'नमी', kn: 'ತೇವಾಂಶ', te: 'తేమ', ta: 'ஈரப்பதம்', ml: 'ഈർപ്പം', mr: 'आर्द्रता' })}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-teal-950 block mt-0.5">
                    {current.humidity}%
                  </span>
                </div>

                <div className="p-2 rounded-xl bg-white/90 border border-stone-200/80 text-center">
                  <span className="text-[10px] font-bold text-stone-500 uppercase flex items-center justify-center gap-1">
                    <Wind className="w-3 h-3 text-amber-600" />
                    <span>{localeText({ en: 'Wind', hi: 'हवा', kn: 'ಗಾಳಿ', te: 'గాలి', ta: 'காற்று', ml: 'കാറ്റ്', mr: 'वारा' })}</span>
                  </span>
                  <span className="text-xs sm:text-sm font-black text-amber-950 block mt-0.5">
                    {current.windSpeed} km/h
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 2. Grazing & Herd Management Advisor Box */}
          <div className={`p-4 rounded-2xl border space-y-2.5 ${
            guidance.status === 'avoid'
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : guidance.status === 'caution'
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
          }`}>
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {guidance.status === 'avoid' ? '🌧️' : guidance.status === 'caution' ? '⚠️' : '🌿'}
                </span>
                <span className="text-sm font-black tracking-tight">
                  {guidance.headline}
                </span>
              </div>

              {/* Optimal Hours Pill */}
              <div className="px-2.5 py-1 rounded-xl bg-white/95 border border-stone-200 text-stone-900 text-xs font-black flex items-center gap-1 shadow-2xs">
                <Clock className="w-3.5 h-3.5 text-emerald-800 shrink-0" />
                <span>{guidance.bestHours}</span>
              </div>
            </div>

            <p className="text-xs font-medium leading-relaxed opacity-90">
              {guidance.detailedAdvice}
            </p>

            {guidance.keyActionItem && (
              <div className="p-2.5 rounded-xl bg-white/90 border border-stone-200/80 text-xs font-bold text-stone-900 flex items-center gap-2 shadow-2xs">
                <span className="text-sm shrink-0">💡</span>
                <span>{guidance.keyActionItem}</span>
              </div>
            )}
          </div>

          {/* 3. 3-Day Pasture Grazing Forecast */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-emerald-800" />
                <span>{localeText({
                  en: '3-Day Grazing & Pasture Forecast',
                  hi: '3 दिनों का चराई पूर्वानुमान',
                  kn: '3 ದಿನಗಳ ಮೇಯಿಸುವ ಮುನ್ಸೂಚನೆ',
                  te: '3 రోజుల మేత సూచన',
                  ta: '3 நாள் மேய்ச்சல் முன்னறிவிப்பு',
                  ml: '3 ദിവസത്തെ മേച്ചിൽ പ്രവചനം',
                  mr: '३ दिवसांचा चराई अंदाज'
                })}</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {forecast.map((day) => {
                const dDesc = getWeatherDescription(day.weatherCode, lang);
                let grazingBadge = {
                  text: localeText({ en: '🟢 Safe Grazing', hi: '🟢 चराई अनुकूल', kn: '🟢 ಸೂಕ್ತ ಮೇವು', te: '🟢 సురక్షిత మేత', ta: '🟢 சாதகமானது', ml: '🟢 നല്ല ദിവസം', mr: '🟢 अनुकूल' }),
                  bg: 'bg-emerald-50 text-emerald-950 border-emerald-200'
                };
                if (day.grazingStatus === 'avoid') {
                  grazingBadge = {
                    text: localeText({ en: '🔴 Avoid Grazing', hi: '🔴 चराई रोकें', kn: '🔴 ಮೇಯಿಸಬೇಡಿ', te: '🔴 మేపవద్దు', ta: '🔴 மேய்க்காதீர்', ml: '🔴 ഒഴിവാക്കുക', mr: '🔴 चराई टाळा' }),
                    bg: 'bg-rose-50 text-rose-950 border-rose-200'
                  };
                } else if (day.grazingStatus === 'caution') {
                  grazingBadge = {
                    text: localeText({ en: '🟡 Caution Grazing', hi: '🟡 सावधानी रखें', kn: '🟡 ಎಚ್ಚರಿಕೆ', te: '🟡 జాగ్రత్త', ta: '🟡 கவனம் தேவை', ml: '🟡 ശ്രദ്ധിക്കുക', mr: '🟡 दक्षता घ्या' }),
                    bg: 'bg-amber-50 text-amber-950 border-amber-200'
                  };
                }

                return (
                  <div key={day.date} className="p-3 rounded-2xl bg-white border border-stone-200 shadow-2xs flex items-center justify-between sm:flex-col sm:items-center sm:text-center gap-2">
                    <div className="flex items-center gap-2 sm:flex-col sm:gap-1">
                      <span className="text-xs font-black text-stone-900">{day.dayName}</span>
                      <span className="text-2xl sm:my-0.5">{dDesc.emoji}</span>
                      <span className="text-xs font-bold text-stone-700">
                        {day.tempMax}° / <span className="text-stone-400">{day.tempMin}°</span>
                      </span>
                    </div>

                    <div className="flex flex-col items-end sm:items-center gap-1">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${grazingBadge.bg}`}>
                        {grazingBadge.text}
                      </span>
                      <span className="text-[10px] font-semibold text-sky-700">
                        💧 {day.rainChance}% rain
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. Pasture District & GPS Coordinates Switcher */}
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-black text-stone-700 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-800" />
                <span>{localeText({
                  en: 'Grazing District / Location:',
                  hi: 'चारागाह स्थान:',
                  kn: 'ಮೇಯಿಸುವ ಸ್ಥಳ:',
                  te: 'మేత ప్రాంతం:',
                  ta: 'மேய்ச்சல் இடம்:',
                  ml: 'മേച്ചിൽ സ്ഥലം:',
                  mr: 'चराई ठिकाण:'
                })}</span>
                <strong className="text-emerald-950 font-bold">{coords.label}</strong>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleUseGPS}
                  disabled={locatingGPS}
                  className="px-2.5 py-1 rounded-xl bg-white hover:bg-stone-100 border border-stone-300 text-stone-800 text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs disabled:opacity-50"
                  title="Detect live GPS coordinates"
                >
                  <Navigation className={`w-3 h-3 text-emerald-700 ${locatingGPS ? 'animate-spin' : ''}`} />
                  <span>{locatingGPS ? 'GPS...' : '📍 Auto-GPS'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="px-2.5 py-1 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-950 text-xs font-bold cursor-pointer transition-colors"
                >
                  {showLocationPicker ? 'Hide List' : 'Change District'}
                </button>
              </div>
            </div>

            {showLocationPicker && (
              <div className="pt-2 border-t border-stone-200/60 space-y-1.5 animate-in fade-in duration-150">
                <span className="text-[10px] font-bold text-stone-500 uppercase block">
                  Select Hub:
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                  {Object.entries(KNOWN_FARM_LOCATIONS).map(([k, val]: [string, { lat: number; lon: number; label: string }]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => {
                        setCoords(val);
                        setShowLocationPicker(false);
                        fetchWeather(val.lat, val.lon, val.label);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                        coords.label.toLowerCase().includes(k)
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      🌾 {val.label.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Modal Action Footer with Cancel Option */}
        <div className="px-4 sm:px-6 py-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0 flex-wrap">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <button
              type="button"
              onClick={() => fetchWeather(coords.lat, coords.lon, coords.label)}
              disabled={isRefreshing}
              className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-2xs"
              title="Refresh Weather Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="font-bold text-[11px]">Refresh</span>
            </button>
            {lastUpdated && (
              <span className="text-[11px] text-stone-400">
                Updated {lastUpdated}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenAdminLocation && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAdminLocation();
                }}
                className="px-3 py-2 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Configure permanent farm location in Farm Settings"
              >
                <Settings className="w-3.5 h-3.5 text-stone-500" />
                <span>{localeText({ en: 'Farm Settings', hi: 'फार्म सेटिंग', kn: 'ಫಾರ್ಮ್ ಸೆಟ್ಟಿಂಗ್ಸ್', te: 'ఫారం సెట్టింగ్స్', ta: 'பண்ணை அமைப்புகள்', ml: 'ഫാം ക്രമീകരണങ്ങൾ', mr: 'फार्म सेटिंग' })}</span>
              </button>
            )}

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all"
            >
              <X className="w-4 h-4" />
              <span>
                {localeText({
                  en: 'Cancel & Close',
                  hi: 'रद्द करें / बंद करें',
                  kn: 'ರದ್ದುಮಾಡಿ / ಮುಚ್ಚಿ',
                  te: 'రద్దు చేయండి / మూసివేయండి',
                  ta: 'ரத்து செய் / மூடு',
                  ml: 'റദ്ദാക്കുക / അടയ്ക്കുക',
                  mr: 'रद्द करा / बंद करा'
                })}
              </span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
