import { useState, useMemo, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { getToday, formatDate } from '../utils';
import { setPin, getPin, useAuth } from '../components/PinGate';
import PlayerAvatar from '../components/PlayerAvatar';

const ACHIEVEMENT_DEFS = [
  { type: 'first-drill', title: 'First Step', desc: 'Complete your first drill', icon: 'sports_soccer' },
  { type: '7-day-streak', title: 'On Fire', desc: '7 day streak', icon: 'local_fire_department' },
  { type: '30-day-streak', title: 'Dedicated', desc: '30 day streak', icon: 'fitness_center' },
  { type: 'century', title: 'Century', desc: '100 drills completed', icon: 'military_tech' },
  { type: 'all-rounder', title: 'All-Rounder', desc: 'Practice all categories', icon: 'star' },
  { type: 'personal-best', title: 'Record Breaker', desc: 'Set a personal best', icon: 'emoji_events' },
];

export default function Profile() {
  const player = useLiveQuery(() => db.player.get('default'));
  const allLogs = useLiveQuery(() => db.activityLogs.toArray());
  const allDrills = useLiveQuery(() => db.drills.toArray());
  const earnedAchievements = useLiveQuery(() => db.achievements.toArray());

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newGoal, setNewGoal] = useState('');
  const [showPinChange, setShowPinChange] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [pinMsg, setPinMsg] = useState('');
  const { lock } = useAuth();
  const fileInputRef = useRef(null);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      // Resize to max 256px to keep IndexedDB lean
      const img = new Image();
      img.onload = async () => {
        const max = 256;
        const scale = Math.min(max / img.width, max / img.height, 1);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        await db.player.update('default', { avatarUrl: dataUrl });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function removeAvatar() {
    await db.player.update('default', { avatarUrl: null });
  }

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

  const earnedTypes = useMemo(() => {
    if (!earnedAchievements) return new Set();
    return new Set(earnedAchievements.map((a) => a.type));
  }, [earnedAchievements]);

  const earnedMap = useMemo(() => {
    if (!earnedAchievements) return {};
    return Object.fromEntries(earnedAchievements.map((a) => [a.type, a]));
  }, [earnedAchievements]);

  useMemo(() => {
    if (!allLogs || !allDrills || !earnedAchievements) return;
    const completed = allLogs.filter((l) => l.completed);
    const checks = [];

    if (completed.length >= 1 && !earnedTypes.has('first-drill')) {
      checks.push({ type: 'first-drill', title: 'First Step' });
    }
    if (completed.length >= 100 && !earnedTypes.has('century')) {
      checks.push({ type: 'century', title: 'Century' });
    }

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

    const drillMap = Object.fromEntries(allDrills.map((d) => [d.id, d]));
    const cats = new Set(completed.map((l) => drillMap[l.drillId]?.category).filter(Boolean));
    if (cats.size >= 8 && !earnedTypes.has('all-rounder')) {
      checks.push({ type: 'all-rounder', title: 'All-Rounder' });
    }

    const measuredLogs = allLogs.filter((l) => l.measuredValue != null);
    if (measuredLogs.length >= 2 && !earnedTypes.has('personal-best')) {
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
    a.download = `bix-data-${getToday()}.json`;
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
    <div className="px-4 md:px-8 py-6 max-w-[1600px] mx-auto space-y-5">
      <h1 className="font-headline font-black text-4xl italic tracking-tighter uppercase text-kp-primary">Settings</h1>

      {/* Profile Card */}
      <div className="bg-kp-surface-container rounded-2xl p-6 text-center border border-kp-outline-variant/10">
        <div className="relative w-20 h-20 mx-auto mb-4">
          <PlayerAvatar size="lg" />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-kp-primary-container text-kp-on-primary-fixed flex items-center justify-center shadow-lg active:scale-90 transition-all"
          >
            <span className="material-symbols-outlined text-sm">photo_camera</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
        {player.avatarUrl && (
          <button onClick={removeAvatar} className="text-[10px] text-kp-on-surface-variant hover:text-kp-error font-bold uppercase tracking-widest mb-2 transition-colors">
            Remove Photo
          </button>
        )}

        {editing ? (
          <div className="space-y-3 max-w-xs mx-auto">
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Name"
              className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface text-center focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
            />
            <input
              type="number"
              value={editForm.age}
              onChange={(e) => setEditForm((f) => ({ ...f, age: e.target.value }))}
              placeholder="Age"
              className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface text-center focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
              min={5}
              max={20}
            />
            <input
              type="text"
              value={editForm.position}
              onChange={(e) => setEditForm((f) => ({ ...f, position: e.target.value }))}
              placeholder="Position (e.g., Midfielder)"
              className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface text-center focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setEditing(false)}
                className="flex-1 py-2.5 border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 py-2.5 pitch-gradient text-kp-on-primary-fixed rounded-xl text-sm font-headline font-black uppercase tracking-widest active:scale-[0.98] transition-all duration-200"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-headline font-black text-kp-on-surface">{player.name || 'Player'}</h2>
            <p className="text-kp-on-surface-variant text-sm mt-0.5">
              {player.age ? `${player.age} years old` : ''}
              {player.age && player.position ? ' · ' : ''}
              {player.position || ''}
            </p>
            <button
              onClick={startEdit}
              className="mt-3 inline-flex items-center gap-1.5 text-sm text-kp-primary-dim font-headline font-bold hover:text-kp-primary transition-colors px-4 py-2"
            >
              <span className="material-symbols-outlined text-sm">edit</span>
              Edit Profile
            </button>
          </>
        )}
      </div>

      {/* Goals */}
      <div className="bg-kp-surface-container rounded-2xl p-5 border border-kp-outline-variant/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-headline font-black text-kp-on-surface uppercase tracking-tighter">My Goals</h2>
        </div>

        {player.goals && player.goals.length > 0 ? (
          <div className="space-y-2 mb-3">
            {player.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-3 bg-kp-surface-high rounded-xl px-4 py-3">
                <span className="material-symbols-outlined text-kp-primary-container text-lg">flag</span>
                <span className="flex-1 text-sm text-kp-on-surface">{goal}</span>
                <button
                  onClick={() => removeGoal(i)}
                  className="flex-shrink-0 p-1.5 text-kp-on-surface-variant hover:text-kp-error transition-colors"
                  aria-label="Remove goal"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-kp-on-surface-variant mb-3">No goals set yet. Add one below!</p>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addGoal()}
            placeholder="Add a goal..."
            className="flex-1 px-4 py-2.5 bg-kp-surface-high rounded-xl text-sm text-kp-on-surface border border-kp-outline-variant/10 focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
          />
          <button
            onClick={addGoal}
            disabled={!newGoal.trim()}
            className="px-4 py-2.5 bg-kp-primary-container text-kp-on-primary-fixed rounded-xl text-sm font-black active:scale-95 transition-all duration-200 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-lg">add</span>
          </button>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-kp-surface-container rounded-2xl p-5 border border-kp-outline-variant/10">
        <h2 className="font-headline font-black text-kp-on-surface mb-4 uppercase tracking-tighter">Achievements</h2>
        <div className="grid grid-cols-3 gap-3">
          {ACHIEVEMENT_DEFS.map((ach) => {
            const earned = earnedTypes.has(ach.type);
            const earnedData = earnedMap[ach.type];

            return (
              <div
                key={ach.type}
                className={`text-center p-3 rounded-xl transition-all duration-200 ${
                  earned ? 'bg-kp-primary-container/10 border border-kp-primary-container/20' : 'bg-kp-surface-high opacity-50'
                }`}
              >
                <div className={`mb-1.5 ${earned ? '' : 'grayscale'}`}>
                  {earned ? (
                    <span className="material-symbols-outlined text-kp-primary-container text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>{ach.icon}</span>
                  ) : (
                    <span className="material-symbols-outlined text-kp-on-surface-variant text-3xl">lock</span>
                  )}
                </div>
                <p className={`text-xs font-headline font-black ${earned ? 'text-kp-on-surface' : 'text-kp-on-surface-variant'}`}>
                  {ach.title}
                </p>
                <p className="text-[10px] text-kp-on-surface-variant mt-0.5">{ach.desc}</p>
                {earned && earnedData && (
                  <p className="text-[10px] text-kp-primary-dim font-bold mt-1">
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

      {/* Security */}
      <div className="bg-kp-surface-container rounded-2xl p-5 border border-kp-outline-variant/10">
        <h2 className="font-headline font-black text-kp-on-surface mb-4 uppercase tracking-tighter">Security</h2>

        {showPinChange ? (
          <div className="space-y-3">
            <p className="text-sm text-kp-on-surface-variant">Current PIN: <span className="font-bold text-kp-on-surface">{getPin()}</span></p>
            <div>
              <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">New PIN</label>
              <input
                type="number"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.slice(0, 6))}
                placeholder="Enter 4-6 digit PIN"
                className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                inputMode="numeric"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setShowPinChange(false); setNewPin(''); setPinMsg(''); }}
                className="flex-1 py-2.5 border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (newPin.length >= 4) {
                    setPin(newPin);
                    setPinMsg('PIN updated!');
                    setNewPin('');
                    setShowPinChange(false);
                    setTimeout(() => setPinMsg(''), 3000);
                  }
                }}
                disabled={newPin.length < 4}
                className="flex-1 py-2.5 pitch-gradient text-kp-on-primary-fixed rounded-xl text-sm font-headline font-black uppercase tracking-widest active:scale-[0.98] transition-all disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={() => setShowPinChange(true)}
              className="w-full flex items-center gap-3 bg-kp-surface-high rounded-xl px-4 py-3 text-sm text-kp-on-surface hover:bg-kp-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-kp-primary-container text-lg">pin</span>
              <span className="flex-1 text-left">Change PIN</span>
              <span className="material-symbols-outlined text-kp-on-surface-variant text-lg">chevron_right</span>
            </button>
            <button
              onClick={lock}
              className="w-full flex items-center gap-3 bg-kp-surface-high rounded-xl px-4 py-3 text-sm text-kp-on-surface hover:bg-kp-surface-variant transition-colors"
            >
              <span className="material-symbols-outlined text-kp-error text-lg">lock</span>
              <span className="flex-1 text-left">Lock App Now</span>
              <span className="material-symbols-outlined text-kp-on-surface-variant text-lg">chevron_right</span>
            </button>
          </div>
        )}
        {pinMsg && <p className="text-kp-primary-dim text-sm font-bold mt-2">{pinMsg}</p>}
      </div>

      {/* Export */}
      <button
        onClick={exportData}
        className="w-full flex items-center justify-center gap-2 bg-kp-surface-container rounded-xl py-4 text-sm font-headline font-bold text-kp-on-surface-variant hover:bg-kp-surface-high active:scale-[0.98] transition-all duration-200 border border-kp-outline-variant/10"
      >
        <span className="material-symbols-outlined text-lg">download</span>
        Export My Data
      </button>

      {/* App Info */}
      <p className="text-center text-xs text-kp-on-surface-variant/50 pb-4">BiX — YoungStar Soccer v1.0</p>
    </div>
  );
}
