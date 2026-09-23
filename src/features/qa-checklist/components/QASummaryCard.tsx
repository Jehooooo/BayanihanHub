import React from 'react';
import type { QAReadinessMetrics } from '../types';
import { ShieldCheck, AlertTriangle, XCircle, CheckCircle2, Award, Zap } from 'lucide-react';

interface QASummaryCardProps {
  metrics: QAReadinessMetrics;
}

export default function QASummaryCard({ metrics }: QASummaryCardProps) {
  const {
    percentage,
    completedCount,
    totalCount,
    criticalRemaining,
    criticalTotal,
    criticalCompleted,
    importantRemaining,
    importantTotal,
    importantCompleted,
    recommendedRemaining,
    recommendedTotal,
    recommendedCompleted,
    status,
  } = metrics;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-6">
      {/* Top Banner: Status Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold tracking-wider uppercase text-slate-500">
              Deployment Readiness Status
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
              v1.0.0 Pre-Flight
            </span>
          </div>

          <div className="flex items-center gap-3">
            {status === 'ready' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-lg">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <span>🟢 READY FOR DEPLOYMENT</span>
              </div>
            )}

            {status === 'needs-attention' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-bold text-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
                <span>🟡 NEEDS ATTENTION</span>
              </div>
            )}

            {status === 'not-ready' && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-bold text-lg">
                <XCircle className="w-6 h-6 text-rose-600" />
                <span>🔴 NOT READY FOR PRODUCTION</span>
              </div>
            )}
          </div>

          <p className="text-sm text-slate-600 mt-2">
            {status === 'ready' &&
              'All Critical and Important verification checks have passed. Bayanihan Hub is secure and verified for live launch.'}
            {status === 'needs-attention' &&
              'Zero critical vulnerabilities remain. However, important functional or operational requirements are still pending review.'}
            {status === 'not-ready' &&
              `${criticalRemaining} critical security or functional check${criticalRemaining === 1 ? '' : 's'} remain open. Production deployment is blocked.`}
          </p>
        </div>

        {/* Overall Completion Percentage Gauge */}
        <div className="flex items-center gap-4 bg-slate-50 border border-slate-200/60 rounded-2xl p-4 min-w-[220px]">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-200"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={
                  status === 'ready'
                    ? 'text-emerald-500'
                    : status === 'needs-attention'
                    ? 'text-amber-500'
                    : 'text-rose-500'
                }
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute text-sm font-black text-slate-800">{percentage}%</span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Overall Progress</span>
            <span className="text-xl font-bold text-slate-900">
              {completedCount} <span className="text-xs text-slate-400 font-normal">/ {totalCount}</span>
            </span>
            <span className="text-[11px] text-slate-500">
              {totalCount - completedCount} checks remaining
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
          <span>Verification Completion</span>
          <span>{percentage}% Complete</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/50">
          <div
            className={`h-full rounded-full transition-all duration-500 ease-out ${
              status === 'ready'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                : status === 'needs-attention'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                : 'bg-gradient-to-r from-rose-500 to-red-400'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Priority Stat Breakdown Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-5">
        {/* Critical Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-rose-200/70 bg-rose-50/40">
          <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center shrink-0">
            <span className="text-base">🔴</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">Critical Priority</span>
              {criticalRemaining === 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  CLEARED
                </span>
              )}
            </div>
            <div className="text-lg font-black text-rose-950 mt-0.5">
              {criticalRemaining > 0 ? (
                <span>
                  {criticalRemaining}{' '}
                  <span className="text-xs font-medium text-rose-700">remaining ({criticalCompleted}/{criticalTotal})</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All {criticalTotal} Passed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Important Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-amber-200/70 bg-amber-50/40">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
            <span className="text-base">🟡</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Important Priority</span>
              {importantRemaining === 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  CLEARED
                </span>
              )}
            </div>
            <div className="text-lg font-black text-amber-950 mt-0.5">
              {importantRemaining > 0 ? (
                <span>
                  {importantRemaining}{' '}
                  <span className="text-xs font-medium text-amber-700">remaining ({importantCompleted}/{importantTotal})</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All {importantTotal} Passed
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recommended Card */}
        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-200/70 bg-emerald-50/40">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
            <span className="text-base">🟢</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Recommended</span>
              {recommendedRemaining === 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                  CLEARED
                </span>
              )}
            </div>
            <div className="text-lg font-black text-emerald-950 mt-0.5">
              {recommendedRemaining > 0 ? (
                <span>
                  {recommendedRemaining}{' '}
                  <span className="text-xs font-medium text-emerald-700">remaining ({recommendedCompleted}/{recommendedTotal})</span>
                </span>
              ) : (
                <span className="text-emerald-700 font-bold text-sm flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> All {recommendedTotal} Passed
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
