import { CATEGORY_COLORS, DIFFICULTY_COLORS } from '../data/drills';
import CategoryBadge from './CategoryBadge';

export default function DrillCard({ drill, onClick, onAdd, compact = false, completed = false, onComplete }) {
  return (
    <div
      onClick={onClick}
      className={`relative bg-kp-surface-container rounded-xl transition-all duration-200 ${
        compact ? 'p-3' : 'p-4'
      } ${onClick ? 'cursor-pointer active:scale-[0.98]' : ''} ${
        completed ? 'opacity-50' : ''
      } border border-kp-outline-variant/10`}
    >
      <div className="flex items-center gap-3">
        {onComplete && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(); }}
            className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
              completed
                ? 'bg-kp-primary-container border-kp-primary-container text-kp-on-primary-fixed'
                : 'border-kp-outline-variant hover:border-kp-primary-dim'
            }`}
            aria-label={completed ? 'Completed' : 'Mark as complete'}
          >
            {completed && <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
          </button>
        )}

        <div className="flex-1 min-w-0">
          {compact ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-headline font-bold text-sm text-kp-on-surface truncate ${completed ? 'line-through' : ''}`}>
                {drill.name}
              </span>
              <CategoryBadge category={drill.category} size="sm" />
              <span className="flex items-center gap-1 text-xs text-kp-on-surface-variant ml-auto flex-shrink-0">
                <span className="material-symbols-outlined text-xs">schedule</span>
                {drill.duration}m
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h3 className={`font-headline font-bold text-kp-on-surface ${completed ? 'line-through' : ''}`}>
                  {drill.name}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <CategoryBadge category={drill.category} size="sm" />
                {drill.difficulty && (
                  <span className={`inline-flex items-center rounded-full text-[8px] px-2 py-0.5 font-black uppercase tracking-widest ${
                    (DIFFICULTY_COLORS[drill.difficulty] || {}).bg || 'bg-kp-surface-variant'
                  } ${(DIFFICULTY_COLORS[drill.difficulty] || {}).text || 'text-kp-on-surface-variant'}`}>
                    {drill.difficulty}
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-kp-on-surface-variant">
                  <span className="material-symbols-outlined text-xs">schedule</span>
                  {drill.duration} min
                </span>
              </div>
              {drill.equipment && drill.equipment.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {drill.equipment.map((item) => (
                    <span key={item} className="text-[10px] bg-kp-surface-variant text-kp-on-surface-variant px-2 py-0.5 rounded-full">
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
            onClick={(e) => { e.stopPropagation(); onAdd(drill); }}
            className="flex-shrink-0 w-10 h-10 rounded-full bg-kp-primary-container text-kp-on-primary-fixed flex items-center justify-center shadow-sm hover:shadow-[0_0_16px_rgba(202,253,0,0.3)] active:scale-95 transition-all duration-200"
            aria-label={`Add ${drill.name}`}
          >
            <span className="material-symbols-outlined text-xl">add</span>
          </button>
        )}
      </div>
    </div>
  );
}
