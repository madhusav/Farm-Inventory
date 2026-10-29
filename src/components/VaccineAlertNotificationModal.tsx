import React from 'react';
import { Farm, User, VaccineAlert, isVaccineManager } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  Bell, 
  X, 
  AlertTriangle, 
  Clock, 
  Check, 
  Syringe, 
  Calendar, 
  ShieldCheck, 
  Lock,
  ArrowRight
} from 'lucide-react';

interface VaccineAlertNotificationModalProps {
  farm: Farm;
  currentUser: User;
  alerts: VaccineAlert[];
  onClose: () => void;
  onSelectAnimal: (animalId: string) => void;
  onMarkVaccineComplete: (vacId: string) => void;
  onOpenVaccinationSchedule: () => void;
}

export const VaccineAlertNotificationModal: React.FC<VaccineAlertNotificationModalProps> = ({
  farm,
  currentUser,
  alerts,
  onClose,
  onSelectAnimal,
  onMarkVaccineComplete,
  onOpenVaccinationSchedule,
}) => {
  const { t } = useLanguage();
  const isAdmin = farm.adminUserId === currentUser.id;
  const currentMember = farm.members.find(m => m.userId === currentUser.id);
  const canManageVaccine = isVaccineManager(currentMember?.role, isAdmin);

  const overdueCount = alerts.filter(a => a.status === 'Overdue').length;
  const dueSoonCount = alerts.filter(a => a.status === 'Due Soon' || a.status === 'Today').length;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-stone-200 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-200 bg-amber-50/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-900 flex items-center justify-center text-2xl shrink-0">
              🔔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-stone-900">
                  {t('vaccineAlertsTitle', 'Vaccine Due Alerts')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-200 text-amber-900">
                  {alerts.length} {t('alerts', 'Alerts')}
                </span>
              </div>
              <p className="text-xs text-stone-600 font-medium mt-0.5">
                {farm.name} · {t('vaccineAlertSub', 'Animals needing protection medicine shots soon')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200/80 hover:bg-stone-300 flex items-center justify-center text-stone-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Pill Summary */}
        <div className="px-6 py-3 bg-stone-50 border-b border-stone-200 flex items-center gap-3 text-xs">
          {overdueCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-red-100 text-red-900 font-extrabold">
              <AlertTriangle className="w-3.5 h-3.5 text-red-700" />
              <span>{overdueCount} Past Due Date</span>
            </div>
          )}
          {dueSoonCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 text-amber-900 font-extrabold">
              <Clock className="w-3.5 h-3.5 text-amber-700" />
              <span>{dueSoonCount} Due This Week</span>
            </div>
          )}
          <div className="ml-auto text-[11px] text-stone-500 font-bold">
            Reminder Window: {farm.config?.vaccineAlertDaysThreshold || 7} Days
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 overflow-y-auto space-y-3">
          {alerts.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-4xl">🎉</div>
              <h3 className="text-base font-extrabold text-emerald-900">
                All animals are fully vaccinated & healthy!
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                No vaccines are due in the next {farm.config?.vaccineAlertDaysThreshold || 7} days. Great job taking care of your livestock!
              </p>
            </div>
          ) : (
            alerts.map((alert) => {
              const isOverdue = alert.status === 'Overdue';
              const isToday = alert.status === 'Today';

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isOverdue 
                      ? 'bg-red-50/70 border-red-200' 
                      : isToday 
                      ? 'bg-amber-50/80 border-amber-300' 
                      : 'bg-stone-50/90 border-stone-200'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    {alert.photoUrl ? (
                      <img
                        src={alert.photoUrl}
                        alt={alert.animalName}
                        referrerPolicy="no-referrer"
                        className="w-14 h-14 rounded-2xl object-cover border border-stone-300 shrink-0"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-stone-200 flex items-center justify-center text-2xl shrink-0">
                        {alert.species === 'Cow' ? '🐄' : alert.species === 'Goat' ? '🐐' : alert.species === 'Sheep' ? '🐑' : '🐔'}
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-black px-2.5 py-0.5 rounded-full ${
                          isOverdue 
                            ? 'bg-red-600 text-white' 
                            : isToday 
                            ? 'bg-amber-600 text-white animate-pulse' 
                            : 'bg-amber-200 text-amber-950'
                        }`}>
                          {isOverdue 
                            ? `⚠️ Overdue by ${Math.abs(alert.daysLeft)} days` 
                            : isToday 
                            ? '⏰ DUE TODAY!' 
                            : `⏰ Due in ${alert.daysLeft} days`}
                        </span>
                        <span className="font-mono text-xs font-bold text-stone-600">
                          Due Date: {alert.dueDate}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-stone-900 text-sm mt-1">
                        {alert.vaccineName}
                      </h4>
                      <p className="text-xs text-stone-600">
                        Target: {alert.diseaseTarget}
                      </p>

                      <div className="mt-1 text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <span>{alert.species}: <strong>{alert.animalName}</strong></span>
                        <span className="font-mono text-stone-500 font-normal">(Tag #{alert.animalTag})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    {canManageVaccine ? (
                      <button
                        type="button"
                        onClick={() => onMarkVaccineComplete(alert.vaccineId)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Give Shot Today</span>
                      </button>
                    ) : (
                      <span className="text-[11px] font-bold text-stone-500 bg-stone-200/80 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Lock className="w-3 h-3 text-stone-400" />
                        <span>Admin Action</span>
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectAnimal(alert.animalId);
                      }}
                      className="px-3 py-2 rounded-xl border border-stone-300 hover:bg-white text-stone-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Diary
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <p className="text-[11px] text-stone-500 font-medium">
            {!canManageVaccine && '🔒 Only Farm Boss (Admin) and Support Admin can record or delete vaccine shots.'}
            {canManageVaccine && '✓ As Farm Boss / Support Admin, you have full control over vaccine schedules.'}
          </p>

          <button
            onClick={() => {
              onClose();
              onOpenVaccinationSchedule();
            }}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Full Vaccine List</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
