import { Farm, User } from '../types';

// Clear, colorful SVG illustrations for livestock
export const COW_ILLUSTRATION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="400" height="300" fill="%23fef3c7"/><circle cx="340" cy="60" r="45" fill="%23fed7aa" opacity="0.6"/><path d="M0 220 Q120 180 240 210 T400 200 L400 300 L0 300 Z" fill="%2386efac" opacity="0.6"/><path d="M0 240 Q150 210 300 235 T400 230 L400 300 L0 300 Z" fill="%2322c55e" opacity="0.4"/><g transform="translate(60, 60)"><path d="M70 100 Q85 45 180 50 Q235 52 250 90 Q265 115 255 155 Q245 185 220 190 L215 220 L195 220 L200 190 L150 190 L145 220 L125 220 L130 190 L105 190 L100 220 L80 220 L88 185 Q65 175 60 135 Z" fill="%23ea580c" stroke="%237c2d12" stroke-width="4"/><path d="M120 70 Q150 60 160 90 Q165 120 135 130 Q110 120 115 90 Z" fill="%23ffffff"/><path d="M60 100 Q30 75 20 105 Q15 135 45 145 Q60 147 65 135 Z" fill="%23ea580c" stroke="%237c2d12" stroke-width="4"/><path d="M22 115 Q15 128 28 135 Q40 142 48 132 Z" fill="%23fed7aa"/><circle cx="35" cy="100" r="4" fill="%23171717"/><path d="M48 80 Q38 50 48 45 Q58 52 52 80 Z" fill="%23fed7aa" stroke="%237c2d12" stroke-width="2"/><path d="M68 78 Q78 50 88 54 Q82 72 70 80 Z" fill="%23fed7aa" stroke="%237c2d12" stroke-width="2"/><rect x="52" y="105" width="14" height="16" rx="3" fill="%23eab308"/><text x="54" y="117" font-family="sans-serif" font-size="8" font-weight="bold" fill="%23713f12">%23101</text></g></svg>`;

export const GOAT_ILLUSTRATION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="400" height="300" fill="%23fef9ee"/><circle cx="60" cy="60" r="50" fill="%23fed7aa" opacity="0.5"/><path d="M0 220 Q160 190 280 215 T400 205 L400 300 L0 300 Z" fill="%23bbf7d0" opacity="0.6"/><g transform="translate(80, 60)"><path d="M80 80 Q120 55 190 60 Q230 65 240 100 Q245 135 225 160 L220 210 L200 210 L205 165 L160 165 L155 210 L135 210 L140 165 L105 165 L98 210 L80 210 L90 150 Q75 130 75 105 Z" fill="%23ffffff" stroke="%2338271e" stroke-width="4"/><path d="M78 80 Q55 55 45 80 Q35 110 65 125 Q80 128 85 110 Z" fill="%237c2d12"/><path d="M48 65 Q35 25 20 20 Q15 35 38 68 Z" fill="%23292524" stroke="%231c1917" stroke-width="2"/><path d="M62 60 Q60 22 45 18 Q40 32 55 64 Z" fill="%23292524" stroke="%231c1917" stroke-width="2"/><circle cx="55" cy="85" r="4" fill="%23171717"/><path d="M55 125 Q50 145 56 150 Q62 145 60 125 Z" fill="%23fed7aa"/><rect x="75" y="90" width="12" height="15" rx="3" fill="%23eab308"/><text x="76" y="101" font-family="sans-serif" font-size="7" font-weight="bold" fill="%23713f12">%23303</text></g></svg>`;

