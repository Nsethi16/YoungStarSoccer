import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, CheckCircle2, BarChart3, Calendar, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { getDailyQuote, getDailyTip } from '../data/motivation';
import { getToday, getWeekStart, formatDate, formatDateDisplay, getDayOfWeek, getGreeting } from '../utils';
import CategoryBadge from '../components/CategoryBadge';

export default function Home() {
  const today = getToday();
  const weekStart = getWeekStart();
  const dayOfWeek = getDayOfWeek(today);
  const quote = getDailyQuote();
  const tip = getDailyTip();

  const player = useLiveQuery(() => db.player.get('default'));
  const allDrills = useLiveQuery(() => db.drills.toArray());
  const weekPlan = useLiveQuery(() => db.weeklyPlans.where('weekStart').equals(formatDate(weekStart)).first());
  const plannedDrills = useLiveQuery(
    () => (weekPlan ? db.plannedDrills.where('planId').equals(weekPlan.id).toArray() : []),
    [weekPlan]
  );
  const todayLogs = useLiveQuery(() => db.activityLogs.where('date').equals(today).toArray(), [today]);
  const allLogs = useLiveQuery(() => db.activityLogs.toArray());

  const [measuredValues, setMeasuredValues] = useState({});

  const drillMap = useMemo(() => {
    if (!allDrills) return {};
    return Object.fromEntries(allDrills.map((d) => [d.id, d]));
  }, [allDrills]);

  const todayPlanned = useMemo(() => {
    if (!plannedDrills) return [];
    return plannedDrills.filter((pd) => pd.dayOfWeek === dayOfWeek);
  }, [plannedDrills, dayOfWeek]);

  const completedIds = useMemo(() => {
    if (!todayLogs) return new Set();
    return new Set(todayLogs.filter((l) => l.completed).map((l) => l.plannedDrillId));
  }, [todayLogs]);

  const weekCompleted = useMemo(() => {
    if (!allLogs || !plannedDrills) return 0;
    const weekDates = new Set();
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      weekDates.add(formatDate(d));
    }
    const weekLogs = allLogs.filter((l) => weekDates.has(l.date) && l.completed);
    if (!plannedDrills.length) return 0;
    return Math.round((weekLogs.length / plannedDrills.length) * 100);
  }, [allLogs, plannedDrills, weekStart]);

  const streak = useMemo(() => {
    if (!allLogs || allLogs.length === 0) return 0;
    const logDates = new Set(allLogs.filter((l) => l.completed).map((l) => l.date));
    let count = 0;
    const d = new Date(today + 'T00:00:00');
    // Check if today has logs; if not, start from yesterday
    if (!logDates.has(today)) {
      d.setDate(d.getDate() - 1);
    }
    while (logDates.has(formatDate(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [allLogs, today]);

  async function markComplete(pd) {
    const drill = drillMap[pd.drillId];
    const value = measuredValues[pd.id] || null;
    await db.activityLogs.add({
      id: crypto.randomUUID(),
      plannedDrillId: pd.id,
      drillId: pd.drillId,
      date: today,
      completed: true,
      measuredValue: drill?.isMeasurable && value ? Number(value) : null,
      notes: null,
    });
  }

  if (!allDrills || todayLogs === undefined) {
    return <div className="p-6" />;
  }

  const playerName = player?.name || 'Player';
  const todayDone = todayPlanned.filter((pd) => completedIds.has(pd.id)).length;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {playerName}! ⚽
        </h1>
        <p className="text-gray-500 mt-0.5">{formatDateDisplay(today)}</p>
      </div>

      {/* Motivation Card */}
      <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-md">
        <p className="text-lg italic leading-relaxed">"{quote.text}"</p>
        <p className="text-right text-emerald-200 text-sm mt-2">— {quote.author}</p>
      </div>

      {/* Daily Tip */}
      {tip && (
        <div className="bg-white rounded-xl shadow-sm p-4 flex items-start gap-3">
          <span className="text-xl">💡</span>
          <div>
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-0.5">Daily Tip</p>
            <p className="text-sm text-gray-700">{tip.text}</p>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Flame size={22} className="mx-auto text-orange-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{streak}</p>
          <p className="text-xs text-gray-500">Day Streak</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <CheckCircle2 size={22} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">
            {todayDone}/{todayPlanned.length}
          </p>
          <p className="text-xs text-gray-500">Today</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <BarChart3 size={22} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{weekCompleted}%</p>
          <p className="text-xs text-gray-500">This Week</p>
        </div>
      </div>

      {/* Today's Plan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-900">Today's Plan</h2>
          {todayPlanned.length > 0 && (
            <span className="text-sm text-gray-500">
              {todayDone} of {todayPlanned.length} done
            </span>
          )}
        </div>

        {todayPlanned.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <Calendar size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 mb-4">No drills planned for today</p>
            <Link
              to="/planner"
              className="inline-flex items-center gap-1.5 bg-emerald-500 text-white font-semibold px-5 py-3 rounded-xl hover:bg-emerald-600 active:scale-95 transition-all duration-200"
            >
              Plan Your Week
              <ChevronRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {todayPlanned.map((pd) => {
              const drill = drillMap[pd.drillId];
              if (!drill) return null;
              const done = completedIds.has(pd.id);

              return (
                <div
                  key={pd.id}
                  className={`bg-white rounded-xl shadow-sm p-4 flex items-center gap-3 transition-all duration-200 ${
                    done ? 'opacity-60 bg-emerald-50/50' : ''
                  }`}
                >
                  <button
                    onClick={() => !done && markComplete(pd)}
                    disabled={done}
                    className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      done
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400 active:scale-90'
                    }`}
                    aria-label={done ? 'Completed' : `Complete ${drill.name}`}
                  >
                    {done && <CheckCircle2 size={16} strokeWidth={3} />}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`font-semibold text-gray-900 ${done ? 'line-through' : ''}`}>
                        {drill.name}
                      </span>
                      <CategoryBadge category={drill.category} size="sm" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{drill.duration} min</p>

                    {drill.isMeasurable && !done && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={drill.measureLabel || 'Value'}
                          value={measuredValues[pd.id] || ''}
                          onChange={(e) => setMeasuredValues((v) => ({ ...v, [pd.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-24 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        />
                        <span className="text-xs text-gray-500">{drill.measureUnit}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
