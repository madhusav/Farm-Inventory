import React, { useState } from 'react';
import { Farm, User } from '../types';
import { db } from '../services/db';
import { 
  Building2, 
  Users, 
  Syringe, 
  TrendingUp, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Search,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentUser: User;
  onSelectFarm: (farm: Farm) => void;
  onOpenCreateFarmModal: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  onSelectFarm,
  onOpenCreateFarmModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const allFarms = db.getAllTenantsForSuperAdmin();

  // Aggregate metrics across all tenant farms
  const totalFarms = allFarms.length;
  
  let totalGoats = 0;
  let totalSheep = 0;
  let totalAllAnimals = 0;
  let totalVaccinesScheduled = 0;
  let totalVaccinesDue = 0;
  let totalVaccinesOverdue = 0;
  let totalVaccinesCompleted = 0;

  allFarms.forEach(f => {
    f.animals.forEach(a => {
      totalAllAnimals++;
      if (a.species === 'Goat') totalGoats++;
      if (a.species === 'Sheep') totalSheep++;
    });

    f.vaccinations.forEach(v => {
      totalVaccinesScheduled++;
      if (v.status === 'Completed') totalVaccinesCompleted++;
      if (v.status === 'Due Soon') totalVaccinesDue++;
      if (v.status === 'Overdue') totalVaccinesOverdue++;
    });
  });

  const filteredFarms = allFarms.filter(f => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q) ||
      f.adminName.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q)
    );
  });

  const handleDeleteFarm = (farmId: string) => {
    try {
      db.deleteFarm(farmId);
      setDeleteConfirmId(null);
    } catch (e: any) {
      alert(e.message || 'Error deleting farm');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Super Admin Top Header */}
      <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-stone-900 text-white rounded-3xl p-5 sm:p-7 shadow-lg border border-purple-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-200 text-xs font-black uppercase tracking-wider">
              <span>👑</span>
              <span>Platform Super Admin</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              All Farms & Tenants Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-purple-200 font-medium">
              Signed in as <strong>{currentUser.name}</strong> ({currentUser.identifier || '9999999999'}) · Full platform control
            </p>
          </div>

          <button
            onClick={onOpenCreateFarmModal}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add New Farm Tenant</span>
          </button>
        </div>
      </div>

      {/* Global Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Farms */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              Total Farms
            </span>
            <span className="text-xl">🏡</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-purple-950">
            {totalFarms}
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">
            Isolated Farm Tenants
          </div>
        </div>

        {/* Goats & Sheep */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              Goats & Sheep
            </span>
            <span className="text-xl">🐐🐑</span>
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-black font-mono text-emerald-950">
              {totalGoats + totalSheep}
            </span>
            <span className="text-xs text-stone-500 font-bold">
              ({totalGoats} goats, {totalSheep} sheep)
            </span>
          </div>
          <div className="text-[11px] text-stone-500 font-medium mt-1">
            {totalAllAnimals} Total Livestock
          </div>
        </div>

        {/* Vaccines Scheduled */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              Vaccines Due
            </span>
            <span className="text-xl">💉</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-amber-950">
            {totalVaccinesDue + totalVaccinesOverdue}
          </div>
          <div className="text-[11px] text-amber-700 font-bold mt-1">
            {totalVaccinesOverdue} Overdue Shots Across Farms
          </div>
        </div>

        {/* Completed Vaccines */}
        <div className="p-4 rounded-3xl bg-white border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-stone-500 uppercase tracking-wider">
              Completed Vaccines
            </span>
            <span className="text-xl">✅</span>
          </div>
          <div className="mt-2 text-2xl sm:text-3xl font-black font-mono text-emerald-900">
            {totalVaccinesCompleted}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            Herd Immunity Active
          </div>
        </div>
      </div>

      {/* Tenant Directory */}
      <div className="space-y-4 bg-white rounded-3xl p-4 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-stone-900 flex items-center gap-2">
              <span>Managed Farm Tenants & Admins</span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700">
                {allFarms.length}
              </span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select any farm below to view and manage its animals, daily records, and vaccinations.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search farm, admin or location..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-200 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Farms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFarms.map(f => {
            const goats = f.animals.filter(a => a.species === 'Goat').length;
            const sheep = f.animals.filter(a => a.species === 'Sheep').length;
            const overdueVacs = f.vaccinations.filter(v => v.status === 'Overdue').length;

            return (
              <div
                key={f.id}
                className="p-4 sm:p-5 rounded-2xl border-2 border-stone-200 hover:border-purple-600 bg-stone-50/50 hover:bg-purple-50/20 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded-md bg-purple-100 text-purple-950">
                      {f.id}
                    </span>
                    <span className="text-[11px] font-bold text-stone-500">
                      {f.totalAcreage || 10} Acres
                    </span>
                  </div>

                  <h3 className="text-base font-black text-stone-900 mt-1.5 truncate">
                    {f.name}
                  </h3>

                  <div className="space-y-1 text-xs text-stone-600 mt-2">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{f.location}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                      <span>Farm Admin: <strong>{f.adminName}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5 text-stone-500 font-mono text-[11px]">
                      <span>Contact: {f.config?.contactPhone || 'Available in Admin'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      🐐 {goats} Goats
                    </span>
                    <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-900">
                      🐑 {sheep} Sheep
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {deleteConfirmId === f.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDeleteFarm(f.id)}
                          className="px-2 py-1 rounded bg-red-700 text-white text-[10px] font-black cursor-pointer"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-2 py-1 rounded bg-stone-200 text-stone-700 text-[10px] font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(f.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                        title="Delete farm tenant"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onSelectFarm(f)}
                      className="px-3.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white text-xs font-black flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                    >
                      <span>Manage Farm</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
