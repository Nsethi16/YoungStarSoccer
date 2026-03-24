import { CATEGORY_COLORS } from '../data/drills';

const sizes = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export default function CategoryBadge({ category, size = 'sm' }) {
  const colors = CATEGORY_COLORS[category] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizes[size] || sizes.sm} ${colors.bg} ${colors.text}`}
    >
      {category}
    </span>
  );
}
