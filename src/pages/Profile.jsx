import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Edit3, Plus, X, Download, Lock, Check } from 'lucide-react';
import { db } from '../db';
import { getToday, formatDate } from '../utils';

const ACHIEVEMENT_DEFS = [
  { type: 'first-drill', title: 'First Step', desc: 'Complete your first drill', icon: '⚽' },
  { type: '7-day-streak', title: 'On Fire', desc: '7 day streak', icon: '🔥' },
  { type: '30-day-streak', title: 'Dedicated', desc: '30 day streak', icon: '💪' },
  { type: 'century', title: 'Century', desc: '100 drills completed', icon: '💯' },
  { type: 'all-rounder', title: 'All-Rounder', desc: 'Practice all categories', icon: '🌟' },
  { type: 'personal-best', title: 'Record Breaker', desc: 'Set a personal best', icon: '🏆' },
];

export default function Profile() {
  const player = useLiveQuery(() => db.player.get('default'));
  const allLogs = useLiveQuery(() => db.activityLogs.toArray());
  const allDrills = useLiveQuery(() => db.drills.toArray());
  const earnedAchievements = useLiveQuery(() => db.achievements.toArray());

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newGoal, setNewGoal] = useState('');

  function startEdit() {
    setEditForm({
      name: player?.name || '',
      age: player?.age || '',
      position: player?.position || '',
    });
    setEditing(true);
  }

  async function saveEdit() {
    await db.player.update('default', {
      name: editForm.name,
      age: Number(editForm.age) || null,
      position: editForm.position,
    });
    setEditing(false);
  }

  async function addGoal() {
    if (!newGoal.trim()) return;
    const goals = [...(player?.goals || []), newGoal.trim()];
    await db.player.update('default', { goals });
    setNewGoal('');
  }

  async function removeGoal(index) {
    const goals = [...(player?.goals || [])];
    goals.splice(index, 1);
    await db.player.update('default', { goals });
  }

  // Achievement checking
  const earnedTypes = useMemo(() => {
    if (!earnedAchievements) return new Set();
    return new Set(earnedAchievements.map((a) => a.type));
  }, [earnedAchievements]);

  const earnedMap = useMemo(() => {
    if (!earnedAchievements) return {};
    return Object.fromEntries(earnedAchievements.map((a) => [a.type, a]));
  }, [earnedAchievements]);

  // Check and award new achievements
  useMemo(() => {
    if (!allLogs || !allDrills || !earnedAchievements) return;
    const completed = allLogs.filter((l) => l.completed);
    const checks = [];

    // First drill
    if (completed.length >= 1 && !earnedTypes.has('first-drill')) {
      checks.push({ type: 'first-drill', title: 'First Step' });
    }

    // Century
    if (completed.length >= 100 && !earnedTypes.has('century')) {
      checks.push({ type: 'century', title: 'Century' });
    }

    // Streaks
    const today = getToday();
    const logDates = new Set(completed.map((l) => l.date));
    let streak = 0;
    const d = new Date(today + 'T00:00:00');
    if (!logDates.has(today)) d.setDate(d.getDate() - 1);
    while (logDates.has(formatDate(d))) {
      streak++;
      d.setDate(d.getDate() - 1);
    }

    if (streak >= 7 && !earnedTypes.has('7-day-streak')) {
      checks.push({ type: '7-day-streak', title: 'On Fire' });
    }
    if (streak >= 30 && !earnedTypes.has('30-day-streak')) {
      checks.push({ type: '30-day-streak', title: 'Dedicated' });
    }

    // All-rounder
    const drillMap = Object.fromEntries(allDrills.map((d) => [d.id, d]));
    const cats = new Set(completed.map((l) => drillMap[l.drillId]?.category).filter(Boolean));
    if (cats.size >= 8 && !earnedTypes.has('all-rounder')) {
      checks.push({ type: 'all-rounder', title: 'All-Rounder' });
    }

    // Personal best (check if any measurable logs exist with values)
    const measuredLogs = allLogs.filter((l) => l.measuredValue != null);
    if (measuredLogs.length >= 2 && !earnedTypes.has('personal-best')) {
      // Group by drill, check if latest > any previous
      const byDrill = {};
      for (const l of measuredLogs) {
        if (!byDrill[l.drillId]) byDrill[l.drillId] = [];
        byDrill[l.drillId].push(l);
      }
      for (const logs of Object.values(byDrill)) {
        if (logs.length >= 2) {
          logs.sort((a, b) => a.date.localeCompare(b.date));
          const latest = logs[logs.length - 1].measuredValue;
          const prevBest = Math.max(...logs.slice(0, -1).map((l) => l.measuredValue));
          if (latest > prevBest) {
            checks.push({ type: 'personal-best', title: 'Record Breaker' });
            break;
          }
        }
      }
    }

    // Award achievements
    for (const ach of checks) {
      db.achievements.add({
        id: crypto.randomUUID(),
        type: ach.type,
        title: ach.title,
        earnedDate: today,
      });
    }
  }, [allLogs, allDrills, earnedAchievements, earnedTypes]);

  async function exportData() {
    const data = {
      player: await db.player.toArray(),
      drills: await db.drills.toArray(),
      weeklyPlans: await db.weeklyPlans.toArray(),
      plannedDrills: await db.plannedDrills.toArray(),
      activityLogs: await db.activityLogs.toArray(),
      achievements: await db.achievements.toArray(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `youngstar-data-${getToday()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!player) return <div className="p-6" />;

  const initials = (player.name || 'P')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-4 max-w-2xl mx-auto space-y-5">
      <h1 className="text-2xl font-bold text-gray-900 pt-2">Profile</h1>

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl font-bold mx-auto mb-4">
          {initials}
        </div>

        {editing ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <input
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Age"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
              min={5}
              max={20}
            />
            <input
              type="text"
              value={editForm.position}
              onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="Position (e.g., Midfielder)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-900">{player.name || 'Player'}</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              {player.age ? `${player.age} years old` : ''}
              {player.age && player.position ? ' · ' : ''}
              {player.position || ''}
            </p>
            <button
              onClick={startEdit}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium hover:text-emerald-700 transition-colors px-4 py-2"
            >
              <Edit3 size={14} />
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Goals */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-gray-900">My Goals</h2>
        </div>

        {player.goals && player.goals.length > 0 ? (
          <div className="space-y-2 mb-3">
            {player.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <span className="text-emerald-500 flex-shrink-0">🎯</span>
                <span className="flex-1 text-sm text-gray-700">{goal}</span>
                <button
                  onClick={() => removeGoal(i)}
                  className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  aria-label="Remove goal"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-400 mb-3">No goals set yet. Add one below!</p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Add a goal..."
            className="flex-1 px-4 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            onClick={addGoal}
            disabled={!newGoal.trim()}
            className="px-4 py-2.5 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="font-bold text-gray-900 mb-4">Achievements</h2>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENT_DEFS.map((ach) => {
            const earned = earnedTypes.has(ach.type);
            const earnedData = earnedMap[ach.type];

            return (
              <div
                key={ach.type}
                className={`text-center p-3 rounded-xl transition-all duration-200 ${
                  earned ? 'bg-emerald-50' : 'bg-gray-50 opacity-50'
                }`}
              >
                <div className={`text-3xl mb-1.5 ${earned ? '' : 'grayscale'}`}>
                  {earned ? ach.icon : <Lock size={24} className="mx-auto text-gray-400" />}
                </div>
                <p className={`text-xs font-semibold ${earned ? 'text-gray-900' : 'text-gray-500'}`}>
                  {ach.title}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">{ach.desc}</p>
                {earned && earnedData && (
                  <p className="text-[10px] text-emerald-600 font-medium mt-1">
                    {new Date(earnedData.earnedDate + 'T00:00:00').toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Export */}
      <button
        onClick={exportData}
        className="w-full flex items-center justify-center gap-2 bg-white rounded-xl shadow-sm py-4 text-sm font-medium text-gray-700 hover:bg-gray-50 active:scale-[0.98] transition-all duration-200"
      >
        <Download size={18} />
        Export My Data
      </button>

      {/* App Info */}
      <p className="text-center text-xs text-gray-400 pb-4">YoungStar Soccer v1.0</p>
    </div>
  );
}
