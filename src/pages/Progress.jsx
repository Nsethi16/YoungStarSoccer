import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Flame, Trophy, Clock, Dumbbell, ChevronDown } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { db } from '../db';
import { CATEGORY_COLORS } from '../data/drills';
import { getToday, getWeekStart, formatDate } from '../utils';

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

  // Streak calculation
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

  // Total stats
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

  // Weekly completion chart (last 8 weeks)
  const weeklyData = useMemo(() => {
    if (!plannedDrills) return [];
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const ws = getWeekStart();
      ws.setDate(ws.getDate() - i * 7);
      const label = ws.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekEnd = new Date(ws);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekDates = new Set();
      for (let j = 0; j < 7; j++) {
        const d = new Date(ws);
        d.setDate(d.getDate() + j);
        weekDates.add(formatDate(d));
      }

      const weekLogs = completedLogs.filter((l) => weekDates.has(l.date));
      // Find planned drills for this week
      const wsStr = formatDate(ws);
      const weekPlannedCount = plannedDrills.length > 0
        ? Math.max(weekLogs.length, 1) // simple approximation
        : 1;

      const pct = plannedDrills.length > 0
        ? Math.min(100, Math.round((weekLogs.length / Math.max(plannedDrills.length / 8, 1)) * 100))
        : weekLogs.length > 0 ? 100 : 0;

      weeks.push({ label, completed: weekLogs.length, pct: Math.min(pct, 100) });
    }
    return weeks;
  }, [completedLogs, plannedDrills]);

  // Category breakdown
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

  // Measurable drills
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
      <div className="p-4 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 pt-2 mb-6">Progress</h1>
        <div className="bg-white rounded-xl shadow-sm p-10 text-center">
          <Trophy size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-lg text-gray-500 mb-1">No progress yet</p>
          <p className="text-sm text-gray-400">Complete some drills to see your progress here!</p>
        </div>
      </div>
    );
  }

  const selectedDrill = selectedMeasurable ? drillMap[selectedMeasurable] : null;

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 pt-2">Progress</h1>

      {/* Streak Banner */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white flex items-center gap-4 shadow-md">
        <Flame size={40} strokeWidth={1.5} />
        <div>
          <p className="text-3xl font-bold">{streak} Day Streak</p>
          <p className="text-amber-100 text-sm">Keep it going!</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Dumbbell size={20} className="mx-auto text-emerald-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{totalDrills}</p>
          <p className="text-xs text-gray-500">Drills Done</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Clock size={20} className="mx-auto text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-gray-900">{totalHours}h</p>
          <p className="text-xs text-gray-500">Practiced</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4 text-center">
          <Trophy size={20} className="mx-auto text-amber-500 mb-1" />
          <p className="text-lg font-bold text-gray-900 leading-tight">{topCategory}</p>
          <p className="text-xs text-gray-500">Top Category</p>
        </div>
      </div>

      {/* Weekly Completion Chart */}
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Weekly Activity</h2>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value) => [value, 'Drills']}
            />
            <Bar dataKey="completed" fill="#059669" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Breakdown */}
      {categoryData.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-4">Category Breakdown</h2>
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
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                formatter={(value) => [`${value} min`, 'Time']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Measurable Progress */}
      {measurableDrills.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-5">
          <h2 className="font-bold text-gray-900 mb-3">Measurable Progress</h2>

          <div className="relative mb-4">
            <select
              value={selectedMeasurable || ''}
              onChange={(e) => setSelectedMeasurable(e.target.value || null)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none"
            >
              <option value="">Select a measurable drill...</option>
              {measurableDrills.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>

          {selectedMeasurable && measurableData.data.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={measurableData.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    formatter={(value) => [value, selectedDrill?.measureLabel || 'Value']}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#059669"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#059669' }}
                    activeDot={{ r: 6, fill: '#059669' }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {measurableData.best && (
                <div className="mt-3 flex items-center gap-2 text-sm">
                  <Trophy size={16} className="text-amber-500" />
                  <span className="font-semibold text-gray-900">
                    Personal Best: {measurableData.best.measuredValue} {selectedDrill?.measureUnit}
                  </span>
                  <span className="text-gray-400">({measurableData.best.date})</span>
                </div>
              )}
            </>
          ) : selectedMeasurable ? (
            <p className="text-sm text-gray-400 text-center py-6">No recorded values yet for this drill</p>
          ) : null}
        </div>
      )}
    </div>
  );
}
