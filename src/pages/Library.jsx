import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { CATEGORIES, CATEGORY_COLORS, DIFFICULTY_COLORS } from '../data/drills';
import DrillCard from '../components/DrillCard';
import CategoryBadge from '../components/CategoryBadge';
import VideoEmbed from '../components/VideoEmbed';
import { getWeekStart, formatDate } from '../utils';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];
const MEASURE_UNITS = ['seconds', 'reps', 'meters', 'goals', 'touches'];

export default function Library() {
  const allDrills = useLiveQuery(() => db.drills.toArray());
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedDrill, setSelectedDrill] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [dayPicker, setDayPicker] = useState(null);
  const [createForm, setCreateForm] = useState(defaultForm());
  const [editingDrill, setEditingDrill] = useState(null);
  const [editForm, setEditForm] = useState(defaultForm());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  function defaultForm() {
    return {
      name: '', description: '', category: CATEGORIES?.[0] || 'Speed', duration: 15,
      difficulty: 'Beginner', videoUrl: '', equipment: '', isMeasurable: false,
      measureUnit: 'seconds', measureLabel: '',
    };
  }

  const filtered = useMemo(() => {
    if (!allDrills) return [];
    return allDrills.filter((d) => {
      const matchCat = activeCategory === 'All' || d.category === activeCategory;
      const matchSearch = !search || d.name.toLowerCase().includes(search.toLowerCase()) ||
        d.description?.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [allDrills, search, activeCategory]);

  async function handleCreate() {
    if (!createForm.name.trim()) return;
    await db.drills.add({
      id: crypto.randomUUID(),
      name: createForm.name.trim(),
      description: createForm.description.trim(),
      category: createForm.category,
      duration: Number(createForm.duration) || 15,
      difficulty: createForm.difficulty,
      videoUrl: createForm.videoUrl.trim(),
      equipment: createForm.equipment ? createForm.equipment.split(',').map((s) => s.trim()).filter(Boolean) : [],
      isMeasurable: createForm.isMeasurable,
      measureUnit: createForm.isMeasurable ? createForm.measureUnit : null,
      measureLabel: createForm.isMeasurable ? createForm.measureLabel.trim() : null,
      isCustom: true,
    });
    setCreateForm(defaultForm());
    setShowCreate(false);
  }

  async function addToDay(drill, dayOfWeek) {
    const weekStart = getWeekStart();
    const weekStr = formatDate(weekStart);
    let plan = await db.weeklyPlans.where('weekStart').equals(weekStr).first();
    if (!plan) {
      const id = crypto.randomUUID();
      await db.weeklyPlans.add({ id, weekStart: weekStr, isTemplate: false, templateName: null });
      plan = { id };
    }
    await db.plannedDrills.add({
      id: crypto.randomUUID(),
      planId: plan.id,
      drillId: drill.id,
      dayOfWeek,
      targetDuration: drill.duration,
      targetReps: null,
    });
    setDayPicker(null);
    setSelectedDrill(null);
  }

  function startEditDrill(drill) {
    setEditForm({
      name: drill.name,
      description: drill.description || '',
      category: drill.category,
      duration: drill.duration,
      difficulty: drill.difficulty || 'Beginner',
      videoUrl: drill.videoUrl || '',
      equipment: drill.equipment ? drill.equipment.join(', ') : '',
      isMeasurable: drill.isMeasurable || false,
      measureUnit: drill.measureUnit || 'seconds',
      measureLabel: drill.measureLabel || '',
    });
    setEditingDrill(drill);
    setSelectedDrill(null);
  }

  async function handleEditSave() {
    if (!editingDrill || !editForm.name.trim()) return;
    await db.drills.update(editingDrill.id, {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      category: editForm.category,
      duration: Number(editForm.duration) || 15,
      difficulty: editForm.difficulty,
      videoUrl: editForm.videoUrl.trim(),
      equipment: editForm.equipment ? editForm.equipment.split(',').map((s) => s.trim()).filter(Boolean) : [],
      isMeasurable: editForm.isMeasurable,
      measureUnit: editForm.isMeasurable ? editForm.measureUnit : null,
      measureLabel: editForm.isMeasurable ? editForm.measureLabel.trim() : null,
    });
    setEditingDrill(null);
  }

  async function handleDelete(drill) {
    await db.drills.delete(drill.id);
    // Clean up any planned drills referencing this drill
    const planned = await db.plannedDrills.where('drillId').equals(drill.id).toArray();
    for (const pd of planned) {
      await db.plannedDrills.delete(pd.id);
    }
    setShowDeleteConfirm(null);
    setSelectedDrill(null);
  }

  if (!allDrills) return <div className="p-6" />;

  const categories = ['All', ...(CATEGORIES || [])];
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="px-4 md:px-8 pt-6 pb-24 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="text-kp-primary-dim font-headline font-black text-[10px] uppercase tracking-[0.3em] mb-1">The Drill Lab</p>
        <h1 className="font-headline font-black text-4xl md:text-5xl italic tracking-tighter uppercase leading-none text-kp-primary">
          Master The<br />Pitch
        </h1>
        <p className="text-kp-on-surface-variant text-sm mt-2">
          <span className="font-bold text-kp-on-surface">{allDrills.length}</span> drills available
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-kp-on-surface-variant text-xl">search</span>
        <input
          type="text"
          placeholder="Search drills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-10 py-3.5 bg-kp-surface-high rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 border border-kp-outline-variant/10 placeholder:text-kp-on-surface-variant"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-kp-on-surface-variant hover:text-kp-on-surface">
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-kp-primary text-kp-on-primary'
                : 'bg-kp-surface-high text-kp-on-surface-variant hover:bg-kp-surface-variant'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drill Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
        {filtered.map((drill) => (
          <DrillCard key={drill.id} drill={drill} onClick={() => setSelectedDrill(drill)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-kp-on-surface-variant">
          <span className="material-symbols-outlined text-5xl mb-2 block">search_off</span>
          <p className="text-lg">No drills found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-6 right-6 md:bottom-12 md:right-12 w-14 h-14 bg-kp-primary-container text-kp-on-primary-fixed rounded-full shadow-[0_20px_40px_rgba(202,253,0,0.3)] flex items-center justify-center active:scale-90 transition-all z-40 group"
        aria-label="Create new drill"
      >
        <span className="material-symbols-outlined text-3xl transition-transform group-hover:rotate-90">add</span>
      </button>

      {/* Drill Detail Modal */}
      {selectedDrill && !dayPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelectedDrill(null)}>
          <div
            className="bg-kp-surface-container rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-kp-outline-variant/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-headline font-black text-kp-on-surface">{selectedDrill.name}</h2>
                <button onClick={() => setSelectedDrill(null)} className="p-2 hover:bg-kp-surface-variant rounded-full transition-colors text-kp-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <VideoEmbed url={selectedDrill.videoUrl} />

              <div className="flex items-center gap-2 flex-wrap mt-4">
                <CategoryBadge category={selectedDrill.category} size="md" />
                {selectedDrill.difficulty && (
                  <span className={`inline-flex items-center rounded-full text-xs px-3 py-1 font-black uppercase tracking-widest ${
                    (DIFFICULTY_COLORS[selectedDrill.difficulty] || {}).bg || 'bg-kp-surface-variant'
                  } ${(DIFFICULTY_COLORS[selectedDrill.difficulty] || {}).text || 'text-kp-on-surface-variant'}`}>
                    {selectedDrill.difficulty}
                  </span>
                )}
                <span className="text-sm text-kp-on-surface-variant flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">schedule</span>
                  {selectedDrill.duration} min
                </span>
              </div>

              {selectedDrill.description && (
                <p className="text-kp-on-surface-variant mt-4 leading-relaxed text-sm">{selectedDrill.description}</p>
              )}

              {selectedDrill.equipment?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrill.equipment.map((item) => (
                      <span key={item} className="bg-kp-surface-variant text-kp-on-surface-variant text-sm px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrill.isMeasurable && (
                <p className="text-sm text-kp-on-surface-variant mt-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-kp-primary-dim text-sm">straighten</span>
                  Measurable: {selectedDrill.measureLabel} ({selectedDrill.measureUnit})
                </p>
              )}

              <button
                onClick={() => setDayPicker(selectedDrill)}
                className="w-full mt-5 pitch-gradient text-kp-on-primary-fixed font-headline font-black py-3.5 rounded-xl uppercase tracking-widest text-xs hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] active:scale-[0.98] transition-all duration-200"
              >
                Add to This Week's Plan
              </button>

              {/* Edit / Delete Actions */}
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => startEditDrill(selectedDrill)}
                  className="flex-1 py-3 bg-kp-surface-high rounded-xl text-sm font-headline font-bold text-kp-on-surface hover:bg-kp-surface-variant active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">edit</span>
                  Edit Drill
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(selectedDrill); }}
                  className="flex-1 py-3 bg-kp-error-container/20 rounded-xl text-sm font-headline font-bold text-kp-error hover:bg-kp-error-container/30 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">delete</span>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Day Picker Modal */}
      {dayPicker && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setDayPicker(null)}>
          <div className="bg-kp-surface-container rounded-2xl p-5 w-full max-w-sm border border-kp-outline-variant/10" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-headline font-black text-kp-on-surface mb-1">Pick a Day</h3>
            <p className="text-sm text-kp-on-surface-variant mb-4">Add "{dayPicker.name}" to:</p>
            <div className="grid grid-cols-2 gap-2">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  onClick={() => addToDay(dayPicker, i)}
                  className="py-3 px-4 bg-kp-surface-high rounded-xl text-sm font-headline font-bold text-kp-on-surface-variant hover:bg-kp-primary-container/20 hover:text-kp-primary active:scale-95 transition-all duration-200"
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDayPicker(null)}
              className="w-full mt-3 py-2.5 text-sm text-kp-on-surface-variant hover:text-kp-on-surface transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Drill Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div
            className="bg-kp-surface-container rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-kp-outline-variant/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-headline font-black text-kp-on-surface">Create Drill</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-kp-surface-variant rounded-full transition-colors text-kp-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="e.g., Cone Weave Sprint"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 resize-none placeholder:text-kp-on-surface-variant"
                    placeholder="Describe the drill..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    >
                      {(CATEGORIES || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Difficulty</label>
                    <select
                      value={createForm.difficulty}
                      onChange={(e) => setCreateForm((f) => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Video URL</label>
                  <input
                    type="url"
                    value={createForm.videoUrl}
                    onChange={(e) => setCreateForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="YouTube or Instagram link"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.equipment}
                    onChange={(e) => setCreateForm((f) => ({ ...f, equipment: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="e.g., Cones, Ball, Goal"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreateForm((f) => ({ ...f, isMeasurable: !f.isMeasurable }))}
                    className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                      createForm.isMeasurable ? 'bg-kp-primary-container' : 'bg-kp-surface-variant'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-kp-on-surface rounded-full shadow-sm transition-transform duration-200 mx-1 ${
                        createForm.isMeasurable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-kp-on-surface-variant">Measurable drill</span>
                </div>

                {createForm.isMeasurable && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Unit</label>
                      <select
                        value={createForm.measureUnit}
                        onChange={(e) => setCreateForm((f) => ({ ...f, measureUnit: e.target.value }))}
                        className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                      >
                        {MEASURE_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Label</label>
                      <input
                        type="text"
                        value={createForm.measureLabel}
                        onChange={(e) => setCreateForm((f) => ({ ...f, measureLabel: e.target.value }))}
                        className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                        placeholder="e.g., Time, Distance"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 border border-kp-outline-variant/20 rounded-xl text-sm font-headline font-bold text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!createForm.name.trim()}
                    className="flex-1 py-3 pitch-gradient text-kp-on-primary-fixed rounded-xl text-sm font-headline font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Drill Modal */}
      {editingDrill && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setEditingDrill(null)}>
          <div
            className="bg-kp-surface-container rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto border border-kp-outline-variant/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-headline font-black text-kp-on-surface">Edit Drill</h2>
                <button onClick={() => setEditingDrill(null)} className="p-2 hover:bg-kp-surface-variant rounded-full transition-colors text-kp-on-surface-variant">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Name *</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="e.g., Cone Weave Sprint"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 resize-none placeholder:text-kp-on-surface-variant"
                    placeholder="Describe the drill..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Category</label>
                    <select
                      value={editForm.category}
                      onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    >
                      {(CATEGORIES || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Difficulty</label>
                    <select
                      value={editForm.difficulty}
                      onChange={(e) => setEditForm((f) => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Video URL</label>
                  <input
                    type="url"
                    value={editForm.videoUrl}
                    onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="YouTube or Instagram link"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.equipment}
                    onChange={(e) => setEditForm((f) => ({ ...f, equipment: e.target.value }))}
                    className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                    placeholder="e.g., Cones, Ball, Goal"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setEditForm((f) => ({ ...f, isMeasurable: !f.isMeasurable }))}
                    className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                      editForm.isMeasurable ? 'bg-kp-primary-container' : 'bg-kp-surface-variant'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-kp-on-surface rounded-full shadow-sm transition-transform duration-200 mx-1 ${
                        editForm.isMeasurable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-kp-on-surface-variant">Measurable drill</span>
                </div>

                {editForm.isMeasurable && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Unit</label>
                      <select
                        value={editForm.measureUnit}
                        onChange={(e) => setEditForm((f) => ({ ...f, measureUnit: e.target.value }))}
                        className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50"
                      >
                        {MEASURE_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-kp-on-surface-variant uppercase tracking-widest mb-1">Label</label>
                      <input
                        type="text"
                        value={editForm.measureLabel}
                        onChange={(e) => setEditForm((f) => ({ ...f, measureLabel: e.target.value }))}
                        className="w-full px-4 py-3 bg-kp-surface-high border border-kp-outline-variant/20 rounded-xl text-sm text-kp-on-surface focus:outline-none focus:ring-2 focus:ring-kp-primary-container/50 placeholder:text-kp-on-surface-variant"
                        placeholder="e.g., Time, Distance"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setEditingDrill(null)}
                    className="flex-1 py-3 border border-kp-outline-variant/20 rounded-xl text-sm font-headline font-bold text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEditSave}
                    disabled={!editForm.name.trim()}
                    className="flex-1 py-3 pitch-gradient text-kp-on-primary-fixed rounded-xl text-sm font-headline font-black uppercase tracking-widest hover:shadow-[0_0_20px_rgba(202,253,0,0.3)] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-kp-surface-container rounded-2xl p-6 w-full max-w-sm border border-kp-outline-variant/10 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-kp-error/10 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-kp-error text-3xl">delete_forever</span>
            </div>
            <h3 className="text-lg font-headline font-black text-kp-on-surface mb-2">Delete Drill?</h3>
            <p className="text-sm text-kp-on-surface-variant mb-1">
              <span className="font-bold text-kp-on-surface">"{showDeleteConfirm.name}"</span>
            </p>
            <p className="text-sm text-kp-on-surface-variant mb-6">
              This will also remove it from any weekly plans. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 border border-kp-outline-variant/20 rounded-xl text-sm font-headline font-bold text-kp-on-surface-variant hover:bg-kp-surface-variant transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 py-3 bg-kp-error rounded-xl text-sm font-headline font-black text-white uppercase tracking-widest active:scale-[0.98] transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}