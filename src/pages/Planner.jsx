import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { ChevronLeft, ChevronRight, Plus, X, Search, Clock } from 'lucide-react';
import { db } from '../db';
import { CATEGORIES } from '../data/drills';
import DrillCard from '../components/DrillCard';
import CategoryBadge from '../components/CategoryBadge';
import { getWeekStart, getWeekDays, formatDate, getToday } from '../utils';

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Planner() {
  const today = getToday();
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerDay, setPickerDay] = useState(null); // dayOfWeek index to add drill to
  const [pickerSearch, setPickerSearch] = useState('');
  const [pickerCategory, setPickerCategory] = useState('All');

  const currentWeekStart = useMemo(() => {
    const ws = getWeekStart();
    ws.setDate(ws.getDate() + weekOffset * 7);
    return ws;
  }, [weekOffset]);

  const weekDays = useMemo(() => getWeekDays(currentWeekStart), [currentWeekStart]);
  const weekStr = formatDate(currentWeekStart);

  const weekPlan = useLiveQuery(
    () => db.weeklyPlans.where('weekStart').equals(weekStr).first(),
    [weekStr]
  );

  const plannedDrills = useLiveQuery(
    () => (weekPlan ? db.plannedDrills.where('planId').equals(weekPlan.id).toArray() : []),
    [weekPlan]
  );

  const allDrills = useLiveQuery(() => db.drills.toArray());

  const drillMap = useMemo(() => {
    if (!allDrills) return {};
    return Object.fromEntries(allDrills.map((d) => [d.id, d]));
  }, [allDrills]);

  const drillsByDay = useMemo(() => {
    const map = {};
    for (let i = 0; i < 7; i++) map[i] = [];
    if (plannedDrills) {
      for (const pd of plannedDrills) {
        if (map[pd.dayOfWeek]) map[pd.dayOfWeek].push(pd);
      }
    }
    return map;
  }, [plannedDrills]);

  const weekSummary = useMemo(() => {
    if (!plannedDrills) return { count: 0, minutes: 0 };
    let minutes = 0;
    for (const pd of plannedDrills) {
      minutes += pd.targetDuration || 0;
    }
    return { count: plannedDrills.length, minutes };
  }, [plannedDrills]);

  const filteredDrills = useMemo(() => {
    if (!allDrills) return [];
    return allDrills.filter((d) => {
      const matchCat = pickerCategory === 'All' || d.category === pickerCategory;
      const matchSearch = !pickerSearch || d.name.toLowerCase().includes(pickerSearch.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allDrills, pickerSearch, pickerCategory]);

  async function getOrCreatePlan() {
    let plan = await db.weeklyPlans.where('weekStart').equals(weekStr).first();
    if (!plan) {
      const id = crypto.randomUUID();
      await db.weeklyPlans.add({ id, weekStart: weekStr, isTemplate: false, templateName: null });
      plan = { id };
    }
    return plan;
  }

  async function addDrillToDay(drill) {
    const plan = await getOrCreatePlan();
    await db.plannedDrills.add({
      id: crypto.randomUUID(),
      planId: plan.id,
      drillId: drill.id,
      dayOfWeek: pickerDay,
      targetDuration: drill.duration,
      targetReps: null,
    });
    setPickerDay(null);
    setPickerSearch('');
    setPickerCategory('All');
  }

  async function removeDrill(pdId) {
    await db.plannedDrills.delete(pdId);
  }

  const weekLabel = currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (!allDrills) return <div className="p-6" />;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Week Navigation */}
      <div className="flex items-center justify-between pt-2 mb-2">
        <button
          onClick={() => setWeekOffset((o) => o - 1)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors active:scale-90"
          aria-label="Previous week"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold text-gray-900">Week of {weekLabel}</h1>
        </div>
        <button
          onClick={() => setWeekOffset((o) => o + 1)}
          className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors active:scale-90"
          aria-label="Next week"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Summary */}
      <div className="flex items-center justify-center gap-4 text-sm text-gray-500 mb-4">
        <span className="flex items-center gap-1">
          <span className="font-semibold text-gray-700">{weekSummary.count}</span> drills
        </span>
        <span className="text-gray-300">·</span>
        <span className="flex items-center gap-1">
          <Clock size={14} />
          <span className="font-semibold text-gray-700">{weekSummary.minutes}</span> min
        </span>
      </div>

      {/* Day Columns */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1 snap-x">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const isToday = dateStr === today;
          const dayDrills = drillsByDay[i] || [];

          return (
            <div
              key={i}
              className={`flex-shrink-0 w-[180px] md:w-auto md:flex-1 bg-white rounded-xl shadow-sm snap-start ${
                isToday ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {/* Day Header */}
              <div className={`px-3 py-2.5 border-b border-gray-100 rounded-t-xl ${isToday ? 'bg-emerald-50' : ''}`}>
                <p className={`font-semibold text-sm ${isToday ? 'text-emerald-700' : 'text-gray-700'}`}>
                  {DAY_ABBR[i]}
                </p>
                <p className={`text-xs ${isToday ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {day.getDate()}
                </p>
              </div>

              {/* Drills */}
              <div className="p-2 space-y-2 min-h-[100px]">
                {dayDrills.map((pd) => {
                  const drill = drillMap[pd.drillId];
                  if (!drill) return null;
                  return (
                    <div key={pd.id} className="relative group">
                      <DrillCard drill={drill} compact />
                      <button
                        onClick={() => removeDrill(pd.id)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                        aria-label={`Remove ${drill.name}`}
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}

                <button
                  onClick={() => {
                    setPickerDay(i);
                    setPickerSearch('');
                    setPickerCategory('All');
                  }}
                  className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:border-emerald-300 hover:text-emerald-500 transition-colors flex items-center justify-center gap-1"
                  aria-label={`Add drill to ${DAY_ABBR[i]}`}
                >
                  <Plus size={16} />
                  <span className="text-xs font-medium">Add</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Drill Picker Modal */}
      {pickerDay !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setPickerDay(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-900">Add to {DAY_ABBR[pickerDay]}</h3>
                <button onClick={() => setPickerDay(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search drills..."
                  className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 border border-gray-200"
                />
              </div>

              {/* Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                {['All', ...(CATEGORIES || [])].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                      pickerCategory === cat
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {filteredDrills.map((drill) => (
                <DrillCard
                  key={drill.id}
                  drill={drill}
                  compact
                  onAdd={() => addDrillToDay(drill)}
                />
              ))}
              {filteredDrills.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-8">No drills found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
