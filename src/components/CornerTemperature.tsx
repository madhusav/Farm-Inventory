import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CloudRain, 
  MapPin, 
  Droplets, 
  Wind, 
  Settings, 
  ChevronDown,
  X
} from 'lucide-react';
import { Farm } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

export interface CornerTemperatureProps {
  farm: Farm;
  onOpenAdminLocation?: () => void;
  className?: string;
}

interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  weatherCode: number;
}

const KNOWN_FARM_LOCATIONS: Record<string, { lat: number; lon: number; label: string }> = {
  anand: { lat: 22.56, lon: 72.95, label: 'Anand, Gujarat' },
  pune: { lat: 18.52, lon: 73.85, label: 'Pune, Maharashtra' },
  karnal: { lat: 29.69, lon: 76.98, label: 'Karnal, Haryana' },
  ludhiana: { lat: 30.90, lon: 75.85, label: 'Ludhiana, Punjab' },
  jaipur: { lat: 26.91, lon: 75.78, label: 'Jaipur, Rajasthan' },
  nagpur: { lat: 21.14, lon: 79.08, label: 'Nagpur, Maharashtra' },
  coimbatore: { lat: 11.01, lon: 76.95, label: 'Coimbatore, Tamil Nadu' },
  varanasi: { lat: 25.31, lon: 82.97, label: 'Varanasi, UP' },
  patna: { lat: 25.59, lon: 85.13, label: 'Patna, Bihar' },
  hyderabad: { lat: 17.38, lon: 78.48, label: 'Hyderabad, Telangana' },
  bengaluru: { lat: 12.97, lon: 77.59, label: 'Bengaluru, Karnataka' },
  ahmedabad: { lat: 23.02, lon: 72.57, label: 'Ahmedabad, Gujarat' },
  hisar: { lat: 29.15, lon: 75.72, label: 'Hisar, Haryana' },
  mathura: { lat: 27.49, lon: 77.67, label: 'Mathura, UP' },
  bikaner: { lat: 28.02, lon: 73.31, label: 'Bikaner, Rajasthan' },
  indore: { lat: 22.71, lon: 75.85, label: 'Indore, MP' },
  lucknow: { lat: 26.84, lon: 80.94, label: 'Lucknow, UP' },
  satara: { lat: 17.68, lon: 74.00, label: 'Satara, Maharashtra' },
  nashik: { lat: 19.99, lon: 73.78, label: 'Nashik, Maharashtra' },
  solapur: { lat: 17.65, lon: 75.90, label: 'Solapur, Maharashtra' }
};

