import { useState, useEffect, useMemo, useCallback } from 'react';
import { QA_CHECKLIST_ITEMS, QA_CATEGORIES } from '../checklistData';
import type {
  QACategoryId,
  QAPriority,
  QAItemRuntimeState,
  QAReadinessMetrics,
  QAReadinessStatus,
  QAAuditExport,
} from '../types';

const STORAGE_KEY = 'bayanihanhub_qa_checklist_v1';

export function useQAChecklist() {
  // Load saved state from localStorage
  const [itemsState, setItemsState] = useState<Record<string, QAItemRuntimeState>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('[QA Checklist] Failed to load from localStorage:', err);
    }
    return {};
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<QACategoryId | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<QAPriority | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'incomplete'>('all');

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itemsState));
    } catch (err) {
      console.error('[QA Checklist] Failed to persist to localStorage:', err);
    }
  }, [itemsState]);

  // Toggle item completion
  const toggleItem = useCallback((id: string) => {
    setItemsState((prev) => {
      const current = prev[id] || { completed: false, notes: '' };
      const nextCompleted = !current.completed;
      return {
        ...prev,
        [id]: {
          ...current,
          completed: nextCompleted,
          lastVerifiedAt: nextCompleted ? new Date().toISOString() : current.lastVerifiedAt,
        },
      };
    });
  }, []);

  // Update item notes
  const updateNotes = useCallback((id: string, notes: string) => {
    setItemsState((prev) => {
      const current = prev[id] || { completed: false, notes: '' };
      return {
        ...prev,
        [id]: {
          ...current,
          notes,
        },
      };
    });
  }, []);

  // Bulk mark all in current view / category
  const markCategoryComplete = useCallback((catId?: QACategoryId) => {
    setItemsState((prev) => {
      const next = { ...prev };
      const targets = catId
        ? QA_CHECKLIST_ITEMS.filter((item) => item.category === catId)
        : QA_CHECKLIST_ITEMS;

      targets.forEach((item) => {
        const cur = next[item.id] || { completed: false, notes: '' };
        next[item.id] = {
          ...cur,
          completed: true,
          lastVerifiedAt: new Date().toISOString(),
        };
      });
      return next;
    });
  }, []);

  // Reset category or entire checklist
  const resetChecklist = useCallback((catId?: QACategoryId) => {
    if (catId) {
      setItemsState((prev) => {
        const next = { ...prev };
        QA_CHECKLIST_ITEMS.filter((i) => i.category === catId).forEach((i) => {
          if (next[i.id]) {
            next[i.id] = { ...next[i.id], completed: false };
          }
        });
        return next;
      });
    } else {
      setItemsState({});
    }
  }, []);

  // Export audit as JSON
  const exportAsJSON = useCallback(() => {
    const metrics = computeMetrics(itemsState);
    const payload: QAAuditExport = {
      version: '1.0.0',
      platform: 'Bayanihan Hub Pre-Deployment QA Checklist',
      exportedAt: new Date().toISOString(),
      metrics,
      itemsState,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    const filename = `bayanihanhub-qa-audit-${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', filename);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [itemsState]);

  // Import audit from JSON string
  const importFromJSON = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed.itemsState === 'object') {
        setItemsState(parsed.itemsState);
        return true;
      }
      // If legacy direct state format
      if (typeof parsed === 'object' && !parsed.itemsState) {
        setItemsState(parsed);
        return true;
      }
      return false;
    } catch (err) {
      console.error('[QA Checklist] Failed to parse import JSON:', err);
      return false;
    }
  }, []);

  // Calculate readiness metrics
  const metrics = useMemo(() => computeMetrics(itemsState), [itemsState]);

  // Calculate completion per category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; completed: number; percentage: number }> = {};
    QA_CATEGORIES.forEach((cat) => {
      const itemsInCat = QA_CHECKLIST_ITEMS.filter((i) => i.category === cat.id);
      const completedInCat = itemsInCat.filter((i) => itemsState[i.id]?.completed).length;
      stats[cat.id] = {
        total: itemsInCat.length,
        completed: completedInCat,
        percentage: itemsInCat.length > 0 ? Math.round((completedInCat / itemsInCat.length) * 100) : 0,
      };
    });
    return stats;
  }, [itemsState]);

  // Filtered items list
  const filteredItems = useMemo(() => {
    return QA_CHECKLIST_ITEMS.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      // Completion status filter
      const isCompleted = !!itemsState[item.id]?.completed;
      if (statusFilter === 'completed' && !isCompleted) {
        return false;
      }
      if (statusFilter === 'incomplete' && isCompleted) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesGuide = item.guide ? item.guide.toLowerCase().includes(query) : false;
        const note = itemsState[item.id]?.notes?.toLowerCase() || '';
        const matchesNote = note.includes(query);
        return matchesTitle || matchesDesc || matchesGuide || matchesNote;
      }

      return true;
    });
  }, [itemsState, selectedCategory, selectedPriority, statusFilter, searchQuery]);

  return {
    itemsState,
    filteredItems,
    metrics,
    categoryStats,
    categories: QA_CATEGORIES,
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
  };
}

// Pure helper function to compute readiness metrics
function computeMetrics(itemsState: Record<string, QAItemRuntimeState>): QAReadinessMetrics {
  const totalCount = QA_CHECKLIST_ITEMS.length;
  let completedCount = 0;

  let criticalTotal = 0;
  let criticalCompleted = 0;

  let importantTotal = 0;
  let importantCompleted = 0;

  let recommendedTotal = 0;
  let recommendedCompleted = 0;

  QA_CHECKLIST_ITEMS.forEach((item) => {
    const isDone = !!itemsState[item.id]?.completed;
    if (isDone) completedCount++;

    if (item.priority === 'critical') {
      criticalTotal++;
      if (isDone) criticalCompleted++;
    } else if (item.priority === 'important') {
      importantTotal++;
      if (isDone) importantCompleted++;
    } else if (item.priority === 'recommended') {
      recommendedTotal++;
      if (isDone) recommendedCompleted++;
    }
  });

  const remainingCount = totalCount - completedCount;
  const criticalRemaining = criticalTotal - criticalCompleted;
  const importantRemaining = importantTotal - importantCompleted;
  const recommendedRemaining = recommendedTotal - recommendedCompleted;
  const percentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Status Evaluation Rules strictly matching specifications:
  // - 🟢 READY: All Critical and Important checks are completed.
  // - 🟡 NEEDS ATTENTION: No critical security issues remain, but Important or Recommended checks are incomplete.
  // - 🔴 NOT READY: At least one Critical security or production requirement remains incomplete.
  let status: QAReadinessStatus = 'not-ready';
  if (criticalRemaining === 0 && importantRemaining === 0) {
    status = 'ready';
  } else if (criticalRemaining === 0 && (importantRemaining > 0 || recommendedRemaining > 0)) {
    status = 'needs-attention';
  } else {
    status = 'not-ready';
  }

  return {
    totalCount,
    completedCount,
    remainingCount,
    criticalTotal,
    criticalCompleted,
    criticalRemaining,
    importantTotal,
    importantCompleted,
    importantRemaining,
    recommendedTotal,
    recommendedCompleted,
    recommendedRemaining,
    percentage,
    status,
  };
}
