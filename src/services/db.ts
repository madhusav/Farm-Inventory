import { 
  Farm, 
  User, 
  Animal, 
  Species, 
  GrowthMetric, 
  VaccinationRecord, 
  HealthRecord, 
  UserRole, 
  MilkYieldLog, 
  FarmConfig, 
  VaccineAlert,
  FinancialRecord,
  isVaccineManager,
  BreedProposal,
  GlobalBreed,
  FarmTask
} from '../types';
import { DEFAULT_USERS, INITIAL_FARMS } from '../data/initialData';

const STORAGE_USERS_KEY = 'farmtrack_mysql_users_v3';
const STORAGE_FARMS_KEY = 'farmtrack_mysql_farms_v3';
const STORAGE_CURRENT_USER_KEY = 'farmtrack_mysql_curr_user_v3';
const STORAGE_CURRENT_FARM_KEY = 'farmtrack_mysql_curr_farm_v3';
const STORAGE_APP_NAME_KEY = 'farmtrack_app_name_config';
const STORAGE_GLOBAL_BREEDS_KEY = 'farmtrack_global_breeds_v1';
const STORAGE_BREED_PROPOSALS_KEY = 'farmtrack_breed_proposals_v1';

export const DEFAULT_GLOBAL_BREEDS: GlobalBreed[] = [
  // GOAT BREEDS
  {
    id: 'breed-goat-1',
    species: 'Goat',
    name: 'Sirohi Brown Goat',
    originRegion: 'Rajasthan & Gujarat border',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Hardy desert goat with compact cylindrical body, brown coat with light/dark brown patches, drooping leaf-like ears, fast growth.',
    averageMatureWeightKg: 50,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-2',
    species: 'Goat',
    name: 'Jamnapari Goat',
    originRegion: 'Etawah, Uttar Pradesh',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Majestic large dairy goat with prominent convex Roman nose, long pendulous folded ears, high milk yield (2-3 L/day), tall leggy stature.',
    averageMatureWeightKg: 65,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-3',
    species: 'Goat',
    name: 'Barbari White Goat',
    originRegion: 'Delhi, Haryana & Western UP',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Compact alert stall-feeding breed, white with reddish-brown spots, erect tubular ears, early sexual maturity and high prolificacy (frequent triplets).',
    averageMatureWeightKg: 35,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-4',
    species: 'Goat',
    name: 'Black Bengal Goat',
    originRegion: 'West Bengal, Bihar & Assam',
    primaryPurpose: 'Meat',
    characteristics: 'Renowned for world-class tender chevon meat and superior leather skin; high reproductive rate (twins/triplets every 8 months); short black glossy coat.',
    averageMatureWeightKg: 28,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-5',
    species: 'Goat',
    name: 'Osmanabadi Goat',
    originRegion: 'Marathwada, Maharashtra',
    primaryPurpose: 'Meat',
    characteristics: 'Hardy disease-resistant meat breed with shiny black coat, excellent immunity to local diseases, adaptable to semi-arid drought conditions.',
    averageMatureWeightKg: 42,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-6',
    species: 'Goat',
    name: 'Boer Meat Goat',
    originRegion: 'South Africa / Global Crosses',
    primaryPurpose: 'Meat',
    characteristics: 'Premier terminal meat sire breed; thick muscular build, reddish-brown head with white body, rapid daily weight gain (ADG 200g+).',
    averageMatureWeightKg: 85,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-7',
    species: 'Goat',
    name: 'Beetal Goat',
    originRegion: 'Punjab & Gurdaspur',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Large majestic breed with Roman nose, long flat drooping ears, reddish or golden coat with spots, high milking ability and heavy weight gain.',
    averageMatureWeightKg: 60,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-8',
    species: 'Goat',
    name: 'Sojat Goat',
    originRegion: 'Pali & Jodhpur, Rajasthan',
    primaryPurpose: 'Meat',
    characteristics: 'Heavy white-coated goat with pink skin and flat drooping ears, highly prized for heavy live-weight gain during festive markets.',
    averageMatureWeightKg: 58,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-9',
    species: 'Goat',
    name: 'Tellicherry / Malabari Goat',
    originRegion: 'Malabar, Kerala',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Coastal adapted breed with white, brown, or black mottled coats; high twinning rate and calm docile temperament; thrives on stall foliage.',
    averageMatureWeightKg: 40,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-10',
    species: 'Goat',
    name: 'Jakhrana Goat',
    originRegion: 'Alwar, Rajasthan',
    primaryPurpose: 'Milk',
    characteristics: 'Top Indian milch goat producing 3-4 liters/day; jet black coat with white specks on ears and muzzle; compact dairy wedge conformation.',
    averageMatureWeightKg: 52,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-goat-11',
    species: 'Goat',
    name: 'Kanni Adu Goat',
    originRegion: 'Ramanathapuram & Tirunelveli, Tamil Nadu',
    primaryPurpose: 'Meat',
    characteristics: 'Tall graceful meat goat with black body and distinct white/tan stripes on face and legs; thrives in dry scrublands with outstanding drought resistance.',
    averageMatureWeightKg: 38,
    isSystemDefault: false,
    addedFromProposalId: 'prop-sample-approved-1',
    createdAt: '2026-01-15T00:00:00Z',
  },

  // SHEEP BREEDS
  {
    id: 'breed-sheep-1',
    species: 'Sheep',
    name: 'Deccani Wool Sheep',
    originRegion: 'Maharashtra, Karnataka & Telangana',
    primaryPurpose: 'Wool & Fiber',
    characteristics: 'Hardy pastoral sheep with coarse hairy fleece (black, white, or roan) used for rough Kambli blankets; robust trekking ability in semi-arid zones.',
    averageMatureWeightKg: 42,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-2',
    species: 'Sheep',
    name: 'Nellore Meat Sheep',
    originRegion: 'Andhra Pradesh & Telangana',
    primaryPurpose: 'Meat',
    characteristics: 'Tallest sheep breed in India; distinct hair coat (no wool), long legs, dewlap on rams; prized for lean mutton yield and rapid feedlot weight gain.',
    averageMatureWeightKg: 55,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-3',
    species: 'Sheep',
    name: 'Bellary Sheep',
    originRegion: 'Bellary & Davanagere, Karnataka',
    primaryPurpose: 'Meat',
    characteristics: 'Medium-sized sheep with coarse black, grey, or piebald fleece; heavy chest and excellent foraging ability in harsh rain-shadow tracts.',
    averageMatureWeightKg: 40,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-4',
    species: 'Sheep',
    name: 'Mandya Sheep',
    originRegion: 'Mandya & Mysuru, Karnataka',
    primaryPurpose: 'Meat',
    characteristics: 'Compact blocky wedge body shape (Bannur sheep), white coat with brown patches; renowned across Southern India for premium tender mutton flavor.',
    averageMatureWeightKg: 36,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-5',
    species: 'Sheep',
    name: 'Merino Sheep',
    originRegion: 'Temperate Crosses / Nilgiris',
    primaryPurpose: 'Wool & Fiber',
    characteristics: 'World famous fine fleece apparel wool sheep; dense crimped white wool yielding high clean fleece weight.',
    averageMatureWeightKg: 50,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-6',
    species: 'Sheep',
    name: 'Nali Carpet Sheep',
    originRegion: 'Bikaner & Ganganagar, Rajasthan',
    primaryPurpose: 'Wool & Fiber',
    characteristics: 'Heavy wool producer with dense white/cream fleece ideal for hand-knotted Rajasthani carpets; long ears and pink nose.',
    averageMatureWeightKg: 45,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-7',
    species: 'Sheep',
    name: 'Marwari Sheep',
    originRegion: 'Jodhpur & Nagaur, Rajasthan',
    primaryPurpose: 'Dual Purpose (Meat & Milk)',
    characteristics: 'Classic black face with white body; long droopy ears; outstanding immune resistance to worm burdens and black disease in drylands.',
    averageMatureWeightKg: 48,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-8',
    species: 'Sheep',
    name: 'Madras Red Sheep',
    originRegion: 'Kanchipuram & Chengalpattu, Tamil Nadu',
    primaryPurpose: 'Meat',
    characteristics: 'Hardy hair sheep with rich brown-red coat; rams have curled horns and thick neck ruff; favorite for festival meat markets.',
    averageMatureWeightKg: 38,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-9',
    species: 'Sheep',
    name: 'Muzaffarnagri Sheep',
    originRegion: 'Muzaffarnagar & Meerut, UP',
    primaryPurpose: 'Meat',
    characteristics: 'Heaviest and largest indigenous Indian sheep; long cylindrical body, slightly convex face, thick long tail, superb stall-fed mutton producer.',
    averageMatureWeightKg: 62,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'breed-sheep-10',
    species: 'Sheep',
    name: 'Chokla Sheep',
    originRegion: 'Shekhawati, Rajasthan',
    primaryPurpose: 'Wool & Fiber',
    characteristics: 'Known as the "Indian Merino"; produces the finest indigenous carpet and apparel wool in the country; distinct dark brown face and white body.',
    averageMatureWeightKg: 35,
    isSystemDefault: true,
    createdAt: '2026-01-01T00:00:00Z',
  },
];

