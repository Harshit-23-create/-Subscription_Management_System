import React from 'react';
import { SubscriptionTimelineEvent, SubscriptionStatus } from '@/types';
import { formatDateTime } from '@/utils/formatters';
import { CheckCircle2, Clock, PauseCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SubscriptionTimelineProps {
  status: SubscriptionStatus;
  timeline: SubscriptionTimelineEvent[];
}

const WORKFLOW_STAGES: SubscriptionStatus[] = ['Draft', 'Quotation', 'Confirmed', 'Active', 'Closed'];

export const SubscriptionTimeline: React.FC<SubscriptionTimelineProps> = ({ status, timeline }) => {
  const currentIndex = WORKFLOW_STAGES.indexOf(status === 'Paused' ? 'Active' : status);

  return (
    <div className="space-y-6">
      {/* Visual Workflow Steps Bar */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
          Lifecycle Progression Workflow
        </h4>
        <div className="flex items-center justify-between relative">
          {WORKFLOW_STAGES.map((stage, idx) => {
            const isCompleted = currentIndex > idx;
            const isCurrent = currentIndex === idx;
            const isPaused = status === 'Paused' && stage === 'Active';

            return (
              <React.Fragment key={stage}>
                <div className="flex flex-col items-center z-10">
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs',
                      isCompleted && 'bg-emerald-600 text-white',
                      isCurrent && !isPaused && 'bg-blue-600 text-white ring-4 ring-blue-100',
                      isPaused && 'bg-amber-500 text-white ring-4 ring-amber-100',
                      !isCompleted && !isCurrent && 'bg-slate-200 text-slate-500'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : isPaused ? (
                      <PauseCircle className="w-4 h-4" />
                    ) : (
                      idx + 1
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[11px] font-semibold mt-1.5',
                      isCurrent ? 'text-blue-700' : isCompleted ? 'text-emerald-700' : 'text-slate-500'
                    )}
                  >
                    {stage} {isPaused ? '(Paused)' : ''}
                  </span>
                </div>

                {idx < WORKFLOW_STAGES.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-0.5 mx-2 -mt-4 transition-all',
                      currentIndex > idx ? 'bg-emerald-500' : 'bg-slate-200'
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Audit Log Events List */}
      <div>
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
          Subscription Event Audit Log
        </h4>
        <div className="space-y-3 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((event) => (
            <div key={event.id} className="relative flex items-start gap-3 text-xs">
              <span className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white" />
              <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200/80 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">{event.action}</span>
                  <span className="text-[10px] text-slate-400">{formatDateTime(event.date)}</span>
                </div>
                <p className="text-slate-500 text-[11px] mt-0.5">By: {event.performedBy}</p>
                {event.notes && <p className="text-slate-600 text-xs mt-1 bg-slate-50 p-1.5 rounded">{event.notes}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

