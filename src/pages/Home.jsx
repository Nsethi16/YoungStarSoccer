import { useState, useMemo, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { quotes } from '../data/motivation';
import { getDailyTip } from '../data/motivation';
import { getToday, getWeekStart, formatDate, formatDateDisplay, getDayOfWeek, getGreeting } from '../utils';
import CategoryBadge from '../components/CategoryBadge';
import PlayerAvatar from '../components/PlayerAvatar';

export default function Home() {
  const today = getToday();
  const weekStart = getWeekStart();
  const dayOfWeek = getDayOfWeek(today);
  const tip = getDailyTip();

  // Cycling motivation quotes
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [fade, setFade] = useState(true);

  const nextQuote = useCallback(() => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex((i) => (i + 1) % quotes.length);
      setFade(true);
    }, 500);
  }, []);

  useEffect(() => {
    const interval = setInterval(nextQuote, 8000);
    return () => clearInterval(interval);
  }, [nextQuote]);

  const quote = quotes[quoteIndex];

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
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto w-full space-y-5">
      {/* Greeting with Avatar */}
      <div className="flex items-center gap-4">
        <PlayerAvatar size="md" />
        <div>
          <h1 className="font-headline font-black text-xl text-kp-on-surface">{getGreeting()}, {playerName}!</h1>
          <p className="text-kp-on-surface-variant text-sm">{formatDateDisplay(today)}</p>
        </div>
      </div>

      {/* Hero / Mantra Section */}
      <section className="relative overflow-hidden rounded-2xl min-h-[140px] flex items-center p-6 bg-kp-surface-low">
        <div className="absolute inset-0 bg-gradient-to-r from-kp-surface via-kp-surface/80 to-transparent z-[1]" />
        <div className="relative z-10 w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-kp-primary-dim font-headline font-black text-[10px] uppercase tracking-[0.3em]">MANTRA</p>
              <button
                onClick={nextQuote}
                className="text-kp-on-surface-variant hover:text-kp-primary-container active:scale-90 transition-all"
                aria-label="Next quote"
              >
                <span className="material-symbols-outlined text-base">refresh</span>
              </button>
            </div>
            <div
              className="transition-all duration-500 ease-in-out"
              style={{ opacity: fade ? 1 : 0, transform: fade ? 'translateY(0)' : 'translateY(8px)' }}
            >
              <h2 className="font-headline font-black text-2xl md:text-3xl leading-[0.9] tracking-tighter italic text-kp-on-surface uppercase">
                "{quote.text}"
              </h2>
              <p className="text-kp-on-surface-variant text-sm mt-2">— {quote.author}</p>
            </div>
          </div>
          <Link
            to="/planner"
            className="pitch-gradient text-kp-on-primary-fixed font-headline font-black px-6 py-3 rounded-full flex items-center gap-2 uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] transition-all active:scale-95 shrink-0"
          >
            Start <span className="material-symbols-outlined font-black text-sm">bolt</span>
          </Link>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-orange-400 text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
          <p className="text-2xl font-headline font-black text-kp-on-surface">{streak}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">Day Streak</p>
        </div>
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-kp-primary-container text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          <p className="text-2xl font-headline font-black text-kp-on-surface">
            {todayDone}/{todayPlanned.length}
          </p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">Today</p>
        </div>
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-blue-400 text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>bar_chart</span>
          <p className="text-2xl font-headline font-black text-kp-on-surface">{weekCompleted}%</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">This Week</p>
        </div>
      </div>

      {/* Today's Drills */}
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="font-headline font-black text-xl uppercase tracking-tighter text-kp-on-surface">Today's Drills</h3>
          {todayPlanned.length > 0 && (
            <Link to="/planner" className="text-kp-on-surface-variant hover:text-kp-primary-container transition-colors font-bold uppercase text-[10px] tracking-widest">
              Edit Routine
            </Link>
          )}
        </div>

        {todayPlanned.length === 0 ? (
          <div className="bg-kp-surface-low rounded-xl p-10 text-center border border-kp-outline-variant/10">
            <span className="material-symbols-outlined text-kp-on-surface-variant text-5xl mb-3">event_note</span>
            <p className="text-kp-on-surface-variant mb-4">No drills planned for today</p>
            <Link
              to="/planner"
              className="inline-flex items-center gap-2 pitch-gradient text-kp-on-primary-fixed font-headline font-black px-6 py-3 rounded-full uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] active:scale-95 transition-all"
            >
              Plan Your Week
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todayPlanned.map((pd, idx) => {
              const drill = drillMap[pd.drillId];
              if (!drill) return null;
              const done = completedIds.has(pd.id);

              return (
                <div
                  key={pd.id}
                  className={`bg-kp-surface-low rounded-xl p-3 border border-kp-outline-variant/10 flex items-center gap-4 transition-all duration-200 ${
                    done ? 'opacity-50' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-kp-surface-high rounded-lg flex items-center justify-center text-kp-primary-dim font-headline font-black text-sm shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-headline font-black text-kp-on-surface truncate ${done ? 'line-through' : ''}`}>
                      {drill.name}
                    </h4>
                    <p className="text-kp-on-surface-variant text-[11px] truncate">
                      {drill.category} · {drill.duration} min
                    </p>
                    {drill.isMeasurable && !done && (
                      <div className="mt-2 flex items-center gap-2">
                        <input
                          type="number"
                          placeholder={drill.measureLabel || 'Value'}
                          value={measuredValues[pd.id] || ''}
                          onChange={(e) => setMeasuredValues((v) => ({ ...v, [pd.id]: e.target.value }))}
                          onClick={(e) => e.stopPropagation()}
                          className="w-24 px-3 py-1.5 text-sm bg-kp-surface-high border border-kp-outline-variant/20 rounded-lg text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 focus:border-transparent"
                        />
                        <span className="text-xs text-kp-on-surface-variant">{drill.measureUnit}</span>
                      </div>
                    )}
                  </div>
                  {!done && (
                    <button
                      onClick={() => markComplete(pd)}
                      className="bg-kp-primary-container text-kp-on-primary-fixed font-headline font-black px-4 py-2 rounded-lg uppercase tracking-widest text-[10px] active:scale-95 transition-all flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">check_circle</span> Record
                    </button>
                  )}
                  {done && (
                    <span className="material-symbols-outlined text-kp-primary-container text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      task_alt
                    </span>
                  )}
                </div>
              );
            })}

            {/* Session Progress Bar */}
            {todayPlanned.length > 0 && (
              <div className="bg-kp-primary-container rounded-xl p-3 flex items-center gap-4">
                <div className="flex-1">
                  <p className="text-kp-on-primary-fixed/70 text-[9px] font-black uppercase tracking-widest mb-1">
                    Session Progress: {todayDone} of {todayPlanned.length}
                  </p>
                  <div className="w-full bg-kp-on-primary-fixed/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-kp-on-primary-fixed h-full transition-all duration-500"
                      style={{ width: `${todayPlanned.length ? (todayDone / todayPlanned.length) * 100 : 0}%` }}
                    />
                  </div>
                </div>
                <Link
                  to="/progress"
                  className="bg-kp-on-primary-fixed text-kp-primary-container font-headline font-black px-3 py-2 rounded-lg uppercase tracking-widest text-[9px]"
                >
                  Summary
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tactic / Tip Section */}
      {tip && (
        <div className="bg-kp-surface-high rounded-2xl p-4 border border-kp-outline-variant/10">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-kp-primary-container text-lg">strategy</span>
            <h3 className="font-headline font-black text-lg uppercase tracking-tighter text-kp-on-surface">
              Tip: {tip.category}
            </h3>
          </div>
          <p className="text-kp-on-surface-variant text-sm leading-relaxed">{tip.text}</p>
        </div>
      )}
    </div>
  );
}
