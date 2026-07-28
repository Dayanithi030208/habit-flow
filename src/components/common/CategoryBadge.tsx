import React from 'react';
import { CategoryType, CATEGORY_COLORS } from '../../types';

interface CategoryBadgeProps {
  category: CategoryType;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const colorStyle = CATEGORY_COLORS[category] || CATEGORY_COLORS.Personal;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} ${colorStyle.darkBg} ${colorStyle.darkText} dark:border-slate-800 ${className}`}
    >
      {category}
    </span>
  );
};
