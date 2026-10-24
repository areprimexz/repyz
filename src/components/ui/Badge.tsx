import type { ReactNode } from 'react';
import { CheckCircle2, Circle, Clock3, Lock } from 'lucide-react';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'navy';

export function Badge({ tone = 'neutral', children, icon }: { tone?: BadgeTone; children: ReactNode; icon?: ReactNode }) {
  return (
    <span className={`badge badge--${tone}`}>
      {icon}
      {children}
    </span>
  );
}

export type ProgressState = 'complete' | 'in-progress' | 'not-started' | 'locked';

const STATE_INFO: Record<ProgressState, { label: string; tone: BadgeTone; icon: ReactNode }> = {
  complete: { label: 'Selesai', tone: 'success', icon: <CheckCircle2 size={14} aria-hidden /> },
  'in-progress': { label: 'Sedang berjalan', tone: 'primary', icon: <Clock3 size={14} aria-hidden /> },
  'not-started': { label: 'Belum bermula', tone: 'neutral', icon: <Circle size={14} aria-hidden /> },
  locked: { label: 'Terkunci', tone: 'neutral', icon: <Lock size={14} aria-hidden /> },
};

export function StatusBadge({ state }: { state: ProgressState }) {
  const info = STATE_INFO[state];
  return (
    <Badge tone={info.tone} icon={info.icon}>
      {info.label}
    </Badge>
  );
}