export function parseLocationCoordinates(locString: string): { lat: number; lon: number; label: string } {
  const clean = (locString || '').trim();
  const lower = clean.toLowerCase();
  
  // Check direct lat/lon coordinate pattern (e.g. "22.56, 72.95")
  const coordMatch = clean.match(/^([-+]?[0-9]*\.?[0-9]+)\s*,\s*([-+]?[0-9]*\.?[0-9]+)$/);
  if (coordMatch) {
    const lat = parseFloat(coordMatch[1]);
    const lon = parseFloat(coordMatch[2]);
    if (!isNaN(lat) && !isNaN(lon)) {
      return { lat, lon, label: clean };
    }
  }

  for (const [key, val] of Object.entries(KNOWN_FARM_LOCATIONS)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return { lat: 22.56, lon: 72.95, label: clean || 'Anand, Gujarat' };
}

export function getWeatherDescription(code: number, isHi: boolean): { text: string; emoji: string } {
  if (code === 0) return { text: isHi ? 'साफ धूप' : 'Clear & Sunny', emoji: '☀️' };
  if (code === 1 || code === 2) return { text: isHi ? 'हल्के बादल' : 'Partly Cloudy', emoji: '⛅' };
  if (code === 3) return { text: isHi ? 'घने बादल' : 'Cloudy Sky', emoji: '☁️' };
  if (code === 45 || code === 48) return { text: isHi ? 'कोहरा' : 'Morning Fog', emoji: '🌫️' };
  if (code >= 51 && code <= 65) return { text: isHi ? 'बारिश' : 'Rain Showers', emoji: '🌧️' };
  if (code >= 80 && code <= 82) return { text: isHi ? 'तेज बारिश' : 'Heavy Rain', emoji: '🌧️' };
  if (code >= 95) return { text: isHi ? 'तूफान' : 'Thunderstorm', emoji: '⛈️' };
  return { text: isHi ? 'सुखद मौसम' : 'Fair Weather', emoji: '🌤️' };
}

export function getPrimaryFarmerTip(temp: number, isHi: boolean): { emoji: string; text: string } {
  if (temp >= 35) {
    return {
      emoji: '💧',
      text: isHi 
        ? 'गर्मी ज्यादा है: बकरियों और भेड़ों को दिन में छायादार शेड में रखें और ठंडा पानी दें।' 
        : 'High Heat: Keep goats and sheep in shade with cool drinking water.',
    };
  }
  if (temp <= 16) {
    return {
      emoji: '❄️',
      text: isHi 
        ? 'ठंड का मौसम: छोटे मेमनों के नीचे सूखी पुआल बिछाएं और रात को हवा से बचाएं।' 
        : 'Cold night: Provide dry straw bedding for young kids and lambs.',
    };
  }
  return {
    emoji: '🌿',
    text: isHi 
      ? 'उत्तम मौसम: बकरियों व भेड़ों को चराने और शेड की सफाई के लिए अनुकूल समय।' 
      : 'Pleasant weather: Ideal for grazing flock and regular shed inspection.',
  };
}

export const CornerTemperature: React.FC<CornerTemperatureProps> = ({
  farm,
  onOpenAdminLocation,
  className = '',
}) => {
  const { lang } = useLanguage();
  const isHi = lang === 'hi';
  const popoverRef = useRef<HTMLDivElement>(null);

  const effectiveLocation = farm.config?.weatherLocation || farm.location || 'Anand, Gujarat';
  const customLat = farm.config?.weatherLatitude;
  const customLon = farm.config?.weatherLongitude;

  const resolvedCoords = (customLat && customLon) 
    ? { lat: customLat, lon: customLon, label: effectiveLocation }
    : parseLocationCoordinates(effectiveLocation);

  const [current, setCurrent] = useState<CurrentWeather | null>(() => {
    try {
      const cached = localStorage.getItem(`farm_weather_${resolvedCoords.lat}_${resolvedCoords.lon}`);
      if (cached) return JSON.parse(cached);
    } catch {
      // ignore
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!current);
  const [showPopover, setShowPopover] = useState<boolean>(false);

  const fetchWeather = useCallback(async (lat: number, lon: number) => {
    try {
      setLoading(true);
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m&timezone=auto`;
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

      setCurrent(curData);
      try {
        localStorage.setItem(`farm_weather_${lat}_${lon}`, JSON.stringify(curData));
      } catch {
        // ignore storage error
      }
    } catch {
      // Gentle offline fallback: retain cached weather if available, else standard fallback
      setCurrent(prev => prev ?? {
        temperature: 30,
        apparentTemperature: 32,
        humidity: 52,
        windSpeed: 9,
        precipitation: 0,
        weatherCode: 1,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(resolvedCoords.lat, resolvedCoords.lon);
  }, [resolvedCoords.lat, resolvedCoords.lon, fetchWeather]);

  // Click outside to close popover
  useEffect(() => {
    if (!showPopover) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const weatherDesc = current 
    ? getWeatherDescription(current.weatherCode, isHi) 
    : { text: 'Loading...', emoji: '☀️' };

  const shortCity = resolvedCoords.label.split(',')[0].trim();
  const farmerTip = current ? getPrimaryFarmerTip(current.temperature, isHi) : null;

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Compact Corner Temperature Pill */}
      <button
        type="button"
        onClick={() => setShowPopover(!showPopover)}
        className="px-2 sm:px-2.5 py-1.5 rounded-xl border border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/80 text-stone-800 text-xs font-black flex items-center gap-1 sm:gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 shrink-0"
        title={`Live Weather for ${resolvedCoords.label} (Set in Admin Tool). Tap for details.`}
      >
        <span className="text-sm shrink-0 leading-none">
          {weatherDesc.emoji}
        </span>
        <span className="font-mono text-xs font-black text-stone-900 tracking-tight">
          {loading && !current ? '--°C' : `${current?.temperature ?? 30}°C`}
        </span>
        <span className="text-[11px] font-bold text-amber-900/90 hidden sm:inline max-w-[90px] truncate">
          {shortCity}
        </span>
        <ChevronDown className="w-3 h-3 text-stone-400 shrink-0" />
      </button>

      {/* Floating Corner Details Popover (Guaranteed to fit on mobile viewports) */}
      {showPopover && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] max-w-xs sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-200 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
          
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-stone-100 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{weatherDesc.emoji}</span>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-black text-stone-900 font-mono">
                    {current ? `${current.temperature}°C` : '--'}
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {weatherDesc.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-stone-500 font-medium truncate">
                  <MapPin className="w-3 h-3 text-amber-700 shrink-0" />
                  <span className="truncate">{resolvedCoords.label}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="w-6 h-6 rounded-full bg-stone-100 hover:bg-stone-200 flex items-center justify-center text-stone-500 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          {current && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block">
                    {isHi ? 'हवा में नमी' : 'Humidity'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {current.humidity}%
                  </span>
                </div>
              </div>

              <div className="p-2 rounded-xl bg-stone-50 border border-stone-200/80 flex items-center gap-2">
                <Wind className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="text-[10px] text-stone-500 font-bold block">
                    {isHi ? 'हवा की गति' : 'Wind Speed'}
                  </span>
                  <span className="text-xs font-black text-stone-900">
                    {current.windSpeed} km/h
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Farmer Advisory Tip */}
          {farmerTip && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
              <span className="text-base shrink-0">{farmerTip.emoji}</span>
              <p className="text-[11px] leading-snug font-medium">
                {farmerTip.text}
              </p>
            </div>
          )}

          {/* Admin Location Config Hint & Button */}
          <div className="pt-1 border-t border-stone-100">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] text-stone-400 font-medium">
                📍 Location is set in Admin Tool
              </span>
              {onOpenAdminLocation && (
                <button
                  type="button"
                  onClick={() => {
                    setShowPopover(false);
                    onOpenAdminLocation();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                >
                  <Settings className="w-3 h-3" />
                  <span>{isHi ? 'स्थान बदलें' : 'Set Location'}</span>
                </button>
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
