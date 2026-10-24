import type { ReactNode } from 'react';
import { AlertTriangle, Info, Lightbulb, CheckCircle2 } from 'lucide-react';

const ICONS = {
  tip: Lightbulb,
  warning: AlertTriangle,
  info: Info,
  success: CheckCircle2,
};

export function Callout({
  tone,
  title,
  children,
  role,
}: {
  tone: 'tip' | 'warning' | 'info' | 'success';
  title?: string;
  children: ReactNode;
  role?: 'status' | 'alert' | 'note';
}) {
  const Icon = ICONS[tone];
  return (
    <div className={`callout callout--${tone}`} role={role}>
      <Icon className="callout__icon" size={20} aria-hidden />
      <div className="callout__body">
        {title && <p className="callout__title">{title}</p>}
        <div className="callout__text">{children}</div>
      </div>
    </div>
  );
}
