import React from 'react';
import { Farm, User, FarmTask } from '../types';
import { db } from '../services/db';
import { Bell, Target, ChevronRight, CheckCircle2, Clock, Flame, AlertCircle } from 'lucide-react';

interface FarmTasksBannerProps {
  farm: Farm;
  currentUser: User;
  onOpenTasksModal: (filter?: 'all' | 'sheep' | 'goat' | 'targets' | 'reminders' | 'my_tasks' | 'completed') => void;
}

export const FarmTasksBanner: React.FC<FarmTasksBannerProps> = ({
  farm,
  currentUser,
  onOpenTasksModal,
}) => {
  const dueReminders = db.getDueRemindersForUser(farm.id, currentUser);
  const tasks = farm.tasks || [];
  const inProgressTargets = tasks.filter(t => t.target?.enabled && t.status === 'in_progress');

  if (dueReminders.length === 0 && inProgressTargets.length === 0) {
    return null;
  }

  // If there are urgent due reminders
  if (dueReminders.length > 0) {
    const firstReminder = dueReminders[0];
    const isUrgent = firstReminder.priority === 'Urgent';
    const isOverdue = new Date(firstReminder.dueDate).getTime() < new Date(new Date().toISOString().split('T')[0]).getTime();

    return (
      <div className={`mb-3 p-3 sm:p-3.5 rounded-2xl border transition-all shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
        isOverdue || isUrgent
          ? 'bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-200'
          : 'bg-amber-50 border-amber-300 text-amber-950'
      }`}>
        <div className="flex items-start sm:items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base ${
            isOverdue || isUrgent ? 'bg-rose-200 text-rose-900' : 'bg-amber-200 text-amber-900'
          }`}>
            {isOverdue ? '⚠️' : '🔔'}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isOverdue || isUrgent ? 'bg-rose-600 text-white' : 'bg-amber-800 text-white'
              }`}>
                {isOverdue ? 'Overdue Reminder' : 'Farm Reminder'}
              </span>
              <span className="text-xs font-black truncate">
                {firstReminder.title}
              </span>
            </div>

            <div className="text-[11px] text-stone-700 font-medium mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>Due: <strong>{firstReminder.dueDate}</strong> {firstReminder.dueTime ? `(${firstReminder.dueTime})` : ''}</span>
              {firstReminder.target?.enabled && (
                <>
                  <span>·</span>
                  <span>Target: <strong>{firstReminder.target.currentValue} / {firstReminder.target.targetValue} {firstReminder.target.unit}</strong></span>
                </>
              )}
              {dueReminders.length > 1 && (
                <>
                  <span>·</span>
                  <span className="font-bold underline text-emerald-900">+{dueReminders.length - 1} more reminder{dueReminders.length > 2 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            type="button"
            onClick={() => onOpenTasksModal('reminders')}
            className={`px-3 py-1.5 rounded-xl text-xs font-black cursor-pointer shadow-xs active:scale-95 transition-all flex items-center gap-1 ${
              isOverdue || isUrgent
                ? 'bg-rose-700 hover:bg-rose-800 text-white'
                : 'bg-amber-800 hover:bg-amber-900 text-white'
            }`}
          >
            <span>View Tasks & Log Target</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Active target progress reminder
  const activeTarget = inProgressTargets[0];
  const currentVal = activeTarget.target?.currentValue || 0;
  const maxVal = activeTarget.target?.targetValue || 1;
  const pct = Math.min(100, Math.round((currentVal / maxVal) * 100));

  return (
    <div className="mb-3 p-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-xl bg-emerald-200/80 text-emerald-900 flex items-center justify-center shrink-0 text-base">
          🎯
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-800 text-white px-2 py-0.5 rounded-full">
              In-Progress Target ({pct}%)
            </span>
            <span className="text-xs font-black truncate">{activeTarget.title}</span>
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5 font-medium">
            Progress: <strong>{currentVal} of {maxVal} {activeTarget.target?.unit}</strong> completed.
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpenTasksModal('targets')}
        className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black self-end sm:self-center cursor-pointer shadow-2xs active:scale-95 transition-all flex items-center gap-1"
      >
        <span>Update Progress</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
