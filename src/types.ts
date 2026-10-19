export type Species = 'Cow' | 'Goat' | 'Sheep' | 'Chicken' | 'Buffalo' | string;

export type AnimalHealthStatus = 
  | 'Healthy & Fit' 
  | 'Needs Medicine' 
  | 'Vaccine Due' 
  | 'Pregnant Care' 
  | 'Under Observation';

export type AnimalMilkStatus = 
  | 'Giving Milk' 
  | 'Dry Period' 
  | 'Laying Eggs' 
  | 'Rest Period' 
  | 'Not Milking (Male/Kid)';

export type MilkingSession = 'Morning' | 'Evening' | 'Afternoon';

export interface MilkYieldLog {
  id: string;
  animalId: string;
  cowTag: string;
  cowName: string;
  date: string;
  session: MilkingSession;
  liters: number;
  fatPercentage?: number;
  recordedBy: string;
  notes?: string;
  createdAt: string;
}

export type UserRole = 'Super Admin' | 'Admin' | 'Support Admin' | 'Herdsman' | 'Veterinarian' | 'Field Staff';

export function isVaccineManager(role?: UserRole | null, isAdmin?: boolean): boolean {
  if (isAdmin) return true;
  return role === 'Super Admin' || role === 'Admin' || role === 'Support Admin';
}

export interface FarmConfig {
  vaccineAlertDaysThreshold: number; // e.g. 7 days before due date
  targetDailyMilkLiters: number;
  defaultMilkUnit: 'Litres' | 'Gallons';
  contactPhone?: string;
  customVaccines?: string[];
}

export interface VaccineAlert {
  id: string;
  animalId: string;
  animalName: string;
  animalTag: string;
  species: string;
  photoUrl?: string;
  vaccineId: string;
  vaccineName: string;
  diseaseTarget: string;
  dueDate: string;
  daysLeft: number;
  status: 'Overdue' | 'Due Soon' | 'Today';
}

export interface User {
  id: string;
  name: string;
  identifier: string; // phone number or email address
  authType: 'email' | 'phone';
  phone?: string;
  email?: string;
  avatar?: string;
  isSuperAdmin?: boolean;
  createdAt: string;
}

export interface FarmMember {
  userId: string;
  name: string;
  identifier: string;
  role: UserRole;
  joinedAt: string;
  status: 'active' | 'pending';
}

export interface JoinRequest {
  id: string;
  farmId: string;
  userId: string;
  userName: string;
  userIdentifier: string;
  requestedAt: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface GrowthMetric {
  id: string;
  date: string;
  weightKg: number;
  heightCm: number;
  bodyConditionScore: number; // 1.0 to 5.0
  averageDailyGainG: number; // g/day
  dailyYieldValue: number; // milk L/day, eggs/week, wool kg/yr
  dailyYieldUnit: string;
  recordedBy: string;
  recordedById?: string;
  notes?: string;
}

export interface VaccinationRecord {
  id: string;
  animalId: string;
  vaccineName: string;
  diseaseTarget: string;
  dueDate: string;
  administeredDate?: string;
  status: 'Completed' | 'Due Soon' | 'Overdue' | 'Scheduled';
  dosage: string;
  batchNumber: string;
  administeredBy?: string;
  nextBoosterDate: string;
}

export interface HealthRecord {
  id: string;
  animalId: string;
  date: string;
  type: 'Routine Checkup' | 'Treatment' | 'Deworming' | 'Maternal / Birth' | 'Hoof & Coat Care' | 'Lab Screening';
  title: string;
  diagnosis: string;
  treatmentGiven: string;
  temperatureC: number;
  veterinarian: string;
  outcome: 'Resolved' | 'Monitoring' | 'Cleared';
  costInr: number;
}

export interface InheritedTrait {
  traitName: string;
  inheritedFrom: 'Sire' | 'Dam' | 'Both';
  scoreOrGrade: string;
  impactDescription: string;
}

export interface Animal {
  id: string;
  tagId: string;
  name: string;
  species: Species;
  breed: string;
  sex: 'Female' | 'Male';
  dateOfBirth: string;
  photoUrl: string;
  paddockLocation: string;
  status: 'Active' | 'Lactating' | 'Breeding Sire' | 'Laying' | 'Medical Watch' | 'Weaning';
  sireId: string | null;
  sireName: string;
  sireTag: string;
  sireBreed: string;
  damId: string | null;
  damName: string;
  damTag: string;
  damBreed: string;
  inheritedTraits: InheritedTrait[];
  inbreedingCoefficientPct: number;
  birthWeightKg: number;
  currentWeightKg: number;
  targetMatureWeightKg: number;
  productivityLabel: string;
  currentProductivityValue: string;
  healthStatus?: AnimalHealthStatus;
  milkStatus?: AnimalMilkStatus;
  dailyMilkLitres?: number;
  milkLogs?: MilkYieldLog[];
  growthHistory: GrowthMetric[];
  createdAt: string;
  createdBy: string;
}

export type TransactionType = 'income' | 'expense';

export type ExpenseCategory = 
  | 'Feed & Fodder' 
  | 'Medicine & Doctor' 
  | 'Vaccination' 
  | 'Worker Wages' 
  | 'Equipment & Shed' 
  | 'Transport & Fuel' 
  | 'Other Expense';

export type IncomeCategory = 
  | 'Milk Sales' 
  | 'Animal Sale' 
  | 'Dung & Manure' 
  | 'Eggs & Wool' 
  | 'Government Aid' 
  | 'Other Income';

export interface FinancialRecord {
  id: string;
  farmId: string;
  date: string;
  type: TransactionType;
  category: ExpenseCategory | IncomeCategory | string;
  amount: number;
  title: string;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface Farm {
  id: string; // unique farm ID (e.g. FARM-7821)
  name: string;
  adminUserId: string; // ID of farm creator / admin
  adminName: string;
  location: string;
  totalAcreage: number;
  establishedYear: number;
  primarySpecies: Species[];
  members: FarmMember[];
  joinRequests: JoinRequest[];
  animals: Animal[];
  vaccinations: VaccinationRecord[];
  healthRecords: HealthRecord[];
  milkLogs?: MilkYieldLog[];
  financialRecords?: FinancialRecord[];
  config?: FarmConfig;
  createdAt: string;
}
