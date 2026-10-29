import React, { useState } from 'react';
import { Farm, User, FarmTask, TaskCategory, TaskPriority, TaskStatus, TaskReminderAudience, TaskReminderTiming } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { 
  X, 
  Plus, 
  CheckSquare, 
  Square, 
  Calendar, 
  Clock, 
  Bell, 
  Target, 
  Users, 
  UserCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Edit3, 
  Trash2, 
  Sparkles, 
  ChevronRight, 
  Filter,
  Check,
  Flame,
  Award
} from 'lucide-react';

interface FarmTasksModalProps {
  farm: Farm;
  currentUser: User;
  onClose: () => void;
  onAddTask: (taskData: Omit<FarmTask, 'id' | 'createdAt' | 'farmId'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<FarmTask>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTargetProgress: (taskId: string, currentValue: number) => void;
  onAcknowledgeReminder: (taskId: string) => void;
  initialFilter?: 'all' | 'sheep' | 'goat' | 'targets' | 'reminders' | 'my_tasks' | 'completed';
}

const TASK_PRESETS: Array<{
  title: string;
  category: TaskCategory;
  species: 'Sheep' | 'Goat' | 'Both' | 'General';
  description: string;
  priority: TaskPriority;
  targetUnit: string;
  defaultTarget: number;
  reminderTiming: TaskReminderTiming;
  reminderAudience: TaskReminderAudience;
  reminderNote: string;
}> = [
  {
    title: 'Autumn Flock Shearing & Fleece Grading',
    category: 'Shearing',
    species: 'Sheep',
    description: 'Shear all mature sheep before the winter cold. Inspect skin, grade raw wool into bags, and weigh fleece batches.',
    priority: 'High',
    targetUnit: 'sheep',
    defaultTarget: 40,
    reminderTiming: '1_day_before',
    reminderAudience: 'all_members',
    reminderNote: 'Clean electric shears, prepare clipper oil, and keep wool bags ready in shed.',
  },
  {
    title: 'Flock Deworming Drench (Albendazole / Ivermectin)',
    category: 'Deworming',
    species: 'Both',
    description: 'Oral broad-spectrum drenching to eradicate gastrointestinal nematodes, tapeworms, and liver flukes in all sheep and goats.',
    priority: 'Urgent',
    targetUnit: 'animals',
    defaultTarget: 50,
    reminderTiming: 'on_due_date',
    reminderAudience: 'all_members',
    reminderNote: 'Administer early morning on empty stomach before grazing.',
  },
  {
    title: 'Hoof Trimming & Foot-Rot Prevention Round',
    category: 'Hoof Trimming',
    species: 'Sheep',
    description: 'Pare overgrown hoof horn, inspect interdigital cleft, and spray copper sulphate or zinc sulphate to prevent flock lameness.',
    priority: 'High',
    targetUnit: 'sheep',
    defaultTarget: 35,
    reminderTiming: '1_day_before',
    reminderAudience: 'assigned_only',
    reminderNote: 'Check specialized hoof shears and wear protective work gloves.',
  },
  {
    title: 'Ectoparasite Anti-Tick & Mite Dip Bath',
    category: 'Dipping & Bath',
    species: 'Goat',
    description: 'Immerse animals in medicated dip trench or power spray with Cypermethrin to eliminate hard ticks, lice, and mange mites.',
    priority: 'Medium',
    targetUnit: 'goats',
    defaultTarget: 30,
    reminderTiming: '2_days_before',
    reminderAudience: 'admins_only',
    reminderNote: 'Check dipping vat drain and ensure plenty of clean water is ready.',
  },
  {
    title: 'Enterotoxemia (ET) / PPR Flock Vaccination Drive',
    category: 'Vaccination',
    species: 'Both',
    description: 'Administer booster vaccination for all weaned kids and lambs to protect against Pulpy Kidney and Goat Plague.',
    priority: 'Urgent',
    targetUnit: 'animals',
    defaultTarget: 45,
    reminderTiming: '2_days_before',
    reminderAudience: 'all_members',
    reminderNote: 'Maintain cold-chain for vaccines at 2°C - 8°C with ice gel packs.',
  },
  {
    title: 'Growing Lambs & Kids 90-Day Weight Target Audit',
    category: 'Weight Check',
    species: 'Both',
    description: 'Weigh all 3-month growing kids and lambs on digital cradle scale. Record Average Daily Gain (ADG) to assess feed conversion.',
    priority: 'Medium',
    targetUnit: 'kids & lambs',
    defaultTarget: 25,
    reminderTiming: '1_day_before',
    reminderAudience: 'all_members',
    reminderNote: 'Test digital scale calibration with a known 5kg test weight.',
  },
  {
    title: 'Breeding Flushing Grain Ration & Mineral Feed',
    category: 'Feeding & Fodder',
    species: 'Both',
    description: 'Distribute supplemental maize, groundnut cake, and mineral mix to ewes and does 3 weeks prior to introducing stud rams/bucks.',
    priority: 'Medium',
    targetUnit: 'kg feed',
    defaultTarget: 150,
    reminderTiming: 'on_due_date',
    reminderAudience: 'assigned_only',
    reminderNote: 'Weigh grain sacks and mix with 2% mineral mixture.',
  },
  {
    title: 'Shed Sanitization & Slatted Floor Disinfection',
    category: 'Pen & Shed Care',
    species: 'Both',
    description: 'Clean dung pellets, scrape slatted floors, wash water troughs, and spread dry lime powder across pens to eliminate ammonia.',
    priority: 'Low',
    targetUnit: 'pens',
    defaultTarget: 4,
    reminderTiming: '1_day_before',
    reminderAudience: 'assigned_only',
    reminderNote: 'Remove flock into outside holding paddock before spraying disinfectant.',
  },
];

export const FarmTasksModal: React.FC<FarmTasksModalProps> = ({
  farm,
  currentUser,
  onClose,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onUpdateTargetProgress,
  onAcknowledgeReminder,
  initialFilter = 'all',
}) => {
  const { t, lang, localeText } = useLanguage();
  const isAdmin = farm.adminUserId === currentUser.id || currentUser.isSuperAdmin;

  const [activeFilter, setActiveFilter] = useState<'all' | 'sheep' | 'goat' | 'targets' | 'reminders' | 'my_tasks' | 'completed'>(initialFilter);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formSpecies, setFormSpecies] = useState<'Sheep' | 'Goat' | 'Both' | 'General'>('Both');
  const [formCategory, setFormCategory] = useState<TaskCategory>('Deworming');
  const [formPriority, setFormPriority] = useState<TaskPriority>('High');
  const [formDueDate, setFormDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [formDueTime, setFormDueTime] = useState('09:00');
  const [formAssignedToUserId, setFormAssignedToUserId] = useState<string>('all');
  
  // Target states
  const [enableTarget, setEnableTarget] = useState(true);
  const [targetValue, setTargetValue] = useState<number>(30);
  const [targetCurrent, setTargetCurrent] = useState<number>(0);
  const [targetUnit, setTargetUnit] = useState<string>('animals');

  // Reminder states
  const [enableReminder, setEnableReminder] = useState(true);
  const [reminderTiming, setReminderTiming] = useState<TaskReminderTiming>('1_day_before');
  const [reminderAudience, setReminderAudience] = useState<TaskReminderAudience>('all_members');
  const [reminderNote, setReminderNote] = useState('');

  // Quick increment progress helper
  const [quickProgressInput, setQuickProgressInput] = useState<{ [taskId: string]: string }>({});

  const tasks = farm.tasks || [];

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'completed') {
      return task.status === 'completed';
    }
    if (activeFilter === 'all') {
      return task.status !== 'cancelled';
    }
    if (activeFilter === 'sheep') {
      return (task.species === 'Sheep' || task.species === 'Both') && task.status !== 'completed';
    }
    if (activeFilter === 'goat') {
      return (task.species === 'Goat' || task.species === 'Both') && task.status !== 'completed';
    }
    if (activeFilter === 'targets') {
      return Boolean(task.target?.enabled) && task.status !== 'completed';
    }
    if (activeFilter === 'reminders') {
      return Boolean(task.reminder?.enabled) && task.status !== 'completed';
    }
    if (activeFilter === 'my_tasks') {
      return (task.assignedToUserId === currentUser.id || !task.assignedToUserId) && task.status !== 'completed';
    }
    return true;
  });

  // Calculate statistics
  const totalTasks = tasks.length;
  const pendingCount = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const targetsCount = tasks.filter(t => t.target?.enabled && t.status !== 'completed').length;
  const remindersCount = tasks.filter(t => t.reminder?.enabled && t.status !== 'completed').length;

  const handleApplyPreset = (preset: typeof TASK_PRESETS[0]) => {
    setFormTitle(preset.title);
    setFormCategory(preset.category);
    setFormSpecies(preset.species);
    setFormDescription(preset.description);
    setFormPriority(preset.priority);
    setEnableTarget(true);
    setTargetValue(preset.defaultTarget);
    setTargetCurrent(0);
    setTargetUnit(preset.targetUnit);
    setEnableReminder(true);
    setReminderTiming(preset.reminderTiming);
    setReminderAudience(preset.reminderAudience);
    setReminderNote(preset.reminderNote);
  };

  const handleSaveTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Please enter a task title.');
      return;
    }

    let assignedName: string | undefined = undefined;
    let assignedUserId: string | undefined = undefined;

    if (formAssignedToUserId === 'all') {
      assignedName = 'All Farm Members';
      assignedUserId = undefined;
    } else {
      const foundMember = farm.members.find(m => m.userId === formAssignedToUserId);
      if (foundMember) {
        assignedName = `${foundMember.name} (${foundMember.role})`;
        assignedUserId = foundMember.userId;
      } else if (farm.adminUserId === formAssignedToUserId) {
        assignedName = `${farm.adminName} (Farm Boss)`;
        assignedUserId = farm.adminUserId;
      }
    }

    const taskPayload: Omit<FarmTask, 'id' | 'createdAt' | 'farmId'> = {
      title: formTitle.trim(),
      description: formDescription.trim() || undefined,
      species: formSpecies,
      category: formCategory,
      priority: formPriority,
      status: targetCurrent >= targetValue && enableTarget ? 'completed' : 'pending',
      assignedToUserId: assignedUserId,
      assignedToName: assignedName,
      dueDate: formDueDate,
      dueTime: formDueTime,
      target: enableTarget ? {
        enabled: true,
        targetValue: Math.max(1, Number(targetValue) || 1),
        currentValue: Math.max(0, Number(targetCurrent) || 0),
        unit: targetUnit.trim() || 'animals',
      } : undefined,
      reminder: {
        enabled: enableReminder,
        audience: reminderAudience,
        timing: reminderTiming,
        customNote: reminderNote.trim() || undefined,
        isAcknowledged: false,
      },
      createdByUserId: currentUser.id,
      createdByUserName: currentUser.name,
    };

    if (editingTaskId) {
      onUpdateTask(editingTaskId, taskPayload);
      setEditingTaskId(null);
    } else {
      onAddTask(taskPayload);
    }

    setShowAddForm(false);
    resetForm();
  };

  const handleStartEdit = (task: FarmTask) => {
    setEditingTaskId(task.id);
    setFormTitle(task.title);
    setFormDescription(task.description || '');
    setFormSpecies(task.species);
    setFormCategory(task.category);
    setFormPriority(task.priority);
    setFormDueDate(task.dueDate);
    setFormDueTime(task.dueTime || '09:00');
    setFormAssignedToUserId(task.assignedToUserId || 'all');
    
    if (task.target) {
      setEnableTarget(task.target.enabled);
      setTargetValue(task.target.targetValue);
      setTargetCurrent(task.target.currentValue);
      setTargetUnit(task.target.unit);
    } else {
      setEnableTarget(false);
      setTargetValue(30);
      setTargetCurrent(0);
      setTargetUnit('animals');
    }

    setEnableReminder(task.reminder.enabled);
    setReminderTiming(task.reminder.timing);
    setReminderAudience(task.reminder.audience);
    setReminderNote(task.reminder.customNote || '');

    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormSpecies('Both');
    setFormCategory('Deworming');
    setFormPriority('High');
    setEnableTarget(true);
    setTargetValue(30);
    setTargetCurrent(0);
    setTargetUnit('animals');
    setEnableReminder(true);
    setReminderTiming('1_day_before');
    setReminderAudience('all_members');
    setReminderNote('');
    setEditingTaskId(null);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1"><Flame className="w-3 h-3 text-rose-600" /> Urgent</span>;
      case 'High':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-200">High Priority</span>;
      case 'Medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-100 text-sky-800 border border-sky-200">Medium</span>;
      case 'Low':
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-stone-100 text-stone-700 border border-stone-200">Routine</span>;
    }
  };

  const getSpeciesBadge = (sp: 'Sheep' | 'Goat' | 'Both' | 'General') => {
    switch (sp) {
      case 'Sheep':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-blue-50 text-blue-900 border border-blue-200">🐑 Sheep Only</span>;
      case 'Goat':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 text-emerald-900 border border-emerald-200">🐐 Goat Only</span>;
      case 'Both':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-purple-50 text-purple-900 border border-purple-200">🐑🐐 Sheep & Goats</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-stone-100 text-stone-700">🚜 Whole Farm</span>;
    }
  };

  const formatDueDiff = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    const diffDays = Math.round((new Date(dateStr).getTime() - new Date(today).getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return <span className="text-rose-700 font-black">Overdue by {Math.abs(diffDays)} day{Math.abs(diffDays) > 1 ? 's' : ''}!</span>;
    if (diffDays === 0) return <span className="text-amber-700 font-black">Due Today!</span>;
    if (diffDays === 1) return <span className="text-amber-600 font-bold">Due Tomorrow</span>;
    return <span className="text-stone-600 font-medium">In {diffDays} days</span>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-stone-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-stone-200 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="px-4 sm:px-6 py-4 bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
              📋
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                  Sheep & Goat Farm Tasks & Targets
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase">
                  Flock Ops
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 font-medium">
                {farm.name} · Targets for shearing, deworming, dipping, and scheduled staff reminders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!showAddForm && (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs cursor-pointer shadow-sm active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Set New Task</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-header Quick Stats & Filter Bar */}
        <div className="border-b border-stone-200 bg-stone-50 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar shrink-0">
          <div className="flex items-center gap-1.5 min-w-max">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              All Tasks ({pendingCount})
            </button>

            <button
              onClick={() => setActiveFilter('sheep')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'sheep'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              🐑 Sheep
            </button>

            <button
              onClick={() => setActiveFilter('goat')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'goat'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              🐐 Goats
            </button>

            <button
              onClick={() => setActiveFilter('targets')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'targets'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Targets ({targetsCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('reminders')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                activeFilter === 'reminders'
                  ? 'bg-purple-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Reminders ({remindersCount})</span>
            </button>

            <button
              onClick={() => setActiveFilter('my_tasks')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'my_tasks'
                  ? 'bg-teal-800 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              👤 My Tasks
            </button>

            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeFilter === 'completed'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              ✓ Completed ({completedCount})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showAddForm) {
                setShowAddForm(false);
              } else {
                resetForm();
                setShowAddForm(true);
              }
            }}
            className="sm:hidden px-2.5 py-1.5 rounded-xl bg-emerald-800 text-white text-xs font-bold shrink-0 cursor-pointer"
          >
            {showAddForm ? 'View List' : '+ Add'}
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* TASK CREATION & EDITING FORM */}
          {showAddForm && (
            <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-4 sm:p-5 space-y-4 animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-center justify-between border-b border-emerald-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">✍️</span>
                  <div>
                    <h3 className="text-sm font-black text-emerald-950">
                      {editingTaskId ? 'Edit Flock Task & Targets' : 'Create New Sheep / Goat Task'}
                    </h3>
                    <p className="text-[11px] text-emerald-800">
                      Specify numerical completion targets and target reminders for admins and workers.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTaskId(null);
                  }}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 cursor-pointer underline"
                >
                  Cancel
                </button>
              </div>

              {/* 1-Tap Quick Presets for Sheep & Goat Ops */}
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  1-Tap Sheep & Goat Preset Templates:
                </label>
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {TASK_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1.5 rounded-xl bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-950 text-xs font-bold whitespace-nowrap cursor-pointer transition-all shadow-2xs hover:scale-102 shrink-0 flex items-center gap-1"
                    >
                      <span>{preset.species === 'Sheep' ? '✂️' : preset.category === 'Deworming' ? '💊' : preset.category === 'Hoof Trimming' ? '🦶' : '🎯'}</span>
                      <span>{preset.title.split(' ')[0]} {preset.title.split(' ')[1]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSaveTask} className="space-y-4">
                {/* Title & Category */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Task Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Shearing 40 Deccani sheep or Pre-monsoon hoof trim"
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="sm:col-span-4">
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Operation Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as TaskCategory)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="Shearing">✂️ {localeText({ en: 'Shearing', hi: 'ऊन कटाई', kn: 'ಉಣ್ಣೆ ಕತ್ತರಿಸುವುದು', te: 'ఉన్ని కత్తిరింపు', ta: 'கம்பளி வெட்டுதல்', ml: 'കമ്പിളി വെട്ടൽ', mr: 'लोकर कातरणे' })}</option>
                      <option value="Deworming">💊 {localeText({ en: 'Deworming', hi: 'कृमिनाशक दवा', kn: 'ಜಂತುಹುಳು ನಿವಾರಣೆ', te: 'నట్టల నివారణ', ta: 'குடற்புழு நீக்கம்', ml: 'വിരയിളക്കൽ', mr: 'जंतनाशक औषध' })}</option>
                      <option value="Hoof Trimming">🦶 {localeText({ en: 'Hoof Trimming', hi: 'खुर कटाई', kn: 'ಗೊರಸು ಕತ್ತರಿಸುವುದು', te: 'గిట్టల కత్తిరింపు', ta: 'குளம்பு வெட்டுதல்', ml: 'കുളമ്പ് വെട്ടൽ', mr: 'खूर छाटणी' })}</option>
                      <option value="Vaccination">💉 {localeText({ en: 'Vaccination', hi: 'टीकाकरण', kn: 'ಲಸಿಕೆ', te: 'టీకా', ta: 'தடுப்பூசி', ml: 'വാക്സിനേഷൻ', mr: 'लसीकरण' })}</option>
                      <option value="Dipping & Bath">🛁 {localeText({ en: 'Dipping & Bath', hi: 'दवा स्नान', kn: 'ಔಷಧ ಸ್ನಾನ', te: 'డిప్పింగ్ స్నానం', ta: 'மருந்து குளியல்', ml: 'മരുന്ന് കുളിപ്പിക്കൽ', mr: 'औषधी आंघोळ' })}</option>
                      <option value="Weight Check">⚖️ {localeText({ en: 'Weight Check', hi: 'वजन नाप', kn: 'ತೂಕ ತಪಾಸಣೆ', te: 'బరువు పరిశీలన', ta: 'எடை சரிபார்ப்பு', ml: 'ഭാര പരിശോധന', mr: 'वजन तपासणी' })}</option>
                      <option value="Breeding & Mating">👑 {localeText({ en: 'Breeding & Mating', hi: 'प्रजनन व गर्भाधान', kn: 'ಸಂತಾನೋತ್ಪತ್ತಿ', te: 'సంతానోత్పత్తి', ta: 'இனப்பெருக்கம்', ml: 'പ്രജനനം', mr: 'प्रजनन आणि वीर्यदान' })}</option>
                      <option value="Feeding & Fodder">🌾 {localeText({ en: 'Feeding & Fodder', hi: 'चारा व दाना', kn: 'ಮೇವು & ಆಹಾರ', te: 'మేత & దాణా', ta: 'தீவனம்', ml: 'തീറ്റ & പുല്ല്', mr: 'चारा आणि खाद्य' })}</option>
                      <option value="Pen & Shed Care">🧹 {localeText({ en: 'Pen & Shed Care', hi: 'बाड़ा सफाई', kn: 'ಶೆಡ್ ಸ್ವಚ್ಛತೆ', te: 'షెడ్డు సంరక్షణ', ta: 'கொட்டகை பராமரிப்பு', ml: 'കൂട് പരിപാലനം', mr: 'गोठा स्वच्छता' })}</option>
                      <option value="General">📋 {localeText({ en: 'General Farm Task', hi: 'सामान्य कार्य', kn: 'ಸಾಮಾನ್ಯ ಕೆಲಸ', te: 'సాధారణ పని', ta: 'பொதுவான பண்ணை பணி', ml: 'പൊതുവായ ഫാം ജോലി', mr: 'सामान्य काम' })}</option>
                    </select>
                  </div>
                </div>

                {/* Species, Priority, Assignee */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Target Species
                    </label>
                    <select
                      value={formSpecies}
                      onChange={(e) => setFormSpecies(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="Sheep">🐑 {localeText({ en: 'Sheep Only', hi: 'केवल भेड़', kn: 'ಕುರಿಗಳು ಮಾತ್ರ', te: 'గొర్రెలు మాత్రమే', ta: 'செம்மறி மட்டுமே', ml: 'ചെമ്മരിയാട് മാത്രം', mr: 'फक्त मेंढ्या' })}</option>
                      <option value="Goat">🐐 {localeText({ en: 'Goat Only', hi: 'केवल बकरी', kn: 'ಆಡುಗಳು ಮಾತ್ರ', te: 'మేకలు మాత్రమే', ta: 'வெள்ளாடு மட்டுமே', ml: 'ആട് മാത്രം', mr: 'फक्त शेळ्या' })}</option>
                      <option value="Both">🐑🐐 {localeText({ en: 'Both (Sheep & Goat Flock)', hi: 'दोनों (भेड़ व बकरी)', kn: 'ಎರಡೂ (ಕುರಿ ಮತ್ತು ಆಡು)', te: 'రెండూ (గొర్రెలు & మేకలు)', ta: 'இரண்டும் (ஆடு & செம்மறி)', ml: 'രണ്ടും (ആടും ചെമ്മരിയാടും)', mr: 'दोन्ही (मेंढ्या आणि शेळ्या)' })}</option>
                      <option value="General">🚜 {localeText({ en: 'Entire Farm', hi: 'पूरा फार्म', kn: 'ಸಂಪೂರ್ಣ ಫಾರ್ಮ್', te: 'మొత్తం ఫామ్', ta: 'முழு பண்ணை', ml: 'മുഴുവൻ ഫാം', mr: 'संपूर्ण फार्म' })}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Priority Level
                    </label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as TaskPriority)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="Urgent">🔴 Urgent (Immediate action)</option>
                      <option value="High">🟠 High Priority</option>
                      <option value="Medium">🟡 Medium Priority</option>
                      <option value="Low">🟢 Routine / Low</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">
                      Assign To Farm Staff / Admin
                    </label>
                    <select
                      value={formAssignedToUserId}
                      onChange={(e) => setFormAssignedToUserId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      <option value="all">👥 All Farm Members (Public Task)</option>
                      <option value={farm.adminUserId}>👑 {farm.adminName} (Farm Boss)</option>
                      {farm.members.map(m => (
                        <option key={m.userId} value={m.userId}>
                          👤 {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* TARGET SECTION (Numerical goals for sheep/goat tasks) */}
                <div className="p-3.5 bg-white rounded-2xl border border-emerald-300 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-black text-stone-900">
                        Set Quantitative Target Goal
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={enableTarget}
                        onChange={(e) => setEnableTarget(e.target.checked)}
                        className="rounded text-emerald-700 focus:ring-emerald-600"
                      />
                      <span>Track Numeric Progress</span>
                    </label>
                  </div>

                  {enableTarget && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-stone-100">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Target Goal Quantity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10000"
                          value={targetValue}
                          onChange={(e) => setTargetValue(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-black text-stone-900 focus:ring-2 focus:ring-emerald-700"
                          placeholder="e.g. 50"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Target Unit
                        </label>
                        <select
                          value={targetUnit}
                          onChange={(e) => setTargetUnit(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 cursor-pointer"
                        >
                          <option value="sheep">{localeText({ en: 'sheep', hi: 'भेड़ें', kn: 'ಕುರಿಗಳು', te: 'గొర్రెలు', ta: 'செம்மறி ஆடுகள்', ml: 'ചെമ്മരിയാടുകൾ', mr: 'मेंढ्या' })}</option>
                          <option value="goats">{localeText({ en: 'goats', hi: 'बकरियां', kn: 'ಆಡುಗಳು', te: 'మేకలు', ta: 'வெள்ளாடுகள்', ml: 'ആടുകൾ', mr: 'शेळ्या' })}</option>
                          <option value="animals">{localeText({ en: 'animals', hi: 'पशु', kn: 'ಪ್ರಾಣಿಗಳು', te: 'పశువులు', ta: 'விலங்குகள்', ml: 'മൃഗങ്ങൾ', mr: 'जनावरे' })}</option>
                          <option value="kids & lambs">{localeText({ en: 'kids & lambs', hi: 'मेमने व बच्चे', kn: 'ಮರಿಗಳು', te: 'పిల్లలు', ta: 'குட்டிகள்', ml: 'കുഞ്ഞുങ്ങൾ', mr: 'कोकरू आणि पिल्ले' })}</option>
                          <option value="kg wool">{localeText({ en: 'kg wool', hi: 'किलो ऊन', kn: 'ಕೆಜಿ ಉಣ್ಣೆ', te: 'కిలో ఉన్ని', ta: 'கிலோ கம்பளி', ml: 'കിലോ കമ്പിളി', mr: 'किलो लोकर' })}</option>
                          <option value="kg feed">{localeText({ en: 'kg feed', hi: 'किलो चारा', kn: 'ಕೆಜಿ ಮೇವು', te: 'కిలో మేత', ta: 'கிலோ தீவனம்', ml: 'കിലോ തീറ്റ', mr: 'किलो चारा' })}</option>
                          <option value="pens">{localeText({ en: 'pens / sheds', hi: 'बाड़े / शेड', kn: 'ಕೊಟ್ಟಿಗೆಗಳು', te: 'షెడ్లు', ta: 'கொட்டகைகள்', ml: 'കൂടുകൾ', mr: 'गोठे' })}</option>
                          <option value="doses">{localeText({ en: 'doses', hi: 'खुराक', kn: 'ಡೋಸ್ಗಳು', te: 'మోతాదులు', ta: 'டோஸ்கள்', ml: 'ഡോസുകൾ', mr: 'डोस' })}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Current Progress Done
                        </label>
                        <input
                          type="number"
                          min="0"
                          max={targetValue}
                          value={targetCurrent}
                          onChange={(e) => setTargetCurrent(Number(e.target.value))}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-black text-stone-900 focus:ring-2 focus:ring-emerald-700"
                          placeholder="e.g. 0"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* DUE DATE & REMINDER SECTION */}
                <div className="p-3.5 bg-white rounded-2xl border border-purple-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-purple-700" />
                      <span className="text-xs font-black text-stone-900">
                        Due Date & Active Reminders for Admins & Users
                      </span>
                    </div>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs font-bold text-stone-700">
                      <input
                        type="checkbox"
                        checked={enableReminder}
                        onChange={(e) => setEnableReminder(e.target.checked)}
                        className="rounded text-purple-700 focus:ring-purple-600"
                      />
                      <span>Send Reminder Alert</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-500" />
                        Target Due Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formDueDate}
                        onChange={(e) => setFormDueDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-stone-500" />
                        Scheduled Time
                      </label>
                      <input
                        type="time"
                        value={formDueTime}
                        onChange={(e) => setFormDueTime(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  {enableReminder && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          When to Notify / Alert
                        </label>
                        <select
                          value={reminderTiming}
                          onChange={(e) => setReminderTiming(e.target.value as TaskReminderTiming)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 cursor-pointer"
                        >
                          <option value="on_due_date">🔔 On Due Date (Morning 8:00 AM)</option>
                          <option value="1_day_before">⏰ 1 Day Before (24 Hours Prior)</option>
                          <option value="2_days_before">📅 2 Days Before</option>
                          <option value="1_week_before">🗓️ 1 Week Before</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Target Reminder Recipient
                        </label>
                        <select
                          value={reminderAudience}
                          onChange={(e) => setReminderAudience(e.target.value as TaskReminderAudience)}
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-800 cursor-pointer"
                        >
                          <option value="all_members">📢 All Farm Members & Workers</option>
                          <option value="admins_only">👑 Farm Admins & Boss Only</option>
                          <option value="assigned_only">👤 Assigned Staff / Herdsman Only</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold text-stone-600 mb-1">
                          Reminder Note / Checklist instructions (Optional)
                        </label>
                        <input
                          type="text"
                          value={reminderNote}
                          onChange={(e) => setReminderNote(e.target.value)}
                          placeholder="e.g. Ensure shears are sharpened; keep tar and antiseptic ready"
                          className="w-full px-3 py-1.5 rounded-xl border border-stone-300 text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Description / Instructions */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    Protocol Details & Observations (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Instructions for herdsmen or veterinarian on flock handling, dosages, or shedding..."
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingTaskId(null);
                    }}
                    className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black shadow-sm cursor-pointer active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{editingTaskId ? 'Save Task Changes' : 'Confirm & Schedule Task'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ACTIVE TASKS LIST */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-3xl border border-dashed border-stone-300 bg-stone-50">
                <div className="text-4xl mb-2">🐑🎯</div>
                <h3 className="text-sm font-black text-stone-800">No Tasks in this Filter</h3>
                <p className="text-xs text-stone-500 max-w-md mx-auto mt-1 mb-4">
                  Keep sheep shearing, flock deworming, hoof trimming, dipping, and weight targets organized with scheduled reminders.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddForm(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Flock Task</span>
                </button>
              </div>
            ) : (
              filteredTasks.map(task => {
                const isCompleted = task.status === 'completed';
                const hasTarget = Boolean(task.target?.enabled && task.target.targetValue > 0);
                const currentVal = task.target?.currentValue || 0;
                const maxVal = task.target?.targetValue || 1;
                const pct = hasTarget ? Math.min(100, Math.round((currentVal / maxVal) * 100)) : 0;
                const isTargetAchieved = hasTarget && currentVal >= maxVal;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl border p-4 transition-all duration-150 ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200 opacity-90'
                        : task.priority === 'Urgent'
                        ? 'bg-white border-rose-200 shadow-sm ring-1 ring-rose-200/50'
                        : 'bg-white border-stone-200 shadow-2xs hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Priority, Species, Due Date */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {getSpeciesBadge(task.species)}
                        {getPriorityBadge(task.priority)}
                        <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-stone-100 text-stone-600">
                          {task.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-xl">
                          <Calendar className="w-3.5 h-3.5 text-stone-500" />
                          <span className="font-bold text-stone-800">{task.dueDate}</span>
                          {task.dueTime && <span className="text-stone-500 font-mono text-[11px]">({task.dueTime})</span>}
                          <span className="mx-0.5 text-stone-300">·</span>
                          {formatDueDiff(task.dueDate)}
                        </div>
                      </div>
                    </div>

                    {/* Task Title and Description */}
                    <div className="flex items-start gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          const newStatus: TaskStatus = isCompleted ? 'in_progress' : 'completed';
                          onUpdateTask(task.id, {
                            status: newStatus,
                            completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
                            completedByUserName: newStatus === 'completed' ? currentUser.name : undefined,
                          });
                        }}
                        className="mt-0.5 text-stone-400 hover:text-emerald-700 transition-colors cursor-pointer shrink-0"
                        title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Square className="w-5 h-5 text-stone-400 hover:text-stone-600" />
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-black text-stone-900 ${isCompleted ? 'line-through text-stone-500' : ''}`}>
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* TARGET PROGRESS TRACKER */}
                        {hasTarget && (
                          <div className="mt-3 p-3 bg-stone-50 rounded-xl border border-stone-200">
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Target className="w-4 h-4 text-emerald-800" />
                                <span className="font-extrabold text-stone-900">
                                  Target Goal: {currentVal} / {maxVal} {task.target?.unit}
                                </span>
                                {isTargetAchieved && (
                                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black uppercase flex items-center gap-0.5">
                                    <Award className="w-2.5 h-2.5" /> Achieved!
                                  </span>
                                )}
                              </div>
                              <span className="font-mono font-black text-emerald-950 text-xs">
                                {pct}%
                              </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-stone-200 h-2.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 rounded-full ${
                                  pct >= 100 
                                    ? 'bg-emerald-600' 
                                    : pct >= 50 
                                    ? 'bg-teal-600' 
                                    : 'bg-amber-500'
                                }`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>

                            {/* Quick Increment Controls for Farm Workers */}
                            {!isCompleted && (
                              <div className="flex flex-wrap items-center justify-between gap-2 mt-2 pt-2 border-t border-stone-200/60">
                                <span className="text-[11px] font-bold text-stone-500">
                                  Quick Log Done:
                                </span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => onUpdateTargetProgress(task.id, currentVal + 1)}
                                    className="px-2 py-1 rounded-lg bg-white border border-stone-300 hover:bg-emerald-50 hover:border-emerald-400 text-xs font-black text-stone-800 cursor-pointer shadow-2xs active:scale-95"
                                  >
                                    +1 {task.target?.unit}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => onUpdateTargetProgress(task.id, currentVal + 5)}
                                    className="px-2 py-1 rounded-lg bg-white border border-stone-300 hover:bg-emerald-50 hover:border-emerald-400 text-xs font-black text-stone-800 cursor-pointer shadow-2xs active:scale-95"
                                  >
                                    +5 {task.target?.unit}
                                  </button>

                                  <div className="flex items-center gap-1">
                                    <input
                                      type="number"
                                      min="0"
                                      max={maxVal}
                                      placeholder="Set"
                                      value={quickProgressInput[task.id] !== undefined ? quickProgressInput[task.id] : ''}
                                      onChange={(e) => setQuickProgressInput({ ...quickProgressInput, [task.id]: e.target.value })}
                                      className="w-14 px-1.5 py-1 text-xs font-mono font-bold border border-stone-300 rounded-lg text-center"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const parsed = parseInt(quickProgressInput[task.id], 10);
                                        if (!isNaN(parsed)) {
                                          onUpdateTargetProgress(task.id, parsed);
                                          setQuickProgressInput({ ...quickProgressInput, [task.id]: '' });
                                        }
                                      }}
                                      className="px-2 py-1 rounded-lg bg-emerald-800 text-white text-[11px] font-black cursor-pointer shadow-2xs"
                                    >
                                      Set
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* REMINDER ALERT & AUDIENCE BADGE */}
                        {task.reminder?.enabled && (
                          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-purple-50/80 border border-purple-200/80 text-[11px]">
                            <div className="flex items-center gap-1.5 text-purple-950 font-bold">
                              <Bell className="w-3.5 h-3.5 text-purple-700 shrink-0" />
                              <span>
                                Reminder: {task.reminder.timing === 'on_due_date' ? 'On Due Date' : task.reminder.timing === '1_day_before' ? '1 Day Prior' : task.reminder.timing === '2_days_before' ? '2 Days Prior' : '1 Week Prior'}
                              </span>
                              <span className="text-purple-400">·</span>
                              <span className="text-purple-800 font-semibold">
                                To: {task.reminder.audience === 'all_members' ? 'All Farm Members' : task.reminder.audience === 'admins_only' ? 'Farm Admins Only' : 'Assigned Staff Only'}
                              </span>
                            </div>

                            {task.reminder.customNote && (
                              <span className="italic text-purple-700 text-[10px] w-full sm:w-auto">
                                "{task.reminder.customNote}"
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer: Assignee & Management Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-stone-100 text-xs">
                          <div className="flex items-center gap-1.5 text-stone-600 font-medium text-[11px]">
                            <UserCheck className="w-3.5 h-3.5 text-emerald-800" />
                            <span>
                              {task.assignedToName ? `Assigned: ${task.assignedToName}` : 'Open to All Farm Workers'}
                            </span>
                            <span className="text-stone-300">·</span>
                            <span className="text-stone-400">
                              By {task.createdByUserName}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(task)}
                              className="p-1 rounded hover:bg-stone-100 text-stone-500 hover:text-stone-900 cursor-pointer transition-colors"
                              title="Edit Task"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            {isAdmin && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Delete flock task "${task.title}"?`)) {
                                    onDeleteTask(task.id);
                                  }
                                }}
                                className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-700 cursor-pointer transition-colors"
                                title="Delete Task"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
          <div className="text-xs font-bold text-stone-600">
            {pendingCount} active task{pendingCount === 1 ? '' : 's'} · {completedCount} completed
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-black cursor-pointer shadow-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
