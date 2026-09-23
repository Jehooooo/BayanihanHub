import React, { useState } from 'react';
import type { QAChecklistItem as QAChecklistItemType, QAItemRuntimeState } from '../types';
import { Check, Edit3, MessageSquare, ChevronDown, ChevronUp, Clock, HelpCircle } from 'lucide-react';

interface QAChecklistItemProps {
  item: QAChecklistItemType;
  state?: QAItemRuntimeState;
  onToggle: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export default function QAChecklistItem({
  item,
  state,
  onToggle,
  onUpdateNotes,
}: QAChecklistItemProps) {
  const isCompleted = !!state?.completed;
  const notes = state?.notes || '';
  const [showNotes, setShowNotes] = useState(notes.length > 0);
  const [showGuide, setShowGuide] = useState(false);

  const getPriorityBadge = (priority: QAChecklistItemType['priority']) => {
    switch (priority) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            🔴 Critical
          </span>
        );
      case 'important':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
            🟡 Important
          </span>
        );
      case 'recommended':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            🟢 Recommended
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all duration-200 p-4 mb-3 ${
        isCompleted
          ? 'bg-slate-50/70 border-slate-200 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Custom Checkbox Button */}
        <button
          type="button"
          onClick={() => onToggle(item.id)}
          className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all border ${
            isCompleted
              ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
              : 'bg-white border-slate-300 hover:border-slate-400 text-transparent'
          }`}
          aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
        >
          <Check className="w-4 h-4 stroke-[3]" />
        </button>

        {/* Content Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {getPriorityBadge(item.priority)}
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
              {item.category}
            </span>

            {state?.lastVerifiedAt && isCompleted && (
              <span className="ml-auto text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Verified {new Date(state.lastVerifiedAt).toLocaleDateString()}
              </span>
            )}
          </div>

          <h4
            onClick={() => onToggle(item.id)}
            className={`text-sm font-bold cursor-pointer transition-colors ${
              isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 hover:text-emerald-700'
            }`}
          >
            {item.title}
          </h4>

          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>

          {/* Verification Guide Accordion */}
          {item.guide && (
            <div className="mt-2.5">
              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1 transition-colors"
              >
                <HelpCircle className="w-3 h-3 text-slate-400" />
                <span>{showGuide ? 'Hide Testing Guide' : 'How to verify this check'}</span>
                {showGuide ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {showGuide && (
                <div className="mt-1.5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 text-[11px] text-blue-900 leading-normal">
                  <span className="font-bold">Test Guide: </span>
                  {item.guide}
                </div>
              )}
            </div>
          )}

          {/* Notes Toggle & Editor */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowNotes(!showNotes)}
                className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>
                  {notes.trim().length > 0
                    ? `Note (${notes.trim().length} chars)`
                    : 'Add QA verification note'}
                </span>
                {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              <button
                type="button"
                onClick={() => onToggle(item.id)}
                className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors ${
                  isCompleted
                    ? 'text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200'
                    : 'text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                {isCompleted ? 'Mark Incomplete' : 'Mark as Complete'}
              </button>
            </div>

            {showNotes && (
              <textarea
                value={notes}
                onChange={(e) => onUpdateNotes(item.id, e.target.value)}
                placeholder="Document your test outcome, browser tested, test accounts used, or evidence..."
                rows={2}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-white placeholder-slate-400 text-slate-800 transition-all resize-y"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
