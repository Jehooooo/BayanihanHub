import React from 'react';
import { Link } from 'react-router-dom';
import { useQAChecklist } from '../hooks/useQAChecklist';
import QASummaryCard from '../components/QASummaryCard';
import QASidebar from '../components/QASidebar';
import QAControls from '../components/QAControls';
import QAChecklistItem from '../components/QAChecklistItem';
import {
  ShieldCheck,
  ArrowLeft,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ClipboardList,
} from 'lucide-react';
import SEO from '@/components/common/SEO';

export default function QAChecklistPage() {
  const {
    itemsState,
    filteredItems,
    metrics,
    categoryStats,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    statusFilter,
    setStatusFilter,
    toggleItem,
    updateNotes,
    markCategoryComplete,
    resetChecklist,
    exportAsJSON,
    importFromJSON,
  } = useQAChecklist();

  const currentCategoryObj = categories.find((c) => c.id === selectedCategory);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col">
      <SEO
        title="Pre-Deployment QA & Security Checklist | Bayanihan Hub"
        description="Comprehensive pre-flight manual verification dashboard for Bayanihan Hub production readiness."
      />

      {/* Top Developer Bar */}
      <header className="sticky top-0 z-30 bg-[#0f172a] text-white border-b border-slate-800 shadow-sm px-4 lg:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to App</span>
          </Link>

          <div className="h-4 w-px bg-slate-700 hidden sm:block" />

          <div className="flex items-center gap-2">
            <img src="/Logo1Revise.png" alt="Bayanihan Hub" className="h-7 w-auto object-contain" />
            <div>
              <h1 className="text-sm font-black text-white leading-tight flex items-center gap-1.5">
                Bayanihan Hub <span className="text-emerald-400 font-normal">| Pre-Deployment QA</span>
              </h1>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">
                PRODUCTION READINESS VERIFICATION
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* Readiness Summary Card */}
        <QASummaryCard metrics={metrics} />

        {/* Content Layout with Sidebar */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Category Sidebar */}
          <QASidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            categoryStats={categoryStats}
            totalCount={metrics.totalCount}
            completedCount={metrics.completedCount}
          />

          {/* Checklist Feed & Controls */}
          <div className="flex-1 w-full min-w-0">
            <QAControls
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedPriority={selectedPriority}
              onPriorityChange={setSelectedPriority}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              onExportJSON={exportAsJSON}
              onImportJSON={importFromJSON}
              onReset={() => resetChecklist()}
              onMarkCategoryComplete={() =>
                markCategoryComplete(selectedCategory !== 'all' ? selectedCategory : undefined)
              }
              totalFiltered={filteredItems.length}
            />

            {/* Active Category Header & Bulk Tools */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/70 backdrop-blur-xs p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  {selectedCategory === 'all'
                    ? 'All Verification Checks'
                    : currentCategoryObj?.name || 'Selected Category'}
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCategory === 'all'
                    ? `Showing ${filteredItems.length} items across all categories`
                    : currentCategoryObj?.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    markCategoryComplete(selectedCategory !== 'all' ? selectedCategory : undefined)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Done</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    resetChecklist(selectedCategory !== 'all' ? selectedCategory : undefined)
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Reset Section</span>
                </button>
              </div>
            </div>

            {/* Items Feed */}
            {filteredItems.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No matching checks found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  Try adjusting your search keywords, clearing priority filters, or switching categories.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedPriority('all');
                    setStatusFilter('all');
                    setSelectedCategory('all');
                  }}
                  className="mt-4 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredItems.map((item) => (
                  <QAChecklistItem
                    key={item.id}
                    item={item}
                    state={itemsState[item.id]}
                    onToggle={toggleItem}
                    onUpdateNotes={updateNotes}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-4 px-4 text-center text-xs text-slate-500">
        <span>Bayanihan Hub Manual Pre-Deployment QA & Security Verification System • Local Audit Session</span>
      </footer>
    </div>
  );
}
