import React, { useRef } from 'react';
import type { QAPriority } from '../types';
import {
  Search,
  X,
  Filter,
  Download,
  Upload,
  RotateCcw,
  CheckCheck,
  Printer,
} from 'lucide-react';

interface QAControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedPriority: QAPriority | 'all';
  onPriorityChange: (p: QAPriority | 'all') => void;
  statusFilter: 'all' | 'completed' | 'incomplete';
  onStatusFilterChange: (s: 'all' | 'completed' | 'incomplete') => void;
  onExportJSON: () => void;
  onImportJSON: (jsonStr: string) => boolean;
  onReset: () => void;
  onMarkCategoryComplete: () => void;
  totalFiltered: number;
}

export default function QAControls({
  searchQuery,
  onSearchChange,
  selectedPriority,
  onPriorityChange,
  statusFilter,
  onStatusFilterChange,
  onExportJSON,
  onImportJSON,
  onReset,
  onMarkCategoryComplete,
  totalFiltered,
}: QAControlsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = onImportJSON(content);
        if (success) {
          alert('Audit checklist data imported successfully!');
        } else {
          alert('Failed to parse checklist JSON file. Please ensure it is a valid Bayanihan Hub export.');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleResetConfirm = () => {
    if (window.confirm('Are you sure you want to reset all checklist verification progress? This cannot be undone.')) {
      onReset();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 mb-6">
      {/* Top Search & Actions Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search checks, keywords, or notes..."
            className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-slate-50/50 placeholder-slate-400 text-slate-800 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Export JSON */}
          <button
            type="button"
            onClick={onExportJSON}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Download audit report as JSON"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export JSON</span>
          </button>

          {/* Import JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".json,application/json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Upload previously saved JSON checklist"
          >
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import JSON</span>
          </button>

          {/* Print Audit */}
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            title="Print or Save as PDF"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>

          {/* Reset */}
          <button
            type="button"
            onClick={handleResetConfirm}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors"
            title="Clear all saved checks"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filter Pills Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Priority:
          </span>
          <button
            type="button"
            onClick={() => onPriorityChange('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedPriority === 'all'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => onPriorityChange('critical')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedPriority === 'critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
            }`}
          >
            🔴 Critical
          </button>
          <button
            type="button"
            onClick={() => onPriorityChange('important')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedPriority === 'important'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
            }`}
          >
            🟡 Important
          </button>
          <button
            type="button"
            onClick={() => onPriorityChange('recommended')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
              selectedPriority === 'recommended'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
            }`}
          >
            🟢 Recommended
          </button>
        </div>

        {/* Status Filter & Count */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => onStatusFilterChange('all')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('incomplete')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'incomplete' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Pending
            </button>
            <button
              type="button"
              onClick={() => onStatusFilterChange('completed')}
              className={`px-2.5 py-0.5 rounded-md text-xs font-semibold transition-all ${
                statusFilter === 'completed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Done
            </button>
          </div>

          <span className="text-xs font-bold text-slate-500 ml-1">
            Showing: <span className="text-slate-900">{totalFiltered}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
