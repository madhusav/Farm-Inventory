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
  isVaccineManager
} from '../types';
import { DEFAULT_USERS, INITIAL_FARMS } from '../data/initialData';

const STORAGE_USERS_KEY = 'farmtrack_mysql_users_v3';
const STORAGE_FARMS_KEY = 'farmtrack_mysql_farms_v3';
const STORAGE_CURRENT_USER_KEY = 'farmtrack_mysql_curr_user_v3';
const STORAGE_CURRENT_FARM_KEY = 'farmtrack_mysql_curr_farm_v3';

export const DEFAULT_FARM_CONFIG: FarmConfig = {
  vaccineAlertDaysThreshold: 7,
  targetDailyMilkLiters: 45.0,
  defaultMilkUnit: 'Litres',
  contactPhone: '+91 98765 43210',
  customVaccines: [
    'FMD (Foot & Mouth Disease / खुरपका-मुंहपका)',
    'Anthrax (गलघोंटू)',
    'Black Quarter (BQ / लंगड़ा बुखार)',
    'PPR Goat Plague (बकरी प्लेग)',
    'Brucellosis Abortion Shield (ब्रुसेलोसिस)',
    'Ranikhet Disease Newcastle (मुर्गी रानीखेत)'
  ]
};

class FarmDatabase {
  private users: User[] = [];
  private farms: Farm[] = [];
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
        this.farms = JSON.parse(savedFarms);
      } else {
        // Initial setup
        this.farms = INITIAL_FARMS.map(f => ({
          ...f,
          config: { ...DEFAULT_FARM_CONFIG }
        }));
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
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(this.users));
      localStorage.setItem(STORAGE_FARMS_KEY, JSON.stringify(this.farms));
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

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      identifier: identifier.trim(),
      authType,
      phone: authType === 'phone' ? identifier.trim() : undefined,
      email: authType === 'email' ? identifier.trim() : undefined,
      createdAt: new Date().toISOString()
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.saveToStorage();
    return newUser;
  }

  public loginUser(identifier: string): User | null {
    const clean = identifier.trim().toLowerCase();
    const user = this.users.find(u => u.identifier.toLowerCase() === clean);
    if (user) {
      this.currentUser = user;
      this.saveToStorage();
      return user;
    }
    return null;
  }

  public logoutUser() {
    this.currentUser = null;
    this.currentFarmId = null;
    this.saveToStorage();
  }

  // ==================== FARMS ====================

  public getFarms(): Farm[] {
    return [...this.farms];
  }

  public getCurrentFarm(): Farm | null {
    if (!this.currentFarmId) return null;
    return this.farms.find(f => f.id === this.currentFarmId) || null;
  }

  public setCurrentFarmId(farmId: string | null) {
    this.currentFarmId = farmId;
    this.saveToStorage();
  }

  public createFarm(farmData: {
    name: string;
    location: string;
    totalAcreage: number;
    establishedYear: number;
    primarySpecies: Species[];
  }): Farm {
    if (!this.currentUser) throw new Error('Must be logged in to create a farm');

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newFarm: Farm = {
      id: `FARM-${randomSuffix}`,
      name: farmData.name.trim(),
      adminUserId: this.currentUser.id,
      adminName: this.currentUser.name,
      location: farmData.location.trim(),
      totalAcreage: farmData.totalAcreage || 5.0,
      establishedYear: farmData.establishedYear || new Date().getFullYear(),
      primarySpecies: farmData.primarySpecies.length > 0 ? farmData.primarySpecies : ['Cow', 'Goat', 'Sheep', 'Chicken'],
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
      animals: [],
      vaccinations: [],
      healthRecords: [],
      milkLogs: [],
      config: { ...DEFAULT_FARM_CONFIG },
      createdAt: new Date().toISOString()
    };

    this.farms.unshift(newFarm);
    this.currentFarmId = newFarm.id;
    this.saveToStorage();
    return newFarm;
  }

  public updateFarm(farmId: string, updates: Partial<Farm>): Farm {
    const index = this.farms.findIndex(f => f.id === farmId);
    if (index === -1) throw new Error('Farm not found');

    const updated = { ...this.farms[index], ...updates };
    this.farms[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public updateFarmConfig(farmId: string, configUpdates: Partial<FarmConfig>): FarmConfig {
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

  public deleteFarm(farmId: string): boolean {
    if (!this.currentUser) return false;
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm || farm.adminUserId !== this.currentUser.id) {
      throw new Error('Only the Farm Boss (Admin) can delete this farm');
    }

    this.farms = this.farms.filter(f => f.id !== farmId);
    if (this.currentFarmId === farmId) {
      this.currentFarmId = this.farms[0]?.id || null;
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

    const updated = { ...farm.animals[index], ...updates };
    farm.animals[index] = updated;
    this.saveToStorage();
    return updated;
  }

  public deleteAnimal(farmId: string, animalId: string): boolean {
    const farm = this.farms.find(f => f.id === farmId);
    if (!farm) return false;

    farm.animals = farm.animals.filter(a => a.id !== animalId);
    farm.vaccinations = farm.vaccinations.filter(v => v.animalId !== animalId);
    farm.healthRecords = farm.healthRecords.filter(h => h.animalId !== animalId);
    if (farm.milkLogs) {
      farm.milkLogs = farm.milkLogs.filter(m => m.animalId !== animalId);
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
      config: { ...DEFAULT_FARM_CONFIG }
    }));
    this.currentFarmId = this.farms[0]?.id || null;
    this.saveToStorage();
  }
}

export const db = new FarmDatabase();
