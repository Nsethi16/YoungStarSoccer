import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CATEGORIES } from '../data/drills';
import DrillCard from '../components/DrillCard';
import CategoryBadge from '../components/CategoryBadge';
import { getWeekStart, getWeekDays, formatDate, getToday } from '../utils';

const DAY_ABBR = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

export default function Planner() {
  const today = getToday();
  const [weekOffset, setWeekOffset] = useState(0);
  const [pickerDay, setPickerDay] = useState(null);
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

  const weekEndDate = new Date(currentWeekStart);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  const weekLabel = `${currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} — ${weekEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

  if (!allDrills) return <div className="p-6" />;

  return (
    <div className="px-4 md:px-8 pt-6 max-w-[1600px] mx-auto">
      {/* Header & Week Selector */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-headline font-black text-5xl md:text-7xl italic tracking-tighter uppercase leading-none text-kp-primary">
            Weekly<br />Tactics
          </h1>
          <p className="text-kp-on-surface-variant text-sm mt-2">
            <span className="font-bold text-kp-on-surface">{weekSummary.count}</span> drills ·{' '}
            <span className="font-bold text-kp-on-surface">{weekSummary.minutes}</span> min
          </p>
        </div>
        <div className="flex items-center bg-kp-surface-high rounded-full p-1.5 gap-2 w-fit">
          <button
            onClick={() => setWeekOffset((o) => o - 1)}
            className="p-1.5 hover:bg-kp-surface-variant rounded-full transition-all text-kp-on-surface"
          >
            <span className="material-symbols-outlined text-xl">chevron_left</span>
          </button>
          <div className="px-3 font-headline font-bold text-xs tracking-widest uppercase text-kp-on-surface">
            {weekLabel}
          </div>
          <button
            onClick={() => setWeekOffset((o) => o + 1)}
            className="p-1.5 hover:bg-kp-surface-variant rounded-full transition-all text-kp-on-surface"
          >
            <span className="material-symbols-outlined text-xl">chevron_right</span>
          </button>
        </div>
      </section>

      {/* Calendar Grid */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-3 min-h-[500px] pb-24">
        {weekDays.map((day, i) => {
          const dateStr = formatDate(day);
          const isToday = dateStr === today;
          const dayDrills = drillsByDay[i] || [];

          return (
            <div
              key={i}
              className={`md:col-span-1 rounded-xl p-3 flex flex-col gap-3 ${
                isToday
                  ? 'bg-kp-surface-container border-t-4 border-kp-primary shadow-lg'
                  : 'bg-kp-surface-low'
              }`}
            >
              {/* Day Header */}
              <div className="flex justify-between items-center">
                <div className={`font-headline font-black text-xl italic ${isToday ? 'text-kp-primary' : 'text-kp-on-surface-variant'}`}>
                  {DAY_ABBR[i]}
                </div>
                {isToday ? (
                  <div className="w-7 h-7 rounded-full bg-kp-primary-container text-kp-on-primary-fixed flex items-center justify-center font-bold text-[10px]">
                    {day.getDate()}
                  </div>
                ) : (
                  <div className="font-bold text-[10px] text-kp-on-surface-variant">{day.getDate()}</div>
                )}
              </div>

              {/* Drills */}
              <div className="flex flex-col gap-2">
                {dayDrills.map((pd) => {
                  const drill = drillMap[pd.drillId];
                  if (!drill) return null;
                  return (
                    <div key={pd.id} className={`${isToday ? 'bg-kp-surface-highest' : 'bg-kp-surface-high'} p-3 rounded-lg relative overflow-hidden group border border-kp-outline-variant/10`}>
                      <div className="absolute top-0 left-0 w-1 h-full bg-kp-primary-container" />
                      <div className="flex justify-between items-start mb-1">
                        <CategoryBadge category={drill.category} size="sm" />
                        <button
                          onClick={() => removeDrill(pd.id)}
                          className="text-kp-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity hover:text-kp-error"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                      <h4 className="font-headline font-bold text-xs text-kp-on-surface">{drill.name}</h4>
                      <span className="text-[10px] text-kp-on-surface-variant">{drill.duration}m</span>
                    </div>
                  );
                })}
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  setPickerDay(i);
                  setPickerSearch('');
                  setPickerCategory('All');
                }}
                className="mt-auto w-full py-2 border-2 border-dashed border-kp-outline-variant/20 hover:border-kp-primary-dim hover:bg-kp-surface-variant/30 transition-all rounded-lg flex items-center justify-center text-kp-outline-variant"
              >
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          // Open picker for today's day
          const todayDow = getDayOfWeek(today);
          setPickerDay(todayDow >= 0 && todayDow <= 6 ? todayDow : 0);
          setPickerSearch('');
          setPickerCategory('All');
        }}
        className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-kp-primary-container text-kp-on-primary-fixed rounded-full shadow-[0_20px_40px_rgba(202,253,0,0.3)] flex items-center justify-center active:scale-90 transition-all z-40 group"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add</span>
      </button>

      {/* Drill Picker Modal */}
      {pickerDay !== null && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setPickerDay(null)}>
          <div
            className="bg-kp-surface-container rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-kp-outline-variant/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-kp-outline-variant/10">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-headline font-black text-kp-on-surface">Add to {DAY_ABBR[pickerDay]}</h3>
                <button onClick={() => setPickerDay(null)} className="p-2 hover:bg-kp-surface-variant rounded-full transition-colors text-kp-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-3">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-kp-on-surface-variant text-lg">search</span>
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Search drills..."
                  className="w-full pl-10 pr-4 py-2.5 bg-kp-surface-high rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 border border-kp-outline-variant/10 placeholder:text-kp-on-surface-variant"
                />
              </div>

              {/* Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {['All', ...(CATEGORIES || [])].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setPickerCategory(cat)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 ${
                      pickerCategory === cat
                        ? 'bg-kp-primary text-kp-on-primary'
                        : 'bg-kp-surface-high text-kp-on-surface-variant'
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
                <p className="text-center text-sm text-kp-on-surface-variant py-8">No drills found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getDayOfWeek(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}
