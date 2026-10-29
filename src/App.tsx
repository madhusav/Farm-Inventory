import React, { useState, useEffect } from 'react';
import { 
  Farm, 
  User, 
  Animal, 
  Species, 
  GrowthMetric, 
  VaccinationRecord, 
  HealthRecord, 
  UserRole, 
  FarmConfig,
  VaccineAlert,
  isVaccineManager,
  FinancialRecord,
  FarmTask,
} from './types';
import { db } from './services/db';
import { LandingPage } from './components/LandingPage';
import { Navbar } from './components/Navbar';
import { FarmSelectionModal } from './components/FarmSelectionModal';
import { FarmAdminUsersModal } from './components/FarmAdminUsersModal';
import { LivestockList } from './components/LivestockList';
import { AnimalDetailModal } from './components/AnimalDetailModal';
import { AddAnimalModal } from './components/AddAnimalModal';
import { BulkAddAnimalModal } from './components/BulkAddAnimalModal';
import { ManageAvailableSpeciesModal } from './components/ManageAvailableSpeciesModal';
import { VaccinationScheduleView } from './components/VaccinationScheduleView';
import { GrowthTrackerView } from './components/GrowthTrackerView';
import { LineagePedigreeView } from './components/LineagePedigreeView';
import { VaccineAlertNotificationModal } from './components/VaccineAlertNotificationModal';
import { ReportsView } from './components/ReportsView';
import { FinancialLedgerModal } from './components/FinancialLedgerModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { SystemAdminDashboardModal } from './components/SystemAdminDashboardModal';
import { FarmTasksModal } from './components/FarmTasksModal';
import { DEFAULT_USERS } from './data/initialData';
import { useLanguage } from './i18n/LanguageContext';