export const SHEEP_ILLUSTRATION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="400" height="300" fill="%23f1f5f9"/><circle cx="330" cy="70" r="40" fill="%23bae6fd" opacity="0.5"/><path d="M0 225 Q140 195 270 215 T400 210 L400 300 L0 300 Z" fill="%2386efac" opacity="0.6"/><g transform="translate(85, 75)"><ellipse cx="160" cy="115" rx="75" ry="55" fill="%23f8fafc" stroke="%23334155" stroke-width="4"/><circle cx="110" cy="90" r="28" fill="%23f8fafc"/><circle cx="150" cy="75" r="32" fill="%23f8fafc"/><circle cx="195" cy="85" r="30" fill="%23f8fafc"/><circle cx="215" cy="120" r="28" fill="%23f8fafc"/><circle cx="190" cy="150" r="30" fill="%23f8fafc"/><circle cx="135" cy="155" r="32" fill="%23f8fafc"/><circle cx="100" cy="130" r="26" fill="%23f8fafc"/><path d="M85 95 Q60 80 50 105 Q45 130 70 140 Q85 140 92 120 Z" fill="%231e293b"/><circle cx="68" cy="104" r="3" fill="%23fef08a"/><line x1="120" y1="165" x2="115" y2="205" stroke="%23334155" stroke-width="7" stroke-linecap="round"/><line x1="145" y1="165" x2="142" y2="205" stroke="%23334155" stroke-width="7" stroke-linecap="round"/><line x1="185" y1="165" x2="188" y2="205" stroke="%23334155" stroke-width="7" stroke-linecap="round"/><line x1="210" y1="165" x2="215" y2="205" stroke="%23334155" stroke-width="7" stroke-linecap="round"/><rect x="80" y="105" width="12" height="14" rx="2" fill="%2338bdf8"/><text x="81" y="116" font-family="sans-serif" font-size="7" font-weight="bold" fill="%230c4a6e">%23404</text></g></svg>`;

export const CHICKEN_ILLUSTRATION = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="100%" height="100%"><rect width="400" height="300" fill="%23fef2f2"/><circle cx="70" cy="60" r="45" fill="%23fecaca" opacity="0.5"/><path d="M0 230 Q150 200 270 220 T400 215 L400 300 L0 300 Z" fill="%23bbf7d0" opacity="0.6"/><g transform="translate(110, 65)"><path d="M110 135 Q140 80 180 100 Q195 130 170 160 Q130 175 105 160 Z" fill="%23b91c1c" stroke="%237f1d1d" stroke-width="3"/><path d="M90 120 Q110 70 105 50 Q85 60 80 90 Q75 120 90 120 Z" fill="%23dc2626"/><path d="M102 38 Q100 25 110 30 Q118 20 125 32 Q132 25 135 38 Z" fill="%23ef4444"/><polygon points="75,65 60,72 75,78" fill="%23f59e0b"/><circle cx="92" cy="62" r="3" fill="%23171717"/><path d="M175 90 Q215 65 210 110 Q195 125 170 120 Z" fill="%237f1d1d"/><line x1="125" y1="165" x2="120" y2="205" stroke="%23d97706" stroke-width="5" stroke-linecap="round"/><line x1="145" y1="165" x2="148" y2="205" stroke="%23d97706" stroke-width="5" stroke-linecap="round"/><rect x="80" y="130" width="14" height="15" rx="3" fill="%23f59e0b"/><text x="81" y="141" font-family="sans-serif" font-size="7" font-weight="bold" fill="%2378350f">%23505</text></g></svg>`;

export const DEFAULT_USERS: User[] = [
  {
    id: 'user-superadmin-madhu',
    name: 'Madhu S (System Admin)',
    identifier: 'madhusav@gmail.com',
    authType: 'email',
    email: 'madhusav@gmail.com',
    phone: '+91 99999 00001',
    isSuperAdmin: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'user-superadmin-1',
    name: 'Super Admin',
    identifier: '9999999999',
    authType: 'phone',
    email: 'admin@farmtrack.io',
    phone: '9999999999',
    isSuperAdmin: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'user-vet-1',
    name: 'Dr. Priya Sharma (Flock Vet)',
    identifier: '+91 98110 54321',
    authType: 'phone',
    phone: '+91 98110 54321',
    email: 'dr.priya@kisanvet.in',
    createdAt: '2026-03-01',
  },
  {
    id: 'user-new-1',
    name: 'Priya Verma (New Farmer)',
    identifier: '+91 98990 11223',
    authType: 'phone',
    phone: '+91 98990 11223',
    email: 'priya.verma@gmail.com',
    createdAt: '2026-10-12',
  },
];

export const INITIAL_FARMS: Farm[] = [
  {
    id: 'FARM-1001',
    name: 'My Sheep & Goat Farm',
    adminUserId: 'user-superadmin-madhu',
    adminName: 'Madhu S',
    location: 'Anand, Gujarat, India',
    totalAcreage: 10,
    establishedYear: 2026,
    primarySpecies: ['Goat', 'Sheep'],
    createdAt: '2026-01-01',
    members: [
      {
        userId: 'user-superadmin-madhu',
        name: 'Madhu S',
        identifier: 'madhusav@gmail.com',
        role: 'Admin',
        joinedAt: '2026-01-01',
        status: 'active',
      },
      {
        userId: 'user-vet-1',
        name: 'Dr. Priya Sharma (Flock Vet)',
        identifier: '+91 98110 54321',
        role: 'Veterinarian',
        joinedAt: '2026-03-01',
        status: 'active',
      },
    ],
    joinRequests: [],
    animals: [],
    vaccinations: [],
    healthRecords: [],
  },
];
