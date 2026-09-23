import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useQAChecklist } from '@/features/qa-checklist/hooks/useQAChecklist';
import QASummaryCard from '@/features/qa-checklist/components/QASummaryCard';
import QASidebar from '@/features/qa-checklist/components/QASidebar';
import QAControls from '@/features/qa-checklist/components/QAControls';
import QAChecklistItem from '@/features/qa-checklist/components/QAChecklistItem';
import { CheckCheck, RotateCcw, ClipboardList } from 'lucide-react';
import SEO from '@/components/common/SEO';

export default function AdminQAChecklistPage() {
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
    <AdminLayout>
      <SEO
        title="Pre-Deployment QA & Security Checklist | Admin | Bayanihan Hub"
        description="Verify Bayanihan Hub production readiness, security compliance, and functional test coverage."
      />

      <div className="flex-1 overflow-y-auto p-4 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Pre-Deployment QA & Security Checklist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manual pre-flight audit for Bayanihan Hub. Review and verify security guards, features, responsiveness, and server configurations before deploying.
          </p>
        </div>

        {/* Top Summary Banner */}
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
                    ? `Showing ${filteredItems.length} checks across all categories`
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
      </div>
    </AdminLayout>
  );
}
