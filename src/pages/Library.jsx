import { useState, useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Search, X, Plus, ChevronDown } from 'lucide-react';
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
  const [dayPicker, setDayPicker] = useState(null); // drill to assign to a day
  const [createForm, setCreateForm] = useState(defaultForm());

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

  if (!allDrills) return <div className="p-6" />;

  const categories = ['All', ...(CATEGORIES || [])];
  const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="p-4 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pt-2">
        <h1 className="text-2xl font-bold text-gray-900">Drill Library</h1>
        <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
          {allDrills.length}
        </span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search drills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Category Chips */}
      <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === cat
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Drill List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
        {filtered.map((drill) => (
          <DrillCard key={drill.id} drill={drill} onClick={() => setSelectedDrill(drill)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <p className="text-lg">No drills found</p>
          <p className="text-sm mt-1">Try a different search or category</p>
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setShowCreate(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-emerald-600 active:scale-90 transition-all duration-200 z-40"
        aria-label="Create new drill"
      >
        <Plus size={26} />
      </button>

      {/* Drill Detail Modal */}
      {selectedDrill && !dayPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setSelectedDrill(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedDrill.name}</h2>
                <button onClick={() => setSelectedDrill(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <VideoEmbed url={selectedDrill.videoUrl} />

              <div className="flex items-center gap-2 flex-wrap mt-4">
                <CategoryBadge category={selectedDrill.category} size="md" />
                {selectedDrill.difficulty && (
                  <span className={`inline-flex items-center rounded-full text-sm px-3 py-1 font-medium ${
                    (DIFFICULTY_COLORS[selectedDrill.difficulty] || {}).bg || 'bg-gray-100'
                  } ${(DIFFICULTY_COLORS[selectedDrill.difficulty] || {}).text || 'text-gray-700'}`}>
                    {selectedDrill.difficulty}
                  </span>
                )}
                <span className="text-sm text-gray-500">{selectedDrill.duration} min</span>
              </div>

              {selectedDrill.description && (
                <p className="text-gray-700 mt-4 leading-relaxed">{selectedDrill.description}</p>
              )}

              {selectedDrill.equipment?.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Equipment</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedDrill.equipment.map((item) => (
                      <span key={item} className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{item}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedDrill.isMeasurable && (
                <p className="text-sm text-gray-500 mt-3">
                  📏 Measurable: {selectedDrill.measureLabel} ({selectedDrill.measureUnit})
                </p>
              )}

              <button
                onClick={() => setDayPicker(selectedDrill)}
                className="w-full mt-5 bg-emerald-500 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200"
              >
                Add to This Week's Plan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Day Picker Modal */}
      {dayPicker && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setDayPicker(null)}>
          <div className="bg-white rounded-2xl p-5 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Pick a Day</h3>
            <p className="text-sm text-gray-500 mb-4">Add "{dayPicker.name}" to:</p>
            <div className="grid grid-cols-2 gap-2">
              {DAY_NAMES.map((name, i) => (
                <button
                  key={i}
                  onClick={() => addToDay(dayPicker, i)}
                  className="py-3 px-4 bg-gray-50 rounded-xl text-sm font-medium text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 active:scale-95 transition-all duration-200"
                >
                  {name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setDayPicker(null)}
              className="w-full mt-3 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Create Drill Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end md:items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create Drill</h2>
                <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Cone Weave Sprint"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    placeholder="Describe the drill..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={createForm.category}
                      onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {(CATEGORIES || []).map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                    <select
                      value={createForm.difficulty}
                      onChange={(e) => setCreateForm((f) => ({ ...f, difficulty: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {DIFFICULTIES.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                  <input
                    type="number"
                    value={createForm.duration}
                    onChange={(e) => setCreateForm((f) => ({ ...f, duration: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    min={1}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Video URL</label>
                  <input
                    type="url"
                    value={createForm.videoUrl}
                    onChange={(e) => setCreateForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="YouTube or Instagram link"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment (comma-separated)</label>
                  <input
                    type="text"
                    value={createForm.equipment}
                    onChange={(e) => setCreateForm((f) => ({ ...f, equipment: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g., Cones, Ball, Goal"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setCreateForm((f) => ({ ...f, isMeasurable: !f.isMeasurable }))}
                    className={`w-12 h-7 rounded-full transition-colors duration-200 ${
                      createForm.isMeasurable ? 'bg-emerald-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 mx-1 ${
                        createForm.isMeasurable ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-gray-700">Measurable drill</span>
                </div>

                {createForm.isMeasurable && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                      <select
                        value={createForm.measureUnit}
                        onChange={(e) => setCreateForm((f) => ({ ...f, measureUnit: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        {MEASURE_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Label</label>
                      <input
                        type="text"
                        value={createForm.measureLabel}
                        onChange={(e) => setCreateForm((f) => ({ ...f, measureLabel: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="e.g., Time, Distance"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-3 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={!createForm.name.trim()}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl text-sm font-semibold hover:bg-emerald-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Drill
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