export const DEFAULT_BREED_PROPOSALS: BreedProposal[] = [
  {
    id: 'prop-1',
    species: 'Goat',
    breedName: 'Attappady Black Goat',
    originRegion: 'Attappady Hills, Palakkad, Kerala',
    primaryPurpose: 'Meat',
    characteristics: 'Indigenous mountain goat with jet black coat, bronze eyes, curved horns, and high resistance to tick-borne illnesses and foot rot in damp weather.',
    averageMatureWeightKg: 34,
    proposedByFarmId: 'FARM-7821',
    proposedByFarmName: 'Gokul Pure Dairy & Livestock',
    proposedByUserId: 'user-admin-1',
    proposedByUserName: 'Ramesh Patel',
    status: 'pending',
    createdAt: '2026-10-25T11:20:00Z',
  },
  {
    id: 'prop-2',
    species: 'Sheep',
    breedName: 'Dumba Fat-Tailed Sheep',
    originRegion: 'Thar Desert / Punjab Border',
    primaryPurpose: 'Meat',
    characteristics: 'Signature bilobed fat cushion at base of tail for energy storage during dry spells, heavy live weight gain on thorny shrubs, distinct convex head.',
    averageMatureWeightKg: 65,
    proposedByFarmId: 'FARM-7821',
    proposedByFarmName: 'Gokul Pure Dairy & Livestock',
    proposedByUserId: 'user-admin-1',
    proposedByUserName: 'Ramesh Patel',
    status: 'pending',
    createdAt: '2026-10-26T08:45:00Z',
  },
  {
    id: 'prop-sample-approved-1',
    species: 'Goat',
    breedName: 'Kanni Adu Goat',
    originRegion: 'Ramanathapuram & Tirunelveli, Tamil Nadu',
    primaryPurpose: 'Meat',
    characteristics: 'Tall graceful meat goat with black body and distinct white/tan stripes on face and legs; thrives in dry scrublands with outstanding drought resistance.',
    averageMatureWeightKg: 38,
    proposedByFarmId: 'FARM-7821',
    proposedByFarmName: 'Gokul Pure Dairy & Livestock',
    proposedByUserId: 'user-admin-1',
    proposedByUserName: 'Ramesh Patel',
    status: 'approved',
    adminNotes: 'Verified with ICAR-NBAGR accession registry. High genetic conservation value.',
    createdAt: '2026-10-15T09:30:00Z',
    reviewedAt: '2026-10-16T14:10:00Z',
    reviewedBy: 'Madhu S (System Admin)',
  },
];

export const DEFAULT_FARM_CONFIG: FarmConfig = {
  appName: 'Testing',
  vaccineAlertDaysThreshold: 7,
  targetDailyMilkLiters: 45.0,
  defaultMilkUnit: 'Litres',
  contactPhone: '+91 98765 43210',
  customVaccines: [
    'FMD (Foot & Mouth Disease)',
    'Anthrax',
    'Black Quarter (BQ)',
    'PPR Goat Plague',
    'Brucellosis Abortion Shield',
    'Ranikhet Disease Newcastle'
  ]
};

export const DEFAULT_FINANCIAL_RECORDS: FinancialRecord[] = [
  {
    id: 'fin-1',
    farmId: 'FARM-7821',
    date: '2026-10-12',
    type: 'income',
    category: 'Livestock Sale',
    amount: 32000,
    title: 'Sale of 4 Jamnapari Weaned Kids',
    notes: 'Sold to neighboring breeding farm @ ₹8,000 each',
    recordedBy: 'Ramesh Patel',
    createdAt: '2026-10-12T08:30:00Z',
  },
  {
    id: 'fin-2',
    farmId: 'FARM-7821',
    date: '2026-10-11',
    type: 'expense',
    category: 'Feed & Fodder',
    amount: 6500,
    title: 'Groundnut Dry Hay & Subabul Leaves Fodder',
    notes: '2 cart loads for goat and sheep flock feeding',
    recordedBy: 'Ramesh Patel',
    createdAt: '2026-10-11T10:15:00Z',
  },
  {
    id: 'fin-3',
    farmId: 'FARM-7821',
    date: '2026-10-10',
    type: 'income',
    category: 'Wool & Hair',
    amount: 18500,
    title: 'Autumn Shearing Deccani Raw Wool Fleece Sale',
    notes: '125 kg raw wool sold to local blanket weaver cooperative',
    recordedBy: 'Ramesh Patel',
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'fin-4',
    farmId: 'FARM-7821',
    date: '2026-10-09',
    type: 'expense',
    category: 'Vaccination',
    amount: 1800,
    title: 'PPR Goat Plague & Enterotoxemia (ET) Vaccines',
    notes: 'Annual flock preventative immunization',
    recordedBy: 'Dr. Priya Sharma',
    createdAt: '2026-10-09T14:30:00Z',
  },
  {
    id: 'fin-5',
    farmId: 'FARM-7821',
    date: '2026-10-08',
    type: 'income',
    category: 'Manure & Fertilizer',
    amount: 6200,
    title: 'Organic Goat Pellet Manure & Sheep Dung',
    notes: '30 bags sold to pomegranate and guava orchard farmers',
    recordedBy: 'Suresh Kumar',
    createdAt: '2026-10-08T11:00:00Z',
  },
  {
    id: 'fin-6',
    farmId: 'FARM-7821',
    date: '2026-10-06',
    type: 'expense',
    category: 'Medicine & Doctor',
    amount: 950,
    title: 'Albendazole Dewormer Suspension & Liver Tonic',
    notes: 'Pre-winter preventative deworming drench for goats and sheep',
    recordedBy: 'Dr. Priya Sharma',
    createdAt: '2026-10-06T16:00:00Z',
  },
  {
    id: 'fin-7',
    farmId: 'FARM-7821',
    date: '2026-10-04',
    type: 'expense',
    category: 'Worker Wages',
    amount: 5000,
    title: 'Herdsman Flock Grazing Monthly Allowance',
    notes: 'Payment for daily pasture grazing and pen cleaning',
    recordedBy: 'Ramesh Patel',
    createdAt: '2026-10-04T18:00:00Z',
  },
  {
    id: 'fin-8',
    farmId: 'FARM-7821',
    date: '2026-09-28',
    type: 'income',
    category: 'Livestock Sale',
    amount: 24000,
    title: 'Sale of 2 Breeding Nellore Rams',
    notes: 'Sold to local pastoralists for flock genetic improvement',
    recordedBy: 'Ramesh Patel',
    createdAt: '2026-09-28T10:00:00Z',
  },
];

