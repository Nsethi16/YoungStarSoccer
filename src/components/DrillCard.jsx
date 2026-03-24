import { Clock, Plus, Check } from 'lucide-react';
import { CATEGORY_COLORS, DIFFICULTY_COLORS } from '../data/drills';
import CategoryBadge from './CategoryBadge';

export default function DrillCard({ drill, onClick, onAdd, compact = false, completed = false, onComplete }) {
  const catColors = CATEGORY_COLORS[drill.category] || { border: 'border-gray-300' };
  const diffColors = DIFFICULTY_COLORS[drill.difficulty] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div
      onClick={onClick}
      className={`relative bg-white rounded-xl shadow-sm border-l-4 ${catColors.border} transition-all duration-200 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${
        completed ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-center gap-3">
        {onComplete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-gray-300 hover:border-emerald-400'
            }`}
            aria-label={completed ? 'Completed' : 'Mark as complete'}
          >
            {completed && <Check size={14} strokeWidth={3} />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {compact ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-semibold text-sm text-gray-900 truncate ${completed ? 'line-through' : ''}`}>
                {drill.name}
              </span>
              <CategoryBadge category={drill.category} size="sm" />
              <span className="flex items-center gap-1 text-xs text-gray-500 ml-auto flex-shrink-0">
                <Clock size={12} />
                {drill.duration}m
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className={`font-semibold text-gray-900 ${completed ? 'line-through' : ''}`}>
                  {drill.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={drill.category} size="sm" />
                <span className={`inline-flex items-center rounded-full text-xs px-2 py-0.5 font-medium ${diffColors.bg} ${diffColors.text}`}>
                  {drill.difficulty}
                </span>
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock size={12} />
                  {drill.duration} min
                </span>
              </div>
              {drill.equipment && drill.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {drill.equipment.map((item) => (
                    <span key={item} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {item}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(drill);
            }}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm hover:bg-emerald-600 active:scale-95 transition-all duration-200"
            aria-label={`Add ${drill.name}`}
          >
            <Plus size={20} />
          </button>
        )}
      </div>
    </div>
  );
}
