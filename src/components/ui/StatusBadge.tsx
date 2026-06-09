import React from 'react';

type BadgeVariant = 'premium' | 'free' | 'active' | 'banned' | 'running' | 'completed' | 'failed' | 'queued';

const variantStyles: Record<BadgeVariant, string> = {
  premium: 'bg-[hsl(263_70%_74%/0.15)] text-[hsl(263_70%_80%)] border-[hsl(263_70%_74%/0.3)]',
  free: 'bg-[hsl(240_4%_16%)] text-[hsl(var(--muted-foreground))] border-[hsl(var(--border))]',
  active: 'bg-[hsl(142_71%_45%/0.12)] text-[hsl(142_71%_55%)] border-[hsl(142_71%_45%/0.3)]',
  banned: 'bg-[hsl(0_72%_51%/0.12)] text-[hsl(0_72%_65%)] border-[hsl(0_72%_51%/0.3)]',
  running: 'bg-[hsl(190_95%_70%/0.12)] text-[hsl(var(--primary))] border-[hsl(190_95%_70%/0.3)]',
  completed: 'bg-[hsl(142_71%_45%/0.12)] text-[hsl(142_71%_55%)] border-[hsl(142_71%_45%/0.3)]',
  failed: 'bg-[hsl(0_72%_51%/0.12)] text-[hsl(0_72%_65%)] border-[hsl(0_72%_51%/0.3)]',
  queued: 'bg-[hsl(38_92%_50%/0.12)] text-[hsl(38_92%_65%)] border-[hsl(38_92%_50%/0.3)]',
};

const labels: Record<BadgeVariant, string> = {
  premium: 'Pro+',
  free: 'Free',
  active: 'Active',
  banned: 'Banned',
  running: 'Running',
  completed: 'Completed',
  failed: 'Failed',
  queued: 'Queued',
};

interface StatusBadgeProps {
  variant: BadgeVariant;
  className?: string;
}

export default function StatusBadge({ variant, className = '' }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {labels[variant]}
    </span>
  );
}
