import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { db } from '../db';
import { CATEGORY_COLORS } from '../data/drills';
import { getToday, getWeekStart, formatDate } from '../utils';

const CHART_TOOLTIP_STYLE = {
  contentStyle: {
    borderRadius: '12px',
    border: 'none',
    boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
    background: '#131c13',
    color: '#e8f0e4',
  },
  itemStyle: { color: '#e8f0e4' },
  labelStyle: { color: '#a5ada2' },
};

export default function Progress() {
  const today = getToday();
  const allLogs = useLiveQuery(() => db.activityLogs.toArray());
  const allDrills = useLiveQuery(() => db.drills.toArray());
  const plannedDrills = useLiveQuery(() => db.plannedDrills.toArray());
  const [selectedMeasurable, setSelectedMeasurable] = useState(null);

  const drillMap = useMemo(() => {
    if (!allDrills) return {};
    return Object.fromEntries(allDrills.map((d) => [d.id, d]));
  }, [allDrills]);

  const completedLogs = useMemo(() => {
    if (!allLogs) return [];
    return allLogs.filter((l) => l.completed);
  }, [allLogs]);

  const streak = useMemo(() => {
    if (completedLogs.length === 0) return 0;
    const logDates = new Set(completedLogs.map((l) => l.date));
    let count = 0;
    const d = new Date(today + 'T00:00:00');
    if (!logDates.has(today)) d.setDate(d.getDate() - 1);
    while (logDates.has(formatDate(d))) {
      count++;
      d.setDate(d.getDate() - 1);
    }
    return count;
  }, [completedLogs, today]);

  const totalDrills = completedLogs.length;

  const totalHours = useMemo(() => {
    let mins = 0;
    for (const log of completedLogs) {
      const drill = drillMap[log.drillId];
      if (drill) mins += drill.duration || 0;
    }
    return (mins / 60).toFixed(1);
  }, [completedLogs, drillMap]);

  const topCategory = useMemo(() => {
    const counts = {};
    for (const log of completedLogs) {
      const drill = drillMap[log.drillId];
      if (drill) counts[drill.category] = (counts[drill.category] || 0) + 1;
    }
    let best = '—';
    let bestCount = 0;
    for (const [cat, count] of Object.entries(counts)) {
      if (count > bestCount) { best = cat; bestCount = count; }
    }
    return best;
  }, [completedLogs, drillMap]);

  const weeklyData = useMemo(() => {
    if (!plannedDrills) return [];
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const ws = getWeekStart();
      ws.setDate(ws.getDate() - i * 7);
      const label = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const weekDates = new Set();
      for (let j = 0; j < 7; j++) {
        const d = new Date(ws);
        d.setDate(d.getDate() + j);
        weekDates.add(formatDate(d));
      }

      const weekLogs = completedLogs.filter((l) => weekDates.has(l.date));

      const pct = plannedDrills.length > 0
        ? Math.min(100, Math.round((weekLogs.length / Math.max(plannedDrills.length / 8, 1)) * 100))
        : weekLogs.length > 0 ? 100 : 0;

      weeks.push({ label, completed: weekLogs.length, pct: Math.min(pct, 100) });
    }
    return weeks;
  }, [completedLogs, plannedDrills]);

  const categoryData = useMemo(() => {
    const counts = {};
    for (const log of completedLogs) {
      const drill = drillMap[log.drillId];
      if (drill) {
        counts[drill.category] = (counts[drill.category] || 0) + (drill.duration || 0);
      }
    }
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      fill: CATEGORY_COLORS[name]?.fill || '#6b7280',
    }));
  }, [completedLogs, drillMap]);

  const measurableDrills = useMemo(() => {
    if (!allDrills) return [];
    return allDrills.filter((d) => d.isMeasurable);
  }, [allDrills]);

  const measurableData = useMemo(() => {
    if (!selectedMeasurable || !allLogs) return { data: [], best: null };
    const logs = allLogs
      .filter((l) => l.drillId === selectedMeasurable && l.measuredValue != null)
      .sort((a, b) => a.date.localeCompare(b.date));

    const data = logs.map((l) => ({
      date: new Date(l.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: l.measuredValue,
    }));

    const best = logs.length > 0
      ? logs.reduce((max, l) => (l.measuredValue > max.measuredValue ? l : max), logs[0])
      : null;

    return { data, best };
  }, [selectedMeasurable, allLogs]);

  if (!allLogs || !allDrills) return <div className="p-6" />;

  if (completedLogs.length === 0) {
    return (
      <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto">
        <h1 className="font-headline font-black text-4xl italic tracking-tighter uppercase text-kp-primary mb-6">Progress</h1>
        <div className="bg-kp-surface-low rounded-xl p-10 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-kp-on-surface-variant text-5xl mb-4">emoji_events</span>
          <p className="text-lg text-kp-on-surface-variant mb-1">No progress yet</p>
          <p className="text-sm text-kp-on-surface-variant/60">Complete some drills to see your progress here!</p>
        </div>
      </div>
    );
  }

  const selectedDrill = selectedMeasurable ? drillMap[selectedMeasurable] : null;

  return (
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto space-y-5">
      <h1 className="font-headline font-black text-4xl italic tracking-tighter uppercase text-kp-primary">Progress</h1>

      {/* Streak Banner */}
      <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 rounded-2xl p-5 flex items-center gap-4 border border-orange-500/20">
        <span className="material-symbols-outlined text-orange-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
        <div>
          <p className="text-3xl font-headline font-black text-kp-on-surface">{streak} Day Streak</p>
          <p className="text-kp-on-surface-variant text-sm">Keep it going!</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-kp-primary-container text-2xl mb-1">fitness_center</span>
          <p className="text-2xl font-headline font-black text-kp-on-surface">{totalDrills}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">Drills Done</p>
        </div>
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-blue-400 text-2xl mb-1">schedule</span>
          <p className="text-2xl font-headline font-black text-kp-on-surface">{totalHours}h</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">Practiced</p>
        </div>
        <div className="bg-kp-surface-container rounded-xl p-4 text-center border border-kp-outline-variant/10">
          <span className="material-symbols-outlined text-amber-400 text-2xl mb-1" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
          <p className="text-lg font-headline font-black text-kp-on-surface leading-tight">{topCategory}</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-kp-on-surface-variant">Top Category</p>
        </div>
      </div>

      {/* Weekly Completion Chart */}
      <div className="bg-kp-surface-container rounded-xl p-5 border border-kp-outline-variant/10">
        <h2 className="font-headline font-black text-kp-on-surface mb-4 uppercase tracking-tighter">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e281e" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#a5ada2' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#a5ada2' }} axisLine={false} tickLine={false} />
            <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [value, 'Drills']} />
            <Bar dataKey="completed" fill="#cafd00" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-kp-surface-container rounded-xl p-5 border border-kp-outline-variant/10">
          <h2 className="font-headline font-black text-kp-on-surface mb-4 uppercase tracking-tighter">Category Breakdown</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [`${value} min`, 'Time']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Measurable Progress */}
      {measurableDrills.length > 0 && (
        <div className="bg-kp-surface-container rounded-xl p-5 border border-kp-outline-variant/10">
          <h2 className="font-headline font-black text-kp-on-surface mb-3 uppercase tracking-tighter">Measurable Progress</h2>

          <div className="relative mb-4">
            <select
              value={selectedMeasurable || ''}
              onChange={(e) => setSelectedMeasurable(e.target.value || null)}
              className="w-full px-4 py-3 bg-kp-surface-high rounded-xl text-sm text-kp-on-surface border border-kp-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 appearance-none"
            >
              <option value="">Select a measurable drill...</option>
              {measurableDrills.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-kp-on-surface-variant pointer-events-none text-lg">expand_more</span>
          </div>

          {selectedMeasurable && measurableData.data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={measurableData.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e281e" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#a5ada2' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#a5ada2' }} axisLine={false} tickLine={false} />
                  <Tooltip {...CHART_TOOLTIP_STYLE} formatter={(value) => [value, selectedDrill?.measureLabel || 'Value']} />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#cafd00"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#cafd00' }}
                    activeDot={{ r: 6, fill: '#cafd00' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {measurableData.best && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <span className="material-symbols-outlined text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>emoji_events</span>
                  <span className="font-headline font-bold text-kp-on-surface">
                    Personal Best: {measurableData.best.measuredValue} {selectedDrill?.measureUnit}
                  </span>
                  <span className="text-kp-on-surface-variant">({measurableData.best.date})</span>
                </div>
              )}
            </>
          ) : selectedMeasurable ? (
            <p className="text-sm text-kp-on-surface-variant text-center py-6">No recorded values yet for this drill</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
