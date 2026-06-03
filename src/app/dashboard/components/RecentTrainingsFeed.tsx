import React from 'react';
import { BrainCircuit, Clock } from 'lucide-react';
import type { Training } from '@/lib/types';
import StatusBadge from '@/components/ui/StatusBadge';

interface RecentTrainingsFeedProps {
  trainings: Training[];
}

// Deterministic status assignment based on id hash
function getStatus(id: string): 'completed' | 'running' | 'failed' | 'queued' {
  const statuses: ('completed' | 'running' | 'failed' | 'queued')[] = ['completed', 'running', 'completed', 'failed', 'queued', 'completed'];
  const idx = id.charCodeAt(id.length - 1) % statuses.length;
  return statuses[idx];
}

export default function RecentTrainingsFeed({ trainings }: RecentTrainingsFeedProps) {
  if (!trainings.length) {
    return (
      <div className="flex flex-col items-center justify-center h-[180px] text-center gap-2">
        <BrainCircuit size={28} className="text-[hsl(var(--muted-foreground))]" />
        <p className="text-[13px] font-medium text-[hsl(var(--foreground))]">No training jobs yet</p>
        <p className="text-[12px] text-[hsl(var(--muted-foreground))]">Training activity will appear here once users submit jobs</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5 overflow-y-auto max-h-[220px] scrollbar-thin pr-1">
      {trainings.map((t) => {
        const status = getStatus(t.id);
        return (
          <li
            key={`feed-${t.id}`}
            className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-[hsl(240_4%_10%)] transition-colors duration-150"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-[hsl(263_70%_74%/0.1)] flex items-center justify-center mt-0.5">
              <BrainCircuit size={14} className="text-[hsl(var(--accent))]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12.5px] font-medium text-[hsl(var(--foreground))] truncate">
                {t.dataset_name}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <Clock size={10} className="text-[hsl(var(--muted-foreground))]" />
                <span className="text-[10.5px] text-[hsl(var(--muted-foreground))] font-mono">
                  {new Date(t.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <StatusBadge variant={status} />
          </li>
        );
      })}
    </ul>
  );
}