export const INITIAL_FARM_TASKS: FarmTask[] = [
  {
    id: 'task-flock-1',
    farmId: 'FARM-7821',
    title: 'Autumn Shearing Campaign for Deccani Sheep Flock',
    description: 'Shear all adult and yearling sheep before cold nights set in. Clean and grade raw wool fleece into wool bags.',
    species: 'Sheep',
    category: 'Shearing',
    priority: 'High',
    status: 'in_progress',
    assignedToUserId: 'user-staff-1',
    assignedToName: 'Suresh Kumar (Farm Helper)',
    assignedToRole: 'Herdsman',
    target: {
      enabled: true,
      targetValue: 40,
      currentValue: 26,
      unit: 'sheep',
    },
    dueDate: '2026-10-18',
    dueTime: '08:30',
    reminder: {
      enabled: true,
      audience: 'all_members',
      timing: '1_day_before',
      customNote: 'Prepare shearing clippers, clean oil, and tar antiseptic for skin nicks.',
      isAcknowledged: false,
    },
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Ramesh Patel (Farm Owner)',
    createdAt: '2026-10-10T09:00:00Z',
  },
  {
    id: 'task-flock-2',
    farmId: 'FARM-7821',
    title: 'Pre-Winter Deworming Drench (Albendazole)',
    description: 'Oral drenching of all sheep and goats with broad-spectrum dewormer against liver flukes and roundworms.',
    species: 'Both',
    category: 'Deworming',
    priority: 'Urgent',
    status: 'pending',
    assignedToUserId: 'user-vet-1',
    assignedToName: 'Dr. Priya Sharma (Animal Doctor)',
    assignedToRole: 'Veterinarian',
    target: {
      enabled: true,
      targetValue: 50,
      currentValue: 15,
      unit: 'animals',
    },
    dueDate: '2026-10-15',
    dueTime: '10:00',
    reminder: {
      enabled: true,
      audience: 'all_members',
      timing: 'on_due_date',
      customNote: 'Administer on empty stomach in morning before letting flock out to pasture.',
      isAcknowledged: false,
    },
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Ramesh Patel (Farm Owner)',
    createdAt: '2026-10-11T11:00:00Z',
  },
  {
    id: 'task-flock-3',
    farmId: 'FARM-7821',
    title: 'Anti-Tick & Mite Dip Bath for Goats',
    description: 'Run flock through dipping vat trench with Cypermethrin ectoparasiticide solution to eliminate ticks and lice.',
    species: 'Goat',
    category: 'Dipping & Bath',
    priority: 'Medium',
    status: 'pending',
    assignedToUserId: 'user-staff-1',
    assignedToName: 'Suresh Kumar (Farm Helper)',
    assignedToRole: 'Herdsman',
    target: {
      enabled: true,
      targetValue: 30,
      currentValue: 0,
      unit: 'goats',
    },
    dueDate: '2026-10-20',
    dueTime: '14:00',
    reminder: {
      enabled: true,
      audience: 'admins_only',
      timing: '2_days_before',
      customNote: 'Verify dip vat drain plug and test chemical dilution ratio.',
      isAcknowledged: false,
    },
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Ramesh Patel (Farm Owner)',
    createdAt: '2026-10-12T07:00:00Z',
  },
  {
    id: 'task-flock-4',
    farmId: 'FARM-7821',
    title: 'Growing Kids & Lambs 90-Day Weight Target Audit',
    description: 'Weigh all 3-month-old Sirohi and Boer kids on digital hanging scale. Record ADG (Average Daily Gain). Target: >= 16 kg.',
    species: 'Both',
    category: 'Weight Check',
    priority: 'Medium',
    status: 'in_progress',
    assignedToUserId: 'user-admin-1',
    assignedToName: 'Ramesh Patel (Farm Owner)',
    assignedToRole: 'Admin',
    target: {
      enabled: true,
      targetValue: 20,
      currentValue: 12,
      unit: 'kids & lambs',
    },
    dueDate: '2026-10-16',
    dueTime: '16:00',
    reminder: {
      enabled: true,
      audience: 'assigned_only',
      timing: '1_day_before',
      isAcknowledged: false,
    },
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Ramesh Patel (Farm Owner)',
    createdAt: '2026-10-08T10:00:00Z',
  },
  {
    id: 'task-flock-5',
    farmId: 'FARM-7821',
    title: 'Hoof Trimming Round for Rams and Stud Bucks',
    description: 'Inspect claws for overgrowth and foot rot; trim neatly with specialized hoof shears to prevent lameness during breeding season.',
    species: 'Sheep',
    category: 'Hoof Trimming',
    priority: 'Low',
    status: 'completed',
    assignedToUserId: 'user-staff-1',
    assignedToName: 'Suresh Kumar (Farm Helper)',
    assignedToRole: 'Herdsman',
    target: {
      enabled: true,
      targetValue: 10,
      currentValue: 10,
      unit: 'rams/bucks',
    },
    dueDate: '2026-10-09',
    dueTime: '11:00',
    reminder: {
      enabled: false,
      audience: 'assigned_only',
      timing: 'on_due_date',
      isAcknowledged: true,
    },
    createdByUserId: 'user-admin-1',
    createdByUserName: 'Ramesh Patel (Farm Owner)',
    createdAt: '2026-10-05T08:00:00Z',
    completedAt: '2026-10-09T12:30:00Z',
    completedByUserName: 'Suresh Kumar',
    completionNotes: 'All 10 stud rams trimmed cleanly. Applied copper sulphate spray to two minor heel scrapes.',
  },
];

class FarmDatabase {
  private users: User[] = [];
  private farms: Farm[] = [];
  private globalBreeds: GlobalBreed[] = [];
  private breedProposals: BreedProposal[] = [];
  private currentUser: User | null = null;
  private currentFarmId: string | null = null;
  private listeners: Array<() => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedUsers = localStorage.getItem(STORAGE_USERS_KEY);
      if (savedUsers) {
        this.users = JSON.parse(savedUsers);
      } else {
        // First-time starter users
        this.users = [...DEFAULT_USERS];
      }

      const savedFarms = localStorage.getItem(STORAGE_FARMS_KEY);
      if (savedFarms) {
        const parsed: Farm[] = JSON.parse(savedFarms);
        this.farms = parsed.map(f => ({
          ...f,
          financialRecords: f.financialRecords && f.financialRecords.length > 0 ? f.financialRecords : [...DEFAULT_FINANCIAL_RECORDS],
          tasks: f.tasks && f.tasks.length > 0 ? f.tasks : (f.id === 'FARM-7821' ? [...INITIAL_FARM_TASKS] : []),
        }));
      } else {
        // Initial setup
        this.farms = INITIAL_FARMS.map(f => ({
          ...f,
          config: { ...DEFAULT_FARM_CONFIG },
          financialRecords: [...DEFAULT_FINANCIAL_RECORDS],
          tasks: f.id === 'FARM-7821' ? [...INITIAL_FARM_TASKS] : [],
        }));
      }

      // Ensure Phase 1: Goat and Sheep only
      this.farms.forEach(f => {
        f.primarySpecies = ['Goat', 'Sheep'];
        if (Array.isArray(f.animals)) {
          const phase1Animals = f.animals.filter(a => a.species === 'Goat' || a.species === 'Sheep');
          if (phase1Animals.length > 0) {
            f.animals = phase1Animals;
          } else {
            f.animals = [...INITIAL_FARMS[0].animals];
            f.vaccinations = [...INITIAL_FARMS[0].vaccinations];
            f.healthRecords = [...INITIAL_FARMS[0].healthRecords];
          }

          f.animals.forEach(a => {
            a.milkStatus = undefined;
            a.dailyMilkLitres = undefined;
          });
        }
        // Ensure config has appName configured (default 'Testing')
        f.config = {
          ...DEFAULT_FARM_CONFIG,
          ...(f.config || {}),
          appName: f.config?.appName || localStorage.getItem(STORAGE_APP_NAME_KEY) || 'Testing'
        };
      });

      // Global Breeds
      const savedBreeds = localStorage.getItem(STORAGE_GLOBAL_BREEDS_KEY);
      if (savedBreeds) {
        this.globalBreeds = JSON.parse(savedBreeds);
      } else {
        this.globalBreeds = [...DEFAULT_GLOBAL_BREEDS];
      }

      // Breed Proposals
      const savedProposals = localStorage.getItem(STORAGE_BREED_PROPOSALS_KEY);
      if (savedProposals) {
        this.breedProposals = JSON.parse(savedProposals);
      } else {
        this.breedProposals = [...DEFAULT_BREED_PROPOSALS];
      }

      const savedCurrUser = localStorage.getItem(STORAGE_CURRENT_USER_KEY);
      if (savedCurrUser) {
        this.currentUser = JSON.parse(savedCurrUser);
      }