export function App() {
  const { syncUserLanguage, setLang } = useLanguage();
  // Database reactive states
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [farms, setFarms] = useState<Farm[]>(() => db.getFarms());
  const [currentUser, setCurrentUser] = useState<User | null>(() => db.getCurrentUser());
  const [currentFarm, setCurrentFarm] = useState<Farm | null>(() => db.getCurrentFarm());

  // Active view tab
  const [activeTab, setActiveTab] = useState<'inventory' | 'lineage' | 'vaccinations' | 'growth' | 'reports'>('inventory');

  // Modals
  const [showFarmSelectionModal, setShowFarmSelectionModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showAddAnimalModal, setShowAddAnimalModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkModalSpecies, setBulkModalSpecies] = useState<Species | undefined>(undefined);
  const [showSpeciesModal, setShowSpeciesModal] = useState(false);
  const [showVaccineAlertsModal, setShowVaccineAlertsModal] = useState(false);
  const [showTasksModal, setShowTasksModal] = useState(false);
  const [tasksModalFilter, setTasksModalFilter] = useState<'all' | 'sheep' | 'goat' | 'targets' | 'reminders' | 'my_tasks' | 'completed'>('all');
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [showSystemAdminModal, setShowSystemAdminModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null);
  const [adminModalTab, setAdminModalTab] = useState<'team' | 'vaccines' | 'farm' | 'breeds' | 'database'>('team');

  // Configured Application Name (Default: Testing)
  const appName = currentFarm?.config?.appName || db.getAppName() || 'Testing';

  // Synchronize document title with configured application name
  useEffect(() => {
    document.title = `${appName} — Phase 1 Flock Diary`;
  }, [appName]);

  // Subscribe to database updates
  useEffect(() => {
    const unsubscribe = db.subscribe(() => {
      setUsers(db.getUsers());
      setFarms(db.getFarms());
      setCurrentUser(db.getCurrentUser());
      setCurrentFarm(db.getCurrentFarm());
    });
    return () => unsubscribe();
  }, []);

  // Update selectedAnimal if currentFarm animals change
  useEffect(() => {
    if (selectedAnimal && currentFarm) {
      const refreshed = currentFarm.animals.find(a => a.id === selectedAnimal.id);
      if (refreshed) {
        setSelectedAnimal(refreshed);
      }
    }
  }, [currentFarm]);

  // Check if current user is approved on active farm
  const isApprovedOnActiveFarm = currentFarm && currentUser && (
    db.isSuperAdmin(currentUser) ||
    currentFarm.adminUserId === currentUser.id ||
    currentFarm.members.some(m => m.userId === currentUser.id && m.status === 'active')
  );

  // Active vaccine due notifications & sheep/goat tasks
  const alerts: VaccineAlert[] = currentFarm ? db.getVaccineAlerts(currentFarm.id) : [];
  const farmTasks: FarmTask[] = currentFarm ? db.getFarmTasks(currentFarm.id) : [];
  const dueReminders: FarmTask[] = (currentFarm && currentUser) ? db.getDueRemindersForUser(currentFarm.id, currentUser) : [];

  // When user logs in
  const handleLogin = (user: User) => {
    db.setCurrentUser(user);
    syncUserLanguage(user.preferredLanguage, user.id);
    if (db.isSuperAdmin(user)) {
      const allFarms = db.getAllTenantsForSuperAdmin();
      if (allFarms.length > 0) {
        db.setCurrentFarmId(allFarms[0].id);
        setShowFarmSelectionModal(false);
      } else {
        setShowFarmSelectionModal(true);
      }
      return;
    }

    // Find farms this user is approved for
    const approvedFarms = db.getUserFarms(user.id);
    if (approvedFarms.length >= 1) {
      db.setCurrentFarmId(approvedFarms[0].id);
      setShowFarmSelectionModal(false);
    } else {
      // New user or no approved farm -> Open the Farm Screen to enter Farm ID or create new farm
      db.setCurrentFarmId(null);
      setShowFarmSelectionModal(true);
    }
  };

  const handleRegister = (newUser: User) => {
    const registered = db.registerUser(newUser.name, newUser.identifier, newUser.authType);
    syncUserLanguage(registered.preferredLanguage, registered.id);
    setShowFarmSelectionModal(true);
  };

  const handleLogout = () => {
    db.logoutUser();
    setLang('en');
    setSelectedAnimal(null);
    setShowFarmSelectionModal(false);
    setShowTeamModal(false);
    setShowAddAnimalModal(false);
    setShowVaccineAlertsModal(false);
  };

  const handleSelectFarm = (farm: Farm) => {
    db.setCurrentFarmId(farm.id);
    setShowFarmSelectionModal(false);
  };

  const handleCreateFarm = (newFarm: Farm) => {
    db.createFarm({
      id: newFarm.id,
      name: newFarm.name,
      location: newFarm.location,
      totalAcreage: newFarm.totalAcreage,
      establishedYear: newFarm.establishedYear,
      primarySpecies: newFarm.primarySpecies,
      withStarterFlock: (newFarm.animals && newFarm.animals.length > 0),
    });
    setShowFarmSelectionModal(false);
  };

  const handleRequestJoinFarm = (farmId: string, message: string) => {
    db.requestJoinFarm(farmId, message);
  };

  const handleApproveRequest = (requestId: string, assignedRole: UserRole) => {
    if (!currentFarm) return;
    db.approveJoinRequest(currentFarm.id, requestId, assignedRole);
  };

  const handleRejectRequest = (requestId: string) => {
    if (!currentFarm) return;
    db.rejectJoinRequest(currentFarm.id, requestId);
  };

  const handleAddUserDirectly = (name: string, identifier: string, role: UserRole) => {
    if (!currentFarm) return;
    db.addMemberDirectly(currentFarm.id, name, identifier, role);
  };

  const handleUpdateMemberRole = (userId: string, role: UserRole) => {
    if (!currentFarm) return;
    db.updateMemberRole(currentFarm.id, userId, role);
  };

  const handleRemoveMember = (userId: string) => {
    if (!currentFarm) return;
    db.removeMember(currentFarm.id, userId);
  };

  const handleUpdateFarmProfile = (profileUpdates: Partial<Farm>) => {
    if (!currentFarm) return;
    db.updateFarm(currentFarm.id, profileUpdates);
  };

  const handleUpdateFarmConfig = (configUpdates: Partial<FarmConfig>) => {
    if (!currentFarm) return;
    db.updateFarmConfig(currentFarm.id, configUpdates);
  };

  const handleAddAnimal = (newAnimal: Animal) => {
    if (!currentFarm) return;
    db.addAnimal(currentFarm.id, newAnimal);
    setShowAddAnimalModal(false);
  };

  const handleBulkAddAnimals = (newAnimals: Animal[]) => {
    if (!currentFarm) return;
    db.bulkAddAnimals(currentFarm.id, newAnimals);
    setShowBulkModal(false);
  };

  const handleSaveAvailableSpecies = (speciesList: Species[]) => {
    if (!currentFarm) return;
    db.updateAvailableSpecies(currentFarm.id, speciesList);
    setShowSpeciesModal(false);
  };

  const handleDeleteAnimal = (animalId: string) => {
    if (!currentFarm) return;
    db.deleteAnimal(currentFarm.id, animalId);
    if (selectedAnimal?.id === animalId) {
      setSelectedAnimal(null);
    }
  };

  const handleBatchDeleteAnimals = (animalIds: string[]) => {
    if (!currentFarm || animalIds.length === 0) return;
    db.deleteAnimals(currentFarm.id, animalIds);
    if (selectedAnimal && animalIds.includes(selectedAnimal.id)) {
      setSelectedAnimal(null);
    }
  };

  const handleAddGrowthRecord = (animalId: string, record: Omit<GrowthMetric, 'id'>) => {
    if (!currentFarm) return;
    db.addGrowthMetric(currentFarm.id, animalId, record);
  };

  const handleMarkVaccineComplete = (vacId: string) => {
    if (!currentFarm || !currentUser) return;
    db.markVaccineComplete(currentFarm.id, vacId, currentUser.name);
  };

  const handleAddVaccine = (vac: Omit<VaccinationRecord, 'id'>) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.addVaccination(currentFarm.id, vac, currentUser);
    } catch (err: any) {
      alert(err.message || 'Only Admin and Support users can create vaccine entries.');
    }
  };

  const handleUpdateVaccine = (vacId: string, updates: Partial<VaccinationRecord>) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.updateVaccination(currentFarm.id, vacId, updates, currentUser);
    } catch (err: any) {
      alert(err.message || 'Only Admin and Support users can edit vaccine entries.');
    }
  };

  const handleDeleteVaccine = (vacId: string) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.deleteVaccination(currentFarm.id, vacId, currentUser);
    } catch (err: any) {
      alert(err.message || 'Only Admin and Support users can delete vaccine entries.');
    }
  };

  const handleBulkMarkVaccineComplete = (vacIds: string[]) => {
    if (!currentFarm || !currentUser) return;
    db.bulkMarkVaccinesComplete(currentFarm.id, vacIds, currentUser.name);
  };

  const handleBulkAddVaccine = (animalIds: string[], vacData: Omit<VaccinationRecord, 'id' | 'animalId'>) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.bulkAddVaccinations(currentFarm.id, animalIds, vacData, currentUser);
    } catch (err: any) {
      alert(err.message || 'Error adding bulk vaccinations.');
    }
  };

  const handleBulkUpdateVaccine = (vacIds: string[], updates: Partial<VaccinationRecord>) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.bulkUpdateVaccinations(currentFarm.id, vacIds, updates, currentUser);
    } catch (err: any) {
      alert(err.message || 'Error updating vaccinations.');
    }
  };

  const handleBulkDeleteVaccine = (vacIds: string[]) => {
    if (!currentFarm || !currentUser) return;
    try {
      db.bulkDeleteVaccinations(currentFarm.id, vacIds, currentUser);
    } catch (err: any) {
      alert(err.message || 'Error deleting vaccinations.');
    }
  };

  const handleAddHealthRecord = (record: Omit<HealthRecord, 'id'>) => {
    if (!currentFarm) return;
    db.addHealthRecord(currentFarm.id, record);
  };

  const handleAddTransaction = (record: Omit<FinancialRecord, 'id' | 'createdAt'>) => {
    if (!currentFarm) return;
    db.addFinancialRecord(currentFarm.id, record);
  };

  const handleDeleteTransaction = (recordId: string) => {
    if (!currentFarm) return;
    db.deleteFinancialRecord(currentFarm.id, recordId);
  };

  const handleUpdateAnimalPhoto = (animalId: string, newPhoto: string) => {
    if (!currentFarm) return;
    db.updateAnimal(currentFarm.id, animalId, { photoUrl: newPhoto });
  };

  const handleUpdateAnimal = (animalId: string, updates: Partial<Animal>) => {
    if (!currentFarm) return;
    const updated = db.updateAnimal(currentFarm.id, animalId, updates);
    if (selectedAnimal && selectedAnimal.id === animalId) {
      setSelectedAnimal(updated);
    }
  };

  const handleAddTask = (taskData: Omit<FarmTask, 'id' | 'createdAt' | 'farmId'>) => {
    if (!currentFarm) return;
    db.addFarmTask(currentFarm.id, taskData);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<FarmTask>) => {
    if (!currentFarm) return;
    db.updateFarmTask(currentFarm.id, taskId, updates);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!currentFarm) return;
    db.deleteFarmTask(currentFarm.id, taskId);
  };

  const handleUpdateTargetProgress = (taskId: string, currentValue: number) => {
    if (!currentFarm) return;
    db.updateTaskTargetProgress(currentFarm.id, taskId, currentValue);
  };

  const handleAcknowledgeReminder = (taskId: string) => {
    if (!currentFarm) return;
    db.acknowledgeReminder(currentFarm.id, taskId);
  };

  const openTasksModal = (filter: 'all' | 'sheep' | 'goat' | 'targets' | 'reminders' | 'my_tasks' | 'completed' = 'all') => {
    setTasksModalFilter(filter);
    setShowTasksModal(true);
  };

  const handleResetStarterData = () => {
    db.resetToStarterData();
  };

  const handleClearFarmData = () => {
    if (currentFarm) {
      db.updateFarm(currentFarm.id, {
        animals: [],
        vaccinations: [],
        healthRecords: [],
        milkLogs: [],
      });
    }
  };

  // If user is not authenticated, show LandingPage
  if (!currentUser) {
    return (
      <>
        <LandingPage
          users={users}
          appName={appName}
          onLogin={handleLogin}
          onRegister={handleRegister}
        />
        <OfflineIndicator />
      </>
    );
  }

  // If user is authenticated but has no active farm or is not approved, show Farm Selection Modal
  if (!currentFarm || !isApprovedOnActiveFarm || showFarmSelectionModal) {
    return (
      <div className="min-h-screen bg-stone-50">
        <FarmSelectionModal
          currentUser={currentUser}
          farms={farms}
          onSelectFarm={handleSelectFarm}
          onCreateFarm={handleCreateFarm}
          onRequestJoinFarm={handleRequestJoinFarm}
          onLogout={handleLogout}
        />
        <OfflineIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-16 overflow-x-hidden w-full max-w-full">
      
      {/* Top Navbar with Vaccine Notification Bell & Admin Tool */}
      <Navbar
        currentFarm={currentFarm}
        currentUser={currentUser}
        appName={appName}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenFarmSelection={() => setShowFarmSelectionModal(true)}
        onOpenTeamModal={() => {
          setAdminModalTab('team');
          setShowTeamModal(true);
        }}
        onOpenAdminLocation={() => {
          setAdminModalTab('farm');
          setShowTeamModal(true);
        }}
        onOpenSpeciesModal={() => setShowSpeciesModal(true)}
        onOpenVaccineAlertsModal={() => setShowVaccineAlertsModal(true)}
        onOpenTasksModal={openTasksModal}
        onOpenLedger={() => setShowLedgerModal(true)}
        onOpenSystemAdmin={() => setShowSystemAdminModal(true)}
        vaccineAlertsCount={alerts.length}
        tasksCount={farmTasks.filter(t => t.status !== 'completed').length}
        dueRemindersCount={dueReminders.length}
        pendingBreedProposalsCount={db.getPendingBreedProposalsCount()}
        onLogout={handleLogout}
      />

      {/* Main View Area with Mobile Bottom Nav Clearance */}
      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 py-3 sm:py-6 pb-32 lg:pb-12">
        {activeTab === 'inventory' && (
          <LivestockList
            farm={currentFarm}
            currentUser={currentUser}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onOpenAddModal={() => setShowAddAnimalModal(true)}
            onOpenBulkModal={(sp) => {
              setBulkModalSpecies(sp);
              setShowBulkModal(true);
            }}
            onOpenSpeciesModal={() => setShowSpeciesModal(true)}
            onDeleteAnimal={handleDeleteAnimal}
            onBatchDeleteAnimals={handleBatchDeleteAnimals}
            onOpenVaccineAlerts={() => setShowVaccineAlertsModal(true)}
            onOpenTasksModal={openTasksModal}
            onUpdateAnimal={handleUpdateAnimal}
            onBulkAddVaccine={handleBulkAddVaccine}
          />
        )}

        {activeTab === 'lineage' && (
          <LineagePedigreeView
            farm={currentFarm}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
          />
        )}

        {activeTab === 'vaccinations' && (
          <VaccinationScheduleView
            farm={currentFarm}
            currentUser={currentUser}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onMarkVaccineComplete={handleMarkVaccineComplete}
            onAddVaccine={handleAddVaccine}
            onUpdateVaccine={handleUpdateVaccine}
            onDeleteVaccine={handleDeleteVaccine}
            onBulkMarkComplete={handleBulkMarkVaccineComplete}
            onBulkAddVaccine={handleBulkAddVaccine}
            onBulkUpdateVaccine={handleBulkUpdateVaccine}
            onBulkDeleteVaccine={handleBulkDeleteVaccine}
          />
        )}

        {activeTab === 'growth' && (
          <GrowthTrackerView
            farm={currentFarm}
            currentUser={currentUser}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
            onAddGrowthRecord={handleAddGrowthRecord}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            farm={currentFarm}
            currentUser={currentUser}
            onOpenLedger={() => setShowLedgerModal(true)}
            onSelectAnimal={(animal) => setSelectedAnimal(animal)}
          />
        )}
      </main>

      {/* Financial Ledger Modal */}
      {showLedgerModal && (
        <FinancialLedgerModal
          farm={currentFarm}
          currentUser={currentUser}
          onClose={() => setShowLedgerModal(false)}
          onAddTransaction={handleAddTransaction}
          onDeleteTransaction={handleDeleteTransaction}
        />
      )}

      {/* Vaccine Nearing Alert Notification Drawer / Modal */}
      {showVaccineAlertsModal && (
        <VaccineAlertNotificationModal
          farm={currentFarm}
          currentUser={currentUser}
          alerts={alerts}
          onClose={() => setShowVaccineAlertsModal(false)}
          onSelectAnimal={(animalId) => {
            const found = currentFarm.animals.find(a => a.id === animalId);
            if (found) setSelectedAnimal(found);
          }}
          onMarkVaccineComplete={handleMarkVaccineComplete}
          onOpenVaccinationSchedule={() => {
            setActiveTab('vaccinations');
          }}
        />
      )}

      {/* Animal Detail Passport Modal */}
      {selectedAnimal && (
        <AnimalDetailModal
          animal={selectedAnimal}
          farm={currentFarm}
          currentUser={currentUser}
          onClose={() => setSelectedAnimal(null)}
          onSelectAnotherAnimal={(a) => setSelectedAnimal(a)}
          onAddGrowthRecord={handleAddGrowthRecord}
          onMarkVaccineComplete={handleMarkVaccineComplete}
          onAddVaccine={handleAddVaccine}
          onAddHealthRecord={handleAddHealthRecord}
          onDeleteAnimal={handleDeleteAnimal}
          onUpdateAnimalPhoto={handleUpdateAnimalPhoto}
          onUpdateAnimal={handleUpdateAnimal}
        />
      )}

      {/* Add Single Livestock Modal */}
      {showAddAnimalModal && (
        <AddAnimalModal
          farm={currentFarm}
          currentUser={currentUser}
          onClose={() => setShowAddAnimalModal(false)}
          onAddAnimal={handleAddAnimal}
        />
      )}

      {/* Bulk Add Animals Modal */}
      {showBulkModal && (
        <BulkAddAnimalModal
          farm={currentFarm}
          currentUser={currentUser}
          initialSpecies={bulkModalSpecies}
          onClose={() => {
            setShowBulkModal(false);
            setBulkModalSpecies(undefined);
          }}
          onBulkAdd={handleBulkAddAnimals}
        />
      )}

      {/* Farm Available Species Setup Modal */}
      {showSpeciesModal && (
        <ManageAvailableSpeciesModal
          farm={currentFarm}
          currentUser={currentUser}
          onClose={() => setShowSpeciesModal(false)}
          onSaveAvailableSpecies={handleSaveAvailableSpecies}
        />
      )}

      {/* Full Farm Admin & Configuration Tool Modal */}
      {showTeamModal && (
        <FarmAdminUsersModal
          farm={currentFarm}
          currentUser={currentUser}
          initialTab={adminModalTab}
          onClose={() => setShowTeamModal(false)}
          onApproveRequest={handleApproveRequest}
          onRejectRequest={handleRejectRequest}
          onAddUserDirectly={handleAddUserDirectly}
          onUpdateMemberRole={handleUpdateMemberRole}
          onRemoveMember={handleRemoveMember}
          onUpdateFarmProfile={handleUpdateFarmProfile}
          onUpdateFarmConfig={handleUpdateFarmConfig}
          onResetStarterData={handleResetStarterData}
          onClearFarmData={handleClearFarmData}
          onOpenSystemAdmin={() => {
            setShowTeamModal(false);
            setShowSystemAdminModal(true);
          }}
        />
      )}

      {/* Global System Admin Dashboard (Breed Approval & Universal Catalog Authority) */}
      {showSystemAdminModal && currentUser && (
        <SystemAdminDashboardModal
          currentUser={currentUser}
          onClose={() => setShowSystemAdminModal(false)}
          onSwitchToSystemAdmin={() => {
            const adminUser = users.find(u => u.identifier.toLowerCase() === 'madhusav@gmail.com') ||
              DEFAULT_USERS.find(u => u.identifier.toLowerCase() === 'madhusav@gmail.com') ||
              DEFAULT_USERS[0];
            db.setCurrentUser(adminUser);
            setCurrentUser(adminUser);
          }}
        />
      )}

      {/* Sheep & Goat Farm Tasks, Targets & Reminders Modal */}
      {showTasksModal && currentFarm && currentUser && (
        <FarmTasksModal
          farm={currentFarm}
          currentUser={currentUser}
          initialFilter={tasksModalFilter}
          onClose={() => setShowTasksModal(false)}
          onAddTask={handleAddTask}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={handleDeleteTask}
          onUpdateTargetProgress={handleUpdateTargetProgress}
          onAcknowledgeReminder={handleAcknowledgeReminder}
        />
      )}

      {/* Global Offline Mode Notification for Rural Farms */}
      <OfflineIndicator />
    </div>
  );
}

export default App;
