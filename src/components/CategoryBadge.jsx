import { CATEGORY_COLORS } from '../data/drills';

const sizes = {
  sm: 'text-[8px] px-2 py-0.5',
  md: 'text-xs px-3 py-1',
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const colors = CATEGORY_COLORS[category] || { bg: 'bg-kp-surface-variant', text: 'text-kp-on-surface-variant' };

  return (
    <span
      className={`inline-flex items-center rounded-full font-black uppercase tracking-widest ${sizes[size] || sizes.sm} ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
}
