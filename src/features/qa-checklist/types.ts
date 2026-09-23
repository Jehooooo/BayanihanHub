export type QAPriority = 'critical' | 'important' | 'recommended';

export type QACategoryId =
  | 'security'
  | 'func-auth'
  | 'func-admin'
  | 'func-posts'
  | 'func-requests'
  | 'func-messaging'
  | 'func-notifications'
  | 'func-reports'
  | 'database'
  | 'admin-security'
  | 'ui-ux'
  | 'states'
  | 'production'
  | 'performance'
  | 'seo'
  | 'final-check';

export interface QAChecklistItem {
  id: string;
  category: QACategoryId;
  priority: QAPriority;
  title: string;
  description: string;
  guide?: string;
}

export interface QAItemRuntimeState {
  completed: boolean;
  notes: string;
  lastVerifiedAt?: string;
}

export interface QACategory {
  id: QACategoryId;
  name: string;
  shortName: string;
  iconName: string;
  description: string;
}

export type QAReadinessStatus = 'ready' | 'needs-attention' | 'not-ready';

export interface QAReadinessMetrics {
  totalCount: number;
  completedCount: number;
  remainingCount: number;
  criticalTotal: number;
  criticalCompleted: number;
  criticalRemaining: number;
  importantTotal: number;
  importantCompleted: number;
  importantRemaining: number;
  recommendedTotal: number;
  recommendedCompleted: number;
  recommendedRemaining: number;
  percentage: number;
  status: QAReadinessStatus;
}

export interface QAAuditExport {
  version: string;
  platform: string;
  exportedAt: string;
  metrics: QAReadinessMetrics;
  itemsState: Record<string, QAItemRuntimeState>;
}
