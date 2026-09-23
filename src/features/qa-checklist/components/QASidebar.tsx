import React from 'react';
import type { QACategory, QACategoryId } from '../types';
import {
  Shield,
  UserCheck,
  ShieldCheck,
  Package,
  HandHeart,
  MessageSquare,
  Bell,
  AlertOctagon,
  Database,
  Lock,
  Smartphone,
  Layers,
  Server,
  Zap,
  Globe,
  Rocket,
  CheckCircle,
  LayoutGrid,
} from 'lucide-react';

interface QASidebarProps {
  categories: QACategory[];
  selectedCategory: QACategoryId | 'all';
  onSelectCategory: (id: QACategoryId | 'all') => void;
  categoryStats: Record<string, { total: number; completed: number; percentage: number }>;
  totalCount: number;
  completedCount: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Shield,
  UserCheck,
  ShieldCheck,
  Package,
  HandHeart,
  MessageSquare,
  Bell,
  AlertOctagon,
  Database,
  Lock,
  Smartphone,
  Layers,
  Server,
  Zap,
  Globe,
  Rocket,
};

export default function QASidebar({
  categories,
  selectedCategory,
  onSelectCategory,
  categoryStats,
  totalCount,
  completedCount,
}: QASidebarProps) {
  return (
    <aside className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-3.5 shrink-0 flex flex-col gap-1">
      <div className="px-3 py-2 border-b border-slate-100 mb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          Checklist Categories
        </span>
      </div>

      {/* All Categories Option */}
      <button
        type="button"
        onClick={() => onSelectCategory('all')}
        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
          selectedCategory === 'all'
            ? 'bg-slate-900 text-white shadow-xs'
            : 'text-slate-700 hover:bg-slate-100'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <LayoutGrid className="w-4 h-4 shrink-0" />
          <span className="truncate">All Categories</span>
        </div>
        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
            selectedCategory === 'all'
              ? 'bg-slate-700 text-slate-200'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {completedCount}/{totalCount}
        </span>
      </button>

      {/* Categories List */}
      <div className="flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Shield;
          const stat = categoryStats[cat.id] || { total: 0, completed: 0, percentage: 0 };
          const isSelected = selectedCategory === cat.id;
          const isAllDone = stat.completed === stat.total && stat.total > 0;

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left group ${
                isSelected
                  ? 'bg-emerald-50 text-emerald-900 font-bold border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 transition-colors ${
                    isSelected
                      ? 'text-emerald-700'
                      : isAllDone
                      ? 'text-emerald-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{cat.name.replace(/^\d+\.\s*/, '')}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {isAllDone && <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                    isAllDone
                      ? 'bg-emerald-100 text-emerald-800'
                      : isSelected
                      ? 'bg-emerald-200/60 text-emerald-900'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {stat.completed}/{stat.total}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