      const savedCurrFarm = localStorage.getItem(STORAGE_CURRENT_FARM_KEY);
      if (savedCurrFarm) {
        this.currentFarmId = savedCurrFarm;
      }
    } catch (e) {
      console.error('Database load error:', e);
      this.users = [...DEFAULT_USERS];
      this.farms = [...INITIAL_FARMS];
      this.globalBreeds = [...DEFAULT_GLOBAL_BREEDS];
      this.breedProposals = [...DEFAULT_BREED_PROPOSALS];
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_FARMS_KEY, JSON.stringify(this.farms));
      localStorage.setItem(STORAGE_GLOBAL_BREEDS_KEY, JSON.stringify(this.globalBreeds));
      localStorage.setItem(STORAGE_BREED_PROPOSALS_KEY, JSON.stringify(this.breedProposals));
      if (this.currentUser) {
        localStorage.setItem(STORAGE_CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      } else {
        localStorage.removeItem(STORAGE_CURRENT_USER_KEY);
      }
      if (this.currentFarmId) {
        localStorage.setItem(STORAGE_CURRENT_FARM_KEY, this.currentFarmId);
      } else {
        localStorage.removeItem(STORAGE_CURRENT_FARM_KEY);
      }
    } catch (e) {
      console.error('Database save error:', e);
    }
    this.notify();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(fn => fn());
  }

  // ==================== AUTH & USERS ====================

  public isSuperAdmin(user?: User | null): boolean {
    const target = user !== undefined ? user : this.currentUser;
    if (!target) return false;
    const cleanId = (target.identifier || '').replace(/\D/g, '');
    const cleanPhone = (target.phone || '').replace(/\D/g, '');
    const cleanEmail = (target.email || '').toLowerCase().trim();
    const cleanIdent = (target.identifier || '').toLowerCase().trim();
    return (
      !!target.isSuperAdmin ||
      cleanId === '9999999999' ||
      cleanId.endsWith('9999999999') ||
      cleanPhone === '9999999999' ||
      cleanPhone.endsWith('9999999999') ||
      cleanIdent === 'admin@farmtrack.io' ||
      cleanIdent === 'madhusav@gmail.com' ||
      cleanEmail === 'madhusav@gmail.com' ||
      target.id === 'user-superadmin-1' ||
      target.id === 'user-superadmin-madhu'
    );
  }

  public canUserAccessFarm(farmId: string, userId?: string): boolean {
    const user = userId ? (this.users.find(u => u.id === userId) || this.currentUser) : this.currentUser;
    if (!user) return false;
    if (this.isSuperAdmin(user)) return true;
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;
    return farm.adminUserId === user.id || farm.members.some(m => m.userId === user.id && m.status === 'active');
  }

  public getUserFarms(userId?: string): Farm[] {
    const user = userId ? (this.users.find(u => u.id === userId) || this.currentUser) : this.currentUser;
    if (!user) return [];
    if (this.isSuperAdmin(user)) return [...this.farms];
    return this.farms.filter(f =>
      f.adminUserId === user.id ||
      f.members.some(m => m.userId === user.id && m.status === 'active')
    );
  }

  public getAllTenantsForSuperAdmin(): Farm[] {
    if (!this.isSuperAdmin()) {
      throw new Error('Unauthorized: Super Admin permissions required.');
    }
    return [...this.farms];
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }

  public setCurrentUser(user: User | null) {
    this.currentUser = user;
    this.saveToStorage();
  }

  public getUsers(): User[] {
    return [...this.users];
  }

  public registerUser(name: string, identifier: string, authType: 'phone' | 'email'): User {
    const existing = this.users.find(u => u.identifier.toLowerCase() === identifier.trim().toLowerCase());
    if (existing) {
      this.currentUser = existing;
      this.saveToStorage();
      return existing;
    }

    const savedLang = typeof window !== 'undefined' ? localStorage.getItem('farmtrack_user_lang_v1') || 'en' : 'en';
    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      identifier: identifier.trim(),
      authType,
      phone: authType === 'phone' ? identifier.trim() : undefined,
      email: authType === 'email' ? identifier.trim() : undefined,
      preferredLanguage: savedLang,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`farmtrack_user_lang_${newUser.id}`, savedLang);
      } catch (e) {
        console.error(e);
      }
    }
    return newUser;
  }

  public loginUser(identifier: string): User | null {
    const clean = identifier.trim().toLowerCase();
    const cleanDigits = clean.replace(/\D/g, '');

    let user = this.users.find(u => {
      const uDigits = u.identifier.replace(/\D/g, '');
      return (
        u.identifier.toLowerCase() === clean ||
        (cleanDigits.length >= 10 && (uDigits === cleanDigits || uDigits.endsWith(cleanDigits)))
      );
    });

    if (!user && (cleanDigits === '9999999999' || cleanDigits.endsWith('9999999999'))) {
      user = {
        id: 'user-superadmin-1',
        name: 'Super Admin',
        identifier: '9999999999',
        authType: 'phone',
        phone: '9999999999',
        email: 'admin@farmtrack.io',
        isSuperAdmin: true,
        createdAt: '2026-01-01',
      };
      this.users.unshift(user);
    }

    if (user) {
      if (typeof window !== 'undefined') {
        const storedUserLang = localStorage.getItem(`farmtrack_user_lang_${user.id}`);
        if (storedUserLang && !user.preferredLanguage) {
          user.preferredLanguage = storedUserLang;
        }
      }
      this.currentUser = user;
      this.saveToStorage();
      return user;
    }
    return null;
  }

  public updateUserLanguage(userId: string, lang: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.preferredLanguage = lang;
    }
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser.preferredLanguage = lang;
    }
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`farmtrack_user_lang_${userId}`, lang);
        localStorage.setItem('farmtrack_user_lang_v1', lang);
      } catch (e) {
        console.error(e);
      }
    }
    this.saveToStorage();
  }

  public logoutUser() {
    this.currentUser = null;
    this.currentFarmId = null;
    this.saveToStorage();
  }

  // ==================== FARMS (TENANTS) ====================

  public getFarms(): Farm[] {
    return this.getUserFarms();
  }

  public getCurrentFarm(): Farm | null {
    if (!this.currentFarmId) return null;
    const farm = this.farms.find(f => f.id === this.currentFarmId) || null;
    if (farm && !this.canUserAccessFarm(farm.id)) {
      return null;
    }
    return farm;
  }

  public setCurrentFarmId(farmId: string | null) {
    if (farmId && !this.canUserAccessFarm(farmId)) {
      throw new Error('Tenant Access Denied: You do not have permission to view or manage this farm.');
    }
    this.currentFarmId = farmId;
    this.saveToStorage();
  }

  public createFarm(farmData: {
    id?: string;
    name: string;
    location: string;
    totalAcreage: number;
    establishedYear?: number;
    primarySpecies?: Species[];
    withStarterFlock?: boolean;
  }): Farm {
    if (!this.currentUser) throw new Error('Must be logged in to create a farm');

    const cleanId = (farmData.id && farmData.id.trim())
      ? farmData.id.trim().toUpperCase()
      : `FARM-${Math.floor(1000 + Math.random() * 9000)}`;

    const starterAnimals = farmData.withStarterFlock ? [...INITIAL_FARMS[0].animals] : [];
    const starterVaccines = farmData.withStarterFlock ? [...INITIAL_FARMS[0].vaccinations] : [];
    const starterHealth = farmData.withStarterFlock ? [...INITIAL_FARMS[0].healthRecords] : [];

    const newFarm: Farm = {
      id: cleanId,
      name: farmData.name.trim(),
      adminUserId: this.currentUser.id,
      adminName: this.currentUser.name,
      location: farmData.location.trim() || 'India',
      totalAcreage: farmData.totalAcreage || 5.0,
      establishedYear: farmData.establishedYear || new Date().getFullYear(),
      primarySpecies: farmData.primarySpecies && farmData.primarySpecies.length > 0 ? farmData.primarySpecies : ['Goat', 'Sheep'],
      members: [
        {
          userId: this.currentUser.id,
          name: this.currentUser.name,
          identifier: this.currentUser.identifier,
          role: 'Admin',
          joinedAt: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      ],
      joinRequests: [],
      animals: starterAnimals,
      vaccinations: starterVaccines,
      healthRecords: starterHealth,
      financialRecords: [...DEFAULT_FINANCIAL_RECORDS],
      config: { ...DEFAULT_FARM_CONFIG },
      createdAt: new Date().toISOString()
    };

    this.farms.unshift(newFarm);
    this.currentFarmId = newFarm.id;
    this.saveToStorage();
    return newFarm;
  }

  public updateFarm(farmId: string, updates: Partial<Farm>): Farm {
    if (!this.canUserAccessFarm(farmId)) {
      throw new Error('Tenant Access Denied: Unauthorized farm update.');
    }
    const index = this.farms.findIndex(f => f.id === farmId);
    if (index === -1) throw new Error('Farm not found');

    const updated = { ...this.farms[index], ...updates };
    this.farms[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public updateFarmConfig(farmId: string, configUpdates: Partial<FarmConfig>): FarmConfig {
    if (!this.canUserAccessFarm(farmId)) {
      throw new Error('Tenant Access Denied: Unauthorized config update.');
    }
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const updatedConfig: FarmConfig = {
      ...(farm.config || DEFAULT_FARM_CONFIG),
      ...configUpdates
    };

    farm.config = updatedConfig;
    this.saveToStorage();
    return updatedConfig;
  }

  public getAppName(farmId?: string): string {
    const targetFarm = farmId ? this.farms.find(f => f.id === farmId) : this.getCurrentFarm();
    return targetFarm?.config?.appName || localStorage.getItem(STORAGE_APP_NAME_KEY) || 'Testing';
  }

  public setAppName(appName: string, farmId?: string): void {
    const clean = appName.trim() || 'Testing';
    localStorage.setItem(STORAGE_APP_NAME_KEY, clean);
    const targetId = farmId || this.currentFarmId;
    if (targetId) {
      const farm = this.farms.find(f => f.id === targetId);
      if (farm) {
        farm.config = {
          ...(farm.config || DEFAULT_FARM_CONFIG),
          appName: clean,
        };
      }
    }
    this.saveToStorage();
  }

  public deleteFarm(farmId: string): boolean {
    if (!this.currentUser) return false;
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;
    if (!this.isSuperAdmin() && farm.adminUserId !== this.currentUser.id) {
      throw new Error('Only the Farm Boss (Admin) or Super Admin can delete this farm');
    }

    this.farms = this.farms.filter(f => f.id !== farmId);
    if (this.currentFarmId === farmId) {
      const remaining = this.getUserFarms();
      this.currentFarmId = remaining[0]?.id || null;
    }
    this.saveToStorage();
    return true;
  }

  // ==================== MEMBERS & JOIN REQUESTS ====================

  public requestJoinFarm(farmId: string, message: string): boolean {
    if (!this.currentUser) throw new Error('Must be logged in to join farm');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm with this code not found');

    // Check if already member
    const isMember = farm.members.some(m => m.userId === this.currentUser!.id);
    if (isMember) return true;

    // Check if already requested
    const existingReq = farm.joinRequests.find(r => r.userId === this.currentUser!.id && r.status === 'pending');
    if (existingReq) return true;

    farm.joinRequests.push({
      id: `req-${Date.now()}`,
      farmId,
      userId: this.currentUser.id,
      userName: this.currentUser.name,
      userIdentifier: this.currentUser.identifier,
      message: message.trim(),
      status: 'pending',
      requestedAt: new Date().toISOString().split('T')[0]
    });

    this.saveToStorage();
    return true;
  }

  public approveJoinRequest(farmId: string, requestId: string, assignedRole: UserRole): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    const req = farm.joinRequests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'approved';

    // Add to members if not present
    if (!farm.members.some(m => m.userId === req.userId)) {
      farm.members.push({
        userId: req.userId,
        name: req.userName,
        identifier: req.userIdentifier,
        role: assignedRole,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    }

    this.saveToStorage();
    return true;
  }

  public rejectJoinRequest(farmId: string, requestId: string): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    const req = farm.joinRequests.find(r => r.id === requestId);
    if (!req) return false;

    req.status = 'rejected';
    this.saveToStorage();
    return true;
  }

  public addMemberDirectly(farmId: string, name: string, identifier: string, role: UserRole): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    // Check if user already exists in global users
    let user = this.users.find(u => u.identifier.toLowerCase() === identifier.trim().toLowerCase());
    if (!user) {
      user = {
        id: `usr-${Date.now()}`,
        name: name.trim(),
        identifier: identifier.trim(),
        authType: identifier.includes('@') ? 'email' : 'phone',
        createdAt: new Date().toISOString()
      };
      this.users.push(user);
    }

    if (!farm.members.some(m => m.userId === user.id)) {
      farm.members.push({
        userId: user.id,
        name: name.trim(),
        identifier: identifier.trim(),
        role,
        joinedAt: new Date().toISOString().split('T')[0],
        status: 'active'
      });
    } else {
      // Update role
      farm.members = farm.members.map(m => m.userId === user.id ? { ...m, role, status: 'active' } : m);
    }

    this.saveToStorage();
    return true;
  }

  public updateMemberRole(farmId: string, userId: string, newRole: UserRole): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    farm.members = farm.members.map(m => m.userId === userId ? { ...m, role: newRole } : m);
    this.saveToStorage();
    return true;
  }

  public removeMember(farmId: string, userId: string): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    if (farm.adminUserId === userId) {
      throw new Error('Cannot remove the Farm Boss (Admin)');
    }

    farm.members = farm.members.filter(m => m.userId !== userId);
    this.saveToStorage();
    return true;
  }

  // ==================== ANIMALS CRUD ====================

  public addAnimal(farmId: string, animal: Animal): Animal {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    farm.animals.unshift(animal);

    // Auto-create initial core protection schedule
    const vac: VaccinationRecord = {
      id: `vac-${Date.now()}`,
      animalId: animal.id,
      vaccineName: animal.species === 'Chicken' 
        ? 'Newcastle & Marek Booster' 
        : 'FMD & Clostridial Herd Protection',
      diseaseTarget: 'Core Pasture Immunity',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      status: 'Scheduled',
      dosage: animal.species === 'Chicken' ? '0.2 mL eye drop' : '2.0 mL injection',
      batchNumber: 'LOT-IND-2026',
      nextBoosterDate: new Date(Date.now() + 375 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    farm.vaccinations.unshift(vac);
    this.saveToStorage();
    return animal;
  }

  public bulkAddAnimals(farmId: string, animals: Animal[]): Animal[] {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    farm.animals.unshift(...animals);

    // Create vaccine schedule for each
    const newVacs: VaccinationRecord[] = animals.map((a, idx) => ({
      id: `vac-bulk-${Date.now()}-${idx}`,
      animalId: a.id,
      vaccineName: a.species === 'Chicken' 
        ? 'Newcastle Vaccine Shot' 
        : 'Core Multi-Disease Protection Shot',
      diseaseTarget: 'Herd Immunity',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'Scheduled',
      dosage: a.species === 'Chicken' ? '0.2 mL' : '2.0 mL subcutaneous',
      batchNumber: 'LOT-BULK-2026',
      nextBoosterDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    farm.vaccinations.unshift(...newVacs);
    this.saveToStorage();
    return animals;
  }

  public updateAnimal(farmId: string, animalId: string, updates: Partial<Animal>): Animal {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const index = farm.animals.findIndex(a => a.id === animalId);
    if (index === -1) throw new Error('Animal not found');

    const prev = farm.animals[index];
    const targetSpecies = updates.species || prev.species;
    const isDairy = targetSpecies === 'Cow' || targetSpecies === 'Buffalo';

    const cleanUpdates = { ...updates };
    if (cleanUpdates.tagId) {
      cleanUpdates.tagId = cleanUpdates.tagId.trim().toUpperCase();
    }
    if (!isDairy) {
      cleanUpdates.milkStatus = undefined;
      cleanUpdates.dailyMilkLitres = undefined;
    }

    const updated = { ...prev, ...cleanUpdates };
    farm.animals[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public deleteAnimal(farmId: string, animalId: string): boolean {
    return this.deleteAnimals(farmId, [animalId]);
  }

  public deleteAnimals(farmId: string, animalIds: string[]): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || animalIds.length === 0) return false;

    const idsSet = new Set(animalIds);
    farm.animals = farm.animals.filter(a => !idsSet.has(a.id));
    farm.vaccinations = farm.vaccinations.filter(v => !idsSet.has(v.animalId));
    farm.healthRecords = farm.healthRecords.filter(h => !idsSet.has(h.animalId));
    if (farm.milkLogs) {
      farm.milkLogs = farm.milkLogs.filter(m => !idsSet.has(m.animalId));
    }
    this.saveToStorage();
    return true;
  }

  // ==================== SPECIES SETUP ====================

  public updateAvailableSpecies(farmId: string, speciesList: Species[]): Species[] {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    farm.primarySpecies = speciesList;
    this.saveToStorage();
    return speciesList;
  }

  // ==================== VACCINATIONS CRUD (ADMIN & SUPPORT ONLY) ====================

  public assertCanManageVaccines(farmId: string, currentUser: User | null): boolean {
    if (!currentUser) {
      throw new Error('Authentication required.');
    }
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) {
      throw new Error('Farm not found.');
    }

    const isAdmin = farm.adminUserId === currentUser.id;
    const member = farm.members.find(m => m.userId === currentUser.id);
    const canManage = isVaccineManager(member?.role, isAdmin);

    if (!canManage) {
      throw new Error('🔒 Permission Denied: Only Farm Boss (Admin) or Support Admin can create, edit, or delete vaccine details.');
    }
    return true;
  }

  public addVaccination(farmId: string, vacData: Omit<VaccinationRecord, 'id'>, user: User | null): VaccinationRecord {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const newVac: VaccinationRecord = {
      ...vacData,
      id: `vac-${Date.now()}`
    };

    farm.vaccinations.unshift(newVac);
    this.saveToStorage();
    return newVac;
  }

  public updateVaccination(
    farmId: string, 
    vacId: string, 
    updates: Partial<VaccinationRecord>, 
    user: User | null
  ): VaccinationRecord {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const index = farm.vaccinations.findIndex(v => v.id === vacId);
    if (index === -1) throw new Error('Vaccination record not found');

    const updated = { ...farm.vaccinations[index], ...updates };
    farm.vaccinations[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public deleteVaccination(farmId: string, vacId: string, user: User | null): boolean {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    farm.vaccinations = farm.vaccinations.filter(v => v.id !== vacId);
    this.saveToStorage();
    return true;
  }

  public markVaccineComplete(farmId: string, vacId: string, administeredBy: string): VaccinationRecord {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const vac = farm.vaccinations.find(v => v.id === vacId);
    if (!vac) throw new Error('Vaccination record not found');

    vac.status = 'Completed';
    vac.administeredDate = new Date().toISOString().split('T')[0];
    vac.administeredBy = administeredBy;

    this.saveToStorage();
    return vac;
  }

  public bulkMarkVaccinesComplete(farmId: string, vacIds: string[], administeredBy: string): number {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');
    const today = new Date().toISOString().split('T')[0];
    let count = 0;

    farm.vaccinations.forEach(vac => {
      if (vacIds.includes(vac.id)) {
        vac.status = 'Completed';
        vac.administeredDate = today;
        vac.administeredBy = administeredBy;
        count++;
      }
    });

    this.saveToStorage();
    return count;
  }

  public bulkAddVaccinations(
    farmId: string, 
    animalIds: string[], 
    vacData: Omit<VaccinationRecord, 'id' | 'animalId'>, 
    user: User | null
  ): VaccinationRecord[] {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const created: VaccinationRecord[] = [];
    animalIds.forEach((animId, idx) => {
      const record: VaccinationRecord = {
        ...vacData,
        id: `vac-bulk-${Date.now()}-${idx}`,
        animalId: animId,
      };
      farm.vaccinations.unshift(record);
      created.push(record);
    });

    this.saveToStorage();
    return created;
  }

  public bulkUpdateVaccinations(
    farmId: string, 
    vacIds: string[], 
    updates: Partial<VaccinationRecord>, 
    user: User | null
  ): number {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    let count = 0;
    farm.vaccinations.forEach(vac => {
      if (vacIds.includes(vac.id)) {
        Object.assign(vac, updates);
        count++;
      }
    });

    this.saveToStorage();
    return count;
  }

  public bulkDeleteVaccinations(farmId: string, vacIds: string[], user: User | null): number {
    this.assertCanManageVaccines(farmId, user);
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return 0;

    const initialLen = farm.vaccinations.length;
    farm.vaccinations = farm.vaccinations.filter(v => !vacIds.includes(v.id));
    const deletedCount = initialLen - farm.vaccinations.length;
    this.saveToStorage();
    return deletedCount;
  }

  // ==================== VACCINE NOTIFICATION ALERTS ====================

  /**
   * Returns active notifications for animals nearing vaccination or overdue
   */
  public getVaccineAlerts(farmId: string): VaccineAlert[] {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return [];

    const thresholdDays = farm.config?.vaccineAlertDaysThreshold ?? 7;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts: VaccineAlert[] = [];

    farm.vaccinations.forEach(vac => {
      if (vac.status === 'Completed') return;

      const animal = farm.animals.find(a => a.id === vac.animalId);
      if (!animal) return;

      const dueDate = new Date(vac.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Alert if due within threshold days or overdue
      if (diffDays <= thresholdDays) {
        let status: 'Overdue' | 'Due Soon' | 'Today' = 'Due Soon';
        if (diffDays < 0) {
          status = 'Overdue';
        } else if (diffDays === 0) {
          status = 'Today';
        }

        alerts.push({
          id: `alert-${vac.id}`,
          animalId: animal.id,
          animalName: animal.name,
          animalTag: animal.tagId,
          species: animal.species,
          photoUrl: animal.photoUrl,
          vaccineId: vac.id,
          vaccineName: vac.vaccineName,
          diseaseTarget: vac.diseaseTarget,
          dueDate: vac.dueDate,
          daysLeft: diffDays,
          status
        });
      }
    });

    // Sort: overdue first, then nearest due date
    alerts.sort((a, b) => a.daysLeft - b.daysLeft);
    return alerts;
  }

  // ==================== MILK YIELD LOGS CRUD ====================

  public addMilkLog(farmId: string, logData: Omit<MilkYieldLog, 'id' | 'createdAt'>): MilkYieldLog {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const newLog: MilkYieldLog = {
      ...logData,
      id: `milk-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    farm.milkLogs = [newLog, ...(farm.milkLogs || [])];

    // Recalculate daily yield for this animal on that date
    const cowLogsOnDate = farm.milkLogs.filter(l => l.animalId === logData.animalId && l.date === logData.date);
    const totalDailyLiters = Math.round(cowLogsOnDate.reduce((sum, item) => sum + item.liters, 0) * 10) / 10;

    const animal = farm.animals.find(a => a.id === logData.animalId);
    if (animal) {
      animal.dailyMilkLitres = totalDailyLiters;
      animal.currentProductivityValue = `${totalDailyLiters} Litres / day`;
      animal.milkStatus = 'Giving Milk';

      // Record in growth history
      const growthEntry: GrowthMetric = {
        id: `gm-milk-${Date.now()}`,
        date: logData.date,
        weightKg: animal.currentWeightKg,
        heightCm: animal.species === 'Cow' ? 135 : 70,
        bodyConditionScore: 3.6,
        averageDailyGainG: 120,
        dailyYieldValue: totalDailyLiters,
        dailyYieldUnit: 'Litres/day',
        recordedBy: logData.recordedBy,
        notes: `${logData.session} milking: ${logData.liters} L${logData.fatPercentage ? ` (Fat: ${logData.fatPercentage}%)` : ''}. ${logData.notes || ''}`
      };
      animal.growthHistory.push(growthEntry);
    }

    this.saveToStorage();
    return newLog;
  }

  public deleteMilkLog(farmId: string, logId: string): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.milkLogs) return false;

    farm.milkLogs = farm.milkLogs.filter(m => m.id !== logId);
    this.saveToStorage();
    return true;
  }

  // ==================== GROWTH & HEALTH ====================

  public addGrowthMetric(farmId: string, animalId: string, record: Omit<GrowthMetric, 'id'>): GrowthMetric {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const animal = farm.animals.find(a => a.id === animalId);
    if (!animal) throw new Error('Animal not found');

    const newMetric: GrowthMetric = {
      ...record,
      id: `gm-${Date.now()}`
    };

    animal.currentWeightKg = record.weightKg;
    animal.currentProductivityValue = `${record.dailyYieldValue} ${record.dailyYieldUnit}`;
    animal.growthHistory.push(newMetric);

    this.saveToStorage();
    return newMetric;
  }

  public addHealthRecord(farmId: string, record: Omit<HealthRecord, 'id'>): HealthRecord {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const newRecord: HealthRecord = {
      ...record,
      id: `hr-${Date.now()}`
    };

    farm.healthRecords.unshift(newRecord);
    this.saveToStorage();
    return newRecord;
  }

  // ==================== FINANCIAL LEDGER CRUD ====================

  public getFinancialRecords(farmId: string): FinancialRecord[] {
    if (!this.canUserAccessFarm(farmId)) return [];
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return [];
    return farm.financialRecords || [];
  }

  public addFinancialRecord(
    farmId: string, 
    recordData: Omit<FinancialRecord, 'id' | 'createdAt'>
  ): FinancialRecord {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error('Farm not found');

    const newRecord: FinancialRecord = {
      ...recordData,
      id: `fin-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    farm.financialRecords = [newRecord, ...(farm.financialRecords || [])];
    this.saveToStorage();
    return newRecord;
  }

  public deleteFinancialRecord(farmId: string, recordId: string): boolean {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.financialRecords) return false;

    farm.financialRecords = farm.financialRecords.filter(r => r.id !== recordId);
    this.saveToStorage();
    return true;
  }

  // ==================== FARM TO-DO TASKS & TARGETS ====================

  public getFarmTasks(farmId: string): FarmTask[] {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) return [];
    return [...farm.tasks];
  }

  public getFarmTask(farmId: string, taskId: string): FarmTask | undefined {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) return undefined;
    return farm.tasks.find(t => t.id === taskId);
  }

  public addFarmTask(farmId: string, taskData: Omit<FarmTask, 'id' | 'createdAt' | 'farmId'>): FarmTask {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) throw new Error(`Farm with ID ${farmId} not found`);

    const newTask: FarmTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      farmId,
      createdAt: new Date().toISOString(),
    };

    farm.tasks = [newTask, ...(farm.tasks || [])];
    this.saveToStorage();
    return newTask;
  }

  public updateFarmTask(farmId: string, taskId: string, updates: Partial<FarmTask>): FarmTask {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) throw new Error('Farm tasks not found');

    const index = farm.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`Task with ID ${taskId} not found`);

    const existing = farm.tasks[index];
    const updated: FarmTask = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    farm.tasks[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public deleteFarmTask(farmId: string, taskId: string): boolean {
    if (!this.canUserAccessFarm(farmId)) throw new Error('Tenant Access Denied: Unauthorized operation.');
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) return false;

    const initialLen = farm.tasks.length;
    farm.tasks = farm.tasks.filter(t => t.id !== taskId);
    const deleted = farm.tasks.length < initialLen;
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  public updateTaskTargetProgress(farmId: string, taskId: string, currentValue: number): FarmTask {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) throw new Error('Farm tasks not found');

    const index = farm.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error(`Task with ID ${taskId} not found`);

    const task = farm.tasks[index];
    if (!task.target) {
      throw new Error('Task does not have numeric target enabled');
    }

    const safeVal = Math.max(0, currentValue);
    const isCompleted = safeVal >= task.target.targetValue;

    const updated: FarmTask = {
      ...task,
      target: {
        ...task.target,
        currentValue: safeVal,
      },
      status: isCompleted ? 'completed' : (safeVal > 0 ? 'in_progress' : task.status),
      completedAt: isCompleted ? new Date().toISOString() : undefined,
      updatedAt: new Date().toISOString(),
    };

    farm.tasks[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public getDueRemindersForUser(farmId: string, user: User): FarmTask[] {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) return [];

    const isAdmin = this.isSuperAdmin(user) || 
      farm.adminUserId === user.id || 
      farm.members.some(m => m.userId === user.id && (m.role === 'Admin' || m.role === 'Super Admin' || m.role === 'Support Admin'));

    const todayStr = new Date().toISOString().split('T')[0];
    const todayMs = new Date(todayStr).getTime();

    return farm.tasks.filter(task => {
      if (task.status === 'completed' || task.status === 'cancelled') return false;
      if (!task.reminder || !task.reminder.enabled) return false;
      if (task.reminder.isAcknowledged) return false;

      // Audience check
      const aud = task.reminder.audience;
      let audienceMatches = false;
      if (aud === 'all_members') {
        audienceMatches = true;
      } else if (aud === 'admins_only') {
        audienceMatches = isAdmin;
      } else if (aud === 'assigned_only') {
        audienceMatches = (task.assignedToUserId === user.id) || 
          (Boolean(task.assignedToRole) && farm.members.some(m => m.userId === user.id && m.role === task.assignedToRole)) ||
          isAdmin;
      }

      if (!audienceMatches) return false;

      // Date check
      const dueMs = new Date(task.dueDate).getTime();
      const diffDays = Math.round((dueMs - todayMs) / (1000 * 60 * 60 * 24));

      // Overdue tasks are always active reminders!
      if (diffDays <= 0) return true;

      // Timing rule
      if (task.reminder.timing === 'on_due_date') {
        return diffDays === 0;
      } else if (task.reminder.timing === '1_day_before') {
        return diffDays <= 1;
      } else if (task.reminder.timing === '2_days_before') {
        return diffDays <= 2;
      } else if (task.reminder.timing === '1_week_before') {
        return diffDays <= 7;
      } else if (task.reminder.timing === 'custom' && task.reminder.reminderDate) {
        return new Date(task.reminder.reminderDate).getTime() <= (todayMs + 24 * 60 * 60 * 1000);
      }

      return false;
    });
  }

  public acknowledgeReminder(farmId: string, taskId: string): void {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || !farm.tasks) return;
    const task = farm.tasks.find(t => t.id === taskId);
    if (task && task.reminder) {
      task.reminder.isAcknowledged = true;
      this.saveToStorage();
    }
  }

  // ==================== MYSQL DATABASE EXPORT ====================

  /**
   * Generates production-ready MySQL SQL statements matching schema.mysql.sql
   */
  public exportAsMySQL(): string {
    const lines: string[] = [];
    lines.push('-- ============================================================================');
    lines.push('-- FarmTrack India - Production MySQL Data Dump');
    lines.push(`-- Generated: ${new Date().toISOString()}`);
    lines.push('-- Database Target: MySQL 8.0+ / MariaDB 10.5+');
    lines.push('-- ============================================================================\n');
    lines.push('SET FOREIGN_KEY_CHECKS = 0;\n');

    // 1. Users
    lines.push('-- Table: users');
    for (const u of this.users) {
      lines.push(
        `INSERT INTO \`users\` (\`id\`, \`name\`, \`identifier\`, \`auth_type\`, \`phone\`, \`email\`, \`created_at\`) VALUES ` +
        `(${this.sqlStr(u.id)}, ${this.sqlStr(u.name)}, ${this.sqlStr(u.identifier)}, ${this.sqlStr(u.authType)}, ` +
        `${this.sqlStr(u.phone)}, ${this.sqlStr(u.email)}, ${this.sqlStr(u.createdAt)}) ` +
        `ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);`
      );
    }
    lines.push('');

    // 2. Farms
    lines.push('-- Table: farms');
    for (const f of this.farms) {
      lines.push(
        `INSERT INTO \`farms\` (\`id\`, \`name\`, \`admin_user_id\`, \`admin_name\`, \`location\`, \`total_acreage\`, \`established_year\`, \`created_at\`) VALUES ` +
        `(${this.sqlStr(f.id)}, ${this.sqlStr(f.name)}, ${this.sqlStr(f.adminUserId)}, ${this.sqlStr(f.adminName)}, ` +
        `${this.sqlStr(f.location)}, ${f.totalAcreage || 5.0}, ${f.establishedYear || 2021}, ${this.sqlStr(f.createdAt)}) ` +
        `ON DUPLICATE KEY UPDATE \`name\` = VALUES(\`name\`);`
      );

      // Farm Config
      const cfg = f.config || DEFAULT_FARM_CONFIG;
      lines.push(
        `INSERT INTO \`farm_configs\` (\`farm_id\`, \`vaccine_alert_days\`, \`target_daily_milk_liters\`, \`default_milk_unit\`, \`contact_phone\`, \`custom_vaccines_json\`) VALUES ` +
        `(${this.sqlStr(f.id)}, ${cfg.vaccineAlertDaysThreshold}, ${cfg.targetDailyMilkLiters}, ${this.sqlStr(cfg.defaultMilkUnit)}, ` +
        `${this.sqlStr(cfg.contactPhone)}, ${this.sqlStr(JSON.stringify(cfg.customVaccines || []))}) ` +
        `ON DUPLICATE KEY UPDATE \`vaccine_alert_days\` = VALUES(\`vaccine_alert_days\`);`
      );

      // Farm Members
      for (const m of f.members) {
        lines.push(
          `INSERT INTO \`farm_members\` (\`farm_id\`, \`user_id\`, \`name\`, \`identifier\`, \`role\`, \`status\`, \`joined_at\`) VALUES ` +
          `(${this.sqlStr(f.id)}, ${this.sqlStr(m.userId)}, ${this.sqlStr(m.name)}, ${this.sqlStr(m.identifier)}, ` +
          `${this.sqlStr(m.role)}, ${this.sqlStr(m.status)}, ${this.sqlStr(m.joinedAt)}) ` +
          `ON DUPLICATE KEY UPDATE \`role\` = VALUES(\`role\`);`
        );
      }

      // Animals
      for (const a of f.animals) {
        lines.push(
          `INSERT INTO \`animals\` (\`id\`, \`farm_id\`, \`tag_id\`, \`name\`, \`species\`, \`breed\`, \`sex\`, \`date_of_birth\`, \`photo_url\`, \`paddock_location\`, \`status\`, \`health_status\`, \`milk_status\`, \`daily_milk_litres\`, \`current_weight_kg\`, \`created_by\`, \`created_at\`) VALUES ` +
          `(${this.sqlStr(a.id)}, ${this.sqlStr(f.id)}, ${this.sqlStr(a.tagId)}, ${this.sqlStr(a.name)}, ${this.sqlStr(a.species)}, ` +
          `${this.sqlStr(a.breed)}, ${this.sqlStr(a.sex)}, ${this.sqlStr(a.dateOfBirth)}, ${this.sqlStr(a.photoUrl)}, ` +
          `${this.sqlStr(a.paddockLocation)}, ${this.sqlStr(a.status)}, ${this.sqlStr(a.healthStatus || 'Healthy & Fit')}, ` +
          `${this.sqlStr(a.milkStatus || 'Giving Milk')}, ${a.dailyMilkLitres || 0}, ${a.currentWeightKg || 300}, ` +
          `${this.sqlStr(a.createdBy || f.adminUserId)}, ${this.sqlStr(a.createdAt)}) ` +
          `ON DUPLICATE KEY UPDATE \`health_status\` = VALUES(\`health_status\`);`
        );
      }

      // Vaccinations
      for (const v of f.vaccinations) {
        lines.push(
          `INSERT INTO \`vaccinations\` (\`id\`, \`farm_id\`, \`animal_id\`, \`vaccine_name\`, \`disease_target\`, \`due_date\`, \`administered_date\`, \`status\`, \`dosage\`, \`batch_number\`, \`administered_by\`) VALUES ` +
          `(${this.sqlStr(v.id)}, ${this.sqlStr(f.id)}, ${this.sqlStr(v.animalId)}, ${this.sqlStr(v.vaccineName)}, ` +
          `${this.sqlStr(v.diseaseTarget)}, ${this.sqlStr(v.dueDate)}, ${this.sqlStr(v.administeredDate)}, ` +
          `${this.sqlStr(v.status)}, ${this.sqlStr(v.dosage)}, ${this.sqlStr(v.batchNumber)}, ${this.sqlStr(v.administeredBy)}) ` +
          `ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`);`
        );
      }

      // Milk Logs
      if (f.milkLogs) {
        for (const ml of f.milkLogs) {
          lines.push(
            `INSERT INTO \`milk_yield_logs\` (\`id\`, \`farm_id\`, \`animal_id\`, \`cow_tag\`, \`cow_name\`, \`date\`, \`session\`, \`liters\`, \`fat_percentage\`, \`recorded_by\`) VALUES ` +
            `(${this.sqlStr(ml.id)}, ${this.sqlStr(f.id)}, ${this.sqlStr(ml.animalId)}, ${this.sqlStr(ml.cowTag)}, ` +
            `${this.sqlStr(ml.cowName)}, ${this.sqlStr(ml.date)}, ${this.sqlStr(ml.session)}, ${ml.liters}, ` +
            `${ml.fatPercentage || 'NULL'}, ${this.sqlStr(ml.recordedBy)});`
          );
        }
      }

      // Financial Ledger Records
      if (f.financialRecords) {
        lines.push('-- Table: financial_records');
        for (const fr of f.financialRecords) {
          lines.push(
            `INSERT INTO \`financial_records\` (\`id\`, \`farm_id\`, \`date\`, \`type\`, \`category\`, \`amount\`, \`title\`, \`notes\`, \`recorded_by\`) VALUES ` +
            `(${this.sqlStr(fr.id)}, ${this.sqlStr(f.id)}, ${this.sqlStr(fr.date)}, ${this.sqlStr(fr.type)}, ${this.sqlStr(fr.category)}, ` +
            `${fr.amount}, ${this.sqlStr(fr.title)}, ${this.sqlStr(fr.notes || '')}, ${this.sqlStr(fr.recordedBy)});`
          );
        }
      }

      // Farm Tasks & Reminders
      if (f.tasks) {
        lines.push('-- Table: farm_tasks');
        for (const t of f.tasks) {
          lines.push(
            `INSERT INTO \`farm_tasks\` (\`id\`, \`farm_id\`, \`title\`, \`description\`, \`species\`, \`category\`, \`priority\`, \`status\`, \`assigned_to_user_id\`, \`assigned_to_name\`, \`due_date\`, \`target_value\`, \`current_value\`, \`target_unit\`, \`reminder_audience\`, \`reminder_timing\`, \`created_at\`) VALUES ` +
            `(${this.sqlStr(t.id)}, ${this.sqlStr(f.id)}, ${this.sqlStr(t.title)}, ${this.sqlStr(t.description || '')}, ${this.sqlStr(t.species)}, ${this.sqlStr(t.category)}, ${this.sqlStr(t.priority)}, ${this.sqlStr(t.status)}, ` +
            `${this.sqlStr(t.assignedToUserId || '')}, ${this.sqlStr(t.assignedToName || '')}, ${this.sqlStr(t.dueDate)}, ${t.target?.targetValue || 0}, ${t.target?.currentValue || 0}, ${this.sqlStr(t.target?.unit || '')}, ` +
            `${this.sqlStr(t.reminder.audience)}, ${this.sqlStr(t.reminder.timing)}, ${this.sqlStr(t.createdAt)});`
          );
        }
      }
    }

    lines.push('\nSET FOREIGN_KEY_CHECKS = 1;');
    lines.push('-- End of MySQL Dump');
    return lines.join('\n');
  }

  private sqlStr(val: any): string {
    if (val === undefined || val === null) return 'NULL';
    const s = String(val).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    return `'${s}'`;
  }

  // ==================== GLOBAL BREEDS & PROPOSALS ====================

  public getGlobalBreeds(species?: Species): GlobalBreed[] {
    if (!species) return [...this.globalBreeds];
    return this.globalBreeds.filter(b => b.species.toLowerCase() === species.toLowerCase());
  }

  public getBreedNames(species: Species): string[] {
    const matched = this.globalBreeds
      .filter(b => b.species.toLowerCase() === species.toLowerCase())
      .map(b => b.name);
    return Array.from(new Set(matched));
  }

  public getBreedProposals(farmId?: string): BreedProposal[] {
    if (!farmId) return [...this.breedProposals];
    return this.breedProposals.filter(p => p.proposedByFarmId === farmId);
  }

  public getPendingBreedProposalsCount(): number {
    return this.breedProposals.filter(p => p.status === 'pending').length;
  }

  public submitBreedProposal(data: {
    species: Species;
    breedName: string;
    originRegion?: string;
    primaryPurpose?: BreedProposal['primaryPurpose'];
    characteristics?: string;
    averageMatureWeightKg?: number;
    proposedByFarmId: string;
    proposedByFarmName: string;
    proposedByUserId: string;
    proposedByUserName: string;
  }): BreedProposal {
    const newProposal: BreedProposal = {
      id: `prop-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      species: data.species,
      breedName: data.breedName.trim(),
      originRegion: data.originRegion?.trim(),
      primaryPurpose: data.primaryPurpose,
      characteristics: data.characteristics?.trim(),
      averageMatureWeightKg: data.averageMatureWeightKg,
      proposedByFarmId: data.proposedByFarmId,
      proposedByFarmName: data.proposedByFarmName,
      proposedByUserId: data.proposedByUserId,
      proposedByUserName: data.proposedByUserName,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.breedProposals = [newProposal, ...this.breedProposals];
    this.saveToStorage();
    return newProposal;
  }

  public approveBreedProposal(
    proposalId: string, 
    reviewerUser: User, 
    overrides?: { breedName?: string; characteristics?: string; adminNotes?: string }
  ): { proposal: BreedProposal; breed: GlobalBreed } {
    const propIndex = this.breedProposals.findIndex(p => p.id === proposalId);
    if (propIndex === -1) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    const proposal = this.breedProposals[propIndex];
    const finalBreedName = (overrides?.breedName || proposal.breedName).trim();
    const finalCharacteristics = (overrides?.characteristics || proposal.characteristics || '').trim();

    // 1. Create or update in Global Breeds
    const existingBreed = this.globalBreeds.find(
      b => b.species.toLowerCase() === proposal.species.toLowerCase() &&
           b.name.toLowerCase() === finalBreedName.toLowerCase()
    );

    let createdOrUpdatedBreed: GlobalBreed;
    if (existingBreed) {
      existingBreed.characteristics = finalCharacteristics || existingBreed.characteristics;
      existingBreed.originRegion = proposal.originRegion || existingBreed.originRegion;
      existingBreed.primaryPurpose = proposal.primaryPurpose || existingBreed.primaryPurpose;
      createdOrUpdatedBreed = existingBreed;
    } else {
      createdOrUpdatedBreed = {
        id: `breed-${proposal.species.toLowerCase()}-${Date.now()}`,
        species: proposal.species,
        name: finalBreedName,
        originRegion: proposal.originRegion,
        primaryPurpose: proposal.primaryPurpose,
        characteristics: finalCharacteristics,
        averageMatureWeightKg: proposal.averageMatureWeightKg,
        isSystemDefault: false,
        addedFromProposalId: proposal.id,
        createdAt: new Date().toISOString(),
      };
      this.globalBreeds.push(createdOrUpdatedBreed);
    }

    // 2. Mark proposal as approved
    const updatedProposal: BreedProposal = {
      ...proposal,
      breedName: finalBreedName,
      characteristics: finalCharacteristics,
      status: 'approved',
      adminNotes: overrides?.adminNotes || 'Approved and published to universal flock breed registry.',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerUser.name || 'System Admin',
    };

    this.breedProposals[propIndex] = updatedProposal;
    this.saveToStorage();

    return { proposal: updatedProposal, breed: createdOrUpdatedBreed };
  }

  public rejectBreedProposal(
    proposalId: string, 
    reviewerUser: User, 
    reason: string
  ): BreedProposal {
    const propIndex = this.breedProposals.findIndex(p => p.id === proposalId);
    if (propIndex === -1) {
      throw new Error(`Proposal with ID ${proposalId} not found`);
    }

    const proposal = this.breedProposals[propIndex];
    const updatedProposal: BreedProposal = {
      ...proposal,
      status: 'rejected',
      rejectionReason: reason.trim() || 'Declined during system admin verification.',
      reviewedAt: new Date().toISOString(),
      reviewedBy: reviewerUser.name || 'System Admin',
    };

    this.breedProposals[propIndex] = updatedProposal;
    this.saveToStorage();
    return updatedProposal;
  }

  public addGlobalBreedDirectly(data: Omit<GlobalBreed, 'id' | 'createdAt'>): GlobalBreed {
    const newBreed: GlobalBreed = {
      ...data,
      id: `breed-${data.species.toLowerCase()}-${Date.now()}`,
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
    };
    this.globalBreeds.push(newBreed);
    this.saveToStorage();
    return newBreed;
  }

  public deleteGlobalBreed(breedId: string): boolean {
    const initialLen = this.globalBreeds.length;
    this.globalBreeds = this.globalBreeds.filter(b => b.id !== breedId);
    const deleted = this.globalBreeds.length < initialLen;
    if (deleted) {
      this.saveToStorage();
    }
    return deleted;
  }

  // ==================== RESET / CLEAR ====================

  public clearAllData() {
    this.farms = [];
    this.currentFarmId = null;
    this.saveToStorage();
  }

  public resetToStarterData() {
    this.users = [...DEFAULT_USERS];
    this.farms = INITIAL_FARMS.map(f => ({
      ...f,
      config: { ...DEFAULT_FARM_CONFIG },
      tasks: f.id === 'FARM-7821' ? [...INITIAL_FARM_TASKS] : [],
    }));
    this.globalBreeds = [...DEFAULT_GLOBAL_BREEDS];
    this.breedProposals = [...DEFAULT_BREED_PROPOSALS];
    this.currentFarmId = this.farms[0]?.id || null;
    this.saveToStorage();
  }
}

export const db = new FarmDatabase();
